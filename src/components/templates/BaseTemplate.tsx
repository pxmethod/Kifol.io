'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TemplateConfig, PortfolioTemplateProps } from '@/types/template';
import { Achievement } from '@/types/achievement';
import AchievementDetailModal from '@/components/AchievementDetailModal';

interface BaseTemplateProps extends PortfolioTemplateProps {
  config: TemplateConfig;
}

export default function BaseTemplate({ portfolio, config }: BaseTemplateProps) {
  const achievements = portfolio.achievements || [];
  const milestones = achievements.filter((a: Achievement) => a.isMilestone);
  
  // Sort all achievements by date (newest first) and group by date
  const sortedAchievements = [...achievements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Group achievements by date
  const achievementsByDate = sortedAchievements.reduce((groups: { [key: string]: Achievement[] }, achievement) => {
    const date = achievement.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(achievement);
    return groups;
  }, {});
  
  // Modal state
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedAchievement(null);
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: config.colors.background,
        fontFamily: config.fontFamily
      }}
    >
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{ backgroundColor: config.colors.primary }}
          >
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, ${config.colors.primary} 2px, transparent 2px)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Avatar */}
          <div className="relative z-10 mb-8">
            <div 
              className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4"
              style={{ borderColor: config.colors.primary }}
            >
              {portfolio.photoUrl ? (
                portfolio.photoUrl.startsWith('/placeholders/') ? (
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <Image 
                      src={portfolio.photoUrl} 
                      alt={portfolio.childName}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Image 
                    src={portfolio.photoUrl} 
                    alt={portfolio.childName}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                  style={{ backgroundColor: config.colors.primary }}
                >
                  {portfolio.childName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Name and Title */}
          <div className="relative z-10 mb-6">
            <h1 
              className="text-5xl font-bold mb-4"
              style={{ color: config.colors.text }}
            >
              {portfolio.childName}
            </h1>
            <p 
              className="text-xl"
              style={{ color: config.colors.textSecondary }}
            >
              {portfolio.portfolioTitle}
            </p>
          </div>

          {/* Stats */}
          <div className="relative z-10 flex justify-center space-x-8">
            <div className="text-center">
              <div 
                className="text-3xl font-bold mb-1"
                style={{ color: config.colors.primary }}
              >
                {achievements.length}
              </div>
              <div 
                className="text-sm uppercase tracking-wide"
                style={{ color: config.colors.textSecondary }}
              >
                Achievements
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-3xl font-bold mb-1"
                style={{ color: config.colors.primary }}
              >
                {milestones.length}
              </div>
              <div 
                className="text-sm uppercase tracking-wide"
                style={{ color: config.colors.textSecondary }}
              >
                Milestones
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Achievements by Date */}
          {Object.keys(achievementsByDate).length > 0 && (
            <div>
              <h2 
                className="text-3xl font-bold mb-8 text-center"
                style={{ color: config.colors.text }}
              >
                Timeline
              </h2>
              <div className="space-y-12">
                {Object.entries(achievementsByDate).map(([date, dateAchievements]) => (
                  <div key={date} className="space-y-6">
                    {/* Date Header */}
                    <div 
                      className="text-lg font-semibold text-center pb-2 border-b"
                      style={{ 
                        color: config.colors.text,
                        borderColor: config.colors.border
                      }}
                    >
                      {formatDate(date)}
                    </div>
                    
                    {/* Achievements for this date */}
                    <div className="space-y-4">
                      {dateAchievements.map((achievement: Achievement) => (
                        <div 
                          key={achievement.id}
                          className="p-6 rounded-lg border cursor-pointer hover:shadow-lg transition-shadow"
                          style={{ 
                            backgroundColor: config.colors.background,
                            borderColor: config.colors.border
                          }}
                          onClick={() => handleViewAchievement(achievement)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 
                              className="text-lg font-semibold"
                              style={{ color: config.colors.text }}
                            >
                              {achievement.title}
                            </h3>
                            {achievement.isMilestone && (
                              <span 
                                className="px-2 py-1 text-xs font-medium rounded-full"
                                style={{ 
                                  backgroundColor: config.colors.primary,
                                  color: 'white'
                                }}
                              >
                                Milestone
                              </span>
                            )}
                          </div>
                          
                          {achievement.description && (
                            <p 
                              className="text-sm mb-4"
                              style={{ color: config.colors.textSecondary }}
                            >
                              {achievement.description}
                            </p>
                          )}
                          
                          {/* Media Preview */}
                          {achievement.media && achievement.media.length > 0 && (
                            <div className="mt-4 flex space-x-2">
                              {achievement.media.slice(0, 3).map((media) => (
                                <div 
                                  key={media.id}
                                  className="w-40 h-40 rounded border overflow-hidden"
                                  style={{ borderColor: config.colors.border }}
                                >
                                  {media.type === 'image' ? (
                                    <Image 
                                      src={media.url} 
                                      alt={media.fileName}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div 
                                      className="w-full h-full flex items-center justify-center"
                                      style={{ backgroundColor: config.colors.primary }}
                                    >
                                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {achievement.media.length > 3 && (
                                <div 
                                  className="w-16 h-16 rounded border flex items-center justify-center text-sm font-medium"
                                  style={{ 
                                    backgroundColor: config.colors.background,
                                    borderColor: config.colors.border,
                                    color: config.colors.textSecondary
                                  }}
                                >
                                  +{achievement.media.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {achievements.length === 0 && (
            <div className="text-center py-16">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: config.colors.border }}
              >
                <svg 
                  className="w-8 h-8"
                  style={{ color: config.colors.textSecondary }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: config.colors.text }}
              >
                No Achievements Yet
              </h3>
              <p 
                className="text-sm"
                style={{ color: config.colors.textSecondary }}
              >
                Start building {portfolio.childName}&apos;s portfolio by adding achievements.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-8 px-4 border-t text-center"
        style={{ borderColor: config.colors.border }}
      >
        <p 
          className="text-sm"
          style={{ color: config.colors.textSecondary }}
        >
          Created with Kifolio • {new Date().getFullYear()}
        </p>
      </footer>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        onEdit={() => {}} // No edit functionality in public view
        achievement={selectedAchievement}
        showEditButton={false}
      />
    </div>
  );
} 