import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Eye, EyeOff, Lock, Microscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get email and token from URL query params
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!email || !token) {
      setError('Invalid or expired reset session. Please request a new code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        token,
        password: data.password,
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to reset password. The reset session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
          Reset Your Password
        </h2>
        <p className="text-sm text-slate-500">
          Enter your new password below. Ensure it meets the security requirements.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-green-800">Password Reset Successfully!</h3>
            <p className="text-xs text-green-600">
              Your password has been successfully updated. Redirecting you to the sign-in page...
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2.5 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      validate: {
                        hasNumber: (value) => /\d/.test(value) || 'Password must contain at least one number',
                        hasUppercase: (value) => /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                      }
                    })}
                    className={`w-full pl-11 pr-11 py-2.5 bg-white border ${
                      errors.password ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    } rounded-xl text-sm transition-all focus:outline-none focus:ring-4`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match',
                    })}
                    className={`w-full pl-11 pr-11 py-2.5 bg-white border ${
                      errors.confirmPassword ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    } rounded-xl text-sm transition-all focus:outline-none focus:ring-4`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
        <Link
          to="/login"
          className="font-semibold text-slate-600 hover:text-slate-800 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
