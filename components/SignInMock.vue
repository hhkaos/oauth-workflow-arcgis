<script setup lang="ts">
defineProps<{ filled?: boolean }>()
</script>

<template>
  <div class="signin">
    <div class="brand">ArcGIS</div>
    <div class="headline">Sign in to <b>OAuth demo</b></div>
    <div class="field" :class="{ filled }">{{ filled ? 'jsmith' : 'Username' }}</div>
    <div class="field" :class="{ filled }">{{ filled ? '••••••••••' : 'Password' }}</div>
    <div class="btn" :class="{ pressed: filled }">Sign in</div>
    <div class="alt">or: Google · GitHub · Apple · your organization's SSO</div>
  </div>
</template>

<style scoped>
.signin { display: flex; flex-direction: column; gap: 7px; font-size: 12px; }
.brand { font-weight: 800; letter-spacing: .02em; font-size: 15px; color: #007ac2; }
.headline { font-size: 13px; margin-bottom: 2px; }
.field { border: 1px solid #c3c7de; border-radius: 4px; padding: 5px 8px; color: #8a8fb0; background: #fff; }
.field.filled { color: #1d1f4a; border-color: #007ac2; }
.btn { background: #007ac2; color: #fff; text-align: center; border-radius: 4px; padding: 6px; font-weight: 700; transition: transform .2s; }
.btn.pressed { transform: scale(.97); box-shadow: 0 0 0 3px rgba(0,122,194,.3); }
.alt { font-size: 10.5px; color: #6b7094; text-align: center; }
</style>
