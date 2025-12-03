/**
 * hotspotAuth middleware
 * - Verifies that requests come from the hotspot system via a shared secret
 * - Checks header 'x-hotspot-secret' or query param 'secret'
 *
 * Usage:
 * app.use('/api/hotspot', hotspotAuth);  // or apply per-route
 */

module.exports = (req, res, next) => {
  const secret = req.get('x-hotspot-secret') || req.query.secret;
  if (!secret || secret !== process.env.HOTSPOT_SHARED_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};


if (!process.env.HOTSPOT_SHARED_SECRET) {
    console.warn('HOTSPOT_SHARED_SECRET is not set; hotspot endpoints are unprotected!');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }
  if (!secret || secret !== process.env.HOTSPOT_SHARED_SECRET) {
    return res.status(403).json({ error: 'Forbidden: invalid hotspot secret' });
  }
  return next();
