<script setup lang="ts">
import { ref } from 'vue'

const verifier = ref('')
const challenge = ref('')
const tampered = ref('')

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

async function sha(v: string) {
  return b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)))
}

async function generate() {
  verifier.value = b64url(crypto.getRandomValues(new Uint8Array(32)).buffer)
  challenge.value = await sha(verifier.value)
  tampered.value = ''
}

async function attacker() {
  tampered.value = await sha(b64url(crypto.getRandomValues(new Uint8Array(32)).buffer))
}

generate()
</script>

<template>
  <div class="pkce">
    <div class="box you">
      <div class="who">Only your app knows</div>
      <div class="k">code_verifier</div>
      <code>{{ verifier }}</code>
    </div>
    <div class="arrow">SHA-256 → base64url<br><span>one way, cannot be reversed</span></div>
    <div class="box pub">
      <div class="who">Sent through the browser (step 2)</div>
      <div class="k">code_challenge</div>
      <code>{{ challenge }}</code>
    </div>
    <div class="actions">
      <button @click="generate">↻ new verifier</button>
      <button @click="attacker">🕵️ attacker steals the code and guesses a verifier</button>
    </div>
    <div v-if="tampered" class="verdict">
      SHA256(guess) = <code>{{ tampered.slice(0, 22) }}…</code> ≠ <code>{{ challenge.slice(0, 22) }}…</code>
      <b>→ ArcGIS rejects the token request</b>
    </div>
  </div>
</template>

<style scoped>
.pkce { display: grid; grid-template-columns: 1fr auto 1fr; gap: 18px 22px; align-items: center; }
.box { border-radius: 14px; padding: 22px 24px; background: rgba(0,0,0,.25); border: 1px solid rgba(255,255,255,.18); min-height: 170px; }
.box.you { border-color: var(--c-you); }
.box.pub { border-color: var(--c-front); }
.who { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--c-muted); }
.k { font-family: var(--font-mono); font-size: 24px; margin: 6px 0; color: var(--c-ink); }
.you .k { color: var(--c-you); }
.pub .k { color: var(--c-front); }
code { font-family: var(--font-mono); font-size: 18px; word-break: break-all; color: var(--c-ink-2); background: none; }
.arrow { text-align: center; font-family: var(--font-mono); font-size: 18px; color: var(--c-ink); }
.arrow span { font-family: var(--font-sans); font-size: 12px; color: var(--c-muted); }
.actions { grid-column: 1 / -1; display: flex; gap: 12px; }
button { font-size: 16px; color: var(--c-ink); background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.3); border-radius: 999px; padding: 6px 14px; cursor: pointer; }
button:hover { background: rgba(255,255,255,.2); }
.verdict { grid-column: 1 / -1; font-size: 18px; color: var(--c-ink-2); }
.verdict b { color: var(--c-back); display: block; margin-top: 8px; font-size: 22px; }
</style>
