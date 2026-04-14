---
name: us-cvaa
description: US 21st Century Communications and Video Accessibility Act (CVAA). FCC rules on advanced comms (voice/video/messaging) + video programming captions / audio description / accessible video players. Triggers on "CVAA", "closed captions", "audio description", "video accessibility", "advanced communications", "real-time text", "RTT", "IP captioning", "VPAT video player".
allowed-tools: Read, Glob, Grep, Edit
---

# US CVAA — Communications & Video Accessibility

CVAA (Public Law 111-260, 2010) + FCC rules cover two regimes:

- **Title I — Communications**: advanced communications services (ACS) and equipment — VoIP, video conferencing, email, instant messaging, interoperable video.
- **Title II — Video**: captioning of internet-delivered video previously shown on US TV, and **audio description** on top-4 network + top-5 non-broadcast TV markets (FCC rules extended in 2020).

Applies to: streaming services, videoconferencing tools, chat/messaging apps, custom video players on media sites, VoIP features.

Always load `rules/accessibility.md` first. This skill adds the comms/video layer on top of WCAG.

## Title I — Advanced Communications (47 C.F.R. Part 14)

Product/service must be **accessible to and usable by** people with disabilities when **achievable** (statutory term — cost/technical assessment required).

Covered services/equipment:
- Interconnected VoIP (like normal phone replacements).
- Non-interconnected VoIP (Skype-style).
- Electronic messaging services (SMS-equivalent, IM).
- Interoperable video conferencing (Zoom, Teams, Meet, custom).

### Requirements

- **Input + output accessibility**: audio + visual + tactile I/O paths.
- **Real-time text (RTT)**: US providers transitioned from TTY to RTT 2017–2021 for wireless. VoIP/video calling tools must support RTT where they support voice.
- **Total conversation** (video + voice + text simultaneously) where video is supported — ties to EAA §112 principle.
- **Recordkeeping**: providers must keep records demonstrating accessibility considerations + file FCC annual certificates.
- **User-requested solutions**: the "achievable" test is on the provider; complaints to FCC under § 14.30.

## Title II — Video Programming (47 C.F.R. Part 79)

### Captions
- Any video previously captioned on US TV must retain captions when delivered over IP.
- Video clips of full programs, then montages, then live/near-live content — all now in scope post 2017.
- Captions must be **equivalent in content, synchronised, accessible in placement + contrast, readable**.
- User controls must allow changing caption **font, size, color, background, opacity, edge** — FCC "user display settings" rules.

### Audio Description
- Since 2020, top-4 networks + top-5 cable networks provide AD on 87.5 hours/qtr of prime-time or children's programming — rules expanded in 2020 to all top-60 markets and now beyond.
- Streaming re-distributed content that had AD on TV must preserve AD track.

### Accessible Video Players
- Players must expose closed-caption button prominently (no more than 1 click away).
- Volume, captions, AD controls accessible via keyboard + AT.
- Player metadata must expose caption/AD availability to AT.

## Success criteria overlay (on top of WCAG 1.2.*)

| Topic | Requirement |
|---|---|
| Caption toggle | One click / one tap; keyboard-reachable; not behind a "more" menu |
| Caption styling | User can override font, size, color, BG color, BG opacity, edge style — FCC 79.103 |
| AD track | Distinct audio track selectable alongside default audio |
| Live captions | Present + synchronised for any live stream that'd be captioned on TV |
| RTT | In any comms UI that carries voice |
| Player keyboard | Play/pause (Space), mute (M), captions (C), fullscreen (F) conventions |
| Player roles | `role="application"` or use `<video controls>` native |

## Common Problems

- Custom HTML5 player that hides `<track>` display and renders its own captions ignoring user settings.
- Captions burned into the video frame (open captions) with no CC toggle — not CVAA-compliant.
- Audio description only at the provider's option with no way for the user to turn it on.
- Videoconferencing tool with voice + video but no RTT path.
- "Live" video stream with no live caption service wired up.
- Messaging app that cannot send/receive emoji alt-text / ARIA-live announcements for new messages.

