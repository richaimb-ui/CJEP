---
trigger: always_on
---

- **Secondary / Filter**: `bg-card border border-border rounded-xl text-sm text-gray-500 hover:bg-gray-50`
- **Ghost/Icon**: `text-gray-400 hover:text-foreground p-2`

### Tables

- Wrap in `<div className="overflow-x-auto">`
- Header: `text-gray-400 font-medium border-b border-border text-left`
- Rows: `border-b border-border/50 last:border-0 py-4`
- Avatars in lists: `w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold`

### Interactions & Micro-animations

- All buttons and links MUST have hover states (e.g., `hover:bg-gray-50` or `hover:opacity-80`).
- Apply `transition-colors duration-200` or `transition-all duration-200` to interactive elements.

---

## 3. Responsive Constraints (Mobile-First)

- **Mobile Default**: Assume `flex-col`, 1-column layouts, and hidden sidebars by default.
- **Breakpoints**:
  - Desktop/Tablet styling triggers at `md:` and `lg:`.
  - Grids must stack: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`.
- **Sidebar**: Handled entirely by `AppShell` and hidden on mobile behind an overlay drawer.

---

## 4. Validation Checklist

Before outputting code for any new component, you MUST verify:

1. [ ] Is the primary font `font-sans` (Urbanist)?
2. [ ] Are hardcoded hex codes avoided in favor of semantic Tailwind variables (`bg-card`, `border-border`, `text-primary`)?
3. [ ] Are cards using exactly `bg-card border border-border rounded-2xl p-6 shadow-sm`?
4. [ ] Are transitions and hover states applied to all clickable elements?
5. [ ] Is the layout explicitly mobile-first, ensuring columns stack without horizontal scrolling?
6. [ ] Are amounts displayed in FCFA (e.g., `100 000 FCFA`)?
