# Kavach360 / Cyber Awareness SaaS — Design Notes

## What has been designed

A premium single-page web prototype has been created in `index.html`.

It includes:

- Cyber SaaS landing page
- Dark premium cybersecurity theme
- 3D-style rotating mobile hero
- Scroll-based dismantle/transform device concept
- Platform feature cards
- Portal preview with interactive tabs
- Central Control Portal mockup
- Customer Admin Portal mockup
- Learner Portal mockup
- Customer Content Upload mockup
- SMTP Settings mockup
- Unique feature section
- Customer content workflow
- Licence model section
- CTA and footer

## GUI direction

The design uses:

- Dark cyber background
- Cyan/violet gradients
- Glassmorphism cards
- Subtle neon lines
- Smooth reveal animations
- Mouse-follow glow
- Scroll-triggered visual storytelling
- Clean enterprise dashboard layout

## Key sections

1. Hero Section
   - Product positioning
   - 30-day free trial
   - Customer content control
   - Safe simulations
   - 3D mobile visual

2. Platform Modules
   - Awareness Academy
   - Phishing Simulation
   - Customer CMS
   - SMTP + Email
   - Mobile + App Safety
   - IoT + AI Risks

3. 3D Scroll Story
   - Mobile device dismantles
   - Reveals mobile risks
   - Transforms into email inbox
   - Transforms into dashboard
   - Transforms into IoT device and cyber shield idea

4. SaaS Portal Design
   - Central Control Portal
   - Customer Admin Portal
   - Learner Portal
   - Content Upload
   - SMTP Settings

5. Unique Features
   - Scam Radar
   - Red Flag Lens
   - AI Scam Explainer
   - DPDPA Breach Timer
   - Cyber Fitness Score
   - Department Heatmap

6. Licence Model
   - Free Trial
   - Basic
   - Professional
   - Enterprise

## Suggested next design step

Create separate clickable pages for:

1. Public landing page
2. Login page
3. Central Control Portal dashboard
4. Customer Admin dashboard
5. User learning dashboard
6. Content upload/editor
7. SMTP settings
8. Phishing campaign builder
9. Certificate page
10. Contributor wall

## Suggested development stack

Frontend:

- Next.js / React
- Tailwind CSS
- Shadcn UI
- Framer Motion
- GSAP ScrollTrigger
- React Three Fiber / Three.js

Backend:

- Node.js/NestJS or Laravel
- PostgreSQL
- Redis queue
- S3-compatible file storage
- SMTP/email service
- Multi-tenant RBAC

## Important note

The current prototype is a static HTML/CSS/JS concept. It is intentionally dependency-free so it can be previewed quickly. In production, the 3D scroll animation should be implemented using Three.js, React Three Fiber, GSAP ScrollTrigger, or Spline exported 3D models.

## GUI enhancement update

The hero animation has been changed from a mobile-first visual to a phishing-themed animated bot:

- Animated Phish Bot character
- Moving phishing hook
- Floating email baits
- Scanning line on the bot face
- Orbit animation
- Glassmorphic labels
- Stronger cybersecurity theme

Button hover effects were enhanced with:

- Animated shine sweep
- Glow reaction
- Scale/raise interaction
- Glassy ghost button hover

Cards were enhanced with:

- Glassmorphism blur
- Gradient edge highlight
- Better hover lift
- Neon border response

This is still static HTML/CSS/JS. In production, the Phish Bot can be converted into SVG/Lottie/Spline/Three.js for a more advanced animation pipeline.

## Three.js background update

The provided CodePen-style effect has been adapted into the website as a fixed Three.js background layer.

What was added:

- Three.js import map using CDN
- Fixed `#threeNeuralBg` background container
- Procedural neural/phishing impulse network
- Glowing central cyber core
- Branch/tube network inspired by neural dendrites
- Bloom post-processing
- Moving gold/cyan/magenta impulse packets
- Ambient dust particles
- Pointer-reactive rotation
- Click-triggered bloom pulse
- Reduced-motion fallback

Important adaptation:

The original CodePen was a full-screen standalone scene with HUD panels and `overflow:hidden`. For this website, it has been converted into a background effect so the landing page, cards, portal previews and scrolling content remain usable.

## Draggable card + trail update

Added the GSAP-style draggable rotation interaction requested by the user:

- New “Draggable awareness card” section
- Horizontal drag rotates the card on Y axis
- Front side shows phishing risk
- Back side shows safe reporting behaviour
- Responsive sensitivity
- Reset button
- Bounded rotation
- Uses GSAP + Draggable CDN, with fallback pointer drag logic

UI enhancements:

- Removed old cursor glow visual
- Added temporary cursor trail dots that fade after around 1 second
- Buttons now shift colours on hover
- Buttons have animated rotating conic border line
- Div/card surfaces glow more strongly on hover

## Responsiveness, support and theme update

Added:

- Shorter boot duration
- Smaller/lighter cursor trail
- Mobile-specific performance rules
- Support Center / FAQ section
- Book a Demo form
- Social media links placeholders
- Premium theme toggle with alternate luxury colour palette
- Theme preference stored in localStorage
- Stronger cross-device responsive adjustments

The design now supports two visual modes:

1. Cyber Theme: cyan/violet dark SaaS
2. Premium Theme: gold/magenta luxury cyber palette
