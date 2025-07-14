import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' } as jwt.SignOptions);
};
