import { Mic } from "lucide-react";

interface AudioNoteProps {
  duration: number;
}

export const AudioNote = ({ duration }: AudioNoteProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-primary rounded-2xl shadow-md min-w-[200px]">
      <div className="p-2 rounded-full bg-primary-foreground/20">
        <Mic className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex-1">
        <div className="h-8 flex items-center gap-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary-foreground/60 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 100 + 20}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>
      <span className="text-sm font-medium text-primary-foreground">
        {formatDuration(duration)}
      </span>
    </div>
  );
};
