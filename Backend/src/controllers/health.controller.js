export const getHealth = (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Server Running Successfully',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    },
    error: null
  });
};
