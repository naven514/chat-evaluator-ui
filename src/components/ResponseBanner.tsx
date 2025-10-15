import { TrendingUp } from "lucide-react";

interface ResponseBannerProps {
  score: number;
  feedback: string;
}

const getScoreGradient = (score: number) => {
  if (score >= 8) return "from-success/20 to-success/5";
  if (score >= 6) return "from-info/20 to-info/5";
  if (score >= 4) return "from-warning/20 to-warning/5";
  return "from-destructive/20 to-destructive/5";
};

const getScoreColor = (score: number) => {
  if (score >= 8) return "text-success";
  if (score >= 6) return "text-info";
  if (score >= 4) return "text-warning";
  return "text-destructive";
};

export const ResponseBanner = ({ score, feedback }: ResponseBannerProps) => {
  return (
    <div className={`mt-6 p-6 rounded-2xl bg-gradient-to-r ${getScoreGradient(score)} border border-border/50 shadow-md animate-slide-up`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-card/50">
          <TrendingUp className={`h-5 w-5 ${getScoreColor(score)}`} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Overall Score</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/10</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{feedback}</p>
    </div>
  );
};
