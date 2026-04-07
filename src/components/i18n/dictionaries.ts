/**
 * Easy OEE translation dictionaries.
 *
 * Three locales: en (English), es (Spanish), fr (French).
 *
 * Convention: dot-namespaced keys grouped by surface.
 *   nav.*       Site navigation
 *   footer.*    Site footer
 *   home.*      Marketing homepage
 *   how.*       /how-it-works
 *   roi.*       /roi-calculator
 *   pricing.*   /pricing
 *   contact.*   /contact
 *   signin.*    /sign-in (manager)
 *   pin.*       /pin (operator)
 *   operator.*  /operator
 *   shift.*     /shift/[id] live + summary
 *   dashboard.* /dashboard manager
 *   common.*    Reused everywhere
 *
 * To add a new key: add it to en first, then to es and fr.
 */

export type Locale = "en" | "es" | "fr";

export const LOCALES: Locale[] = ["en", "es", "fr"];
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
};
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

export type Dictionary = Record<string, string>;

export const dictionaries: Record<Locale, Dictionary> = {
  // ─────────────────────────────────────────────────────────────────────────
  // ENGLISH
  // ─────────────────────────────────────────────────────────────────────────
  en: {
    "nav.howItWorks": "How It Works",
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.roi": "ROI Calculator",
    "nav.signIn": "Sign In",
    "nav.bookDemo": "Book a Demo",

    "footer.tagline":
      "Real-time OEE tracking built for plant managers who want clarity on the shop floor. Up and running in one shift.",
    "footer.product": "Product",
    "footer.company": "Company",
    "footer.howItWorks": "How It Works",
    "footer.features": "Features",
    "footer.pricing": "Pricing",
    "footer.roi": "ROI Calculator",
    "footer.bookDemo": "Book a Demo",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.rights": "All rights reserved.",

    "home.eyebrow": "Built for smart manufacturers",
    "home.h1.line1": "YOU DON'T KNOW",
    "home.h1.line2": "YOUR REAL OEE.",
    "home.h1.line3": "WE CAN FIX THAT.",
    "home.sub":
      "Easy OEE gives plant managers real-time visibility into machine performance, downtime causes, and shift efficiency, from any device on the floor. Up and running today.",
    "home.cta.demo": "Book a Free Demo",
    "home.cta.how": "See How It Works",

    "signin.title": "SIGN IN",
    "signin.subtitle":
      "Sign in to view the manager dashboard, line setup, and shift history.",
    "signin.tag": "Manager Sign In",
    "signin.email": "Email",
    "signin.password": "Password",
    "signin.continueGoogle": "Continue with Google",
    "signin.continueMicrosoft": "Continue with Microsoft",
    "signin.orEmail": "or sign in with email",
    "signin.submit": "SIGN IN",
    "signin.submitting": "Signing in...",
    "signin.forgot": "Forgot password?",
    "signin.operatorPrompt": "Are you an operator on the floor?",
    "signin.operatorLink": "Sign in with PIN",
    "signin.back": "Back to easy-oee.com",
    "signin.errEmpty": "Enter your password.",
    "signin.errWrong": "Wrong password.",

    "pin.tag": "Operator Sign In",
    "pin.title": "PICK YOUR NAME",
    "pin.subtitle": "Then enter your 4-digit PIN.",
    "pin.operator": "Operator",
    "pin.signIn": "SIGN IN",
    "pin.signingIn": "Signing in…",
    "pin.errNotFound": "Operator not found",
    "pin.errWrongPin": "Wrong PIN",

    "operator.tag": "Operator",
    "operator.title": "START A SHIFT",
    "operator.signedInAs": "Signed in as",
    "operator.signOut": "Sign out",
    "operator.line": "Production Line",
    "operator.shift": "Shift",
    "operator.shift.morning": "Morning",
    "operator.shift.afternoon": "Afternoon",
    "operator.shift.night": "Night",
    "operator.product": "Product",
    "operator.productPlaceholder": "e.g. Widget A",
    "operator.plannedMinutes": "Planned Minutes",
    "operator.start": "START SHIFT",
    "operator.managerLink": "Manager dashboard",

    "shift.live": "LIVE SHIFT",
    "shift.running": "RUNNING",
    "shift.stopped": "STOPPED",
    "shift.goodParts": "Good Parts",
    "shift.badParts": "Bad Parts",
    "shift.tapHint": "Tap a reason to log a stop. Tap again to resume.",
    "shift.endShift": "END SHIFT",
    "shift.ending": "ENDING…",
    "shift.confirmEnd": "End this shift? Final OEE will be calculated and saved.",
    "shift.totalProduced": "Total produced",
    "shift.planned": "Planned",
    "shift.idealRate": "Ideal rate",

    "summary.tag": "Shift Complete",
    "summary.title": "SHIFT SUMMARY",
    "summary.overallOee": "Overall OEE",
    "summary.availability": "Availability",
    "summary.performance": "Performance",
    "summary.quality": "Quality",
    "summary.production": "Production Detail",
    "summary.downtime": "Downtime Events",
    "summary.noStops": "No stops recorded.",
    "summary.startNew": "START NEW SHIFT",
    "summary.dashboard": "DASHBOARD",

    "dashboard.tag": "Manager Dashboard",
    "dashboard.title": "TODAY",
    "dashboard.startShift": "START SHIFT",
    "dashboard.todaysOee": "Today's OEE",
    "dashboard.liveShifts": "Live Shifts",
    "dashboard.recentShifts": "Recent Shifts",
    "dashboard.topStops": "Top Stop Reasons (last 7 days)",
    "dashboard.noLive": "No shifts in progress.",
    "dashboard.noRecent": "No completed shifts yet.",
    "dashboard.noStops": "No stops recorded.",
    "dashboard.live": "LIVE",
    "dashboard.done": "DONE",

    "common.signOut": "Sign out",
    "common.save": "Save",
    "common.add": "ADD",
    "common.deactivate": "Deactivate",
    "common.active": "active",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SPANISH
  // ─────────────────────────────────────────────────────────────────────────
  es: {
    "nav.howItWorks": "Cómo Funciona",
    "nav.features": "Funciones",
    "nav.pricing": "Precios",
    "nav.roi": "Calculadora ROI",
    "nav.signIn": "Iniciar Sesión",
    "nav.bookDemo": "Reservar Demo",

    "footer.tagline":
      "Seguimiento de OEE en tiempo real para gerentes de planta que buscan claridad en el área de producción. Listo en un solo turno.",
    "footer.product": "Producto",
    "footer.company": "Empresa",
    "footer.howItWorks": "Cómo Funciona",
    "footer.features": "Funciones",
    "footer.pricing": "Precios",
    "footer.roi": "Calculadora ROI",
    "footer.bookDemo": "Reservar Demo",
    "footer.contact": "Contacto",
    "footer.privacy": "Política de Privacidad",
    "footer.terms": "Términos de Servicio",
    "footer.rights": "Todos los derechos reservados.",

    "home.eyebrow": "Hecho para fabricantes inteligentes",
    "home.h1.line1": "NO CONOCES",
    "home.h1.line2": "TU OEE REAL.",
    "home.h1.line3": "PODEMOS ARREGLARLO.",
    "home.sub":
      "Easy OEE le da a los gerentes de planta visibilidad en tiempo real del rendimiento de las máquinas, las causas de paradas y la eficiencia por turno, desde cualquier dispositivo en el área de producción. Listo hoy mismo.",
    "home.cta.demo": "Reservar una Demo Gratis",
    "home.cta.how": "Ver Cómo Funciona",

    "signin.title": "INICIAR SESIÓN",
    "signin.subtitle":
      "Inicia sesión para ver el panel del gerente, la configuración de líneas y el historial de turnos.",
    "signin.tag": "Acceso del Gerente",
    "signin.email": "Correo electrónico",
    "signin.password": "Contraseña",
    "signin.continueGoogle": "Continuar con Google",
    "signin.continueMicrosoft": "Continuar con Microsoft",
    "signin.orEmail": "o inicia sesión con correo",
    "signin.submit": "INICIAR SESIÓN",
    "signin.submitting": "Iniciando sesión...",
    "signin.forgot": "¿Olvidaste tu contraseña?",
    "signin.operatorPrompt": "¿Eres operador en planta?",
    "signin.operatorLink": "Inicia sesión con PIN",
    "signin.back": "Volver a easy-oee.com",
    "signin.errEmpty": "Ingresa tu contraseña.",
    "signin.errWrong": "Contraseña incorrecta.",

    "pin.tag": "Acceso del Operador",
    "pin.title": "ELIGE TU NOMBRE",
    "pin.subtitle": "Luego ingresa tu PIN de 4 dígitos.",
    "pin.operator": "Operador",
    "pin.signIn": "INICIAR SESIÓN",
    "pin.signingIn": "Iniciando sesión…",
    "pin.errNotFound": "Operador no encontrado",
    "pin.errWrongPin": "PIN incorrecto",

    "operator.tag": "Operador",
    "operator.title": "INICIAR UN TURNO",
    "operator.signedInAs": "Sesión iniciada como",
    "operator.signOut": "Cerrar sesión",
    "operator.line": "Línea de Producción",
    "operator.shift": "Turno",
    "operator.shift.morning": "Mañana",
    "operator.shift.afternoon": "Tarde",
    "operator.shift.night": "Noche",
    "operator.product": "Producto",
    "operator.productPlaceholder": "ej. Widget A",
    "operator.plannedMinutes": "Minutos Planeados",
    "operator.start": "INICIAR TURNO",
    "operator.managerLink": "Panel del gerente",

    "shift.live": "TURNO EN VIVO",
    "shift.running": "EN MARCHA",
    "shift.stopped": "DETENIDO",
    "shift.goodParts": "Piezas Buenas",
    "shift.badParts": "Piezas Defectuosas",
    "shift.tapHint": "Toca una razón para registrar una parada. Toca de nuevo para reanudar.",
    "shift.endShift": "TERMINAR TURNO",
    "shift.ending": "TERMINANDO…",
    "shift.confirmEnd": "¿Terminar este turno? Se calculará y guardará el OEE final.",
    "shift.totalProduced": "Total producido",
    "shift.planned": "Planeado",
    "shift.idealRate": "Tasa ideal",

    "summary.tag": "Turno Completo",
    "summary.title": "RESUMEN DEL TURNO",
    "summary.overallOee": "OEE Total",
    "summary.availability": "Disponibilidad",
    "summary.performance": "Desempeño",
    "summary.quality": "Calidad",
    "summary.production": "Detalles de Producción",
    "summary.downtime": "Eventos de Paro",
    "summary.noStops": "Sin paradas registradas.",
    "summary.startNew": "INICIAR NUEVO TURNO",
    "summary.dashboard": "PANEL",

    "dashboard.tag": "Panel del Gerente",
    "dashboard.title": "HOY",
    "dashboard.startShift": "INICIAR TURNO",
    "dashboard.todaysOee": "OEE de Hoy",
    "dashboard.liveShifts": "Turnos en Vivo",
    "dashboard.recentShifts": "Turnos Recientes",
    "dashboard.topStops": "Principales Razones de Parada (últimos 7 días)",
    "dashboard.noLive": "No hay turnos en progreso.",
    "dashboard.noRecent": "Aún no hay turnos completados.",
    "dashboard.noStops": "Sin paradas registradas.",
    "dashboard.live": "EN VIVO",
    "dashboard.done": "HECHO",

    "common.signOut": "Cerrar sesión",
    "common.save": "Guardar",
    "common.add": "AÑADIR",
    "common.deactivate": "Desactivar",
    "common.active": "activo",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FRENCH
  // ─────────────────────────────────────────────────────────────────────────
  fr: {
    "nav.howItWorks": "Fonctionnement",
    "nav.features": "Fonctionnalités",
    "nav.pricing": "Tarifs",
    "nav.roi": "Calculateur ROI",
    "nav.signIn": "Connexion",
    "nav.bookDemo": "Réserver une Démo",

    "footer.tagline":
      "Suivi OEE en temps réel pour les directeurs d'usine qui veulent de la clarté sur le plancher. Opérationnel en un seul quart.",
    "footer.product": "Produit",
    "footer.company": "Entreprise",
    "footer.howItWorks": "Fonctionnement",
    "footer.features": "Fonctionnalités",
    "footer.pricing": "Tarifs",
    "footer.roi": "Calculateur ROI",
    "footer.bookDemo": "Réserver une Démo",
    "footer.contact": "Contact",
    "footer.privacy": "Politique de Confidentialité",
    "footer.terms": "Conditions d'Utilisation",
    "footer.rights": "Tous droits réservés.",

    "home.eyebrow": "Conçu pour les fabricants intelligents",
    "home.h1.line1": "VOUS NE CONNAISSEZ PAS",
    "home.h1.line2": "VOTRE VRAI OEE.",
    "home.h1.line3": "ON PEUT ARRANGER ÇA.",
    "home.sub":
      "Easy OEE donne aux directeurs d'usine une visibilité en temps réel sur la performance des machines, les causes d'arrêt et l'efficacité des quarts, depuis n'importe quel appareil sur le plancher. En marche dès aujourd'hui.",
    "home.cta.demo": "Réserver une Démo Gratuite",
    "home.cta.how": "Voir le Fonctionnement",

    "signin.title": "CONNEXION",
    "signin.subtitle":
      "Connectez-vous pour voir le tableau de bord, la configuration des lignes et l'historique des quarts.",
    "signin.tag": "Connexion Directeur",
    "signin.email": "Courriel",
    "signin.password": "Mot de passe",
    "signin.continueGoogle": "Continuer avec Google",
    "signin.continueMicrosoft": "Continuer avec Microsoft",
    "signin.orEmail": "ou connectez-vous par courriel",
    "signin.submit": "CONNEXION",
    "signin.submitting": "Connexion en cours...",
    "signin.forgot": "Mot de passe oublié?",
    "signin.operatorPrompt": "Vous êtes opérateur sur le plancher?",
    "signin.operatorLink": "Connexion par NIP",
    "signin.back": "Retour à easy-oee.com",
    "signin.errEmpty": "Entrez votre mot de passe.",
    "signin.errWrong": "Mot de passe incorrect.",

    "pin.tag": "Connexion Opérateur",
    "pin.title": "CHOISISSEZ VOTRE NOM",
    "pin.subtitle": "Puis entrez votre NIP à 4 chiffres.",
    "pin.operator": "Opérateur",
    "pin.signIn": "CONNEXION",
    "pin.signingIn": "Connexion…",
    "pin.errNotFound": "Opérateur introuvable",
    "pin.errWrongPin": "NIP incorrect",

    "operator.tag": "Opérateur",
    "operator.title": "DÉMARRER UN QUART",
    "operator.signedInAs": "Connecté en tant que",
    "operator.signOut": "Déconnexion",
    "operator.line": "Ligne de Production",
    "operator.shift": "Quart",
    "operator.shift.morning": "Matin",
    "operator.shift.afternoon": "Après-midi",
    "operator.shift.night": "Nuit",
    "operator.product": "Produit",
    "operator.productPlaceholder": "ex. Widget A",
    "operator.plannedMinutes": "Minutes Planifiées",
    "operator.start": "DÉMARRER LE QUART",
    "operator.managerLink": "Tableau de bord directeur",

    "shift.live": "QUART EN COURS",
    "shift.running": "EN MARCHE",
    "shift.stopped": "ARRÊTÉ",
    "shift.goodParts": "Pièces Bonnes",
    "shift.badParts": "Pièces Mauvaises",
    "shift.tapHint": "Touchez une raison pour enregistrer un arrêt. Touchez encore pour reprendre.",
    "shift.endShift": "TERMINER LE QUART",
    "shift.ending": "EN TRAIN DE TERMINER…",
    "shift.confirmEnd": "Terminer ce quart? L'OEE final sera calculé et sauvegardé.",
    "shift.totalProduced": "Total produit",
    "shift.planned": "Planifié",
    "shift.idealRate": "Cadence idéale",

    "summary.tag": "Quart Terminé",
    "summary.title": "RÉSUMÉ DU QUART",
    "summary.overallOee": "OEE Global",
    "summary.availability": "Disponibilité",
    "summary.performance": "Performance",
    "summary.quality": "Qualité",
    "summary.production": "Détails de Production",
    "summary.downtime": "Événements d'Arrêt",
    "summary.noStops": "Aucun arrêt enregistré.",
    "summary.startNew": "DÉMARRER UN NOUVEAU QUART",
    "summary.dashboard": "TABLEAU DE BORD",

    "dashboard.tag": "Tableau de Bord",
    "dashboard.title": "AUJOURD'HUI",
    "dashboard.startShift": "DÉMARRER UN QUART",
    "dashboard.todaysOee": "OEE d'Aujourd'hui",
    "dashboard.liveShifts": "Quarts en Cours",
    "dashboard.recentShifts": "Quarts Récents",
    "dashboard.topStops": "Principales Raisons d'Arrêt (7 derniers jours)",
    "dashboard.noLive": "Aucun quart en cours.",
    "dashboard.noRecent": "Aucun quart terminé pour le moment.",
    "dashboard.noStops": "Aucun arrêt enregistré.",
    "dashboard.live": "EN COURS",
    "dashboard.done": "TERMINÉ",

    "common.signOut": "Déconnexion",
    "common.save": "Enregistrer",
    "common.add": "AJOUTER",
    "common.deactivate": "Désactiver",
    "common.active": "actif",
  },
};

export function t(locale: Locale, key: string): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}
