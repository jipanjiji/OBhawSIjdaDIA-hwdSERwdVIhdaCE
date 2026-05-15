<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close"></div>
        <div class="relative w-full max-w-lg backdrop-blur-xl bg-obsidia-card/90 border border-obsidia-border/50 rounded-2xl shadow-glass animate-slide-up">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-obsidia-border/30">
            <div>
              <h2 class="text-lg font-semibold text-obsidia-text">Generate Keys</h2>
              <p class="text-sm text-obsidia-text-muted mt-0.5">Create new premium keys</p>
            </div>
            <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-lg text-obsidia-text-muted hover:text-obsidia-text hover:bg-obsidia-elevated/50 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-5">
            <!-- Generated keys result -->
            <div v-if="generatedKeys.length > 0" class="space-y-4">
              <div class="flex items-center gap-2 px-4 py-3 bg-obsidia-success/10 border border-obsidia-success/20 rounded-xl text-sm text-obsidia-success">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ generatedKeys.length }} key(s) generated!
              </div>
              <div class="max-h-60 overflow-y-auto space-y-2 scrollbar-thin">
                <div v-for="(key, i) in generatedKeys" :key="i" class="flex items-center justify-between px-3 py-2.5 bg-obsidia-elevated/50 rounded-lg border border-obsidia-border/30 group">
                  <code class="text-sm font-mono text-obsidia-accent-light">{{ key }}</code>
                  <button @click="copyKey(key)" class="p-1.5 text-obsidia-text-muted hover:text-obsidia-text transition-colors opacity-0 group-hover:opacity-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  </button>
                </div>
              </div>
              <button @click="copyAllKeys" class="w-full py-2.5 px-4 bg-obsidia-elevated/50 hover:bg-obsidia-elevated border border-obsidia-border/30 hover:border-obsidia-border text-sm text-obsidia-text-secondary hover:text-obsidia-text rounded-xl transition-all">
                {{ copyAllLabel }}
              </button>
            </div>

            <!-- Form -->
            <template v-else>
              <div>
                <label class="block text-sm font-medium text-obsidia-text-secondary mb-2">Expiration</label>
                <div class="grid grid-cols-2 gap-2">
                  <button v-for="opt in expirationOptions" :key="opt.value" @click="expiration = opt.value" class="px-4 py-2.5 text-sm rounded-xl border transition-all duration-200" :class="expiration === opt.value ? 'bg-obsidia-accent/20 border-obsidia-accent/50 text-obsidia-accent-light' : 'bg-obsidia-elevated/30 border-obsidia-border/30 text-obsidia-text-secondary hover:border-obsidia-border hover:text-obsidia-text'">
                    {{ opt.label }}
                  </button>
                </div>
              </div>
              <div>
                <label for="genCount" class="block text-sm font-medium text-obsidia-text-secondary mb-2">Number of Keys</label>
                <input id="genCount" v-model.number="count" type="number" min="1" max="50" class="w-full px-4 py-3 bg-obsidia-elevated/50 border border-obsidia-border/50 rounded-xl text-obsidia-text focus:outline-none focus:border-obsidia-accent focus:ring-1 focus:ring-obsidia-accent/50 transition-all"/>
              </div>
              <div>
                <label for="genNote" class="block text-sm font-medium text-obsidia-text-secondary mb-2">Note <span class="text-obsidia-text-muted">(optional)</span></label>
                <input id="genNote" v-model="note" type="text" placeholder="e.g., Giveaway batch, VIP users..." class="w-full px-4 py-3 bg-obsidia-elevated/50 border border-obsidia-border/50 rounded-xl text-obsidia-text placeholder-obsidia-text-muted focus:outline-none focus:border-obsidia-accent focus:ring-1 focus:ring-obsidia-accent/50 transition-all"/>
              </div>
              <div v-if="error" class="flex items-center gap-2 px-4 py-3 bg-obsidia-danger/10 border border-obsidia-danger/20 rounded-xl text-sm text-red-400 animate-slide-down">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ error }}
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 p-6 border-t border-obsidia-border/30">
            <button @click="close" class="px-4 py-2.5 text-sm text-obsidia-text-secondary hover:text-obsidia-text bg-obsidia-elevated/30 hover:bg-obsidia-elevated border border-obsidia-border/30 hover:border-obsidia-border rounded-xl transition-all">
              {{ generatedKeys.length > 0 ? 'Close' : 'Cancel' }}
            </button>
            <button v-if="generatedKeys.length === 0" @click="generate" :disabled="loading" class="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-obsidia-accent to-purple-600 hover:from-obsidia-accent-light hover:to-purple-500 text-white rounded-xl shadow-glow-accent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="!loading">Generate Keys</span>
              <span v-else class="flex items-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Generating...
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'generated'])
const auth = useAuth()

const expiration = ref('permanent')
const count = ref(1)
const note = ref('')
const loading = ref(false)
const error = ref('')
const generatedKeys = ref<string[]>([])
const copyAllLabel = ref('Copy All Keys')

const expirationOptions = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'permanent', label: 'Permanent' },
]

function close() {
  emit('update:modelValue', false)
  setTimeout(() => {
    error.value = ''
    generatedKeys.value = []
    count.value = 1
    note.value = ''
    copyAllLabel.value = 'Copy All Keys'
  }, 300)
}

async function generate() {
  error.value = ''
  loading.value = true
  try {
    const res = await auth.authFetch<{ success: boolean; keys: string[]; message: string }>('/api/admin/generate', {
      method: 'POST',
      body: { expiration: expiration.value, count: count.value, note: note.value },
    })
    if (res.success) {
      generatedKeys.value = res.keys
      emit('generated')
    } else {
      error.value = res.message || 'Failed to generate keys'
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to generate keys'
  } finally {
    loading.value = false
  }
}

async function copyKey(key: string) {
  try { await navigator.clipboard.writeText(key) } catch {}
}

async function copyAllKeys() {
  try {
    await navigator.clipboard.writeText(generatedKeys.value.join('\n'))
    copyAllLabel.value = 'Copied!'
    setTimeout(() => { copyAllLabel.value = 'Copy All Keys' }, 2000)
  } catch {}
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.scrollbar-thin::-webkit-scrollbar { width: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 2px; }
</style>
