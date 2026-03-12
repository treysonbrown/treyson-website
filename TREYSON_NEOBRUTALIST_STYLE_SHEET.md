# Style Sheet: Treyson Neobrutalist System

## How To Apply

Use this document as an execution prompt for an agent that is restyling an existing website.

Scope:
- Restyle the visual system while preserving content semantics, information architecture, and core layout flow.
- Allow moderate component reshaping (navigation chrome, card shells, badges, buttons, section headers).
- Do not perform a full page/layout rewrite unless explicitly asked.

Execution order for the downstream agent:
1. Inventory the target site’s primitives and repeated patterns (`nav`, buttons, cards, inputs, dialogs, data panels, tables, chart shells).
2. Map the target’s colors/typography/spacing to the design tokens in this document.
3. Update primitive components first (button, card, input, badge, dialog).
4. Propagate the visual grammar to page sections (hero, content sections, lists, dashboards).
5. Apply interaction states (hover, active/press, focus, reduced motion behavior).
6. Validate responsive behavior, contrast, and keyboard focus visibility.

Preservation rules:
- Keep semantic HTML and accessibility labels intact.
- Keep existing content copy unless explicitly asked to rewrite copy.
- Keep existing routes/page structure.
- Preserve component functionality (forms, modals, sorting, charts).
- Do not introduce rounded corners.

## Design Tokens

Use these normalized tokens even if the target stack uses different naming.

### Core Tokens (Light Mode)

- `background`: `hsl(0 0% 100%)` (white)
- `foreground`: `hsl(0 0% 0%)` (black)
- `card`: same as `background`
- `card-foreground`: same as `foreground`
- `border-strong`: `hsl(0 0% 0%)`
- `input-bg`: same as `background`
- `muted-bg`: `hsl(0 0% 90%)`
- `muted-fg`: `hsl(0 0% 40%)`
- `ring`: `hsl(210 100% 50%)`

### Accent Palette (Neobrutalist)

- `accent-primary` (electric blue): `hsl(210 100% 50%)`
- `accent-secondary` (hot pink): `hsl(330 100% 50%)`
- `accent-tertiary` (lime green): `hsl(120 100% 50%)`
- `accent-warning` (bright yellow): `hsl(60 100% 50%)`
- `accent-orange`: `hsl(30 100% 50%)`
- `accent-purple`: `hsl(270 100% 50%)`

Practical site accent usage (commonly used on pages/nav):
- `accent-highlight`: `#ff4499` (used for punctuation, active indicators, and hover highlights)

### Core Tokens (Dark Mode)

Use a high-contrast dark shell while preserving the same shape language.

- `background`: `hsl(222.2 84% 4.9%)`
- `foreground`: `hsl(210 40% 98%)`
- `card`: `hsl(222.2 84% 4.9%)`
- `card-foreground`: `hsl(210 40% 98%)`
- `border-strong`: `hsl(217.2 32.6% 17.5%)` for generic tokens, but page-level components often use explicit white borders for stronger contrast
- `input-bg`: `hsl(217.2 32.6% 17.5%)`
- `muted-bg`: `hsl(217.2 32.6% 17.5%)`
- `muted-fg`: `hsl(215 20.2% 65.1%)`
- `ring`: `hsl(212.7 26.8% 83.9%)`

Practical dark-mode component treatment used across pages:
- Background often becomes `zinc-950`-like near-black
- Borders often become white (or near-white) for strong separation
- Shadows invert to white offset shadows on dark surfaces

### Shape / Border / Shadow Tokens

- `radius-none`: `0`
- `border-thin`: `2px` (frequent for controls, badges, small shells)
- `border-medium`: `3px` (utility `.border-brutal`)
- `border-thick`: `4px` (frequent for major panels/sections)
- `border-xthick`: `5px` (utility `.border-brutal-thick`)

Brutal offset shadows:
- `shadow-brutal-sm`: `4px 4px 0px <border-color>`
- `shadow-brutal-md`: `8px 8px 0px <border-color>`
- `shadow-brutal-lg`: `12px 12px 0px <border-color>`

Pressed interaction behavior:
- Translate component by `+1px` to `+2px` on x/y
- Reduce or remove offset shadow to simulate a physical press

### Typography Tokens

- `font-display`: bold/black sans-serif (system sans is acceptable if target lacks a brand display font)
- `font-ui`: sans-serif
- `font-mono`: `JetBrains Mono`, fallback `Consolas`, `Monaco`, `monospace`

