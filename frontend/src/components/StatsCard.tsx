import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
  style?: React.CSSProperties;
}

export function StatsCard({ title, value, change, changeType, icon: Icon, className, style }: StatsCardProps) {
  return (
    <Card className={cn("shadow-card hover:shadow-elegant transition-elegant hover-lift animate-fade-in", className)} style={style}>
      <CardContent className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-card opacity-60" />
        <div className="relative flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-black text-foreground tracking-tight">{value}</p>
            <p className={cn(
              "text-sm font-semibold flex items-center gap-1",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {changeType === "positive" && "↗"}
              {changeType === "negative" && "↘"}
              {change}
            </p>
          </div>
          <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-elegant hover-glow transition-elegant">
            <Icon className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}