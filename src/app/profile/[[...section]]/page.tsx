'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';
import { userService } from '@/lib/database';
import { getAppUrl } from '@/config/domains';

interface ProfileData {
  email: string;
  password?: string;
}

interface NotificationPreferences {
  kifolioCommunications: boolean;
  accountActivity: boolean;
}

interface InvitationData {
  email: string;
}

const navigationItems = [
  { id: 'general', label: 'General', path: '/profile' },
  { id: 'password', label: 'Password', path: '/profile/password' },
  { id: 'email-notifications', label: 'Email notifications', path: '/profile/email-notifications' },
  { id: 'invitations', label: 'Invitations', path: '/profile/invitations' },
  { id: 'delete-account', label: 'Delete account', path: '/profile/delete-account' }
];

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    email: user?.email || '',
  });
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    kifolioCommunications: true,
    accountActivity: true
  });
  const [originalNotificationPreferences, setOriginalNotificationPreferences] = useState<NotificationPreferences>({
    kifolioCommunications: true,
    accountActivity: true
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [invitationData, setInvitationData] = useState<InvitationData>({ email: '' });
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine current section from URL
  const currentSection = Array.isArray(params.section) && params.section.length > 0 
    ? params.section[0] 
    : 'general';

  useEffect(() => {
    setFormData({ email: profileData.email, password: '' });
  }, [profileData]);


  useEffect(() => {
    setHasChanges(formData.email !== profileData.email || formData.password !== '');
  }, [formData, profileData]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?message=Please log in to access your profile');
    }
  }, [user, loading, router]);


  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-discovery-beige-200 flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          label="Loading..." 
        />
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handleSaveChanges = async () => {
    // Simulate API call
    setProfileData(prev => ({ ...prev, email: formData.email }));
    setHasChanges(false);
    setToastMessage('Profile updated successfully!');
    setShowToast(true);
  };

  const handlePasswordChange = async () => {
    // Validate password
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    setPasswordError('');
    
    // Simulate API call for password change
    setProfileData(prev => ({ ...prev, password: formData.password }));
    setFormData(prev => ({ ...prev, password: '' }));
    setHasChanges(false);
    setToastMessage('Password has successfully been changed!');
    setShowToast(true);
  };

  const handleSaveNotificationPreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call for saving notification preferences
    // In a real app, this would save to the backend
    
    setOriginalNotificationPreferences(notificationPreferences);
    setToastMessage('Notification preferences updated successfully!');
    setShowToast(true);
  };

  const hasNotificationChanges = () => {
    return (
      notificationPreferences.kifolioCommunications !== originalNotificationPreferences.kifolioCommunications ||
      notificationPreferences.accountActivity !== originalNotificationPreferences.accountActivity
    );
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitationData.email.trim()) {
      return;
    }

    setIsSendingInvite(true);
    
    try {
      // Send invitation email using our email service
      const emailResponse = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'invitation',
          data: {
            to: invitationData.email,
            inviterName: formData.email.split('@')[0] || 'A Kifolio user', // Use current user's name
            inviteeEmail: invitationData.email,
            inviteUrl: `${getAppUrl()}/auth/signup?invited=true`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            personalMessage: 'I think you\'d love using Kifolio to showcase your achievements!',
            subject: 'You\'re invited to join Kifolio!'
          }
        }),
      });

      if (emailResponse.ok) {
        // Show success message
        setToastMessage(`Invitation sent successfully to ${invitationData.email}!`);
        setShowToast(true);
        
        // Reset form
        setInvitationData({ email: '' });
      } else {
        throw new Error('Failed to send invitation email');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      setToastMessage('Failed to send invitation. Please try again.');
      setShowToast(true);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleNavigation = (path: string) => {
    // Clear password field when navigating away from password section
    if (currentSection === 'password') {
      setFormData(prev => ({ ...prev, password: '' }));
      setPasswordError('');
    }
    router.push(path);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };


  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      await userService.deleteAccount();
      
      // Show success message and redirect to marketing site
      setToastMessage('Account deleted successfully. You have been signed out.');
      setShowToast(true);
      
      // Redirect to marketing site after a brief delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setToastMessage('Failed to delete account. Please try again.');
      setShowToast(true);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };


  const getCurrentSectionLabel = () => {
    const currentItem = navigationItems.find(item => 
      (item.id === 'general' && currentSection === 'general') || item.id === currentSection
    );
    return currentItem?.label || 'General';
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'general':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-medium text-discovery-black mb-2">My profile</h2>
              <p className="text-discovery-grey">Update your email and manage your account</p>
            </div>

            {/* Account Email Section */}
            <div className="form-field">
              <label htmlFor="email" className="block text-sm font-medium text-discovery-black mb-1">
                Account email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-discovery-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent text-discovery-black"
                placeholder="Enter your email address"
              />
            </div>


            {/* Save Button */}
              <div className="form-actions">
                <button
                  onClick={handleSaveChanges}
                  className="bg-discovery-orange text-white px-6 py-3 rounded-pill font-semibold hover:bg-discovery-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!hasChanges}
                >
                  Save changes
                </button>
              </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-medium text-discovery-black mb-2">Password</h2>
              <p className="text-discovery-grey">Manage your password</p>
            </div>

            {/* Password Section */}
            <div className="form-field">
              <label htmlFor="password" className="block text-sm font-medium text-discovery-black mb-1">
                New password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, password: e.target.value }));
                  if (passwordError) setPasswordError('');
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent text-discovery-black ${passwordError ? 'border-red-500 ring-2 ring-red-200' : 'border-discovery-grey-300'}`}
                placeholder="Enter new password"
              />
              {passwordError && (
                <p className="text-sm text-red-600 mt-1">{passwordError}</p>
              )}
              <p className="text-sm text-discovery-grey mt-1">Minimum 6 characters required</p>
            </div>

            {/* Change Password Button */}
              <div className="form-actions">
                <button
                  onClick={handlePasswordChange}
                  className="bg-discovery-orange text-white px-6 py-3 rounded-pill font-semibold hover:bg-discovery-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.password}
                >
                  Change password
                </button>
              </div>
          </div>
        );

      case 'email-notifications':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-medium text-discovery-black mb-2">Email notifications</h2>
              <p className="text-discovery-grey">Manage your email notification preferences</p>
            </div>

            {/* Email Notifications Form */}
            <form onSubmit={handleSaveNotificationPreferences} className="space-y-8">
              {/* Alerts & Notifications Section */}
              <div>
                <h3 className="text-lg font-medium text-discovery-black mb-4">Send me:</h3>
                <div className="space-y-4">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      className="checkbox__input"
                      checked={notificationPreferences.kifolioCommunications}
                      onChange={(e) => setNotificationPreferences(prev => ({
                        ...prev,
                        kifolioCommunications: e.target.checked
                      }))}
                    />
                    <span className="checkbox__label">Kifolio communications</span>
                  </label>
                  
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      className="checkbox__input"
                      checked={notificationPreferences.accountActivity}
                      onChange={(e) => setNotificationPreferences(prev => ({
                        ...prev,
                        accountActivity: e.target.checked
                      }))}
                    />
                    <span className="checkbox__label">Account activity</span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="bg-discovery-orange text-white px-6 py-3 rounded-pill font-semibold hover:bg-discovery-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!hasNotificationChanges()}
                >
                  Save preferences
                </button>
              </div>
            </form>
          </div>
        );

      case 'invitations':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-medium text-discovery-black mb-2">Invitations</h2>
              <p className="text-discovery-grey">Know someone else who&apos;d like to use Kifolio? Send them an invite.</p>
            </div>

            {/* Invitation Form */}
            <form onSubmit={handleSendInvite} className="space-y-6">
              <div className="form-field">
                <label htmlFor="invite-email" className="block text-sm font-medium text-discovery-black mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="invite-email"
                  value={invitationData.email}
                  onChange={(e) => setInvitationData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-discovery-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent text-discovery-black"
                  placeholder="Enter email address to invite"
                  required
                />
              </div>

              {/* Send Invite Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="bg-discovery-orange text-white px-6 py-3 rounded-pill font-semibold hover:bg-discovery-orange-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!invitationData.email.trim() || isSendingInvite}
                >
                  {isSendingInvite ? 'Sending...' : 'Send invite'}
                </button>
              </div>
            </form>
          </div>
        );


      case 'delete-account':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-medium text-discovery-black mb-2">Delete account</h2>
              <p className="text-discovery-grey">We're sorry to see you go, but we understand. Please note that this action cannot be undone and by deleting your account, you will lose all your portfolios, achievements, and data.</p>
            </div>

            {/* Subtext with Links */}
            <div className="space-y-4">
              <p className="text-discovery-grey">
                Before you go, consider{' '}
                <Link href="/give-feedback" className="text-discovery-primary hover:underline">submitting feedback</Link>
                {' '}or{' '}
                <a href="mailto:john@kifol.io" className="text-discovery-primary hover:underline">contacting support</a>
                {' '}if you&apos;re experiencing issues.
              </p>
            </div>

            {/* Delete Button */}
            <div className="form-actions">
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-pill font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete my account'}
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-discovery-grey">
            Section not found
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      <Header />
      
      {/* Mobile Navigation Dropdown */}
      <div className="mobile-nav lg:hidden">
        <div className="mobile-nav__dropdown" ref={dropdownRef}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-nav__trigger"
          >
            <span>{getCurrentSectionLabel()}</span>
            <svg 
              className={`mobile-nav__chevron ${isMobileMenuOpen ? 'mobile-nav__chevron--open' : ''}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="mobile-nav__menu">
              {navigationItems.map((item) => {
                const isActive = (item.id === 'general' && currentSection === 'general') || 
                                item.id === currentSection;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`mobile-nav__item ${
                      isActive
                        ? 'mobile-nav__item--active'
                        : item.id === 'delete-account'
                        ? 'mobile-nav__item--danger'
                        : ''
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar Navigation */}
        <div className="sidebar hidden lg:block">
          <nav className="sidebar__nav">
            <ul className="sidebar__list">
              {navigationItems.map((item) => {
                const isActive = (item.id === 'general' && currentSection === 'general') || 
                                item.id === currentSection;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`sidebar__item ${
                        isActive
                          ? 'sidebar__item--active'
                          : item.id === 'delete-account'
                          ? 'sidebar__item--danger'
                          : ''
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 main-content-with-sidebar">
          {/* Action Bar */}
          <div className="bg-discovery-white-100 border-b border-discovery-beige-100 px-4 lg:px-9 py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-discovery-grey hover:text-discovery-black transition-colors font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to my dashboard
              </button>
            </div>
          </div>

          <div className="p-4 lg:p-8">
            <div className="max-w-4xl mx-auto lg:mx-0">
              <div className="bg-discovery-white-100 rounded-lg shadow-md p-6 lg:p-8">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        variant="success"
        isVisible={showToast}
        onDismiss={() => setShowToast(false)}
      />


      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-discovery-white-100 rounded-lg max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-red-600">Delete account</h2>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="text-discovery-grey hover:text-discovery-black transition-colors"
                disabled={isDeleting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-center text-discovery-black mb-2">
                Are you absolutely sure?
              </h3>
              <p className="text-discovery-grey text-center mb-4">
                This action cannot be undone. This will permanently delete your account and remove all your portfolios, achievements, and data from our servers.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ This will delete:
                </p>
                <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                  <li>All your portfolios</li>
                  <li>All achievements and photos</li>
                  <li>Your account settings</li>
                  <li>All associated data</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 bg-discovery-beige-100 text-discovery-black py-3 px-6 rounded-pill font-semibold hover:bg-discovery-beige-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-pill font-semibold hover:bg-red-700 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
