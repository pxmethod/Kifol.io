'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';
import { userService } from '@/lib/database';

interface ProfileData {
  email: string;
  googleConnected: boolean;
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
  { id: 'email-notifications', label: 'Email Notifications', path: '/profile/email-notifications' },
  { id: 'invitations', label: 'Invitations', path: '/profile/invitations' },
  { id: 'delete-account', label: 'Delete Account', path: '/profile/delete-account' }
];

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    email: user?.email || '',
    googleConnected: user?.app_metadata?.provider === 'google' || false,
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

  // Update Google connection status when user changes
  useEffect(() => {
    if (user) {
      const hasGoogleIdentity = user.identities?.some(identity => identity.provider === 'google') || false;
      setProfileData(prev => ({
        ...prev,
        email: user.email || '',
        googleConnected: hasGoogleIdentity
      }));
    }
  }, [user]);

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
      <div className="min-h-screen bg-kifolio-bg flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading..." />
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
            inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/signup?invited=true`,
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

  const handleGoogleConnect = async () => {
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setToastMessage('Failed to connect Google account. Please try again.');
        setShowToast(true);
      } else {
        // The OAuth flow will redirect, so we don't need to handle success here
        // The user will be redirected back after OAuth completion
      }
    } catch (error) {
      console.error('Error connecting Google account:', error);
      setToastMessage('Failed to connect Google account. Please try again.');
      setShowToast(true);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      // Unlink the Google provider
      const { error } = await supabase.auth.unlinkIdentity({
        identity_id: user?.identities?.find(identity => identity.provider === 'google')?.id || ''
      });

      if (error) {
        setToastMessage('Failed to disconnect Google account. Please try again.');
        setShowToast(true);
      } else {
        // Update local state
        setProfileData(prev => ({ ...prev, googleConnected: false }));
        setToastMessage('Google account disconnected successfully!');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error disconnecting Google account:', error);
      setToastMessage('Failed to disconnect Google account. Please try again.');
      setShowToast(true);
    }
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
              <h2 className="text-2xl font-bold text-kifolio-text mb-2">My Profile</h2>
              <p className="text-gray-600">Update your email and manage your account</p>
            </div>

            {/* Account Email Section */}
            <div className="form-field">
              <label htmlFor="email" className="form-field__label">
                Account Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input"
                placeholder="Enter your email address"
              />
            </div>

            {/* Google Sign-In Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-kifolio-text mb-4">Google Sign-In</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-gray-700">Google</span>
                    {profileData.googleConnected ? (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm text-green-600 font-medium">Connected</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not connected</span>
                    )}
                  </div>
                  
                  {profileData.googleConnected ? (
                    <button
                      type="button"
                      onClick={handleGoogleDisconnect}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGoogleConnect}
                      className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
                
                {profileData.googleConnected && (
                  <p className="text-sm text-gray-600 mt-2">
                    Your account is connected to Google. You can sign in using your Google account.
                  </p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="form-actions">
              <button
                onClick={handleSaveChanges}
                className="btn btn--primary"
                disabled={!hasChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-kifolio-text mb-2">Password</h2>
              <p className="text-gray-600">Manage your password</p>
            </div>

            {/* Password Section */}
            <div className="form-field">
              <label htmlFor="password" className="form-field__label">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, password: e.target.value }));
                  if (passwordError) setPasswordError('');
                }}
                className={`input ${passwordError ? 'input--error' : ''}`}
                placeholder="Enter new password"
              />
              {passwordError && (
                <p className="form-field__error">{passwordError}</p>
              )}
              <p className="form-field__help">Minimum 6 characters required</p>
            </div>

            {/* Change Password Button */}
            <div className="form-actions">
              <button
                onClick={handlePasswordChange}
                className="btn btn--primary"
                disabled={!formData.password}
              >
                Change Password
              </button>
            </div>
          </div>
        );

      case 'email-notifications':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-kifolio-text mb-2">Email Notifications</h2>
              <p className="text-gray-600">Manage your email notification preferences</p>
            </div>

            {/* Email Notifications Form */}
            <form onSubmit={handleSaveNotificationPreferences} className="space-y-8">
              {/* Alerts & Notifications Section */}
              <div>
                <h3 className="text-lg font-semibold text-kifolio-text mb-4">Send me:</h3>
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
                  className="btn btn--primary"
                  disabled={!hasNotificationChanges()}
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        );

      case 'invitations':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-kifolio-text mb-2">Invitations</h2>
              <p className="text-gray-600">Know someone else who&apos;d like to use Kifolio? Send them an invite.</p>
            </div>

            {/* Invitation Form */}
            <form onSubmit={handleSendInvite} className="space-y-6">
              <div className="form-field">
                <label htmlFor="invite-email" className="form-field__label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="invite-email"
                  value={invitationData.email}
                  onChange={(e) => setInvitationData(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="Enter email address to invite"
                  required
                />
              </div>

              {/* Send Invite Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={!invitationData.email.trim() || isSendingInvite}
                >
                  {isSendingInvite ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'delete-account':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-kifolio-text mb-2">Delete Account</h2>
              <p className="text-gray-600">This action cannot be undone</p>
            </div>

            {/* Subtext with Links */}
            <div className="space-y-4">
              <p className="text-gray-600">
                Before you go, consider{' '}
                <a href="#" className="text-primary hover:underline">submitting feedback</a>
                {' '}or{' '}
                <a href="#" className="text-primary hover:underline">contacting support</a>
                {' '}if you&apos;re experiencing issues.
              </p>
              <p className="text-gray-600">
                Need help?{' '}
                <a href="#" className="text-primary hover:underline">Visit our help center</a>
                {' '}or{' '}
                <a href="#" className="text-primary hover:underline">contact our team</a>.
              </p>
            </div>

            {/* Delete Button */}
            <div className="form-actions">
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="btn btn--danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete my account'}
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500">
            Section not found
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-kifolio-bg">
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
          <div className="action-bar">
            <div className="action-bar__container">
              <div className="action-bar__left">
                <button
                  onClick={() => router.push('/')}
                  className="btn--back"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to my dashboard
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-8">
            <div className="max-w-2xl mx-auto lg:mx-0">
              {renderContent()}
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
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-red-600">Delete Account</h2>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="text-gray-500 hover:text-gray-700"
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
              <h3 className="text-lg font-semibold text-center text-kifolio-text mb-2">
                Are you absolutely sure?
              </h3>
              <p className="text-gray-600 text-center mb-4">
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
                className="flex-1 bg-gray-100 text-kifolio-text py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
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