Typography pairing rules:
- Use `font-display` for headlines, section titles, strong labels
- Use `font-mono` for metadata, utility text, badges, labels, nav microcopy, chart annotations, form helper text

### Dense UI / Chart Tokens (Reusable)

For data-heavy pages (from stats/dashboard patterns):
- `chart-grid-light`: `#e5e7eb`
- `chart-grid-dark`: `#444`
- `chart-bar-light`: `black`
- `chart-bar-dark`: `white`
- `heatmap-empty-light`: `#f3f4f6`
- `heatmap-empty-dark`: `#27272a`

## Visual Grammar

### Shape Language

- Hard edges everywhere: no rounded corners on cards, buttons, inputs, dialogs, badges.
- Strong visible borders are part of the aesthetic, not a subtle separator.
- Panels should read like printed blocks or physical tiles.

### Borders

- Prefer black borders in light mode and white/high-contrast borders in dark mode.
- Default border thickness:
  - Small controls/badges: `2px`
  - Primary panels/cards/nav shells: `4px`
- Use border color changes (not glow) as a primary active/hover signal.

### Shadows (Offset “Stamped” Look)

- Use offset shadows instead of soft blur shadows.
- Keep shadows crisp (`0px` blur) and aligned with border color semantics.
- On hover/active for interactive blocks:
  - Slight positional movement (`translate-x`, `translate-y`)
  - Shadow shrinks or disappears to simulate press depth

### Typography

- Headlines:
  - Uppercase
  - Very bold (`800`/`900`)
  - Tight tracking (`tracking-tight` / `tracking-tighter`)
  - Tight line-height for hero and section titles
- Body copy:
  - Standard sans or mono depending on content density
- Utility/meta text:
  - Monospace
  - Often uppercase
  - Small sizes (`10px`-`14px`)
  - Tracking widened for labels

### Color Usage Strategy

- Base canvas is mostly monochrome (black/white/near-black).
- Accent colors are used sparingly and intentionally:
  - punctuation in headlines
  - active nav indicators
  - status dots/badges
  - button fills
  - hover highlight bars
- Avoid full-page rainbow use; keep accents localized.

### Layout Rhythm

- Generous whitespace around major sections.
- Strong horizontal separators (`4px` rules) between content regions.
- Use containerized content widths with bold visual blocks inside.
- Mix large bold headings with compact mono metadata for contrast.

### Signature Motifs (Use) vs Optional Flair (Optional)

Use (signature motifs):
- Engineering/grid background pattern on hero or full-page sections
- Accent punctuation (`.`) in hero/name/headline
- High-contrast nav with scroll-state border change
- Brutal cards/buttons with offset shadows

Optional flair (do not force unless requested):
- Game-like or interactive hero overlays (e.g., Game of Life)
- Complex motion choreography
- Animated overlays unrelated to target product

## Component Mapping Rules

Use this normalized taxonomy when translating a target site.

### `TopNav`

Visual intent:
- Feels like a tool header, not a soft marketing navbar.

Required characteristics:
- Fixed or sticky top placement
- High-contrast background
- Bold logo/wordmark text
- Mono or compact labels for nav items
- Scroll-state transition from transparent/semi-plain to bordered shell

Transformation rules:
- If target nav is translucent/glassy, replace with solid background and hard border treatment.
- If target nav links use subtle underline-on-hover, replace with accent bar fill/underline + stronger active indicator.
- If target has pill nav items, remove pill rounding and use flat text + highlight bars.

States:
- Active item: persistent accent underline/bar and/or low-opacity accent fill behind text
- Hover item: animated underline/bar growth or accent background strip
- Mobile menu: hard-edged drawer with `4px` border and stamped card-like links

### `Hero`

Visual intent:
- Bold, engineered, high-contrast introduction with a strong name/title lockup.

Required characteristics:
- Large uppercase display typography
- Tight tracking/leading
- Accent punctuation or highlighted word fragment
- Optional grid background
- Mono subtext for technical/utility tone

Transformation rules:
- If target hero uses centered soft gradients + rounded CTA cluster, keep layout but convert components to hard-edge brutal controls.
- If target hero headline is sentence-case, convert to uppercase only if it does not harm brand/legal copy.

### `SectionHeader`

Visual intent:
- Editorial label + block title pairing.

Required characteristics:
- Large bold uppercase title
- Mono kicker/status line or tag
- Strong separator line or border

Transformation rules:
- Replace light gray section dividers with thick black/white rules.
- Convert tiny sans metadata to mono uppercase labels.

