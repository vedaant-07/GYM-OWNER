import { apiRequest, tokenStore, userStore } from '@/lib/api-client'

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
  return {
    ...row,
    id: row.membership_id || row.member_id || row.id,
    membership_id: row.membership_id,
    user_id: row.user_id,
    name: row.name || profile.full_name || profile.name || row.user_name || 'SE7EN FIT User',
    user_name: row.user_name || profile.full_name || profile.name || row.name || 'SE7EN FIT User',
    phone: row.phone || profile.phone || profile.mobile || '',
    email: row.email || profile.email || '',
    membership_plan: row.membership_plan || row.plan_code || row.plan || 'SE7EN FIT',
    membership_status: row.membership_status || row.status || 'active',
    conversion_status: row.conversion_status || (row.status === 'active' ? 'converted' : 'pending'),
    joined_date: row.joined_date || row.joined_at?.slice?.(0, 10) || row.created_at?.slice?.(0, 10),
    gym_linked_date: row.gym_linked_date || row.approved_at?.slice?.(0, 10),
    source: row.source || 'se7en_fit',
    referral_source: row.referral_source || row.referred_by_code || 'SE7EN FIT App',
    referred_by: row.referred_by || row.referred_by_code || '',
  }
}

function normalizeLead(row = {}) {
  return {
    ...row,
    id: row.lead_id || row.id,
    name: row.name || row.user_name || row.full_name || 'Lead',
    status: row.status || 'new',
  }
}

function normalizeLeadAsMember(row = {}) {
  const leadId = row.lead_id || row.id
  return {
    ...row,
    id: `lead-${leadId}`,
    lead_id: leadId,
    name: row.name || row.user_name || 'Manual Member',
    user_name: row.name || row.user_name || 'Manual Member',
    phone: row.phone || '',
    email: row.email || '',
    membership_plan: row.membership_plan || row.subscription_plan || 'Manual',
    status: row.status === 'lost' ? 'removed' : 'active',
    membership_status: row.status === 'lost' ? 'removed' : 'active',
    conversion_status: row.status === 'lost' ? 'lost' : 'converted',
    source: row.source || 'walk_in',
    referral_source: 'Gym Owner',
    joined_date: row.created_at?.slice?.(0, 10),
    notes: row.notes || row.message || '',
  }
}

function normalizeAttendance(row = {}) {
  return {
    ...row,
    id: row.log_id || row.id,
    check_in_time: row.check_in_time || row.check_in_at,
    check_out_time: row.check_out_time || row.check_out_at,
    member_name: row.member_name || row.user_name || row.name || 'Member',
  }
}

function normalizeEquipment(row = {}) { return { ...row, id: row.equipment_id || row.id } }
function normalizeAd(row = {}) { return { ...row, id: row.ad_id || row.id } }
function isLeadMember(id) { return String(id || '').startsWith('lead-') }
function getLeadId(id) { return String(id || '').split('lead-').join('') }
function productionError(entityName) { return new Error(`${entityName} is not connected to a production API route yet.`) }

async function getCurrentGym() {
  const result = await apiRequest('/gym-owners/me')
  const gyms = result?.gyms || (result?.gym ? [result.gym] : [])
  return gyms[0] ? normalizeGym(gyms[0], result?.owner || {}) : null
}

async function getConvertedLeadsAsMembers() {
  const rows = await apiRequest('/gym-owner/leads')
  return (Array.isArray(rows) ? rows : []).filter((lead) => ['converted', 'active'].includes(lead.status)).map(normalizeLeadAsMember)
}

