import { useGetPublicSettings, useCreateLead } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ArrowRight, MapPin, Building, TrendingUp, Shield, Globe, Check, BarChart2, DollarSign, Scale } from "lucide-react";

const localAsset = (name: string) => `${import.meta.env.BASE_URL}images/${name}`;
const localImages = {
  hero: localAsset("miami-waterfront-hero.png"),
  city: localAsset("miami-biscayne-aerial.png"),
  team: localAsset("expo-miami-team.png"),
};

const leadSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().optional(),
  capitalRange: z.string().min(1, "Selecciona un rango de inversión"),
  investmentStage: z.string().min(1, "Selecciona tu etapa actual"),
});

function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, className: isVisible ? "animate-fadeUp" : "opacity-0" };
}

function FadeUp({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const fade = useFadeUp();
  return (
    <div ref={fade.ref} className={`${fade.className} ${className}`}>
      {children}
    </div>
  );
}

export default function Landing() {
  const { data: settings, isLoading } = useGetPublicSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (!settings) return;
    const g = settings.global || {};

    function setMeta(selector: string, attrKey: string, attrIdentKey: string, attrIdentVal: string, value: string | null | undefined) {
      const el = document.querySelector(selector);
      if (value) {
        if (el) {
          el.setAttribute(attrKey, value);
        } else {
          const meta = document.createElement("meta");
          meta.setAttribute(attrIdentKey, attrIdentVal);
          meta.setAttribute(attrKey, value);
          document.head.appendChild(meta);
        }
      } else {
        if (el) el.remove();
      }
    }

    function setMetaOrKeep(selector: string, attrKey: string, attrIdentKey: string, attrIdentVal: string, value: string | null | undefined) {
      if (value) {
        setMeta(selector, attrKey, attrIdentKey, attrIdentVal, value);
      }
    }

    function removeScript(id: string) {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    }

    function removeNoscript(id: string) {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    }

    function addScript(id: string, code: string) {
      removeScript(id);
      const s = document.createElement("script");
      s.id = id;
      s.textContent = code;
      document.head.appendChild(s);
    }

    function addScriptSrc(id: string, src: string) {
      removeScript(id);
      const s = document.createElement("script");
      s.id = id;
      s.src = src;
      s.async = true;
      document.head.appendChild(s);
    }

    if (g.og_title) document.title = g.og_title;
    setMetaOrKeep('meta[name="description"]', "content", "name", "description", g.og_description);
    setMetaOrKeep('meta[property="og:title"]', "content", "property", "og:title", g.og_title);
    setMetaOrKeep('meta[property="og:description"]', "content", "property", "og:description", g.og_description);
    setMetaOrKeep('meta[property="og:image"]', "content", "property", "og:image",
      g.og_image ? (g.og_image.startsWith("/") ? `${window.location.origin}${g.og_image}` : g.og_image) : undefined);
    setMeta('meta[name="google-site-verification"]', "content", "name", "google-site-verification", g.gsc_verification);
    setMetaOrKeep('meta[name="twitter:card"]', "content", "name", "twitter:card", g.og_title ? "summary_large_image" : undefined);
    setMetaOrKeep('meta[name="twitter:title"]', "content", "name", "twitter:title", g.og_title);
    setMetaOrKeep('meta[name="twitter:description"]', "content", "name", "twitter:description", g.og_description);
    setMetaOrKeep('meta[name="twitter:image"]', "content", "name", "twitter:image", g.og_image);

    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (g.canonical_url) {
      if (existingCanonical) {
        existingCanonical.setAttribute("href", g.canonical_url);
      } else {
        const link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        link.setAttribute("href", g.canonical_url);
        document.head.appendChild(link);
      }
    } else {
      if (existingCanonical) existingCanonical.remove();
    }

    if (g.ga4_id) {
      addScriptSrc("ga4-loader", `https://www.googletagmanager.com/gtag/js?id=${g.ga4_id}`);
      addScript("ga4-init", `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${g.ga4_id}');`);
    } else {
      removeScript("ga4-loader");
      removeScript("ga4-init");
    }

    if (g.gtm_id) {
      addScript("gtm-head", `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${g.gtm_id}');`);
      removeNoscript("gtm-noscript");
      const ns = document.createElement("noscript");
      ns.id = "gtm-noscript";
      const gtmIframe = document.createElement("iframe");
      gtmIframe.src = `https://www.googletagmanager.com/ns.html?id=${g.gtm_id}`;
      gtmIframe.height = "0";
      gtmIframe.width = "0";
      gtmIframe.style.display = "none";
      gtmIframe.style.visibility = "hidden";
      ns.appendChild(gtmIframe);
      if (document.body.firstChild) {
        document.body.insertBefore(ns, document.body.firstChild);
      } else {
        document.body.appendChild(ns);
      }
    } else {
      removeScript("gtm-head");
      removeNoscript("gtm-noscript");
    }

    if (g.meta_pixel_id) {
      addScript("meta-pixel", `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${g.meta_pixel_id}');fbq('track','PageView');`);
    } else {
      removeScript("meta-pixel");
    }
  }, [settings]);

  useEffect(() => {
    function removeScript(id: string) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }

    const agentJsonLd = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Expo Miami Real Estate",
      "description": "Agencia licenciada en Florida especializada en inversores de alto patrimonio desde España.",
      "url": "https://expo-miami.replit.app/",
      "image": "https://expo-miami.replit.app/opengraph.jpg",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Miami",
        "addressRegion": "FL",
        "addressCountry": "US"
      },
      "areaServed": {
        "@type": "City",
        "name": "Miami"
      },
      "priceRange": "$$$"
    };

    removeScript("jsonld-real-estate-agent");

    const agentScript = document.createElement("script");
    agentScript.id = "jsonld-real-estate-agent";
    agentScript.type = "application/ld+json";
    agentScript.textContent = JSON.stringify(agentJsonLd);
    document.head.appendChild(agentScript);

    return () => {
      removeScript("jsonld-real-estate-agent");
    };
  }, []);

  const configuredHeroImagePairs = [
    { desktop: (settings?.hero || {}).hero_image, mobile: (settings?.hero || {}).hero_image_mobile },
    { desktop: (settings?.hero || {}).hero_image_2, mobile: (settings?.hero || {}).hero_image_2_mobile },
    { desktop: (settings?.hero || {}).hero_image_3, mobile: (settings?.hero || {}).hero_image_3_mobile },
  ].filter(p => p.desktop) as { desktop: string; mobile?: string }[];
  const heroImagePairs = configuredHeroImagePairs.length > 0
    ? configuredHeroImagePairs
    : [{ desktop: localImages.hero }];

  useEffect(() => {
    if (heroImagePairs.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroImagePairs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImagePairs.length]);

  useEffect(() => {
    if (heroImagePairs.length > 0) {
      setHeroIndex((i) => (i >= heroImagePairs.length ? 0 : i));
    }
  }, [heroImagePairs.length]);

  if (isLoading) {
    return <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <Skeleton className="h-12 w-32" />
    </div>;
  }

  if (!settings) return null;

  const global = settings.global || {};
  const hero = settings.hero || {};
  const metrics = settings.metrics || {};
  const scenes = settings.scenes || {};
  const about = settings.about || {};
  const team = settings.team || {};
  const investmentBanner = settings.sima || {};

  const whatsappRaw = (global.whatsapp_number || "").replace(/\D/g, "");
  const whatsappLink = `https://wa.me/${whatsappRaw}`;
  const whatsappDisplay = whatsappRaw.length === 11 && whatsappRaw.startsWith("1")
    ? `+1 ${whatsappRaw.slice(1, 4)} ${whatsappRaw.slice(4, 7)} ${whatsappRaw.slice(7)}`
    : whatsappRaw ? `+${whatsappRaw}` : "";

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-white font-body">
      <header className="fixed top-0 w-full z-50 navbar-glass">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt={global.site_name || "Expo Miami"} className="h-10 w-auto" />

          <nav className="hidden md:flex items-center gap-2">
            <button onClick={() => scrollTo("miami")} className="nav-link">Miami</button>
            <button onClick={() => scrollTo("invertir")} className="nav-link">Invertir</button>
            <button onClick={() => scrollTo("agencia")} className="nav-link">La Agencia</button>
            <button onClick={() => scrollTo("equipo")} className="nav-link">Equipo</button>
            <button onClick={() => scrollTo("contacto")} className="nav-link">Contacto</button>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-ds-outline ml-4 inline-flex items-center">
              WhatsApp
            </a>
          </nav>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full p-6 flex flex-col gap-1 md:hidden navbar-glass">
            <button onClick={() => scrollTo("miami")} className="nav-link text-left py-3">Miami</button>
            <button onClick={() => scrollTo("invertir")} className="nav-link text-left py-3">Invertir</button>
            <button onClick={() => scrollTo("agencia")} className="nav-link text-left py-3">La Agencia</button>
            <button onClick={() => scrollTo("equipo")} className="nav-link text-left py-3">Equipo</button>
            <button onClick={() => scrollTo("contacto")} className="nav-link text-left py-3">Contacto</button>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-ds-primary mt-4 text-center">
              Contactar por WhatsApp
            </a>
          </div>
        )}
      </header>

      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImagePairs.map((pair, i) => (
            <picture
              key={pair.desktop}
              className="absolute inset-0 w-full h-full"
              style={{ opacity: i === heroIndex ? 1 : 0, transition: "opacity 1s" }}
            >
              {pair.mobile && (
                <source media="(max-width: 767px)" srcSet={pair.mobile} />
              )}
              <img
                src={pair.desktop}
                alt="Residencias frente al mar en Miami"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </picture>
          ))}
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10 pt-24 pb-16">
          <div className="max-w-3xl">
            <div className="eyebrow mb-8">
              Inversión Inmobiliaria de Lujo
            </div>
            <h1 className="h1-display mb-8">
              {hero.hero_title || "Invierte en Miami desde España."}
            </h1>
            <p className="lead-text lead-text-hero mb-10 max-w-xl">
              {hero.hero_subtitle || "Agencia licenciada en Florida especializada en inversores de alto patrimonio."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => scrollTo("contacto")} className="btn-ds-primary btn-ds-primary--mobile inline-flex items-center justify-center gap-2">
                Solicitar asesoría <ArrowRight className="h-4 w-4" />
              </button>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-ds-outline inline-flex items-center justify-center">
                {hero.hero_cta || "Conversemos por WhatsApp"}
              </a>
            </div>
          </div>
        </div>

        {heroImagePairs.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {heroImagePairs.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === heroIndex ? "bg-white scale-125" : "bg-white/40"}`}
                aria-label={`Imagen ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      <div className="gold-line" />

      <section className="section-dark border-y border-gold-subtle">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {[
              { value: metrics.metric_1_value, label: metrics.metric_1_label },
              { value: metrics.metric_2_value, label: metrics.metric_2_label },
              { value: metrics.metric_3_value, label: metrics.metric_3_label },
              { value: metrics.metric_4_value, label: metrics.metric_4_label },
            ].map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-center">
                <div className="stat-number">{m.value}</div>
                <div className="stat-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(global.banner_strip_image || localImages.city) && (
        <div className="w-full h-[40vh] min-h-[250px] max-h-[500px] overflow-hidden relative">
          <picture className="w-full h-full">
            {global.banner_strip_image_mobile && (
              <source media="(max-width: 767px)" srcSet={global.banner_strip_image_mobile} />
            )}
            <img
              src={global.banner_strip_image || localImages.city}
              alt="Miami Panorámica"
              className="w-full h-full object-cover object-center"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian/40" />
        </div>
      )}

      <div className="gold-line" />

      <section id="miami" className="section-ivory section-padding">
        <div className="max-w-[1280px] mx-auto">
          <FadeUp className="text-center mb-16 max-w-3xl mx-auto">
            <div className="eyebrow-dark mb-4">Oportunidades</div>
            <h2 className="heading-section text-ds-slate-900 text-3xl md:text-4xl mb-4">
              El Epicentro del Crecimiento Global
            </h2>
            <p className="font-body text-ds-slate-500 text-lg md:text-xl font-light leading-relaxed">
              Diversifica tu portafolio en las zonas más codiciadas y de mayor proyección en Estados Unidos.
            </p>
          </FadeUp>

          <FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SceneCard
                image={scenes.scene_1_image || localImages.city}
                title={scenes.scene_1_title || "Brickell"}
                desc={scenes.scene_1_subtitle || "Zona financiera"}
                position="62% center"
              />
              <SceneCard
                image={scenes.scene_2_image || localImages.city}
                title={scenes.scene_2_title || "South Beach"}
                desc={scenes.scene_2_subtitle || "Playa & vida nocturna"}
                position="14% center"
              />
              <SceneCard
                image={scenes.scene_3_image || localImages.city}
                title={scenes.scene_3_title || "Edgewater & Wynwood"}
                desc={scenes.scene_3_subtitle || "Arte & gastronomía"}
                position="75% center"
              />
              <SceneCard
                image={scenes.scene_4_image || localImages.city}
                title={scenes.scene_4_title || "Coral Gables"}
                desc={scenes.scene_4_subtitle || "Residencial premium"}
                position="42% bottom"
              />
            </div>
          </FadeUp>
        </div>
      </section>

      <div className="gold-line" />

      <section id="invertir" className="section-dark section-padding">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-start">
            <FadeUp className="w-full md:w-1/2">
              <div className="eyebrow mb-4">¿Por qué Miami?</div>
              <h2 className="heading-section text-white text-3xl md:text-4xl mb-6">
                Cinco razones para invertir en 2026
              </h2>
              <p className="lead-text mb-10">
                Más que un destino turístico, Miami es hoy una potencia financiera y tecnológica. El refugio perfecto para el capital europeo.
              </p>

              <div className="space-y-8">
                {[
                  { icon: Shield, num: "01", title: "Sin impuesto estatal", desc: "Florida aplica 0% sobre la renta estatal." },
                  { icon: TrendingUp, num: "02", title: "Rentabilidad del 6 al 10%", desc: "Rendimiento bruto anual muy por encima de mercados europeos." },
                  { icon: BarChart2, num: "03", title: "Mercado en crecimiento", desc: "+35% de apreciación en los últimos 5 años." },
                  { icon: DollarSign, num: "04", title: "Activos en dólares", desc: "Diversificación fuera del euro, en moneda fuerte." },
                  { icon: Scale, num: "05", title: "Seguridad jurídica", desc: "Títulos de propiedad limpios e inatacables." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center border border-gold/30 text-gold transition-all duration-300 group-hover:bg-gold group-hover:text-obsidian rounded-lg">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="font-mono text-xs tracking-widest uppercase text-gold/60 mb-1">{item.num}</div>
                      <h3 className="font-heading text-xl font-medium text-white mb-1">{item.title}</h3>
                      <p className="font-body text-ds-slate-300 font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp className="w-full md:w-1/2">
              <div className="aspect-[4/3] md:aspect-[4/5] overflow-hidden relative rounded-2xl">
                <img src={about.about_image || localImages.city} alt="Estilo de vida junto a la bahía de Miami" className="w-full h-full object-cover" />
                <div className="absolute inset-0 gradient-bottom-overlay" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="font-display text-3xl font-light italic text-white mb-2">Construye tu legado.</div>
                  <p className="font-body text-ds-slate-300 font-light">Inversiones diseñadas para trascender generaciones.</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <div className="gold-line" />

      <section id="agencia" className="section-ivory section-padding">
        <div className="max-w-[1280px] mx-auto">
          <FadeUp className="text-center max-w-4xl mx-auto">
            <div className="eyebrow-dark mb-4">La Agencia</div>
            <h2 className="heading-section text-ds-slate-900 text-3xl md:text-4xl mb-6">
              {about.about_headline || "Una agencia con presencia real en Miami"}
            </h2>
            <p className="font-body text-ds-slate-700 text-lg md:text-xl font-light leading-relaxed mb-12 max-w-3xl mx-auto">
              {about.about_text || "No un intermediario. Agencia licenciada en Florida, especializada en inversores de alto patrimonio."}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                "Oficina en Miami",
                "+5 años de mercado",
                "Preventas & off-market",
                "Gestión remota 100%",
                "Red legal en Florida",
              ].map((cred, i) => (
                <div key={i} className="inline-flex items-center gap-2 px-4 py-2 border border-gold-dark/30 font-mono text-xs tracking-widest uppercase text-gold-dark rounded-full">
                  <Check className="h-3 w-3" />
                  {cred}
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl agency-photo">
              <img src={about.agency_image || localImages.team} alt="Equipo de Expo Miami Real Estate" className="w-full h-auto" />
            </div>
          </FadeUp>
        </div>
      </section>

      <div className="gold-line" />

      <section id="equipo" className="section-dark section-padding">
        <div className="max-w-[1280px] mx-auto">
          <FadeUp className="text-center mb-16 max-w-3xl mx-auto">
            <div className="eyebrow mb-4">Nuestro Equipo</div>
            <h2 className="heading-section text-white text-3xl md:text-4xl mb-4">
              Las profesionales detrás de tu inversión
            </h2>
            <p className="lead-text">
              Un equipo con experiencia directa en el mercado inmobiliario de Miami, dedicado a proteger y hacer crecer tu patrimonio.
            </p>
          </FadeUp>

          <FadeUp>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { name: team.team_1_name || "Miriam Daniel", role: team.team_1_role || "Directora", image: team.team_1_image || localImages.team, position: "10% center" },
                { name: team.team_2_name || "Sara Pineda", role: team.team_2_role || "Directora", image: team.team_2_image || localImages.team, position: "52% center" },
                { name: team.team_3_name || "Estella Beniflah", role: team.team_3_role || "Directora", image: team.team_3_image || localImages.team, position: "90% center" },
              ].map((member, i) => (
                <TeamCard key={i} name={member.name} role={member.role} image={member.image} position={member.position} />
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <div className="gold-line" />

      <section className="relative overflow-hidden sima-bg section-padding">
          <div className="absolute inset-0 z-0">
            <picture className="w-full h-full">
              {investmentBanner.sima_bg_image_mobile && (
                <source media="(max-width: 767px)" srcSet={investmentBanner.sima_bg_image_mobile} />
              )}
              <img src={investmentBanner.sima_bg_image || localImages.city} alt="Vista aérea de Miami" className="w-full h-full object-cover object-center" />
            </picture>
            <div className="absolute inset-0 bg-[#C9A84C]/80" />
          </div>
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-[1280px] mx-auto relative z-10">
            <FadeUp className="text-center">
              <div className="font-mono text-xs tracking-widest uppercase mb-6 sima-text-muted">
                Expo Miami Real Estate
              </div>
              <h2 className="font-display text-4xl md:text-6xl font-light italic mb-6 text-obsidian">
                Invierte en Miami con un equipo local.
              </h2>
              <p className="font-body text-lg md:text-xl mb-4 max-w-2xl mx-auto sima-text-body">
                Asesoría personalizada para encontrar oportunidades alineadas con tus objetivos.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                <div className="font-mono text-sm sima-text-muted">Oficina en Miami</div>
                <div className="hidden sm:block w-px h-4 sima-divider" />
                <div className="font-mono text-sm sima-text-muted">+5 años de experiencia</div>
                <div className="hidden sm:block w-px h-4 sima-divider" />
                <div className="font-mono text-sm sima-text-muted">Gestión remota 100%</div>
              </div>
              <button onClick={() => scrollTo("contacto")} className="inline-flex items-center justify-center gap-2 font-heading text-sm font-semibold tracking-widest uppercase px-8 py-4 bg-obsidian text-white border-none cursor-pointer transition-all duration-300 hover:bg-ds-slate-900 rounded-lg">
                Solicitar una asesoría <ArrowRight className="h-4 w-4" />
              </button>
            </FadeUp>
          </div>
        </section>

      <div className="gold-line" />

      <section id="contacto" className="section-dark section-padding">
        <div className="max-w-[1080px] mx-auto">
          <FadeUp>
            <div className="border border-gold/20 relative overflow-hidden rounded-2xl flex flex-col md:flex-row">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent z-20" />

              <div className="w-full md:w-[45%] flex flex-col">
                <div className="relative w-full aspect-[4/3] md:aspect-auto md:flex-1 md:min-h-[640px] overflow-hidden">
                  <img
                    src={localImages.city}
                    alt="Miami, Florida"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />
                  <div className="absolute inset-0 md:bg-gradient-to-r md:from-transparent md:to-obsidian/40" />

                  <div className="absolute top-5 left-5 md:top-7 md:left-7">
                    <div className="font-mono text-[10px] md:text-xs tracking-widest uppercase text-gold/90 border border-gold/40 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                      Expo Miami Real Estate
                    </div>
                  </div>

                  <div className="hidden md:block absolute bottom-0 left-0 right-0 p-7">
                    <div className="font-display text-2xl font-light italic text-white mb-5 leading-tight">
                      Tu inversión, acompañada desde Miami
                    </div>
                    <div className="flex items-center gap-4 text-white/90">
                      <div>
                        <div className="font-mono text-lg text-gold font-medium leading-none">+5</div>
                        <div className="font-mono text-[10px] tracking-widest uppercase text-white/70 mt-1">años en Miami</div>
                      </div>
                      <div className="w-px h-8 bg-gold/30" />
                      <div>
                        <div className="font-mono text-lg text-gold font-medium leading-none">100%</div>
                        <div className="font-mono text-[10px] tracking-widest uppercase text-white/70 mt-1">gestión remota</div>
                      </div>
                      <div className="w-px h-8 bg-gold/30" />
                      <div>
                        <div className="font-mono text-lg text-gold font-medium leading-none">0%</div>
                        <div className="font-mono text-[10px] tracking-widest uppercase text-white/70 mt-1">impuesto estatal</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:hidden border-t border-gold/15 bg-black/30 px-5 py-4">
                  <div className="flex items-center justify-between text-white/90">
                    <div className="text-center flex-1">
                      <div className="font-mono text-base text-gold font-medium leading-none">+5</div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-white/70 mt-1.5">años en Miami</div>
                    </div>
                    <div className="w-px h-8 bg-gold/25" />
                    <div className="text-center flex-1">
                      <div className="font-mono text-base text-gold font-medium leading-none">100%</div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-white/70 mt-1.5">gestión remota</div>
                    </div>
                    <div className="w-px h-8 bg-gold/25" />
                    <div className="text-center flex-1">
                      <div className="font-mono text-base text-gold font-medium leading-none">0%</div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-white/70 mt-1.5">impuesto estatal</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col justify-center">
                <div className="text-center mb-8 md:mb-10">
                  <div className="eyebrow mb-4">Contacto</div>
                  <h2 className="font-display text-3xl md:text-4xl font-light italic text-white mb-4 leading-tight">
                    Hablemos de tu inversión en Miami
                  </h2>
                  <p className="font-body text-ds-slate-300 font-light">
                    Sin coste ni compromiso. Te contactaremos en menos de 24 horas.
                  </p>
                </div>

                <LeadForm />
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <div className="gold-line" />

      <footer className="section-dark section-padding-sm border-t border-gold-subtle">
        <div className="max-w-[1280px] mx-auto text-center">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt={global.site_name || "Expo Miami Real Estate"} className="h-12 w-auto mx-auto mb-4" />
          <p className="font-body text-ds-slate-500 mb-4 max-w-md mx-auto text-sm font-light">
            Agencia licenciada en Florida · Especialistas en inversores de alto patrimonio
          </p>
          {whatsappDisplay && (
            <a href={`tel:+${whatsappRaw}`} className="font-body text-ds-slate-500 hover:text-gold transition-colors text-sm font-light block mb-8">
              {whatsappDisplay}
            </a>
          )}
          <div className="gold-line mb-8 max-w-xs mx-auto" />
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-mono tracking-wider uppercase mb-8">
            <a href="#" className="text-ds-slate-500 hover:text-gold transition-colors text-xs">Instagram</a>
            <a href="#" className="text-ds-slate-500 hover:text-gold transition-colors text-xs">LinkedIn</a>
            <a href="#" className="text-ds-slate-500 hover:text-gold transition-colors text-xs">Aviso Legal</a>
            <a href="#" className="text-ds-slate-500 hover:text-gold transition-colors text-xs">Privacidad</a>
          </div>
          <div className="font-body text-xs text-ds-slate-500/50 font-light">
            &copy; {new Date().getFullYear()} Expo Miami Real Estate. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

function SceneCard({ image, title, desc, position = "center" }: { image?: string | null; title: string; desc: string; position?: string }) {
  return (
    <div className="group relative aspect-[4/3] overflow-hidden cursor-pointer transition-all duration-400 rounded-xl">
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          style={{ objectPosition: position }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#4A4540] to-[#1C1A18] transition-transform duration-700 group-hover:scale-[1.06]" />
      )}
      <div className="absolute inset-0 gradient-card-overlay" />
      <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
        <div className="font-mono text-xs tracking-widest uppercase text-gold/70 mb-2">Zona</div>
        <h3 className="font-display text-2xl md:text-3xl font-light text-white mb-1">{title}</h3>
        <p className="font-body text-ds-slate-300 font-light text-sm md:opacity-0 md:group-hover:opacity-100 md:transition-all md:duration-500 md:translate-y-2 md:group-hover:translate-y-0">
          {desc}
        </p>
      </div>
    </div>
  );
}

function TeamCard({ name, role, image, position = "center" }: { name: string; role: string; image?: string | null; position?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gold/10 transition-all duration-500 hover:border-gold/30">
      <div className="aspect-[3/4] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: position }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1C1A18] to-[#2a2520] flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border border-gold/20 flex items-center justify-center">
              <span className="font-display text-3xl text-gold/40 italic">
                {name.split(" ").map(n => n[0]).join("")}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="p-6 text-center bg-obsidian">
        <h3 className="font-display text-xl font-light italic text-white mb-1">{name}</h3>
        <p className="font-mono text-xs tracking-widest uppercase text-gold/70">{role}</p>
      </div>
    </div>
  );
}

function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const createLead = useCreateLead();

  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      capitalRange: "",
      investmentStage: "",
    },
  });

  function onSubmit(values: z.infer<typeof leadSchema>) {
    createLead.mutate({ data: values }, {
      onSuccess: () => {
        setSubmittedEmail(values.email);
        setSubmitted(true);
      },
    });
  }

  if (submitted) {
    return (
      <div className="text-center py-12 animate-fadeUp">
        <div className="w-16 h-16 border border-gold/30 flex items-center justify-center mx-auto mb-6 rounded-full">
          <Check className="h-8 w-8 text-gold" />
        </div>
        <h3 className="font-display text-3xl font-light italic text-white mb-4">¡Gracias por contactarnos!</h3>
        <p className="font-body text-ds-slate-300 text-lg font-light mb-6">
          Hemos recibido tu solicitud. Un asesor senior se pondrá en contacto contigo a la brevedad.
        </p>
        <div className="max-w-md mx-auto space-y-3 text-left border border-gold/20 rounded-sm px-5 py-4 bg-white/5">
          <p className="font-body text-sm text-ds-slate-400 font-light">
            Hemos enviado un correo de confirmación a{" "}
            <span className="text-gold font-normal">{submittedEmail}</span>.
          </p>
          <p className="font-body text-sm text-ds-slate-400 font-light">
            Si no lo encuentras en tu bandeja de entrada, revisa también la carpeta de <span className="text-ds-slate-300">correo no deseado</span> o <span className="text-ds-slate-300">spam</span>.
          </p>
          <p className="font-body text-sm text-ds-slate-400 font-light">
            Para asegurarte de recibir todas nuestras comunicaciones, añade{" "}
            <span className="text-gold font-normal">contacto@expomiamirealestate.com</span>{" "}
            a tu lista de contactos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-heading text-xs tracking-wider uppercase text-ds-slate-300">Nombre y Apellidos</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Carlos Mendoza" {...field} className="h-12 bg-white/5 border-gold/20 text-white placeholder:text-ds-slate-500 focus:border-gold rounded-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-heading text-xs tracking-wider uppercase text-ds-slate-300">Email</FormLabel>
                <FormControl>
                  <Input placeholder="carlos@ejemplo.com" {...field} className="h-12 bg-white/5 border-gold/20 text-white placeholder:text-ds-slate-500 focus:border-gold rounded-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-heading text-xs tracking-wider uppercase text-ds-slate-300">Teléfono (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="+34 600 000 000" {...field} className="h-12 bg-white/5 border-gold/20 text-white placeholder:text-ds-slate-500 focus:border-gold rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capitalRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-heading text-xs tracking-wider uppercase text-ds-slate-300">Capital Disponible</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 bg-white/5 border-gold/20 text-white rounded-lg">
                    <SelectValue placeholder="Selecciona un rango" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="$1M-$2M">$1M - $2M</SelectItem>
                  <SelectItem value="$2M-$5M">$2M - $5M</SelectItem>
                  <SelectItem value="Mas de $5M">Más de $5M</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="investmentStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-heading text-xs tracking-wider uppercase text-ds-slate-300">Momento de Inversión</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 bg-white/5 border-gold/20 text-white rounded-lg">
                    <SelectValue placeholder="¿Cuál es tu situación actual?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Explorando opciones">Explorando opciones</SelectItem>
                  <SelectItem value="Listo para invertir en 2026">Listo para invertir en 2026</SelectItem>
                  <SelectItem value="Ya tengo activos en EE.UU.">Ya tengo activos en EE.UU.</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <button type="submit" className="btn-ds-primary w-full flex items-center justify-center gap-2" disabled={createLead.isPending}>
          {createLead.isPending ? "Enviando..." : "Solicitar una conversación"}
        </button>

        <p className="font-body text-xs text-ds-slate-500 text-center font-light mt-4">
          Tus datos no serán compartidos con terceros. Puedes darte de baja en cualquier momento.
        </p>
      </form>
    </Form>
  );
}
