# Design System — Expo Miami Real Estate
**Miami Luxury Real Estate Landing Page**

---

## 1. Filosofía de Diseño

**Concepto**: *Refined Coastal Luxury* — La sofisticación del lujo miami con la calidez del sol y el mar.  
**Tono**: Luxury/Refined · Minimal · Editorial  
**Paleta emocional**: Confianza, exclusividad, calidez mediterránea, modernidad arquitectónica.

---

## 2. Paleta de Colores

```css
:root {
  /* Primarios */
  --color-obsidian:    #0D0D0D;   /* Fondo hero, navbar dark */
  --color-ivory:       #F5F0E8;   /* Fondo secciones claras */
  --color-white:       #FFFFFF;   /* Tarjetas, texto sobre oscuro */

  /* Acento — Gold signature */
  --color-gold:        #C9A84C;   /* Logo, CTAs, highlights */
  --color-gold-light:  #E8C97A;   /* Hover states, bordes */
  --color-gold-dark:   #8B6914;   /* Texto sobre fondos claros */

  /* Neutros */
  --color-slate-100:   #F8F7F5;
  --color-slate-300:   #D4CFC6;
  --color-slate-500:   #8A8680;
  --color-slate-700:   #4A4540;
  --color-slate-900:   #1C1A18;

  /* Semánticos */
  --color-bg-primary:  var(--color-obsidian);
  --color-bg-light:    var(--color-ivory);
  --color-text-primary: var(--color-white);
  --color-text-dark:   var(--color-slate-900);
  --color-accent:      var(--color-gold);
}
```

---

## 3. Tipografía

### Fuentes

| Rol | Familia | Uso |
|-----|---------|-----|
| Display / Hero | `Cormorant Garamond` (Google Fonts) | H1, titulares grandes, citas |
| Heading | `Montserrat` (Google Fonts) | H2, H3, H4, navegación |
| Body | `Lato` (Google Fonts) | Párrafos, descripciones, listas |
| Monospace / Label | `DM Mono` (Google Fonts) | Tags, badges, precios secundarios |

```html
<!-- Importar en <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">
```

### Escala Tipográfica

```css
:root {
  /* Tamaños */
  --text-xs:    0.75rem;    /* 12px — labels, fine print */
  --text-sm:    0.875rem;   /* 14px — captions, tags */
  --text-base:  1rem;       /* 16px — body base */
  --text-lg:    1.125rem;   /* 18px — body large */
  --text-xl:    1.25rem;    /* 20px — lead text */
  --text-2xl:   1.5rem;     /* 24px — H4 */
  --text-3xl:   1.875rem;   /* 30px — H3 */
  --text-4xl:   2.25rem;    /* 36px — H2 */
  --text-5xl:   3rem;       /* 48px — H1 mobile */
  --text-6xl:   4rem;       /* 64px — H1 desktop */
  --text-7xl:   5.5rem;     /* 88px — Hero display */

  /* Familias */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-heading: 'Montserrat', sans-serif;
  --font-body:    'Lato', sans-serif;
  --font-mono:    'DM Mono', monospace;

  /* Pesos */
  --weight-light:   300;
  --weight-regular: 400;
  --weight-medium:  500;
  --weight-semibold:600;
  --weight-bold:    700;

  /* Line-heights */
  --leading-tight:  1.1;
  --leading-snug:   1.3;
  --leading-normal: 1.5;
  --leading-relaxed:1.7;

  /* Letter-spacing */
  --tracking-tight:  -0.03em;
  --tracking-normal:  0em;
  --tracking-wide:    0.08em;
  --tracking-widest:  0.2em;
}
```

---

## 4. Jerarquía Tipográfica — Estilos por Elemento

