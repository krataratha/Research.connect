import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Share2, Lock, RefreshCw, Check } from 'lucide-react';
import authService from '../../../services/auth.service';
import { setCredentials, setOtpEmail } from '../../../redux/slices/authSlice';
import Button from '../../../components/common/buttons/Button';

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { otpEmail } = useSelector((state) => state.auth);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef([]);

  // Redirect if no email is loaded in state
  useEffect(() => {
    if (!otpEmail) {
      toast.error('Session expired. Please restart registration or login.');
      navigate('/login');
    }
  }, [otpEmail, navigate]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only accept numeric inputs
    if (value && isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Get last char
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      
      // If current input is empty, clear previous and focus it
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(pasteData)) {
      const pasteArray = pasteData.split('');
      setOtp(pasteArray);
      inputRefs.current[5].focus();
    }
  };

  // Submit OTP
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length < 6) {
      toast.error('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      // First, try verifying login. If that fails because purpose is different or doesn't match, 
      // check if it's registration.
      // Wait, we can know if the user is in registration vs login based on where they navigated from, 
      // but to make it foolproof, we can attempt login verification first, and if we get a specific error 
      // or if we know we came from register, we verify registration.
      // Better: we can try verifyRegistrationOtp if we came from register, or verifyLoginOtp for login.
      // How do we know? We can check if user state is pending. Or we can just try verifyLoginOtp first; 
      // if it fails or if it's a pending user, we try verifyRegistrationOtp!
      // This is a highly robust approach. Let's do that!
      let response;
      try {
        response = await authService.verifyLoginOtp(otpEmail, otpCode);
      } catch (err) {
        // If login verify fails with NOT_FOUND or similar, or if it's an email verification error, 
        // try verifying registration OTP.
        if (err.errorCode === 'EMAIL_NOT_VERIFIED' || err.statusCode === 404 || err.errorCode === 'INVALID_OTP') {
          try {
            response = await authService.verifyRegistrationOtp(otpEmail, otpCode);
          } catch (regErr) {
            // Throw original or registration error
            throw regErr;
          }
        } else {
          throw err;
        }
      }

      if (response.success) {
        toast.success(response.message || 'Verification successful!');
        dispatch(setCredentials(response.data));
        
        // Clear otpEmail
        dispatch(setOtpEmail(null));

        // Redirect based on whether user was pending (registration completion redirect to success page)
        // Or if it was simple login redirect to dashboard
        if (response.message.toLowerCase().includes('registration') || response.message.toLowerCase().includes('verified')) {
          navigate('/success');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('OTP verify error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      // Try resending login OTP. If it fails due to not found / active, resend registration OTP.
      try {
        await authService.sendLoginOtp(otpEmail);
      } catch (err) {
        await authService.sendRegistrationOtp(otpEmail);
      }
      toast.success('A new 6-digit verification code has been sent to your email.');
      setResendCooldown(60); // Reset timer
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card w-full rounded-2xl p-8 shadow-xl border border-border bg-white bg-opacity-70 backdrop-blur-md text-center"
    >
      <div className="flex flex-col items-center mb-6">
        <span className="p-3 rounded-full bg-light-blue text-primary flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </span>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">Email Verification</h2>
        <p className="text-sm text-text-secondary mt-1">
          We sent a 6-digit code to <br />
          <strong className="text-text-primary">{otpEmail}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 max-w-sm mx-auto" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-40 rounded-xl focus:outline-none transition-all shadow-sm"
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 font-semibold text-sm shadow-md"
          loading={loading}
          icon={<Check className="w-4 h-4" />}
        >
          Verify Account
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-3">
        <p className="text-xs text-text-secondary">
          Didn't receive the email code?
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className={`flex items-center gap-2 text-xs font-bold transition-colors ${
            resendCooldown > 0 
              ? 'text-text-secondary cursor-not-allowed' 
              : 'text-primary hover:text-primary-hover'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code Now'}
        </button>
      </div>
    </motion.div>
  );
};

export default OtpVerificationPage;
