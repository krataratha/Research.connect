class ProfileDTO {
  formatProfile(profile, user = null) {
    if (!profile) return null;
    return {
      profileId: profile._id,
      userId: profile.userId,
      bio: profile.bio || '',
      country: profile.country || '',
      institution: profile.institution || '',
      department: profile.department || '',
      designation: profile.designation || '',
      company: profile.company || '',
      division: profile.division || '',
      position: profile.position || '',
      socialLinks: {
        orcid: profile.socialLinks?.orcid || '',
        googleScholar: profile.socialLinks?.googleScholar || '',
        researchGate: profile.socialLinks?.researchGate || '',
        linkedin: profile.socialLinks?.linkedin || '',
        website: profile.socialLinks?.website || ''
      },
      profileCompletion: profile.profileCompletion || 0,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      // If user details are loaded / attached
      ...(user && {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName || `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          profileImage: user.profileImage || ''
        }
      })
    };
  }
}

module.exports = new ProfileDTO();
