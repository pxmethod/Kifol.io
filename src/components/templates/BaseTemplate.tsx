'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TemplateConfig, PortfolioTemplateProps } from '@/types/template';
import { Achievement } from '@/types/achievement';
import HighlightDetailModal from '@/components/HighlightDetailModal';

interface BaseTemplateProps extends PortfolioTemplateProps {
  config: TemplateConfig;
}

export default function BaseTemplate({ portfolio, config }: BaseTemplateProps) {
  const highlights = portfolio.achievements || [];
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Sort highlights by date (newest first)
  const sortedHighlights = [...highlights].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Group highlights by month/year for timeline headers
  const groupedHighlights = sortedHighlights.reduce((groups: { [key: string]: Achievement[] }, highlight) => {
    const date = new Date(highlight.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(highlight);
    return groups;
  }, {});
  
  // Modal state
  const [selectedHighlight, setSelectedHighlight] = useState<Achievement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewHighlight = (highlight: Achievement) => {
    setSelectedHighlight(highlight);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedHighlight(null);
  };

  // Get type display name
  const getTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'achievement': 'Achievement',
      'creative_work': 'Creative Work',
      'milestone': 'Milestone',
      'activity': 'Activity',
      'reflection_note': 'Reflection/Note'
    };
    return typeMap[type] || 'Achievement';
  };

  // Get media icon
  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ 
        backgroundColor: config.colors.background,
        fontFamily: config.fontFamily,
        color: config.colors.text
      }}
    >
      <style jsx>{`
        @keyframes fadeInBounce {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          60% {
            opacity: 1;
            transform: translateY(-10px);
          }
          80% {
            transform: translateY(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-bounce {
          animation: fadeInBounce 1s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>

      {/* Centered Content Container */}
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div 
          className={`text-center mb-12 ${isLoaded ? 'animate-fade-in-bounce' : 'opacity-0'}`}
        >
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white/10 ring-4 ring-white/20">
              {portfolio.photoUrl ? (
                    <Image 
                      src={portfolio.photoUrl} 
                      alt={portfolio.childName}
                  width={112}
                  height={112}
                    className="w-full h-full object-cover"
                  />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold" style={{ color: config.colors.text }}>
                  {portfolio.childName.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Child Name */}
            <h1 
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: config.colors.text, fontFamily: config.fontFamily }}
            >
              {portfolio.childName}
            </h1>

          {/* Portfolio Description */}
            <p 
            className="text-base sm:text-lg mb-8 leading-relaxed max-w-2xl mx-auto"
            style={{ color: config.colors.textSecondary, fontFamily: config.fontFamily }}
            >
              {portfolio.portfolioTitle}
            </p>

          {/* Highlights Count */}
          <div className="inline-block">
              <div 
              className="text-5xl sm:text-6xl font-bold mb-2"
              style={{ color: config.colors.text, fontFamily: config.fontFamily }}
              >
                {highlights.length}
              </div>
              <div 
              className="text-sm sm:text-base tracking-wide"
              style={{ color: config.colors.textSecondary, fontFamily: config.fontFamily }}
              >
                Highlights
              </div>
            </div>
              </div>

        {/* Highlights Timeline */}
        <div className={`space-y-12 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {Object.entries(groupedHighlights).map(([dateHeader, dateHighlights]) => (
            <div key={dateHeader} className="space-y-6">
              
              {/* Date Header */}
              <div 
                className="text-sm sm:text-base font-medium px-4 py-2 rounded-full inline-block"
                style={{ 
                  backgroundColor: config.colors.dateHeaderBg || 'rgba(255, 255, 255, 0.1)',
                  color: config.colors.text,
                  fontFamily: config.fontFamily
                }}
              >
                {dateHeader}
              </div>

              {/* Highlights for this date */}
              <div className="space-y-4">
                {dateHighlights.map((highlight: Achievement) => {
                  // Count media by type
                  const mediaByType = highlight.media.reduce((acc: any, media: any) => {
                    acc[media.type] = (acc[media.type] || 0) + 1;
                    return acc;
                  }, {});

                  return (
                    <div
                      key={highlight.id}
                      onClick={() => handleViewHighlight(highlight)}
                      className="rounded-lg p-6 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                      style={{ 
                        backgroundColor: config.colors.cardBg || 'rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      {/* Title and Type Tag */}
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <h3 
                          className="text-lg sm:text-xl font-semibold flex-1"
                          style={{ color: config.colors.text, fontFamily: config.fontFamily }}
                        >
                          {highlight.title}
                        </h3>
                        <span 
                          className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap"
                          style={{ 
                            backgroundColor: config.colors.tagBg || 'rgba(220, 38, 38, 0.9)',
                            color: '#ffffff',
                            fontFamily: config.fontFamily
                          }}
                        >
                          {getTypeName(highlight.type)}
                        </span>
                    </div>
                    
                      {/* Description */}
                      {highlight.description && (
                        <p 
                          className="text-sm sm:text-base mb-4 leading-relaxed"
                          style={{ color: config.colors.textSecondary, fontFamily: config.fontFamily }}
                        >
                          {highlight.description}
                        </p>
                      )}

                      {/* Media Thumbnails */}
                      {highlight.media.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {highlight.media.slice(0, 4).map((media: any, index: number) => (
                            <div
                              key={index}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0"
                              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                            >
                              {media.type === 'image' && !media.url.includes('.mp4') && !media.url.includes('.mov') && !media.url.includes('.avi') ? (
                                <Image
                                  src={media.url}
                                  alt=""
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover"
                                />
                              ) : media.type === 'video' || media.url.includes('.mp4') || media.url.includes('.mov') || media.url.includes('.avi') ? (
                                <div className="w-full h-full flex items-center justify-center relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              ) : media.type === 'pdf' ? (
                                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: config.colors.textSecondary }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              ) : media.type === 'audio' ? (
                                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: config.colors.textSecondary }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                  </svg>
                                </div>
                              ) : null}
                            </div>
                          ))}
                          {highlight.media.length > 4 && (
                            <div 
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                            >
                              <span className="text-sm font-medium" style={{ color: config.colors.text, fontFamily: config.fontFamily }}>
                                +{highlight.media.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer: Date and Media Icons */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        {/* Date with clock icon */}
                        <div className="flex items-center gap-2">
                          <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            style={{ color: config.colors.textSecondary }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span 
                            className="text-xs sm:text-sm"
                            style={{ color: config.colors.textSecondary, fontFamily: config.fontFamily }}
                          >
                            {formatDate(highlight.date)}
                          </span>
                        </div>

                        {/* Media Icons */}
                        {highlight.media.length > 0 && (
                          <div className="flex items-center gap-3">
                            {Object.entries(mediaByType).map(([type, count]) => (
                              <div 
                                key={type} 
                                className="flex items-center gap-1"
                                style={{ color: config.colors.textSecondary }}
                              >
                                {getMediaIcon(type)}
                                <span className="text-xs sm:text-sm" style={{ fontFamily: config.fontFamily }}>{count as number}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

          {/* Empty State */}
          {highlights.length === 0 && (
            <div className={`text-center py-16 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <p 
              className="text-lg"
              style={{ color: config.colors.textSecondary, fontFamily: config.fontFamily }}
              >
                No highlights yet
              </p>
            </div>
          )}

      {/* Footer */}
        <footer className={`mt-16 pt-8 border-t text-center ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ borderColor: config.colors.border || 'rgba(255, 255, 255, 0.1)' }}>
          <div 
            className="flex items-center justify-center gap-2 text-sm"
            style={{ color: config.colors.textSecondary, fontFamily: config.fontFamily }}
          >
            <span>Created with</span>
            <Image
              src="/kifolio_logo.svg"
              alt="Kifolio"
              width={80}
              height={20}
              className="inline-block brightness-0 invert opacity-70"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span>•</span>
            <span>{new Date().getFullYear()}</span>
          </div>
      </footer>
      </div>

      {/* Highlight Detail Modal */}
      <HighlightDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        onEdit={() => {}} // No edit functionality in public view
        achievement={selectedHighlight}
        showEditButton={false}
        config={config}
      />
    </div>
  );
} 
