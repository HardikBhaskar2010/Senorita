import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Download, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface VoiceRecorderProps {
  dayNumber: number;
  onAudioReady?: (audioUrl: string) => void;
}

export default function VoiceRecorder({ dayNumber, onAudioReady }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [savedAudioURL, setSavedAudioURL] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch saved audio on mount
  useEffect(() => {
    fetchSavedAudio();
  }, []);

  const fetchSavedAudio = async () => {
    try {
      const { data, error } = await supabase
        .from('valentines_progress')
        .select('voice_message_url')
        .eq('user_name', 'Cookie')
        .eq('day_number', dayNumber)
        .single();

      if (data?.voice_message_url) {
        setSavedAudioURL(data.voice_message_url);
        setAudioURL(data.voice_message_url);
        if (onAudioReady) onAudioReady(data.voice_message_url);
      }
    } catch (err) {
      console.error('Error fetching audio:', err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio analyzer
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      visualizeAudio();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to record your message');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyserRef.current!.getByteFrequencyData(dataArray);
      
      // Calculate average level
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(average / 255);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#ec4899');
        gradient.addColorStop(1, '#ef4444');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    draw();
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioURL) return;

    try {
      const response = await fetch(audioURL);
      const blob = await response.blob();
      
      const fileName = `proposal-voice-${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('mood-photos')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('mood-photos')
        .getPublicUrl(fileName);

      // Save to database
      await supabase
        .from('valentines_progress')
        .update({ voice_message_url: publicUrl })
        .eq('user_name', 'Cookie')
        .eq('day_number', dayNumber);

      setSavedAudioURL(publicUrl);
      if (onAudioReady) onAudioReady(publicUrl);
      
      alert('Voice message saved! 💕');
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Error saving voice message');
    }
  };

  const deleteAudio = () => {
    setAudioURL(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setSavedAudioURL(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
    >
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Mic className="w-6 h-6" />
        Record Your Proposal Voice Message
      </h3>
      
      {/* Waveform Canvas */}
      <canvas
        ref={canvasRef}
        width={600}
        height={100}
        className="w-full h-24 bg-black/20 rounded-xl mb-4"
      />

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <AnimatePresence mode="wait">
          {!isRecording && !audioURL && (
            <motion.div
              key="record-btn"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-6"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            </motion.div>
          )}

          {isRecording && (
            <motion.div
              key="stop-btn"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-6 animate-pulse"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            </motion.div>
          )}

          {audioURL && !isRecording && (
            <motion.div
              key="playback-controls"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex gap-3"
            >
              <Button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-6"
              >
                {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              {!savedAudioURL && (
                <Button
                  onClick={uploadAudio}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-6"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Save Forever
                </Button>
              )}
              
              <Button
                onClick={deleteAudio}
                variant="destructive"
                className="px-6 py-6"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Audio level indicator */}
      {isRecording && (
        <motion.div
          className="mt-4 flex items-center justify-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-sm">Recording...</span>
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-8 rounded-full transition-all ${
                  i < audioLevel * 10 ? 'bg-pink-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}

      {savedAudioURL && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-green-400 mt-4"
        >
          ✓ Voice message saved!
        </motion.p>
      )}

      {/* Hidden audio element */}
      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      )}
    </motion.div>
  );
}
