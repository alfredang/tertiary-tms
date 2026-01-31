/**
 * API Client for Tertiary TMS Backend
 *
 * This client connects to the real backend API and replaces the localStorage-based
 * mock API service. Use the feature flag to switch between mock and real API.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Feature flag to switch between mock and real API
export const USE_REAL_BACKEND = import.meta.env.VITE_USE_REAL_BACKEND === 'true';

// Token management
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
};

// Generic fetch wrapper with auth
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for refresh token
  });

  // Handle token expiry
  if (response.status === 401) {
    // Try to refresh token
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry original request with new token
      (headers as Record<string, string>)['Authorization'] = `Bearer ${getAccessToken()}`;
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });
      return handleResponse(retryResponse);
    }
    // Refresh failed, clear token and redirect to login
    setAccessToken(null);
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return handleResponse(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data.data;
}

// Refresh token
async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.success && data.data.accessToken) {
      setAccessToken(data.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ==================== AUTH API ====================

export const authApi = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    setAccessToken(data.data.accessToken);
    return data.data;
  },

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    trainingProviderId?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    setAccessToken(data.data.accessToken);
    return data.data;
  },

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setAccessToken(null);
    }
  },

  async getCurrentUser() {
    return fetchWithAuth('/auth/me');
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ==================== COURSES API ====================

export const coursesApi = {
  async getAll(params?: {
    status?: string;
    courseType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    return fetchWithAuth(`/courses${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return fetchWithAuth(`/courses/${id}`);
  },

  async create(courseData: Record<string, unknown>) {
    return fetchWithAuth('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  async update(id: string, courseData: Record<string, unknown>) {
    return fetchWithAuth(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  async delete(id: string) {
    return fetchWithAuth(`/courses/${id}`, {
      method: 'DELETE',
    });
  },

  // Topics
  async addTopic(courseId: string, data: { title: string; sortOrder?: number }) {
    return fetchWithAuth(`/courses/${courseId}/topics`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTopic(topicId: string, data: { title?: string; sortOrder?: number }) {
    return fetchWithAuth(`/courses/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTopic(topicId: string) {
    return fetchWithAuth(`/courses/topics/${topicId}`, {
      method: 'DELETE',
    });
  },

  // Subtopics
  async addSubtopic(topicId: string, data: Record<string, unknown>) {
    return fetchWithAuth(`/courses/topics/${topicId}/subtopics`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateSubtopic(subtopicId: string, data: Record<string, unknown>) {
    return fetchWithAuth(`/courses/subtopics/${subtopicId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteSubtopic(subtopicId: string) {
    return fetchWithAuth(`/courses/subtopics/${subtopicId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== COURSE RUNS API ====================

export const courseRunsApi = {
  async getAll(params?: { courseId?: string; trainerId?: string; classStatus?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    return fetchWithAuth(`/course-runs${query ? `?${query}` : ''}`);
  },

  async getUpcoming() {
    return fetchWithAuth('/course-runs/upcoming');
  },

  async getOngoing() {
    return fetchWithAuth('/course-runs/ongoing');
  },

  async getCompleted() {
    return fetchWithAuth('/course-runs/completed');
  },

  async getById(id: string) {
    return fetchWithAuth(`/course-runs/${id}`);
  },

  async create(data: Record<string, unknown>) {
    return fetchWithAuth('/course-runs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    return fetchWithAuth(`/course-runs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return fetchWithAuth(`/course-runs/${id}`, {
      method: 'DELETE',
    });
  },

  async assignTrainer(courseRunId: string, trainerId: string) {
    return fetchWithAuth(`/course-runs/${courseRunId}/assign-trainer`, {
      method: 'POST',
      body: JSON.stringify({ trainerId }),
    });
  },
};

// ==================== ENROLLMENTS API ====================

export const enrollmentsApi = {
  async getAll(params?: {
    courseRunId?: string;
    learnerId?: string;
    enrollmentStatus?: string;
    paymentStatus?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    return fetchWithAuth(`/enrollments${query ? `?${query}` : ''}`);
  },

  async getMyEnrollments() {
    return fetchWithAuth('/enrollments/my');
  },

  async getById(id: string) {
    return fetchWithAuth(`/enrollments/${id}`);
  },

  async create(data: {
    courseRunId: string;
    learnerId: string;
    sponsorshipType?: string;
    paymentMode?: string;
    employer?: Record<string, unknown>;
  }) {
    return fetchWithAuth('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    return fetchWithAuth(`/enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return fetchWithAuth(`/enrollments/${id}`, {
      method: 'DELETE',
    });
  },

  async completeSubtopic(enrollmentId: string, subtopicId: string) {
    return fetchWithAuth(`/enrollments/${enrollmentId}/complete-subtopic/${subtopicId}`, {
      method: 'POST',
    });
  },

  async toggleBookmark(enrollmentId: string, subtopicId: string) {
    return fetchWithAuth(`/enrollments/${enrollmentId}/bookmark/${subtopicId}`, {
      method: 'POST',
    });
  },

  async submitAssessment(enrollmentId: string, assessmentId: string, data: {
    fileName: string;
    fileUrl: string;
  }) {
    return fetchWithAuth(`/enrollments/${enrollmentId}/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGrade(enrollmentId: string, assessmentId: string, status: string) {
    return fetchWithAuth(`/enrollments/${enrollmentId}/assessments/${assessmentId}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// ==================== PAYMENTS API ====================

export const paymentsApi = {
  async getConfig() {
    return fetchWithAuth('/payments/config');
  },

  async calculateFees(data: {
    enrollmentId: string;
    discount?: number;
    skillsFutureCredit?: number;
    pseaClaim?: number;
    utapClaim?: number;
    ibfClaim?: number;
    isSmeEmployer?: boolean;
  }) {
    return fetchWithAuth('/payments/calculate-fees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createPaymentIntent(data: {
    enrollmentId: string;
    amount?: number;
    currency?: string;
    description?: string;
  }) {
    return fetchWithAuth('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getByEnrollment(enrollmentId: string) {
    return fetchWithAuth(`/payments/enrollment/${enrollmentId}`);
  },

  async refund(paymentId: string, amount?: number) {
    return fetchWithAuth(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },
};

// ==================== COMBINED API EXPORT ====================

export const api = {
  auth: authApi,
  courses: coursesApi,
  courseRuns: courseRunsApi,
  enrollments: enrollmentsApi,
  payments: paymentsApi,
};

export default api;
