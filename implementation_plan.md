# Flora AI — Senior Product Design Transformation Plan

## The Core Problem (Diagnosed)

Looking at the Kindwise reference and the current state:

**Kindwise works because:**
- Full-bleed photography IS the hero (not a card on it)
- Large editorial headings (not every text is the same weight)
- Whitespace IS a design element (sections breathe)
- Photography-forward categories (not letter avatars)
- Floating UI overlays on photos (not sidebar cards)
- Split asymmetric layouts (not symmetric grid)
- Restrained green usage (not green everywhere)

**Flora AI currently fails because:**
- Every section = white card + border + icon + text
- No visual differentiation between sections
- Text-heavy, photography-absent
- Green used uniformly (not semantically)
- Symmetric grid of identical cards
- No storytelling flow

---

## Design Principles Applied

### Photography strategy
Generate AI plant images for:
1. Hero: Close-up wheat/rice diseased leaf with moisture drops
2. XAI section: Leaf with heatmap visualization overlay
3. Feature sections: Rice field, wheat field, cotton field, sugarcane
4. Disease showcase: Rice Blast, Yellow Rust (Wheat), Red Rot (Sugarcane), Bacterial Blight (Cotton)
5. Crop focus: 4 crop portraits

### Layout language (not uniform cards)
- Hero: Full-bleed photo (60% right) + editorial text left
- Stats: Borderless typography strip
- How It Works: Step numbers + connecting line (no boxes)
- XAI: Full-width dark section, photo left + floating overlay right
- Features: Alternating large image + text (NOT cards)
- Disease showcase: Photo-forward cards only here (justified)
- Crops: Mosaic grid with photos
- Timeline: Line graph visual
- CTA: Full-width dark section

### Color usage (restrained)
- `#12372A` Deep Forest — brand primary, headings, dark sections
- `#08251C` Dark Forest — hero overlay, footer
- `#769B85` Sage — secondary labels, muted accents
- `#F6F6F0` Warm Ivory — page background (not pure white)
- `#17221D` Charcoal — body text
- `#69756F` Muted — secondary text
- `#14966F` Healthy — only for healthy states
- `#D99A2B` Moderate — warnings
- `#C84D4D` Severe — danger states
- Green NOT on nav items, borders, icons, decorations

---

## Files to Create/Modify

### Phase 1: Foundation
1. `index.css` — Complete design system (typography, tokens, editorial utilities)

### Phase 2: Navigation & Layout
2. `Navbar.tsx` — Minimal premium (logo left, nav center, location pill + scan CTA right)
3. `AppLayout.tsx` — Remove inner padding for hero pages; full-bleed support
4. `MobileHeader.tsx` — Minimal
5. `BottomNav.tsx` — Clean labels
6. `Footer.tsx` — Dark forest footer, 3-column

### Phase 3: Home Page (Biggest Change)
7. `HomePage.tsx` — Complete editorial redesign:
   - Full-bleed photographic hero
   - Borderless stats strip
   - How It Works (numbered, connected)
   - XAI deep section (dark bg, floating overlay)
   - 4 alternating feature sections
   - Disease photo showcase
   - Crop focus mosaic
   - Health timeline
   - Dark CTA section

### Phase 4: Other Pages
8. `LibraryPage.tsx` — Photo-forward encyclopedia
9. `AssistantPage.tsx` — Agricultural assistant feel (not ChatGPT)
10. `ScanPage.tsx` — Premium scanner with progress steps
11. `MyPlantsPage.tsx` — Monitoring experience with large plant cards
12. `DiagnosisResultPage.tsx` — Professional report layout

---

## Crops: ONLY These 4
- Rice (diseases: Rice Blast, Brown Spot, Hispa)
- Wheat (diseases: Brown/Leaf Rust, Yellow/Stripe Rust, Septoria)
- Cotton (diseases: Bacterial Blight, Leaf Curl Virus)
- Sugarcane (diseases: Red Rot, Mosaic Virus)

> [!IMPORTANT]
> No other crops will appear anywhere in the application. Tomato, Potato, etc. are removed from all showcase sections, crop filters, sample data, and copy.

---

## Open Questions

> [!NOTE]
> The AppLayout currently constrains all pages to `max-w-[1440px]` with horizontal padding. The hero section needs to bleed to the viewport edge. I will handle this by making the HomePage manage its own hero full-bleed layout while the AppLayout padding only applies to sub-sections.

> [!NOTE]
> All existing API routes, AI model, heatmap, scanner, and authentication functionality are fully preserved. Only the presentation layer changes.
