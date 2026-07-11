import React, { useState, useEffect, useRef } from "react";
import {
  ToggleLeft,
  ToggleRight,
  Users,
  MoreHorizontal,
  CheckCircle2,
  Handshake,
  Trash2,
  Link2,
} from "lucide-react";
import { TAG_STYLES } from "../data";
import Avatar from "./Avatar";
import { toast } from "react-hot-toast";

export default function ProjectCard({
  project,
  onToggleOpen,
  onApply,
  hasApplied,
  pendingCount,
  onViewApplications,
  onClick,
  onDelete,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/projects/${project.id}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success("Project link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link."));
    setIsDropdownOpen(false);
  };

  // Some projects don't define an icon — fall back to a sensible default
  // instead of letting React blow up on <undefined />.
  const Icon = project.icon || Users;
  const collaboratorCount = project.collaborators ?? project.members ?? 0;
  const coverClass = project.cover || "from-slate-900 via-slate-800 to-slate-700";
  const coverIconColor = project.coverIconColor || "text-slate-400";
  const statusColor = project.statusColor || "bg-slate-400";

  // Prevent clicks on interactive controls inside the card from also
  // triggering the "open details drawer" click on the card itself.
  function stop(e) {
    e.stopPropagation();
  }

  return (
    <div
      onClick={() => onClick?.(project)}
      className="flex cursor-pointer flex-col gap-4 border-b border-slate-100 py-5 last:border-0 sm:flex-row sm:items-center"
    >
      {/* Cover */}
      <div
        className={`relative flex h-24 w-full items-center justify-center rounded-xl bg-gradient-to-br sm:h-20 sm:w-32 ${coverClass}`}
      >
        <Icon size={36} className={coverIconColor} strokeWidth={1.5} />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold text-slate-800 hover:text-blue-600 cursor-pointer">
            {project.title}
          </h3>
          {project.openToCollaboration && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
              <Handshake size={11} /> Open to Collaboration
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-snug text-slate-500 line-clamp-2">
          {project.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.tags?.map((tag) => (
            <span
              key={tag}
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${TAG_STYLES[tag] || "bg-slate-100 text-slate-600"}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Created on {project.created} &nbsp;•&nbsp; Updated {project.updated}
        </p>

        {/* Owner control: mark this project open/closed to outside collaborators */}
        <button
          onClick={(e) => {
            stop(e);
            onToggleOpen(project.id);
          }}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          {project.openToCollaboration ? (
            <ToggleRight size={22} className="text-emerald-500" />
          ) : (
            <ToggleLeft size={22} className="text-slate-300" />
          )}
          {project.openToCollaboration
            ? "Open to collaboration"
            : "Closed to new collaborators"}
        </button>

        {pendingCount > 0 && (
          <button
            onClick={(e) => {
              stop(e);
              onViewApplications(project);
            }}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <Users size={13} />
            {pendingCount} pending {pendingCount === 1 ? "application" : "applications"}
          </button>
        )}
      </div>

      {/* Collaborators */}
      <div className="flex flex-col items-start gap-1 sm:w-36 sm:items-center">
        <div className="flex -space-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Avatar key={i} seed={`${project.title}${i}`} index={i} />
          ))}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[11px] font-semibold text-slate-500">
            +{project.extraAvatars ?? 0}
          </div>
        </div>
        <span className="text-xs text-slate-400">{collaboratorCount} Collaborators</span>
      </div>

      {/* Status + actions */}
      <div className="flex flex-row items-center gap-3 sm:w-44 sm:flex-col sm:items-end">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
          {project.status || "Unknown"}
        </span>
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              stop(e);
              onClick?.(project);
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            View Project
          </button>
          <button
            onClick={(e) => {
              stop(e);
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 cursor-pointer"
          >
            <MoreHorizontal size={16} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-20 w-44 rounded-xl border border-slate-150 bg-white p-1.5 shadow-xl text-left">
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Link2 size={13} />
                Copy Project Link
              </button>
              {project.isOwner && (
                <>
                  <button
                    onClick={(e) => {
                      stop(e);
                      onToggleOpen(project.id);
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {project.openToCollaboration ? (
                      <>
                        <ToggleRight className="text-emerald-500" size={14} />
                        Close Collaboration
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="text-slate-400" size={14} />
                        Open Collaboration
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      stop(e);
                      onDelete?.(project.id);
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Delete Project
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {project.openToCollaboration &&
          (hasApplied ? (
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 size={14} /> Application sent
            </span>
          ) : (
            <button
              onClick={(e) => {
                stop(e);
                onApply(project);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
            >
              <Handshake size={14} /> Apply to Collaborate
            </button>
          ))}
      </div>
    </div>
  );
}