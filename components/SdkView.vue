<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ tech: 'jssdk' | 'restjs', click: number }>()

interface Group { lit: number[] | null, setup?: boolean, you: string, lib?: string }

const SIGN_IN = [1, 2, 3, 4, 6, 7]

const GROUPS: Record<'jssdk' | 'restjs', Group[]> = {
  jssdk: [
    { lit: [], you: 'Same 11 steps. Who does each one?' },
    { lit: [], setup: true, you: 'Register your client_id and callback page once.' },
    { lit: SIGN_IN, you: 'Call getCredential().', lib: 'Creates PKCE values, opens the popup, checks state, exchanges the code.' },
    { lit: [5], you: 'Host oauth-callback.html (copy & paste).', lib: 'Receives the code from the popup.' },
    { lit: [8, 9], you: 'Use layers, maps, and portal as usual.', lib: 'Adds the token to every ArcGIS request.' },
    { lit: [10, 11], lib: 'Refreshes the token before it expires.', you: 'Nothing.' },
    { lit: null, setup: true, you: 'Config, one call, one callback page.', lib: 'Everything else.' },
  ],
  restjs: [
    { lit: [], you: 'Same 11 steps. Who does each one?' },
    { lit: [], setup: true, you: 'Pass clientId and redirectUri.' },
    { lit: SIGN_IN, you: 'Call beginOAuth2().', lib: 'Creates PKCE values, opens the popup, checks state, exchanges the code.' },
    { lit: [5], you: 'Callback page calls completeOAuth2().', lib: 'Reads code/state and finishes the exchange.' },
    { lit: [8, 9], you: 'Pass { authentication: session }.', lib: 'Attaches the token to the request.' },
    { lit: [10, 11], lib: 'Refreshes the token when it has expired.', you: 'Nothing.' },
    { lit: null, setup: true, you: 'Config, one call, one callback page.', lib: 'Everything else.' },
  ],
}

const g = computed(() => {
  const list = GROUPS[props.tech]
  return list[Math.min(props.click, list.length - 1)]
})
</script>

<template>
  <div class="sdk-view">
    <OAuthFlow color-by="owner" :lit="g.lit" :setup="g.setup" />
    <div class="caption">
      <Transition name="swap" mode="out-in">
        <div :key="click" class="lines">
          <div class="row"><i style="background: var(--c-you)" /><b>You</b><span>{{ g.you }}</span></div>
          <div v-if="g.lib" class="row"><i style="background: var(--c-sdk)" /><b>Library</b><span>{{ g.lib }}</span></div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.sdk-view { display: flex; flex-direction: column; height: 100%; gap: 6px; }
.sdk-view :deep(svg) { flex: 1; min-height: 0; }
.caption { min-height: 58px; }
.lines { display: flex; flex-direction: column; gap: 4px; }
.row { display: flex; align-items: center; gap: 10px; font-size: 16px; color: var(--c-ink); }
.row i { width: 22px; height: 6px; border-radius: 3px; flex: none; }
.row b { width: 66px; flex: none; }
.row span { color: var(--c-ink-2); }
.swap-enter-active, .swap-leave-active { transition: opacity .2s; }
.swap-enter-from, .swap-leave-to { opacity: 0; }
</style>
