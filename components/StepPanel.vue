<script setup lang="ts">
import { computed } from 'vue'
import { PKCE, STEPS } from './flow'
import { zoomStep } from './zoom'

const props = defineProps<{ step: number }>()
const s = computed(() => STEPS.find(x => x.n === props.step))

const channelText = {
  front: 'front channel · via browser URL',
  back: 'back channel · direct HTTPS',
  local: 'inside your app',
}
const short = (v: string, n = 14) => `${v.slice(0, n)}…`
</script>

<template>
  <div class="panel">
    <Transition name="swap" mode="out-in">
      <!-- intro -->
      <div v-if="!s" key="intro" class="card">
        <div class="kicker">Before step 1 · once per app</div>
        <h3>Register your app</h3>
        <p>Create an <b>OAuth 2.0 developer credential</b> in your portal. You get:</p>
        <ul class="kv">
          <li><code>client_id</code><span>public ID of your app</span></li>
          <li><code>redirect_uri</code><span>where ArcGIS may send users back</span></li>
        </ul>
        <div class="legend">
          <span><i style="background: var(--c-front)" />front channel (browser)</span>
          <span><i style="background: var(--c-back)" />back channel (direct)</span>
        </div>
        <p class="hint">Click any arrow to see the raw HTTP.</p>
      </div>

      <div v-else :key="s.n" class="card">
        <div class="kicker">
          <span class="badge" :style="{ background: `var(--c-${s.channel})` }">{{ s.n }}</span>
          {{ channelText[s.channel] }}
        </div>
        <h3>{{ s.title }}</h3>
        <p>{{ s.desc }}</p>

        <div class="mock">
          <div v-if="s.n === 1" class="formula">
            <div><span class="k">code_verifier</span> = <code>{{ short(PKCE.verifier, 18) }}</code></div>
            <div class="op">code_challenge = BASE64URL( SHA256( <u>code_verifier</u> ) )</div>
            <div><span class="k">code_challenge</span> = <code>{{ short(PKCE.challenge, 18) }}</code></div>
            <div><span class="k">state</span> = <code>{{ PKCE.state }}</code></div>
          </div>

          <BrowserMock v-else-if="s.n === 2" popup :url="`www.arcgis.com/sharing/rest/oauth2/authorize?client_id=${PKCE.clientId}&code_challenge=${short(PKCE.challenge, 8)}&state=${PKCE.state}`">
            <div class="loading"><span class="spinner" /> loading www.arcgis.com…</div>
          </BrowserMock>

          <BrowserMock v-else-if="s.n === 3 || s.n === 4" popup url="www.arcgis.com/sharing/rest/oauth2/authorize?…">
            <SignInMock :filled="s.n === 4" />
          </BrowserMock>

          <BrowserMock v-else-if="s.n === 5" popup :url="`your-app.com/oauth-callback.html?code=${PKCE.code}&state=${PKCE.state}`">
            <div class="loading">✓ code received · popup closes</div>
          </BrowserMock>

          <pre v-else-if="s.n === 6" class="mini">POST /oauth2/token
grant_type=authorization_code
code=<b>{{ PKCE.code }}</b>
code_verifier=<b>{{ short(PKCE.verifier, 18) }}</b>
client_id={{ PKCE.clientId }}</pre>

          <pre v-else-if="s.n === 7" class="mini">{
  "access_token": <b>"3NKHt6i2urmW…"</b>,
  "expires_in": 1800,
  "refresh_token": <b>"51vzPXXNl7sc…"</b>,
  "username": "jsmith"
}</pre>

          <pre v-else-if="s.n === 8" class="mini">GET …/sharing/rest/community/self
X-Esri-Authorization: Bearer <b>3NKHt6i2urmW…</b></pre>

          <BrowserMock v-else-if="s.n === 9" url="your-app.com">
            <div class="app">
              <div class="nav"><b>OAuth demo</b><span class="out">Sign out</span></div>
              <div class="status">Signed in as <b>jsmith</b>.</div>
            </div>
          </BrowserMock>

          <pre v-else-if="s.n === 10" class="mini">POST /oauth2/token
grant_type=<b>refresh_token</b>
refresh_token=<b>51vzPXXNl7sc…</b>
client_id={{ PKCE.clientId }}</pre>

          <pre v-else-if="s.n === 11" class="mini">{
  "access_token": <b>"Kw9xR2mP0vQn…"</b>,
  "expires_in": 1800
}</pre>
        </div>

        <button class="zoom" @click="zoomStep = s.n">⤢ raw HTTP</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.panel { height: 100%; position: relative; }
.card { display: flex; flex-direction: column; gap: 8px; }
.kicker { display: flex; align-items: center; gap: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--c-muted); }
.badge { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; color: #1d1f4a; font-weight: 800; font-size: 13px; letter-spacing: 0; }
h3 { margin: 0; font-size: 26px; font-weight: 800; color: var(--c-ink); line-height: 1.15; }
p { margin: 0; font-size: 15px; line-height: 1.45; color: var(--c-ink-2); }
.mock { margin-top: 8px; }
.formula { border: 1px solid rgba(255,255,255,.35); border-radius: 10px; padding: 12px 14px; font-family: var(--font-mono); font-size: 12.5px; display: flex; flex-direction: column; gap: 6px; background: rgba(0,0,0,.18); }
.formula .k { color: var(--c-local); }
.formula .op { color: var(--c-you); padding: 6px 0; border-top: 1px dashed rgba(255,255,255,.2); border-bottom: 1px dashed rgba(255,255,255,.2); }
.formula code { color: var(--c-ink); }
.mini { margin: 0; padding: 12px 14px; border-radius: 10px; background: rgba(0,0,0,.28); border: 1px solid rgba(255,255,255,.15); font-family: var(--font-mono); font-size: 13px; line-height: 1.55; color: var(--c-ink-2); white-space: pre-wrap; }
.mini b { color: var(--c-back); font-weight: 600; }
.loading { display: flex; align-items: center; gap: 8px; justify-content: center; height: 92px; color: #4d527a; font-size: 13px; }
.spinner { width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid #c3c7de; border-top-color: #007ac2; animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.app .nav { display: flex; justify-content: space-between; border-bottom: 1px solid #dfe2f0; padding-bottom: 6px; font-size: 13px; }
.app .out { font-size: 11px; background: #007ac2; color: #fff; padding: 2px 8px; border-radius: 4px; }
.app .status { text-align: center; padding: 26px 0 10px; font-size: 14px; }
.kv { list-style: none; padding: 0; margin: 4px 0; display: flex; flex-direction: column; gap: 6px; }
.kv li { display: flex; gap: 10px; align-items: baseline; font-size: 14px; color: var(--c-ink-2); }
.kv code { color: var(--c-you); min-width: 104px; }
.legend { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--c-ink-2); margin-top: 6px; }
.legend i { display: inline-block; width: 26px; height: 3px; border-radius: 2px; margin-right: 8px; vertical-align: middle; }
.hint { font-size: 12.5px; color: var(--c-muted); margin-top: 10px; }
.zoom { align-self: flex-start; margin-top: 10px; font-size: 12px; color: var(--c-ink); background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.3); border-radius: 999px; padding: 4px 12px; cursor: pointer; }
.zoom:hover { background: rgba(255,255,255,.2); }
.swap-enter-active, .swap-leave-active { transition: opacity .25s, transform .25s; }
.swap-enter-from { opacity: 0; transform: translateY(8px); }
.swap-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
