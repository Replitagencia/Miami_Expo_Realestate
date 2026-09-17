import bcrypt from "bcrypt";
import { db, adminUsersTable, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const defaultSettings = [
  { key: "site_name", value: "Expo Miami Real Estate", type: "text", label: "Nombre del sitio", section: "global", hint: null },
  { key: "tagline", value: "Miami. Donde el capital español encuentra su mejor destino.", type: "text", label: "Tagline", section: "global", hint: null },
  { key: "whatsapp_number", value: "17867881877", type: "text", label: "Número de WhatsApp", section: "global", hint: "Formato internacional sin + ni espacios" },
  { key: "logo", value: null, type: "image", label: "Logo principal", section: "global", hint: "200x60px · PNG transparente · máx 200KB" },

  { key: "hero_title", value: "Invierte en Miami desde España.", type: "text", label: "Título principal", section: "hero", hint: null },
  { key: "hero_subtitle", value: "Agencia licenciada en Florida especializada en inversores de alto patrimonio.", type: "text", label: "Subtítulo", section: "hero", hint: null },
  { key: "hero_cta", value: "Conversemos por WhatsApp", type: "text", label: "Texto del botón CTA", section: "hero", hint: null },
  { key: "hero_image", value: null, type: "image", label: "Imagen 1 del carrusel", section: "hero", hint: "1920x1080px · JPG · máx 2MB" },
  { key: "hero_image_mobile", value: null, type: "image", label: "Imagen 1 del carrusel — versión móvil", section: "hero", hint: "828x1400px · JPG · máx 2MB" },
  { key: "hero_image_2", value: null, type: "image", label: "Imagen 2 del carrusel", section: "hero", hint: "1920x1080px · JPG · máx 2MB" },
  { key: "hero_image_2_mobile", value: null, type: "image", label: "Imagen 2 del carrusel — versión móvil", section: "hero", hint: "828x1400px · JPG · máx 2MB" },
  { key: "hero_image_3", value: null, type: "image", label: "Imagen 3 del carrusel", section: "hero", hint: "1920x1080px · JPG · máx 2MB" },
  { key: "hero_image_3_mobile", value: null, type: "image", label: "Imagen 3 del carrusel — versión móvil", section: "hero", hint: "828x1400px · JPG · máx 2MB" },

  { key: "metric_1_value", value: "+5", type: "text", label: "Años en Miami - Valor", section: "metrics", hint: null },
  { key: "metric_1_label", value: "Años en Miami", type: "text", label: "Años en Miami - Etiqueta", section: "metrics", hint: null },
  { key: "metric_2_value", value: "$1M", type: "text", label: "Inversión mínima - Valor", section: "metrics", hint: null },
  { key: "metric_2_label", value: "Inversión mínima", type: "text", label: "Inversión mínima - Etiqueta", section: "metrics", hint: null },
  { key: "metric_3_value", value: "10%", type: "text", label: "Rentabilidad - Valor", section: "metrics", hint: null },
  { key: "metric_3_label", value: "Rentabilidad bruta anual", type: "text", label: "Rentabilidad - Etiqueta", section: "metrics", hint: null },
  { key: "metric_4_value", value: "0%", type: "text", label: "Impuesto - Valor", section: "metrics", hint: null },
  { key: "metric_4_label", value: "Impuesto estatal Florida", type: "text", label: "Impuesto - Etiqueta", section: "metrics", hint: null },

  { key: "scene_1_title", value: "Brickell", type: "text", label: "Escena 1 - Título", section: "scenes", hint: null },
  { key: "scene_1_subtitle", value: "Zona financiera", type: "text", label: "Escena 1 - Subtítulo", section: "scenes", hint: null },
  { key: "scene_1_image", value: null, type: "image", label: "Escena 1 — Brickell", section: "scenes", hint: "800x500px · JPG · máx 1MB" },
  { key: "scene_2_title", value: "South Beach", type: "text", label: "Escena 2 - Título", section: "scenes", hint: null },
  { key: "scene_2_subtitle", value: "Playa & vida nocturna", type: "text", label: "Escena 2 - Subtítulo", section: "scenes", hint: null },
  { key: "scene_2_image", value: null, type: "image", label: "Escena 2 — South Beach", section: "scenes", hint: "800x500px · JPG · máx 1MB" },
  { key: "scene_3_title", value: "Edgewater & Wynwood", type: "text", label: "Escena 3 - Título", section: "scenes", hint: null },
  { key: "scene_3_subtitle", value: "Arte & gastronomía", type: "text", label: "Escena 3 - Subtítulo", section: "scenes", hint: null },
  { key: "scene_3_image", value: null, type: "image", label: "Escena 3 — Edgewater/Wynwood", section: "scenes", hint: "800x500px · JPG · máx 1MB" },
  { key: "scene_4_title", value: "Coral Gables", type: "text", label: "Escena 4 - Título", section: "scenes", hint: null },
  { key: "scene_4_subtitle", value: "Residencial premium", type: "text", label: "Escena 4 - Subtítulo", section: "scenes", hint: null },
  { key: "scene_4_image", value: null, type: "image", label: "Escena 4 — Coral Gables", section: "scenes", hint: "800x500px · JPG · máx 1MB" },

  { key: "about_headline", value: "Una agencia con presencia real en Miami. No un intermediario.", type: "text", label: "Frase destacada", section: "about", hint: null },
  { key: "about_text", value: "Expo Miami Real Estate es una agencia licenciada en Florida con oficina en Miami. Desde hace más de 5 años, ayudamos a inversores españoles a adquirir propiedades de alto rendimiento en las mejores zonas de Miami. Ofrecemos acceso a preventas exclusivas, propiedades off-market y gestión remota completa.", type: "text", label: "Texto de la agencia", section: "about", hint: null },
  { key: "about_image", value: null, type: "image", label: "Foto lifestyle (sección Invertir)", section: "about", hint: "800x1000px · JPG · máx 1MB · Preferiblemente vertical" },
  { key: "agency_image", value: null, type: "image", label: "Foto de agencia (sección La Agencia)", section: "about", hint: "1600x700px · JPG · máx 1MB · Panorámica" },

  { key: "team_1_name", value: "Miriam Daniel", type: "text", label: "Miembro 1 - Nombre", section: "team", hint: null },
  { key: "team_1_role", value: "Directora", type: "text", label: "Miembro 1 - Cargo", section: "team", hint: null },
  { key: "team_1_image", value: null, type: "image", label: "Foto — Miriam Daniel", section: "team", hint: "600x800px · JPG · máx 1MB" },
  { key: "team_2_name", value: "Sara Pineda", type: "text", label: "Miembro 2 - Nombre", section: "team", hint: null },
  { key: "team_2_role", value: "Directora", type: "text", label: "Miembro 2 - Cargo", section: "team", hint: null },
  { key: "team_2_image", value: null, type: "image", label: "Foto — Sara Pineda", section: "team", hint: "600x800px · JPG · máx 1MB" },
  { key: "team_3_name", value: "Estella Beniflah", type: "text", label: "Miembro 3 - Nombre", section: "team", hint: null },
  { key: "team_3_role", value: "Directora", type: "text", label: "Miembro 3 - Cargo", section: "team", hint: null },
  { key: "team_3_image", value: null, type: "image", label: "Foto — Estella Beniflah", section: "team", hint: "600x800px · JPG · máx 1MB" },

  { key: "sima_bg_image", value: null, type: "image", label: "Fondo banner de asesoría", section: "sima", hint: "Desktop 1920×700 · JPG · máx 2MB" },
  { key: "sima_bg_image_mobile", value: null, type: "image", label: "Fondo banner de asesoría — versión móvil", section: "sima", hint: "828×500px · JPG · máx 2MB" },

  { key: "banner_strip_image", value: null, type: "image", label: "Franja panorámica (entre métricas y zonas)", section: "global", hint: "Desktop 1920×600 · JPG · máx 2MB · Skyline panorámico" },
  { key: "banner_strip_image_mobile", value: null, type: "image", label: "Franja panorámica — versión móvil", section: "global", hint: "828×400px · JPG · máx 2MB" },
  { key: "og_image", value: null, type: "image", label: "Imagen para redes sociales (OG Image)", section: "global", hint: "1200×630px · JPG · máx 1MB · Se muestra al compartir en WhatsApp/LinkedIn" },

  { key: "og_title", value: "Expo Miami Real Estate — Inversión inmobiliaria de lujo desde España", type: "text", label: "Título OG (redes sociales)", section: "global", hint: "Título que aparece al compartir la web en WhatsApp, LinkedIn, etc. Máx 60 caracteres recomendado." },
  { key: "og_description", value: "Agencia licenciada en Florida especializada en inversores de alto patrimonio desde España.", type: "text", label: "Descripción OG (redes sociales)", section: "global", hint: "Descripción al compartir. Máx 160 caracteres recomendado." },
  { key: "canonical_url", value: "https://www.expomiamirealestate.com/", type: "text", label: "URL Canónica", section: "global", hint: "URL canónica de la página principal. Ayuda a evitar contenido duplicado en buscadores." },
  { key: "gsc_verification", value: null, type: "text", label: "Google Search Console — Código de verificación", section: "global", hint: "Solo el valor del atributo content de la etiqueta <meta name=\"google-site-verification\">. Ej: abc123XYZ" },
  { key: "meta_pixel_id", value: null, type: "text", label: "Meta Pixel ID", section: "global", hint: "ID numérico del píxel. Lo encuentras en Meta Business Suite → Administrador de eventos → Orígenes de datos." },
  { key: "ga4_id", value: null, type: "text", label: "Google Analytics 4 — Measurement ID", section: "global", hint: "Formato G-XXXXXXXX. Lo encuentras en GA4 → Administración → Flujos de datos." },
  { key: "gtm_id", value: null, type: "text", label: "Google Tag Manager — Container ID", section: "global", hint: "Formato GTM-XXXXXX. Lo encuentras en tu cuenta de GTM junto al nombre del contenedor." },

  { key: "notification_emails", value: "contacto@expomiamirealestate.com,avelino@agencialabs.cl,miriamdtoprealtor@gmail.com", type: "text", label: "Destinatarios de notificaciones", section: "notifications", hint: "Lista de emails separados por coma. Estas direcciones recibirán las notificaciones de nuevos leads." },
];

export async function seedDatabase(): Promise<void> {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const [existingAdmin] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.username, adminUsername));

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  if (!existingAdmin) {
    await db.insert(adminUsersTable).values({
      username: adminUsername,
      password: hashedPassword,
    });
    logger.info({ username: adminUsername }, "Admin user created");
  } else {
    const passwordChanged = !(await bcrypt.compare(adminPassword, existingAdmin.password));
    if (passwordChanged) {
      await db
        .update(adminUsersTable)
        .set({ password: hashedPassword })
        .where(eq(adminUsersTable.username, adminUsername));
      logger.info("Admin password updated from env");
    } else {
      logger.info("Admin user already exists");
    }
  }

  for (const setting of defaultSettings) {
    const [existing] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, setting.key));

    if (!existing) {
      await db.insert(siteSettingsTable).values(setting);
    } else if (existing.section !== setting.section) {
      await db
        .update(siteSettingsTable)
        .set({ section: setting.section })
        .where(eq(siteSettingsTable.key, setting.key));
    }
  }

  // Data migrations: update specific values when old known values are detected
  const [existingWhatsapp] = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, "whatsapp_number"));
  if (existingWhatsapp?.value === "13051234567") {
    await db
      .update(siteSettingsTable)
      .set({ value: "17867881877" })
      .where(eq(siteSettingsTable.key, "whatsapp_number"));
    logger.info("Migrated whatsapp_number to 17867881877");
  }

  logger.info("Default settings seeded");
}
