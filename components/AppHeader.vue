<template>
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-obsidia-surface/80 border-b border-obsidia-border/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand -->
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="Obsidia" class="w-9 h-9 rounded-lg object-contain" />
          <div>
            <h1 class="text-lg font-bold text-obsidia-text">Obsidia Service</h1>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-4">
          <!-- API Status indicator -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-obsidia-card/50 rounded-lg border border-obsidia-border/30">
            <div class="w-2 h-2 rounded-full bg-obsidia-success animate-pulse"></div>
            <span class="text-xs text-obsidia-text-muted">System Online</span>
          </div>

          <!-- Logout button -->
          <button
            @click="$emit('logout')"
            class="flex items-center gap-2 px-4 py-2 text-sm text-obsidia-text-secondary hover:text-obsidia-text bg-obsidia-card/50 hover:bg-obsidia-elevated/50 border border-obsidia-border/30 hover:border-obsidia-border rounded-lg transition-all duration-200"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits(['logout'])
</script>
