# Pixtre Design System

Single source of truth for Pixtre's visual language. Derived from the Prompt 1
implementation (`src/styles.css`) plus the Prompt 2 typography decision below.
Any future design change should be made here first, then applied in code.

## 1. Brand identity

Pixtre is a premium, editorial stock-media platform — calm, minimal, confident.
Warm off-white and white surfaces carry the weight; a single light-brown accent
is used sparingly for actions and emphasis. The wordmark is set in the display
serif to signal an editorial (not SaaS/tech) product.

**Avoid:** neon colors, purple "AI" gradients, glassmorphism, excessive shadow,
heavy rounding, decorative motion, stock "gamer"/cyberpunk cues.

## 2. Color tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#faf7f2` | Page background (warm off-white) |
| `--surface` | `#ffffff` | Cards, nav, inputs, footer |
| `--sand` | `#efe8dd` | Image placeholders, skeleton base, hover fills |
| `--accent` | `#a9744f` | Links, focus ring tint, hover borders |
| `--accent-d` | `#8a5a3a` | Primary buttons, active/selected states, brand dot |
| `--text` | `#211c18` | Primary text (near-black, warm) |
| `--muted` | `#6b6058` | Secondary text, metadata, placeholders |
| `--border` | `#e8e0d6` | Hairline borders, dividers |

The site stays predominantly white/ivory; brown is reserved for buttons, links,
active states, selected filters, and small highlights — never large fills.

## 3. Typography

Two families, each with one clear job:

- **Playfair Display** — editorial/display headings: hero headline, page
  titles, section titles, media-detail titles, category names, empty/error
  state headings, the Pixtre wordmark. This is where the brand's personality
  lives.
- **Inter** — everything functional: navigation, buttons, forms, search,
  filters, metadata, captions, footer labels, small UI headings (e.g. "Sizes",
  "Quality"). **Admin/dashboard interfaces use Inter only** — no display serif
  in operational UI.

```css
--font: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
```

### Weights
- Inter: 400 (body), 500 (UI labels/buttons), 600 (emphasis/nav active), 700 (rare, strong emphasis)
- Playfair Display: 600 (section/page titles), 700 (hero, wordmark)

### Scale (desktop → mobile via `clamp()`)
| Role | Size |
|---|---|
| Hero h1 | `clamp(34px, 5.4vw, 58px)` |
| Page title (h1) | `clamp(28px, 4vw, 40px)` |
| Section title (h2) | 26px → 22px mobile |
| Detail title (h1) | 26px |
| Body | 16px / 1.6 line-height |
| UI label / button | 14–15px |
| Metadata / caption | 13–14px |

Line length stays comfortable: body copy max-widths around 540–560px in hero
and page-header contexts.

## 4. Spacing & grid

- **Base unit:** 8px. All paddings/margins/gaps are multiples of 8 (with 4px
  used only for tight icon/label gaps).
- **Desktop grid:** conceptually 12 columns within a 1280px max-width
  container (`.wrap`); components (media grid, category grid) use CSS
  `columns`/`grid` rather than a manual 12-col system, but should read as
  aligned to it.
- **Container widths:** `.wrap { max-width: 1280px; padding-inline: 20px }`
  (16px on mobile).
- **Section rhythm:** 48–56px between homepage sections; 32px top padding on
  interior pages.

## 5. Radius & borders

- `--r: 10px` for cards, category tiles, images.
- Buttons: 8px. Pills/tags/badges: fully rounded (`border-radius: 99px`).
- Borders are always `1px solid var(--border)` — no heavier borders, no
  dashed/decorative borders.

## 6. Buttons

- **Primary** (`.btn`): filled `--accent-d`, white text, 42px height (48px in
  the large hero search), 8px radius, Inter 600.
- **Outline** (`.btn.outline`): white fill, `--border` border, hover shifts
  border to `--accent`. Used for secondary actions (Share, Save, Load more).
- **Quiet** (`.btn.quiet`): transparent, used for low-emphasis nav actions
  (e.g. "Log in").
- Disabled state: 0.6 opacity, no pointer.
- Every interactive button has a visible `:focus-visible` outline
  (`--accent-d`, 2px, 2px offset) — never suppressed.

## 7. Inputs & forms

- Search field and filter selects sit on `--surface` with a `--border` hairline,
  10–12px radius for the search bar, 8px for standalone selects.
- Focus state: border → `--accent`, plus a soft 3px `rgba(169,116,79,.15)`
  halo. No color-only focus indication — the border itself moves.
- Placeholder text uses `--muted`.

## 8. Cards & media grid

