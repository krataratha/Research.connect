import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Share2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import authService from '../../../services/auth.service';
import { setOtpEmail } from '../../../redux/slices/authSlice';
import Input from '../../../components/common/inputs/Input';
import Button from '../../../components/common/buttons/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.login(data.email, data.password);
      
      if (response.data?.requiresOtp) {
        toast.success('Credentials verified. Please enter the verification OTP sent to your email.', {
          duration: 4000
        });
        dispatch(setOtpEmail(response.data.email));
        navigate('/otp');
      }
    } catch (error) {
      // Error handled by axios interceptor toast
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-card w-full rounded-2xl p-8 shadow-xl border border-border bg-white bg-opacity-70 backdrop-blur-md"
    >
      <div className="flex flex-col items-center mb-8">
        <Link to="/" className="flex items-center gap-2 mb-4">
          <span className="p-2.5 rounded-xl bg-gradient-primary text-white flex items-center justify-center shadow-md">
            <Share2 className="w-6 h-6" />
          </span>
          <span className="font-extrabold text-2xl tracking-tight text-text-primary">
            Research<span className="text-primary">Connect</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Welcome Back</h2>
        <p className="text-sm text-text-secondary mt-1">Sign in to your research workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="relative">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@institution.edu"
            error={errors.email?.message}
            required
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Please enter a valid email address'
              }
            })}
            icon={<Mail className="w-4 h-4 text-text-secondary" />}
          />
        </div>

        <div className="relative">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-text-secondary tracking-wide">
              Password <span className="text-accent-red font-bold">*</span>
            </label>
            <Link 
              to="/forgot-password" 
              className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full px-4 py-2 text-sm bg-bg-card border ${
                errors.password ? 'border-accent-red focus:ring-accent-red' : 'border-border focus:ring-primary'
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-40 transition-colors pr-10`}
              {...register('password', {
                required: 'Password is required'
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs font-medium text-accent-red mt-1 block">
              {errors.password.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 font-semibold text-sm shadow-md"
          loading={loading}
        >
          Verify Credentials
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-xs text-text-secondary">
          New to Research Connect?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginPage;
