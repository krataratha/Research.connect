const presenceService = require('../service/presence.service');

class PresenceController {
  async getPresence(req, res, next) {
    try {
      const { userId } = req.params;
      const data = await presenceService.getPresence(userId);
      res.status(200).json({
        success: true,
        message: 'Presence status retrieved successfully',
        data,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }

  async setOnline(req, res, next) {
    try {
      const { device } = req.body;
      const data = await presenceService.setOnline(req.user.id, device);
      res.status(200).json({
        success: true,
        message: 'User status set to online',
        data,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }

  async setOffline(req, res, next) {
    try {
      const data = await presenceService.setOffline(req.user.id);
      res.status(200).json({
        success: true,
        message: 'User status set to offline',
        data,
        error: null
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PresenceController();
