import { supabase } from '@/lib/supabaseClient'
import { tokenStore, userStore } from '@/lib/api-client'

const entityTables = {
  GymProfile: 'gyms',
  GymMember: 'members',
  Member: 'members',
  Profile: 'profiles',
}

const primaryKeys = {
  gyms: 'gym_id',
  members: 'member_id',
  profiles: 'user_id',
}

const ownerColumns = {
  gyms: 'owner_profile_id',
}

const singletonEntities = new Set(['GymProfile', 'Profile'])

function toTableName(entityName) {
  if (entityTables[entityName]) return entityTables[entityName]
  const snake = String(entityName)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase()
  return snake.endsWith('s') ? snake : `${snake}s`
}

function authRedirect(path) {
  return `${window.location.origin}${path}`
}

async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data?.user || null
}

function isMissingTable(error) {
  return ['42P01', 'PGRST106', 'PGRST116', 'PGRST205'].includes(error?.code)
}

function normalizeRow(entityName, row) {
  if (!row) return row
  const table = toTableName(entityName)
  const pk = primaryKeys[table] || 'id'
  const normalized = { ...row, id: row.id || row[pk] }

  if (entityName === 'GymProfile') {
    normalized.gym_name = row.gym_name || row.name || ''
    normalized.mobile = row.mobile || row.phone || ''
  }

  return normalized
}

function normalizePayload(entityName, payload = {}, user) {
  const table = toTableName(entityName)
  const next = { ...payload }
  delete next.id

  if (table === 'gyms') {
    next.owner_profile_id = user?.id
    next.name = next.name || next.gym_name || ''
    next.phone = next.phone || next.mobile || ''
    delete next.gym_name
    delete next.mobile
  }

  if (table === 'profiles') {
    next.user_id = user?.id
    next.email = next.email || user?.email || null
    next.role = next.role || 'gym_owner'
  }

  return next
}

function createEntityAdapter(entityName) {
  const table = toTableName(entityName)
  const primaryKey = primaryKeys[table] || 'id'
  const ownerColumn = ownerColumns[table]
  const singleton = singletonEntities.has(entityName)

  function scopedQuery(user) {
    let query = supabase.from(table).select('*')
    if (table === 'profiles') query = query.eq('user_id', user.id)
    if (ownerColumn) query = query.eq(ownerColumn, user.id)
    return query
  }

  return {
    async list() {
      const user = await getUser()
      if (!user) return []
      const { data, error } = await scopedQuery(user)
      if (error) {
        if (isMissingTable(error)) return []
        throw error
      }
      return (data || []).map((row) => normalizeRow(entityName, row))
    },

    async filter(params = {}) {
      const user = await getUser()
      if (!user) return []
      let query = scopedQuery(user)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') query = query.eq(key, value)
      })
      const { data, error } = await query
      if (error) {
        if (isMissingTable(error)) return []
        throw error
      }
      return (data || []).map((row) => normalizeRow(entityName, row))
    },

    async get(id) {
      const user = await getUser()
      if (!user) return null
      let query = scopedQuery(user)
      if (!singleton && id) query = query.eq(primaryKey, id)
      const { data, error } = await query.maybeSingle()
      if (error) {
        if (isMissingTable(error)) return null
        throw error
      }
      return normalizeRow(entityName, data)
    },

    async create(payload = {}) {
      const user = await getUser()
      if (!user) throw new Error('Authentication required')
      const body = normalizePayload(entityName, payload, user)
      const { data, error } = await supabase.from(table).insert(body).select('*').single()
      if (error) throw error
      return normalizeRow(entityName, data)
    },

    async update(id, payload = {}) {
      const user = await getUser()
      if (!user) throw new Error('Authentication required')
      const body = normalizePayload(entityName, payload, user)
      let query = supabase.from(table).update(body).select('*')
      if (singleton) {
        if (table === 'profiles') query = query.eq('user_id', user.id)
        if (ownerColumn) query = query.eq(ownerColumn, user.id)
      } else {
        query = query.eq(primaryKey, id)
      }
      const { data, error } = await query.maybeSingle()
      if (error) throw error
      return normalizeRow(entityName, data)
    },

    async delete(id) {
      const user = await getUser()
      if (!user) throw new Error('Authentication required')
      const { error } = await supabase.from(table).delete().eq(primaryKey, id)
      if (error) throw error
      return { success: true }
    },
  }
}

const entities = new Proxy({}, {
  get(target, entityName) {
    if (typeof entityName !== 'string') return target[entityName]
    if (!target[entityName]) target[entityName] = createEntityAdapter(entityName)
    return target[entityName]
  },
})

export const base44 = {
  auth: {
    async loginViaEmailPassword(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const message = String(error.message || '')
        if (message.toLowerCase().includes('email not confirmed')) {
          await supabase.auth.resend({ type: 'signup', email }).catch(() => null)
          throw new Error('Email is not verified. We sent a new verification email. Please verify and try again.')
        }
        throw error
      }
      tokenStore.set(data.session?.access_token)
      userStore.set(data.user)
      return { access_token: data.session?.access_token, token: data.session?.access_token, user: data.user }
    },

    async register(payload = {}) {
      const email = payload.email
      const password = payload.password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: authRedirect('/login'),
          data: {
            role: 'gym_owner',
            full_name: payload.name || payload.ownerName || email?.split('@')[0] || 'Gym Owner',
            phone: payload.phone || payload.mobile || null,
            gym_name: payload.gymName || null,
          },
        },
      })
      if (error) throw error
      tokenStore.set(data.session?.access_token)
      userStore.set(data.user)
      return {
        access_token: data.session?.access_token,
        token: data.session?.access_token,
        user: data.user,
        requires_email_verification: Boolean(data.user && !data.session),
      }
    },

    async resetPasswordRequest(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: authRedirect('/reset-password'),
      })
      if (error) throw error
      return { success: true }
    },

    async resetPassword({ newPassword }) {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) throw new Error('Reset link expired or invalid. Please request a new password reset email.')
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      return { success: true }
    },

    async loginWithGoogleCredential() {
      throw new Error('Google login must be enabled in Supabase Auth providers before use.')
    },

    async verifyOtp({ email, token, type = 'email' } = {}) {
      if (!email || !token) return { access_token: tokenStore.get() }
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type })
      if (error) throw error
      tokenStore.set(data.session?.access_token)
      userStore.set(data.user)
      return { access_token: data.session?.access_token, token: data.session?.access_token, user: data.user }
    },

    async resendOtp(email) {
      if (!email) return { success: true }
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      return { success: true }
    },

    async me() {
      const user = await getUser()
      if (!user) throw new Error('Authentication required')
      const { data } = await supabase.auth.getSession()
      tokenStore.set(data.session?.access_token)
      userStore.set(user)
      return user
    },

    async logout(redirectTo) {
      await supabase.auth.signOut()
      tokenStore.clear()
      userStore.clear()
      if (redirectTo) window.location.href = redirectTo
    },

    setToken(token) {
      tokenStore.set(token)
    },

    async loginWithProvider(provider) {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider })
      if (error) throw error
      return data
    },

    redirectToLogin() {
      window.location.href = '/login'
    },
  },
  entities,
}
