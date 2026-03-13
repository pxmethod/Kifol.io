'use client';

import { CircleStar } from 'lucide-react';
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
}

export default function EndorsementBlock({
  endorsements,
  textColor = '#1f2937',
  secondaryColor = '#6b7280',
  fontFamily = 'inherit',
  compact = false,
  publicVariant = false,
}: EndorsementBlockProps) {
  if (!endorsements?.length) return null;

  const formatCredentials = (e: EndorsementDisplay) => {
    const parts: string[] = [];
    if (e.instructorTitle) parts.push(e.instructorTitle);
    if (e.organization) parts.push(`at ${e.organization}`);
    return parts.length > 0 ? ` (${parts.join(' ')})` : '';
  };

  if (compact) {
    const containerClass = publicVariant
      ? 'mt-3 p-4 rounded-xl'
      : 'mt-3 p-4 rounded-xl bg-gray-100';
    const containerStyle = publicVariant
      ? { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
      : undefined;

    return (
      <div className={containerClass} style={containerStyle}>
        <div className="flex items-center gap-2 mb-2">
          <CircleStar className="w-4 h-4 text-discovery-orange flex-shrink-0" />
          <span className="text-sm font-medium" style={{ color: textColor, fontFamily }}>
            Instructor endorsement{endorsements.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="space-y-2">
          {endorsements.slice(0, 2).map((e) => (
            <div key={e.id} className="text-sm">
              <p className="font-medium" style={{ color: textColor, fontFamily }}>
                {e.instructorName}{formatCredentials(e)}
              </p>
              <p className="line-clamp-2" style={{ color: secondaryColor, fontFamily }}>
                {formatTextWithLinks(e.comment, secondaryColor)}
              </p>
            </div>
          ))}
          {endorsements.length > 2 && (
            <p className="text-xs" style={{ color: secondaryColor, fontFamily }}>
              +{endorsements.length - 2} more
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
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
            className="pl-6 border-l-2 border-discovery-orange/30 py-1"
            style={{ fontFamily }}
          >
            <p className="font-medium text-sm mb-1" style={{ color: textColor }}>
              {e.instructorName}{formatCredentials(e)}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: secondaryColor }}>
              {formatTextWithLinks(e.comment, secondaryColor)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
