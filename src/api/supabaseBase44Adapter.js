import { apiRequest, tokenStore, userStore } from '@/lib/api-client'

const normalizeId = (row = {}, ...keys) => ({ ...row, id: keys.map((key) => row[key]).find(Boolean) || row.id })

function normalizeGym(row = {}, owner = {}) {
  return {
    ...row,
    id: row.gym_id || row.id,
    gym_id: row.gym_id || row.id,
    name: row.name || row.gym_name || '',
    gym_name: row.name || row.gym_name || '',
    mobile: row.phone || row.mobile || '',
    phone: row.phone || row.mobile || '',
    onboarding_completed: Boolean(owner?.onboarding_complete || row.onboarding_complete || row.status),
    onboarding_complete: Boolean(owner?.onboarding_complete || row.onboarding_complete || row.status),
    referral_code: row.referral_code || owner?.referral_code || '',
  }
}

function normalizeMember(row = {}) {
  const profile = row.profile || row.profiles || row.user_profile || {}
  const id = row.membership_id || row.member_id || row.id
  return {
    ...row,
    id,
    membership_id: row.membership_id || id,
    user_id: row.user_id,
    name: row.name || profile.full_name || profile.name || row.user_name || 'SE7EN FIT User',
    user_name: row.user_name || profile.full_name || profile.name || row.name || 'SE7EN FIT User',
    phone: row.phone || profile.phone || profile.mobile || '',
    email: row.email || profile.email || '',
    membership_plan: row.membership_plan || row.plan_code || row.plan || 'SE7EN FIT',
    membership_status: row.membership_status || row.status || 'active',
    conversion_status: row.conversion_status || (row.status === 'active' ? 'converted' : 'pending'),
    joined_date: row.joined_date || row.joined_at?.slice?.(0, 10) || row.join_date || row.created_at?.slice?.(0, 10),
    gym_linked_date: row.gym_linked_date || row.approved_at?.slice?.(0, 10),
    source: row.source || 'se7en_fit',
    referral_source: row.referral_source || row.referred_by_code || 'SE7EN FIT App',
    referred_by: row.referred_by || row.referred_by_code || '',
  }
}

function normalizeLead(row = {}) {
  return { ...row, id: row.lead_id || row.id, name: row.name || row.user_name || row.full_name || 'Lead', status: row.status || 'new' }
}

function normalizeAttendance(row = {}) {
  return { ...row, id: row.log_id || row.id, check_in_time: row.check_in_time || row.check_in_at, check_out_time: row.check_out_time || row.check_out_at, member_name: row.member_name || row.user_name || row.name || 'Member' }
}

function productionError(entityName) { return new Error(`${entityName} is not connected to a production API route yet.`) }
async function getCurrentGym() {
  const result = await apiRequest('/gym-owners/me')
  const gyms = result?.gyms || (result?.gym ? [result.gym] : [])
  return gyms[0] ? normalizeGym(gyms[0], result?.owner || {}) : null
}

function endpointAdapter(path, idKey, normalizer = (row) => row) {
  return {
    async list() { const rows = await apiRequest(path); return (Array.isArray(rows) ? rows : []).map((row) => normalizer(normalizeId(row, idKey))) },
    async filter(params = {}) { const rows = await this.list(); return rows.filter((row) => Object.entries(params).every(([key, value]) => !value || row[key] === value)) },
    async get(id) { const rows = await this.list(); return rows.find((row) => row.id === id || row[idKey] === id) || null },
    async create(payload = {}) { return normalizer(normalizeId(await apiRequest(path, { method: 'POST', body: payload }), idKey)) },
    async update(id, payload = {}) { return normalizer(normalizeId(await apiRequest(`${path}/${id}`, { method: 'PATCH', body: payload }), idKey)) },
    async delete(id) { await apiRequest(`${path}/${id}`, { method: 'DELETE' }); return { success: true } },
  }
}

