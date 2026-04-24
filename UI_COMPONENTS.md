# UI/UX Components Documentation

This file contains all UI/UX components available in the project.

## Components List

### 1. Navigation Component
**File:** `app/components/Navigation.tsx`

**Description:** 
A responsive navigation bar component with mobile menu support, scroll detection, and smooth scrolling functionality.

**Features:**
- Fixed positioning with backdrop blur on scroll
- Responsive design (desktop and mobile views)
- Mobile hamburger menu with smooth transitions
- Smooth scroll to anchor links
- Active scroll state detection
- Accessible with ARIA labels

**Props:** None (uses internal state)

**Key UI Elements:**
- Logo/Brand link
- Desktop navigation menu (horizontal)
- Mobile menu toggle button
- Mobile navigation menu (vertical, collapsible)

**Navigation Items:**
- Início (Home)
- Sobre (About)
- Empresas (Companies)
- DockPlus AI
- Skills
- Fé & Propósito (Faith & Purpose)
- Contato (Contact)

**States:**
- `isOpen`: Controls mobile menu visibility
- `scrolled`: Tracks scroll position for styling changes

---

### 2. Hero Component
**File:** `app/components/Hero.tsx`

**Description:** 
A hero section component with animated content, profile image, call-to-action buttons, and scroll indicator.

**Features:**
- Intersection Observer for fade-in animations
- Staggered animation delays for visual hierarchy
- Responsive grid layout
- Profile image with animated border
- Background pattern overlay
- Call-to-action buttons with smooth scroll
- Scroll indicator with bounce animation

**Props:** None (uses internal refs and effects)

**Key UI Elements:**
- Greeting text ("Olá, eu sou")
- Main heading (Name: "Thiago Do Carmo")
- Subtitle (Age and location)
- Description paragraph
- Tag badges (3 tags: "21 anos nos EUA", "6 Empresas", "DockPlus AI Solutions")
- Primary CTA button ("Conheça meu ecossistema")
- Secondary CTA button ("Vamos conversar")
- Profile image with decorative border
- Scroll down indicator button

**Animation Classes:**
- `fade-in-up`: Fade in and slide up animation
- Animation delays: 0.1s, 0.2s, 0.3s, 0.4s, 0.5s, 0.6s (staggered)

**Interactive Elements:**
- CTA buttons with onClick handlers for smooth scrolling
- Scroll indicator button for navigation to next section

---

## Component Usage Summary

### Total Components: 2

1. **Navigation** - Header navigation component
2. **Hero** - Landing page hero section

### Common Design Patterns

**Styling:**
- Uses Tailwind CSS utility classes
- Custom color tokens (accent, foreground, background, muted, border)
- Responsive breakpoints (sm, md, lg)
- Dark mode support (via CSS variables)

**Accessibility:**
- ARIA labels on interactive elements
- Semantic HTML elements
- Keyboard navigation support
- Focus visible states

**Interactions:**
- Smooth scroll behavior
- Hover states on interactive elements
- Transition animations
- Intersection Observer for scroll-triggered animations

**Responsive Design:**
- Mobile-first approach
- Breakpoint-based layouts
- Flexible grid systems
- Responsive typography scaling

---

## Component Dependencies

**Navigation Component:**
- React hooks: `useState`, `useEffect`
- Next.js: `usePathname` from `next/navigation`

**Hero Component:**
- React hooks: `useEffect`, `useRef`
- Next.js: `Image` component from `next/image`

---

## File Structure

```
app/
  components/
    ├── Navigation.tsx    (Navigation component)
    └── Hero.tsx          (Hero component)
```

---

*Last updated: Based on current codebase structure*

