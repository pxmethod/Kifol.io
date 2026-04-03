'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import CreatePortfolioFormFields from '@/components/portfolio/CreatePortfolioFormFields';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getRandomPlaceholder } from '@/utils/placeholders';
import { usePortfolios } from '@/hooks/usePortfolios';
import { useAuth } from '@/contexts/AuthContext';
import { storageService } from '@/lib/storage';
import { validatePortfolioForm, type PortfolioFormState } from '@/config/portfolio-form';

export default function CreatePortfolio() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { createPortfolio } = usePortfolios();
  const [formData, setFormData] = useState<PortfolioFormState>({
    childName: '',
    portfolioTitle: '',
    photoUrl: '',
    template: '',
    isPrivate: false,
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?message=Please log in to create a portfolio');
    }
  }, [user, loading, router]);

  const validateForm = () => {
    const newErrors = validatePortfolioForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return (
      formData.childName.trim() !== '' ||
      formData.portfolioTitle.trim() !== '' ||
      formData.photoUrl !== '' ||
      formData.template !== '' ||
      formData.isPrivate ||
      formData.password.trim() !== ''
    );
  };

  const handleBackClick = () => {
    if (hasChanges()) {
      setShowConfirmModal(true);
    } else {
      router.push('/dashboard');
    }
  };

  const handleConfirmNavigation = () => {
    setShowConfirmModal(false);
    router.push('/dashboard');
  };

  const handleCancelNavigation = () => {
    setShowConfirmModal(false);
  };

  const handleInputChange = (field: keyof PortfolioFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      setErrors((prev) => ({ ...prev, photo: validation.error || 'Invalid file' }));
      return;
    }

    setUploadingPhoto(true);
    setErrors((prev) => ({ ...prev, photo: '' }));

    try {
      const photoUrl = await storageService.uploadFile(file, formData.childName || 'photo');
      setFormData((prev) => ({ ...prev, photoUrl }));
    } catch (error) {
      console.error('Photo upload error:', error);
      setErrors((prev) => ({
        ...prev,
        photo: 'Failed to upload photo. Please try again.',
      }));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, photoUrl: '' }));
    setErrors((prev) => ({ ...prev, photo: '' }));
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const newPortfolio = await createPortfolio({
        childName: formData.childName,
        portfolioTitle: formData.portfolioTitle,
        photoUrl: formData.photoUrl || getRandomPlaceholder(formData.childName),
        template: formData.template,
        isPrivate: formData.isPrivate,
        password: formData.password,
      });

      router.push(`/portfolio/${newPortfolio.id}?created=true`);
    } catch (error) {
      console.error('Error creating portfolio:', error);
      setErrors({ submit: 'Failed to create portfolio. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-discovery-beige-200">
        <Header animateLogo={true} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" label="Loading..." />
          </div>
        </main>
      </div>
    );
  }

  // If not authenticated, show nothing (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-discovery-beige-200">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-kifolio-text">Redirecting to login...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      <Header />

      {/* Action Bar */}
      <div className="bg-discovery-white-100 border-b border-discovery-beige-100 px-9 py-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBackClick}
            className="flex items-center text-discovery-grey hover:text-discovery-black transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-5">
        <div className="bg-discovery-white-100 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4">
            <h1 className="text-4xl lg:text-4xl font-medium text-discovery-black">Create new portfolio</h1>
          </div>
          <div className="px-6 py-6">
            <CreatePortfolioFormFields
              formData={formData}
              errors={errors}
              onFieldChange={handleInputChange}
              onTogglePrivate={() => setFormData((prev) => ({ ...prev, isPrivate: !prev.isPrivate }))}
              selectedFile={selectedFile}
              uploadingPhoto={uploadingPhoto}
              onPhotoUpload={handlePhotoUpload}
              onRemovePhoto={handleRemovePhoto}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword(!showPassword)}
              onSelectTemplate={(id) => handleInputChange('template', id)}
              formId="portfolioForm"
              onSubmit={handleSubmit}
            />
          </div>
          <div className="px-8 py-6 border-t border-discovery-beige-300">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleBackClick}
                className="px-6 py-3 border border-discovery-beige-300 text-discovery-black rounded-pill hover:bg-discovery-beige-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl text-center disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSubmitting ? 'bg-discovery-primary/70' : 'bg-discovery-orange hover:bg-discovery-orange-light'
                } text-white`}
                form="portfolioForm"
              >
                {isSubmitting ? 'Creating Portfolio...' : 'Create Portfolio'}
              </button>
            </div>
            {errors.submit && <p className="form-field__error text-center mt-4">{errors.submit}</p>}
          </div>
        </div>
      </main>

      <ConfirmDialog
        isOpen={showConfirmModal}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
        title="Discard changes?"
        message="You will lose any changes you've made if you go back."
        confirmLabel="Discard changes"
      />
    </div>
  );
}
