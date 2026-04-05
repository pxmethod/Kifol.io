'use client';

import { useState } from 'react';
import { Achievement } from '@/types/achievement';

type SubmitOutcome = 'idle' | 'email' | 'copy_link' | 'skipped';

interface EndorsementRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: Achievement;
  /** Portfolio that owns the highlight; improves server-side highlight lookup after create/update. */
  portfolioId?: string;
  onSuccess?: () => void;
}

export default function EndorsementRequestModal({
  isOpen,
  onClose,
  achievement,
  portfolioId,
  onSuccess,
}: EndorsementRequestModalProps) {
  const [instructorName, setInstructorName] = useState('');
  const [instructorEmail, setInstructorEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState<SubmitOutcome>('idle');
  const [endorseUrl, setEndorseUrl] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructorName.trim() || !instructorEmail.trim() || !relationship.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch(`${base}/api/endorsements/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
          achievementId: achievement.id,
          ...(portfolioId ? { portfolioId } : {}),
          instructorName: instructorName.trim(),
          instructorEmail: instructorEmail.trim(),
          relationship: relationship.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send endorsement request');
        return;
      }

      if (!data.success) {
        setError(data.error || 'Failed to send endorsement request');
        return;
      }

      if (data.emailSent === true) {
        setOutcome('email');
      } else if (data.emailSkipped) {
        setOutcome('skipped');
        if (data.endorseUrl) setEndorseUrl(String(data.endorseUrl));
      } else {
        setOutcome('copy_link');
        if (data.endorseUrl) setEndorseUrl(String(data.endorseUrl));
      }
      onSuccess?.();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setInstructorName('');
    setInstructorEmail('');
    setRelationship('');
    setError('');
    setOutcome('idle');
    setEndorseUrl('');
    setCopyFeedback(false);
    onClose();
  };

  const handleCopyLink = async () => {
    if (!endorseUrl) return;
    try {
      await navigator.clipboard.writeText(endorseUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch {
      setCopyFeedback(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-discovery-black">
              Request instructor endorsement
            </h2>
            <button
              onClick={handleClose}
              className="text-discovery-grey hover:text-discovery-black p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {outcome !== 'idle' ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-discovery-beige-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-discovery-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-discovery-black font-medium mb-1">
                {outcome === 'email' ? 'Request sent!' : 'Request saved'}
              </p>
              {outcome === 'email' ? (
                <p className="text-discovery-grey text-sm mb-4">
                  The instructor will receive an email to leave an endorsement about &ldquo;{achievement.title}&rdquo;.
                </p>
              ) : outcome === 'skipped' ? (
                <p className="text-discovery-grey text-sm mb-4 text-left">
                  Email sending is turned off in this environment. Copy the link below and share it with your instructor
                  so they can leave an endorsement about &ldquo;{achievement.title}&rdquo;.
                </p>
              ) : (
                <p className="text-discovery-grey text-sm mb-4 text-left">
                  We couldn&apos;t send the invitation email (check that MailerSend is configured with{' '}
                  <code className="rounded bg-discovery-beige-100 px-1 text-xs">MAILERSEND_API_KEY</code>). Your request
                  is saved—copy the link below and send it to your instructor.
                </p>
              )}
              {(outcome === 'copy_link' || outcome === 'skipped') && endorseUrl ? (
                <div className="mb-4 space-y-2 text-left">
                  <p className="text-xs text-discovery-grey break-all rounded-lg bg-discovery-beige-100 p-2 font-mono">
                    {endorseUrl}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full rounded-pill border border-discovery-beige-300 px-4 py-2 text-sm font-medium text-discovery-black hover:bg-discovery-beige-100"
                  >
                    {copyFeedback ? 'Copied!' : 'Copy invitation link'}
                  </button>
                </div>
              ) : null}
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-discovery-orange rounded-pill text-white font-medium hover:bg-discovery-orange-light"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <p className="text-discovery-grey text-sm mb-4">
                Invite an instructor or teacher to leave a comment about &ldquo;{achievement.title}&rdquo;.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="modal-instructorName" className="block text-sm font-medium text-discovery-black mb-1">
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    id="modal-instructorName"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    placeholder="e.g. Coach Mike Reynolds"
                    className="w-full px-4 py-3 border border-discovery-grey-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent text-discovery-black"
                  />
                </div>
                <div>
                  <label htmlFor="modal-instructorEmail" className="block text-sm font-medium text-discovery-black mb-1">
                    Instructor email
                  </label>
                  <input
                    type="email"
                    id="modal-instructorEmail"
                    value={instructorEmail}
                    onChange={(e) => setInstructorEmail(e.target.value)}
                    placeholder="e.g. coach@example.com"
                    className="w-full px-4 py-3 border border-discovery-grey-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent text-discovery-black"
                  />
                </div>
                <div>
                  <label htmlFor="modal-relationship" className="block text-sm font-medium text-discovery-black mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    id="modal-relationship"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="e.g. BJJ Instructor, Piano Teacher"
                    className="w-full px-4 py-3 border border-discovery-grey-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent text-discovery-black"
                  />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 border border-discovery-beige-300 px-6 py-3 text-discovery-black rounded-pill font-medium transition-colors hover:bg-discovery-beige-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !instructorName.trim() || !instructorEmail.trim() || !relationship.trim()}
                    className="flex-1 py-3 bg-discovery-orange text-white rounded-pill font-medium hover:bg-discovery-orange-light disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send request'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
