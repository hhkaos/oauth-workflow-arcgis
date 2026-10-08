// Shared data for the OAuth 2.0 + PKCE sequence diagram.
// Values match RFC 7636 Appendix B so the PKCE math is real and verifiable.

export const PKCE = {
  verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
  challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
  state: 'af0ifjsldkj',
  code: 'Xy7Qp…LkW2',
  clientId: 'Ab12Cd34Ef56Gh78',
  redirectUri: 'https://your-app.com/oauth-callback.html',
}

export type LaneId = 'user' | 'app' | 'auth' | 'api'
export type Channel = 'front' | 'back' | 'local'
export type Owner = 'you' | 'sdk' | 'other'

export interface Lane {
  id: LaneId
  x: number
  title: string
  sub: string
}

export const LANES: Lane[] = [
  { id: 'user', x: 70, title: 'User', sub: 'person at the keyboard' },
  { id: 'app', x: 260, title: 'Your app', sub: 'browser · your-app.com' },
  { id: 'auth', x: 570, title: 'ArcGIS OAuth 2.0', sub: '/oauth2/authorize · /token' },
  { id: 'api', x: 760, title: 'ArcGIS services', sub: '*.arcgis.com' },
]

export interface Step {
  n: number
  from: LaneId
  to: LaneId
  y: number
  label: string
  channel: Channel
  owner: Owner
  title: string
  desc: string
  // Full raw HTTP shown in the zoom overlay
  http: { title: string, code: string, notes: [string, string][] }
}

const host = 'https://www.arcgis.com/sharing/rest'