```css
/* ── DISPLAY ── Hero headline principal */
.h1-display {
  font-family: var(--font-display);
  font-size: clamp(var(--text-5xl), 8vw, var(--text-7xl));
  font-weight: var(--weight-light);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  font-style: italic;
  color: var(--color-white);
}

/* ── H1 ── Sección principal */
h1, .h1 {
  font-family: var(--font-display);
  font-size: clamp(var(--text-4xl), 5vw, var(--text-6xl));
  font-weight: var(--weight-light);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: inherit;
}

/* ── H2 ── Sección heading */
h2, .h2 {
  font-family: var(--font-heading);
  font-size: clamp(var(--text-3xl), 4vw, var(--text-4xl));
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  text-transform: uppercase;
}

/* ── H3 ── Subsección / Card title */
h3, .h3 {
  font-family: var(--font-heading);
  font-size: clamp(var(--text-xl), 2.5vw, var(--text-3xl));
  font-weight: var(--weight-medium);
  line-height: var(--leading-snug);
  letter-spacing: -0.01em;
}

/* ── H4 ── Eyebrow / Label section */
h4, .h4 {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-gold);
}

/* ── Eyebrow label ── Antes de H2 */
.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--weight-light);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-gold);
}

/* ── Lead / Párrafo destacado ── */
.lead {
  font-family: var(--font-body);
  font-size: var(--text-xl);
  font-weight: var(--weight-light);
  line-height: var(--leading-relaxed);
  color: var(--color-slate-300);
}

/* ── Body ── Texto corriente */
p, .body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  line-height: var(--leading-relaxed);
  color: var(--color-slate-700);
}

/* ── Caption / Fine print ── */
.caption {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-light);
  line-height: var(--leading-normal);
  letter-spacing: 0.02em;
  color: var(--color-slate-500);
}

/* ── Price tag ── */
.price {
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: var(--weight-light);
  letter-spacing: -0.02em;
  color: var(--color-gold);
}
```

---

## 5. Espaciado

```css
:root {
  --space-1:    0.25rem;   /* 4px */
  --space-2:    0.5rem;    /* 8px */
  --space-3:    0.75rem;   /* 12px */
  --space-4:    1rem;      /* 16px */
  --space-6:    1.5rem;    /* 24px */
  --space-8:    2rem;      /* 32px */
  --space-10:   2.5rem;    /* 40px */
  --space-12:   3rem;      /* 48px */
  --space-16:   4rem;      /* 64px */
  --space-20:   5rem;      /* 80px */
  --space-24:   6rem;      /* 96px */
  --space-32:   8rem;      /* 128px */

  /* Secciones */
  --section-padding-y:  clamp(var(--space-12), 8vw, var(--space-32));
  --section-padding-x:  clamp(var(--space-6), 5vw, var(--space-20));

  /* Container */
  --container-max:      1280px;
  --container-wide:     1440px;
}
```

---

## 6. Componentes UI

### Botones

```css
/* CTA Principal */
.btn-primary {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  padding: var(--space-4) var(--space-8);
  background: var(--color-gold);
  color: var(--color-obsidian);
  border: none;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}
.btn-primary:hover {
  background: var(--color-gold-light);
  transform: translateY(-2px);
}

/* CTA Secundario (outline) */
.btn-outline {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  padding: var(--space-4) var(--space-8);
  background: transparent;
  color: var(--color-white);
  border: 1px solid var(--color-gold);
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-outline:hover {
  background: var(--color-gold);
  color: var(--color-obsidian);
}

/* Ghost / Nav link */
.btn-ghost {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-white);
  background: none;
  border: none;
  padding: var(--space-2) var(--space-4);
  position: relative;
}
.btn-ghost::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 0; height: 1px;
  background: var(--color-gold);
  transition: width 0.3s ease;
}
.btn-ghost:hover::after { width: 100%; }
```

### Property Card

```css
.property-card {
  background: var(--color-white);
  overflow: hidden;
  position: relative;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}
.property-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 48px rgba(0,0,0,0.15);
}
.property-card__image {
  aspect-ratio: 4/3;
  overflow: hidden;
}
.property-card__image img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.property-card:hover .property-card__image img {
  transform: scale(1.06);
}
.property-card__body {
  padding: var(--space-6);
}
.property-card__tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: var(--space-2);
}
.property-card__title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--weight-light);
  color: var(--color-slate-900);
  margin-bottom: var(--space-2);
}
.property-card__location {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-slate-500);
  margin-bottom: var(--space-4);
}
.property-card__price {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  color: var(--color-gold-dark);
}
```

### Stat Badge (SIMA-style)

```css
.stat-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}
.stat-badge__number {
  font-family: var(--font-display);
  font-size: clamp(var(--text-3xl), 4vw, var(--text-5xl));
  font-weight: var(--weight-light);
  color: var(--color-gold);
  line-height: 1;
}
.stat-badge__label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-slate-300);
}
```

---

## 7. Estructura de Layout — Secciones Landing

