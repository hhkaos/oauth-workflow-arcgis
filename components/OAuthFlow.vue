<script setup lang="ts">
import { computed } from 'vue'
import { LANES, STEPS, laneX, type Step } from './flow'
import { zoomStep } from './zoom'

const props = withDefaults(defineProps<{
  visible?: number // steps with n <= visible are drawn
  current?: number // step with the travelling packet (0 = none)
  colorBy?: 'channel' | 'owner'
  lit?: number[] | null // owner view: steps not listed are dimmed
  setup?: boolean // owner view: highlight the one-time app registration
}>(), { visible: 11, current: 0, colorBy: 'channel', lit: null, setup: false })

const W = 820
const H = 640
const APP = laneX('app')

function geom(s: Step) {
  if (s.from === s.to) {
    const d = `M ${APP + 4} ${s.y - 10} H ${APP + 34} V ${s.y + 10} H ${APP + 14}`
    return {
      d,
      head: `${APP + 4},${s.y + 10} ${APP + 14},${s.y + 5} ${APP + 14},${s.y + 15}`,
      lx: APP + 44, ly: s.y + 4, anchor: 'start',
    }
  }
  const x1 = laneX(s.from)
  const x2 = laneX(s.to)
  const dir = Math.sign(x2 - x1)
  const a = x1 + dir * 4
  const b = x2 - dir * 4
  return {
    d: `M ${a} ${s.y} H ${b - dir * 10}`,
    head: `${b},${s.y} ${b - dir * 11},${s.y - 5.5} ${b - dir * 11},${s.y + 5.5}`,
    lx: (x1 + x2) / 2, ly: s.y - 9, anchor: 'middle',
  }
}

const rows = computed(() => STEPS.map((s) => {
  const color = props.colorBy === 'channel'
    ? `var(--c-${s.channel})`
    : `var(--c-${s.owner})`
  const shown = s.n <= props.visible
  const isCurrent = s.n === props.current
  let opacity = 1
  if (props.colorBy === 'channel' && props.current && !isCurrent)
    opacity = 0.42
  if (props.lit && !props.lit.includes(s.n))
    opacity = 0.16
  return { s, g: geom(s), color, shown, isCurrent, opacity }
}))

const popupShown = computed(() => props.visible >= 2)
const refreshShown = computed(() => props.visible >= 10)
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="oauth-flow" role="img" aria-label="OAuth 2.0 authorization code flow with PKCE">
    <!-- popup window region (front channel) -->
    <g class="fade" :class="{ shown: popupShown }">
      <rect x="34" y="164" width="590" height="184" rx="12" class="popup-box" />
      <text x="46" y="180" class="popup-label">POPUP WINDOW</text>
    </g>

    <!-- lanes -->
    <g v-for="lane in LANES" :key="lane.id">
      <line :x1="lane.x" :x2="lane.x" y1="112" :y2="H - 8" class="lifeline" />
      <g :transform="`translate(${lane.x - 18}, 14)`" class="lane-icon"
         :class="{ glow: setup && lane.id === 'app' }">
        <!-- user -->
        <template v-if="lane.id === 'user'">
          <circle cx="18" cy="10" r="9" />
          <path d="M2 38 C2 24 34 24 34 38 Z" />
        </template>
        <!-- browser app -->
        <template v-else-if="lane.id === 'app'">
          <rect x="1" y="2" width="34" height="34" rx="3" class="hollow" />
          <line x1="1" y1="10" x2="35" y2="10" class="hollow" />
          <circle cx="6" cy="6" r="1.4" /><circle cx="10.5" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" />
        </template>
        <!-- auth server -->
        <template v-else-if="lane.id === 'auth'">
          <path d="M9 17 V11 a9 9 0 0 1 18 0 V17" class="hollow" stroke-width="3.5" />
          <rect x="4" y="16" width="28" height="21" rx="3" />
          <circle cx="18" cy="26" r="3" class="cut" />
        </template>
        <!-- api servers -->
        <template v-else>
          <rect x="2" y="2" width="32" height="10" rx="2" />
          <rect x="2" y="14" width="32" height="10" rx="2" />
          <rect x="2" y="26" width="32" height="10" rx="2" />
          <circle cx="28" cy="7" r="1.6" class="cut" /><circle cx="28" cy="19" r="1.6" class="cut" /><circle cx="28" cy="31" r="1.6" class="cut" />
        </template>
      </g>
      <text :x="lane.x" y="74" class="lane-title" text-anchor="middle">{{ lane.title }}</text>
      <text :x="lane.x" y="91" class="lane-sub" text-anchor="middle">{{ lane.sub }}</text>
    </g>

    <!-- one-time setup tag -->
    <g class="fade" :class="{ shown: setup }">
      <rect :x="APP - 92" y="99" width="184" height="20" rx="10" class="setup-pill" />
      <text :x="APP" y="113" text-anchor="middle" class="setup-text">client_id + redirect_uri</text>
    </g>

    <!-- refresh separator -->
    <g class="fade" :class="{ shown: refreshShown }">
      <line x1="30" :x2="W - 20" y1="535" y2="535" class="separator" />
      <rect :x="APP + 40" y="524" width="250" height="22" rx="11" class="sep-pill" />
      <text :x="APP + 165" y="539" text-anchor="middle" class="sep-text">⏱ expires_in elapsed · 30 min later</text>
    </g>

    <!-- messages -->
    <g v-for="r in rows" :key="r.s.n" class="msg" :class="{ shown: r.shown, current: r.isCurrent }"
       :style="{ '--c': r.color, opacity: r.shown ? r.opacity : 0 }">
      <g class="num" @click="zoomStep = r.s.n">
        <circle cx="16" :cy="r.s.y" r="10" />
        <text x="16" :y="r.s.y + 4" text-anchor="middle">{{ r.s.n }}</text>
      </g>
      <path :d="r.g.d" pathLength="1" class="line" />
      <polygon :points="r.g.head" class="head" />
      <text :x="r.g.lx" :y="r.g.ly" :text-anchor="r.g.anchor" class="label" @click="zoomStep = r.s.n">
        {{ r.s.label }}
      </text>
      <circle v-if="r.isCurrent" :key="`p${r.s.n}`" r="5" class="packet">
        <animateMotion :path="r.g.d" dur="1.4s" repeatCount="indefinite" />
      </circle>
    </g>
  </svg>
