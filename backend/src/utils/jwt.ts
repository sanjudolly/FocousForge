import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'focusforge_dev_secret_change_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE } as jwt.SignOptions);
};

export const verifyToken = (token: string): { id: string } => {
  return jwt.verify(token, JWT_SECRET) as { id: string };
};
