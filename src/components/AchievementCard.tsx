'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Achievement } from '@/types/achievement';

interface AchievementCardProps {
  achievement: Achievement;
  onView: (achievement: Achievement) => void;
  onEdit?: (achievement: Achievement) => void;
}

export default function AchievementCard({
  achievement,
  onView,
  onEdit
}: AchievementCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderMediaThumbnails = () => {
    const imageMedia = achievement.media.filter(m => m.type === 'image');
    const displayCount = Math.min(5, imageMedia.length);
    const hasMore = imageMedia.length > 5;

    if (imageMedia.length === 0) return null;

    return (
      <div className="flex items-center space-x-1 mt-3">
        {imageMedia.slice(0, displayCount).map((media, index) => (
          <div
            key={media.id}
            className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0"
          >
            <Image
              src={media.url}
              alt=""
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {hasMore && (
          <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-gray-600 font-medium">
              +{imageMedia.length - 5}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderMediaIcons = () => {
    const hasImages = achievement.media.some(m => m.type === 'image');
    const hasPdfs = achievement.media.some(m => m.type === 'pdf');
    const totalMedia = achievement.media.length;

    if (totalMedia === 0) return null;

    return (
      <div className="flex items-center space-x-2 mt-2">
        {hasImages && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-500">
              {achievement.media.filter(m => m.type === 'image').length}
            </span>
          </div>
        )}
        {hasPdfs && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-500">
              {achievement.media.filter(m => m.type === 'pdf').length}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 ${
        isHovered ? 'shadow-md border-gray-300' : ''
      } ${achievement.isMilestone ? 'border-l-4 border-l-kifolio-cta' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-kifolio-text truncate">
              {achievement.title}
            </h3>
            {achievement.isMilestone && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-kifolio-cta/10 text-kifolio-cta">
                Milestone
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formatDate(achievement.date)}
          </p>
        </div>
        
        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(achievement);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Edit highlight"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

      </div>

      {/* Description */}
      {achievement.description && (
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
          {achievement.description}
        </p>
      )}

      {/* Media Thumbnails */}
      {renderMediaThumbnails()}

      {/* Media Icons */}
      {renderMediaIcons()}

      {/* Click to view overlay */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => onView(achievement)}
        title="View details"
      />
    </div>
  );
} 