import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, ArrowLeft, Loader2, CheckCircle,
  FileText, Tag, Eye, Microscope, Banknote,
  Building2, Globe, Clock, Calendar, Sparkles
} from 'lucide-react';
import collaborationsService from '../services/collaborations.service';

const RESEARCH_STAGES  = ['Idea', 'Proposal', 'Ongoing', 'Completed'];
const FUNDING_STATUSES = ['Funded', 'Unfunded', 'Grant Pending'];
const VISIBILITIES     = ['Private', 'Invite Only', 'Institution'];

/* ── Animated label + input wrapper ───────────────────────────── */
function Field({ label, icon: Icon, children }) {
  return (
    <div className="group">
      <label className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A] mb-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors" />}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0F172A] text-sm ' +
  'placeholder:text-[#CBD5E1] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 ' +
  'focus:outline-none transition-all duration-200 hover:border-[#94A3B8]';

/* ── Section card ─────────────────────────────────────────────── */
function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {title && (
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#2563EB]" />
          </div>
          <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">{title}</h2>
        </div>
      )}
      {children}
    </motion.div>
  );
}

/* ── Main Component ────────────────────────────────────────────── */
export default function CreateWorkspace() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', title: '', description: '', researchArea: '',
    keywords: '', visibility: 'Private', institution: '',
    country: '', expectedDuration: '', startDate: '', endDate: '',
    researchStage: 'Idea', fundingStatus: 'Unfunded',
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () => collaborationsService.createCollaboration({
      ...form,
      keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
    }),
    onSuccess: (res) => {
      setIsSuccess(true);
      toast.success('Workspace created!');
      setTimeout(() => navigate(`/collaborations/${res.data.slug}`), 800);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create workspace.'),
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const isValid = form.name.trim().length > 0;

  return (
    <div className="min-h-screen font-sans relative overflow-hidden" style={{ background: '#F8FAFC' }}>
      {/* Background decorations */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-violet-100 to-cyan-100 rounded-full opacity-30 blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto py-10 px-4 sm:px-6">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#2563EB] transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workspaces
          </motion.button>

          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200"
            >
              <Layers className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight"
              >
                Create Research Workspace
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-[#64748B] text-sm mt-0.5"
              >
                Set up a new collaborative research environment.
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Form Sections */}
        <div className="space-y-5">

          {/* Basic Info */}
          <Section title="Basic Information" icon={FileText} delay={0.12}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <Field label="Workspace Name *" icon={Layers}>
                <input
                  name="name" value={form.name} onChange={handleChange}
                  placeholder="AI in Healthcare Research"
                  className={inputCls}
                />
              </Field>
              <Field label="Research Title" icon={FileText}>
                <input
                  name="title" value={form.title} onChange={handleChange}
                  placeholder="Deep Learning for Clinical Diagnostics"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Short Description" icon={FileText}>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Briefly describe your research goals, objectives, and expected outcomes..."
                className={`${inputCls} resize-none`}
              />
            </Field>
          </Section>

          {/* Research Details */}
          <Section title="Research Details" icon={Microscope} delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Research Area" icon={Microscope}>
                <input
                  name="researchArea" value={form.researchArea} onChange={handleChange}
                  placeholder="Machine Learning, Bioinformatics..."
                  className={inputCls}
                />
              </Field>
              <Field label="Keywords (comma-separated)" icon={Tag}>
                <input
                  name="keywords" value={form.keywords} onChange={handleChange}
                  placeholder="AI, healthcare, NLP"
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* Workspace Settings */}
          <Section title="Workspace Settings" icon={Sparkles} delay={0.28}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { name: 'visibility',    label: 'Visibility',      icon: Eye,      options: VISIBILITIES },
                { name: 'researchStage', label: 'Research Stage',  icon: Layers,   options: RESEARCH_STAGES },
                { name: 'fundingStatus', label: 'Funding Status',  icon: Banknote, options: FUNDING_STATUSES },
              ].map(({ name, label, icon: FieldIcon, options }) => (
                <Field key={name} label={label} icon={FieldIcon}>
                  <select
                    name={name} value={form[name]} onChange={handleChange}
                    className={inputCls}
                  >
                    {options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              ))}
            </div>
          </Section>

          {/* Location & Duration */}
          <Section title="Location & Timeline" icon={Globe} delay={0.36}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <Field label="Institution" icon={Building2}>
                <input name="institution" value={form.institution} onChange={handleChange}
                  placeholder="MIT, Stanford, IIT..."
                  className={inputCls}
                />
              </Field>
              <Field label="Country" icon={Globe}>
                <input name="country" value={form.country} onChange={handleChange}
                  placeholder="United States"
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="Expected Duration" icon={Clock}>
                <input name="expectedDuration" value={form.expectedDuration} onChange={handleChange}
                  placeholder="12 months"
                  className={inputCls}
                />
              </Field>
              <Field label="Start Date" icon={Calendar}>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange}
                  className={inputCls}
                />
              </Field>
              <Field label="End Date" icon={Calendar}>
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange}
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.4 }}
            className="flex items-center gap-4 pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#475569] font-semibold text-sm hover:bg-slate-50 hover:text-[#0F172A] hover:border-[#CBD5E1] shadow-sm transition-all"
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={isValid ? { scale: 1.02, boxShadow: '0 8px 30px rgba(37,99,235,0.3)' } : {}}
              whileTap={isValid ? { scale: 0.98 } : {}}
              onClick={() => mutation.mutate()}
              disabled={!isValid || mutation.isPending || isSuccess}
              className="flex-1 relative flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
            >
              {/* Shimmer on idle */}
              {!mutation.isPending && !isSuccess && (
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full"
                  animate={{ translateX: ['−100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                />
              )}

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.span key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Created! Redirecting…
                  </motion.span>
                ) : mutation.isPending ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Workspace…
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Create Workspace
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
