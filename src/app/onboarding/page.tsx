'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CreatePortfolioFormFields from '@/components/portfolio/CreatePortfolioFormFields';
import OnboardingPortfolioPreview from '@/components/onboarding/OnboardingPortfolioPreview';
import { validatePortfolioForm, type PortfolioFormState } from '@/config/portfolio-form';
import {
  saveOnboardingDraft,
  ONBOARDING_PHOTO_MAX_BYTES,
} from '@/lib/onboardingPortfolioDraft';

function validateOnboardingImage(file: File): { valid: boolean; error?: string } {
  if (file.size > ONBOARDING_PHOTO_MAX_BYTES) {
    return {
      valid: false,
      error: `Please use an image under ${ONBOARDING_PHOTO_MAX_BYTES / (1024 * 1024)}MB for this step.`,
    };
  }
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
  if (!allowed.includes(file.type)) {
    return { valid: false, error: 'Please upload JPEG, PNG, GIF, or SVG.' };
  }
  return { valid: true };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

function suggestedPortfolioTitle(childName: string): string {
  const t = childName.trim();
  return t ? `${t}'s Portfolio` : '';
}

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PortfolioFormState>({
    childName: '',
    portfolioTitle: '',
    photoUrl: '',
    template: '',
    isPrivate: false,
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  /** When true, child name changes no longer overwrite the portfolio title. */
  const portfolioTitleManuallyEdited = useRef(false);

  useEffect(() => {
    if (portfolioTitleManuallyEdited.current) return;
    const suggested = suggestedPortfolioTitle(formData.childName);
    setFormData((prev) => {
      if (prev.portfolioTitle === suggested) return prev;
      return { ...prev, portfolioTitle: suggested };
    });
  }, [formData.childName]);

  const handleInputChange = useCallback((field: keyof PortfolioFormState, value: string) => {
    if (field === 'portfolioTitle') {
      const suggested = suggestedPortfolioTitle(formData.childName);
      if (value === '') {
        portfolioTitleManuallyEdited.current = false;
        setFormData((prev) => ({
          ...prev,
          portfolioTitle: suggestedPortfolioTitle(prev.childName),
        }));
      } else {
        portfolioTitleManuallyEdited.current = value !== suggested;
        setFormData((prev) => ({ ...prev, portfolioTitle: value }));
      }
      setErrors((prev) => (prev.portfolioTitle ? { ...prev, portfolioTitle: '' } : prev));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  }, [formData.childName]);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    };
  }, [previewObjectUrl]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateOnboardingImage(file);
    if (!validation.valid) {
      setErrors((prev) => ({ ...prev, photo: validation.error || 'Invalid file' }));
      return;
    }

    setSelectedFile(file);
    setErrors((prev) => ({ ...prev, photo: '' }));

    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    const url = URL.createObjectURL(file);
    setPreviewObjectUrl(url);
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    setPreviewObjectUrl(null);
    setFormData((prev) => ({ ...prev, photoUrl: '' }));
    setErrors((prev) => ({ ...prev, photo: '' }));
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validatePortfolioForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    let photoDataUrl: string | undefined;
    if (selectedFile) {
      try {
        const dataUrl = await readFileAsDataUrl(selectedFile);
        if (dataUrl.length > ONBOARDING_PHOTO_MAX_BYTES * 2) {
          setErrors({
            submit: 'Photo is too large to carry to sign-up. Try a smaller image or continue without a photo.',
          });
          return;
        }
        photoDataUrl = dataUrl;
      } catch {
        setErrors({ submit: 'Could not read your photo. Please try again or skip the photo.' });
        return;
      }
    }

    saveOnboardingDraft({
      childName: formData.childName.trim(),
      portfolioTitle: formData.portfolioTitle.trim(),
      template: formData.template,
      isPrivate: formData.isPrivate,
      password: formData.password,
      photoDataUrl,
    });

    router.push('/auth/signup');
  };

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      <header className="pt-6 pb-4 px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div aria-hidden />
          <Link href="/" className="inline-flex justify-self-center">
            <Image
              src="/kifolio_logo_dark.svg"
              alt="Kifolio"
              width={130}
              height={34}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <div className="flex justify-end">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-[15px] font-semibold text-discovery-black border border-discovery-grey-300 bg-white/80 hover:bg-discovery-beige-100 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-16 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="order-2 lg:order-1">
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-medium text-discovery-black mb-4">
                Create your first portfolio
              </h1>
              <p className="text-md text-discovery-grey leading-relaxed max-w-xl">
                You can add more portfolios later. Everything you add here will be saved after signing up and can be updated
                at anytime.
              </p>
            </div>

            <div className="bg-discovery-white-100 rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-6">
                <CreatePortfolioFormFields
                  formData={formData}
                  errors={errors}
                  onFieldChange={handleInputChange}
                  onTogglePrivate={() => setFormData((prev) => ({ ...prev, isPrivate: !prev.isPrivate }))}
                  selectedFile={selectedFile}
                  uploadingPhoto={false}
                  onPhotoUpload={handlePhotoUpload}
                  onRemovePhoto={handleRemovePhoto}
                  showPassword={showPassword}
                  onToggleShowPassword={() => setShowPassword(!showPassword)}
                  onSelectTemplate={(id) => handleInputChange('template', id)}
                  formId="onboardingPortfolioForm"
                  onSubmit={handleCreate}
                />
              </div>
              <div className="px-6 py-6 border-t border-discovery-beige-300 flex flex-col gap-4">
                <p className="text-sm text-discovery-grey leading-relaxed">
                  Clicking the &quot;Create&quot; button will bring you to the sign up page. Your details above will be
                  saved once you successfully create your account.
                </p>
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                  {errors.submit && (
                    <p className="form-field__error sm:flex-1 sm:self-center">{errors.submit}</p>
                  )}
                  <button
                    type="submit"
                    form="onboardingPortfolioForm"
                    className="px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl bg-discovery-orange hover:bg-discovery-orange-light text-white text-center"
                  >
                    Create for free
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <OnboardingPortfolioPreview
              childName={formData.childName}
              portfolioTitle={formData.portfolioTitle}
              template={formData.template}
              localPhotoUrl={previewObjectUrl}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
