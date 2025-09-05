'use client';

import { Achievement } from '@/types/achievement';
import AchievementCard from './AchievementCard';

interface AchievementsTimelineProps {
  achievements: Achievement[];
  onView?: (achievement: Achievement) => void;
  onEdit?: (achievement: Achievement) => void;
}

interface GroupedAchievements {
  [key: string]: Achievement[];
}

export default function AchievementsTimeline({
  achievements,
  onView,
  onEdit
}: AchievementsTimelineProps) {
  const groupAchievementsByDate = (achievements: Achievement[]): GroupedAchievements => {
    const grouped: GroupedAchievements = {};
    
    achievements.forEach(achievement => {
      const date = new Date(achievement.date);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(achievement);
    });
    
    // Sort achievements within each group by date (newest first)
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

  const groupedAchievements = groupAchievementsByDate(achievements);
  const sortedGroups = Object.keys(groupedAchievements).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });

  if (achievements.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4">
          <img 
            src="/marketing/no-achievements.png" 
            alt="No achievements yet" 
            className="mx-auto"
            style={{ width: '260px', height: '260px' }}
          />
        </div>
        <h3 className="text-lg font-medium text-kifolio-text mb-2">No Highlights Yet</h3>
        <p className="text-gray-500">Start building the portfolio by adding the first highlight.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedGroups.map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          {/* Date Header */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 border-t border-gray-200"></div>
            <h3 className="text-sm font-medium text-gray-500 px-3 py-1 bg-gray-50 rounded-full">
              {formatGroupDate(dateKey)}
            </h3>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
          
          {/* Achievements for this date */}
          <div className="space-y-4">
            {groupedAchievements[dateKey].map((achievement) => (
              <div key={achievement.id} className="relative">
                <AchievementCard
                  achievement={achievement}
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