const entityAdapters = {
  GymProfile: {
    async list() { const result = await apiRequest('/gym-owners/me'); const gyms = result?.gyms || (result?.gym ? [result.gym] : []); return gyms.map((gym) => normalizeGym(gym, result?.owner || {})) },
    async get() { const list = await this.list(); return list[0] || null },
    async create(payload = {}) { const result = await apiRequest('/gym-owners/onboarding', { method: 'POST', body: payload }); return normalizeGym(result?.gym || result, result?.owner || {}) },
    async update(_id, payload = {}) { return normalizeGym(await apiRequest('/gym-owners/me', { method: 'PUT', body: payload })) },
  },

  GymMember: {
    async list() { const rows = await apiRequest('/gym-owner/members'); return (Array.isArray(rows) ? rows : []).map(normalizeMember) },
    async filter(params = {}) { const rows = await this.list(); return rows.filter((row) => Object.entries(params).every(([key, value]) => !value || row[key] === value)) },
    async create(payload = {}) { return normalizeMember(await apiRequest('/gym-owner/members', { method: 'POST', body: { ...payload, name: payload.name || payload.user_name } })) },
    async update(id, payload = {}) { return normalizeMember(await apiRequest(`/gym-owner/members/${id}`, { method: 'PATCH', body: payload })) },
    async delete(id) { await apiRequest(`/gym-owner/members/${id}`, { method: 'DELETE' }); return { success: true } },
  },

  SE7ENFITReferredUser: {
    async list() { const rows = await apiRequest('/gym-owner/members'); return (Array.isArray(rows) ? rows : []).filter((row) => !row.manual).map(normalizeMember) },
    async filter(params = {}) { const rows = await this.list(); return rows.filter((row) => Object.entries(params).every(([key, value]) => !value || row[key] === value)) },
    async update(id, payload = {}) { const status = payload.membership_status || (payload.conversion_status === 'converted' ? 'active' : payload.status); return normalizeMember(await apiRequest(`/gym-owner/members/${id}`, { method: 'PATCH', body: { ...payload, status } })) },
    async create(payload = {}) { const gym = await getCurrentGym().catch(() => null); return normalizeLead(await apiRequest('/gym-leads', { method: 'POST', body: { ...payload, gym_id: gym?.gym_id, name: payload.user_name || payload.name, source: 'gym_owner' } })) },
  },

  GymLead: {
    async list() { const rows = await apiRequest('/gym-owner/leads'); return (Array.isArray(rows) ? rows : []).map(normalizeLead) },
    async filter(params = {}) { const rows = await this.list(); return rows.filter((row) => Object.entries(params).every(([key, value]) => !value || row[key] === value)) },
    async create(payload = {}) { const gym = await getCurrentGym().catch(() => null); return normalizeLead(await apiRequest('/gym-leads', { method: 'POST', body: { ...payload, gym_id: payload.gym_id || gym?.gym_id, source: 'gym_owner' } })) },
    async update(id, payload = {}) { return normalizeLead(await apiRequest(`/gym-owner/leads/${id}`, { method: 'PATCH', body: payload })) },
  },

  GymAttendance: {
    async list() { const rows = await apiRequest('/gym-owner/attendance'); return (Array.isArray(rows) ? rows : []).map(normalizeAttendance) },
    async filter(params = {}) { const rows = await this.list(); return rows.filter((row) => Object.entries(params).every(([key, value]) => !value || row[key] === value)) },
  },

  GymEquipment: endpointAdapter('/gym-owner/equipment', 'equipment_id'),
  GymPlan: endpointAdapter('/gym-owner/plans', 'plan_id'),
  MembershipPlan: endpointAdapter('/gym-owner/plans', 'plan_id'),
  GymClass: endpointAdapter('/gym-owner/classes', 'class_id'),
  ClassSchedule: endpointAdapter('/gym-owner/classes', 'class_id'),
  GymReview: endpointAdapter('/gym-owner/reviews', 'review_id'),
  Review: endpointAdapter('/gym-owner/reviews', 'review_id'),
  GymStaff: endpointAdapter('/gym-owner/staff', 'id'),
  StaffMember: endpointAdapter('/gym-owner/staff', 'id'),
  WorkoutPlan: endpointAdapter('/gym-owner/workout-plans', 'plan_id'),
  DietPlan: endpointAdapter('/gym-owner/diet-plans', 'plan_id'),

  Campaign: endpointAdapter('/gym-owner/advertisements', 'ad_id'),
  Advertisement: null,

  SupportTicket: {
    async list() { const rows = await apiRequest('/support/tickets/me'); return Array.isArray(rows) ? rows : [] },
    async create(payload = {}) { return apiRequest('/support/tickets', { method: 'POST', body: { ...payload, source: 'gym_owner' } }) },
  },

  GymReport: {
    async list() { const result = await apiRequest('/gym-owner/reports'); return result ? [result] : [] },
    async get() { return apiRequest('/gym-owner/reports') },
  },
}
entityAdapters.Advertisement = entityAdapters.Campaign

