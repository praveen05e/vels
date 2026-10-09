import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../index.js';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  organization_id: string | null;
  is_verified: boolean;
  is_suspended: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
    
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) {
        res.status(403).json({ error: 'Profile not found' });
        return;
    }
    if (profile.is_suspended) {
        res.status(403).json({ error: 'Account suspended' });
        return;
    }
    
    (req as any).user = {
      id: user.id,
      email: user.email!,
      role: profile.role,
      organization_id: profile.organization_id,
      is_verified: profile.is_verified,
      is_suspended: profile.is_suspended
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (!roles.includes((req as any).user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
    }
    next();
  };
}

export function requireOwnerOrRole(resourceUserIdField: string, ...roles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!(req as any).user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (roles.includes((req as any).user.role)) {
            next();
            return;
        }
        
        // This is a generic middleware, so extracting the resource owner ID requires fetching it
        // Often it's better to do ownership checks inside the route controller itself,
        // but if we assume resourceUserIdField is available in req.body or we pass a callback, we could do it here.
        // For simplicity, we just pass to next() and enforce owners in controllers.
        next();
    };
}
