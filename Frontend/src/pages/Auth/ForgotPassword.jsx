import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { AlertCircle, Mail, Microscope, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailValue, setEmailValue] = useState('');

  // OTP Verification state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const inputRefs = useRef([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  // Cooldown Timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Focus the first OTP input on step transition
  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const onEmailSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setEmailValue(data.email);
      setStep(2);
      setCooldown(60);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-reset-otp', {
        email: emailValue,
        otp: otpCode,
      });
      
      if (res.data?.success) {
        const resetToken = res.data.data.token;
        // Redirect to Reset Password with email and token
        navigate(`/reset-password?email=${encodeURIComponent(emailValue)}&token=${encodeURIComponent(resetToken)}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setResendLoading(true);
    setError('');
    setResendMessage('');
    try {
      await api.post('/auth/resend-login-otp', {
        email: emailValue,
        purpose: 'PASSWORD_RESET',
      });
      setResendMessage('A new password reset code has been sent.');
      setCooldown(60);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to resend reset code.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(Number(pasteData))) {
      const pasteArray = pasteData.split('');
      setOtp(pasteArray);
      inputRefs.current[5].focus();
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
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
          Forgot Password?
        </h2>
        <p className="text-sm text-slate-500">
          {step === 1
            ? "Enter your email address and we'll send you a 6-digit code to reset your password."
            : `Enter the 6-digit code sent to ${emailValue}.`}
        </p>
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
        {resendMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm flex items-start gap-2.5 overflow-hidden"
          >
            <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{resendMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="email-form"
            onSubmit={handleSubmit(onEmailSubmit)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
                  <span>Sending code...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="otp-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <form onSubmit={onOtpSubmit} className="space-y-6">
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-12 h-12 text-center text-lg font-bold bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl focus:outline-none transition-all"
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
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
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </div>
            </form>

            {/* Resend Cooldown */}
            <div className="text-center">
              <button
                type="button"
                disabled={cooldown > 0 || resendLoading}
                onClick={handleResend}
                className={`text-sm font-semibold transition-colors ${
                  cooldown > 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-700 cursor-pointer'
                }`}
              >
                {resendLoading ? (
                  <span className="flex items-center gap-1.5 justify-center">
                    <div className="w-3.5 h-3.5 border-2 border-blue-600/25 border-t-blue-600 rounded-full animate-spin"></div>
                    Resending...
                  </span>
                ) : cooldown > 0 ? (
                  `Resend code in ${cooldown}s`
                ) : (
                  'Resend reset code'
                )}
              </button>
            </div>
          </motion.div>
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

export default ForgotPassword;
