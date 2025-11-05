import { Repeat, Clock, MessageSquare, Volume2, Lightbulb } from "lucide-react";
import { ScoreCard } from "./ScoreCard";
import { ResponseBanner } from "./ResponseBanner";
import { Badge } from "@/components/ui/badge";

interface DetailedTip {
  original_timestamp: string;
  transcribed_timestamp: string;
  suggestion: string;
}

interface AnalysisData {
  score: number;
  overall_feedback: string;
  word_repetition_score: number;
  word_repetition_count: number;
  speaking_pace_score: number;
  speaking_pace_count: number;
  filler_words_score: number;
  voice_clarity_score: number;
  filler_words_count: number;
  repetitive_words_list: string[];
  detailed_tips: DetailedTip[];
}

interface AnalysisResponseProps {
  data: AnalysisData;
}

export const AnalysisResponse = ({ data }: AnalysisResponseProps) => {
  return (
    <div className="space-y-6">
      {/* Score Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ScoreCard
          title="Word Repetition"
          score={data.word_repetition_score}
          count={data.word_repetition_count}
          icon={Repeat}
          delay={0}
        />
        <ScoreCard
          title="Speaking Pace"
          score={data.speaking_pace_score}
          count={data.speaking_pace_count}
          icon={Clock}
          delay={100}
        />
        <ScoreCard
          title="Filler Words"
          score={data.filler_words_score}
          count={data.filler_words_count}
          icon={MessageSquare}
          delay={200}
        />
        <ScoreCard
          title="Voice Clarity"
          score={data.voice_clarity_score}
          icon={Volume2}
          delay={300}
        />
      </div>

      {/* Repetitive Words */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm animate-fade-in" style={{ animationDelay: '400ms' }}>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Repeat className="h-4 w-4 text-warning" />
          Repetitive Words
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.repetitive_words_list.length > 0 ? (
            data.repetitive_words_list.map((word, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
              >
                {word}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No repetitive words detected</p>
          )}
        </div>
      </div>

      {/* Detailed Tips */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm animate-fade-in" style={{ animationDelay: '500ms' }}>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-accent" />
          Detailed Tips
        </h3>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {data.detailed_tips.length > 0 ? (
            data.detailed_tips.map((tip, index) => (
              <div key={index} className="space-y-1">
                <p className="text-xs font-medium text-accent">
                  Original: {tip.original_timestamp} • Heard: {tip.transcribed_timestamp}
                </p>
                <p className="text-sm text-foreground">{tip.suggestion}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Great job! Keep up the good work.</p>
          )}
        </div>
      </div>

      {/* Overall Score Banner */}
      <ResponseBanner score={data.score} feedback={data.overall_feedback} />
    </div>
  );
};
