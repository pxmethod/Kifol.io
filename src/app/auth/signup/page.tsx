'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SignUpFormData {
  email: string;
  password: string;
}

interface PasswordRequirements {
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
  length: boolean;
}

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, user } = useAuth();
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    length: false
  });

  // Validate password requirements
  useEffect(() => {
    const password = formData.password;
    setPasswordRequirements({
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      length: password.length >= 8
    });
  }, [formData.password]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRequirements.lowercase || 
               !passwordRequirements.uppercase || 
               !passwordRequirements.number || 
               !passwordRequirements.special || 
               !passwordRequirements.length) {
      newErrors.password = 'Password does not meet all requirements';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Create account with Supabase Auth
      const { error } = await signUp(formData.email, formData.password);
      
      if (error) {
        setErrors({ submit: error });
        return;
      }

      // Show success message and redirect to login
      // setToastMessage('Account created successfully! Please check your email to confirm your account.');
      // setShowToast(true);
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/auth/login?message=Please check your email to confirm your account');
      }, 2000);
      
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setErrors({ submit: error });
      }
      // If successful, the user will be redirected by the OAuth flow
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

  return (
    <div className="min-h-screen bg-kifolio-bg">
      {/* Logo - Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="flex items-center">
          <Image 
            src="/kifolio_logo_dark.svg" 
            alt="Kifolio Logo" 
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Language Selector - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex items-center space-x-2 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">English</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8 pt-20">
        <div className="w-full max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-kifolio-text mb-3">
              Sign up for Kifolio
            </h1>
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column - Sign Up Form */}
              <div>
                <h2 className="text-xl font-semibold text-kifolio-text mb-6">Create your account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="form-field">
                    <label htmlFor="email" className="form-field__label">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`input ${errors.email ? 'input--error' : ''}`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="form-field__error">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="form-field">
                    <label htmlFor="password" className="form-field__label">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`input pr-12 ${errors.password ? 'input--error' : ''}`}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
                        <span className="ml-2 text-sm text-gray-500">
                          {showPassword ? 'Hide' : 'Show'}
                        </span>
                      </button>
                    </div>
                    {errors.password && (
                      <p className="form-field__error">{errors.password}</p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Password requirements:</p>
                    <div className="space-y-1">
                      <div className={`flex items-center text-sm ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className={`w-4 h-4 mr-2 ${passwordRequirements.lowercase ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={passwordRequirements.lowercase ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"} clipRule="evenodd" />
                        </svg>
                        One lowercase character
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className={`w-4 h-4 mr-2 ${passwordRequirements.uppercase ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={passwordRequirements.uppercase ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"} clipRule="evenodd" />
                        </svg>
                        One uppercase character
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className={`w-4 h-4 mr-2 ${passwordRequirements.number ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={passwordRequirements.number ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"} clipRule="evenodd" />
                        </svg>
                        One number
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className={`w-4 h-4 mr-2 ${passwordRequirements.special ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={passwordRequirements.special ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"} clipRule="evenodd" />
                        </svg>
                        One special character
                      </div>
                      <div className={`flex items-center text-sm ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className={`w-4 h-4 mr-2 ${passwordRequirements.length ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={passwordRequirements.length ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"} clipRule="evenodd" />
                        </svg>
                        8 characters minimum
                      </div>
                    </div>
                  </div>



                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={!allRequirementsMet || isSubmitting}
                    className="btn btn--primary btn--full"
                  >
                    {isSubmitting ? 'Creating account...' : 'Sign up'}
                  </button>

                  {errors.submit && (
                    <p className="form-field__error text-center">{errors.submit}</p>
                  )}
                </form>



                {/* Legal Links */}
                <div className="mt-6 text-center text-xs text-gray-500">
                  By creating an account, you agree to our{' '}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Use
                  </Link>
                  {' '}and{' '}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </div>
              </div>

              {/* Right Column - Social Sign Up */}
              <div className="border-t lg:border-t-0 lg:border-l lg:border-gray-200 pt-8 lg:pt-0 lg:pl-8">
                <h2 className="text-xl font-semibold text-kifolio-text mb-6">Or continue with:</h2>
                
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Creating an account with your Google credentials:
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kifolio-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGoogleLoading ? (
                      <LoadingSpinner size="sm" className="mr-2" label="" />
                    ) : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    {isGoogleLoading ? 'Signing up...' : 'Continue with Google'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
