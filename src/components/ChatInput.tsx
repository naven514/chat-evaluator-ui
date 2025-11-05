import { useEffect, useRef, useState } from "react";
import { Send, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStartRecording: () => void;
  onStopRecording: (blob: Blob) => void;
  onLevel?: (level: number) => void; // 0..1 RMS level while recording
  hideSend?: boolean; // when true, hide the send button
  canRecord?: boolean; // when false, mic button is disabled/dim
}

export const ChatInput = ({ onSendMessage, onStartRecording, onStopRecording, onLevel, hideSend = false, canRecord = true }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelTimerRef = useRef<number | null>(null);

  const handleSend = () => {
    if (hideSend) return;
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstart = () => {
        setIsRecording(true);
        onStartRecording();
        // Setup audio level monitoring
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.8;
          source.connect(analyser);
          audioContextRef.current = ctx;
          analyserRef.current = analyser;

          const data = new Uint8Array(analyser.frequencyBinCount);
          if (levelTimerRef.current) window.clearInterval(levelTimerRef.current);
          levelTimerRef.current = window.setInterval(() => {
            // Use time-domain RMS for perceived loudness
            const td = new Uint8Array(analyser.fftSize);
            analyser.getByteTimeDomainData(td);
            let sumSq = 0;
            for (let i = 0; i < td.length; i++) {
              const v = (td[i] - 128) / 128; // -1..1
              sumSq += v * v;
            }
            const rms = Math.sqrt(sumSq / td.length); // 0..1
            if (onLevel) onLevel(Math.min(1, Math.max(0, rms)));
          }, 100) as unknown as number;
        } catch (e) {
          // ignore level metering errors
        }
      };
      recorder.onstop = () => {
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        onStopRecording(blob);
        // stop tracks
        stream.getTracks().forEach((t) => t.stop());
        if (levelTimerRef.current) {
          window.clearInterval(levelTimerRef.current);
          levelTimerRef.current = null;
        }
        if (audioContextRef.current) {
          try { audioContextRef.current.close(); } catch {}
          audioContextRef.current = null;
        }
        if (onLevel) onLevel(0);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
    } catch (err) {
      console.error("Mic access/record error", err);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!hideSend) handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border p-4">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            if (!canRecord && !isRecording) return;
            return isRecording ? stopRecording() : startRecording();
          }}
          disabled={!canRecord && !isRecording}
          className={`rounded-full h-12 w-12 transition-all ${
            isRecording
              ? 'animate-pulse-glow bg-primary text-primary-foreground'
              : (canRecord ? 'hover:bg-secondary' : 'opacity-50 cursor-not-allowed')
          }`}
        >
          {isRecording ? (
            <Square className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="pr-12 h-12 bg-input/50 border-border rounded-full focus-visible:ring-primary"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={hideSend || !message.trim()}
            className={`absolute right-1 top-1 h-10 w-10 rounded-full bg-gradient-primary transition-opacity ${
              hideSend || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