### `Card`

Visual intent:
- Physical printed tile / stamped panel.

Required characteristics:
- Square corners
- Visible border (`2px`-`4px`)
- Offset shadow
- Hover press effect if clickable

Transformation rules:
- If target cards are rounded with soft blur shadows, convert to:
  - `border-radius: 0`
  - crisp border
  - offset shadow
  - press-state hover
- If target card background is tinted, keep tint only if contrast remains strong.

Optional variations:
- Media card with border-separated image region
- Data card with inverse (dark) background + light text
- Outline card (white fill, black border) vs accent-fill card

### `Badge`

Visual intent:
- Utility label / system tag.

Required characteristics:
- Monospace text
- Uppercase or uppercase-like styling
- Hard border
- Tight padding
- Strong contrast

Transformation rules:
- Convert pill badges to rectangular tags.
- Replace pastel tag chips with bordered monochrome or accent tags.

### `PrimaryButton`

Visual intent:
- Tactile, stamped CTA with bold label.

Required characteristics:
- Square corners
- Bold uppercase label
- Border + offset shadow
- Press-in hover/active behavior

Default style:
- Accent fill (`accent-primary`, `accent-secondary`, or `accent-highlight`)
- High-contrast text (often black on pink/yellow or white on blue)

Transformation rules:
- If target CTA is gradient/glow, replace with solid accent fill + border + offset shadow.
- Keep icon + label layouts, but unify chrome.

States:
- Hover: slight translate + larger/smaller offset shadow depending on platform style
- Active: pressed (`translate`, shadow removed/reduced)
- Disabled: retain shape and border, lower opacity only
- Focus: visible ring/outline, not hidden

### `SecondaryButton`

Visual intent:
- Same tactile system, less visual weight than primary.

Required characteristics:
- Same shape language as primary
- Usually white/transparent background with strong border
- Mono or bold uppercase text

Transformation rules:
- Replace gray ghost buttons with `white/ink + border + offset shadow`.
- Optional accent-outline variant for utilities.

### `FormField`

Visual intent:
- Tool-like input controls, not soft consumer inputs.

Required characteristics:
- Square corners
- `2px` strong border
- High-contrast background
- Mono text for labels/help and often field text
- No subtle inset shadows

Transformation rules:
- Remove rounded corners and soft inner shadows.
- Increase border contrast.
- Convert label/helper text to mono utility style.

Subtypes:
- Text inputs
- Textareas
- Select triggers/menus
- Date inputs
- Toggle/filter chips (rectangular)

### `Dialog`

Visual intent:
- Floating utility panel with hard shell and clear hierarchy.

Required characteristics:
- Square corners
- Strong border (`2px`-`4px`)
- Offset shadow
- Bold title + mono description/meta
- Dense internal spacing with visible separators

Transformation rules:
- Replace blurred/rounded modals with crisp bordered panels.
- Keep overlay dimming subtle; dialog shell should provide the identity.

### `DataPanel`

Visual intent:
- Dashboard block with strong frame and legible metrics.

Required characteristics:
- Thick border
- Offset shadow
- Mono labels + bold metric values
- Optional inverse theme (dark fill, light text)

Transformation rules:
- Replace soft dashboard cards with heavier framing and stronger type contrast.
- Promote key metrics to large bold numerals with mono labels.

### `ChartContainer`

Visual intent:
- Chart is housed in a designed panel, not dropped directly on page background.

Required characteristics:
- Bordered panel shell
- Strong title row
- Mono annotations
- Explicit chart grid/bar colors per theme

Transformation rules:
- If target charts inherit low-contrast defaults, override grid, bar, and tooltip shell colors to match this system.
- Remove rounded tooltip shells and chart wrappers.

## Interaction & Motion Rules

### Interaction States

- Hover (interactive shells/cards/buttons):
  - Use position shift and border/shadow changes
  - Avoid soft glow effects
- Active/Pressed:
  - Simulate physical press with translation and shadow reduction
- Focus-visible:
  - Keep explicit ring or outline (blue ring is acceptable if consistent)
  - Never remove keyboard focus style without replacement
- Selection:
  - Text selection may use `accent-highlight` with white text

### Motion Style

- Motion is functional, not ornamental.
- Short transitions (`150ms`-`300ms`) for nav, hover, panel state changes.
- Prefer opacity + position + small scale changes.
- Respect reduced motion preferences:
  - Disable or simplify transforms/animations
  - Keep state changes visible via border/color only

