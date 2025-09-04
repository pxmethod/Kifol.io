'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';

interface FeedbackFormData {
  email: string;
  type: string;
  message: string;
}

export default function GiveFeedbackPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<FeedbackFormData>({
    email: '',
    type: 'Found a bug',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Redirect unauthenticated users to marketing site
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Pre-populate email when user loads
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email!
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      setToastMessage('Please enter your feedback message.');
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log('Feedback API response:', result);

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        console.error('Feedback API error:', result);
        setToastMessage(`Failed to send feedback: ${result.error || 'Unknown error'}`);
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      setToastMessage('Failed to send feedback. Please try again.');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header animateLogo={true} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" label="Loading..." />
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-kifolio-bg">
      <Header animateLogo={true} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-kifolio-text mb-4">
              Give Feedback
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Help us improve Kifolio by sharing your thoughts, suggestions, or reporting any issues you've encountered.
            </p>
          </div>

          {/* Feedback Form or Confirmation */}
          {!isSubmitted ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kifolio-primary focus:border-kifolio-primary transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Feedback Type Dropdown */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Feedback
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kifolio-primary focus:border-kifolio-primary transition-colors"
                  >
                    <option value="Found a bug">Found a bug</option>
                    <option value="Request a feature">Request a feature</option>
                    <option value="Provide a suggestion">Provide a suggestion</option>
                    <option value="Contact">Contact</option>
                  </select>
                </div>

                {/* Feedback Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kifolio-primary focus:border-kifolio-primary transition-colors resize-vertical"
                    placeholder="Please share your feedback, suggestions, or describe any issues you've encountered..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-kifolio-cta hover:bg-kifolio-cta/90'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2" label="" />
                        Sending...
                      </div>
                    ) : (
                      'Send Feedback'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Confirmation Message */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-kifolio-text mb-4">
                  Thank You!
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Your feedback really matters, so thank you! If necessary, we'll be in touch.
                </p>
              </div>
              
              <button
                onClick={handleGoHome}
                className="px-8 py-3 bg-kifolio-cta text-white rounded-lg font-semibold hover:bg-kifolio-cta/90 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onDismiss={() => setShowToast(false)}
      />
    </div>
  );
}
