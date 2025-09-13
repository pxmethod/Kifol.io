'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionServiceClient } from '@/lib/services/subscription-client';

interface FeatureGateProps {
  feature: 'unlimited_portfolios' | 'unlimited_highlights' | 'media_upload' | 'tags' | 'categories' | 'pdf_export' | 'advanced_sharing';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  fileType?: string; // For media_upload feature
  portfolioId?: string; // For unlimited_highlights feature
}

export default function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true,
  fileType,
  portfolioId 
}: FeatureGateProps) {
  const { user } = useAuth();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAllowed(false);
      setLoading(false);
      return;
    }

    checkFeatureAccess();
  }, [user, feature, fileType, portfolioId]);

  const checkFeatureAccess = useCallback(async () => {
    try {
      let result;

      switch (feature) {
        case 'unlimited_portfolios':
          result = await SubscriptionServiceClient.canCreatePortfolio(user!.id);
          break;
        case 'unlimited_highlights':
          if (!portfolioId) {
            result = { allowed: false, reason: 'Portfolio ID required' };
          } else {
            result = await SubscriptionServiceClient.canAddHighlight(user!.id, portfolioId);
          }
          break;
        case 'media_upload':
          if (!fileType) {
            result = { allowed: false, reason: 'File type required' };
          } else {
            result = await SubscriptionServiceClient.canUploadMedia(user!.id, fileType);
          }
          break;
        case 'tags':
          result = await SubscriptionServiceClient.canUseFeature(user!.id, 'canUseTags');
          break;
        case 'categories':
          result = await SubscriptionServiceClient.canUseFeature(user!.id, 'canUseCategories');
          break;
        case 'pdf_export':
          result = await SubscriptionServiceClient.canUseFeature(user!.id, 'canExportPDF');
          break;
        case 'advanced_sharing':
          result = await SubscriptionServiceClient.canUseFeature(user!.id, 'canAdvancedShare');
          break;
        default:
          result = { allowed: false, reason: 'Unknown feature' };
      }

      setIsAllowed(result.allowed);
      setReason(result.reason || '');
    } catch (error) {
      console.error('Error checking feature access:', error);
      setIsAllowed(false);
      setReason('Unable to verify feature access');
    } finally {
      setLoading(false);
    }
  }, [user, feature, fileType, portfolioId]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded h-8 w-full"></div>;
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-orange-800">
            Premium Feature
          </h3>
          <p className="mt-1 text-sm text-orange-700">
            {reason}
          </p>
          <div className="mt-3">
            <a
              href="/pricing"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              Upgrade to Premium
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
