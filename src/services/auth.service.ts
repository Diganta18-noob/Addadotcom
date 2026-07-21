import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { ConflictError, UnauthorizedError, NotFoundError } from '../errors/AppError';

const JWT_ACCESS_SECRET = process.env.NEXTAUTH_SECRET || 'addadotcom_access_secret_2026';
const JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'addadotcom_refresh_secret_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  public static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        phone: input.phone || null,
        role: (input.role as any) || 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, ...tokens };
  }

  public static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return { user: safeUser, ...tokens };
  }

  public static generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: payload.userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  public static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  public static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}
