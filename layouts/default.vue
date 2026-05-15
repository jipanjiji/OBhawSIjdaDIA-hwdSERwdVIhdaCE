<template>
  <div class="min-h-screen bg-obsidia-bg text-obsidia-text">
    <!-- Ambient background effects -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-obsidia-accent/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-obsidia-accent/3 rounded-full blur-3xl"></div>
    </div>

    <!-- Page content -->
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>
