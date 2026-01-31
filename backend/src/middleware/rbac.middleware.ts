import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthRequest } from './auth.middleware';

type RolePermissions = {
  [key in UserRole]: string[];
};

// Define permissions for each role
const rolePermissions: RolePermissions = {
  Learner: [
    'courses:read',
    'enrollments:read',
    'enrollments:create',
    'assessments:submit',
    'payments:create',
    'profile:read',
    'profile:update',
  ],
  Trainer: [
    'courses:read',
    'courses:update',
    'enrollments:read',
    'assessments:read',
    'assessments:grade',
    'profile:read',
    'profile:update',
  ],
  Admin: [
    'courses:read',
    'courses:create',
    'courses:update',
    'courses:delete',
    'courseRuns:read',
    'courseRuns:create',
    'courseRuns:update',
    'courseRuns:delete',
    'enrollments:read',
    'enrollments:create',
    'enrollments:update',
    'enrollments:delete',
    'assessments:read',
    'assessments:create',
    'assessments:update',
    'assessments:grade',
    'users:read',
    'users:create',
    'users:update',
    'payments:read',
    'funding:read',
    'funding:create',
    'profile:read',
    'profile:update',
  ],
  Developer: [
    'courses:read',
    'courses:create',
    'courses:update',
    'assessments:read',
    'assessments:create',
    'assessments:update',
    'profile:read',
    'profile:update',
  ],
  TrainingProvider: [
    'courses:read',
    'courses:create',
    'courses:update',
    'courses:delete',
    'courseRuns:read',
    'courseRuns:create',
    'courseRuns:update',
    'courseRuns:delete',
    'enrollments:read',
    'enrollments:create',
    'enrollments:update',
    'enrollments:delete',
    'assessments:read',
    'assessments:create',
    'assessments:update',
    'assessments:grade',
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'payments:read',
    'payments:refund',
    'funding:read',
    'funding:create',
    'funding:update',
    'settings:read',
    'settings:update',
    'profile:read',
    'profile:update',
  ],
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userPermissions = rolePermissions[req.user.role] || [];
    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: `Permission denied: ${permission}`,
      });
      return;
    }

    next();
  };
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
};

export default requireRole;