### Navigation Motion Pattern

- Top nav transitions padding/border visibility on scroll.
- Mobile drawer uses clear slide-in motion with fixed overlay.
- Active indicators animate line/bar growth rather than soft fade-only effects.

## Dense UI Rules

Apply these to app dashboards, admin pages, and data views.

### Forms (Inputs, Textareas, Selects)

- `2px` hard borders, square corners, high-contrast fill.
- Use mono font for labels, helper text, placeholders, and often field content.
- Select menus/dropdowns should inherit the same border/shape language.
- Primary action buttons in forms should use the same brutal pressed behavior.

### Tables / Lists / Kanban-like Cards

- Use strong row/card separation via borders, not subtle shadow gradients.
- Metadata rows (dates, usernames, statuses, counts) should use small mono utility text.
- Tags and statuses become rectangular bordered badges.
- Action icons (edit/delete/etc.) should sit in square bordered buttons.

### Dialogs / Drawers / Popovers

- Square shells with visible border and minimal radius (`0`).
- Internal hierarchy:
  - Bold title
  - Mono description
  - compact form controls
  - strong footer actions
- Keep overlays simple (`black/50` is fine); visual identity should come from shell.

### Badges / Status Pills (Dense UI)

- Always rectangular; no pill chips.
- `font-mono`, uppercase, small size.
- Outline style is default; accent fill reserved for priority/primary status.

### Data Panels / Metrics

- Prefer one of two styles:
  - Light panel with black border + black shadow
  - Dark/inverse panel with white text + white border/shadow (or muted contrast shadow)
- Use large numeric hierarchy for metrics and mono labels for context.
- Insert visible dividers (`1px` or thicker) inside metric panels for structure.

### Charts

- Place charts inside bordered shells with titles and optional utility icons/labels.
- Theme chart primitives explicitly:
  - Grid lines (light/dark token pair)
  - Bars/lines (black in light, white in dark unless semantic color needed)
  - Tooltip background shell with border and mono text
- Remove rounded chart corners/tooltips if library defaults them.

## Do / Don’t Rules

### Do

- Use hard edges and visible borders consistently.
- Use offset shadows with zero blur for tactile depth.
- Pair bold uppercase display typography with mono utility text.
- Use accent colors selectively for emphasis and interaction.
- Preserve semantics and accessibility.
- Keep mobile and desktop both legible and intentional.
- Maintain high contrast in dark mode (especially borders and labels).

### Don’t

- Don’t introduce rounded corners.
- Don’t use soft blur/glow shadows as the primary depth cue.
- Don’t flood entire pages with accent colors.
- Don’t replace all typography with monospace.
- Don’t remove focus indicators.
- Don’t rewrite content or restructure page IA beyond moderate component reshaping.
- Don’t add decorative motion that obscures function.

## Transformation Checklist

Use this checklist after restyling the target site.

- Corners are square across buttons, cards, inputs, dialogs, badges, and menus.
- Borders are visible, consistent, and intentional (`2px`-`4px` most of the time).
- Interactive blocks use offset shadow and press/translate behavior.
- Headlines are bold and high-impact; utility text uses mono styling where appropriate.
- Accent color usage is sparse and meaningful (active states, punctuation, status, CTAs).
- Nav has a strong active/hover treatment and a clear scroll-state shell behavior (if sticky/fixed).
- Cards and panels read as stamped/tiled objects, not soft glass panels.
- Dense UI controls (forms, dialogs, badges, list items) match the same visual grammar.
- Charts are in bordered containers with explicit light/dark theming.
- Dark mode preserves strong contrast for borders, text, and charts.
- Focus-visible states remain obvious for keyboard users.
- Reduced-motion users still get clear state changes without relying on animation.

## Optional Tailwind Mapping Appendix

Use this only when the target site uses Tailwind (or a utility-first style system).

### Token Mapping Hints

- `bg-background` -> page/panel backgrounds
- `text-foreground` -> default text
- `border-border` -> baseline border color token
- `bg-primary`, `bg-secondary`, `bg-accent` -> accent fills
- `font-mono` -> utility/meta text and compact labels
- `rounded-none` -> apply globally to shells/controls

### Common Utility Patterns (from source style)

- Brutal border:
  - `border-2 border-black dark:border-white`
  - `border-4 border-black dark:border-white`
- Brutal shadow:
  - `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
  - `dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]`
  - `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- Pressed interaction:
  - `hover:translate-x-1 hover:translate-y-1 hover:shadow-none`
  - `active:translate-y-1 active:shadow-none`