## Pitfalls

- `<track kind="descriptions">` is *not* the same as a separate audio-description audio track. Descriptions track = extended text for AT to speak between dialogue; native audio-description track = additional narration mixed or selectable. CVAA generally expects an actual audio track.
- Default-browser caption rendering varies — if you must override, ensure your custom rendering still honors user settings.
- User-caption-settings compliance often missed. FCC expects caption preferences to persist across sessions and to apply to all captioned content, not just one player.
- Third-party player embeds (YouTube, Brightcove, JW Player, Mux) — verify their CVAA stance; you inherit their gaps.

## Detection

```bash
# Custom video players
rg -l 'video\.js|react-player|plyr|vimeo-player|hls\.js|dashjs' package.json src/
# <track> usage
rg '<track' -g 'src/**/*.{astro,tsx,jsx,html}'
# WebRTC / calling / messaging features
rg -li 'rtcpeerconnection|getUserMedia|livekit|daily-co|twilio' src/
# RTT mentions
rg -i 'real.?time text|\brtt\b' src/
```

## Fix Patterns

**Native player with captions + AD selectable:**
```html
<!-- a11y [CVAA 47 CFR 79.103 / WCAG 1.2.2 + 1.2.5]: CC toggle one-click; AD track selectable -->
<video controls>
  <source src="/ep01.mp4" type="video/mp4" />
  <track kind="captions" srclang="en" src="/ep01.en.vtt" label="English" default />
  <track kind="captions" srclang="es" src="/ep01.es.vtt" label="Español" />
  <track kind="descriptions" srclang="en" src="/ep01.desc.vtt" label="Descriptions" />
</video>
<!-- plus a selectable AD audio track: offer an alt <video src="/ep01-ad.mp4"> toggle -->
```

**Custom player honoring FCC user settings:**
```tsx
{/* a11y [CVAA / FCC 79.103]: caption styling persisted in localStorage and exposed to user */}
const styleVars = {
  "--cc-font-size": `${settings.size}rem`,
  "--cc-color": settings.color,
  "--cc-bg": settings.bgColor,
  "--cc-opacity": settings.bgOpacity,
  "--cc-edge": settings.edge, // none | dropshadow | raised | depressed | uniform
};
<div className="cc-overlay" style={styleVars} aria-live="off">
  {currentCue}
</div>
```

**Keyboard shortcuts on the player:**
```tsx
{/* a11y [CVAA / WCAG 2.1.1]: industry-standard shortcuts for captions + AD toggle */}
onKeyDown={(e) => {
  if (e.key === " " || e.key === "k") togglePlay();
  if (e.key.toLowerCase() === "c") toggleCaptions();
  if (e.key.toLowerCase() === "d") toggleAudioDescription();
  if (e.key.toLowerCase() === "m") toggleMute();
  if (e.key.toLowerCase() === "f") toggleFullscreen();
}}
```

**Video conferencing — RTT path:**
```tsx
{/* a11y [CVAA Title I / 47 CFR 14]: real-time text alongside voice + video */}
<div role="log" aria-live="polite" aria-relevant="additions" className="rtt-stream">
  {rttMessages.map((m) => <p key={m.id}>{m.text}</p>)}
</div>
<input
  aria-label="Send real-time text"
  onInput={(e) => sendRtt(e.currentTarget.value)}
/>
```

## Reporting

```
## CVAA fixes
- src/components/VideoPlayer.tsx:24 — CVAA §79.103 — exposed caption-settings panel honoring user font/size/color
- src/features/call/CallRoom.tsx:44 — CVAA Title I — added RTT log pane alongside voice stream
- follow-up: verify our Mux player embed inherits user caption settings (vendor setting)
```

Flag any content the user sourced from US broadcast TV — it must keep its captions + AD on IP delivery; confirm the upstream feeds include both.
