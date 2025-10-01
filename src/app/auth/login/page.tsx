'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  keepLoggedIn: boolean;
}

interface FormErrors {
  email: string;
  password: string;
  submit: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    keepLoggedIn: false
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
    submit: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is ready for submission
  const isFormReady = formData.email.trim() !== '' && formData.password.trim() !== '';

  // Handle success message from signup or email verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get('message');
      const verified = urlParams.get('verified');
      
      if (message) {
        setSuccessMessage(message);
      } else if (verified === 'true') {
        setSuccessMessage('Email verified successfully! You can now log in to your account.');
      }
    }
  }, []);

  // Redirect if already logged in (but allow them to stay if they just arrived)
  useEffect(() => {
    if (user && !successMessage) {
      router.push('/dashboard');
    }
  }, [user, router, successMessage]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {
      email: '',
      password: '',
      submit: ''
    };

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setErrors({ ...errors, submit: error });
        return;
      }

      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      setErrors({ ...errors, submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-discovery-beige-200">
      {/* Header */}
      <header className="bg-discovery-beige-200 text-white px-9 py-4 top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center">
              <Image 
                src="/kifolio_logo_dark.svg" 
                alt="Kifolio Logo" 
                width={144}
                height={38}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex justify-center min-h-screen pt-24 pb-10">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl lg:text-5xl sm:text-center lg:text-center font-medium text-discovery-black mb-12">
              Log in to Kifolio
            </h1>
            <p className="text-lg text-discovery-grey leading-relaxed">
              Need a Kifolio account?{' '}
              <Link href="/auth/signup" className="text-discovery-orange hover:text-discovery-orange-light font-medium">
                Create an account
              </Link>
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{successMessage}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="form-field ">
                <label htmlFor="email" className="text-md font-medium text-discovery-grey leading-relaxed">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`input ${errors.email ? 'input--error' : ''}`}
                  placeholder="Enter your email address"
                  required
                />
                {errors.email && (
                  <p className="form-field__error">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="form-field">
                <label htmlFor="password" className="text-md font-medium text-discovery-grey leading-relaxed">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`input pr-12 ${errors.password ? 'input--error' : ''}`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-field__error">{errors.password}</p>
                )}
              </div>

              {/* Keep Me Logged In Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="keepLoggedIn"
                  checked={formData.keepLoggedIn}
                  onChange={(e) => handleInputChange('keepLoggedIn', e.target.checked)}
                  className="checkbox__input"
                />
                <label htmlFor="keepLoggedIn" className="text-md text-discovery-grey leading-relaxed ml-3">
                  Keep me logged in
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={!isFormReady || isSubmitting}
                className="bg-discovery-primary text-white px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-discovery-primary-light text-center w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Log in'}
              </button>

              {errors.submit && (
                <p className="form-field__error text-center">{errors.submit}</p>
              )}
            </form>

            {/* Forgot Links */}
            <div className="mt-6 pt-6 border-t border-discovery-beige-300">
              <div className="flex justify-between">
                <Link href="/auth/forgot-username" className="text-discovery-orange hover:text-discovery-orange-light text-sm font-medium">
                  Forgot username?
                </Link>
                <Link href="/auth/forgot-password" className="text-discovery-orange hover:text-discovery-orange-light text-sm font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