- **Masonry grid:** CSS `columns` (4 desktop / 3 tablet / 2 mobile), 16px gap
  (10px mobile).
- **Card:** image fills the tile (`object-fit: cover`), 10px radius, subtle
  1.03× scale on hover (0.5s ease) — the only per-card motion.
- **Card overlay bar:** appears on hover/focus-within (always visible on
  touch), shows creator name + a quick action (Save, Download). Never more
  than two actions on a card — keep media uncovered.
- Skeletons use the shimmer gradient (`--sand` → `#f6f1e9` → `--sand`,
  1.4s linear loop) and preserve the real item's aspect ratio so nothing
  jumps on load.

## 9. Navigation

- Sticky, translucent-blurred `--bg` background, 68px height, hairline bottom
  border.
- Desktop: horizontal links + quiet/primary auth actions. Mobile: a single
  animated disclosure panel (height-transition, not slide/fade tricks),
  closes on route change and on Escape.
- Active route is indicated by color (`--accent-d`), not weight alone.

## 10. Header patterns (interior pages)

`.page-h`: page title (Playfair) + one line of supporting copy (Inter,
`--muted`) + the page's primary control (search bar and/or filter bar).
Consistent across Browse, Search, Categories, Collections.

## 11. Footer

Four-column layout (brand+blurb, Explore, Company, Legal) collapsing to two
columns on tablet/mobile. All labels Inter; links are `--muted` with
`--accent-d` on hover. Closing line credits Pexels as the media source.

## 12. Responsive breakpoints

| Breakpoint | Change |
|---|---|
| ≤1000px | Grid columns 4→3, category grid 4→3, detail layout stacks to 1 column |
| ≤820px | Desktop nav links/actions hide, mobile menu button appears |
| ≤600px | Grid columns →2, container padding 20→16px, search bar wraps, card overlay simplifies |

## 13. Accessibility requirements

- Every interactive element reachable by keyboard with a visible focus ring.
- `prefers-reduced-motion: reduce` disables all animation/transition globally.
- Images always carry meaningful `alt` text (photographer/creator-derived
  when no caption exists) or empty `alt=""` for decorative thumbnails.
- Color contrast: body text (`--text` on `--bg`/`--surface`) and muted text
  both meet WCAG AA at their used sizes.
- "Skip to content" link is the first focusable element on every page.
- Native, accessible elements are preferred over custom widgets where
  possible (e.g. `<details>/<summary>` for lightweight disclosure UI).

## 14. Motion

One deliberate transition per interaction, nothing ambient:
- Page content fades in on route change (0.25s).
- Card image scales gently on hover (0.5s).
- Mobile menu height-animates open/close (0.25s).
- Skeletons shimmer; nothing else loops or floats.

## 15. Loading / empty / error states

- **Loading:** skeleton shapes matching the real layout — never a spinner
  replacing a whole page.
- **Empty:** a short, direct heading + one supporting sentence + a next
  action where one exists (e.g. "Clear filters", "Back to home"). No blame,
  no apology.
- **Error:** states what happened in plain terms and offers "Try again"
  (reusing the real retry, not a reload). API error text surfaces the actual
  server message where the server provides one (e.g. a misconfiguration),
  rather than a generic string always.

## 16. Image & video treatment

- Images always render with their real aspect ratio reserved (via the
  Pexels `width`/`height` or `aspect-ratio` on the container) to prevent
  layout shift.
- `loading="lazy"`, `decoding="async"` on every off-screen image.
- Photo `srcSet` offers at least two real Pexels sizes; never upscale.
- Video never autoplays; a poster image (the Pexels `image` thumbnail) is
  always shown before playback; native `<video controls>` only.

## 17. Admin UI rules (for Prompt 4)

Admin/dashboard surfaces use **Inter only** — no Playfair Display anywhere in
admin, including page titles. Admin keeps the same color tokens and spacing
scale as the public site but favors a denser, more tabular layout (data
tables, compact controls) over the editorial, generous spacing used publicly.

## 18. Do / don't

**Do:** reuse the tokens above; keep one accent color; let whitespace do the
work; use Playfair only for the headings listed in §3; keep every card to at
most two visible actions.

**Don't:** add a second accent color; introduce new radii/shadows per
component; add sort/filter options the underlying API doesn't actually
support; present static or curated content as if it were live analytics
("trending now", "X people viewed this") unless it is backed by a real data
source; autoplay video; block functionality behind a sign-in wall that
doesn't exist yet — degrade gracefully instead (local storage + an honest
note) until Prompt 3 ships accounts.
