import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, ArrowLeft, Palette, Sun, Moon, Monitor, Heart, Sparkles, Check, Lock, Loader2, Image as ImageIcon, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import FloatingHearts from "@/components/FloatingHearts";
import { useSpace } from "@/contexts/SpaceContext";
import { useTheme, ColorTheme, AppearanceMode } from "@/contexts/ThemeContext";
import { changePassword } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const colorOptions: { value: ColorTheme; label: string; color: string }[] = [
  { value: 'pink', label: 'Pink Romance', color: '#ec4899' },
  { value: 'purple', label: 'Purple Dream', color: '#8b5cf6' },
  { value: 'blue', label: 'Blue Ocean', color: '#3b82f6' },
  { value: 'green', label: 'Green Nature', color: '#22c55e' },
  { value: 'orange', label: 'Orange Sunset', color: '#f97316' },
  { value: 'red', label: 'Red Passion', color: '#ef4444' },
];

const appearanceOptions: { value: AppearanceMode; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentSpace, displayName, partnerName, user } = useSpace();
  const { 
    colorTheme, 
    setColorTheme, 
    appearanceMode, 
    setAppearanceMode, 
    chatBackground,
    dashboardBackgroundCookie,
    dashboardBackgroundSenorita,
    setChatBackground,
    setDashboardBackground 
  } = useTheme();
  
  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Background image state
  const [isUploadingChatBg, setIsUploadingChatBg] = useState(false);
  const [isUploadingDashboardBg, setIsUploadingDashboardBg] = useState(false);
  const chatBgFileInputRef = useRef<HTMLInputElement>(null);
  const dashboardBgFileInputRef = useRef<HTMLInputElement>(null);

  // Get current dashboard background based on user
  const currentDashboardBg = currentSpace === 'cookie' ? dashboardBackgroundCookie : dashboardBackgroundSenorita;

  const goBack = () => {
    navigate(currentSpace === 'cookie' ? '/cookie' : '/senorita');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !oldPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 3) {
      toast({
        title: "Error",
        description: "Password must be at least 3 characters",
        variant: "destructive",
      });
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await changePassword(user?.username || '', oldPassword, newPassword);
      toast({
        title: "Success! 🎉",
        description: "Your password has been changed successfully",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChatBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingChatBg(true);
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `chat-bg-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('chat-media').getPublicUrl(fileName);

      // Update chat background (synced)
      await setChatBackground(publicUrl);

      toast({
        title: '🎨 Chat Background Updated!',
        description: 'I synced our new chat background for us!',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingChatBg(false);
    }
  };

  const handleDashboardBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingDashboardBg(true);
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `dashboard-${currentSpace}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('chat-media').getPublicUrl(fileName);

      // Update dashboard background (personal)
      await setDashboardBackground(publicUrl, currentSpace as 'cookie' | 'senorita');

      toast({
        title: '🎨 Dashboard Background Updated!',
        description: 'Your personal dashboard background has been set',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingDashboardBg(false);
    }
  };

  const removeChatBackground = async () => {
    try {
      await setChatBackground('');
      toast({
        title: 'Chat Background Removed',
        description: 'Chat background has been reset to default',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const removeDashboardBackground = async () => {
    try {
      await setDashboardBackground('', currentSpace as 'cookie' | 'senorita');
      toast({
        title: 'Dashboard Background Removed',
        description: 'Dashboard background has been reset to default',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden p-4 md:p-8">
      <FloatingHearts />
      <div className="max-w-3xl mx-auto relative z-10">
        <Button 
          onClick={goBack}
          variant="ghost" 
          className="mb-6 gap-2 text-muted-foreground hover:text-primary" 
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <SettingsIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Settings</CardTitle>
                  <CardDescription>Customize your Love OS experience</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Chat Background Settings */}
          <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ImageIcon className="w-5 h-5 text-primary" />
                Chat Background (Synced)
              </CardTitle>
              <CardDescription>Upload a custom background for our chat page (syncs between us)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current background preview */}
              {chatBackground && (
                <div className="relative rounded-lg overflow-hidden border-2 border-primary/20 h-40">
                  <img 
                    src={chatBackground} 
                    alt="Current chat background" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <p className="text-white text-sm font-medium">Current Chat Background</p>
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={chatBgFileInputRef}
                type="file"
                onChange={handleChatBackgroundUpload}
                className="hidden"
                accept="image/*"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => chatBgFileInputRef.current?.click()}
                  disabled={isUploadingChatBg}
                  className="flex-1"
                  data-testid="upload-chat-background-button"
                >
                  {isUploadingChatBg ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Chat Background
                    </>
                  )}
                </Button>

                {chatBackground && (
                  <Button
                    onClick={removeChatBackground}
                    variant="outline"
                    data-testid="remove-chat-background-button"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                💕 This background syncs instantly between you and I
              </p>
            </CardContent>
          </Card>

          {/* Dashboard Background Settings */}
          <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ImageIcon className="w-5 h-5 text-primary" />
                Dashboard Background (Personal)
              </CardTitle>
              <CardDescription>Upload a custom background for your personal dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current background preview */}
              {currentDashboardBg && (
                <div className="relative rounded-lg overflow-hidden border-2 border-primary/20 h-40">
                  <img 
                    src={currentDashboardBg} 
                    alt="Current dashboard background" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <p className="text-white text-sm font-medium">Current Dashboard Background</p>
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={dashboardBgFileInputRef}
                type="file"
                onChange={handleDashboardBackgroundUpload}
                className="hidden"
                accept="image/*"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => dashboardBgFileInputRef.current?.click()}
                  disabled={isUploadingDashboardBg}
                  className="flex-1"
                  data-testid="upload-dashboard-background-button"
                >
                  {isUploadingDashboardBg ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Dashboard Background
                    </>
                  )}
                </Button>

                {currentDashboardBg && (
                  <Button
                    onClick={removeDashboardBackground}
                    variant="outline"
                    data-testid="remove-dashboard-background-button"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                ⭐ Recommended: Images with 1920x1080 resolution or higher. Max size: 5MB
              </p>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Palette className="w-5 h-5 text-primary" />
                Color Theme
              </CardTitle>
              <CardDescription>Choose a color palette for your app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {colorOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setColorTheme(option.value)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      colorTheme === option.value
                        ? 'border-primary shadow-lg'
                        : 'border-border hover:border-primary/50'
                    }`}
                    data-testid={`color-theme-${option.value}`}
                  >
                    <div
                      className="w-10 h-10 rounded-full shadow-inner"
                      style={{ backgroundColor: option.color }}
                    />
                    <span className="text-xs font-medium text-center">{option.label}</span>
                    {colorTheme === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full"
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appearance Mode */}
          <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sun className="w-5 h-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Switch between light and dark mode</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {appearanceOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAppearanceMode(option.value)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      appearanceMode === option.value
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-border hover:border-primary/50'
                    }`}
                    data-testid={`appearance-mode-${option.value}`}
                  >
                    <option.icon className={`w-8 h-8 ${appearanceMode === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium">{option.label}</span>
                    {appearanceMode === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full"
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Space Info */}
          <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Heart className="w-5 h-5 text-primary fill-current" />
                Your Space
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <span className="text-muted-foreground">Current Space</span>
                <span className="font-semibold text-lg flex items-center gap-2">
                  {currentSpace === 'cookie' ? '🍪 Cookie\'s Command Center' : '💃 Senorita\'s Sanctuary'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <span className="text-muted-foreground">Your Name</span>
                <span className="font-medium text-primary">{displayName}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground">Partner</span>
                <span className="font-medium text-primary flex items-center gap-2">
                  {partnerName} <Heart className="w-4 h-4 fill-current animate-pulse" />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Love Message */}
          <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Made With Love</h3>
              <p className="text-muted-foreground text-lg">
                This space is dedicated to Cookie 🍪 and Senorita 💃
              </p>
              <p className="text-muted-foreground mt-2">
                Forever & Always 💕
              </p>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="bg-card/90 backdrop-blur-md border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lock className="w-5 h-5 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your space secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old-password">Current Password</Label>
                  <Input
                    id="old-password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isChangingPassword}
                    data-testid="old-password-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={isChangingPassword}
                    data-testid="new-password-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isChangingPassword}
                    data-testid="confirm-password-input"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isChangingPassword}
                  data-testid="change-password-button"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;