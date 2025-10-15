import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreCardProps {
  title: string;
  score: number;
  count?: number;
  icon: LucideIcon;
  delay?: number;
}

const getScoreColor = (score: number) => {
  if (score >= 8) return "text-success";
  if (score >= 6) return "text-info";
  if (score >= 4) return "text-warning";
  return "text-destructive";
};

const getScoreBg = (score: number) => {
  if (score >= 8) return "bg-success/10";
  if (score >= 6) return "bg-info/10";
  if (score >= 4) return "bg-warning/10";
  return "bg-destructive/10";
};

export const ScoreCard = ({ title, score, count, icon: Icon, delay = 0 }: ScoreCardProps) => {
  return (
    <Card 
      className="bg-gradient-card border-border/50 shadow-md hover:shadow-lg transition-all duration-300 animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <div className={`p-2 rounded-lg ${getScoreBg(score)}`}>
            <Icon className={`h-4 w-4 ${getScoreColor(score)}`} />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">/10</span>
        </div>
        {count !== undefined && (
          <p className="text-xs text-muted-foreground mt-2">
            Count: {count}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