</template>

<style scoped>
.oauth-flow { width: 100%; height: 100%; overflow: visible; font-family: var(--font-sans); }
.lifeline { stroke: rgba(255,255,255,.28); stroke-width: 1.2; stroke-dasharray: 4 5; }
.lane-icon { fill: var(--c-ink); stroke: var(--c-ink); stroke-width: 0; transition: filter .4s; }
.lane-icon .hollow { fill: none; stroke-width: 2.4; }
.lane-icon .cut { fill: var(--c-bg); }
.lane-icon.glow { filter: drop-shadow(0 0 8px var(--c-you)); fill: var(--c-you); stroke: var(--c-you); }
.lane-title { fill: var(--c-ink); font-size: 16px; font-weight: 700; }
.lane-sub { fill: var(--c-muted); font-size: 11.5px; }

.fade { opacity: 0; transition: opacity .5s; }
.fade.shown { opacity: 1; }
.popup-box { fill: rgba(110,193,255,.07); stroke: rgba(110,193,255,.45); stroke-dasharray: 6 5; }
.popup-label { fill: var(--c-front); font-size: 11px; letter-spacing: .04em; }
.setup-pill { fill: var(--c-you); }
.setup-text { fill: #1d1f4a; font-size: 11.5px; font-weight: 700; font-family: var(--font-mono); }
.separator { stroke: rgba(255,255,255,.35); stroke-dasharray: 2 6; }
.sep-pill { fill: #23255f; stroke: rgba(255,255,255,.3); }
.sep-text { fill: var(--c-muted); font-size: 11.5px; }

.msg { transition: opacity .45s; }
.msg .line { fill: none; stroke: var(--c); stroke-width: 2.4; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .7s ease-out, stroke-width .3s; }
.msg.shown .line { stroke-dashoffset: 0; }
.msg .head { fill: var(--c); opacity: 0; transition: opacity .2s .55s; }
.msg.shown .head { opacity: 1; }
.msg .label { fill: var(--c-ink); font-size: 13.5px; font-family: var(--font-mono); cursor: pointer; }
.msg .label:hover { fill: var(--c); text-decoration: underline; }
.msg .num { cursor: pointer; }
.msg .num circle { fill: none; stroke: var(--c); stroke-width: 1.5; }
.msg .num text { fill: var(--c); font-size: 11px; font-weight: 700; }
.msg.current .line { stroke-width: 3.6; filter: drop-shadow(0 0 6px var(--c)); }
.msg.current .num circle { fill: var(--c); }
.msg.current .num text { fill: #1d1f4a; }
.msg.current .label { font-weight: 700; }
.packet { fill: #fff; filter: drop-shadow(0 0 6px var(--c)); }
</style>
