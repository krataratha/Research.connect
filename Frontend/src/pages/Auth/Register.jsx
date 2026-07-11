import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Eye, EyeOff, Lock, Mail, Microscope, User, Building, MapPin, Briefcase, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      designation: '',
      institution: '',
      country: '',
    },
  });

  const nextStep = async () => {
    // Validate only step 1 fields before proceeding
    const isStepValid = await trigger(['fullName', 'email', 'password']);
    if (isStepValid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await signup(data);
      if (res.success) {
        // Redirect to email verification with email query param
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          Create Academic Account
        </h2>
        <p className="text-sm text-slate-500">
          Step {step} of 2: {step === 1 ? 'Credentials' : 'Academic Profile'}
        </p>
        
        {/* Step Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${step * 50}%` }}
          ></div>
        </div>
      </div>

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
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Dr. Sarah Jenkins"
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                    className={`w-full pl-11 pr-4 py-2.5 bg-white border ${
                      errors.fullName ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    } rounded-xl text-sm transition-all focus:outline-none focus:ring-4`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="sarah.jenkins@stanford.edu"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Please enter a valid email address',
                      },
                    })}
                    className={`w-full pl-11 pr-4 py-2.5 bg-white border ${
                      errors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    } rounded-xl text-sm transition-all focus:outline-none focus:ring-4`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                  Password
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

              <button
                type="button"
                onClick={nextStep}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Designation */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                  Designation / Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Professor, PhD Candidate, Scientist"
                    {...register('designation')}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:outline-none focus:ring-4"
                  />
                </div>
              </div>

              {/* Institution */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                  Institution / University
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Stanford University"
                    {...register('institution')}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:outline-none focus:ring-4"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                  Country
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. United States"
                    {...register('country')}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm transition-all focus:outline-none focus:ring-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register</span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </motion.div>
  );
};

export default Register;
