# Property Manager Design Guidelines

## Design Approach

**Selected Approach:** Design System - Material Design 3 principles adapted for data-intensive productivity applications

**Rationale:** This is a utility-focused, information-dense enterprise application requiring consistency, clarity, and efficient data management. Drawing inspiration from Linear's clean data presentation, Notion's organized hierarchy, and Material Design's structured component patterns.

**Core Principles:**
- Data clarity and scanability above visual flourish
- Efficient information density without clutter
- Consistent, predictable interaction patterns
- Mobile-first responsive design

---

## Typography System

**Font Families:**
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for financial data, IDs)

**Type Scale:**
- Page Titles: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Card/Component Titles: text-lg font-medium (18px)
- Body Text: text-base font-normal (16px)
- Secondary/Meta: text-sm font-normal (14px)
- Table Headers: text-sm font-semibold uppercase tracking-wide
- Financial Data: text-lg font-mono font-medium

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4, p-6
- Section spacing: gap-4, gap-6, gap-8
- Container margins: mx-4, mx-6 (mobile), mx-8 (desktop)
- Card spacing: p-6 (desktop), p-4 (mobile)

**Grid Structure:**
- Container: max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Dashboard KPIs: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
- Property/Unit Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Forms: Single column max-w-2xl, two-column for related fields
- Tables: Full-width responsive with horizontal scroll on mobile

**Navigation:**
- Desktop: Fixed top bar (h-16), full-width property selector + breadcrumbs + CTA
- Mobile: Hamburger menu (overlay drawer), sticky header with property name
- Breadcrumbs: Always below top bar, text-sm with chevron separators

---

## Component Library

### Cards & Containers
- KPI Cards: Elevated cards with subtle shadow, rounded-lg, border-2
- Property/Unit Cards: Hoverable cards with clean borders, p-6, organized info hierarchy
- Data Tables: Bordered containers with alternating row backgrounds for scanability

### Navigation Components
- Top Bar: Fixed header with property dropdown (left), Add Transaction button (right)
- Breadcrumbs: Inline navigation with text-sm, separated by "/"
- Mobile Menu: Overlay drawer from left, full navigation tree with icons
- Tabs: Underline style for Active/Inactive tenant views, Activity Log sections

### Forms & Inputs
- All inputs: Consistent height (h-10), rounded-md borders, focus states with ring
- Labels: text-sm font-medium mb-2
- Dropdowns: Native select styled consistently, tenant/unit linking with search
- Date pickers: Standard HTML5 date inputs with custom styling
- Image Upload: Dashed border drop zone with camera/file icons, preview thumbnails
- Validation: Inline error messages below fields, text-sm in error state

### Data Display
- Tables: 
  - Headers: Sticky on scroll, font-semibold, bg treatment
  - Rows: Alternating backgrounds, h-12 minimum
  - Actions: Icon buttons (edit/delete) aligned right
  - Mobile: Card-based layout stacked, not horizontal scroll
- Financial Data: Right-aligned, monospace font, green for income (+), standard for expense
- Status Badges: Rounded-full px-3 py-1 text-xs font-medium (Active/Inactive)

### Buttons & Actions
- Primary CTA: Solid buttons, px-6 py-2.5 rounded-md font-medium
- Secondary: Outlined buttons with border-2
- Icon Buttons: Square (w-10 h-10) for table actions
- Add Transaction: Prominent button in top bar, always accessible
- Export CSV: Secondary button with download icon

### Dashboard Components
- KPI Cards: Large number display (text-3xl font-bold), label below (text-sm), icon top-right
- Charts: Using Chart.js or Recharts, clean line/bar charts with grid lines, responsive height
- Insights Panel: Bulleted list with percentage changes, icons for up/down trends
- Property Selector: Dropdown if multiple properties, prominently placed top-left
- Toggle: Monthly/Yearly view toggle as segmented control

### Filters & Search
- Search Bar: w-full md:w-80, leading search icon, h-10
- Filter Panel: Collapsible on mobile, inline on desktop, gap-4 between filters
- Filter Chips: Applied filters shown as removable badges above tables
- Date Range: Two date inputs side-by-side with "to" separator

### Modals & Overlays
- Confirmation Dialogs: Centered overlay, max-w-md, clear Yes/No actions
- Add/Edit Forms: Slide-in panel from right (desktop) or full-screen modal (mobile)
- Image Preview: Full-screen overlay with close button, zoom capability

### Activity Log
- Timeline Layout: Vertical line with connected events
- Log Entries: Card-based with timestamp (text-xs), action description, entity reference
- Show last 10 entries per entity, "Load more" if needed

---

## Responsive Behavior

**Breakpoints:**
- Mobile: base (< 768px) - Stack all components, hamburger menu, card-based tables
- Tablet: md (768px+) - 2-column layouts, visible breadcrumbs, horizontal tables
- Desktop: lg (1024px+) - 3-4 column grids, full navigation, optimized table widths

**Mobile Adaptations:**
- Tables → Card grid with key info visible
- Multi-column forms → Single column
- Sidebar filters → Collapsible panel with toggle button
- KPI cards → Single column stack, full width
- Charts → Maintain aspect ratio, simplified legends

---

## Images

**No hero images required.** This is a data-focused productivity application.

**Image Usage:**
- Tenant ID photos: Thumbnail (w-20 h-20) in tenant cards, full view in detail page
- Transaction receipts: Thumbnail icon in table, expandable preview modal
- Empty states: Simple illustrations for "No properties yet", "No transactions found"
- All images: rounded-lg corners, object-cover for consistency

---

## Accessibility

- WCAG AA compliance throughout
- Focus indicators: 2px ring on all interactive elements
- Form labels: Always visible, associated with inputs via htmlFor
- Icon buttons: aria-labels for screen readers
- Table headers: Proper th/scope attributes
- Keyboard navigation: Full support with logical tab order
- Error states: Announced to screen readers

---

## Icons

**Library:** Heroicons (via CDN)
- Solid variant for filled states, primary actions
- Outline variant for secondary actions, navigation
- Consistent 20px size for inline icons, 24px for standalone