- Headline style:
  - `font-black uppercase tracking-tighter leading-[0.9]`
- Utility text:
  - `font-mono text-xs uppercase tracking-widest`

### Reusable Component Classes (Conceptual)

- Primary button:
  - `rounded-none border-2 font-mono font-bold uppercase tracking-wider`
  - accent fill + brutal shadow + press hover
- Card panel:
  - `rounded-none border-4 bg-card shadow-[8px_8px_0px_0px_...]`
- Badge:
  - `rounded-none border-2 font-mono text-[10px] uppercase tracking-widest`
- Dialog shell:
  - `rounded-none border-2 bg-white dark:bg-zinc-900`

## Example Rewrite Snippets

### Example 1: Generic Card (soft SaaS -> neobrutalist)

Before:

```html
<article class="card">
  <h3>Project title</h3>
  <p>Short description</p>
  <a class="btn-primary">View</a>
</article>
```

After (framework-agnostic intent):

```html
<article class="nb-card">
  <h3 class="nb-card-title">PROJECT TITLE</h3>
  <p class="nb-meta">Short description</p>
  <a class="nb-btn nb-btn-primary">VIEW</a>
</article>
```

```css
.nb-card {
  background: var(--background, #fff);
  color: var(--foreground, #000);
  border: 4px solid var(--border-strong, #000);
  border-radius: 0;
  box-shadow: 8px 8px 0 0 var(--border-strong, #000);
  padding: 1.25rem;
}

.nb-card:hover {
  transform: translate(1px, 1px);
  box-shadow: 0 0 0 0 var(--border-strong, #000);
}

.nb-card-title {
  margin: 0 0 0.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.03em;
}

.nb-meta {
  font-family: "JetBrains Mono", Consolas, Monaco, monospace;
  font-size: 0.9rem;
}
```

### Example 2: Primary / Secondary Buttons

```css
.nb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0;
  border: 2px solid var(--border-strong, #000);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.7rem 1rem;
  transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.nb-btn:focus-visible {
  outline: 2px solid transparent;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--ring, #0080ff);
}

.nb-btn-primary {
  background: var(--accent-highlight, #ff4499);
  color: #000;
  box-shadow: 4px 4px 0 0 rgba(255, 68, 153, 0.35);
}

.nb-btn-secondary {
  background: var(--background, #fff);
  color: var(--foreground, #000);
  box-shadow: 4px 4px 0 0 var(--border-strong, #000);
}

.nb-btn:hover {
  transform: translate(1px, 1px);
}

.nb-btn:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}
```

### Example 3: Dense UI Form + Dialog Shell

```html
<div class="nb-dialog">
  <h2 class="nb-dialog-title">CREATE TASK</h2>
  <p class="nb-dialog-meta">Use mono labels and square controls.</p>
  <label class="nb-label" for="task-title">TITLE</label>
  <input id="task-title" class="nb-input" />
  <label class="nb-label" for="task-notes">NOTES</label>
  <textarea id="task-notes" class="nb-input nb-textarea"></textarea>
  <div class="nb-actions">
    <button class="nb-btn nb-btn-secondary">Cancel</button>
    <button class="nb-btn nb-btn-primary">Create</button>
  </div>
</div>
```

```css
.nb-dialog {
  background: #fff;
  color: #000;
  border: 2px solid #000;
  border-radius: 0;
  box-shadow: 6px 6px 0 0 #000;
  padding: 1rem;
  max-width: 40rem;
}

.nb-dialog-title {
  margin: 0;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.nb-dialog-meta,
.nb-label {
  font-family: "JetBrains Mono", Consolas, Monaco, monospace;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
}

.nb-input {
  width: 100%;
  border: 2px solid #000;
  border-radius: 0;
  background: #fff;
  color: #000;
  padding: 0.625rem 0.75rem;
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
}

.nb-textarea {
  min-height: 6rem;
  resize: vertical;
}

.nb-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
```

### Example 4: Engineering Grid Background (Optional Hero/Section Motif)

```css
.nb-grid-bg {
  background-image:
    linear-gradient(#f0f0f0 1px, transparent 1px),
    linear-gradient(90deg, #f0f0f0 1px, transparent 1px);
  background-size: 40px 40px;
}

.theme-dark .nb-grid-bg {
  background-image:
    linear-gradient(#27272a 1px, transparent 1px),
    linear-gradient(90deg, #27272a 1px, transparent 1px);
}
```

