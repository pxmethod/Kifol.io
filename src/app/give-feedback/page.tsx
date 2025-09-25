'use client';

import { useState, useEffect, useRef } from 'react';
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

const FEEDBACK_TYPES = [
  { id: 'Found a bug', name: 'Found a bug', description: 'Report an issue or bug you encountered' },
  { id: 'Request a feature', name: 'Request a feature', description: 'Suggest a new feature or improvement' },
  { id: 'Provide a suggestion', name: 'Provide a suggestion', description: 'Share your ideas and feedback' },
  { id: 'Contact', name: 'Contact', description: 'Get in touch with our team' }
];

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
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper functions for dropdown
  const getSelectedType = () => {
    return FEEDBACK_TYPES.find(type => type.id === formData.type);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Found a bug':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'Request a feature':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'Provide a suggestion':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'Contact':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  // Redirect unauthenticated users to marketing site
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };

    if (isTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTypeDropdownOpen]);

  // Pre-populate email when user loads
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email!
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | string, value?: string) => {
    if (typeof e === 'string') {
      // Direct value update (for dropdown)
      setFormData(prev => ({
        ...prev,
        [e]: value
      }));
    } else {
      // Event-based update (for inputs)
      const { name, value: eventValue } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: eventValue
      }));
    }
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
                <div className="form-field">
                  <label htmlFor="email" className="form-field__label form-field__label--required">
                    Your email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Feedback Type Dropdown */}
                <div className="form-field">
                  <label className="form-field__label form-field__label--required">
                    Type of feedback
                  </label>
                  <div className="type-dropdown relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-kifolio-cta input cursor-pointer ${
                        isTypeDropdownOpen ? 'ring-2 ring-kifolio-cta' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getTypeIcon(formData.type)}
                          <span className={`ml-2 ${formData.type ? 'text-kifolio-text' : 'text-gray-500'}`}>
                            {getSelectedType()?.name || 'Select a type...'}
                          </span>
                        </div>
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {isTypeDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        {FEEDBACK_TYPES.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              handleInputChange('type', type.id);
                              setIsTypeDropdownOpen(false);
                            }}
                            className="w-full px-3 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center"
                          >
                            <div className="flex items-center">
                              {getTypeIcon(type.id)}
                              <div className="ml-3">
                                <div className="text-base font-medium text-kifolio-text">{type.name}</div>
                                <div className="text-xs text-gray-500">{type.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback Message */}
                <div className="form-field">
                  <label htmlFor="message" className="form-field__label form-field__label--required">
                    Your feedback
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="input textarea"
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
