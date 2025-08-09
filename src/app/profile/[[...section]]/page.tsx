'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Toast from '@/components/Toast';

interface ProfileData {
  email: string;
  googleConnected: boolean;
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    email: 'jn.amenard@gmail.com',
    googleConnected: true
  });
  const [formData, setFormData] = useState({ email: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine current section from URL
  const currentSection = Array.isArray(params.section) && params.section.length > 0 
    ? params.section[0] 
    : 'general';

  useEffect(() => {
    setFormData({ email: profileData.email });
  }, [profileData]);

  useEffect(() => {
    setHasChanges(formData.email !== profileData.email);
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

  const handleSaveChanges = async () => {
    // Simulate API call
    setProfileData(prev => ({ ...prev, email: formData.email }));
    setHasChanges(false);
    setToastMessage('Profile updated successfully!');
    setShowToast(true);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
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
              <p className="text-gray-600">Update your username and manage your account</p>
            </div>

            {/* Account Email Section */}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-kifolio-text mb-2">
                  Account Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kifolio-cta focus:border-transparent transition-colors"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Google Sign-In Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-kifolio-text mb-4">Google Sign-In</h3>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-gray-700">Google</span>
                    {profileData.googleConnected && (
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {hasChanges && (
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveChanges}
                  className="bg-kifolio-cta text-white px-6 py-3 rounded-lg font-semibold hover:bg-kifolio-cta/90 transition-colors shadow-md"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        );

      case 'password':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-kifolio-text mb-2">Password</h2>
              <p className="text-gray-600">Update your password settings</p>
            </div>
            <div className="text-gray-500">Password section coming soon...</div>
          </div>
        );

      case 'email-notifications':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-kifolio-text mb-2">Email Notifications</h2>
              <p className="text-gray-600">Manage your email notification preferences</p>
            </div>
            <div className="text-gray-500">Email notifications section coming soon...</div>
          </div>
        );

      case 'invitations':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-kifolio-text mb-2">Invitations</h2>
              <p className="text-gray-600">Manage your invitations and referrals</p>
            </div>
            <div className="text-gray-500">Invitations section coming soon...</div>
          </div>
        );

      case 'delete-account':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-kifolio-text mb-2">Delete Account</h2>
              <p className="text-gray-600">Permanently delete your account and data</p>
            </div>
            <div className="text-gray-500">Delete account section coming soon...</div>
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
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700 font-medium">{getCurrentSectionLabel()}</span>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}
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
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="py-1">
                  {navigationItems.map((item) => {
                    const isActive = (item.id === 'general' && currentSection === 'general') || 
                                    item.id === currentSection;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                          isActive
                            ? 'bg-kifolio-cta/10 text-kifolio-cta font-medium'
                            : item.id === 'delete-account'
                            ? 'text-red-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-6">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = (item.id === 'general' && currentSection === 'general') || 
                                item.id === currentSection;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-kifolio-cta/10 text-kifolio-cta font-medium'
                          : item.id === 'delete-account'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-100'
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
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-2xl mx-auto lg:mx-0">
            {renderContent()}
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
    </div>
  );
}
