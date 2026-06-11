# Signal Monitor — Theme

## Personality
Clean and approachable. Developer tool that doesn't feel corporate.
Inspired by Linear, Raycast — modern without being aggressive.

## Core palette

| Token | Value | Usage |
|---|---|---|
| primary | indigo-600 | Buttons, links, active states |
| primary-hover | indigo-700 | Button hover |
| background | zinc-50 | Page background |
| surface | white | Cards, panels, modals |
| border | zinc-200 | Card borders, dividers |
| text | zinc-900 | Primary text |
| muted | zinc-500 | Secondary text, metadata |

## Intent category colors

| Category | Color | Usage |
|---|---|---|
| hiring | green-500 | Badge, chip, accent |
| pain_point | violet-500 | Badge, chip, accent |
| discussion | amber-500 | Badge, chip, accent |
| noise | zinc-400 | Badge, chip, accent |

## Score badge colors

| Score range | Color |
|---|---|
| 7–10 | green-500 |
| 4–6 | amber-500 |
| 1–3 | zinc-400 |

## Typography
- Font: system-ui (no custom font for MVP)
- Headings: zinc-900, font-semibold
- Body: zinc-700, font-normal
- Muted: zinc-500, text-sm

## Icons
- Library: lucide-react
- Size: 16px (sm), 20px (md, default), 24px (lg)
- Color: inherit from parent text color unless explicitly overridden
- Stroke width: 1.5 (Lucide default)

## Key icon mappings
| Action / concept | Icon |
|---|---|
| Open link | ExternalLink |
| Save | Bookmark |
| Dismiss | X |
| Hiring | Briefcase |
| Pain point | Zap |
| Discussion | MessageSquare |
| Noise | VolumeX |
| Monitor | Radio |
| Pause | PauseCircle |
| Resume | PlayCircle |
| Run now | RefreshCw |
| Settings | Settings |
| Unread | Circle (filled) |
| HN source | use text "HN" — no icon |

## Rules
- Never use raw hex values — always use Tailwind tokens from this palette
- Never introduce a new color without adding it here first
- Indigo replaces any blue-600 from the auth feature going forward
