'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Achievement } from '@/types/achievement';

interface AchievementCardProps {
  achievement: Achievement;
  onView?: (achievement: Achievement) => void;
  onEdit?: (achievement: Achievement) => void;
}

export default function AchievementCard({
  achievement,
  onView,
  onEdit
}: AchievementCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

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

    const handleThumbnailClick = (url: string) => {
      setSelectedImageUrl(url);
      setShowImageModal(true);
    };

    return (
      <div className="flex items-center space-x-2 mt-3">
        {imageMedia.slice(0, displayCount).map((media, index) => (
          <div
            key={media.id}
            className="w-24 h-24 rounded overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleThumbnailClick(media.url)}
          >
            <Image
              src={media.url}
              alt=""
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {hasMore && (
          <div className="w-24 h-24 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-sm text-gray-600 font-medium">
              +{imageMedia.length - 5}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderMediaIcons = () => {
    const hasImages = achievement.media.some(m => m.type === 'image');
    const hasVideos = achievement.media.some(m => m.type === 'video');
    const hasPdfs = achievement.media.some(m => m.type === 'pdf');
    const hasAudio = achievement.media.some(m => m.type === 'audio');
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
        {hasVideos && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-500">
              {achievement.media.filter(m => m.type === 'video').length}
            </span>
          </div>
        )}
        {hasAudio && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span className="text-xs text-gray-500">
              {achievement.media.filter(m => m.type === 'audio').length}
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

  // Get type icon and display name
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'achievement':
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          ),
          name: 'Achievement'
        };
      case 'creative_work':
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          ),
          name: 'Creative Work'
        };
      case 'milestone':
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          name: 'Milestone'
        };
      case 'activity':
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          name: 'Activity'
        };
      case 'reflection_note':
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
          name: 'Reflection/Note'
        };
      default:
        return {
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          ),
          name: 'Achievement'
        };
    }
  };

  const typeInfo = getTypeInfo(achievement.type);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 relative ${
        isHovered ? 'shadow-md border-gray-300 bg-gray-50' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {/* Desktop Layout - Title and Type Tag on same row */}
          <div className="hidden md:flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-kifolio-text truncate">
              {achievement.title}
            </h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-kifolio-cta/10 text-kifolio-cta flex-shrink-0">
              {typeInfo.icon}
              <span className="ml-1">{typeInfo.name}</span>
            </span>
          </div>
          
          {/* Mobile Layout - Type Tag below Title */}
          <div className="md:hidden">
            <h3 className="text-lg font-semibold text-kifolio-text mb-2">
              {achievement.title}
            </h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-kifolio-cta/10 text-kifolio-cta">
              {typeInfo.icon}
              <span className="ml-1">{typeInfo.name}</span>
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(achievement.date)}
          </p>
        </div>
        
        {/* Edit Button - Only show on hover */}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(achievement);
            }}
            className={`p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            title="Edit highlight"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

      </div>

      {/* Description */}
      {achievement.description && (
        <p className="text-gray-500 text-sm mb-3">
          {achievement.description}
        </p>
      )}

      {/* Media Thumbnails */}
      {renderMediaThumbnails()}

      {/* Media Icons */}
      {renderMediaIcons()}

      {/* Click to view overlay */}
      {onView && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => onView(achievement)}
          title="View details"
        />
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-4xl p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Image
                src={selectedImageUrl}
                alt="Enlarged view"
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 