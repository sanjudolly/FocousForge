import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
  user?: { id: string; email: string };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Not authorized. No token.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found.' });
      return;
    }

    req.userId = decoded.id;
    req.user = { id: decoded.id, email: user.email };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};
