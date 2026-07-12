import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, FileUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const domains = ['Artificial Intelligence', 'Machine Learning', 'Healthcare', 'Blockchain', 'IoT', 'Cybersecurity', 'Robotics', 'Cloud Computing', 'Bioinformatics', 'Computer Vision', 'Natural Language Processing', 'Other'];
const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';
const Field = ({ label, children, className = '' }) => <label className={`block ${className}`}><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>;

export default function CreateProject() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', longDescription: '', researchDomain: '', customDomain: '', status: 'Draft', startDate: '', endDate: '', githubUrl: '' });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return toast.error('Project title and short description are required.');
    if (form.researchDomain === 'Other' && !form.customDomain.trim()) return toast.error('Please specify your research domain.');
    setSaving(true);
    const payload = { ...form, researchDomain: form.researchDomain === 'Other' ? form.customDomain.trim() : form.researchDomain };
    delete payload.customDomain;
    try { await api.post('/projects', payload); toast.success('Project created successfully'); navigate('/projects'); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not create project. Please try again.'); }
    finally { setSaving(false); }
  };
  return <div className="mx-auto max-w-3xl pb-12">
    <div className="mb-7 flex items-center gap-4"><button onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:text-blue-600" aria-label="Go back"><ArrowLeft size={19}/></button><div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">Projects</p><h1 className="text-3xl font-bold tracking-tight text-slate-900">Create New Project</h1><p className="mt-1 text-sm text-slate-500">Add the essentials now. You can add collaborators and other details later.</p></div></div>
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-4"><h2 className="font-bold text-slate-900">Project details</h2></div><div className="grid gap-5 p-6 md:grid-cols-2">
      <div className="md:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Cover image <span className="font-normal text-slate-400">(optional)</span></span><div className="flex min-h-24 items-center justify-center rounded-xl border-2 border-dashed border-blue-100 bg-blue-50/50 text-center"><div><FileUp className="mx-auto mb-1.5 text-blue-600" size={20}/><p className="text-sm font-semibold text-slate-600">Upload a cover image</p></div></div></div>
      <Field label="Project title" className="md:col-span-2"><input required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Enter project title" className={fieldClass}/></Field>
      <Field label="Short description" className="md:col-span-2"><input required value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the project in one sentence" className={fieldClass}/></Field>
      <Field label="Detailed description" className="md:col-span-2"><textarea value={form.longDescription} onChange={(e) => update('longDescription', e.target.value)} rows="4" placeholder="Add more context if needed (optional)" className={fieldClass}/></Field>
      <Field label="Research domain"><select value={form.researchDomain} onChange={(e) => update('researchDomain', e.target.value)} className={fieldClass}><option value="">Select a domain</option>{domains.map((domain) => <option key={domain}>{domain}</option>)}</select></Field>
      <Field label="Status"><select value={form.status} onChange={(e) => update('status', e.target.value)} className={fieldClass}>{['Draft', 'Active', 'In Progress', 'Completed'].map((status) => <option key={status}>{status}</option>)}</select></Field>
      {form.researchDomain === 'Other' && <Field label="Specify domain" className="md:col-span-2"><input required value={form.customDomain} onChange={(e) => update('customDomain', e.target.value)} placeholder="Enter your research domain" className={fieldClass}/></Field>}
      <Field label="Start date"><input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className={fieldClass}/></Field>
      <Field label="Expected end date"><input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} className={fieldClass}/></Field>
      <Field label="GitHub repository" className="md:col-span-2"><input type="url" value={form.githubUrl} onChange={(e) => update('githubUrl', e.target.value)} placeholder="https://github.com/owner/repository (optional)" className={fieldClass}/></Field>
    </div><div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"><Check size={17}/>{saving ? 'Creating...' : 'Create project'}</button></div></form>
  </div>;
}