<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="(stat, index) in stats"
      :key="stat.label"
      class="group relative overflow-hidden backdrop-blur-sm bg-obsidia-card/60 border border-obsidia-border/40 rounded-xl p-5 transition-all duration-300 hover:border-obsidia-border hover:shadow-glass animate-slide-up"
      :style="{ animationDelay: `${index * 100}ms` }"
    >
      <!-- Glow effect on hover -->
      <div
        class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        :class="stat.glowClass"
      ></div>

      <div class="relative flex items-start justify-between">
        <div>
          <p class="text-sm text-obsidia-text-muted font-medium">{{ stat.label }}</p>
          <p class="text-3xl font-bold mt-1.5" :class="stat.valueColor">
            {{ animatedValues[index] ?? 0 }}
          </p>
        </div>
        <div
          class="flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200"
          :class="stat.iconBg"
        >
          <component :is="stat.icon" class="w-5 h-5" :class="stat.iconColor" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

const props = defineProps<{
  totalKeys: number
  activeKeys: number
  usedKeys: number
  expiredKeys: number
  revokedKeys: number
}>()

// Icon components as render functions
const KeyIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' })
])
const CheckIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
])
const UserIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
])
const ClockIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const stats = computed(() => [
  {
    label: 'Total Keys',
    value: props.totalKeys,
    valueColor: 'text-obsidia-text',
    icon: KeyIcon,
    iconBg: 'bg-obsidia-accent/10',
    iconColor: 'text-obsidia-accent-light',
    glowClass: 'bg-gradient-to-br from-obsidia-accent/5 to-transparent',
  },
  {
    label: 'Active',
    value: props.activeKeys,
    valueColor: 'text-obsidia-success',
    icon: CheckIcon,
    iconBg: 'bg-obsidia-success/10',
    iconColor: 'text-obsidia-success',
    glowClass: 'bg-gradient-to-br from-obsidia-success/5 to-transparent',
  },
  {
    label: 'Used (Bound)',
    value: props.usedKeys,
    valueColor: 'text-obsidia-info',
    icon: UserIcon,
    iconBg: 'bg-obsidia-info/10',
    iconColor: 'text-obsidia-info',
    glowClass: 'bg-gradient-to-br from-obsidia-info/5 to-transparent',
  },
  {
    label: 'Expired / Revoked',
    value: props.expiredKeys + props.revokedKeys,
    valueColor: 'text-obsidia-warning',
    icon: ClockIcon,
    iconBg: 'bg-obsidia-warning/10',
    iconColor: 'text-obsidia-warning',
    glowClass: 'bg-gradient-to-br from-obsidia-warning/5 to-transparent',
  },
])

// Animated count-up
const animatedValues = ref<number[]>([0, 0, 0, 0])

function animateCountUp(targetValues: number[]) {
  const duration = 800
  const startTime = Date.now()
  const startValues = [...animatedValues.value]

  function step() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3)

    for (let i = 0; i < targetValues.length; i++) {
      animatedValues.value[i] = Math.round(startValues[i] + (targetValues[i] - startValues[i]) * eased)
    }

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

watch(
  () => stats.value.map(s => s.value),
  (newValues) => {
    if (import.meta.client) {
      animateCountUp(newValues)
    }
  },
  { immediate: true }
)
</script>