```
┌─────────────────────────────────────────┐
│  NAVBAR                                 │
│  Logo · Nav links · CTA                 │
├─────────────────────────────────────────┤
│  HERO  (100vh, dark overlay)            │
│  eyebrow · H1 display · lead · CTA      │
│  Search bar (Buy / Rent / Sold)         │
├─────────────────────────────────────────┤
│  STATS BAR  (dark strip)                │
│  +21K · +8.5K · +5K · +35 · +200       │
├─────────────────────────────────────────┤
│  FEATURED LISTINGS  (ivory bg)          │
│  eyebrow · H2 · 3-col property grid     │
├─────────────────────────────────────────┤
│  NEWEST DEVELOPMENTS  (dark bg)         │
│  eyebrow · H2 · horizontal scroll cards │
├─────────────────────────────────────────┤
│  VALUE PROPOSITION  (gold accent strip) │
│  3 columnas: Expertise · Network · ROI  │
├─────────────────────────────────────────┤
│  SIMA MADRID EVENT BANNER               │
│  May 20-23 · Booth C3-11 · CTA         │
├─────────────────────────────────────────┤
│  TESTIMONIALS / STORIES                 │
│  eyebrow · H2 · 2-col quote cards       │
├─────────────────────────────────────────┤
│  CTA FINAL  (full-width dark + image)   │
│  H2 display · párrafo · 2 CTAs          │
├─────────────────────────────────────────┤
│  FOOTER                                 │
│  Logo · links · contacto · redes        │
└─────────────────────────────────────────┘
```

---

## 8. Efectos y Animaciones

```css
/* Fade up — entrada de secciones */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fadeUp {
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Gold shimmer — en líneas decorativas */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
.gold-line {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-gold) 50%,
    transparent 100%
  );
  background-size: 200% auto;
  animation: shimmer 3s linear infinite;
}

/* Overlay hero */
.hero-overlay {
  background: linear-gradient(
    to bottom,
    rgba(13,13,13,0.5) 0%,
    rgba(13,13,13,0.2) 50%,
    rgba(13,13,13,0.8) 100%
  );
}
```

---

## 9. Navbar

```css
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-8);
  background: rgba(13,13,13,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(201,168,76,0.15);
  transition: background 0.3s ease;
}
.navbar__logo {
  height: 40px;
}
.navbar__links {
  display: flex;
  gap: var(--space-6);
  list-style: none;
}
.navbar__cta {
  /* usa .btn-outline */
}
```

---

## 10. Search Bar

```css
.search-bar {
  display: flex;
  align-items: stretch;
  background: rgba(255,255,255,0.95);
  border-radius: 2px;
  overflow: hidden;
  max-width: 680px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.search-bar__tabs {
  display: flex;
  background: var(--color-obsidian);
}
.search-bar__tab {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: var(--space-3) var(--space-5);
  color: var(--color-slate-300);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}
.search-bar__tab.active {
  color: var(--color-gold);
  border-bottom: 2px solid var(--color-gold);
}
.search-bar__input {
  flex: 1;
  font-family: var(--font-body);
  font-size: var(--text-base);
  padding: var(--space-4) var(--space-6);
  border: none;
  outline: none;
  color: var(--color-slate-900);
}
.search-bar__cta {
  /* usa .btn-primary */
  border-radius: 0;
  white-space: nowrap;
}
```

---

## 11. Tokens de Sombras y Bordes

```css
:root {
  --shadow-sm:   0 2px 8px rgba(0,0,0,0.08);
  --shadow-md:   0 8px 24px rgba(0,0,0,0.12);
  --shadow-lg:   0 16px 48px rgba(0,0,0,0.18);
  --shadow-gold: 0 4px 24px rgba(201,168,76,0.25);

  --radius-none: 0;
  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-lg:   8px;
  --radius-full: 9999px;

  /* Para tarjetas de propiedades: sin border-radius (feel arquitectónico) */
  --card-radius: var(--radius-none);
}
```

---

## 12. Checklist de Implementación (Replit)

1. **Copiar variables CSS** de secciones 2, 3 y 11 en un archivo `styles/tokens.css`
2. **Importar fuentes** Google Fonts en `<head>` del `index.html`
3. **Estilos tipográficos** (sección 4) en `styles/typography.css`
4. **Componentes** (botones, cards, navbar, search bar) en `styles/components.css`
5. **Animaciones** (sección 8) en `styles/animations.css`
6. **Estructura HTML** siguiendo el layout de sección 7
7. Usar `eyebrow → H2 → lead → CTA` como patrón de cada sección
8. Mantener contraste: secciones alternas oscuro/marfil para ritmo visual

---

*Design System — Expo Miami Real Estate · Miami Luxury Real Estate*  
*Versión 1.0 · Abril 2026*
