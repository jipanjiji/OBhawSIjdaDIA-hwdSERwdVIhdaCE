<template>
  <div class="min-h-screen">
    <AppHeader @logout="handleLogout" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Page header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h2 class="text-2xl font-bold text-obsidia-text">Dashboard</h2>
          <p class="text-sm text-obsidia-text-muted mt-1">Manage your premium keys</p>
        </div>
        <button
          @click="showGenerateModal = true"
          class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-obsidia-accent to-purple-600 hover:from-obsidia-accent-light hover:to-purple-500 text-white rounded-xl shadow-glow-accent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Generate Keys
        </button>
      </div>

      <!-- Stats -->
      <StatsCards
        :totalKeys="stats.total"
        :activeKeys="stats.active"
        :usedKeys="stats.used"
        :expiredKeys="stats.expired"
        :revokedKeys="stats.revoked"
      />

      <!-- Keys table -->
      <div class="animate-fade-in" style="animation-delay: 200ms">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-obsidia-text">All Keys</h3>
          <button @click="fetchKeys" :disabled="loadingKeys" class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-obsidia-text-muted hover:text-obsidia-text bg-obsidia-card/50 hover:bg-obsidia-elevated/50 border border-obsidia-border/30 rounded-lg transition-all">
            <svg class="w-3.5 h-3.5" :class="{ 'animate-spin': loadingKeys }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        <KeyTable :keys="keys" @revoke="handleRevoke" @delete="handleDelete" />
      </div>

      <!-- Loading overlay -->
      <div v-if="initialLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-obsidia-bg/80 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4">
          <svg class="w-10 h-10 text-obsidia-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p class="text-sm text-obsidia-text-muted">Loading dashboard...</p>
        </div>
      </div>
    </main>

    <!-- Generate modal -->
    <GenerateKeyModal v-model="showGenerateModal" @generated="fetchKeys" />

    <!-- Confirmation modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="confirmAction" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="confirmAction = null"></div>
          <div class="relative w-full max-w-sm backdrop-blur-xl bg-obsidia-card/90 border border-obsidia-border/50 rounded-2xl shadow-glass p-6 animate-slide-up">
            <h3 class="text-lg font-semibold text-obsidia-text mb-2">{{ confirmAction.title }}</h3>
            <p class="text-sm text-obsidia-text-muted mb-6">{{ confirmAction.message }}</p>
            <div class="flex items-center justify-end gap-3">
              <button @click="confirmAction = null" class="px-4 py-2 text-sm text-obsidia-text-secondary hover:text-obsidia-text bg-obsidia-elevated/30 border border-obsidia-border/30 rounded-xl transition-all">Cancel</button>
              <button @click="executeConfirmedAction" :disabled="actionLoading" class="px-4 py-2 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50" :class="confirmAction.type === 'danger' ? 'bg-obsidia-danger hover:bg-red-500' : 'bg-obsidia-warning hover:bg-amber-500'">
                <span v-if="!actionLoading">{{ confirmAction.confirmLabel }}</span>
                <span v-else class="flex items-center gap-2">
                  <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Processing...
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const auth = useAuth()

interface KeyData {
  id: string; key: string; status: string; hwid: string | null
  createdAt: string | null; expiresAt: string | null; usedAt: string | null
  note: string; expirationType: string
}

interface ConfirmAction {
  title: string; message: string; confirmLabel: string
  type: 'danger' | 'warning'; action: () => Promise<void>
}

const keys = ref<KeyData[]>([])
const loadingKeys = ref(false)
const initialLoading = ref(true)
const showGenerateModal = ref(false)
const confirmAction = ref<ConfirmAction | null>(null)
const actionLoading = ref(false)

const stats = computed(() => {
  const total = keys.value.length
  const active = keys.value.filter(k => k.status === 'active').length
  const used = keys.value.filter(k => k.status === 'used').length
  const expired = keys.value.filter(k => k.status === 'expired').length
  const revoked = keys.value.filter(k => k.status === 'revoked').length
  return { total, active, used, expired, revoked }
})

onMounted(async () => {
  auth.init()
  if (!auth.isAuthenticated.value) {
    navigateTo('/login')
    return
  }
  await fetchKeys()
  initialLoading.value = false
})

async function fetchKeys() {
  loadingKeys.value = true
  try {
    const res = await auth.authFetch<{ success: boolean; keys: KeyData[] }>('/api/admin/keys')
    if (res.success) keys.value = res.keys
  } catch (e: any) {
    if (e?.status === 401 || e?.statusCode === 401) {
      auth.logout()
    }
  } finally {
    loadingKeys.value = false
  }
}

function handleRevoke(keyId: string) {
  const keyData = keys.value.find(k => k.id === keyId)
  confirmAction.value = {
    title: 'Revoke Key',
    message: `Are you sure you want to revoke key ${keyData?.key || keyId}? This will unbind the HWID and deactivate the key.`,
    confirmLabel: 'Revoke',
    type: 'warning',
    action: async () => {
      await auth.authFetch('/api/admin/revoke', { method: 'POST', body: { keyId } })
      await fetchKeys()
    },
  }
}

function handleDelete(keyId: string) {
  const keyData = keys.value.find(k => k.id === keyId)
  confirmAction.value = {
    title: 'Delete Key',
    message: `Are you sure you want to permanently delete key ${keyData?.key || keyId}? This action cannot be undone.`,
    confirmLabel: 'Delete',
    type: 'danger',
    action: async () => {
      await auth.authFetch('/api/admin/delete', { method: 'POST', body: { keyId } })
      await fetchKeys()
    },
  }
}

async function executeConfirmedAction() {
  if (!confirmAction.value) return
  actionLoading.value = true
  try {
    await confirmAction.value.action()
    confirmAction.value = null
  } catch (e) {
    console.error('Action failed:', e)
  } finally {
    actionLoading.value = false
  }
}

function handleLogout() {
  auth.logout()
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
