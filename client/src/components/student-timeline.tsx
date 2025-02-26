import { PortfolioEntry } from "@shared/schema";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { 
  Trophy, 
  Book, 
  Star, 
  Award,
  FileText,
  Calendar 
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons = {
  achievement: Trophy,
  academic: Book,
  award: Star,
  recognition: Award,
  assessment: FileText,
} as const;

interface TimelineProps {
  entries: PortfolioEntry[];
}

export function StudentTimeline({ entries }: TimelineProps) {
  return (
    <div className="space-y-8">
      {entries.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No timeline entries yet
        </div>
      ) : (
        entries
          .sort((a, b) => new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime())
          .map((entry, index) => {
            const Icon = typeIcons[entry.type as keyof typeof typeIcons] || Calendar;
            
            return (
              <div key={entry.id} className="relative flex items-start gap-4">
                {/* Timeline line */}
                {index !== entries.length - 1 && (
                  <div className="absolute left-6 top-10 bottom-0 w-px bg-border" />
                )}
                
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                
                {/* Content */}
                <Card className="flex-1 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">{entry.title}</h3>
                    <time className="text-sm text-muted-foreground">
                      {format(new Date(entry.achievementDate), 'MMM d, yyyy')}
                    </time>
                  </div>
                  
                  <p className="text-muted-foreground">{entry.description}</p>
                  
                  {entry.grade && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium">Grade:</span>
                      <span className={cn(
                        "text-sm",
                        parseInt(entry.grade) >= 90 ? "text-green-600" :
                        parseInt(entry.grade) >= 80 ? "text-emerald-600" :
                        parseInt(entry.grade) >= 70 ? "text-yellow-600" :
                        "text-red-600"
                      )}>
                        {entry.grade}
                      </span>
                    </div>
                  )}
                  
                  {entry.feedback && (
                    <div className="mt-2">
                      <span className="text-sm font-medium">Feedback:</span>
                      <p className="mt-1 text-sm text-muted-foreground">{entry.feedback}</p>
                    </div>
                  )}
                </Card>
              </div>
            );
          })
      )}
    </div>
  );
}
