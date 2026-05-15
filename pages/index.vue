<template>
  <div></div>
</template>

<script setup lang="ts">
/**
 * Index page — redirects to dashboard if authenticated, otherwise to login.
 */
const auth = useAuth()

onMounted(() => {
  auth.init()
  if (auth.isAuthenticated.value) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/login')
  }
})
</script>
