import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, GraduationCap, Building2, HeartPulse, UserCheck, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import authService from '../../../services/auth.service';
import { setOtpEmail } from '../../../redux/slices/authSlice';
import Input from '../../../components/common/inputs/Input';
import Select from '../../../components/common/inputs/Select';
import Checkbox from '../../../components/common/inputs/Checkbox';
import Button from '../../../components/common/buttons/Button';

const countriesList = [
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Australia', label: 'Australia' },
  { value: 'India', label: 'India' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Other', label: 'Other' }
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [researcherType, setResearcherType] = useState('');

  // We use react-hook-form to manage form validation for each step
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors }
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      phone: '',
      acceptTerms: false,
      acceptPrivacy: false,
      // Step 2 academic
      institution: '',
      department: '',
      designation: '',
      // Step 2 corporate
      company: '',
      division: '',
      position: '',
      // Step 2 medical
      hospital: '',
      // Step 2 non-researcher
      organization: '',
      occupation: '',
      interest: ''
    }
  });

  // Step 1: Researcher Type Select
  const handleSelectType = (type) => {
    setResearcherType(type);
    setStep(2);
  };

  // Transition from Step 2 to Step 3
  const handleStep2Next = async () => {
    let fieldsToValidate = [];
    if (researcherType === 'academic') {
      fieldsToValidate = ['institution', 'department'];
    } else if (researcherType === 'corporate') {
      fieldsToValidate = ['company', 'division', 'position'];
    } else if (researcherType === 'medical') {
      fieldsToValidate = ['hospital', 'department', 'designation'];
    } else if (researcherType === 'non_researcher') {
      fieldsToValidate = ['organization', 'occupation', 'interest'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(3);
    }
  };

  // Step 3 Submission
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        researcherType
      };

      const response = await authService.register(payload);
      if (response.success) {
        toast.success('Registration pending. Verify the OTP code sent to your email.');
        dispatch(setOtpEmail(data.email));
        navigate('/otp');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 1 ? 'bg-primary text-white' : 'bg-border text-text-secondary'
          }`}>1</span>
          <span className="text-xs font-bold text-text-secondary hidden sm:inline">Type</span>
        </div>
        <div className={`flex-grow h-0.5 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
        <div className="flex items-center gap-1.5">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 2 ? 'bg-primary text-white' : 'bg-border text-text-secondary'
          }`}>2</span>
          <span className="text-xs font-bold text-text-secondary hidden sm:inline">Affiliation</span>
        </div>
        <div className={`flex-grow h-0.5 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-border'}`} />
        <div className="flex items-center gap-1.5">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 3 ? 'bg-primary text-white' : 'bg-border text-text-secondary'
          }`}>3</span>
          <span className="text-xs font-bold text-text-secondary hidden sm:inline">Account</span>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 shadow-xl border border-border bg-white bg-opacity-70 backdrop-blur-md">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-gradient-primary text-white flex items-center justify-center shadow-sm">
              <Share2 className="w-4 h-4" />
            </span>
            <span className="font-bold text-lg tracking-tight text-text-primary">
              Research<span className="text-primary">Connect</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Create Researcher Account</h2>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Select Researcher Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-text-secondary mb-3">Select your researcher profile type:</h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectType('academic')}
                  className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-primary hover:bg-light-blue bg-white bg-opacity-50 text-left transition-all duration-200 group"
                >
                  <span className="p-3 bg-light-blue text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                    <GraduationCap className="w-6 h-6" />
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">Academic or Student</h4>
                    <p className="text-xs text-text-secondary mt-0.5">Universities, institutes, research labs, colleges</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectType('corporate')}
                  className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-primary hover:bg-light-blue bg-white bg-opacity-50 text-left transition-all duration-200 group"
                >
                  <span className="p-3 bg-light-purple text-accent-indigo rounded-lg group-hover:bg-accent-indigo group-hover:text-white transition-colors">
                    <Building2 className="w-6 h-6" />
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">Corporate, Government or NGO</h4>
                    <p className="text-xs text-text-secondary mt-0.5">Corporate R&D units, departments, non-profits</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectType('medical')}
                  className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-primary hover:bg-light-blue bg-white bg-opacity-50 text-left transition-all duration-200 group"
                >
                  <span className="p-3 bg-light-green text-accent-green rounded-lg group-hover:bg-accent-green group-hover:text-white transition-colors">
                    <HeartPulse className="w-6 h-6" />
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">Medical & Clinical</h4>
                    <p className="text-xs text-text-secondary mt-0.5">Hospitals, medical research labs, health agencies</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectType('non_researcher')}
                  className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-primary hover:bg-light-blue bg-white bg-opacity-50 text-left transition-all duration-200 group"
                >
                  <span className="p-3 bg-light-orange text-accent-orange rounded-lg group-hover:bg-accent-orange group-hover:text-white transition-colors">
                    <UserCheck className="w-6 h-6" />
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">Not a Researcher</h4>
                    <p className="text-xs text-text-secondary mt-0.5">Academic publisher, reader, investor, enthusiast</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Affiliation Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-text-secondary">Workplace & Affiliation details:</h3>

              {researcherType === 'academic' && (
                <div className="space-y-4">
                  <Input
                    label="University / Institution"
                    placeholder="e.g. Stanford University"
                    error={errors.institution?.message}
                    required
                    {...register('institution', { required: 'Institution is required' })}
                  />
                  <Input
                    label="Department"
                    placeholder="e.g. Department of Computer Science"
                    error={errors.department?.message}
                    required
                    {...register('department', { required: 'Department is required' })}
                  />
                  <Input
                    label="Academic Designation (Optional)"
                    placeholder="e.g. Associate Professor / PhD Candidate"
                    {...register('designation')}
                  />
                </div>
              )}

              {researcherType === 'corporate' && (
                <div className="space-y-4">
                  <Input
                    label="Company / Organisation"
                    placeholder="e.g. Google DeepMind"
                    error={errors.company?.message}
                    required
                    {...register('company', { required: 'Company is required' })}
                  />
                  <Input
                    label="Division / Department"
                    placeholder="e.g. AI Research Group"
                    error={errors.division?.message}
                    required
                    {...register('division', { required: 'Division is required' })}
                  />
                  <Input
                    label="Position / Role"
                    placeholder="e.g. Principal Research Scientist"
                    error={errors.position?.message}
                    required
                    {...register('position', { required: 'Position is required' })}
                  />
                </div>
              )}

              {researcherType === 'medical' && (
                <div className="space-y-4">
                  <Input
                    label="Hospital / Medical Institute"
                    placeholder="e.g. Mayo Clinic"
                    error={errors.hospital?.message}
                    required
                    {...register('hospital', { required: 'Hospital name is required' })}
                  />
                  <Input
                    label="Department"
                    placeholder="e.g. Cardiology"
                    error={errors.department?.message}
                    required
                    {...register('department', { required: 'Department is required' })}
                  />
                  <Input
                    label="Designation / Medical Rank"
                    placeholder="e.g. Resident Physician / Research Director"
                    error={errors.designation?.message}
                    required
                    {...register('designation', { required: 'Designation is required' })}
                  />
                </div>
              )}

              {researcherType === 'non_researcher' && (
                <div className="space-y-4">
                  <Input
                    label="Organisation / Agency"
                    placeholder="e.g. Nature Publishing Group"
                    error={errors.organization?.message}
                    required
                    {...register('organization', { required: 'Organization is required' })}
                  />
                  <Input
                    label="Occupation"
                    placeholder="e.g. Scientific Editor / Venture Capitalist"
                    error={errors.occupation?.message}
                    required
                    {...register('occupation', { required: 'Occupation is required' })}
                  />
                  <Input
                    label="Research Interest Summary"
                    placeholder="e.g. Quantum Computing, Genomics"
                    error={errors.interest?.message}
                    required
                    {...register('interest', { required: 'Interest details are required' })}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  className="flex-grow flex items-center justify-center gap-2"
                  onClick={() => setStep(1)}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-grow flex items-center justify-center gap-2"
                  onClick={handleStep2Next}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Basic Account Information */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h3 className="text-sm font-semibold text-text-secondary">Basic Account Details:</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    placeholder="Alice"
                    error={errors.firstName?.message}
                    required
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Smith"
                    error={errors.lastName?.message}
                    required
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                </div>

                <Select
                  label="Country"
                  placeholder="Select Country"
                  options={countriesList}
                  error={errors.country?.message}
                  required
                  {...register('country', { required: 'Country is required' })}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="alice.smith@university.edu"
                  error={errors.email?.message}
                  required
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: 'Invalid email address format'
                    }
                  })}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  required
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long'
                    }
                  })}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  required
                  {...register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) => value === getValues('password') || 'Passwords do not match'
                  })}
                />

                <div className="space-y-2 pt-2">
                  <Checkbox
                    label="I accept the Terms of Service & Terms for Scholars"
                    error={errors.acceptTerms?.message}
                    required
                    {...register('acceptTerms', { required: 'You must accept the terms of service' })}
                  />
                  <Checkbox
                    label="I accept the Privacy Policy & Data Processing Rules"
                    error={errors.acceptPrivacy?.message}
                    required
                    {...register('acceptPrivacy', { required: 'You must accept the privacy policy' })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="secondary"
                    className="flex-grow flex items-center justify-center gap-2"
                    onClick={() => setStep(2)}
                    icon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-grow flex items-center justify-center gap-2 shadow-md"
                    loading={loading}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Register Account
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-text-secondary">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
