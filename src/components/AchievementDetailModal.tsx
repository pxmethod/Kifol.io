'use client';

import { useState } from 'react';
import { Achievement } from '@/types/achievement';

interface AchievementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (achievement: Achievement) => void;
  achievement: Achievement | null;
}

export default function AchievementDetailModal({
  isOpen,
  onClose,
  onEdit,
  achievement
}: AchievementDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen || !achievement) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const imageMedia = achievement.media.filter(m => m.type === 'image');
  const pdfMedia = achievement.media.filter(m => m.type === 'pdf');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-kifolio-text">
              Achievement Details
            </h2>
            {achievement.isMilestone && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-kifolio-cta/10 text-kifolio-cta">
                Milestone
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Title and Date */}
          <div>
            <h1 className="text-2xl font-bold text-kifolio-text mb-2">
              {achievement.title}
            </h1>
            <p className="text-gray-500">
              {formatDate(achievement.date)}
            </p>
          </div>

          {/* Description */}
          {achievement.description && (
            <div>
              <h3 className="text-sm font-medium text-kifolio-text mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {achievement.description}
              </p>
            </div>
          )}

          {/* Image Gallery */}
          {imageMedia.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-kifolio-text mb-3">Photos</h3>
              
              {/* Main Image */}
              <div className="mb-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imageMedia[selectedImageIndex]?.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {imageMedia.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {imageMedia.map((media, index) => (
                    <button
                      key={media.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                        index === selectedImageIndex
                          ? 'border-kifolio-cta'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={media.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PDF Documents */}
          {pdfMedia.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-kifolio-text mb-3">Documents</h3>
              <div className="space-y-2">
                {pdfMedia.map((media) => (
                  <div
                    key={media.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-kifolio-text">
                          {media.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(media.fileSize)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={media.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-kifolio-cta hover:text-kifolio-cta/80 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievement Info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Created: {formatDate(achievement.createdAt)}</span>
              {achievement.updatedAt !== achievement.createdAt && (
                <span>Updated: {formatDate(achievement.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(achievement)}
              className="bg-kifolio-cta text-white px-6 py-2 rounded-lg font-semibold hover:bg-kifolio-cta/90 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 