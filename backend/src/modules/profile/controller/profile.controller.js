const profileService = require('../service/profile.service');
const profileDTO = require('../dto/profile.dto');
const asyncHandler = require('../../../common/middlewares/asyncHandler.middleware');

class ProfileController {
  // Retrieve profile of current logged-in user
  getProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.getProfile(req.user._id);
    return res.success('Researcher profile retrieved successfully.', profileDTO.formatProfile(profile, req.user));
  });

  // Update profile
  updateProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.updateProfile(req.user._id, req.body);
    return res.success('Researcher profile updated successfully.', profileDTO.formatProfile(profile, req.user));
  });

  // Soft delete profile & account
  deleteProfile = asyncHandler(async (req, res) => {
    await profileService.deleteProfile(req.user._id, req.user._id);
    return res.success('Researcher account and profile successfully deleted.');
  });
}

module.exports = new ProfileController();
