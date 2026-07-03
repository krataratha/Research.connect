import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import communitiesService from '../services/communities.service';

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    researchArea: '',
    tags: '',
    visibility: 'Public',
    joinApproval: false,
    guidelines: '',
    website: '',
    institution: '',
  });

  const mutation = useMutation({
    mutationFn: () => communitiesService.createCommunity({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }),
    onSuccess: (res) => {
      toast.success('Community created!');
      navigate(`/communities/${res.data.data.slug}`);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create community.'),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const autoSlug = () => {
    if (!form.slug && form.name) {
      setForm(prev => ({ ...prev, slug: form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Create Community
          </h1>
          <p className="text-gray-400 mt-2">Build a space for researchers who share your passion.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Community Name *</label>
            <input name="name" value={form.name} onChange={handleChange} onBlur={autoSlug}
              placeholder="AI for Climate Science"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Slug (URL handle)</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">/communities/</span>
              <input name="slug" value={form.slug} onChange={handleChange}
                placeholder="ai-for-climate-science"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="What is this community about?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none resize-none"
            />
          </div>

          {/* Research Area & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Research Area</label>
              <input name="researchArea" value={form.researchArea} onChange={handleChange}
                placeholder="Climate Science"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tags (comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="climate, AI, sustainability"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Visibility</label>
            <select name="visibility" value={form.visibility} onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
            >
              <option>Public</option>
              <option>Private</option>
              <option>Institution Only</option>
            </select>
          </div>

          {/* Join Approval */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="joinApproval" checked={form.joinApproval} onChange={handleChange}
              className="w-4 h-4 accent-violet-500"
            />
            <span className="text-sm text-gray-300">Require admin approval to join</span>
          </label>

          {/* Website & Institution */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Website</label>
              <input name="website" value={form.website} onChange={handleChange}
                placeholder="https://example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Institution</label>
              <input name="institution" value={form.institution} onChange={handleChange}
                placeholder="MIT"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={!form.name || mutation.isPending}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {mutation.isPending ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