export const STEPS: Step[] = [
  {
    n: 1, from: 'app', to: 'app', y: 150, channel: 'local', owner: 'sdk',
    label: 'code_verifier → code_challenge, state',
    title: 'Create a one-time secret',
    desc: 'The app invents a random code_verifier, keeps it in memory, and derives a code_challenge from it with SHA-256. It also creates a random state value.',
    http: {
      title: 'PKCE: proof key for code exchange',
      code: `// random, 43–128 chars, kept in the app (never sent yet)
code_verifier  = "${PKCE.verifier}"

// one-way hash → safe to send through the browser
code_challenge = BASE64URL( SHA256( code_verifier ) )
               = "${PKCE.challenge}"

// random value to detect forged redirects (CSRF)
state          = "${PKCE.state}"`,
      notes: [
        ['code_verifier', 'Secret. Only the app that started the login knows it.'],
        ['code_challenge', 'Public hash of the verifier. Cannot be reversed.'],
        ['state', 'Echoed back by ArcGIS; the app checks it matches.'],
      ],
    },
  },
  {
    n: 2, from: 'app', to: 'auth', y: 195, channel: 'front', owner: 'sdk',
    label: 'client_id, redirect_uri, code_challenge, state',
    title: 'Open the sign-in popup',
    desc: 'The app opens a popup pointing at the ArcGIS authorize endpoint. Everything travels in the URL, so nothing secret goes here.',
    http: {
      title: 'GET /oauth2/authorize (in the popup)',
      code: `GET ${host}/oauth2/authorize
  ?client_id=${PKCE.clientId}
  &response_type=code
  &redirect_uri=${PKCE.redirectUri}
  &code_challenge=${PKCE.challenge}
  &code_challenge_method=S256
  &state=${PKCE.state}`,
      notes: [
        ['client_id', 'Identifies your app (from your OAuth 2.0 developer credential).'],
        ['redirect_uri', 'Must match one registered in the credential exactly.'],
        ['response_type=code', 'Ask for an authorization code, not a token.'],
        ['code_challenge_method', 'S256 = the challenge is a SHA-256 hash.'],
      ],
    },
  },
  {
    n: 3, from: 'auth', to: 'user', y: 240, channel: 'front', owner: 'other',
    label: 'ArcGIS sign-in page',
    title: 'ArcGIS asks who you are',
    desc: 'The popup shows the ArcGIS sign-in page, served by ArcGIS, not by your app. It can be a username/password form, enterprise SAML, or a social login.',
    http: {
      title: '200 OK: sign-in page',
      code: `HTTP/1.1 200 OK
Content-Type: text/html

<!-- served by www.arcgis.com, inside the popup -->
<form> username · password · Sign in </form>`,
      notes: [
        ['Origin', 'www.arcgis.com, so the user can verify the URL bar.'],
        ['Your app', 'Has no access to this page or what is typed in it.'],
      ],
    },
  },
  {
    n: 4, from: 'user', to: 'auth', y: 285, channel: 'front', owner: 'other',
    label: 'username, password',
    title: 'User signs in on ArcGIS',
    desc: 'Credentials go straight to ArcGIS. Your app never sees the password; that is the whole point of OAuth.',
    http: {
      title: 'Credentials go to ArcGIS only',
      code: `# The sign-in form posts back to www.arcgis.com itself.
# Its format is internal to ArcGIS and is NOT part of the OAuth contract:
#   username + password · SAML / enterprise IdP · social login · MFA
#
# Your app is not involved until step 5.`,
      notes: [
        ['Who sees the password?', 'Only ArcGIS. Not your app, not your server.'],
        ['MFA / SAML', 'Handled here too, invisible to your app.'],
      ],
    },
  },
  {
    n: 5, from: 'auth', to: 'app', y: 330, channel: 'front', owner: 'you',
    label: 'code, state  (→ redirect_uri)',
    title: 'Redirect back with a code',
    desc: 'ArcGIS redirects the popup to your redirect_uri with a short-lived authorization code. The callback page passes it to the main window and closes the popup.',
    http: {
      title: '302 redirect to your callback page',
      code: `HTTP/1.1 302 Found
Location: ${PKCE.redirectUri}
  ?code=${PKCE.code}
  &state=${PKCE.state}`,
      notes: [
        ['code', 'Single use and short-lived. Useless without the code_verifier.'],
        ['state', 'The app checks it equals the value from step 1.'],
        ['oauth-callback.html', 'Hands code/state to window.opener, then close().'],
      ],
    },
  },
  {
    n: 6, from: 'app', to: 'auth', y: 375, channel: 'back', owner: 'sdk',
    label: 'code, code_verifier, client_id, redirect_uri',
    title: 'Trade the code for a token',
    desc: 'Directly from app to ArcGIS. The app proves it started the login by revealing the code_verifier, and ArcGIS hashes it and compares it with the code_challenge.',
    http: {
      title: 'POST /oauth2/token',
      code: `POST ${host}/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=${PKCE.clientId}
&redirect_uri=${PKCE.redirectUri}
&code=${PKCE.code}
&code_verifier=${PKCE.verifier}`,
      notes: [
        ['code_verifier', 'ArcGIS checks SHA256(verifier) == code_challenge.'],
        ['No client_secret', 'Browser apps cannot keep secrets. PKCE replaces it.'],
      ],
    },
  },
  {
    n: 7, from: 'auth', to: 'app', y: 420, channel: 'back', owner: 'sdk',
    label: 'access_token, refresh_token, expires_in',
    title: 'Tokens!',
    desc: 'ArcGIS returns a short-lived access_token (30 min) and a refresh_token (two weeks by default) to get new ones without asking the user again.',
    http: {
      title: '200 OK: token response',
      code: `{
  "access_token": "3NKHt6i2urmWtqOuugvr9…",
  "expires_in": 1800,
  "username": "jsmith",
  "ssl": true,
  "refresh_token": "51vzPXXNl7scWXsw7YXvhMp…",
  "refresh_token_expires_in": 1209600
}`,
      notes: [
        ['expires_in', 'Seconds. 1800 = 30 minutes.'],
        ['refresh_token_expires_in', '1209600 s = 2 weeks (configurable, up to 90 days).'],
      ],
    },
  },
  {
    n: 8, from: 'app', to: 'api', y: 465, channel: 'back', owner: 'sdk',
    label: 'API request + access_token',
    title: 'Call ArcGIS as the user',
    desc: 'Every request to secured content, services, or basemaps carries the token. ArcGIS applies that user\'s privileges and bills their organization.',
    http: {
      title: 'Authenticated request',
      code: `GET ${host}/community/self?f=json
X-Esri-Authorization: Bearer 3NKHt6i2urmWtqOuugvr9…

# or as a parameter
GET …/community/self?f=json&token=3NKHt6i2urmWtqOuugvr9…`,
      notes: [
        ['Header or param', 'Both accepted. SDKs choose for you.'],
        ['Scope', 'The token can do what the user can do. No more.'],
      ],
    },
  },
  {
    n: 9, from: 'api', to: 'app', y: 510, channel: 'back', owner: 'other',
    label: 'content',
    title: 'Secured content',
    desc: 'Private items, layers, basemaps, and user info come back. The app shows "Signed in as jsmith".',
    http: {
      title: '200 OK: content',
      code: `{
  "username": "jsmith",
  "fullName": "Jane Smith",
  "orgId": "Wl7Y1m92PbjtJs5n",
  "role": "org_publisher",
  …
}`,
      notes: [['Result', 'Whatever the signed-in user is allowed to see.']],
    },
  },
  {
    n: 10, from: 'app', to: 'auth', y: 572, channel: 'back', owner: 'sdk',
    label: 'refresh_token',
    title: '30 minutes later…',
    desc: 'The access_token expired. Instead of a new popup, the app silently uses the refresh_token.',
    http: {
      title: 'POST /oauth2/token (refresh)',
      code: `POST ${host}/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&client_id=${PKCE.clientId}
&refresh_token=51vzPXXNl7scWXsw7YXvhMp…`,
      notes: [
        ['No user interaction', 'No popup, no password.'],
        ['When it expires', 'The user signs in again (back to step 1).'],
      ],
    },
  },
  {
    n: 11, from: 'auth', to: 'app', y: 612, channel: 'back', owner: 'sdk',
    label: 'new access_token',
    title: 'Fresh token, same session',
    desc: 'A new access_token arrives and API calls continue. The user never noticed.',
    http: {
      title: '200 OK: new access token',
      code: `{
  "access_token": "Kw9xR2mP0vQn7tYc1…",
  "expires_in": 1800,
  "username": "jsmith",
  "ssl": true
}`,
      notes: [['Loop', 'Steps 8 → 11 repeat until the refresh_token expires.']],
    },
  },
]

// SDK view: each click lights a group of steps tied to the highlighted code
export interface SdkGroup {
  steps: number[]
  setup?: boolean
  caption: string
}

export function laneX(id: LaneId) {
  return LANES.find(l => l.id === id)!.x
}
