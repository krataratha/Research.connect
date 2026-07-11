import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';
import { Eye, EyeOff, Lock, Mail, Microscope, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const { login, syncProfile } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle Google Sign-In response
  const handleGoogleSignIn = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/google-login', { idToken: response.credential });
      if (res.data?.success) {
        localStorage.setItem('token', res.data.data.token);
        // Sync profile details and redirect
        await syncProfile();
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load Google Identity Services Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '959595325668-e5dlgoecao8lvo5k38plolvgv9ua2du1.apps.googleusercontent.com',
          callback: handleGoogleSignIn,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInBtn'),
          { 
            theme: 'outline', 
            size: 'large', 
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        const emailVerified = res.data?.emailVerified;
        const otpRequired = res.data?.otpRequired;
        
        if (emailVerified === false) {
          navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } else if (otpRequired) {
          navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
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
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
          Welcome Back
        </h2>
        <p className="text-sm text-slate-500">
          Access your professional research dashboard.
        </p>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-3.5 bg-red-50/75 border border-red-100 text-red-700 rounded-xl text-xs font-medium flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Login Button Container */}
      <div className="space-y-4">
        <div className="w-full flex justify-center" id="googleSignInBtn"></div>
        
        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
            or sign in with email
          </span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase pl-1">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="you@institution.edu"
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 border ${
                errors.email ? 'border-red-300 focus:ring-red-200/50 focus:border-red-500' : 'border-slate-200/85 focus:ring-blue-100/50 focus:border-blue-500'
              } rounded-xl text-sm transition-all focus:outline-none focus:ring-4`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 font-medium pl-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              className={`w-full pl-11 pr-11 py-2.5 bg-slate-50 border ${
                errors.password ? 'border-red-300 focus:ring-red-200/50 focus:border-red-500' : 'border-slate-200/85 focus:ring-blue-100/50 focus:border-blue-500'
              } rounded-xl text-sm transition-all focus:outline-none focus:ring-4`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-medium pl-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4.5 h-4.5 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
        New to ResearchConnect?{' '}
        <Link
          to="/register"
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Create an account
        </Link>
      </div>
    </motion.div>
  );
};

export default Login;
