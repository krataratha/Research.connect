import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';
import { CheckCircle2, AlertCircle, Microscope, Mail, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyEmailPage = () => {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get email from query params
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Resend OTP Cooldown
  const [cooldown, setCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const inputRefs = useRef([]);

  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown Timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(Number(value))) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // Focus previous input on backspace
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(Number(pasteData))) {
      const pasteArray = pasteData.split('');
      setOtp(pasteArray);
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await verifyEmail(email, otpCode);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
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
      await api.post('/auth/send-email-verification', { 
        email, 
        purpose: 'EMAIL_VERIFICATION' 
      });
      setResendMessage('A new verification code has been sent to your email.');
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to resend verification code.');
    } finally {
      setResendLoading(false);
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
          Verify your email
        </h2>
        <p className="text-sm text-slate-500">
          We sent a 6-digit verification code to <span className="font-semibold text-slate-700">{email || 'your email'}</span>.
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
            <h3 className="text-base font-bold text-green-800">Email Verified Successfully!</h3>
            <p className="text-xs text-green-600">
              Your account is now active. Redirecting you to the sign-in page...
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Digit Inputs */}
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-lg font-bold bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl focus:outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Email</span>
                )}
              </button>
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
                  'Resend verification code'
                )}
              </button>
            </div>
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

export default VerifyEmailPage;
