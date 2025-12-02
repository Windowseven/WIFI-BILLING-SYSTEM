module.exports = (req, res, next) => {
  const secret = req.get('x-hotspot-secret') || req.query.secret;
  if (!secret || secret !== process.env.HOTSPOT_SHARED_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
