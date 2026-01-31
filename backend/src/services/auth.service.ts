import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma, jwtConfig } from '../config/index';
import { JwtPayload, TokenResponse, RegisterRequest } from '../types/index';
import { AppError } from '../middleware/error.middleware';

const SALT_ROUNDS = 12;

export const authService = {
  async register(data: RegisterRequest): Promise<TokenResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        trainingProviderId: data.trainingProviderId,
      },
    });

    // Create profile based on role
    if (data.role === UserRole.Learner) {
      await prisma.learnerProfile.create({
        data: {
          userId: user.id,
          name: data.name,
          trainingProviderId: data.trainingProviderId,
        },
      });
    } else if (data.role === UserRole.Trainer) {
      await prisma.trainerProfile.create({
        data: {
          userId: user.id,
          name: data.name,
          trainingProviderId: data.trainingProviderId,
        },
      });
    }

    const tokens = await this.generateTokens(user);
    return tokens;
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokens = await this.generateTokens(user);
    return tokens;
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    // Verify refresh token
    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, jwtConfig.refreshSecret) as JwtPayload;
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(storedToken.user);
    return tokens;
  },

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  },

  async generateTokens(user: {
    id: string;
    email: string;
    role: UserRole;
    trainingProviderId: string | null;
  }): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      trainingProviderId: user.trainingProviderId || undefined,
    };

    const accessOptions: SignOptions = {
      expiresIn: jwtConfig.accessExpiry as SignOptions['expiresIn'],
    };
    const accessToken = jwt.sign(payload, jwtConfig.accessSecret, accessOptions);

    const refreshOptions: SignOptions = {
      expiresIn: jwtConfig.refreshExpiry as SignOptions['expiresIn'],
    };
    const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, refreshOptions);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        trainingProviderId: user.trainingProviderId || undefined,
      },
    };
  },

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        learnerProfile: true,
        trainerProfile: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },
};

export default authService;
