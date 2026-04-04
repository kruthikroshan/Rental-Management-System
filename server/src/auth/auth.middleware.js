import jwt from 'jsonwebtoken';
import { config } from '../config/configuration.js';
import { User } from '../users/users.model.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  process.stderr.write(`[AUTH] Token present: ${!!token}\n`);

  if (!token) {
    process.stderr.write(`[AUTH] ERROR: No token\n`);
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.userId = decoded.sub;
    req.userRole = decoded.role;

    const user = await User.findById(req.userId).lean();
    if (!user) {
      process.stderr.write(`[AUTH] ERROR: User not found for token subject ${req.userId}\n`);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };

    process.stderr.write(`[AUTH] OK - userId: ${req.userId} role: ${req.userRole}\n`);
    next();
  } catch (err) {
    process.stderr.write(`[AUTH] Verification failed: ${err.message}\n`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    process.stderr.write(`[requireRole] MIDDLEWARE CALL START\n`);
    try {
      console.log('[requireRole] Called with userId:', req.userId);
      if (!req.userId) {
        return res.status(401).json({ message: 'Unauthenticated' });
      }

      process.stderr.write(`[requireRole] About to findById: ${req.userId}\n`);
      const user = await User.findById(req.userId).lean();
      process.stderr.write(`[requireRole] findById returned: ${user ? 'user found' : 'null'}\n`);

      if (!user) {
        console.error('[requireRole] User not found for id:', req.userId);
        return res.status(401).json({ message: 'User not found' });
      }

      process.stderr.write(`[requireRole] Setting req.user\n`);
      req.user = { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
      console.log('[requireRole] User set:', { id: req.user.id, role: req.user.role });

      if (roles.length && !roles.includes(user.role)) {
        console.error('[requireRole] Role not allowed:', user.role, 'required:', roles);
        return res.status(403).json({ message: 'Forbidden' });
      }

      process.stderr.write(`[requireRole] Calling next()\n`);
      next();
    } catch (err) {
      process.stderr.write(`[requireRole] EXCEPTION: ${err.message}\n`);
      process.stderr.write(`[requireRole] Stack: ${err.stack}\n`);
      console.error('[requireRole] Exception:', err.message);
      res.status(500).json({ message: 'Auth error', details: err.message });
    }
  };
}

export function optionalRefreshContext(req, _res, next) {
  try {
    const rtCookie = req.cookies?.[config.cookies.name];
    if (!rtCookie) return next();
    const decoded = jwt.verify(rtCookie, config.jwt.refreshSecret);
    req.userIdFromRefresh = decoded.sub;
  } catch {
    // ignore
  }
  next();
}

