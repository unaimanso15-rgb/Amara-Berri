# PRD — Amara Berri K.E. (Web del club)

## Problema original
"Quiero que construyas una pagina web para el Amara Berri K.E." — Club deportivo (Kirol Elkartea) del barrio de Amara Berri, Donostia-San Sebastián.

## Decisiones del usuario
- Tipo: Club deportivo de fútbol.
- Idioma: Bilingüe (Euskera + Castellano), con toggle EU/ES.
- Secciones: Inicio, El club (Quiénes somos), Equipos/Categorías, Contacto.
- Funcionalidad: web informativa + formulario de contacto/inscripción que envía email (Resend) + panel de administración.
- Diseño: azul y blanco tomados del escudo del club (azul cielo, azul marino, blanco). Escudo oficial proporcionado.

## Arquitectura / Stack
- Frontend: React 19 (CRACO), Tailwind, shadcn/ui, framer-motion, lucide-react. Tema oscuro azul marino con acento azul cielo. Fuentes: Clash Display (títulos) + Manrope (cuerpo).
- Backend: FastAPI + MongoDB (motor). Auth JWT (Bearer en localStorage). Email vía Resend.
- Rutas: `/` (landing), `/admin/login`, `/admin` (protegida).

## Personas
- Visitante/familia: explora el club y sus equipos, envía solicitud de inscripción o info.
- Administrador del club: gestiona equipos y revisa solicitudes recibidas.

## Implementado (Jun 2026)
- Landing bilingüe: Hero, El club (valores), Equipos (dinámicos desde BD), Contacto (form), Footer.
- Toggle de idioma EU/ES persistente.
- Backend: GET /api/teams, POST /api/contact (guarda + intenta email), auth login/me, CRUD admin de equipos, listado/lectura/borrado de solicitudes, /api/admin/stats.
- Seed automático: usuario admin + 8 equipos por defecto (Eskola → Senior + Femenino).
- Panel admin: stats, pestañas Equipos (tabla + alta/edición/borrado vía diálogo) y Solicitudes (con marcar leído/eliminar).
- Credenciales admin en /app/memory/test_credentials.md.

## Estado de integraciones
- Resend: integrado en código. RESEND_API_KEY VACÍA actualmente → los emails NO se envían todavía; las solicitudes SÍ se guardan en el panel. Pendiente: API key + email real del club + verificación de dominio.

## Backlog priorizado
- P0: Añadir RESEND_API_KEY y CLUB_EMAIL reales; verificar dominio en Resend; testing e2e del flujo de contacto + admin.
- P1: Galería de fotos, sección de noticias/eventos, calendario de partidos.
- P2: Optimización de consultas (proyecciones/paginación en /teams y /admin/submissions); reCAPTCHA en el formulario; multi-admin.

## Próximas acciones
1. Recibir Resend API key + email del club, configurarlos en backend/.env y reiniciar backend.
2. Ejecutar testing_agent (backend + frontend) end-to-end.
