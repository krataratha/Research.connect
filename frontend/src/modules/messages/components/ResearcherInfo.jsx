import React from 'react';
import { Link } from 'react-router-dom';
import { User, Landmark, Calendar, FileText, Download, FileArchive } from 'lucide-react';

const ResearcherInfo = ({ participant, messages = [] }) => {
  if (!participant) return null;

  const { firstName, lastName, profileImage, username, institution, designation, connectedAt } = participant;
  const fullName = `${firstName} ${lastName}`;

  // Extract shared publications
  const sharedPublications = messages
    .filter(m => m.type === 'publication' && !m.deleted)
    .map(m => {
      try {
        return { ...JSON.parse(m.text), id: m._id };
      } catch (e) {
        return null;
      }
    })
    .filter(p => p !== null);

  // Extract shared files
  const sharedFiles = messages
    .filter(m => m.attachment && !m.deleted)
    .map(m => ({
      id: m._id,
      filename: m.attachment.filename,
      fileType: m.attachment.fileType,
      url: m.attachment.url,
      fileSize: m.attachment.fileSize
    }));

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full bg-white border-l border-slate-200 w-80 p-5 flex flex-col gap-6 text-left overflow-y-auto shrink-0 select-none">
      
      {/* Profile summary */}
      <div className="flex flex-col items-center text-center space-y-3 pb-5 border-b border-slate-100">
        <img
          src={profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
          alt={fullName}
          className="w-20 h-20 rounded-full object-cover border border-slate-200 shadow-sm"
        />
        <div className="space-y-0.5">
          <h4 className="text-sm font-black text-slate-900 leading-tight">
            {fullName}
          </h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
            {designation || 'Researcher'}
          </p>
          {institution && (
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
              <Landmark className="w-3.5 h-3.5" />
              <span>{institution}</span>
            </p>
          )}
        </div>

        <Link
          to={`/profile/${username}`}
          className="px-4 py-2 border border-slate-250 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer w-full text-center"
        >
          View Full Profile
        </Link>
      </div>

      {/* Shared Publications */}
      <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#2563EB]" />
          <span>Shared Publications ({sharedPublications.length})</span>
        </h5>
        
        {sharedPublications.length > 0 ? (
          <div className="space-y-2">
            {sharedPublications.map((pub, idx) => (
              <div 
                key={pub.id || idx}
                className="p-2.5 border border-slate-150 bg-slate-50/50 rounded-xl flex flex-col gap-1 text-left"
              >
                <h6 className="text-[11px] font-black text-slate-800 line-clamp-1">{pub.title}</h6>
                {pub.journal && (
                  <p className="text-[9px] text-slate-400 font-semibold italic">{pub.journal}</p>
                )}
                <a 
                  href={`/publication/${pub.slug}`}
                  className="text-[9px] font-bold text-[#2563EB] hover:underline block pt-1"
                >
                  Open Publication
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 font-bold italic py-2">
            No shared publications in this conversation
          </p>
        )}
      </div>

      {/* Shared Files */}
      <div className="space-y-3 pb-4">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileArchive className="w-4 h-4 text-[#2563EB]" />
          <span>Shared Files ({sharedFiles.length})</span>
        </h5>
        
        {sharedFiles.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sharedFiles.map((file) => (
              <div 
                key={file.id}
                className="p-2 border border-slate-150 rounded-xl flex items-center justify-between gap-3 bg-slate-50/30"
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-[10px] font-black text-slate-800 truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <span className="text-[8px] font-bold text-slate-400 block">
                    {formatSize(file.fileSize)}
                  </span>
                </div>
                <a 
                  href={file.url} 
                  download 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 font-bold italic py-2">
            No shared files in this conversation
          </p>
        )}
      </div>

    </div>
  );
};

export default ResearcherInfo;
export { formatSize };