const entityAdapters = {
  GymProfile: {
    async list() {
      const result = await apiRequest('/gym-owners/me')
      const gyms = result?.gyms || (result?.gym ? [result.gym] : [])
      return gyms.map((gym) => normalizeGym(gym, result?.owner || {}))
    },
    async get() { const list = await this.list(); return list[0] || null },
    async create(payload = {}) {
      const result = await apiRequest('/gym-owners/onboarding', { method: 'POST', body: payload })
      return normalizeGym(result?.gym || result, result?.owner || {})
    },
    async update(_id, payload = {}) {
      const result = await apiRequest('/gym-owners/me', { method: 'PUT', body: payload })
      return normalizeGym(result)
    },
  },

  GymMember: {
    async list() {
      const appMembers = await apiRequest('/gym-owner/members')
      const manualMembers = await getConvertedLeadsAsMembers().catch(() => [])
      return [...(Array.isArray(appMembers) ? appMembers : []).map(normalizeMember), ...manualMembers]
    },
    async filter(params = {}) {
      const rows = await this.list()
      return rows.filter((row) => Object.entries(params).every(([key, value]) => !value || row[key] === value))
    },
    async update(id, payload = {}) {
      if (isLeadMember(id)) {
        const result = await apiRequest(`/gym-owner/leads/${getLeadId(id)}`, { method: 'PATCH', body: { ...payload, name: payload.name || payload.user_name, status: payload.status === 'removed' ? 'lost' : 'converted' } })
        return normalizeLeadAsMember(result)
      }
      const result = await apiRequest(`/gym-owner/members/${id}`, { method: 'PATCH', body: payload })
      return normalizeMember(result)
    },
    async create(payload = {}) {
      const gym = await getCurrentGym().catch(() => null)
      const created = await apiRequest('/gym-leads', { method: 'POST', body: { ...payload, gym_id: gym?.gym_id, name: payload.name || payload.user_name, source: payload.source || 'gym_owner', message: payload.notes || '' } })
      const updated = await apiRequest(`/gym-owner/leads/${created.lead_id || created.id}`, { method: 'PATCH', body: { status: 'converted' } }).catch(() => created)
      return normalizeLeadAsMember(updated)
    },
    async delete(id) {
      if (isLeadMember(id)) await apiRequest(`/gym-owner/leads/${getLeadId(id)}`, { method: 'PATCH', body: { status: 'lost' } })
      else await apiRequest(`/gym-owner/members/${id}`, { method: 'PATCH', body: { status: 'removed' } })
      return { success: true }
    },
  },

  SE7ENFITReferredUser: {
    async list() { const rows = await apiRequest('/gym-owner/members'); return (Array.isArray(rows) ? rows : []).map(normalizeMember) },
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

  GymEquipment: {
    async list() { const rows = await apiRequest('/gym-owner/equipment'); return (Array.isArray(rows) ? rows : []).map(normalizeEquipment) },
    async create(payload = {}) { return normalizeEquipment(await apiRequest('/gym-owner/equipment', { method: 'POST', body: payload })) },
    async update(id, payload = {}) { return normalizeEquipment(await apiRequest(`/gym-owner/equipment/${id}`, { method: 'PATCH', body: payload })) },
    async delete(id) { await apiRequest(`/gym-owner/equipment/${id}`, { method: 'DELETE' }); return { success: true } },
  },

  Campaign: {
    async list() { const rows = await apiRequest('/gym-owner/advertisements'); return (Array.isArray(rows) ? rows : []).map(normalizeAd) },
    async create(payload = {}) { return normalizeAd(await apiRequest('/gym-owner/advertisements', { method: 'POST', body: payload })) },
    async update(id, payload = {}) { return normalizeAd(await apiRequest(`/gym-owner/advertisements/${id}`, { method: 'PATCH', body: payload })) },
    async delete(id) { await apiRequest(`/gym-owner/advertisements/${id}`, { method: 'DELETE' }); return { success: true } },
  },

  Advertisement: null,
  GymPlan: null,
  SupportTicket: {
    async list() { const rows = await apiRequest('/support/tickets/me'); return Array.isArray(rows) ? rows : [] },
    async create(payload = {}) { return apiRequest('/support/tickets', { method: 'POST', body: { ...payload, source: 'gym_owner' } }) },
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
