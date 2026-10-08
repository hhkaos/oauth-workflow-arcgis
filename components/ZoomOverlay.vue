<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { STEPS } from './flow'
import { zoomStep } from './zoom'

const s = computed(() => STEPS.find(x => x.n === zoomStep.value))

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && zoomStep.value !== null) {
    zoomStep.value = null
    e.stopPropagation()
  }
}
onMounted(() => window.addEventListener('keydown', onKey, true))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey, true)
  zoomStep.value = null
})
</script>

<template>
  <Transition name="zoom">
    <div v-if="s" class="overlay" @click.self="zoomStep = null">
      <div class="sheet" :style="{ '--c': `var(--c-${s.channel})` }">
        <header>
          <span class="badge">{{ s.n }}</span>
          <h2>{{ s.http.title }}</h2>
          <button class="close" @click="zoomStep = null">✕</button>
        </header>
        <pre>{{ s.http.code }}</pre>
        <table>
          <tr v-for="[k, v] in s.http.notes" :key="k">
            <th>{{ k }}</th><td>{{ v }}</td>
          </tr>
        </table>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay { position: absolute; inset: 0; z-index: 50; background: rgba(14,15,48,.72); backdrop-filter: blur(6px); display: grid; place-items: center; }
.sheet { width: 980px; max-width: 92%; background: #1b1d52; border: 1px solid rgba(255,255,255,.18); border-top: 4px solid var(--c); border-radius: 14px; padding: 22px 28px 24px; box-shadow: 0 30px 80px rgba(0,0,0,.5); }
header { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.badge { width: 32px; height: 32px; border-radius: 50%; background: var(--c); color: #1d1f4a; display: grid; place-items: center; font-weight: 800; }
h2 { flex: 1; margin: 0; font-size: 26px; font-weight: 800; color: var(--c-ink); }
.close { background: none; border: none; color: var(--c-muted); font-size: 20px; cursor: pointer; }
pre { margin: 0 0 16px; padding: 16px 18px; background: rgba(0,0,0,.35); border-radius: 10px; font-family: var(--font-mono); font-size: 16px; line-height: 1.6; color: var(--c-ink); white-space: pre-wrap; word-break: break-all; }
table { width: 100%; border-collapse: collapse; font-size: 15px; }
th { text-align: left; color: var(--c); font-family: var(--font-mono); font-weight: 600; padding: 6px 18px 6px 0; white-space: nowrap; vertical-align: top; width: 1%; }
td { color: var(--c-ink-2); padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,.08); }
.zoom-enter-active, .zoom-leave-active { transition: opacity .25s; }
.zoom-enter-active .sheet, .zoom-leave-active .sheet { transition: transform .25s; }
.zoom-enter-from, .zoom-leave-to { opacity: 0; }
.zoom-enter-from .sheet, .zoom-leave-to .sheet { transform: scale(.94); }
</style>
