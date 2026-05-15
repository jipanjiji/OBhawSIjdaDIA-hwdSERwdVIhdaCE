<template>
  <div class="backdrop-blur-sm bg-obsidia-card/60 border border-obsidia-border/40 rounded-xl overflow-hidden">
    <!-- Table header bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-obsidia-border/30">
      <div class="relative w-full sm:w-72">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidia-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="search" type="text" placeholder="Search keys..." class="w-full pl-10 pr-4 py-2 bg-obsidia-elevated/50 border border-obsidia-border/50 rounded-lg text-sm text-obsidia-text placeholder-obsidia-text-muted focus:outline-none focus:border-obsidia-accent/50 transition-all"/>
      </div>
      <div class="flex items-center gap-2">
        <select v-model="statusFilter" class="px-3 py-2 bg-obsidia-elevated/50 border border-obsidia-border/50 rounded-lg text-sm text-obsidia-text-secondary focus:outline-none focus:border-obsidia-accent/50 transition-all">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="used">Used</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-obsidia-text-muted uppercase tracking-wider border-b border-obsidia-border/20">
            <th class="px-4 py-3 font-medium">Key</th>
            <th class="px-4 py-3 font-medium">Status</th>
            <th class="px-4 py-3 font-medium hidden md:table-cell">HWID</th>
            <th class="px-4 py-3 font-medium hidden lg:table-cell">Expires</th>
            <th class="px-4 py-3 font-medium hidden lg:table-cell">Note</th>
            <th class="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredKeys.length === 0">
            <td colspan="6" class="px-4 py-12 text-center text-obsidia-text-muted">
              <svg class="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
              <p>No keys found</p>
            </td>
          </tr>
          <tr v-for="key in filteredKeys" :key="key.id" class="border-b border-obsidia-border/10 hover:bg-obsidia-elevated/20 transition-colors group">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <code class="font-mono text-xs text-obsidia-accent-light">{{ key.key }}</code>
                <button @click="copyKey(key.key)" class="p-1 text-obsidia-text-muted hover:text-obsidia-text opacity-0 group-hover:opacity-100 transition-all" title="Copy">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </button>
              </div>
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" :class="statusClasses(key.status)">
                <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(key.status)"></span>
                {{ key.status }}
              </span>
            </td>
            <td class="px-4 py-3 hidden md:table-cell">
              <span v-if="key.hwid" class="font-mono text-xs text-obsidia-text-muted">{{ truncate(key.hwid, 16) }}</span>
              <span v-else class="text-xs text-obsidia-text-muted/50">—</span>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-xs text-obsidia-text-muted">
              {{ key.expiresAt ? formatDate(key.expiresAt) : 'Permanent' }}
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-xs text-obsidia-text-muted">
              {{ key.note || '—' }}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <button v-if="key.status !== 'revoked'" @click="$emit('revoke', key.id)" class="p-1.5 text-obsidia-text-muted hover:text-obsidia-warning rounded transition-colors" title="Revoke">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                </button>
                <button @click="$emit('delete', key.id)" class="p-1.5 text-obsidia-text-muted hover:text-obsidia-danger rounded transition-colors" title="Delete">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface KeyData {
  id: string; key: string; status: string; hwid: string | null
  createdAt: string | null; expiresAt: string | null; usedAt: string | null
  note: string; expirationType: string
}

const props = defineProps<{ keys: KeyData[] }>()
defineEmits(['revoke', 'delete'])

const search = ref('')
const statusFilter = ref('all')

const filteredKeys = computed(() => {
  return props.keys.filter(k => {
    const matchSearch = !search.value || k.key.toLowerCase().includes(search.value.toLowerCase()) || (k.hwid && k.hwid.toLowerCase().includes(search.value.toLowerCase())) || (k.note && k.note.toLowerCase().includes(search.value.toLowerCase()))
    const matchStatus = statusFilter.value === 'all' || k.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

function statusClasses(status: string) {
  const map: Record<string, string> = {
    active: 'bg-obsidia-success/10 text-obsidia-success border border-obsidia-success/20',
    used: 'bg-obsidia-info/10 text-obsidia-info border border-obsidia-info/20',
    expired: 'bg-obsidia-warning/10 text-obsidia-warning border border-obsidia-warning/20',
    revoked: 'bg-obsidia-danger/10 text-obsidia-danger border border-obsidia-danger/20',
  }
  return map[status] || 'bg-obsidia-elevated text-obsidia-text-muted'
}

function statusDotClass(status: string) {
  const map: Record<string, string> = {
    active: 'bg-obsidia-success', used: 'bg-obsidia-info',
    expired: 'bg-obsidia-warning', revoked: 'bg-obsidia-danger',
  }
  return map[status] || 'bg-obsidia-text-muted'
}

function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + '...' : str
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function copyKey(key: string) {
  try { await navigator.clipboard.writeText(key) } catch { /* fallback */ }
}
</script>
