import { apiRequest, safeList, safeOne, tokenStore, userStore } from '@/lib/api-client';

const endpointMap = {
  GymProfile: ['/api/gym-owner/profile', '/api/owner/profile', '/api/gym-profile'],
  GymMember: ['/api/gym-owner/members', '/api/members'],
  SE7ENFITReferredUser: ['/api/gym-owner/referrals', '/api/referrals'],
  Payment: ['/api/gym-owner/payments', '/api/payments'],
  Lead: ['/api/gym-owner/leads', '/api/leads'],
  AttendanceRecord: ['/api/gym-owner/attendance', '/api/attendance'],
  Campaign: ['/api/gym-owner/campaigns', '/api/campaigns'],
  Equipment: ['/api/gym-owner/equipment', '/api/equipment'],
  Review: ['/api/gym-owner/reviews', '/api/reviews'],
  AssignedWorkoutPlan: ['/api/gym-owner/assigned-workouts', '/api/assigned-workouts'],
  AssignedDietPlan: ['/api/gym-owner/assigned-diets', '/api/assigned-diets'],
  WhatsAppMessage: ['/api/gym-owner/whatsapp', '/api/whatsapp'],
  EmailMessage: ['/api/gym-owner/email-notifications', '/api/email-notifications'],
  Challenge: ['/api/gym-owner/challenges', '/api/challenges'],
  Staff: ['/api/gym-owner/staff', '/api/staff'],
  Class: ['/api/gym-owner/classes', '/api/classes'],
  WorkoutPlan: ['/api/gym-owner/workout-plans', '/api/workout-plans'],
  DietPlan: ['/api/gym-owner/diet-plans', '/api/diet-plans'],
  Plan: ['/api/gym-owner/plans', '/api/plans'],
  Notification: ['/api/notifications'],
};

const pathsFor = (entityName) => endpointMap[entityName] || [`/api/gym-owner/${entityName}`];

function persistAuth(result) {
  const token = result?.token || result?.access_token;
  if (!token) throw new Error('No token returned from backend.');
  tokenStore.set(token);
  userStore.set(result.user || null);
  return result;
}

const createEntityAdapter = (entityName) => ({
  async list() {
    return safeList(pathsFor(entityName));
  },
  async filter(params = {}) {
    const query = new URLSearchParams(params).toString();
    return safeList(pathsFor(entityName).map((path) => `${path}${query ? `?${query}` : ''}`));
  },
  async get(id) {
    return safeOne(pathsFor(entityName).map((path) => `${path}/${id}`));
  },
  async create(payload) {
    return apiRequest(pathsFor(entityName)[0], { method: 'POST', body: payload });
  },
  async update(id, payload) {
    return apiRequest(`${pathsFor(entityName)[0]}/${id}`, { method: 'PUT', body: payload });
  },
  async delete(id) {
    return apiRequest(`${pathsFor(entityName)[0]}/${id}`, { method: 'DELETE' });
  },
});

const entities = new Proxy({}, {
  get(target, entityName) {
    if (typeof entityName !== 'string') return target[entityName];
    if (!target[entityName]) target[entityName] = createEntityAdapter(entityName);
    return target[entityName];
  },
});

export const base44 = {
  auth: {
    async loginViaEmailPassword(email, password) {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password, role: 'gym_owner' },
      });
      return persistAuth(result);
    },
    async loginWithGoogleCredential(idToken) {
      const result = await apiRequest('/api/auth/google', {
        method: 'POST',
        body: { idToken, role: 'gym_owner' },
      });
      return persistAuth(result);
    },
    async register(payload) {
      const result = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name: payload.name || payload.ownerName || payload.email?.split('@')[0] || 'Gym Owner',
          email: payload.email,
          phone: payload.phone || payload.mobile || undefined,
          password: payload.password,
          role: 'gym_owner',
          gymName: payload.gymName || undefined,
        },
      });
      const token = result.token || result.access_token;
      if (token) tokenStore.set(token);
      if (result.user) userStore.set(result.user);
      return result;
    },
    async verifyOtp() {
      return { access_token: tokenStore.get() };
    },
    async resendOtp() {
      return { success: true };
    },
    async me() {
      try {
        const user = await apiRequest('/api/auth/me');
        userStore.set(user);
        return user;
      } catch (error) {
        const cached = userStore.get();
        if (cached) return cached;
        throw error;
      }
    },
    async logout() {
      await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => null);
      tokenStore.clear();
      userStore.clear();
    },
    setToken(token) {
      tokenStore.set(token);
    },
    async loginWithProvider(provider) {
      if (provider === 'google') {
        throw new Error('Use the Google identity button on this page.');
      }
      throw new Error('Provider is not supported.');
    },
    redirectToLogin() {
      window.location.href = '/login';
    },
  },
  entities,
};
