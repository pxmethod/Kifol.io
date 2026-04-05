'use client';

import { highlightDateToMonthSortKey, parseHighlightDateLocal } from '@/lib/highlightDates';
import { Achievement } from '@/types/achievement';
import HighlightCard from './HighlightCard';

interface HighlightsTimelineProps {
  highlights: Achievement[];
  /** When the list is empty only because of a type filter, show this instead of the default empty state. */
  emptyFilterMessage?: string;
  onView?: (highlight: Achievement) => void;
  onEdit?: (highlight: Achievement) => void;
  onRequestEndorsement?: (highlight: Achievement) => void;
  onRemoveEndorsement?: (endorsementId: string) => void | Promise<void>;
}

interface GroupedHighlights {
  [key: string]: Achievement[];
}

export default function HighlightsTimeline({
  highlights,
  emptyFilterMessage,
  onView,
  onEdit,
  onRequestEndorsement,
  onRemoveEndorsement
}: HighlightsTimelineProps) {
  const groupHighlightsByDate = (highlights: Achievement[]): GroupedHighlights => {
    const grouped: GroupedHighlights = {};
    
    highlights.forEach(highlight => {
      const sortKey = highlightDateToMonthSortKey(highlight.date);

      if (!grouped[sortKey]) {
        grouped[sortKey] = [];
      }
      grouped[sortKey].push(highlight);
    });

    // Sort highlights within each group by date (newest first)
    Object.keys(grouped).forEach(key => {
      grouped[key].sort(
        (a, b) =>
          parseHighlightDateLocal(b.date).getTime() - parseHighlightDateLocal(a.date).getTime()
      );
    });
    
    return grouped;
  };

  const formatGroupDate = (sortKey: string) => {
    const parts = sortKey.split('-');
    if (parts.length !== 2) return sortKey;
    const year = Number(parts[0]);
    const monthIndex = Number(parts[1]) - 1;
    if (Number.isNaN(year) || Number.isNaN(monthIndex)) return sortKey;
    const date = new Date(year, monthIndex, 1);
    const now = new Date();
    const isCurrentMonth =
      date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

    if (isCurrentMonth) {
      return 'This Month';
    }

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const isLastMonth =
      date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();

    if (isLastMonth) {
      return 'Last Month';
    }

    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const groupedHighlights = groupHighlightsByDate(highlights);
  const sortedGroups = Object.keys(groupedHighlights).sort((a, b) => b.localeCompare(a));

  if (highlights.length === 0) {
    if (emptyFilterMessage) {
      return (
        <div className="text-center py-12">
          <p className="text-discovery-grey">{emptyFilterMessage}</p>
        </div>
      );
    }
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
            <h3 className="text-lg font-bold text-discovery-beige-800 px-3 py-1 bg-discovery-beige-400 rounded-full">
              {formatGroupDate(dateKey)}
            </h3>
            <div className="flex-1 border-t border-discovery-beige-100"></div>
          </div>
          
          {/* Highlights for this date */}
          <div className="space-y-4">
            {groupedHighlights[dateKey].map((highlight) => (
              <div key={highlight.id} className="relative">
                <HighlightCard
                  achievement={highlight}
                  onView={onView}
                  onEdit={onEdit}
                  onRequestEndorsement={onRequestEndorsement}
                  onRemoveEndorsement={onRemoveEndorsement}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
