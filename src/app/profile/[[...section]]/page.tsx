'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';
import { userService } from '@/lib/database';
import { useSubscription } from '@/hooks/useSubscription';
import PricingModal from '@/components/PricingModal';

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
  { id: 'billing', label: 'Plan & Billing', path: '/profile/billing' },
  { id: 'password', label: 'Password', path: '/profile/password' },
  { id: 'email-notifications', label: 'Email Notifications', path: '/profile/email-notifications' },
  { id: 'invitations', label: 'Invitations', path: '/profile/invitations' },
  { id: 'delete-account', label: 'Delete Account', path: '/profile/delete-account' }
];

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { subscription, loading: subscriptionLoading, startTrial, refresh } = useSubscription();
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
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);

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

  // Show loading while checking authentication or subscription data
  if (loading || (currentSection === 'billing' && subscriptionLoading)) {
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

  const handleStartTrial = async () => {
    if (!user) return;
    
    setIsStartingTrial(true);
    setTrialError(null);
    
    try {
      const result = await startTrial();
      if (result.success) {
        // Refresh subscription data
        await refresh();
        setToastMessage('Trial started successfully!');
        setShowToast(true);
      } else {
        setTrialError(result.error || 'Failed to start trial');
      }
    } catch (error) {
      setTrialError('An unexpected error occurred');
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handleUpgrade = () => {
    setShowPricingModal(true);
  };

  const handleDowngrade = async () => {
    if (!user) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({
          subscription_plan: 'free',
          subscription_status: 'active',
          trial_started_at: null,
          trial_ends_at: null,
          subscription_ends_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error downgrading:', error);
        setToastMessage('Failed to downgrade. Please try again.');
        setShowToast(true);
      } else {
        await refresh();
        setToastMessage('Successfully downgraded to free plan!');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error downgrading:', error);
      setToastMessage('Failed to downgrade. Please try again.');
      setShowToast(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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

      case 'billing':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-kifolio-text mb-2">Plan & Billing</h2>
              <p className="text-gray-600">Manage your subscription and billing preferences</p>
            </div>

            {/* Current Plan Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-kifolio-text">
                    Current Plan
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscription?.plan === 'free' 
                        ? 'bg-gray-100 text-gray-800' 
                        : subscription?.plan === 'trial'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {subscription?.plan === 'free' ? 'Free Plan' : 
                       subscription?.plan === 'trial' ? 'Premium Trial' : 
                       'Kifolio Premium'}
                    </span>
                    {subscription?.isTrialActive && subscription?.trialEndsAt && (
                      <span className="text-sm text-orange-600 font-medium">
                        {getDaysRemaining(subscription.trialEndsAt)} days remaining
                      </span>
                    )}
                  </div>
                </div>
                {subscription?.plan === 'free' && (
                  <button
                    onClick={handleStartTrial}
                    disabled={isStartingTrial}
                    className="btn btn--primary"
                  >
                    {isStartingTrial ? 'Starting Trial...' : 'Start 14-Day Free Trial'}
                  </button>
                )}
                {(subscription?.plan === 'trial' || subscription?.plan === 'premium') && (
                  <button
                    onClick={handleDowngrade}
                    className="btn btn--secondary"
                  >
                    Downgrade to Free
                  </button>
                )}
              </div>

              {trialError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm">{trialError}</p>
                </div>
              )}

              {/* Plan Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {subscription?.limits.maxPortfolios === -1 ? 'Unlimited' : subscription?.limits.maxPortfolios} portfolios
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {subscription?.limits.maxHighlightsPerPortfolio === -1 ? 'Unlimited' : subscription?.limits.maxHighlightsPerPortfolio} highlights per portfolio
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {subscription?.limits.allowedMediaTypes.length === 3 ? 'Photos only' : 'All media types'}
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {subscription?.limits.canExportPDF ? 'PDF export' : 'Public sharing only'}
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {subscription?.limits.supportLevel === 'priority' ? 'Priority support' : 'Email support'}
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Usage:</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Portfolios</span>
                        <span className="font-medium">
                          {subscription?.plan === 'free' ? '1/1' : 'Unlimited'}
                        </span>
                      </div>
                      {subscription?.plan === 'free' && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-kifolio-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Highlights per portfolio</span>
                        <span className="font-medium">
                          {subscription?.plan === 'free' ? '0/10' : 'Unlimited'}
                        </span>
                      </div>
                      {subscription?.plan === 'free' && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-kifolio-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trial Information */}
            {subscription?.isTrialActive && subscription?.trialEndsAt && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-orange-800 mb-2">
                      Premium Trial Active
                    </h3>
                    <p className="text-orange-700 mb-4">
                      Your trial ends on {formatDate(subscription.trialEndsAt)}. 
                      Upgrade to Premium to continue enjoying unlimited features.
                    </p>
                    <button
                      onClick={handleUpgrade}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Card for Free Users */}
            {subscription?.plan === 'free' && (
              <div className="bg-gradient-to-r from-kifolio-primary to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Ready to unlock Premium features?
                    </h3>
                    <p className="text-orange-100 mb-4">
                      Get unlimited portfolios, highlights, advanced media support, and more.
                    </p>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleStartTrial}
                        disabled={isStartingTrial}
                        className="bg-white text-kifolio-primary px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        {isStartingTrial ? 'Starting...' : 'Start Free Trial'}
                      </button>
                      <button
                        onClick={handleUpgrade}
                        className="border border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-kifolio-primary transition-colors"
                      >
                        View Pricing
                      </button>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-right">
                      <div className="text-3xl font-bold">$8.99</div>
                      <div className="text-orange-100">per month</div>
                      <div className="text-xs text-orange-200 mt-1">$81/year <div className="line-through">$108.00</div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Information (for future implementation) */}
            {subscription?.plan === 'premium' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-kifolio-text mb-4">
                  Billing Information
                </h3>
                <p className="text-gray-600">
                  Billing management will be available soon. For now, please contact support for any billing questions.
                </p>
              </div>
            )}
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
                  onClick={() => router.push('/dashboard')}
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
            <div className="max-w-4xl mx-auto lg:mx-0">
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

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
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
