# Sign in with ArcGIS, step by step

Live: https://www.rauljimenez.info/oauth-workflow-arcgis/

Animated OAuth 2.0 authorization code + PKCE walkthrough (Slidev) for
*Security and authentication for custom applications*, Esri European DevTech Summit 2026.

```bash
npm install
npm run dev      # http://localhost:3030 · presenter: /presenter
npm run build    # static site in dist/ (deployed to Pages by .github/workflows/pages.yml on push to main)
npm run export   # PDF (needs playwright-chromium)
```

## Slides

1. Cover
2. **The raw flow**: 11 clicks, one arrow per step. Click any arrow or "raw HTTP" for the full request (Esc closes).
3. **Why PKCE?**: live verifier → challenge with Web Crypto, plus the "attacker" button.
4. **Maps SDK for JS**: same diagram colored by who does the work, synced with highlighted code.
5. **REST JS**: same as 4 with `beginOAuth2` / `completeOAuth2`.
6. Hands-on tutorial link + QR.

## Editing

- Step text, labels, and raw HTTP: `components/flow.ts`
- Who-does-what groups and captions: `components/SdkView.vue`
- Colors: `style.css` (`--c-*` tokens)
- `vite.config.ts` disables CSS minify to work around a Slidev 53 build bug.
