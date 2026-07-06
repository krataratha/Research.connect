import { useState } from "react";
import ProjectCard from "./ProjectCard";
import ApplyCollaborationModal from "./ApplyCollaborationModal";
import projectsData from "../data/projects";

const ProjectsSection = () => {
  const [projects, setProjects] = useState(projectsData);

  const [selectedProject, setSelectedProject] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  const handleApply = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleSubmitApplication = () => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProject.id
          ? { ...project, applied: true }
          : project
      )
    );

    alert("🎉 Application Submitted Successfully!");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">

      {/* Header */}

      <div className="mb-10">

        <h1 className="text-4xl font-bold text-[#0F172A]">
          Research Projects
        </h1>

        <p className="text-[#475569] mt-2">
          Discover active research projects and collaborate with researchers.
        </p>

      </div>

      {/* Empty State */}

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center">

          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486740.png"
            alt="No Projects"
            className="w-28 mx-auto mb-6"
          />

          <h2 className="text-2xl font-semibold text-[#0F172A]">
            No Projects Available
          </h2>

          <p className="text-[#475569] mt-3">
            Researchers haven't published any collaboration opportunities yet.
          </p>

        </div>
      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {projects.map((project) => (

            <div key={project.id} className="relative">

              <ProjectCard
                project={project}
                onApply={handleApply}
              />

              {project.applied && (
                <div className="absolute top-5 right-5 bg-[#DCFCE7] text-[#22C55E] px-4 py-2 rounded-full text-sm font-semibold shadow">
                  ✓ Application Submitted
                </div>
              )}

            </div>

          ))}

        </div>

      )}

      <ApplyCollaborationModal
        project={selectedProject}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitApplication}
      />

    </div>
  );
};

export default ProjectsSection;