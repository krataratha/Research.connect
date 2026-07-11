import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Settings, Save, Loader2, Trash2, AlertTriangle, X,
  FileText, Tag, Eye, Microscope, Banknote, Building2, Globe,
  Clock, Calendar, ShieldAlert, CheckCircle, Layers, Info
} from 'lucide-react';
import collaborationsService from '../services/collaborations.service';

const RESEARCH_STAGES  = ['Idea', 'Proposal', 'Ongoing', 'Completed'];
const FUNDING_STATUSES = ['Funded', 'Unfunded', 'Grant Pending'];
const VISIBILITIES     = ['Private', 'Invite Only', 'Institution'];

const inputCls =
  'w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0F172A] text-sm ' +
  'placeholder:text-[#CBD5E1] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 ' +
  'focus:outline-none transition-all duration-200 hover:border-[#94A3B8]';

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

function Section({ title, subtitle, icon: Icon, accent = 'blue', children, delay = 0 }) {
  const accentMap = {
    blue: 'bg-blue-50 border-blue-100 text-[#2563EB]',
    red:  'bg-red-50  border-red-200  text-red-500',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`bg-white border rounded-2xl p-6 md:p-7 shadow-sm ${accent === 'red' ? 'border-red-200' : 'border-[#E2E8F0]'}`}
    >
      <div className={`flex items-start gap-3 mb-5 pb-4 border-b ${accent === 'red' ? 'border-red-100' : 'border-[#F1F5F9]'}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${accentMap[accent]} flex-shrink-0 mt-0.5`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h2 className={`text-sm font-extrabold tracking-tight ${accent === 'red' ? 'text-red-600' : 'text-[#0F172A]'}`}>{title}</h2>
          {subtitle && <p className="text-[11px] text-[#94A3B8] font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

/* ── Delete Confirm Modal ── */
function DeleteModal({ workspace, onConfirm, onCancel, isDeleting }) {
  const [confirmText, setConfirmText] = useState('');
  const isMatch = confirmText === workspace?.name;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 30 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onCancel} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-[#64748B]" />
        </button>

        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-5"
        >
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </motion.div>

        <h2 className="text-xl font-extrabold text-[#0F172A] text-center mb-2">Delete Workspace?</h2>
        <p className="text-[#64748B] text-sm text-center leading-relaxed mb-4">
          This will permanently delete all members, tasks, files, meetings, and activity. This action <strong className="text-red-500">cannot be undone</strong>.
        </p>

        <div className="mb-5">
          <label className="block text-xs font-bold text-[#475569] mb-2">
            Type <span className="text-red-500 font-black">"{workspace?.name}"</span> to confirm:
          </label>
          <input
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={workspace?.name}
            className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-200 focus:outline-none transition-all"
          />
        </div>

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onCancel} disabled={isDeleting}
            className="flex-1 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#475569] font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50">
            Cancel
          </motion.button>
          <motion.button
            whileHover={isMatch ? { scale: 1.02, boxShadow: '0 8px 25px rgba(239,68,68,0.3)' } : {}}
            whileTap={isMatch ? { scale: 0.98 } : {}}
            onClick={onConfirm}
            disabled={!isMatch || isDeleting}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</> : <><Trash2 className="w-4 h-4" /> Delete Forever</>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Settings Page ── */
export default function WorkspaceSettings() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['collaboration', slug],
    queryFn: () => collaborationsService.getCollaborationBySlug(slug),
    select: (res) => res.data,
  });

  const [form, setForm] = useState(null);

  // Populate form once data loads
  React.useEffect(() => {
    if (data?.workspace && !form) {
      const ws = data.workspace;
      setForm({
        name: ws.name || '',
        title: ws.title || '',
        description: ws.description || '',
        researchArea: ws.researchArea || '',
        keywords: (ws.keywords || []).join(', '),
        visibility: ws.visibility || 'Private',
        researchStage: ws.researchStage || 'Idea',
        fundingStatus: ws.fundingStatus || 'Unfunded',
        institution: ws.institution || '',
        country: ws.country || '',
        expectedDuration: ws.expectedDuration || '',
        startDate: ws.startDate ? ws.startDate.slice(0, 10) : '',
        endDate: ws.endDate ? ws.endDate.slice(0, 10) : '',
      });
    }
  }, [data]);

  const deleteMutation = useMutation({
    mutationFn: () => collaborationsService.deleteCollaboration(data?.workspace?._id),
    onSuccess: () => {
      toast.success('Workspace deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['my-collaborations'] });
      navigate('/collaborations');
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete workspace.'),
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  if (isLoading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  const myRole = data?.myRole;
  const isOwner = myRole === 'Owner';

  return (
    <div className="min-h-screen font-sans relative overflow-hidden" style={{ background: '#F8FAFC' }}>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl pointer-events-none" />

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            workspace={data?.workspace}
            isDeleting={deleteMutation.isPending}
            onConfirm={() => deleteMutation.mutate()}
            onCancel={() => !deleteMutation.isPending && setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative max-w-2xl mx-auto py-10 px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <motion.div whileHover={{ x: -3 }}>
            <Link to={`/collaborations/${slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#2563EB] transition-colors mb-5">
              <ArrowLeft className="w-4 h-4" /> Back to Workspace
            </Link>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg"
            >
              <Settings className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Workspace Settings
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-[#64748B] text-sm mt-0.5">
                {data?.workspace?.name}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Role warning for non-owners */}
        {!isOwner && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-700 font-medium">
            <Info className="w-5 h-5 flex-shrink-0" />
            Only the workspace Owner can modify settings. You are viewing as <strong className="ml-1">{myRole}</strong>.
          </motion.div>
        )}

        <div className="space-y-5">

          {/* Basic Info */}
          <Section title="Basic Information" subtitle="Workspace name, title and description" icon={FileText} delay={0.12}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <Field label="Workspace Name *" icon={Layers}>
                <input name="name" value={form.name} onChange={handleChange} disabled={!isOwner} placeholder="AI in Healthcare Research" className={`${inputCls} disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed`} />
              </Field>
              <Field label="Research Title" icon={FileText}>
                <input name="title" value={form.title} onChange={handleChange} disabled={!isOwner} placeholder="Deep Learning for Clinical Diagnostics" className={`${inputCls} disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed`} />
              </Field>
            </div>
            <Field label="Description" icon={FileText}>
              <textarea name="description" value={form.description} onChange={handleChange} disabled={!isOwner} rows={3} placeholder="Briefly describe your research goals..." className={`${inputCls} resize-none disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed`} />
            </Field>
          </Section>

          {/* Research Details */}
          <Section title="Research Details" subtitle="Area, keywords, and scope" icon={Microscope} delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Research Area" icon={Microscope}>
                <input name="researchArea" value={form.researchArea} onChange={handleChange} disabled={!isOwner} placeholder="Machine Learning, Bioinformatics..." className={`${inputCls} disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed`} />
              </Field>
              <Field label="Keywords (comma-separated)" icon={Tag}>
                <input name="keywords" value={form.keywords} onChange={handleChange} disabled={!isOwner} placeholder="AI, healthcare, NLP" className={`${inputCls} disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed`} />
              </Field>
            </div>
          </Section>

          {/* Settings */}
          <Section title="Workspace Settings" subtitle="Visibility, stage, and funding" icon={Settings} delay={0.28}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { name: 'visibility',    label: 'Visibility',     icon: Eye,      options: VISIBILITIES },
                { name: 'researchStage', label: 'Research Stage', icon: Layers,   options: RESEARCH_STAGES },
                { name: 'fundingStatus', label: 'Funding Status', icon: Banknote, options: FUNDING_STATUSES },
              ].map(({ name, label, icon: I, options }) => (
                <Field key={name} label={label} icon={I}>
                  <select name={name} value={form[name]} onChange={handleChange} disabled={!isOwner} className={`${inputCls} disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed`}>
                    {options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              ))}
            </div>
          </Section>

          {/* Location & Timeline */}
          <Section title="Location & Timeline" subtitle="Institution, country, dates" icon={Globe} delay={0.36}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <Field label="Institution" icon={Building2}>
                <input name="institution" value={form.institution} onChange={handleChange} disabled={!isOwner} placeholder="MIT, Stanford..." className={`${inputCls} disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed`} />
              </Field>
              <Field label="Country" icon={Globe}>
                <input name="country" value={form.country} onChange={handleChange} disabled={!isOwner} placeholder="United States" className={`${inputCls} disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed`} />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="Expected Duration" icon={Clock}>
                <input name="expectedDuration" value={form.expectedDuration} onChange={handleChange} disabled={!isOwner} placeholder="12 months" className={`${inputCls} disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed`} />
              </Field>
              <Field label="Start Date" icon={Calendar}>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} disabled={!isOwner} className={`${inputCls} disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed`} />
              </Field>
              <Field label="End Date" icon={Calendar}>
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} disabled={!isOwner} className={`${inputCls} disabled:bg-slate-50 disabled:text-[#94A3B8] disabled:cursor-not-allowed`} />
              </Field>
            </div>
          </Section>

          {/* Save Button */}
          {isOwner && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(37,99,235,0.25)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSaved(true);
                  toast.success('Settings saved! (UI preview — update API coming soon)');
                  setTimeout(() => setSaved(false), 2000);
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
              >
                <AnimatePresence mode="wait">
                  {saved
                    ? <motion.span key="saved" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Saved!</motion.span>
                    : <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</motion.span>
                  }
                </AnimatePresence>
              </motion.button>
            </motion.div>
          )}

          {/* Danger Zone */}
          {isOwner && (
            <Section title="Danger Zone" subtitle="Irreversible and destructive actions" icon={ShieldAlert} accent="red" delay={0.5}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50/50 border border-red-100 rounded-xl">
                <div>
                  <p className="font-bold text-[#0F172A] text-sm">Delete this workspace</p>
                  <p className="text-xs text-[#64748B] mt-0.5">Once deleted, all data will be permanently removed and cannot be recovered.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-sm hover:shadow-md hover:shadow-red-200 transition-all whitespace-nowrap flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Workspace
                </motion.button>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
