import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Save, FileText, Upload as UploadIcon, Trash2, Plus, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const UploadPublication = () => {
  const navigate = useNavigate();
  const [doiQuery, setDoiQuery] = useState('');
  const [fetchingDoi, setFetchingDoi] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    publisher: '',
    journal: '',
    publicationDate: new Date().toISOString().split('T')[0],
    publicationYear: new Date().getFullYear(),
    publicationType: 'journal',
    language: 'English',
    doi: '',
    pdfUrl: '',
    visibility: 'public',
  });

  const [authors, setAuthors] = useState([
    { displayName: '', authorOrder: 1, institution: '', isMe: true }
  ]);

  // File upload states
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFetchDoi = async () => {
    if (!doiQuery.trim()) return;
    setFetchingDoi(true);
    setError('');
    try {
      const response = await api.get(`/publications/metadata/doi?doi=${encodeURIComponent(doiQuery)}`);
      const meta = response.data.data;
      setFormData(prev => ({
        ...prev,
        title: meta.title || '',
        abstract: meta.abstract || '',
        publisher: meta.publisher || '',
        journal: meta.journal || '',
        publicationYear: meta.publicationYear || new Date().getFullYear(),
        doi: doiQuery.trim()
      }));

      if (meta.authors && meta.authors.length > 0) {
        setAuthors(meta.authors.map((a, index) => ({
          displayName: a.displayName || a.authorName,
          authorOrder: a.authorOrder || index + 1,
          institution: a.institution || '',
          isMe: index === 0
        })));
      }
    } catch (err) {
      setError('Failed to fetch metadata for this DOI. You can enter details manually.');
    } finally {
      setFetchingDoi(false);
    }
  };

  const handleAddAuthor = () => {
    setAuthors(prev => [
      ...prev,
      { displayName: '', authorOrder: prev.length + 1, institution: '', isMe: false }
    ]);
  };

  const handleRemoveAuthor = (index) => {
    setAuthors(prev => prev.filter((_, i) => i !== index).map((a, i) => ({ ...a, authorOrder: i + 1 })));
  };

  const handleAuthorChange = (index, field, value) => {
    setAuthors(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // 1. Create Publication metadata
      const payload = {
        ...formData,
        authors
      };
      
      const response = await api.post('/publications', payload);
      const newPub = response.data.data.publication;

      // 2. Upload file if selected
      if (file && newPub) {
        const filePayload = new FormData();
        filePayload.append('file', file);
        
        await api.post(`/publications/${newPub._id}/files`, filePayload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
      }

      navigate('/publications');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit publication');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left pb-16">
      
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/publications')} className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-all cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Index New Research Paper</h2>
          <p className="text-xs text-slate-500 mt-0.5">Connect a DOI to auto-fill metadata, or manually configure publication info and files.</p>
        </div>
      </div>

      {/* DOI Look-up Hub */}
      <div className="glass-card rounded-3xl p-6 bg-gradient-to-r from-blue-50/20 to-indigo-50/20 border border-blue-100/50 space-y-4">
        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Fast-track via DOI Lookup</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-2.5" />
            <input 
              type="text" 
              placeholder="e.g. 10.1016/j.jbi.2026.104230" 
              value={doiQuery}
              onChange={(e) => setDoiQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white"
            />
          </div>
          <button 
            type="button"
            onClick={handleFetchDoi}
            disabled={fetchingDoi}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:bg-blue-400"
          >
            {fetchingDoi ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Details'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>

      {/* Main Metadata Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-sm">
        
        {/* Core Metadata Fields */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">1. Publication Details</h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Publication Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="px-4 py-2 border border-slate-200 rounded-xl text-sm" placeholder="e.g. Attention-Driven Spatial Reasoning in Healthcare Diagnostics" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Abstract</label>
            <textarea name="abstract" value={formData.abstract} onChange={handleInputChange} required rows={4} className="px-4 py-2 border border-slate-200 rounded-xl text-sm" placeholder="Provide a summary of the methodology, results, and research impact..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Publication Type</label>
              <select name="publicationType" value={formData.publicationType} onChange={handleInputChange} className="px-4 py-2 border border-slate-200 rounded-xl text-sm">
                <option value="journal">Journal Article</option>
                <option value="conference">Conference Proceeding</option>
                <option value="book">Book</option>
                <option value="preprint">Preprint</option>
                <option value="patent">Patent</option>
                <option value="thesis">Thesis</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Journal Name / Venue</label>
              <input type="text" name="journal" value={formData.journal} onChange={handleInputChange} className="px-4 py-2 border border-slate-200 rounded-xl text-sm" placeholder="e.g. Nature Machine Intelligence" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">DOI Reference</label>
              <input type="text" name="doi" value={formData.doi} onChange={handleInputChange} className="px-4 py-2 border border-slate-200 rounded-xl text-sm" placeholder="10.xxxx/xxxx" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Publisher</label>
              <input type="text" name="publisher" value={formData.publisher} onChange={handleInputChange} className="px-4 py-2 border border-slate-200 rounded-xl text-sm" placeholder="e.g. IEEE, Springer" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Publication Date</label>
              <input type="date" name="publicationDate" value={formData.publicationDate} onChange={handleInputChange} className="px-4 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Publication Year</label>
              <input type="number" name="publicationYear" value={formData.publicationYear} onChange={handleInputChange} className="px-4 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>
        </div>

        {/* Dynamic Authors Management */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Author Details</h3>
            <button 
              type="button" 
              onClick={handleAddAuthor}
              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-slate-200/50"
            >
              <Plus className="w-3.5 h-3.5" /> Add Author
            </button>
          </div>

          <div className="space-y-3">
            {authors.map((author, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-6">#{author.authorOrder}</span>
                <input 
                  type="text" 
                  placeholder="Author Name" 
                  value={author.displayName}
                  onChange={(e) => handleAuthorChange(index, 'displayName', e.target.value)}
                  required
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50"
                />
                <input 
                  type="text" 
                  placeholder="Institution Affiliation" 
                  value={author.institution}
                  onChange={(e) => handleAuthorChange(index, 'institution', e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50"
                />
                {authors.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveAuthor(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* File upload box */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">3. File Upload</h3>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-all bg-slate-50/30 flex flex-col items-center justify-center">
            <UploadIcon className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Choose PDF, docx, or slide decks</p>
            <p className="text-xs text-slate-400 mt-1">Maximum file size: 10MB</p>
            <input 
              type="file" 
              accept=".pdf,.docx,.ppt,.pptx,.zip"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-4 text-xs font-medium text-slate-500 cursor-pointer"
            />
            {file && (
              <div className="mt-4 flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                <FileText className="w-4 h-4" />
                <span>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
            )}
            {uploadProgress > 0 && (
              <div className="w-full max-w-xs mt-3 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>
        </div>

        {/* Submit bar */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button 
            type="button" 
            onClick={() => navigate('/publications')}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:bg-blue-400"
          >
            <Save className="w-4 h-4" /> {saving ? 'Indexing...' : 'Index Publication'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default UploadPublication;
