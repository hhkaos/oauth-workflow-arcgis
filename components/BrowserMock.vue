<script setup lang="ts">
defineProps<{ url: string, popup?: boolean, secure?: boolean }>()
</script>

<template>
  <div class="browser" :class="{ popup }">
    <div class="bar">
      <span class="dots"><i /><i /><i /></span>
      <span v-if="popup" class="tag">popup</span>
      <div class="url"><span class="lock">{{ secure === false ? '' : '🔒' }}</span>{{ url }}</div>
    </div>
    <div class="body"><slot /></div>
  </div>
</template>

<style scoped>
.browser { border-radius: 10px; overflow: hidden; background: #f4f5fb; color: #1d1f4a; box-shadow: 0 14px 40px rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.25); }
.browser.popup { transform: rotate(-.6deg); }
.bar { display: flex; align-items: center; gap: 8px; padding: 7px 10px; background: #dfe2f0; }
.dots { display: flex; gap: 5px; }
.dots i { width: 9px; height: 9px; border-radius: 50%; background: #b9bdd6; display: block; }
.dots i:first-child { background: #ff6b5e; }
.tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; background: var(--c-front); color: #12133a; padding: 1px 6px; border-radius: 4px; }
.url { flex: 1; font-family: var(--font-mono); font-size: 11px; background: #fff; border-radius: 6px; padding: 3px 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lock { margin-right: 4px; }
.body { padding: 14px 16px; min-height: 120px; }
</style>
