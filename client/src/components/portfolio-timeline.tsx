import { PortfolioEntry } from "@shared/schema";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioTimelineProps {
  entries: PortfolioEntry[];
}

export function PortfolioTimeline({ entries }: PortfolioTimelineProps) {
  if (entries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No portfolio entries yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              entry.type === 'accomplishment' ? "bg-green-100" : "bg-blue-100"
            )}>
              {entry.type === 'accomplishment' ? (
                <Award className="h-4 w-4 text-green-600" />
              ) : (
                <FolderKanban className="h-4 w-4 text-blue-600" />
              )}
            </div>
            {index !== entries.length - 1 && (
              <div className="w-0.5 h-full bg-border mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle>{entry.title}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(entry.achievementDate), "MMMM dd, yyyy")}
                    </div>
                  </div>
                  <div className={cn(
                    "text-sm font-medium px-2.5 py-0.5 rounded-full",
                    entry.type === 'accomplishment' 
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  )}>
                    {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {entry.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {entry.description}
                  </p>
                )}
                {entry.mediaUrls && entry.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {entry.mediaUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        {url.match(/\.(jpg|jpeg|gif|svg)$/i) ? (
                          <img
                            src={url}
                            alt={`Portfolio media ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center bg-muted">
                            <span className="text-sm text-muted-foreground">
                              View Document
                            </span>
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}
