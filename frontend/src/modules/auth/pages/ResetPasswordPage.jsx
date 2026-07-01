import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Share2, Lock, KeyRound, ArrowLeft } from 'lucide-react';
import authService from '../../../services/auth.service';
import { setOtpEmail } from '../../../redux/slices/authSlice';
import Input from '../../../components/common/inputs/Input';
import Button from '../../../components/common/buttons/Button';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { otpEmail } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  // Redirect if no email is found in state
  useEffect(() => {
    if (!otpEmail) {
      toast.error('Session expired. Please restart the forgot password request.');
      navigate('/forgot-password');
    }
  }, [otpEmail, navigate]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      otp: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.resetPassword(
        otpEmail,
        data.otp,
        data.password,
        data.confirmPassword
      );

      if (response.success) {
        toast.success('Your password has been reset successfully!');
        dispatch(setOtpEmail(null));
        navigate('/success');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card w-full rounded-2xl p-8 shadow-xl border border-border bg-white bg-opacity-70 backdrop-blur-md"
    >
      <div className="flex flex-col items-center mb-6 text-center">
        <Link to="/" className="flex items-center gap-2 mb-4">
          <span className="p-2 rounded-lg bg-gradient-primary text-white flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </span>
          <span className="font-bold text-xl tracking-tight text-text-primary">
            Research<span className="text-primary">Connect</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">Set New Password</h2>
        <p className="text-xs text-text-secondary mt-1">
          For email <strong className="text-text-primary">{otpEmail}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Verification Code (OTP)"
          placeholder="Enter 6-digit code"
          maxLength={6}
          error={errors.otp?.message}
          required
          {...register('otp', {
            required: 'Verification code is required',
            minLength: { value: 6, message: 'OTP must be exactly 6 digits' }
          })}
          icon={<KeyRound className="w-4 h-4 text-text-secondary" />}
        />

        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          required
          {...register('password', {
            required: 'New password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters long' }
          })}
          icon={<Lock className="w-4 h-4 text-text-secondary" />}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          required
          {...register('confirmPassword', {
            required: 'Confirm password is required',
            validate: (value) => value === getValues('password') || 'Passwords do not match'
          })}
          icon={<Lock className="w-4 h-4 text-text-secondary" />}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 font-semibold text-sm shadow-md"
          loading={loading}
        >
          Reset Password
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border flex items-center justify-center">
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Request New Code
        </Link>
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage;
