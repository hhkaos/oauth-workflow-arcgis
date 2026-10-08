---
theme: default
title: OAuth 2.0 + PKCE in ArcGIS
info: |
  Security and authentication for custom applications
  Esri European DevTech Summit 2026
colorSchema: dark
canvasWidth: 1280
aspectRatio: 16/9
transition: fade
fonts:
  sans: Inter
  mono: JetBrains Mono
lineNumbers: false
layout: default
routerMode: hash
hide: true
---

<div class="cover">
  <div class="kicker-top">Security and authentication for custom applications</div>
  <h1>Sign in with ArcGIS,<br>step by step</h1>
  <p>OAuth 2.0 authorization code flow with PKCE: what happens behind the <b>Sign in</b> button</p>
  <div class="event">Esri European DevTech Summit 2026</div>
</div>

<style>
.cover { height: 720px; margin: -28px -40px; display: flex; flex-direction: column; justify-content: center; padding: 0 96px;
  background: var(--c-bg) url('/bg.png') center / cover no-repeat; color: var(--c-ink); }
.cover h1 { font-size: 64px; line-height: 1.05; font-weight: 800; margin: 18px 0; }
.cover p { font-size: 22px; color: var(--c-ink-2); max-width: 780px; }
.cover .event { margin-top: 48px; color: var(--c-muted); font-size: 15px; letter-spacing: .04em; }
</style>

<!--
Coming from the PowerPoint. Goal: understand what the SDK does for us when the user clicks "Sign in".
-->

---
clicks: 11
---

<div class="slide-head">
  <h2>The raw flow</h2>
  <span class="sub">authorization code + PKCE · ArcGIS user authentication</span>
</div>

<div class="grid grid-cols-[1fr_380px] gap-8 h-[620px]">
  <OAuthFlow :visible="$clicks" :current="$clicks" />
  <StepPanel :step="$clicks" />
</div>

<ZoomOverlay />

<!--
Click 0: the four actors and the one-time prerequisite (client_id + redirect_uri).
Arrows are clickable → raw HTTP overlay (Esc closes).

[click] 1. App invents code_verifier, keeps it secret, sends only its hash.
[click] 2. Popup → /oauth2/authorize. Everything is in the URL, so nothing secret.
[click] 3. ArcGIS sign-in page, served by arcgis.com.
[click] 4. Password goes ONLY to ArcGIS. This is the point of OAuth.
[click] 5. Redirect to oauth-callback.html with code + state. The callback hands it to the opener and closes.
[click] 6. Back channel: code + code_verifier. ArcGIS checks SHA256(verifier) == challenge.
[click] 7. access_token (30 min) + refresh_token (2 weeks by default).
[click] 8. Requests carry the token.
[click] 9. Content as that user.
[click] 10. 30 min later: refresh_token, no popup.
[click] 11. New access_token. Steps 8–11 repeat.
-->

---

<div class="slide-head">
  <h2>Why PKCE?</h2>
  <span class="sub">live in this browser · Web Crypto API</span>
</div>

<p class="lead">The <b>code</b> from step 5 travels through the browser, so it could leak. PKCE makes a stolen code useless: only the app that started the sign-in can prove it owns the <code>code_verifier</code>.</p>

<PkceLive class="mt-12" />

<style>
.lead { font-size: 20px; line-height: 1.5; color: var(--c-ink-2); max-width: 1000px; }
.lead b, .lead code { color: var(--c-ink); }
</style>

<!--
Click "new verifier" a couple of times. Then the attacker button: the hash never matches.
No client_secret is needed. Browser apps cannot keep one anyway.
-->

---
clicks: 6
---

<div class="slide-head">
  <h2>ArcGIS Maps SDK for JavaScript</h2>
  <span class="sub"><span class="chip you">you write</span><span class="chip sdk">SDK does</span><span class="chip other">user / ArcGIS</span></span>
</div>

<div class="grid grid-cols-[1fr_500px] gap-6 h-[620px]">
<SdkView tech="jssdk" :click="$clicks" />
<div class="pt-16">

```js {all|6-12|14-17|10|19-20|21|all}
const [OAuthInfo, esriId] = await $arcgis.import([
  "@arcgis/core/identity/OAuthInfo.js",
  "@arcgis/core/identity/IdentityManager.js",
]);

esriId.registerOAuthInfos([
  new OAuthInfo({
    appId: "YOUR_CLIENT_ID",
    popup: true,
    popupCallbackUrl: "oauth-callback.html",
  }),
]);

// on "Sign in" click
const credential = await esriId.getCredential(
  "https://www.arcgis.com/sharing"
);

// every request to ArcGIS now carries the token
const layer = new FeatureLayer({ portalItem });
// token expired? IdentityManager refreshes it
```

</div>
</div>

<!--
Same diagram, colored by who does the work.
[click] Config: client_id + callback page.
[click] getCredential(): ONE call covers steps 1–4, 6, 7.
[click] oauth-callback.html: copy & paste from jsapi-resources.
[click] Requests: token added automatically.
[click] Refresh: automatic.
[click] Summary: you write config, one call, one callback page.
-->

---
clicks: 6
---

<div class="slide-head">
  <h2>ArcGIS REST JS</h2>
  <span class="sub"><span class="chip you">you write</span><span class="chip sdk">library does</span><span class="chip other">user / ArcGIS</span></span>
</div>

<div class="grid grid-cols-[1fr_500px] gap-6 h-[620px]">
<SdkView tech="restjs" :click="$clicks" />
<div class="pt-16">

```js {all|3-4|6-8|10-13|15-18|19|all}
import { ArcGISIdentityManager, request }
  from "@esri/arcgis-rest-request";
const clientId = "YOUR_CLIENT_ID";
const redirectUri = "https://your-app.com/callback.html";

// main page: on "Sign in" click
const session = await ArcGISIdentityManager
  .beginOAuth2({ clientId, redirectUri, popup: true });

// callback.html (the redirect_uri page)
ArcGISIdentityManager.completeOAuth2({
  clientId, redirectUri,
});

// every request: pass the session
const me = await request(url, {
  authentication: session,
});
// token expired? the session refreshes it first
```

</div>
</div>

<!--
Same story with REST JS: beginOAuth2 / completeOAuth2.
Difference: you pass `authentication: session` explicitly on each request.
-->

---
hide: true
---

<div class="next">
  <div>
    <div class="kicker-top">Hands-on tutorial</div>
    <h1>Now build it<br>yourself</h1>
    <p>Step-by-step tutorial: ArcGIS Maps SDK for JavaScript + OAuth 2.0 popup</p>
    <code>rauljimenez.info/arcgis-tutorials/arcgis-js-sdk-user-auth</code>
  </div>
  <img src="/qr-tutorial.svg?v=2" alt="QR code to the tutorial">
</div>

<style>
.next { height: 720px; margin: -28px -40px; display: flex; align-items: center; justify-content: space-between; gap: 64px; padding: 0 96px;
  background: var(--c-bg) url('/bg.png') center / cover no-repeat; color: var(--c-ink); }
.next h1 { font-size: 56px; line-height: 1.05; font-weight: 800; margin: 16px 0; }
.next p { font-size: 20px; color: var(--c-ink-2); }
.next code { display: inline-block; margin-top: 18px; font-size: 18px; color: var(--c-sdk); background: rgba(0,0,0,.25); padding: 6px 12px; border-radius: 8px; }
.next img { width: 300px; padding: 16px; border-radius: 16px; background: #fff; }
</style>
