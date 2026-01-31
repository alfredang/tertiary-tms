import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  trainingProviderId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  trainingProviderId?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    trainingProviderId?: string;
  };
}

export interface FeeCalculationRequest {
  enrollmentId: string;
  courseFee: number;
  discount?: number;
  skillsFutureCredit?: number;
  pseaClaim?: number;
  mcesClaim?: number;
  utapClaim?: number;
  ibfClaim?: number;
}

export interface FeeCalculationResult {
  grossCourseFee: number;
  discount: number;
  subtotalBeforeGst: number;
  gstAmount: number;
  totalWithGst: number;
  fundingBreakdown: {
    grantAmount: number;
    skillsFutureCredit: number;
    pseaClaim: number;
    mcesClaim: number;
    utapClaim: number;
    ibfClaim: number;
  };
  netPayable: number;
}

export interface CreatePaymentIntentRequest {
  enrollmentId: string;
  amount?: number;
  currency?: string;
  description?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}
