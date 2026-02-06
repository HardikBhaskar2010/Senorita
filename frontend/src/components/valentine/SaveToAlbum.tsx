import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Image as ImageIcon, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface SaveToAlbumProps {
  dayNumber: number;
  dayName: string;
  contentRef?: React.RefObject<HTMLDivElement>;
}

const SaveToAlbum = ({ dayNumber, dayName, contentRef }: SaveToAlbumProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedToAlbum, setSavedToAlbum] = useState(false);

  const saveToAlbum = async () => {
    if (!contentRef?.current) {
      toast({
        title: 'Error',
        description: 'Cannot capture content at this moment',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      // Capture the content as image
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: 'transparent',
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      // Create filename
      const fileName = `valentine-day${dayNumber}-${dayName.toLowerCase().replace(' ', '-')}-${Date.now()}.png`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('chat-media')
        .upload(`valentine-memories/${fileName}`, blob, {
          contentType: 'image/png',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-media')
        .getPublicUrl(`valentine-memories/${fileName}`);

      // Save to photos table
      await supabase.from('photos').insert({
        image_url: urlData.publicUrl,
        caption: `${dayName} Memory - Valentine's Week 2025 💕`,
        uploaded_by: 'Senorita'
      });

      setSavedToAlbum(true);
      toast({
        title: '💖 Saved to Album!',
        description: `Your ${dayName} memory has been saved to the gallery`,
        variant: 'default'
      });

      // Reset after 3 seconds
      setTimeout(() => setSavedToAlbum(false), 3000);
    } catch (error) {
      console.error('Error saving to album:', error);
      toast({
        title: 'Error',
        description: 'Failed to save to album. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const downloadImage = async () => {
    if (!contentRef?.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: 'transparent',
        scale: 2,
        logging: false,
        useCORS: true
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `valentine-${dayName.toLowerCase().replace(' ', '-')}-${Date.now()}.png`;
      link.click();

      toast({
        title: '📥 Downloaded!',
        description: 'Image saved to your device',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error downloading:', error);
      toast({
        title: 'Error',
        description: 'Failed to download image',
        variant: 'destructive'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-3 justify-center mt-6"
    >
      <Button
        onClick={saveToAlbum}
        disabled={isSaving || savedToAlbum}
        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0"
      >
        {savedToAlbum ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Saved to Album
          </>
        ) : (
          <>
            <ImageIcon className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save to Album'}
          </>
        )}
      </Button>

      <Button
        onClick={downloadImage}
        variant="outline"
        className="bg-white/10 hover:bg-white/20 text-white border-white/30"
      >
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
    </motion.div>
  );
};

export default SaveToAlbum;
