'use client';

import { useState, useEffect } from 'react';
import { FormFieldError } from '@/components/forms/FormFieldError';
import Link from 'next/link';
import Image from 'next/image';

type PageState = 'loading' | 'form' | 'success' | 'expired' | 'submitted' | 'invalid';

interface EndorsementInfo {
  status: string;
  instructorName?: string;
  achievementTitle?: string;
  relationship?: string;
  childName?: string;
  message?: string;
}

interface EndorseFormProps {
  token: string;
}

export default function EndorseForm({ token }: EndorseFormProps) {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [info, setInfo] = useState<EndorsementInfo | null>(null);
  const [formData, setFormData] = useState({ comment: '', instructorTitle: '', organization: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/endorsements/${token}`)
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
        if (data.status === 'pending') {
          setPageState('form');
        } else if (data.status === 'expired') {
          setPageState('expired');
        } else if (data.status === 'submitted') {
          setPageState('submitted');
        } else {
          setPageState('invalid');
        }
      })
      .catch(() => setPageState('invalid'));
  }, [token]);

  const isFormValid = formData.comment.trim() && formData.instructorTitle.trim() && formData.organization.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/endorsements/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          comment: formData.comment.trim(),
          instructorTitle: formData.instructorTitle.trim(),
          organization: formData.organization.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit');
        return;
      }

      setPageState('success');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-discovery-beige-200 flex items-center justify-center">
        <div className="text-discovery-grey">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      <header className="px-4 py-2">
        <div className="max-w-2xl mx-auto flex justify-center">
          <Link href="/" className="inline-flex items-center">
            <Image src="/kifolio_logo_dark.svg" alt="Kifolio" width={200} height={40} />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {pageState === 'form' && info && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-2xl font-semibold text-discovery-black mb-2">
              Kifolio - Endorsement Request
            </h1>
            <p className="text-discovery-grey mb-6">
              Hi {info.instructorName}, a parent has requested an endorsement from you. Please share a comment about the following achievement for <strong className="text-discovery-black font-semibold">{info.childName || 'this student'}</strong>:
            </p>
            <div className="bg-discovery-beige-100 rounded-lg p-4 mb-8">
              <p className="text-discovery-black font-medium">&ldquo;{info.achievementTitle}&rdquo;</p>
              {info.relationship && (
                <p className="text-sm text-discovery-grey mt-1">Relationship: {info.relationship}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-discovery-black mb-2">
                  Your comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="comment"
                  required
                  rows={5}
                  value={formData.comment}
                  onChange={(e) => setFormData((p) => ({ ...p, comment: e.target.value }))}
                  className="w-full px-4 py-3 border border-discovery-grey-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent"
                  placeholder="Share your perspective on this achievement..."
                />
              </div>

              <div>
                <label htmlFor="instructorTitle" className="block text-sm font-medium text-discovery-black mb-2">
                  Your title <span className="text-red-500">*</span>
                </label>
                <input
                  id="instructorTitle"
                  type="text"
                  required
                  value={formData.instructorTitle}
                  onChange={(e) => setFormData((p) => ({ ...p, instructorTitle: e.target.value }))}
                  className="w-full px-4 py-3 border border-discovery-grey-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent"
                  placeholder="e.g. Head Instructor, Coach"
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-discovery-black mb-2">
                  Organization <span className="text-red-500">*</span>
                </label>
                <input
                  id="organization"
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData((p) => ({ ...p, organization: e.target.value }))}
                  className="w-full px-4 py-3 border border-discovery-grey-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent"
                  placeholder="e.g. Atlanta BJJ"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="w-full py-4 bg-discovery-orange text-white font-semibold rounded-pill hover:bg-discovery-orange-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit endorsement'}
              </button>
              <FormFieldError message={error} placement="form-submit" />
            </form>
          </div>
        )}

        {pageState === 'success' && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-discovery-beige-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-discovery-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-discovery-black mb-2">Thank you!</h2>
            <p className="text-discovery-grey mb-6">
              Your endorsement has been submitted. The parent and student will appreciate your kind words.
            </p>
            <Link href="/" className="text-discovery-primary font-medium hover:underline">
              Return to Kifolio
            </Link>
          </div>
        )}

        {pageState === 'expired' && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-discovery-black mb-2">Link expired</h2>
            <p className="text-discovery-grey mb-6">
              This endorsement link has expired. Endorsement links are valid for 30 days.
            </p>
            <Link href="/" className="text-discovery-primary font-medium hover:underline">
              Return to Kifolio
            </Link>
          </div>
        )}

        {pageState === 'submitted' && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-discovery-black mb-2">Already submitted</h2>
            <p className="text-discovery-grey mb-6">
              You&apos;ve already submitted your endorsement for this achievement.
            </p>
            <Link href="/" className="text-discovery-primary font-medium hover:underline">
              Return to Kifolio
            </Link>
          </div>
        )}

        {pageState === 'invalid' && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-discovery-black mb-2">Invalid link</h2>
            <p className="text-discovery-grey mb-6">
              This endorsement link is invalid or may have been removed.
            </p>
            <Link href="/" className="text-discovery-primary font-medium hover:underline">
              Return to Kifolio
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
