'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CircleStar, Trash2 } from 'lucide-react';
import { formatTextWithLinks } from '@/utils/text-formatting';

export interface EndorsementDisplay {
  id: string;
  instructorName: string;
  instructorTitle: string | null;
  organization: string | null;
  comment: string;
  submittedAt: string | null;
}

interface EndorsementBlockProps {
  endorsements: EndorsementDisplay[];
  /** Optional: use template config colors for public portfolio */
  textColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  /** Compact mode for cards (single line preview) vs full in modal */
  compact?: boolean;
  /** Public variant: opaque white background, 12px radius, no top border */
  publicVariant?: boolean;
  /** When provided, shows trash icon to remove endorsements (parent view only) */
  onRemove?: (endorsementId: string) => void | Promise<void>;
}

export default function EndorsementBlock({
  endorsements,
  textColor = '#1f2937',
  secondaryColor = '#6b7280',
  fontFamily = 'inherit',
  compact = false,
  publicVariant = false,
  onRemove,
}: EndorsementBlockProps) {
  const [endorsementToRemove, setEndorsementToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  if (!endorsements?.length) return null;

  const formatCredentials = (e: EndorsementDisplay) => {
    const parts: string[] = [];
    if (e.instructorTitle) parts.push(e.instructorTitle);
    if (e.organization) parts.push(`at ${e.organization}`);
    return parts.length > 0 ? ` (${parts.join(' ')})` : '';
  };

  const handleConfirmRemove = async () => {
    if (!endorsementToRemove || !onRemove) return;
    setIsRemoving(true);
    try {
      await onRemove(endorsementToRemove);
      setEndorsementToRemove(null);
    } catch {
      // Parent handles error display (e.g. toast)
    } finally {
      setIsRemoving(false);
    }
  };

  const canRemove = !!onRemove;

  const RemoveButton = ({ endorsementId }: { endorsementId: string }) =>
    canRemove ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setEndorsementToRemove(endorsementId);
        }}
        className="flex-shrink-0 p-1.5 text-discovery-grey hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove endorsement"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    ) : null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const RemoveModal = () => {
    if (!endorsementToRemove || !mounted) return null;
    const modal = (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-discovery-white-100 rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-red-600">Remove endorsement</h2>
            <button
              onClick={() => setEndorsementToRemove(null)}
              className="text-discovery-grey hover:text-discovery-black transition-colors"
              disabled={isRemoving}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-6">
            <p className="text-discovery-grey">
              Are you sure that you want to remove this endorsement? This action can&apos;t be reversed.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setEndorsementToRemove(null)}
              className="flex-1 bg-discovery-beige-100 text-discovery-black py-2 px-4 rounded-lg font-semibold hover:bg-discovery-beige-200 transition-colors"
              disabled={isRemoving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemove}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Yes, remove'}
            </button>
          </div>
        </div>
      </div>
    );
    return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
  };

  if (compact) {
    const containerClass = publicVariant
      ? 'mt-3 p-4 rounded-xl'
      : 'mt-3 p-4 rounded-xl bg-gray-100';
    const containerStyle = publicVariant
      ? { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
      : undefined;

    return (
      <>
        <div className={containerClass} style={containerStyle}>
          <div className="flex items-center gap-2 mb-2">
            <CircleStar className="w-4 h-4 text-discovery-orange flex-shrink-0" />
            <span className="text-sm font-medium" style={{ color: textColor, fontFamily }}>
              Instructor endorsement{endorsements.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {endorsements.slice(0, 2).map((e) => (
              <div key={e.id} className="flex items-start justify-between gap-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium" style={{ color: textColor, fontFamily }}>
                    {e.instructorName}{formatCredentials(e)}
                  </p>
                  <p className="line-clamp-2" style={{ color: secondaryColor, fontFamily }}>
                    {formatTextWithLinks(e.comment, secondaryColor)}
                  </p>
                </div>
                <RemoveButton endorsementId={e.id} />
              </div>
            ))}
            {endorsements.length > 2 && (
              <p className="text-xs" style={{ color: secondaryColor, fontFamily }}>
                +{endorsements.length - 2} more
              </p>
            )}
          </div>
        </div>
        <RemoveModal />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CircleStar className="w-4 h-4 text-discovery-orange flex-shrink-0" />
          <h3 className="text-sm font-medium" style={{ color: textColor, fontFamily }}>
            Instructor endorsement{endorsements.length > 1 ? 's' : ''}
          </h3>
        </div>
        <div className="space-y-4">
          {endorsements.map((e) => (
            <div
              key={e.id}
              className="flex items-start justify-between gap-2 pl-6 border-l-2 border-discovery-orange/30 py-1"
              style={{ fontFamily }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm mb-1" style={{ color: textColor }}>
                  {e.instructorName}{formatCredentials(e)}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: secondaryColor }}>
                  {formatTextWithLinks(e.comment, secondaryColor)}
                </p>
              </div>
              <RemoveButton endorsementId={e.id} />
            </div>
          ))}
        </div>
      </div>
      <RemoveModal />
    </>
  );
}
