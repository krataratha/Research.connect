import {
  Calendar,
  Users,
  GraduationCap,
  Briefcase,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const ProjectCard = ({ project, onApply }) => {
  return (
    <div className="group bg-white rounded-3xl border border-[#E2E8F0] hover:border-[#2563EB]/30 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] p-6 text-white">

        <div className="flex justify-between items-start">

          <div>
            <h2 className="text-2xl font-bold">
              {project.title}
            </h2>

            <p className="text-blue-100 mt-2 text-sm">
              {project.institution}
            </p>
          </div>

          {project.openForCollaboration ? (
  <span className="bg-[#DCFCE7] text-[#22C55E] px-3 py-1 rounded-full text-xs font-semibold">
    🟢 Open for Collaboration
  </span>
) : (
  <span className="bg-red-100 text-[#EF4444] px-3 py-1 rounded-full text-xs font-semibold">
    🔒 Collaboration Closed
  </span>
)}
          

        </div>

      </div>

      {/* Body */}
      <div className="p-6">

        <p className="text-[#475569] leading-7">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-5">

          {project.tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#EDE9FE] text-[#4F46E5] px-3 py-1 rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}

        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-4 mt-6 text-sm">

          <div className="flex items-center gap-2 text-[#475569]">
            <GraduationCap className="text-[#2563EB]" size={18} />
            <span>{project.researcher}</span>
          </div>

          <div className="flex items-center gap-2 text-[#475569]">
            <Users className="text-[#2563EB]" size={18} />
            <span>{project.members} Members</span>
          </div>

          <div className="flex items-center gap-2 text-[#475569]">
            <Calendar className="text-[#2563EB]" size={18} />
            <span>{project.duration}</span>
          </div>

          <div className="flex items-center gap-2 text-[#475569]">
            <Briefcase className="text-[#2563EB]" size={18} />
            <span>{project.positions} Positions</span>
          </div>

        </div>

        {/* Skills */}
        <div className="mt-7">

          <h4 className="font-semibold text-[#0F172A] mb-3">
            Required Skills
          </h4>

          <div className="flex flex-wrap gap-2">

            {project.skills.map((skill) => (
              <span
                key={skill}
                className="border border-[#E2E8F0] px-3 py-2 rounded-xl text-sm text-[#475569] hover:bg-[#DBEAFE] transition"
              >
                {skill}
              </span>
            ))}

          </div>

        </div>

        {/* Progress */}
        <div className="mt-8">

          <div className="flex justify-between mb-2">

            <span className="text-sm text-[#475569]">
              Research Progress
            </span>

            <span className="font-semibold text-[#0F172A]">
              {project.progress}%
            </span>

          </div>

          <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] rounded-full transition-all duration-700"
              style={{ width: `${project.progress}%` }}
            />

          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-between items-center">

          <div>

            <p className="text-xs text-[#475569]">
              Seats Available
            </p>

            <p className="font-bold text-[#0F172A] text-lg">
              {project.positions}
            </p>

          </div>

          {project.applied ? (
            <button
              disabled
              className="bg-[#DCFCE7] text-[#22C55E] px-6 py-3 rounded-xl font-semibold cursor-default"
            >
              ✓ Applied
            </button>
          ) : project.openForCollaboration ? (
            <button
              onClick={() => onApply(project)}
              className="group/button flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <Sparkles size={18} />
              Apply to Collaborate
              <ArrowRight
                size={18}
                className="group-hover/button:translate-x-1 transition-transform"
              />
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-200 text-gray-500 px-6 py-3 rounded-xl cursor-not-allowed"
            >
              Collaboration Closed
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default ProjectCard;