const entities = new Proxy({}, {
  get(target, entityName) {
    if (typeof entityName !== 'string') return target[entityName]
    if (!target[entityName]) target[entityName] = entityAdapters[entityName] || {
      async list() { throw productionError(entityName) },
      async filter() { throw productionError(entityName) },
      async get() { throw productionError(entityName) },
      async create() { throw productionError(entityName) },
      async update() { throw productionError(entityName) },
      async delete() { throw productionError(entityName) },
    }
    return target[entityName]
  },
})

export const base44 = {
  auth: {
    async loginViaEmailPassword(email, password) { const result = await apiRequest('/auth/login', { method: 'POST', body: { email, password, role: 'gym_owner' } }); if (result?.access_token) tokenStore.set(result.access_token); if (result?.user) userStore.set(result.user); return result },
    async register(payload = {}) { const result = await apiRequest('/auth/register', { method: 'POST', body: { email: payload.email, password: payload.password, role: 'gym_owner', owner_name: payload.ownerName || payload.name, full_name: payload.ownerName || payload.name, phone: payload.phone || payload.mobile, gym_name: payload.gymName } }); if (result?.access_token) tokenStore.set(result.access_token); if (result?.user) userStore.set(result.user); return result },
    async verifyOtp({ email, token, purpose = 'login' } = {}) { const result = await apiRequest('/auth/verify-otp', { method: 'POST', body: { email, otp_code: token, purpose } }); if (result?.access_token) tokenStore.set(result.access_token); if (result?.user) userStore.set(result.user); return result },
    async resendOtp(email, purpose = 'login') { return apiRequest('/auth/resend-otp', { method: 'POST', body: { email, purpose } }) },
    async loginWithGoogleCredential(idToken) { const result = await apiRequest('/auth/google', { method: 'POST', body: { idToken, role: 'gym_owner' } }); if (result?.access_token) tokenStore.set(result.access_token); if (result?.user) userStore.set(result.user); return result },
    async me() { const result = await apiRequest('/auth/me'); const user = result?.user || result; userStore.set(user); return user },
    async logout(redirectTo) { await apiRequest('/auth/logout', { method: 'POST' }).catch(() => null); tokenStore.clear(); userStore.clear(); if (redirectTo) window.location.href = redirectTo },
    setToken(token) { tokenStore.set(token) },
    async loginWithProvider() { throw new Error('Use Google credential login with the production backend.') },
    async resetPasswordRequest(email) { return apiRequest('/auth/reset-password-request', { method: 'POST', body: { email } }) },
    async resetPassword(payload = {}) { return apiRequest('/auth/reset-password', { method: 'POST', body: payload }) },
    redirectToLogin() { window.location.href = '/login' },
  },
  entities,
  integrations: { Core: { async UploadFile({ file, purpose = 'gym' }) { const form = new FormData(); form.append('file', file); form.append('purpose', purpose); const response = await apiRequest('/uploads/media', { method: 'POST', body: form }); return { url: response?.public_url || response?.asset?.public_url, asset: response?.asset || response } } } },
}
