import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ArrowLeft,
  X,
  Trash2,
  Edit,
  Filter,
  Search,
  Clock,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useSpace } from '@/contexts/SpaceContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import FloatingHearts from '@/components/FloatingHearts';
import ThreeBackground from '@/components/three/ThreeBackground';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  category: string;
  color: string;
  is_all_day: boolean;
  created_by: string;
  created_at: string;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  category: string;
  isAllDay: boolean;
}

const CATEGORIES = [
  { value: 'date', label: '💕 Date', color: '#ec4899' },
  { value: 'reminder', label: '🔔 Reminder', color: '#3b82f6' },
  { value: 'call', label: '📞 Call', color: '#22c55e' },
  { value: 'study', label: '💻 Study', color: '#8b5cf6' },
  { value: 'appointment', label: '📅 Appointment', color: '#f97316' },
  { value: 'special', label: '✨ Special', color: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
];

const Calendar = () => {
  const navigate = useNavigate();
  const { currentUser, dashboardBackgroundCookie, dashboardBackgroundSenorita } = useTheme();
  const { currentSpace } = useSpace();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    endTime: '13:00',
    location: '',
    category: 'reminder',
    isAllDay: false,
  });

  const dashboardBackground = currentSpace === 'cookie' ? dashboardBackgroundCookie : dashboardBackgroundSenorita;

  // Fetch events
  useEffect(() => {
    fetchEvents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('calendar_events_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'calendar_events' },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.event_date);
      return isSameDay(eventDate, date);
    });
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.location?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [events, categoryFilter, searchQuery]);

  // Handle month navigation
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;
    
    setSelectedDate(date);
    setFormData({
      ...formData,
      date: format(date, 'yyyy-MM-dd'),
    });
    setIsAddDialogOpen(true);
    setIsEditMode(false);
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  // Handle add/update event
  const handleSaveEvent = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    try {
      let eventDateTime = new Date(formData.date);
      
      if (!formData.isAllDay && formData.time) {
        const [hours, minutes] = formData.time.split(':');
        eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        eventDateTime.setHours(0, 0, 0, 0);
      }

      let endDateTime = null;
      if (formData.endTime && !formData.isAllDay) {
        endDateTime = new Date(formData.date);
        const [hours, minutes] = formData.endTime.split(':');
        endDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      const categoryObj = CATEGORIES.find(c => c.value === formData.category);

      const eventData = {
        title: formData.title,
        description: formData.description || null,
        event_date: eventDateTime.toISOString(),
        end_date: endDateTime?.toISOString() || null,
        location: formData.location || null,
        category: formData.category,
        color: categoryObj?.color || '#3b82f6',
        is_all_day: formData.isAllDay,
        created_by: currentUser || 'Cookie',
      };

      if (isEditMode && selectedEvent) {
        // Update existing event
        const { error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', selectedEvent.id);

        if (error) throw error;
        toast.success('Event updated! 🎉');
      } else {
        // Create new event
        const { error } = await supabase
          .from('calendar_events')
          .insert([eventData]);

        if (error) throw error;
        toast.success('Event created! 🎉');
      }

      resetForm();
      setIsAddDialogOpen(false);
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', selectedEvent.id);

      if (error) throw error;

      toast.success('Event deleted');
      setIsViewDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  // Handle edit event
  const handleEditEvent = () => {
    if (!selectedEvent) return;

    const eventDate = parseISO(selectedEvent.event_date);
    const endDate = selectedEvent.end_date ? parseISO(selectedEvent.end_date) : null;

    setFormData({
      title: selectedEvent.title,
      description: selectedEvent.description || '',
      date: format(eventDate, 'yyyy-MM-dd'),
      time: selectedEvent.is_all_day ? '12:00' : format(eventDate, 'HH:mm'),
      endTime: endDate ? format(endDate, 'HH:mm') : '13:00',
      location: selectedEvent.location || '',
      category: selectedEvent.category,
      isAllDay: selectedEvent.is_all_day,
    });

    setIsEditMode(true);
    setIsViewDialogOpen(false);
    setIsAddDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '12:00',
      endTime: '13:00',
      location: '',
      category: 'reminder',
      isAllDay: false,
    });
    setIsEditMode(false);
    setSelectedEvent(null);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.color || '#3b82f6';
  };

  return (
    <div 
      className="min-h-screen bg-background relative overflow-x-hidden"
      style={{
        background: dashboardBackground 
          ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${dashboardBackground}) center/cover fixed`
          : undefined
      }}
    >
      {!dashboardBackground && <FloatingHearts />}
      <ThreeBackground variant="particles" customBackground={dashboardBackground} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-primary/10"
                data-testid="back-button"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-pink-500 to-primary bg-clip-text text-transparent flex items-center gap-3">
                  <CalendarIcon className="w-8 h-8 text-primary" />
                  Our Calendar
                </h1>
                <p className="text-muted-foreground mt-1">Plan beautiful moments together</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={goToToday}
                className="hover:bg-primary/10"
                data-testid="today-button"
              >
                Today
              </Button>
              <Button
                onClick={() => {
                  setSelectedDate(new Date());
                  setFormData({ ...formData, date: format(new Date(), 'yyyy-MM-dd') });
                  setIsAddDialogOpen(true);
                  setIsEditMode(false);
                }}
                className="gap-2"
                data-testid="add-event-button"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Main Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/80 backdrop-blur-xl rounded-3xl border border-primary/20 p-6 shadow-xl"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
                className="hover:bg-primary/10"
                data-testid="prev-month-button"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <motion.h2 
                className="text-2xl font-bold text-foreground"
                key={format(currentMonth, 'MMMM yyyy')}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {format(currentMonth, 'MMMM yyyy')}
              </motion.h2>

              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="hover:bg-primary/10"
                data-testid="next-month-button"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);

                return (
                  <motion.div
                    key={day.toString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => handleDateClick(day)}
                    className={`
                      min-h-[100px] p-2 rounded-xl border cursor-pointer transition-all
                      ${isCurrentMonth 
                        ? 'bg-card/60 hover:bg-card border-border/50 hover:border-primary/50 hover:shadow-lg' 
                        : 'bg-muted/20 border-transparent opacity-50'
                      }
                      ${isTodayDate ? 'ring-2 ring-primary bg-primary/5' : ''}
                    `}
                    data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                  >
                    <div className={`
                      text-sm font-semibold mb-1 
                      ${isTodayDate ? 'text-primary' : 'text-foreground'}
                    `}>
                      {format(day, 'd')}
                    </div>

                    {/* Event indicators */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={(e) => handleEventClick(event, e)}
                          className="text-xs p-1.5 rounded-lg truncate hover:shadow-md transition-shadow"
                          style={{ 
                            backgroundColor: event.color.includes('gradient') ? undefined : `${event.color}20`,
                            background: event.color.includes('gradient') ? event.color : undefined,
                            color: event.color.includes('gradient') ? 'white' : event.color,
                            borderLeft: `3px solid ${event.color.includes('gradient') ? '#ec4899' : event.color}`
                          }}
                          data-testid={`event-${event.id}`}
                        >
                          {event.title}
                        </motion.div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Search & Filter */}
            <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-primary/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Search & Filter
              </h3>

              <div className="space-y-4">
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background/50"
                  data-testid="search-input"
                />

                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Category
                  </Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-background/50" data-testid="category-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-primary/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Upcoming Events
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </div>
              ) : filteredEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No events found
                </p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredEvents
                    .filter(event => new Date(event.event_date) >= new Date())
                    .slice(0, 10)
                    .map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={(e) => handleEventClick(event, e as any)}
                        className="p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 cursor-pointer transition-all hover:shadow-md"
                        style={{ borderLeftWidth: '4px', borderLeftColor: event.color.includes('gradient') ? '#ec4899' : event.color }}
                      >
                        <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(event.event_date), 'MMM d, h:mm a')}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        )}
                      </motion.div>
                    ))}
                </div>
              )}
            </div>

            {/* Category Legend */}
            <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-primary/20 p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <div key={cat.value} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ 
                        backgroundColor: cat.color.includes('gradient') ? undefined : cat.color,
                        background: cat.color.includes('gradient') ? cat.color : undefined
                      }}
                    />
                    <span className="text-sm">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="event-form-dialog">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
                data-testid="event-title-input"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger data-testid="event-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  data-testid="event-date-input"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAllDay}
                    onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                    data-testid="all-day-checkbox"
                  />
                  <span className="text-sm">All day</span>
                </label>
              </div>
            </div>

            {!formData.isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time">Start Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    data-testid="event-time-input"
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    data-testid="event-end-time-input"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Add location"
                data-testid="event-location-input"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add description"
                rows={3}
                data-testid="event-description-input"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
              data-testid="cancel-event-button"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEvent} data-testid="save-event-button">
              {isEditMode ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="view-event-dialog">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedEvent.title}</span>
                  <Badge 
                    style={{ 
                      backgroundColor: selectedEvent.color.includes('gradient') ? undefined : `${selectedEvent.color}20`,
                      background: selectedEvent.color.includes('gradient') ? selectedEvent.color : undefined,
                      color: selectedEvent.color.includes('gradient') ? 'white' : selectedEvent.color,
                    }}
                  >
                    {CATEGORIES.find(c => c.value === selectedEvent.category)?.label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-semibold">
                      {format(parseISO(selectedEvent.event_date), 'EEEE, MMMM d, yyyy')}
                    </div>
                    {!selectedEvent.is_all_day && (
                      <div className="text-muted-foreground">
                        {format(parseISO(selectedEvent.event_date), 'h:mm a')}
                        {selectedEvent.end_date && ` - ${format(parseISO(selectedEvent.end_date), 'h:mm a')}`}
                      </div>
                    )}
                    {selectedEvent.is_all_day && (
                      <div className="text-muted-foreground">All day</div>
                    )}
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>{selectedEvent.location}</div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div className="pt-2 text-xs text-muted-foreground">
                  Created by {selectedEvent.created_by}
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteEvent}
                  className="gap-2"
                  data-testid="delete-event-button"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEditEvent}
                  className="gap-2"
                  data-testid="edit-event-button"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
