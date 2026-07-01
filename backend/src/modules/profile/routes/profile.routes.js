const express = require('express');
const router = express.Router();
const profileController = require('../controller/profile.controller');
const { authMiddleware } = require('../../../common/middlewares/auth.middleware');
const { updateProfileValidator } = require('../validator/profile.validator');

// All profile endpoints require authentication
router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.put('/', updateProfileValidator, profileController.updateProfile);
router.patch('/', updateProfileValidator, profileController.updateProfile);
router.delete('/', profileController.deleteProfile);

module.exports = router;
