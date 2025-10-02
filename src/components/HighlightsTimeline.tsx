'use client';

import { Achievement } from '@/types/achievement';
import AchievementCard from './AchievementCard';

interface HighlightsTimelineProps {
  highlights: Achievement[];
  onView?: (highlight: Achievement) => void;
  onEdit?: (highlight: Achievement) => void;
}

interface GroupedHighlights {
  [key: string]: Achievement[];
}

export default function HighlightsTimeline({
  highlights,
  onView,
  onEdit
}: HighlightsTimelineProps) {
  const groupHighlightsByDate = (highlights: Achievement[]): GroupedHighlights => {
    const grouped: GroupedHighlights = {};
    
    highlights.forEach(highlight => {
      const date = new Date(highlight.date);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(highlight);
    });
    
    // Sort highlights within each group by date (newest first)
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    return grouped;
  };

  const formatGroupDate = (dateKey: string) => {
    const [month, year] = dateKey.split(' ');
    const date = new Date(`${month} 1, ${year}`);
    const now = new Date();
    const isCurrentMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    if (isCurrentMonth) {
      return 'This Month';
    }
    
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const isLastMonth = date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    
    if (isLastMonth) {
      return 'Last Month';
    }
    
    return dateKey;
  };

  const groupedHighlights = groupHighlightsByDate(highlights);
  const sortedGroups = Object.keys(groupedHighlights).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });

  if (highlights.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4">
          <img 
            src="/marketing/no-achievements.png" 
            alt="No highlights yet" 
            className="mx-auto"
            style={{ width: '260px', height: '260px' }}
          />
        </div>
        <h3 className="text-lg font-medium text-discovery-black mb-2">No highlights yet</h3>
        <p className="text-discovery-grey">Every journey starts with one moment. Add their first highlight—it could be their latest artwork,
            a great report card, a team win, or simply a milestone that made you smile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedGroups.map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          {/* Date Header */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 border-t border-discovery-beige-100"></div>
            <h3 className="text-sm font-medium text-discovery-grey px-3 py-1 bg-discovery-beige-100 rounded-full">
              {formatGroupDate(dateKey)}
            </h3>
            <div className="flex-1 border-t border-discovery-beige-100"></div>
          </div>
          
          {/* Highlights for this date */}
          <div className="space-y-4">
            {groupedHighlights[dateKey].map((highlight) => (
              <div key={highlight.id} className="relative">
                <AchievementCard
                  achievement={highlight}
                  onView={onView}
                  onEdit={onEdit}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
