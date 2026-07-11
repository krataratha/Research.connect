const formatProject = (project, currentUserId = null) => {
  if (!project) return null;

  const source = project.toObject ? project.toObject() : project;
  return {
    id: source._id.toString(),
    title: source.title,
    description: source.description,
    status: source.status,
    imageUrl: source.imageUrl || '',
    researchAreas: source.researchAreas || [],
    owner: source.userId,
    collaborators: source.collaborators || [],
    isOwner: currentUserId ? source.userId?._id?.toString() === currentUserId.toString() || source.userId?.toString() === currentUserId.toString() : false,
    deadline: source.deadline,
    progress: source.progress ?? 0,
    visibility: source.visibility || 'Public',
    openToCollaboration: Boolean(source.openToCollaboration),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt
  };
};

const formatApplication = (application) => ({
  id: application._id.toString(),
  projectId: application.projectId.toString(),
  applicant: application.applicantId,
  applicantName: application.applicantId?.fullName || `${application.applicantId?.firstName || ''} ${application.applicantId?.lastName || ''}`.trim() || 'Researcher',
  message: application.message,
  status: application.status,
  appliedAt: application.createdAt
});

module.exports = {
  formatProject,
  formatProjectList: (projects, currentUserId) => projects.map((project) => formatProject(project, currentUserId)),
  formatApplication,
  formatApplicationList: (applications) => applications.map(formatApplication)
};
