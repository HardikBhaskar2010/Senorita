import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ArrowLeft,
  Plus,
  X,
  Edit,
  Trash2,
  Upload,
  Loader2,
  Calendar,
  Filter,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import FloatingHearts from '@/components/FloatingHearts';
import { useSpace } from '@/contexts/SpaceContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  milestone_date: string;
  category: string;
  icon: string;
  image_url: string | null;
}

const categoryOptions = [
  { value: 'first', label: 'First Times', emoji: '🌟' },
  { value: 'memory', label: 'Memories', emoji: '💭' },
  { value: 'achievement', label: 'Achievements', emoji: '🏆' },
  { value: 'trip', label: 'Trips', emoji: '✈️' },
  { value: 'special', label: 'Special Moments', emoji: '💖' },
];

// Helper function to normalize old category values to new schema
const normalizeCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'first_time': 'first',
    'first': 'first',
    'memory': 'memory',
    'achievement': 'achievement',
    'trip': 'trip',
    'special': 'special',
  };
  return categoryMap[category] || 'memory'; // Default to 'memory' if unknown
};

const Milestones = () => {
  const navigate = useNavigate();
  const { currentSpace, displayName } = useSpace();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [filteredMilestones, setFilteredMilestones] = useState<MilestoneItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    milestone_date: '',
    category: 'memory',
    icon: '💖',
    image_url: null as string | null,
    imageFile: null as File | null,
  });

  useEffect(() => {
    if (!currentSpace) {
      navigate('/');
      return;
    }
    fetchMilestones();
    subscribeToMilestones();
  }, [currentSpace]);

  useEffect(() => {
    filterMilestones();
  }, [milestones, searchQuery, filterCategory]);

  const fetchMilestones = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('milestone_date', { ascending: false });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast({
        title: 'Error loading milestones',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMilestones = () => {
    const channel = supabase
      .channel('milestones-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones',
        },
        () => {
          fetchMilestones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filterMilestones = () => {
    let filtered = milestones;

    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((m) => m.category === filterCategory);
    }

    setFilteredMilestones(filtered);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `milestone-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('mood-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('mood-photos').getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.milestone_date) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      if (formData.imageFile) {
        imageUrl = await uploadImage(formData.imageFile);
      }

      const milestoneData = {
        title: formData.title,
        description: formData.description,
        milestone_date: formData.milestone_date,
        category: normalizeCategory(formData.category),
        icon:
          categoryOptions.find((c) => c.value === normalizeCategory(formData.category))?.emoji ||
          '💖',
        image_url: imageUrl,
        created_by: displayName,
      };

      if (editingId) {
        const { error } = await supabase
          .from('milestones')
          .update(milestoneData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: 'Milestone updated! ✨',
          description: 'Your memory has been updated',
        });
      } else {
        const { error } = await supabase.from('milestones').insert(milestoneData);

        if (error) throw error;

        toast({
          title: 'Milestone added! 🎉',
          description: 'A new memory has been created',
        });
      }

      resetForm();
      fetchMilestones();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (milestone: MilestoneItem) => {
    setFormData({
      title: milestone.title,
      description: milestone.description,
      milestone_date: milestone.milestone_date,
      category: normalizeCategory(milestone.category),
      icon: milestone.icon,
      image_url: milestone.image_url,
      imageFile: null,
    });
    setEditingId(milestone.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Milestone deleted',
        description: 'Memory has been removed',
      });

      fetchMilestones();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      milestone_date: '',
      category: 'memory',
      icon: '💖',
      image_url: null,
      imageFile: null,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const goBack = () => {
    navigate(currentSpace === 'cookie' ? '/cookie' : '/senorita');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden p-4 md:p-8">
      <FloatingHearts />
      <div className="max-w-6xl mx-auto relative z-10">
        <Button
          onClick={goBack}
          variant="ghost"
          className="mb-6 gap-2 text-muted-foreground hover:text-primary"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Star className="w-6 h-6 text-primary fill-current" />
                  </div>
                  <div>
                    <span>Our Milestones</span>
                    <p className="text-sm font-normal text-muted-foreground mt-1">
                      {filteredMilestones.length} cherished memories
                    </p>
                  </div>
                </CardTitle>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="gap-2 shadow-lg"
                  data-testid="add-milestone-button"
                >
                  {showForm ? (
                    <>
                      <X className="w-4 h-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Milestone
                    </>
                  )}
                </Button>
              </div>

              {/* Search and Filter */}
              {!showForm && (
                <div className="flex flex-col md:flex-row gap-3 mt-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search milestones..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.emoji} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {showForm ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-6 max-w-2xl mx-auto"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="First date, Anniversary trip..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Tell the story of this special moment..."
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.milestone_date}
                          onChange={(e) =>
                            setFormData({ ...formData, milestone_date: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.emoji} {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Image (optional)</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : editingId ? (
                          'Update Milestone'
                        ) : (
                          'Create Milestone'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                ) : isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredMilestones.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No milestones yet</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery || filterCategory !== 'all'
                        ? 'No results found. Try different filters.'
                        : 'Start documenting your beautiful journey together'}
                    </p>
                    {!searchQuery && filterCategory === 'all' && (
                      <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Milestone
                      </Button>
                    )}
                  </div>
                ) : (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    {/* Timeline */}
                    <div className="relative">
                      {/* Connecting line */}
                      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

                      {filteredMilestones.map((milestone, index) => (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative pl-20 pb-12 group"
                        >
                          {/* Timeline dot */}
                          <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg group-hover:scale-125 transition-transform" />

                          {/* Content card */}
                          <Card className="bg-card/50 border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="text-3xl">{milestone.icon}</span>
                                    <div>
                                      <h3 className="text-xl font-bold">
                                        {milestone.title}
                                      </h3>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(
                                          new Date(milestone.milestone_date),
                                          'MMMM d, yyyy'
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-muted-foreground leading-relaxed mb-4">
                                    {milestone.description}
                                  </p>
                                  {milestone.image_url && (
                                    <img
                                      src={milestone.image_url}
                                      alt={milestone.title}
                                      className="w-full h-48 object-cover rounded-lg shadow-md"
                                    />
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEdit(milestone)}
                                    data-testid="edit-milestone-button"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setDeleteId(milestone.id)}
                                    className="text-destructive hover:text-destructive"
                                    data-testid="delete-milestone-button"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This milestone will be permanently
              removed from your timeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Milestones;
