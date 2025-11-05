import { Mic } from "lucide-react";

interface AudioNoteProps {
  duration: number;
  recording?: boolean;
  level?: number; // 0..1
}

export const AudioNote = ({ duration, recording = false, level = 0 }: AudioNoteProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-primary rounded-2xl shadow-md min-w-[200px]">
      <div className="p-2 rounded-full bg-primary-foreground/20 relative">
        <Mic className="h-4 w-4 text-primary-foreground" />
        {recording && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
      <div className="flex-1">
        <div className="h-8 flex items-end gap-1">
          {Array.from({ length: 24 }).map((_, i) => {
            const attenuation = 1 - Math.abs((i - 12) / 12); // center higher
            const barLevel = Math.max(0.1, Math.min(1, level * 1.8 * attenuation));
            const height = 16 + barLevel * 48; // 16-64px
            return (
              <div
                key={i}
                className={`w-1 ${recording ? 'bg-primary-foreground' : 'bg-primary-foreground/60'} rounded-full transition-[height,background-color] duration-100`}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium text-primary-foreground">
          {formatDuration(duration)}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-primary-foreground/80">
          {recording ? 'Recording' : 'Recorded'}
        </span>
      </div>
    </div>
  );
};
