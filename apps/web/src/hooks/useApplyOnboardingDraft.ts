import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { loadOnboardingDraft, clearOnboardingDraft } from '@/lib/onboardingPortfolioDraft';
import { storageService } from '@/lib/storage';
import { getRandomPlaceholder } from '@/utils/placeholders';
import type { LegacyPortfolioData } from '@/lib/adapters/portfolio';

type CreatePortfolioFn = (
  portfolioData: Omit<LegacyPortfolioData, 'id' | 'createdAt' | 'hasUnsavedChanges' | 'achievements'>
) => Promise<LegacyPortfolioData>;

/**
 * After login, if an onboarding portfolio draft exists in sessionStorage,
 * creates the portfolio and redirects to it. Returns whether the dashboard should show a blocking loader.
 */
export function useApplyOnboardingDraft({
  createPortfolio,
  portfoliosLoading,
}: {
  createPortfolio: CreatePortfolioFn;
  portfoliosLoading: boolean;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [draftStatus, setDraftStatus] = useState<'unknown' | 'pending' | 'none'>('unknown');
  const [applying, setApplying] = useState(false);

  useLayoutEffect(() => {
    setDraftStatus(loadOnboardingDraft() ? 'pending' : 'none');
  }, []);

  useEffect(() => {
    if (draftStatus !== 'pending' || !user || portfoliosLoading) return;

    const draft = loadOnboardingDraft();
    if (!draft) {
      setDraftStatus('none');
      return;
    }

    clearOnboardingDraft();
    setApplying(true);

    (async () => {
      try {
        let photoUrl = '';
        if (draft.photoDataUrl) {
          const res = await fetch(draft.photoDataUrl);
          const blob = await res.blob();
          const type = blob.type || 'image/jpeg';
          const ext = type.includes('svg') ? 'svg' : type.split('/')[1]?.replace('+xml', '') || 'jpg';
          const file = new File([blob], `photo.${ext}`, { type });
          photoUrl = await storageService.uploadFile(file, draft.childName);
        } else {
          photoUrl = getRandomPlaceholder(draft.childName);
        }

        const newPortfolio = await createPortfolio({
          childName: draft.childName,
          portfolioTitle: draft.portfolioTitle,
          photoUrl,
          template: draft.template,
          isPrivate: draft.isPrivate,
          password: draft.password || '',
        });

        setDraftStatus('none');
        router.replace(`/portfolio/${newPortfolio.id}?created=true`);
      } catch (e) {
        console.error('[useApplyOnboardingDraft]', e);
        setDraftStatus('none');
      } finally {
        setApplying(false);
      }
    })();
  }, [draftStatus, user, portfoliosLoading, createPortfolio, router]);

  const showBlockingLoader =
    authLoading ||
    portfoliosLoading ||
    draftStatus === 'unknown' ||
    applying ||
    (draftStatus === 'pending' && !!user);

  return { showBlockingLoader };
}
