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
  const regularAchievements = achievements.filter((a: Achievement) => !a.isMilestone);
  
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
          {/* Milestones Section */}
          {milestones.length > 0 && (
            <div className="mb-16">
              <h2 
                className="text-3xl font-bold mb-8 text-center"
                style={{ color: config.colors.text }}
              >
                Milestones
              </h2>
              <div className="grid gap-8 md:grid-cols-2">
                {milestones.map((achievement: Achievement) => (
                  <div 
                    key={achievement.id}
                    className="p-6 rounded-lg border cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ 
                      backgroundColor: config.colors.background,
                      borderColor: config.colors.border
                    }}
                    onClick={() => handleViewAchievement(achievement)}
                  >
                    <div className="flex items-start space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: config.colors.primary }}
                      >
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 
                          className="text-lg font-semibold mb-2"
                          style={{ color: config.colors.text }}
                        >
                          {achievement.title}
                        </h3>
                        <p 
                          className="text-sm mb-2"
                          style={{ color: config.colors.textSecondary }}
                        >
                          {formatDate(achievement.date)}
                        </p>
                        {achievement.description && (
                          <p 
                            className="text-sm"
                            style={{ color: config.colors.textSecondary }}
                          >
                            {achievement.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Timeline */}
          {regularAchievements.length > 0 && (
            <div>
              <h2 
                className="text-3xl font-bold mb-8 text-center"
                style={{ color: config.colors.text }}
              >
                Timeline
              </h2>
              <div className="space-y-8">
                {regularAchievements.map((achievement: Achievement) => (
                  <div 
                    key={achievement.id}
                    className="flex items-start space-x-6"
                  >
                    {/* Date */}
                    <div 
                      className="w-24 text-sm font-medium flex-shrink-0 pt-2"
                      style={{ color: config.colors.textSecondary }}
                    >
                      {formatDate(achievement.date)}
                    </div>

                    {/* Timeline Line */}
                    <div className="relative flex-shrink-0">
                      <div 
                        className="w-4 h-4 rounded-full border-2"
                        style={{ 
                          backgroundColor: config.colors.background,
                          borderColor: config.colors.primary
                        }}
                      ></div>
                      <div 
                        className="absolute top-4 left-2 w-px h-full"
                        style={{ backgroundColor: config.colors.border }}
                      ></div>
                    </div>

                    {/* Content */}
                    <div 
                      className="flex-1 p-6 rounded-lg border cursor-pointer hover:shadow-lg transition-shadow"
                      style={{ 
                        backgroundColor: config.colors.background,
                        borderColor: config.colors.border
                      }}
                      onClick={() => handleViewAchievement(achievement)}
                    >
                      <h3 
                        className="text-lg font-semibold mb-2"
                        style={{ color: config.colors.text }}
                      >
                        {achievement.title}
                      </h3>
                      {achievement.description && (
                        <p 
                          className="text-sm"
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
                              className="w-16 h-16 rounded border overflow-hidden"
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