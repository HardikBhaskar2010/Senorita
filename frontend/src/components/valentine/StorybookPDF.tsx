import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const StorybookPDF = () => {
  const [progress, setProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('valentines_progress')
      .select('*')
      .eq('user_name', 'Senorita')
      .order('day_number', { ascending: true });

    if (data) {
      setProgress(data);
    }
    setIsLoading(false);
  };

  const generatePDF = async () => {
    toast({
      title: '📖 Creating Storybook...',
      description: 'This may take a moment...',
      variant: 'default'
    });

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    // Title Page
    pdf.setFillColor(255, 192, 203);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.setFontSize(32);
    pdf.setTextColor(139, 0, 0);
    pdf.text('Our Valentine\'s Week', pageWidth / 2, 80, { align: 'center' });
    pdf.setFontSize(18);
    pdf.text('February 2025', pageWidth / 2, 100, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('A Love Story', pageWidth / 2, 140, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text('Cookie \u2764\ufe0f Senorita', pageWidth / 2, 260, { align: 'center' });

    const dayNames = [
      'Rose Day', 'Propose Day', 'Chocolate Day', 'Teddy Day',
      'Promise Day', 'Hug Day', 'Kiss Day', "Valentine's Day"
    ];

    const dayEmojis = ['\ud83c\udf39', '\ud83d\udc8d', '\ud83c\udf6b', '\ud83e\uddf8', '\ud83e\udd1d', '\ud83e\udd17', '\ud83d\udc8b', '\u2764\ufe0f'];

    // Add pages for each unlocked day
    progress.forEach((day, index) => {
      pdf.addPage();
      
      // Day header
      pdf.setFillColor(255, 240, 245);
      pdf.rect(0, 0, pageWidth, 50, 'F');
      pdf.setFontSize(24);
      pdf.setTextColor(220, 20, 60);
      pdf.text(`${dayEmojis[day.day_number - 1]} ${dayNames[day.day_number - 1]}`, pageWidth / 2, 30, { align: 'center' });

      // Content
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      let yPos = 70;

      // Answer
      if (day.answer) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Your Answer:', margin, yPos);
        yPos += 10;
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(11);
        const answerLines = pdf.splitTextToSize(`"${day.answer}"`, maxWidth);
        pdf.text(answerLines, margin, yPos);
        yPos += (answerLines.length * 6) + 10;
      }

      // Custom Message
      if (day.custom_message) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Message from Cookie:', margin, yPos);
        yPos += 10;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        const messageLines = pdf.splitTextToSize(`"${day.custom_message}"`, maxWidth);
        pdf.text(messageLines, margin, yPos);
        yPos += (messageLines.length * 6) + 10;
      }

      // Chocolate Design
      if (day.chocolate_design && Object.keys(day.chocolate_design).length > 0) {
        const design = day.chocolate_design as any;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Your Chocolate Design:', margin, yPos);
        yPos += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Filling: ${design.filling} | Drizzle: ${design.drizzle} | Topping: ${design.topping}`, margin, yPos);
        yPos += 10;
      }

      // Sealed Promise
      if (day.sealed_promise) {
        try {
          const decodedPromise = atob(day.sealed_promise);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Your Sealed Promise:', margin, yPos);
          yPos += 10;
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(11);
          const promiseLines = pdf.splitTextToSize(`"${decodedPromise}"`, maxWidth);
          pdf.text(promiseLines, margin, yPos);
          yPos += (promiseLines.length * 6) + 10;
        } catch (e) {
          console.error('Failed to decode promise');
        }
      }

      // Collected Kisses Count
      if (day.collected_kisses && Array.isArray(day.collected_kisses)) {
        pdf.setFontSize(12);
        pdf.text(`Kisses Collected: ${day.collected_kisses.length} \ud83d\udc8b`, margin, yPos);
        yPos += 8;
      }

      // Date unlocked
      if (day.unlocked_at) {
        pdf.setFontSize(9);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Unlocked on: ${new Date(day.unlocked_at).toLocaleDateString()}`, margin, pageHeight - 20);
      }
    });

    // Final Page
    pdf.addPage();
    pdf.setFillColor(255, 192, 203);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.setFontSize(24);
    pdf.setTextColor(139, 0, 0);
    pdf.text('Forever & Always', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text('\u2764\ufe0f Our Love Story \u2764\ufe0f', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

    // Save PDF
    const fileName = `Valentines-Week-2025-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    toast({
      title: '✨ Storybook Created!',
      description: 'Your Valentine\'s Week memories are saved!',
      variant: 'default'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading your memories...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-8xl"
      >
        📖
      </motion.div>

      <h3 className="text-3xl font-bold text-center">Your Valentine's Storybook</h3>
      <p className="text-center opacity-80 max-w-md">
        Compile all your beautiful memories from this special week into a keepsake PDF
      </p>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold">{progress.length}</div>
          <div className="text-sm opacity-70">Days Unlocked</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-2xl font-bold">{progress.filter(d => d.answer).length}</div>
          <div className="text-sm opacity-70">Answers</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
          <div className="text-3xl mb-2">💋</div>
          <div className="text-2xl font-bold">
            {progress.reduce((sum, d) => sum + (d.collected_kisses?.length || 0), 0)}
          </div>
          <div className="text-sm opacity-70">Kisses</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
          <div className="text-3xl mb-2">💖</div>
          <div className="text-2xl font-bold">{progress.filter(d => d.sealed_promise).length}</div>
          <div className="text-sm opacity-70">Promises</div>
        </div>
      </div>

      {/* Download Button */}
      <Button
        onClick={generatePDF}
        disabled={progress.length === 0}
        className="w-full py-6 text-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0"
      >
        <Download className="w-5 h-5 mr-2" />
        Download Your Storybook PDF
      </Button>

      <p className="text-sm opacity-70 text-center">
        💾 Your storybook includes all unlocked days, answers, promises, and memories
      </p>
    </div>
  );
};

export default StorybookPDF;