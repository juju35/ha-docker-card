/*
 * Docker Card for Home Assistant
 * https://github.com/juju35/ha-docker-card
 *
 * Lovelace cards for the Dockhand integration (https://github.com/raetha/ha-dockhand),
 * Monitor Docker (https://github.com/ualex73/monitor_docker) and Portainer (core integration).
 * Dockhand and Portainer entities are resolved through the entity and device registries (platform, translation_key,
 * device model and hierarchy), so they work whatever the Home Assistant language or entity ids.
 * Monitor Docker entities are not registered: they are found by their entity id pattern.
 */

const VERSION = "__VERSION__";
const DOCKHAND_SITE = "https://dockhand.pro";
// Name shown for each source (logo tooltip, editor list) and the site its logo opens when nothing better is known.
const SOURCES = {
  dockhand: { name: "Dockhand", site: DOCKHAND_SITE },
  monitor_docker: { name: "Monitor Docker", site: "https://github.com/ualex73/monitor_docker" },
  portainer: { name: "Portainer", site: "https://www.portainer.io" },
};

const ICONS = {
  docker:
    "M21.81 10.25C21.75 10.21 21.25 9.82 20.17 9.82C19.89 9.82 19.61 9.85 19.33 9.9C19.12 8.5 17.95 7.79 17.9 7.76L17.61 7.59L17.43 7.86C17.19 8.22 17 8.63 16.92 9.05C16.72 9.85 16.84 10.61 17.25 11.26C16.76 11.54 15.96 11.61 15.79 11.61H2.62C2.28 11.61 2 11.89 2 12.24C2 13.39 2.18 14.54 2.58 15.62C3.03 16.81 3.71 17.69 4.58 18.23C5.56 18.83 7.17 19.17 9 19.17C9.79 19.17 10.61 19.1 11.42 18.95C12.54 18.75 13.62 18.36 14.61 17.79C15.43 17.32 16.16 16.72 16.78 16C17.83 14.83 18.45 13.5 18.9 12.35H19.09C20.23 12.35 20.94 11.89 21.33 11.5C21.59 11.26 21.78 10.97 21.92 10.63L22 10.39L21.81 10.25M3.85 11.24H5.61C5.69 11.24 5.77 11.17 5.77 11.08V9.5C5.77 9.42 5.7 9.34 5.61 9.34H3.85C3.76 9.34 3.69 9.41 3.69 9.5V11.08C3.7 11.17 3.76 11.24 3.85 11.24M6.28 11.24H8.04C8.12 11.24 8.2 11.17 8.2 11.08V9.5C8.2 9.42 8.13 9.34 8.04 9.34H6.28C6.19 9.34 6.12 9.41 6.12 9.5V11.08C6.13 11.17 6.19 11.24 6.28 11.24M8.75 11.24H10.5C10.6 11.24 10.67 11.17 10.67 11.08V9.5C10.67 9.42 10.61 9.34 10.5 9.34H8.75C8.67 9.34 8.6 9.41 8.6 9.5V11.08C8.6 11.17 8.66 11.24 8.75 11.24M11.19 11.24H12.96C13.04 11.24 13.11 11.17 13.11 11.08V9.5C13.11 9.42 13.05 9.34 12.96 9.34H11.19C11.11 9.34 11.04 9.41 11.04 9.5V11.08C11.04 11.17 11.11 11.24 11.19 11.24M6.28 9H8.04C8.12 9 8.2 8.91 8.2 8.82V7.25C8.2 7.16 8.13 7.09 8.04 7.09H6.28C6.19 7.09 6.12 7.15 6.12 7.25V8.82C6.13 8.91 6.19 9 6.28 9M8.75 9H10.5C10.6 9 10.67 8.91 10.67 8.82V7.25C10.67 7.16 10.61 7.09 10.5 7.09H8.75C8.67 7.09 8.6 7.15 8.6 7.25V8.82C8.6 8.91 8.66 9 8.75 9M11.19 9H12.96C13.04 9 13.11 8.91 13.11 8.82V7.25C13.11 7.16 13.04 7.09 12.96 7.09H11.19C11.11 7.09 11.04 7.15 11.04 7.25V8.82C11.04 8.91 11.11 9 11.19 9M11.19 6.72H12.96C13.04 6.72 13.11 6.65 13.11 6.56V5C13.11 4.9 13.04 4.83 12.96 4.83H11.19C11.11 4.83 11.04 4.89 11.04 5V6.56C11.04 6.64 11.11 6.72 11.19 6.72M13.65 11.24H15.41C15.5 11.24 15.57 11.17 15.57 11.08V9.5C15.57 9.42 15.5 9.34 15.41 9.34H13.65C13.57 9.34 13.5 9.41 13.5 9.5V11.08C13.5 11.17 13.57 11.24 13.65 11.24",
  chevron: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  cpu: "M6,4H18V5H21V7H18V9H21V11H18V13H21V15H18V17H21V19H18V20H6V19H3V17H6V15H3V13H6V11H3V9H6V7H3V5H6V4M11,15V18H12V15H11M13,15V18H14V15H13M15,15V18H16V15H15Z",
  ram: "M17,17H7V7H17M21,11V9H19V7C19,5.89 18.1,5 17,5H15V3H13V5H11V3H9V5H7C5.89,5 5,5.89 5,7V9H3V11H5V13H3V15H5V17A2,2 0 0,0 7,19H9V21H11V19H13V21H15V19H17A2,2 0 0,0 19,17V15H21V13H19V11M13,13H11V11H13M15,9H9V15H15V9Z",
  container: "M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z",
  stack: "M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z",
  image: "M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L10.11,5.22L16,8.61L17.96,7.5L12,4.15M6.04,7.5L12,10.85L13.96,9.75L8.08,6.35L6.04,7.5M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z",
  volume: "M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z",
  network: "M10,2C8.89,2 8,2.89 8,4V7C8,8.11 8.89,9 10,9H11V11H2V13H6V15H5C3.89,15 3,15.89 3,17V20C3,21.11 3.89,22 5,22H9C10.11,22 11,21.11 11,20V17C11,15.89 10.11,15 9,15H8V13H16V15H15C13.89,15 13,15.89 13,17V20C13,21.11 13.89,22 15,22H19C20.11,22 21,21.11 21,20V17C21,15.89 20.11,15 19,15H18V13H22V11H13V9H14C15.11,9 16,8.11 16,7V4C16,2.89 15.11,2 14,2H10M10,4H14V7H10V4M5,17H9V20H5V17M15,17H19V20H15V17Z",
  update: "M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22M12,7L7,12H10V16H14V12H17L12,7Z",
  restart: "M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z",
  power: "M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13",
  git: "M2.6,10.59L8.38,4.8L10.07,6.5C9.83,7.35 10.22,8.28 11,8.73V14.27C10.4,14.61 10,15.26 10,16A2,2 0 0,0 12,18A2,2 0 0,0 14,16C14,15.26 13.6,14.61 13,14.27V9.41L15.07,11.5C15,11.65 15,11.82 15,12A2,2 0 0,0 17,14A2,2 0 0,0 19,12A2,2 0 0,0 17,10C16.82,10 16.65,10 16.5,10.07L13.93,7.5C14.19,6.57 13.71,5.55 12.78,5.16C12.35,5 11.9,4.96 11.5,5.07L9.8,3.38L10.59,2.6C11.37,1.81 12.63,1.81 13.41,2.6L21.4,10.59C22.19,11.37 22.19,12.63 21.4,13.41L13.41,21.4C12.63,22.19 11.37,22.19 10.59,21.4L2.6,13.41C1.81,12.63 1.81,11.37 2.6,10.59Z",
  alert: "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z",
  // mdi:arrow-expand and mdi:arrow-collapse, the mini card's detail button.
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
};

const STRINGS = {
  en: {
    cpu: "CPU",
    memory: "Memory",
    containers: "Containers",
    stacks: "Stacks",
    images: "Images",
    volumes: "Volumes",
    networks: "Networks",
    updates: "Updates",
    // Inline lowercase forms ("3 containers", "5 stacks"): German keeps its capitalised nouns.
    container_lc: "container",
    containers_lc: "containers",
    stacks_lc: "stacks",
    images_lc: "images",
    updates_lc: "updates",
    running: "running",
    cores: "cores",
    // Counted nouns: forms picked by Intl.PluralRules (one, few, many); the key without suffix is the
    // fallback (other, or a count that is not a number).
    containers_lc_one: "container",
    stacks_lc_one: "stack",
    images_lc_one: "image",
    updates_lc_one: "update",
    cores_one: "core",
    online: "Online",
    offline: "Offline",
    update_available: "Update available",
    unhealthy: "Unhealthy",
    sync_error: "Sync error",
    restart: "Restart",
    stop: "Stop",
    cancel: "Cancel",
    start_stop: "Start / stop",
    confirm_restart: "Restart {name}?",
    confirm_stop: "Stop {name}?",
    all_ok: "Nothing to report",
    no_env: "No Docker environment found. Is the Dockhand, Monitor Docker or Portainer integration installed?",
    unknown_env: "Environment not found",
    no_registry: "This card needs Home Assistant 2024.8 or later.",
    state_running: "Running",
    state_exited: "Stopped",
    state_stopped: "Stopped",
    state_partial: "Partial",
    state_paused: "Paused",
    state_restarting: "Restarting",
    state_created: "Created",
    state_dead: "Dead",
    state_unavailable: "Unavailable",
    state_unknown: "Unknown",
    zoom_in: "Show the full card",
    zoom_out: "Back to the compact view",
    // Editor
    environment: "Environment",
    title: "Title (optional, defaults to the environment name)",
    url: "URL opened by the logo (optional, detected from the integration)",
    show_stats: "Show CPU, memory and containers",
    show_counts: "Show counts (stacks, images…)",
    show_stacks: "Show stacks",
    show_containers: "Show containers",
    show_controls: "Show start / stop / restart buttons",
    only_problems: "Only list stacks and containers needing attention",
    expand_stacks: "Stacks list expanded by default",
    expand_containers: "Containers list expanded by default",
    show_updates: "Show pending updates",
    zoom: "Detail button",
    zoom_helper: "Switches the mini card to the full card and back",
    language: "Language",
    lang_auto: "Automatic",
  },
  fr: {
    cpu: "CPU",
    memory: "Mémoire",
    containers: "Conteneurs",
    stacks: "Stacks",
    images: "Images",
    volumes: "Volumes",
    networks: "Réseaux",
    updates: "Mises à jour",
    container_lc: "conteneur",
    containers_lc: "conteneurs",
    stacks_lc: "stacks",
    images_lc: "images",
    updates_lc: "mises à jour",
    running: "actifs",
    cores: "cœurs",
    containers_lc_one: "conteneur",
    stacks_lc_one: "stack",
    images_lc_one: "image",
    updates_lc_one: "mise à jour",
    cores_one: "cœur",
    online: "En ligne",
    offline: "Hors ligne",
    update_available: "Mise à jour disponible",
    unhealthy: "En mauvaise santé",
    sync_error: "Erreur de synchro",
    restart: "Redémarrer",
    stop: "Arrêter",
    cancel: "Annuler",
    start_stop: "Démarrer / arrêter",
    confirm_restart: "Redémarrer {name} ?",
    confirm_stop: "Arrêter {name} ?",
    all_ok: "Rien à signaler",
    no_env: "Aucun environnement Docker trouvé. L'intégration Dockhand, Monitor Docker ou Portainer est-elle installée ?",
    unknown_env: "Environnement introuvable",
    no_registry: "Cette carte nécessite Home Assistant 2024.8 ou plus récent.",
    state_running: "Actif",
    state_exited: "Arrêté",
    state_stopped: "Arrêté",
    state_partial: "Partiel",
    state_paused: "En pause",
    state_restarting: "Redémarrage",
    state_created: "Créé",
    state_dead: "Mort",
    state_unavailable: "Indisponible",
    state_unknown: "Inconnu",
    zoom_in: "Afficher la carte complète",
    zoom_out: "Revenir à la vue compacte",
    environment: "Environnement",
    title: "Titre (facultatif, nom de l'environnement par défaut)",
    url: "URL ouverte par le logo (facultatif, détectée depuis l'intégration)",
    show_stats: "Afficher CPU, mémoire et conteneurs",
    show_counts: "Afficher les compteurs (stacks, images…)",
    show_stacks: "Afficher les stacks",
    show_containers: "Afficher les conteneurs",
    show_controls: "Afficher les boutons démarrer / arrêter / redémarrer",
    only_problems: "Lister uniquement les stacks et conteneurs à surveiller",
    expand_stacks: "Liste des stacks dépliée par défaut",
    expand_containers: "Liste des conteneurs dépliée par défaut",
    show_updates: "Afficher les mises à jour en attente",
    zoom: "Bouton de détail",
    zoom_helper: "Bascule la mini-carte en carte complète, et inversement",
    language: "Langue",
    lang_auto: "Automatique",
  },
  de: {
    cpu: "CPU",
    memory: "Speicher",
    containers: "Container",
    stacks: "Stacks",
    images: "Images",
    volumes: "Volumes",
    networks: "Netzwerke",
    updates: "Updates",
    container_lc: "Container",
    containers_lc: "Container",
    stacks_lc: "Stacks",
    images_lc: "Images",
    updates_lc: "Updates",
    running: "aktiv",
    cores: "Kerne",
    containers_lc_one: "Container",
    stacks_lc_one: "Stack",
    images_lc_one: "Image",
    updates_lc_one: "Update",
    cores_one: "Kern",
    online: "Online",
    offline: "Offline",
    update_available: "Update verfügbar",
    unhealthy: "Fehlerhaft",
    sync_error: "Synchronisierungsfehler",
    restart: "Neu starten",
    stop: "Stoppen",
    cancel: "Abbrechen",
    start_stop: "Starten / stoppen",
    confirm_restart: "{name} neu starten?",
    confirm_stop: "{name} stoppen?",
    all_ok: "Keine Auffälligkeiten",
    no_env: "Keine Docker-Umgebung gefunden. Ist die Dockhand-, Monitor-Docker- oder Portainer-Integration installiert?",
    unknown_env: "Umgebung nicht gefunden",
    no_registry: "Diese Karte benötigt Home Assistant 2024.8 oder neuer.",
    state_running: "Aktiv",
    state_exited: "Gestoppt",
    state_stopped: "Gestoppt",
    state_partial: "Teilweise",
    state_paused: "Pausiert",
    state_restarting: "Startet neu",
    state_created: "Erstellt",
    state_dead: "Tot",
    state_unavailable: "Nicht verfügbar",
    state_unknown: "Unbekannt",
    zoom_in: "Vollständige Karte anzeigen",
    zoom_out: "Zurück zur kompakten Ansicht",
    environment: "Umgebung",
    title: "Titel (optional, standardmäßig der Name der Umgebung)",
    url: "Vom Logo geöffnete URL (optional, wird aus der Integration ermittelt)",
    show_stats: "CPU, Speicher und Container anzeigen",
    show_counts: "Zähler anzeigen (Stacks, Images…)",
    show_stacks: "Stacks anzeigen",
    show_containers: "Container anzeigen",
    show_controls: "Schaltflächen Starten / Stoppen / Neu starten anzeigen",
    only_problems: "Nur Stacks und Container auflisten, die Aufmerksamkeit erfordern",
    expand_stacks: "Stack-Liste standardmäßig aufgeklappt",
    expand_containers: "Container-Liste standardmäßig aufgeklappt",
    show_updates: "Ausstehende Updates anzeigen",
    zoom: "Detail-Schaltfläche",
    zoom_helper: "Wechselt von der Mini-Karte zur vollständigen Karte und zurück",
    language: "Sprache",
    lang_auto: "Automatisch",
  },
  es: {
    cpu: "CPU",
    memory: "Memoria",
    containers: "Contenedores",
    stacks: "Stacks",
    images: "Imágenes",
    volumes: "Volúmenes",
    networks: "Redes",
    updates: "Actualiz.",
    container_lc: "contenedor",
    containers_lc: "contenedores",
    stacks_lc: "stacks",
    images_lc: "imágenes",
    updates_lc: "actualizaciones",
    running: "en ejecución",
    cores: "núcleos",
    containers_lc_one: "contenedor",
    stacks_lc_one: "stack",
    images_lc_one: "imagen",
    updates_lc_one: "actualización",
    cores_one: "núcleo",
    online: "En línea",
    offline: "Sin conexión",
    update_available: "Actualización disponible",
    unhealthy: "En mal estado",
    sync_error: "Error de sincronización",
    restart: "Reiniciar",
    stop: "Detener",
    cancel: "Cancelar",
    start_stop: "Iniciar / detener",
    confirm_restart: "¿Reiniciar {name}?",
    confirm_stop: "¿Detener {name}?",
    all_ok: "Sin incidencias",
    no_env: "No se encontró ningún entorno de Docker. ¿Está instalada la integración Dockhand, Monitor Docker o Portainer?",
    unknown_env: "Entorno no encontrado",
    no_registry: "Esta tarjeta requiere Home Assistant 2024.8 o posterior.",
    state_running: "En ejecución",
    state_exited: "Detenido",
    state_stopped: "Detenido",
    state_partial: "Parcial",
    state_paused: "En pausa",
    state_restarting: "Reiniciando",
    state_created: "Creado",
    state_dead: "Muerto",
    state_unavailable: "No disponible",
    state_unknown: "Desconocido",
    zoom_in: "Mostrar la tarjeta completa",
    zoom_out: "Volver a la vista compacta",
    environment: "Entorno",
    title: "Título (opcional, por defecto el nombre del entorno)",
    url: "URL abierta por el logo (opcional, detectada desde la integración)",
    show_stats: "Mostrar CPU, memoria y contenedores",
    show_counts: "Mostrar contadores (stacks, imágenes…)",
    show_stacks: "Mostrar los stacks",
    show_containers: "Mostrar los contenedores",
    show_controls: "Mostrar los botones iniciar / detener / reiniciar",
    only_problems: "Mostrar solo los stacks y contenedores que requieren atención",
    expand_stacks: "Lista de stacks desplegada por defecto",
    expand_containers: "Lista de contenedores desplegada por defecto",
    show_updates: "Mostrar las actualizaciones pendientes",
    zoom: "Botón de detalle",
    zoom_helper: "Cambia la mini tarjeta a la tarjeta completa y viceversa",
    language: "Idioma",
    lang_auto: "Automático",
  },
  sr: {
    cpu: "CPU",
    memory: "Меморија",
    containers: "Контејнери",
    stacks: "Стекови",
    images: "Слике",
    volumes: "Волумени",
    networks: "Мреже",
    updates: "Ажурирања",
    container_lc: "контејнер",
    containers_lc: "контејнера",
    stacks_lc: "стекова",
    images_lc: "слика",
    updates_lc: "ажурирања",
    running: "покренути",
    cores: "језгара",
    containers_lc_one: "контејнер",
    stacks_lc_one: "стек",
    images_lc_one: "слика",
    updates_lc_one: "ажурирање",
    cores_one: "језгро",
    containers_lc_few: "контејнера",
    stacks_lc_few: "стека",
    images_lc_few: "слике",
    updates_lc_few: "ажурирања",
    cores_few: "језгра",
    online: "На мрежи",
    offline: "Ван мреже",
    update_available: "Доступно ажурирање",
    unhealthy: "Неисправно",
    sync_error: "Грешка синхронизације",
    restart: "Поново покрени",
    stop: "Заустави",
    cancel: "Откажи",
    start_stop: "Покрени / заустави",
    confirm_restart: "Поново покренути {name}?",
    confirm_stop: "Зауставити {name}?",
    all_ok: "Све је у реду",
    no_env: "Није пронађено ниједно Docker окружење. Да ли је интеграција Dockhand, Monitor Docker или Portainer инсталирана?",
    unknown_env: "Окружење није пронађено",
    no_registry: "Ова картица захтева Home Assistant 2024.8 или новији.",
    state_running: "Покренуто",
    state_exited: "Заустављено",
    state_stopped: "Заустављено",
    state_partial: "Делимично",
    state_paused: "Паузирано",
    state_restarting: "Поновно покретање",
    state_created: "Креирано",
    state_dead: "Мртво",
    state_unavailable: "Недоступно",
    state_unknown: "Непознато",
    zoom_in: "Прикажи целу картицу",
    zoom_out: "Назад на компактни приказ",
    environment: "Окружење",
    title: "Наслов (опционо, подразумевано је назив окружења)",
    url: "URL који отвара лого (опционо, преузима се из интеграције)",
    show_stats: "Прикажи CPU, меморију и контејнере",
    show_counts: "Прикажи бројаче (стекови, слике…)",
    show_stacks: "Прикажи стекове",
    show_containers: "Прикажи контејнере",
    show_controls: "Прикажи дугмад покрени / заустави / поново покрени",
    only_problems: "Прикажи само стекове и контејнере којима је потребна пажња",
    expand_stacks: "Листа стекова подразумевано отворена",
    expand_containers: "Листа контејнера подразумевано отворена",
    show_updates: "Прикажи ажурирања на чекању",
    zoom: "Дугме за детаље",
    zoom_helper: "Пребацује мини картицу на пуну картицу и назад",
    language: "Језик",
    lang_auto: "Аутоматски",
  },
  "sr-Latn": {
    cpu: "CPU",
    memory: "Memorija",
    containers: "Kontejneri",
    stacks: "Stekovi",
    images: "Slike",
    volumes: "Volumeni",
    networks: "Mreže",
    updates: "Ažuriranja",
    container_lc: "kontejner",
    containers_lc: "kontejnera",
    stacks_lc: "stekova",
    images_lc: "slika",
    updates_lc: "ažuriranja",
    running: "pokrenuti",
    cores: "jezgara",
    containers_lc_one: "kontejner",
    stacks_lc_one: "stek",
    images_lc_one: "slika",
    updates_lc_one: "ažuriranje",
    cores_one: "jezgro",
    containers_lc_few: "kontejnera",
    stacks_lc_few: "steka",
    images_lc_few: "slike",
    updates_lc_few: "ažuriranja",
    cores_few: "jezgra",
    online: "Na mreži",
    offline: "Van mreže",
    update_available: "Dostupno ažuriranje",
    unhealthy: "Neispravno",
    sync_error: "Greška sinhronizacije",
    restart: "Ponovo pokreni",
    stop: "Zaustavi",
    cancel: "Otkaži",
    start_stop: "Pokreni / zaustavi",
    confirm_restart: "Ponovo pokrenuti {name}?",
    confirm_stop: "Zaustaviti {name}?",
    all_ok: "Sve je u redu",
    no_env: "Nije pronađeno nijedno Docker okruženje. Da li je integracija Dockhand, Monitor Docker ili Portainer instalirana?",
    unknown_env: "Okruženje nije pronađeno",
    no_registry: "Ova kartica zahteva Home Assistant 2024.8 ili noviji.",
    state_running: "Pokrenuto",
    state_exited: "Zaustavljeno",
    state_stopped: "Zaustavljeno",
    state_partial: "Delimično",
    state_paused: "Pauzirano",
    state_restarting: "Ponovno pokretanje",
    state_created: "Kreirano",
    state_dead: "Mrtvo",
    state_unavailable: "Nedostupno",
    state_unknown: "Nepoznato",
    zoom_in: "Prikaži celu karticu",
    zoom_out: "Nazad na kompaktni prikaz",
    environment: "Okruženje",
    title: "Naslov (opciono, podrazumevano je naziv okruženja)",
    url: "URL koji otvara logo (opciono, preuzima se iz integracije)",
    show_stats: "Prikaži CPU, memoriju i kontejnere",
    show_counts: "Prikaži brojače (stekovi, slike…)",
    show_stacks: "Prikaži stekove",
    show_containers: "Prikaži kontejnere",
    show_controls: "Prikaži dugmad pokreni / zaustavi / ponovo pokreni",
    only_problems: "Prikaži samo stekove i kontejnere kojima je potrebna pažnja",
    expand_stacks: "Lista stekova podrazumevano otvorena",
    expand_containers: "Lista kontejnera podrazumevano otvorena",
    show_updates: "Prikaži ažuriranja na čekanju",
    zoom: "Dugme za detalje",
    zoom_helper: "Prebacuje mini karticu na punu karticu i nazad",
    language: "Jezik",
    lang_auto: "Automatski",
  },
  it: {
    cpu: "CPU",
    memory: "Memoria",
    containers: "Container",
    stacks: "Stack",
    images: "Immagini",
    volumes: "Volumi",
    networks: "Reti",
    updates: "Aggiorn.",
    container_lc: "container",
    containers_lc: "container",
    stacks_lc: "stack",
    images_lc: "immagini",
    updates_lc: "aggiornamenti",
    running: "in esecuzione",
    cores: "core",
    containers_lc_one: "container",
    stacks_lc_one: "stack",
    images_lc_one: "immagine",
    updates_lc_one: "aggiornamento",
    cores_one: "core",
    online: "Online",
    offline: "Offline",
    update_available: "Aggiornamento disponibile",
    unhealthy: "Non integro",
    sync_error: "Errore sincro",
    restart: "Riavvia",
    stop: "Arresta",
    cancel: "Annulla",
    start_stop: "Avvia / arresta",
    confirm_restart: "Riavviare {name}?",
    confirm_stop: "Arrestare {name}?",
    all_ok: "Nulla da segnalare",
    no_env: "Nessun ambiente Docker trovato. L'integrazione Dockhand, Monitor Docker o Portainer è installata?",
    unknown_env: "Ambiente non trovato",
    no_registry: "Questa scheda richiede Home Assistant 2024.8 o successivo.",
    state_running: "In esecuzione",
    state_exited: "Arrestato",
    state_stopped: "Arrestato",
    state_partial: "Parziale",
    state_paused: "In pausa",
    state_restarting: "Riavvio in corso",
    state_created: "Creato",
    state_dead: "Morto",
    state_unavailable: "Non disponibile",
    state_unknown: "Sconosciuto",
    zoom_in: "Mostra la scheda completa",
    zoom_out: "Torna alla vista compatta",
    environment: "Ambiente",
    title: "Titolo (facoltativo, predefinito: nome dell'ambiente)",
    url: "URL aperto dal logo (facoltativo, rilevato dall'integrazione)",
    show_stats: "Mostra CPU, memoria e container",
    show_counts: "Mostra i contatori (stack, immagini…)",
    show_stacks: "Mostra gli stack",
    show_containers: "Mostra i container",
    show_controls: "Mostra i pulsanti avvia / arresta / riavvia",
    only_problems: "Elenca solo gli stack e i container che richiedono attenzione",
    expand_stacks: "Elenco degli stack espanso per impostazione predefinita",
    expand_containers: "Elenco dei container espanso per impostazione predefinita",
    show_updates: "Mostra gli aggiornamenti in sospeso",
    zoom: "Pulsante dettagli",
    zoom_helper: "Passa dalla mini scheda alla scheda completa e viceversa",
    language: "Lingua",
    lang_auto: "Automatica",
  },
  nl: {
    cpu: "CPU",
    memory: "Geheugen",
    containers: "Containers",
    stacks: "Stacks",
    images: "Images",
    volumes: "Volumes",
    networks: "Netwerken",
    updates: "Updates",
    container_lc: "container",
    containers_lc: "containers",
    stacks_lc: "stacks",
    images_lc: "images",
    updates_lc: "updates",
    running: "actief",
    cores: "cores",
    containers_lc_one: "container",
    stacks_lc_one: "stack",
    images_lc_one: "image",
    updates_lc_one: "update",
    cores_one: "core",
    online: "Online",
    offline: "Offline",
    update_available: "Update beschikbaar",
    unhealthy: "Ongezond",
    sync_error: "Syncfout",
    restart: "Herstarten",
    stop: "Stoppen",
    cancel: "Annuleren",
    start_stop: "Starten / stoppen",
    confirm_restart: "{name} herstarten?",
    confirm_stop: "{name} stoppen?",
    all_ok: "Niets te melden",
    no_env: "Geen Docker-omgeving gevonden. Is de Dockhand-, Monitor Docker- of Portainer-integratie geïnstalleerd?",
    unknown_env: "Omgeving niet gevonden",
    no_registry: "Deze kaart vereist Home Assistant 2024.8 of nieuwer.",
    state_running: "Actief",
    state_exited: "Gestopt",
    state_stopped: "Gestopt",
    state_partial: "Gedeeltelijk",
    state_paused: "Gepauzeerd",
    state_restarting: "Bezig met herstarten",
    state_created: "Aangemaakt",
    state_dead: "Dood",
    state_unavailable: "Niet beschikbaar",
    state_unknown: "Onbekend",
    zoom_in: "Volledige kaart tonen",
    zoom_out: "Terug naar de compacte weergave",
    environment: "Omgeving",
    title: "Titel (optioneel, standaard de naam van de omgeving)",
    url: "URL die het logo opent (optioneel, gedetecteerd via de integratie)",
    show_stats: "CPU, geheugen en containers tonen",
    show_counts: "Tellers tonen (stacks, images…)",
    show_stacks: "Stacks tonen",
    show_containers: "Containers tonen",
    show_controls: "Knoppen starten / stoppen / herstarten tonen",
    only_problems: "Alleen stacks en containers tonen die aandacht nodig hebben",
    expand_stacks: "Lijst met stacks standaard uitgevouwen",
    expand_containers: "Lijst met containers standaard uitgevouwen",
    show_updates: "Openstaande updates tonen",
    zoom: "Detailknop",
    zoom_helper: "Schakelt de minikaart om naar de volledige kaart en terug",
    language: "Taal",
    lang_auto: "Automatisch",
  },
  pt: {
    cpu: "CPU",
    memory: "Memória",
    containers: "Contentores",
    stacks: "Stacks",
    images: "Imagens",
    volumes: "Volumes",
    networks: "Redes",
    updates: "Atualiz.",
    container_lc: "contentor",
    containers_lc: "contentores",
    stacks_lc: "stacks",
    images_lc: "imagens",
    updates_lc: "atualizações",
    running: "em execução",
    cores: "núcleos",
    containers_lc_one: "contentor",
    stacks_lc_one: "stack",
    images_lc_one: "imagem",
    updates_lc_one: "atualização",
    cores_one: "núcleo",
    online: "Online",
    offline: "Offline",
    update_available: "Atualização disponível",
    unhealthy: "Em mau estado",
    sync_error: "Erro de sincr.",
    restart: "Reiniciar",
    stop: "Parar",
    cancel: "Cancelar",
    start_stop: "Iniciar / parar",
    confirm_restart: "Reiniciar {name}?",
    confirm_stop: "Parar {name}?",
    all_ok: "Nada a assinalar",
    no_env: "Nenhum ambiente Docker encontrado. A integração Dockhand, Monitor Docker ou Portainer está instalada?",
    unknown_env: "Ambiente não encontrado",
    no_registry: "Este cartão requer o Home Assistant 2024.8 ou posterior.",
    state_running: "Em execução",
    state_exited: "Parado",
    state_stopped: "Parado",
    state_partial: "Parcial",
    state_paused: "Em pausa",
    state_restarting: "A reiniciar",
    state_created: "Criado",
    state_dead: "Morto",
    state_unavailable: "Indisponível",
    state_unknown: "Desconhecido",
    zoom_in: "Mostrar o cartão completo",
    zoom_out: "Voltar à vista compacta",
    environment: "Ambiente",
    title: "Título (opcional, por predefinição o nome do ambiente)",
    url: "URL aberto pelo logótipo (opcional, detetado a partir da integração)",
    show_stats: "Mostrar CPU, memória e contentores",
    show_counts: "Mostrar contadores (stacks, imagens…)",
    show_stacks: "Mostrar os stacks",
    show_containers: "Mostrar os contentores",
    show_controls: "Mostrar os botões iniciar / parar / reiniciar",
    only_problems: "Listar apenas os stacks e os contentores que requerem atenção",
    expand_stacks: "Lista de stacks expandida por predefinição",
    expand_containers: "Lista de contentores expandida por predefinição",
    show_updates: "Mostrar as atualizações pendentes",
    zoom: "Botão de detalhe",
    zoom_helper: "Alterna entre o mini cartão e o cartão completo",
    language: "Idioma",
    lang_auto: "Automático",
  },
  pl: {
    cpu: "CPU",
    memory: "Pamięć",
    containers: "Kontenery",
    stacks: "Stosy",
    images: "Obrazy",
    volumes: "Woluminy",
    networks: "Sieci",
    updates: "Aktualiz.",
    container_lc: "kontener",
    containers_lc: "kontenerów",
    stacks_lc: "stosów",
    images_lc: "obrazów",
    updates_lc: "aktualizacji",
    // Plural forms picked by Intl.PluralRules (one / few / many); the key without suffix is the fallback.
    containers_lc_one: "kontener",
    containers_lc_few: "kontenery",
    containers_lc_many: "kontenerów",
    stacks_lc_one: "stos",
    stacks_lc_few: "stosy",
    stacks_lc_many: "stosów",
    images_lc_one: "obraz",
    images_lc_few: "obrazy",
    images_lc_many: "obrazów",
    updates_lc_one: "aktualizacja",
    updates_lc_few: "aktualizacje",
    updates_lc_many: "aktualizacji",
    running: "uruchomione",
    cores: "rdzeni",
    cores_one: "rdzeń",
    cores_few: "rdzenie",
    cores_many: "rdzeni",
    online: "Online",
    offline: "Offline",
    update_available: "Dostępna aktualizacja",
    unhealthy: "Niesprawny",
    sync_error: "Błąd synchr.",
    restart: "Uruchom ponownie",
    stop: "Zatrzymaj",
    cancel: "Anuluj",
    start_stop: "Uruchom / zatrzymaj",
    confirm_restart: "Uruchomić ponownie {name}?",
    confirm_stop: "Zatrzymać {name}?",
    all_ok: "Wszystko w porządku",
    no_env: "Nie znaleziono środowiska Docker. Czy integracja Dockhand, Monitor Docker lub Portainer jest zainstalowana?",
    unknown_env: "Nie znaleziono środowiska",
    no_registry: "Ta karta wymaga Home Assistant 2024.8 lub nowszego.",
    state_running: "Uruchomiony",
    state_exited: "Zatrzymany",
    state_stopped: "Zatrzymany",
    state_partial: "Częściowy",
    state_paused: "Wstrzymany",
    state_restarting: "Ponowne uruchamianie",
    state_created: "Utworzony",
    state_dead: "Martwy",
    state_unavailable: "Niedostępny",
    state_unknown: "Nieznany",
    zoom_in: "Pokaż pełną kartę",
    zoom_out: "Wróć do widoku kompaktowego",
    environment: "Środowisko",
    title: "Tytuł (opcjonalnie, domyślnie nazwa środowiska)",
    url: "URL otwierany przez logo (opcjonalnie, wykrywany z integracji)",
    show_stats: "Pokaż CPU, pamięć i kontenery",
    show_counts: "Pokaż liczniki (stosy, obrazy…)",
    show_stacks: "Pokaż stosy",
    show_containers: "Pokaż kontenery",
    show_controls: "Pokaż przyciski uruchom / zatrzymaj / uruchom ponownie",
    only_problems: "Pokaż tylko stosy i kontenery wymagające uwagi",
    expand_stacks: "Lista stosów domyślnie rozwinięta",
    expand_containers: "Lista kontenerów domyślnie rozwinięta",
    show_updates: "Pokaż oczekujące aktualizacje",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przełącza mini kartę na pełną kartę i z powrotem",
    language: "Język",
    lang_auto: "Automatycznie",
  },
  ro: {
    cpu: "CPU",
    memory: "Memorie",
    containers: "Containere",
    stacks: "Stive",
    images: "Imagini",
    volumes: "Volume",
    networks: "Rețele",
    updates: "Actualizări",
    container_lc: "container",
    containers_lc: "containere",
    stacks_lc: "stive",
    images_lc: "imagini",
    updates_lc: "actualizări",
    running: "pornite",
    cores: "nuclee",
    // Plural forms picked by Intl.PluralRules (one / few / other: "20 de containere"); the key without
    // suffix is the fallback (a count that is not a number).
    containers_lc_one: "container",
    containers_lc_few: "containere",
    containers_lc_other: "de containere",
    stacks_lc_one: "stivă",
    stacks_lc_few: "stive",
    stacks_lc_other: "de stive",
    images_lc_one: "imagine",
    images_lc_few: "imagini",
    images_lc_other: "de imagini",
    updates_lc_one: "actualizare",
    updates_lc_few: "actualizări",
    updates_lc_other: "de actualizări",
    cores_one: "nucleu",
    cores_few: "nuclee",
    cores_other: "de nuclee",
    online: "Online",
    offline: "Offline",
    update_available: "Actualizare disponibilă",
    unhealthy: "Nesănătos",
    sync_error: "Eroare sincr.",
    restart: "Repornește",
    stop: "Oprește",
    cancel: "Anulează",
    start_stop: "Pornește / oprește",
    confirm_restart: "Reporniți {name}?",
    confirm_stop: "Opriți {name}?",
    all_ok: "Nimic de semnalat",
    no_env: "Nu a fost găsit niciun mediu Docker. Este instalată integrarea Dockhand, Monitor Docker sau Portainer?",
    unknown_env: "Mediul nu a fost găsit",
    no_registry: "Acest card necesită Home Assistant 2024.8 sau o versiune ulterioară.",
    state_running: "Pornit",
    state_exited: "Oprit",
    state_stopped: "Oprit",
    state_partial: "Parțial",
    state_paused: "În pauză",
    state_restarting: "Se repornește",
    state_created: "Creat",
    state_dead: "Mort",
    state_unavailable: "Indisponibil",
    state_unknown: "Necunoscut",
    zoom_in: "Afișează cardul complet",
    zoom_out: "Înapoi la vizualizarea compactă",
    environment: "Mediu",
    title: "Titlu (opțional, implicit numele mediului)",
    url: "URL deschis de logo (opțional, detectat din integrare)",
    show_stats: "Afișează CPU, memoria și containerele",
    show_counts: "Afișează contoarele (stive, imagini…)",
    show_stacks: "Afișează stivele",
    show_containers: "Afișează containerele",
    show_controls: "Afișează butoanele pornește / oprește / repornește",
    only_problems: "Listează doar stivele și containerele care necesită atenție",
    expand_stacks: "Lista stivelor extinsă implicit",
    expand_containers: "Lista containerelor extinsă implicit",
    show_updates: "Afișează actualizările în așteptare",
    zoom: "Buton de detalii",
    zoom_helper: "Comută mini cardul la cardul complet și înapoi",
    language: "Limbă",
    lang_auto: "Automat",
  },
  da: {
    cpu: "CPU",
    memory: "Hukommelse",
    containers: "Containere",
    stacks: "Stakke",
    images: "Images",
    volumes: "Volumener",
    networks: "Netværk",
    updates: "Opdat.",
    container_lc: "container",
    containers_lc: "containere",
    stacks_lc: "stakke",
    images_lc: "images",
    updates_lc: "opdateringer",
    running: "kører",
    cores: "kerner",
    containers_lc_one: "container",
    stacks_lc_one: "stak",
    images_lc_one: "image",
    updates_lc_one: "opdatering",
    cores_one: "kerne",
    online: "Online",
    offline: "Offline",
    update_available: "Opdatering tilgængelig",
    unhealthy: "Usund",
    sync_error: "Synkroniseringsfejl",
    restart: "Genstart",
    stop: "Stop",
    cancel: "Annuller",
    start_stop: "Start / stop",
    confirm_restart: "Genstart {name}?",
    confirm_stop: "Stop {name}?",
    all_ok: "Intet at rapportere",
    no_env: "Der blev ikke fundet noget Docker-miljø. Er Dockhand-, Monitor Docker- eller Portainer-integrationen installeret?",
    unknown_env: "Miljøet blev ikke fundet",
    no_registry: "Dette kort kræver Home Assistant 2024.8 eller nyere.",
    state_running: "Kører",
    state_exited: "Stoppet",
    state_stopped: "Stoppet",
    state_partial: "Delvis",
    state_paused: "På pause",
    state_restarting: "Genstarter",
    state_created: "Oprettet",
    state_dead: "Død",
    state_unavailable: "Utilgængelig",
    state_unknown: "Ukendt",
    zoom_in: "Vis hele kortet",
    zoom_out: "Tilbage til kompakt visning",
    environment: "Miljø",
    title: "Titel (valgfri, som standard miljøets navn)",
    url: "URL, der åbnes af logoet (valgfri, hentes fra integrationen)",
    show_stats: "Vis CPU, hukommelse og containere",
    show_counts: "Vis tællere (stakke, images…)",
    show_stacks: "Vis stakke",
    show_containers: "Vis containere",
    show_controls: "Vis knapperne start / stop / genstart",
    only_problems: "Vis kun stakke og containere, der kræver opmærksomhed",
    expand_stacks: "Listen over stakke er udvidet som standard",
    expand_containers: "Listen over containere er udvidet som standard",
    show_updates: "Vis ventende opdateringer",
    zoom: "Detaljeknap",
    zoom_helper: "Skifter fra minikortet til hele kortet og tilbage",
    language: "Sprog",
    lang_auto: "Automatisk",
  },
  sv: {
    cpu: "CPU",
    memory: "Minne",
    containers: "Containrar",
    stacks: "Stackar",
    images: "Avbildningar",
    volumes: "Volymer",
    networks: "Nätverk",
    updates: "Uppdat.",
    container_lc: "container",
    containers_lc: "containrar",
    stacks_lc: "stackar",
    images_lc: "avbildningar",
    updates_lc: "uppdateringar",
    running: "körs",
    cores: "kärnor",
    containers_lc_one: "container",
    stacks_lc_one: "stack",
    images_lc_one: "avbildning",
    updates_lc_one: "uppdatering",
    cores_one: "kärna",
    online: "Online",
    offline: "Offline",
    update_available: "Uppdatering tillgänglig",
    unhealthy: "Ohälsosam",
    sync_error: "Synkfel",
    restart: "Starta om",
    stop: "Stoppa",
    cancel: "Avbryt",
    start_stop: "Starta / stoppa",
    confirm_restart: "Starta om {name}?",
    confirm_stop: "Stoppa {name}?",
    all_ok: "Inget att rapportera",
    no_env: "Ingen Docker-miljö hittades. Är integrationen Dockhand, Monitor Docker eller Portainer installerad?",
    unknown_env: "Miljön hittades inte",
    no_registry: "Det här kortet kräver Home Assistant 2024.8 eller senare.",
    state_running: "Körs",
    state_exited: "Stoppad",
    state_stopped: "Stoppad",
    state_partial: "Delvis",
    state_paused: "Pausad",
    state_restarting: "Startar om",
    state_created: "Skapad",
    state_dead: "Död",
    state_unavailable: "Ej tillgänglig",
    state_unknown: "Okänd",
    zoom_in: "Visa hela kortet",
    zoom_out: "Tillbaka till kompakt vy",
    environment: "Miljö",
    title: "Titel (valfri, standard är miljöns namn)",
    url: "URL som öppnas av logotypen (valfri, hämtas från integrationen)",
    show_stats: "Visa CPU, minne och containrar",
    show_counts: "Visa räknare (stackar, avbildningar…)",
    show_stacks: "Visa stackar",
    show_containers: "Visa containrar",
    show_controls: "Visa knapparna starta / stoppa / starta om",
    only_problems: "Lista bara stackar och containrar som behöver uppmärksamhet",
    expand_stacks: "Listan över stackar expanderad som standard",
    expand_containers: "Listan över containrar expanderad som standard",
    show_updates: "Visa väntande uppdateringar",
    zoom: "Detaljknapp",
    zoom_helper: "Växlar från minikortet till hela kortet och tillbaka",
    language: "Språk",
    lang_auto: "Automatiskt",
  },
  bg: {
    cpu: "CPU",
    memory: "Памет",
    containers: "Контейнери",
    stacks: "Стекове",
    images: "Образи",
    volumes: "Томове",
    networks: "Мрежи",
    updates: "Актуализ.",
    container_lc: "контейнер",
    // Counted form after a number ("5 контейнера"), also the fallback.
    containers_lc: "контейнера",
    stacks_lc: "стека",
    images_lc: "образа",
    updates_lc: "актуализации",
    running: "работещи",
    cores: "ядра",
    containers_lc_one: "контейнер",
    stacks_lc_one: "стек",
    images_lc_one: "образ",
    updates_lc_one: "актуализация",
    cores_one: "ядро",
    online: "На линия",
    offline: "Извън линия",
    update_available: "Налична актуализация",
    unhealthy: "Неизправен",
    sync_error: "Грешка при синхр.",
    restart: "Рестартирай",
    stop: "Спри",
    cancel: "Отказ",
    start_stop: "Стартирай / спри",
    confirm_restart: "Рестартиране на {name}?",
    confirm_stop: "Спиране на {name}?",
    all_ok: "Всичко е наред",
    no_env: "Не е намерена Docker среда. Инсталирана ли е интеграцията Dockhand, Monitor Docker или Portainer?",
    unknown_env: "Средата не е намерена",
    no_registry: "Тази карта изисква Home Assistant 2024.8 или по-нова версия.",
    state_running: "Работи",
    state_exited: "Спрян",
    state_stopped: "Спрян",
    state_partial: "Частично",
    state_paused: "На пауза",
    state_restarting: "Рестартира се",
    state_created: "Създаден",
    state_dead: "Мъртъв",
    state_unavailable: "Недостъпен",
    state_unknown: "Неизвестен",
    zoom_in: "Покажи пълната карта",
    zoom_out: "Обратно към компактния изглед",
    environment: "Среда",
    title: "Заглавие (по избор, по подразбиране името на средата)",
    url: "URL, отварян от логото (по избор, взема се от интеграцията)",
    show_stats: "Покажи CPU, памет и контейнери",
    show_counts: "Покажи броячите (стекове, образи…)",
    show_stacks: "Покажи стековете",
    show_containers: "Покажи контейнерите",
    show_controls: "Покажи бутоните стартирай / спри / рестартирай",
    only_problems: "Показвай само стековете и контейнерите, които изискват внимание",
    expand_stacks: "Списъкът със стекове е разгънат по подразбиране",
    expand_containers: "Списъкът с контейнери е разгънат по подразбиране",
    show_updates: "Покажи чакащите актуализации",
    zoom: "Бутон за подробности",
    zoom_helper: "Превключва от мини картата към пълната карта и обратно",
    language: "Език",
    lang_auto: "Автоматично",
  },
  ru: {
    cpu: "CPU",
    memory: "Память",
    containers: "Контейнеры",
    stacks: "Стеки",
    images: "Образы",
    volumes: "Тома",
    networks: "Сети",
    updates: "Обновл.",
    container_lc: "контейнер",
    containers_lc: "контейнеров",
    stacks_lc: "стеков",
    images_lc: "образов",
    updates_lc: "обновлений",
    running: "запущено",
    cores: "ядер",
    // Plural forms picked by Intl.PluralRules (one / few / many); the key without suffix is the fallback.
    containers_lc_one: "контейнер",
    containers_lc_few: "контейнера",
    containers_lc_many: "контейнеров",
    stacks_lc_one: "стек",
    stacks_lc_few: "стека",
    stacks_lc_many: "стеков",
    images_lc_one: "образ",
    images_lc_few: "образа",
    images_lc_many: "образов",
    updates_lc_one: "обновление",
    updates_lc_few: "обновления",
    updates_lc_many: "обновлений",
    cores_one: "ядро",
    cores_few: "ядра",
    cores_many: "ядер",
    online: "В сети",
    offline: "Не в сети",
    update_available: "Доступно обновление",
    unhealthy: "Неисправен",
    sync_error: "Ошибка синхр.",
    restart: "Перезапустить",
    stop: "Остановить",
    cancel: "Отмена",
    start_stop: "Запустить / остановить",
    confirm_restart: "Перезапустить {name}?",
    confirm_stop: "Остановить {name}?",
    all_ok: "Всё в порядке",
    no_env: "Среда Docker не найдена. Установлена ли интеграция Dockhand, Monitor Docker или Portainer?",
    unknown_env: "Среда не найдена",
    no_registry: "Для этой карточки требуется Home Assistant 2024.8 или новее.",
    state_running: "Запущен",
    state_exited: "Остановлен",
    state_stopped: "Остановлен",
    state_partial: "Частично",
    state_paused: "Приостановлен",
    state_restarting: "Перезапускается",
    state_created: "Создан",
    state_dead: "Мёртвый",
    state_unavailable: "Недоступен",
    state_unknown: "Неизвестен",
    zoom_in: "Показать полную карточку",
    zoom_out: "Вернуться к компактному виду",
    environment: "Среда",
    title: "Заголовок (необязательно, по умолчанию имя среды)",
    url: "URL, открываемый логотипом (необязательно, определяется из интеграции)",
    show_stats: "Показывать CPU, память и контейнеры",
    show_counts: "Показывать счётчики (стеки, образы…)",
    show_stacks: "Показывать стеки",
    show_containers: "Показывать контейнеры",
    show_controls: "Показывать кнопки запуска / остановки / перезапуска",
    only_problems: "Показывать только стеки и контейнеры, требующие внимания",
    expand_stacks: "Список стеков развёрнут по умолчанию",
    expand_containers: "Список контейнеров развёрнут по умолчанию",
    show_updates: "Показывать ожидающие обновления",
    zoom: "Кнопка подробностей",
    zoom_helper: "Переключает мини-карточку на полную карточку и обратно",
    language: "Язык",
    lang_auto: "Автоматически",
  },
  uk: {
    cpu: "CPU",
    memory: "Пам'ять",
    containers: "Контейнери",
    stacks: "Стеки",
    images: "Образи",
    volumes: "Томи",
    networks: "Мережі",
    updates: "Оновлення",
    container_lc: "контейнер",
    containers_lc: "контейнерів",
    stacks_lc: "стеків",
    images_lc: "образів",
    updates_lc: "оновлень",
    running: "запущено",
    cores: "ядер",
    // Plural forms picked by Intl.PluralRules (one / few / many); the key without suffix is the fallback.
    containers_lc_one: "контейнер",
    containers_lc_few: "контейнери",
    containers_lc_many: "контейнерів",
    stacks_lc_one: "стек",
    stacks_lc_few: "стеки",
    stacks_lc_many: "стеків",
    images_lc_one: "образ",
    images_lc_few: "образи",
    images_lc_many: "образів",
    updates_lc_one: "оновлення",
    updates_lc_few: "оновлення",
    updates_lc_many: "оновлень",
    cores_one: "ядро",
    cores_few: "ядра",
    cores_many: "ядер",
    online: "В мережі",
    offline: "Не в мережі",
    update_available: "Доступне оновлення",
    unhealthy: "Несправний",
    sync_error: "Помилка синхр.",
    restart: "Перезапустити",
    stop: "Зупинити",
    cancel: "Скасувати",
    start_stop: "Запустити / зупинити",
    confirm_restart: "Перезапустити {name}?",
    confirm_stop: "Зупинити {name}?",
    all_ok: "Усе гаразд",
    no_env: "Середовище Docker не знайдено. Чи встановлено інтеграцію Dockhand, Monitor Docker або Portainer?",
    unknown_env: "Середовище не знайдено",
    no_registry: "Ця картка потребує Home Assistant 2024.8 або новішої версії.",
    state_running: "Запущений",
    state_exited: "Зупинений",
    state_stopped: "Зупинений",
    state_partial: "Частково",
    state_paused: "Призупинений",
    state_restarting: "Перезапускається",
    state_created: "Створений",
    state_dead: "Мертвий",
    state_unavailable: "Недоступно",
    state_unknown: "Невідомо",
    zoom_in: "Показати повну картку",
    zoom_out: "Назад до компактного вигляду",
    environment: "Середовище",
    title: "Заголовок (необов'язково, за замовчуванням назва середовища)",
    url: "URL, який відкриває логотип (необов'язково, визначається з інтеграції)",
    show_stats: "Показувати CPU, пам'ять і контейнери",
    show_counts: "Показувати лічильники (стеки, образи…)",
    show_stacks: "Показувати стеки",
    show_containers: "Показувати контейнери",
    show_controls: "Показувати кнопки запуску / зупинки / перезапуску",
    only_problems: "Показувати лише стеки й контейнери, що потребують уваги",
    expand_stacks: "Список стеків розгорнуто за замовчуванням",
    expand_containers: "Список контейнерів розгорнуто за замовчуванням",
    show_updates: "Показувати очікувані оновлення",
    zoom: "Кнопка подробиць",
    zoom_helper: "Перемикає мінікартку на повну картку й назад",
    language: "Мова",
    lang_auto: "Автоматично",
  },
  hu: {
    cpu: "CPU",
    memory: "Memória",
    containers: "Konténerek",
    stacks: "Stackek",
    images: "Lemezképek",
    volumes: "Kötetek",
    networks: "Hálózatok",
    updates: "Frissítések",
    // Hungarian keeps the singular after a number ("5 konténer").
    container_lc: "konténer",
    containers_lc: "konténer",
    stacks_lc: "stack",
    images_lc: "lemezkép",
    updates_lc: "frissítés",
    running: "futó",
    cores: "mag",
    online: "Online",
    offline: "Offline",
    update_available: "Frissítés érhető el",
    unhealthy: "Nem egészséges",
    sync_error: "Szinkr. hiba",
    restart: "Újraindítás",
    stop: "Leállítás",
    cancel: "Mégse",
    start_stop: "Indítás / leállítás",
    confirm_restart: "{name} újraindítása?",
    confirm_stop: "{name} leállítása?",
    all_ok: "Nincs jelentenivaló",
    no_env: "Nem található Docker-környezet. Telepítve van a Dockhand, a Monitor Docker vagy a Portainer integráció?",
    unknown_env: "A környezet nem található",
    no_registry: "Ehhez a kártyához Home Assistant 2024.8 vagy újabb szükséges.",
    state_running: "Fut",
    state_exited: "Leállítva",
    state_stopped: "Leállítva",
    state_partial: "Részleges",
    state_paused: "Szüneteltetve",
    state_restarting: "Újraindul",
    state_created: "Létrehozva",
    state_dead: "Halott",
    state_unavailable: "Elérhetetlen",
    state_unknown: "Ismeretlen",
    zoom_in: "Teljes kártya megjelenítése",
    zoom_out: "Vissza a kompakt nézethez",
    environment: "Környezet",
    title: "Cím (nem kötelező, alapértelmezés szerint a környezet neve)",
    url: "A logó által megnyitott URL (nem kötelező, az integrációból észlelve)",
    show_stats: "CPU, memória és konténerek megjelenítése",
    show_counts: "Számlálók megjelenítése (stackek, lemezképek…)",
    show_stacks: "Stackek megjelenítése",
    show_containers: "Konténerek megjelenítése",
    show_controls: "Indítás / leállítás / újraindítás gombok megjelenítése",
    only_problems: "Csak a figyelmet igénylő stackek és konténerek listázása",
    expand_stacks: "A stackek listája alapértelmezés szerint kibontva",
    expand_containers: "A konténerek listája alapértelmezés szerint kibontva",
    show_updates: "Függőben lévő frissítések megjelenítése",
    zoom: "Részletek gomb",
    zoom_helper: "Vált a mini kártya és a teljes kártya között",
    language: "Nyelv",
    lang_auto: "Automatikus",
  },
  sk: {
    cpu: "CPU",
    memory: "Pamäť",
    containers: "Kontajnery",
    stacks: "Zásobníky",
    images: "Obrazy",
    volumes: "Zväzky",
    networks: "Siete",
    updates: "Aktualiz.",
    container_lc: "kontajner",
    containers_lc: "kontajnerov",
    stacks_lc: "zásobníkov",
    images_lc: "obrazov",
    updates_lc: "aktualizácií",
    running: "spustené",
    cores: "jadier",
    // Plural forms picked by Intl.PluralRules (one / few); the key without suffix is the fallback (5+).
    containers_lc_one: "kontajner",
    containers_lc_few: "kontajnery",
    stacks_lc_one: "zásobník",
    stacks_lc_few: "zásobníky",
    images_lc_one: "obraz",
    images_lc_few: "obrazy",
    updates_lc_one: "aktualizácia",
    updates_lc_few: "aktualizácie",
    cores_one: "jadro",
    cores_few: "jadrá",
    online: "Online",
    offline: "Offline",
    update_available: "Dostupná aktualizácia",
    unhealthy: "Nezdravý",
    sync_error: "Chyba synchr.",
    restart: "Reštartovať",
    stop: "Zastaviť",
    cancel: "Zrušiť",
    start_stop: "Spustiť / zastaviť",
    confirm_restart: "Reštartovať {name}?",
    confirm_stop: "Zastaviť {name}?",
    all_ok: "Všetko v poriadku",
    no_env: "Nenašlo sa žiadne prostredie Docker. Je nainštalovaná integrácia Dockhand, Monitor Docker alebo Portainer?",
    unknown_env: "Prostredie sa nenašlo",
    no_registry: "Táto karta vyžaduje Home Assistant 2024.8 alebo novší.",
    state_running: "Beží",
    state_exited: "Zastavený",
    state_stopped: "Zastavený",
    state_partial: "Čiastočne",
    state_paused: "Pozastavený",
    state_restarting: "Reštartuje sa",
    state_created: "Vytvorený",
    state_dead: "Mŕtvy",
    state_unavailable: "Nedostupný",
    state_unknown: "Neznámy",
    zoom_in: "Zobraziť celú kartu",
    zoom_out: "Späť na kompaktné zobrazenie",
    environment: "Prostredie",
    title: "Názov (voliteľné, predvolene názov prostredia)",
    url: "URL otváraná logom (voliteľné, zistí sa z integrácie)",
    show_stats: "Zobraziť CPU, pamäť a kontajnery",
    show_counts: "Zobraziť počítadlá (zásobníky, obrazy…)",
    show_stacks: "Zobraziť zásobníky",
    show_containers: "Zobraziť kontajnery",
    show_controls: "Zobraziť tlačidlá spustiť / zastaviť / reštartovať",
    only_problems: "Zobraziť len zásobníky a kontajnery vyžadujúce pozornosť",
    expand_stacks: "Zoznam zásobníkov predvolene rozbalený",
    expand_containers: "Zoznam kontajnerov predvolene rozbalený",
    show_updates: "Zobraziť čakajúce aktualizácie",
    zoom: "Tlačidlo podrobností",
    zoom_helper: "Prepína mini kartu na celú kartu a späť",
    language: "Jazyk",
    lang_auto: "Automaticky",
  },
  cs: {
    cpu: "CPU",
    memory: "Paměť",
    containers: "Kontejnery",
    stacks: "Zásobníky",
    images: "Obrazy",
    volumes: "Svazky",
    networks: "Sítě",
    updates: "Aktualizace",
    container_lc: "kontejner",
    containers_lc: "kontejnerů",
    stacks_lc: "zásobníků",
    images_lc: "obrazů",
    updates_lc: "aktualizací",
    running: "spuštěno",
    cores: "jader",
    // Plural forms picked by Intl.PluralRules (one / few); the key without suffix is the fallback (5+).
    containers_lc_one: "kontejner",
    containers_lc_few: "kontejnery",
    stacks_lc_one: "zásobník",
    stacks_lc_few: "zásobníky",
    images_lc_one: "obraz",
    images_lc_few: "obrazy",
    updates_lc_one: "aktualizace",
    updates_lc_few: "aktualizace",
    cores_one: "jádro",
    cores_few: "jádra",
    online: "Online",
    offline: "Offline",
    update_available: "Dostupná aktualizace",
    unhealthy: "Nezdravý",
    sync_error: "Chyba synchr.",
    restart: "Restartovat",
    stop: "Zastavit",
    cancel: "Zrušit",
    start_stop: "Spustit / zastavit",
    confirm_restart: "Restartovat {name}?",
    confirm_stop: "Zastavit {name}?",
    all_ok: "Vše v pořádku",
    no_env: "Nebylo nalezeno žádné prostředí Docker. Je nainstalována integrace Dockhand, Monitor Docker nebo Portainer?",
    unknown_env: "Prostředí nebylo nalezeno",
    no_registry: "Tato karta vyžaduje Home Assistant 2024.8 nebo novější.",
    state_running: "Běží",
    state_exited: "Zastaven",
    state_stopped: "Zastaven",
    state_partial: "Částečně",
    state_paused: "Pozastaven",
    state_restarting: "Restartuje se",
    state_created: "Vytvořen",
    state_dead: "Mrtvý",
    state_unavailable: "Nedostupný",
    state_unknown: "Neznámý",
    zoom_in: "Zobrazit celou kartu",
    zoom_out: "Zpět na kompaktní zobrazení",
    environment: "Prostředí",
    title: "Název (volitelné, výchozí je název prostředí)",
    url: "URL otevíraná logem (volitelné, zjistí se z integrace)",
    show_stats: "Zobrazit CPU, paměť a kontejnery",
    show_counts: "Zobrazit počítadla (zásobníky, obrazy…)",
    show_stacks: "Zobrazit zásobníky",
    show_containers: "Zobrazit kontejnery",
    show_controls: "Zobrazit tlačítka spustit / zastavit / restartovat",
    only_problems: "Zobrazit jen zásobníky a kontejnery vyžadující pozornost",
    expand_stacks: "Seznam zásobníků ve výchozím stavu rozbalený",
    expand_containers: "Seznam kontejnerů ve výchozím stavu rozbalený",
    show_updates: "Zobrazit čekající aktualizace",
    zoom: "Tlačítko podrobností",
    zoom_helper: "Přepíná mini kartu na celou kartu a zpět",
    language: "Jazyk",
    lang_auto: "Automaticky",
  },
  sl: {
    cpu: "CPU",
    memory: "Pomnilnik",
    containers: "Vsebniki",
    stacks: "Skladi",
    images: "Slike",
    volumes: "Nosilci",
    networks: "Omrežja",
    updates: "Posodobitve",
    container_lc: "vsebnik",
    containers_lc: "vsebnikov",
    stacks_lc: "skladov",
    images_lc: "slik",
    updates_lc: "posodobitev",
    running: "zagnani",
    cores: "jeder",
    // Plural forms picked by Intl.PluralRules (one / two / few); the key without suffix is the fallback (5+).
    containers_lc_one: "vsebnik",
    containers_lc_two: "vsebnika",
    containers_lc_few: "vsebniki",
    stacks_lc_one: "sklad",
    stacks_lc_two: "sklada",
    stacks_lc_few: "skladi",
    images_lc_one: "slika",
    images_lc_two: "sliki",
    images_lc_few: "slike",
    updates_lc_one: "posodobitev",
    updates_lc_two: "posodobitvi",
    updates_lc_few: "posodobitve",
    cores_one: "jedro",
    cores_two: "jedri",
    cores_few: "jedra",
    online: "Na spletu",
    offline: "Brez povezave",
    update_available: "Na voljo je posodobitev",
    unhealthy: "Nezdrav",
    sync_error: "Napaka sinhr.",
    restart: "Znova zaženi",
    stop: "Ustavi",
    cancel: "Prekliči",
    start_stop: "Zaženi / ustavi",
    confirm_restart: "Želite znova zagnati {name}?",
    confirm_stop: "Želite ustaviti {name}?",
    all_ok: "Ni posebnosti",
    no_env: "Ni bilo mogoče najti nobenega okolja Docker. Ali je integracija Dockhand, Monitor Docker ali Portainer nameščena?",
    unknown_env: "Okolja ni bilo mogoče najti",
    no_registry: "Ta kartica zahteva Home Assistant 2024.8 ali novejši.",
    state_running: "Se izvaja",
    state_exited: "Ustavljen",
    state_stopped: "Ustavljen",
    state_partial: "Delno",
    state_paused: "Začasno ustavljen",
    state_restarting: "Ponovni zagon",
    state_created: "Ustvarjen",
    state_dead: "Mrtev",
    state_unavailable: "Ni na voljo",
    state_unknown: "Neznano",
    zoom_in: "Prikaži celotno kartico",
    zoom_out: "Nazaj na strnjen pogled",
    environment: "Okolje",
    title: "Naslov (neobvezno, privzeto ime okolja)",
    url: "URL, ki ga odpre logotip (neobvezno, pridobljen iz integracije)",
    show_stats: "Prikaži CPU, pomnilnik in vsebnike",
    show_counts: "Prikaži števce (skladi, slike…)",
    show_stacks: "Prikaži sklade",
    show_containers: "Prikaži vsebnike",
    show_controls: "Prikaži gumbe zaženi / ustavi / znova zaženi",
    only_problems: "Prikaži samo sklade in vsebnike, ki zahtevajo pozornost",
    expand_stacks: "Seznam skladov privzeto razširjen",
    expand_containers: "Seznam vsebnikov privzeto razširjen",
    show_updates: "Prikaži čakajoče posodobitve",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Preklopi z mini kartice na celotno kartico in nazaj",
    language: "Jezik",
    lang_auto: "Samodejno",
  },
  lv: {
    cpu: "CPU",
    memory: "Atmiņa",
    containers: "Konteineri",
    stacks: "Steki",
    images: "Attēli",
    volumes: "Sējumi",
    networks: "Tīkli",
    updates: "Atjaunin.",
    container_lc: "konteiners",
    containers_lc: "konteineri",
    stacks_lc: "steki",
    images_lc: "attēli",
    updates_lc: "atjauninājumi",
    running: "darbojas",
    cores: "kodoli",
    // Plural forms picked by Intl.PluralRules: the singular for one (1, 21, 31…), the plural for zero
    // (0, 10–20, 30…) and other; the key without suffix is the fallback.
    containers_lc_one: "konteiners",
    containers_lc_zero: "konteineri",
    stacks_lc_one: "steks",
    stacks_lc_zero: "steki",
    images_lc_one: "attēls",
    images_lc_zero: "attēli",
    updates_lc_one: "atjauninājums",
    updates_lc_zero: "atjauninājumi",
    cores_one: "kodols",
    cores_zero: "kodoli",
    online: "Tiešsaistē",
    offline: "Bezsaistē",
    update_available: "Pieejams atjauninājums",
    unhealthy: "Nevesels",
    sync_error: "Sinhr. kļūda",
    restart: "Restartēt",
    stop: "Apturēt",
    cancel: "Atcelt",
    start_stop: "Startēt / apturēt",
    confirm_restart: "Restartēt {name}?",
    confirm_stop: "Apturēt {name}?",
    all_ok: "Nav ko ziņot",
    no_env: "Nav atrasta neviena Docker vide. Vai ir instalēta Dockhand, Monitor Docker vai Portainer integrācija?",
    unknown_env: "Vide nav atrasta",
    no_registry: "Šai kartītei nepieciešams Home Assistant 2024.8 vai jaunāka versija.",
    state_running: "Darbojas",
    state_exited: "Apturēts",
    state_stopped: "Apturēts",
    state_partial: "Daļēji",
    state_paused: "Pauzēts",
    state_restarting: "Restartējas",
    state_created: "Izveidots",
    state_dead: "Miris",
    state_unavailable: "Nepieejams",
    state_unknown: "Nezināms",
    zoom_in: "Rādīt pilno kartīti",
    zoom_out: "Atpakaļ uz kompakto skatu",
    environment: "Vide",
    title: "Virsraksts (neobligāts, pēc noklusējuma vides nosaukums)",
    url: "URL, ko atver logotips (neobligāts, iegūts no integrācijas)",
    show_stats: "Rādīt CPU, atmiņu un konteinerus",
    show_counts: "Rādīt skaitītājus (steki, attēli…)",
    show_stacks: "Rādīt stekus",
    show_containers: "Rādīt konteinerus",
    show_controls: "Rādīt pogas startēt / apturēt / restartēt",
    only_problems: "Rādīt tikai stekus un konteinerus, kam nepieciešama uzmanība",
    expand_stacks: "Steku saraksts pēc noklusējuma izvērsts",
    expand_containers: "Konteineru saraksts pēc noklusējuma izvērsts",
    show_updates: "Rādīt gaidošos atjauninājumus",
    zoom: "Detaļu poga",
    zoom_helper: "Pārslēdz mini kartīti uz pilno kartīti un atpakaļ",
    language: "Valoda",
    lang_auto: "Automātiski",
  },
  el: {
    cpu: "CPU",
    memory: "Μνήμη",
    containers: "Κοντέινερ",
    stacks: "Στοίβες",
    images: "Εικόνες",
    volumes: "Τόμοι",
    networks: "Δίκτυα",
    updates: "Ενημερ.",
    container_lc: "κοντέινερ",
    containers_lc: "κοντέινερ",
    stacks_lc: "στοίβες",
    images_lc: "εικόνες",
    updates_lc: "ενημερώσεις",
    running: "σε λειτουργία",
    cores: "πυρήνες",
    containers_lc_one: "κοντέινερ",
    stacks_lc_one: "στοίβα",
    images_lc_one: "εικόνα",
    updates_lc_one: "ενημέρωση",
    cores_one: "πυρήνας",
    online: "Σε σύνδεση",
    offline: "Εκτός σύνδεσης",
    update_available: "Διαθέσιμη ενημέρωση",
    unhealthy: "Μη υγιές",
    sync_error: "Σφάλμα συγχρ.",
    restart: "Επανεκκίνηση",
    stop: "Διακοπή",
    cancel: "Ακύρωση",
    start_stop: "Εκκίνηση / διακοπή",
    // Greek question mark (;).
    confirm_restart: "Επανεκκίνηση του {name};",
    confirm_stop: "Διακοπή του {name};",
    all_ok: "Όλα εντάξει",
    no_env: "Δεν βρέθηκε περιβάλλον Docker. Είναι εγκατεστημένη η ενσωμάτωση Dockhand, Monitor Docker ή Portainer;",
    unknown_env: "Το περιβάλλον δεν βρέθηκε",
    no_registry: "Αυτή η κάρτα απαιτεί Home Assistant 2024.8 ή νεότερο.",
    state_running: "Σε λειτουργία",
    state_exited: "Σταματημένο",
    state_stopped: "Σταματημένο",
    state_partial: "Μερικώς",
    state_paused: "Σε παύση",
    state_restarting: "Επανεκκινείται",
    state_created: "Δημιουργήθηκε",
    state_dead: "Νεκρό",
    state_unavailable: "Μη διαθέσ.",
    state_unknown: "Άγνωστο",
    zoom_in: "Εμφάνιση πλήρους κάρτας",
    zoom_out: "Επιστροφή στη συμπαγή προβολή",
    environment: "Περιβάλλον",
    title: "Τίτλος (προαιρετικό, από προεπιλογή το όνομα του περιβάλλοντος)",
    url: "URL που ανοίγει το λογότυπο (προαιρετικό, εντοπίζεται από την ενσωμάτωση)",
    show_stats: "Εμφάνιση CPU, μνήμης και κοντέινερ",
    show_counts: "Εμφάνιση μετρητών (στοίβες, εικόνες…)",
    show_stacks: "Εμφάνιση στοιβών",
    show_containers: "Εμφάνιση κοντέινερ",
    show_controls: "Εμφάνιση κουμπιών εκκίνησης / διακοπής / επανεκκίνησης",
    only_problems: "Εμφάνιση μόνο των στοιβών και κοντέινερ που χρειάζονται προσοχή",
    expand_stacks: "Λίστα στοιβών ανεπτυγμένη από προεπιλογή",
    expand_containers: "Λίστα κοντέινερ ανεπτυγμένη από προεπιλογή",
    show_updates: "Εμφάνιση εκκρεμών ενημερώσεων",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Εναλλάσσει τη μίνι κάρτα με την πλήρη κάρτα και αντίστροφα",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = (config?.language) || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// Plural rules of a dictionary: pt is European Portuguese, where 0 takes the plural (Intl's "pt" is Brazilian).
const pluralLocale = (code) => (code === "pt" ? "pt-PT" : code);

// Counted noun ("4 cores"): the language's Intl.PluralRules form (key_one, key_few, key_many…) when the
// dictionary has it, else `oneKey` for 1 when given, else the key itself. A count that is not a number
// (null, a dash, "unavailable") keeps the key itself.
const tn = (hass, config, key, n, oneKey) => {
  const code = lang(hass, config);
  const v = n === null || n === undefined || n === "" ? Number.NaN : Number(n);
  if (Number.isFinite(v)) {
    const form = STRINGS[code][`${key}_${new Intl.PluralRules(pluralLocale(code)).select(v)}`];
    if (form) return form;
    if (v === 1 && oneKey) return t(hass, config, oneKey);
  }
  return t(hass, config, key);
};

const num = (s) => {
  if (!s) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

// Counter value as shown: a dash while the sensor is unknown or unavailable.
const countText = (s) => (!s || s.state === "unknown" || s.state === "unavailable" ? "—" : s.state);

const fmtBytes = (b) => {
  if (b === null || b === undefined || !Number.isFinite(Number(b))) return "—";
  b = Number(b);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  const v = b >= 100 || i === 0 ? b.toFixed(0) : b.toFixed(b >= 10 ? 1 : 2);
  return `${v.includes(".") ? v.replace(/\.?0+$/, "") : v} ${units[i]}`;
};

// "used / total" label: the unit of used is dropped only when it matches the total's.
const fmtBytesPair = (used, total) => {
  const u = fmtBytes(used);
  const t = fmtBytes(total);
  return `${u.split(" ")[1] === t.split(" ")[1] ? u.split(" ")[0] : u} / ${t}`;
};

// A data size state in bytes, whatever unit Home Assistant displays it in (Portainer suggests MB).
const UNIT_BYTES = { B: 1, kB: 1e3, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1048576, GiB: 1073741824, TiB: 1099511627776 };
const bytesOf = (s) => {
  const v = num(s);
  const k = UNIT_BYTES[s?.attributes?.unit_of_measurement ?? "B"];
  return v === null || !k ? null : v * k;
};

const level = (v, warn, crit) => (v === null ? "" : v >= crit ? "crit" : v >= warn ? "warn" : "ok");

// Status → color class for containers and stacks.
const stateClass = (state) => {
  switch (String(state || "").toLowerCase()) {
    case "running":
    case "healthy":
    case "synced":
      return "ok";
    case "partial":
    case "paused":
    case "restarting":
    case "starting":
    case "created":
    case "syncing":
    case "pending":
      return "warn";
    case "exited":
    case "stopped":
    case "dead":
    case "unhealthy":
    case "error":
      return "crit";
    default:
      return "idle";
  }
};

// Same values, compared by identity: used to skip a render when nothing the card shows has changed.
const sameSig = (a, b) => !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);

// Patch the shadow DOM in place from the new HTML: nodes whose tag is unchanged are kept, so keyboard
// focus, hover, embedded pictures and CSS transitions survive an update, and only the changed text and
// attributes are written. Rows of a list carry a data-key (their entity or row id) and are matched by it,
// wherever they moved, so a focused row keeps its own data when the list is reordered (a node matched by
// position would be rewritten with the row taking its place, and Enter would act on that row). Nodes
// without a data-key are matched by position.
const patchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
// Moves a kept node. moveBefore (where supported) keeps its focus; insertBefore drops it, which is safe:
// Enter then does nothing rather than act on another row.
const place = (parent, node, ref) => {
  if (node === ref) return;
  try {
    if (parent.moveBefore && node.parentNode === parent) return parent.moveBefore(node, ref);
  } catch (_e) {
    /* fall back to insertBefore */
  }
  parent.insertBefore(node, ref);
};
const patchChildren = (cur, next) => {
  const old = [...cur.childNodes];
  const fresh = [...next.childNodes];
  const byKey = new Map();
  for (const o of old) {
    const k = keyOf(o);
    if (k !== null && !byKey.has(k)) byKey.set(k, o);
  }
  const used = new Set();
  fresh.forEach((n, i) => {
    const k = keyOf(n);
    let o = k !== null ? byKey.get(k) : old[i];
    if (!sameNode(o, n) || used.has(o) || (k === null && keyOf(o) !== null)) o = null;
    const ref = cur.childNodes[i] ?? null;
    if (!o) {
      cur.insertBefore(n, ref);
      return;
    }
    used.add(o);
    place(cur, o, ref);
    if (n.nodeType === 1) {
      patchAttrs(o, n);
      patchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path d="${path}"/></svg>`;

// ---------------------------------------------------------------------------
// Registry-based resolution
// ---------------------------------------------------------------------------

const _cache = new WeakMap();
const _mdCache = new WeakMap();

/**
 * Model shared by every source:
 * { envs: [{ id, name, source, entities, stacks: [...], containers: [...] }] }
 * Dockhand and Portainer environments come from the registries, Monitor Docker instances from the states.
 */
const resolve = (hass) => {
  const registry = resolveRegistry(hass);
  if (!registry || !hass.states) return registry;
  const cached = _mdCache.get(hass.states);
  if (cached && cached.registry === registry && cached.entities === hass.entities) return cached.model;
  const md = resolveMonitorDocker(hass.states, hass.entities);
  const model = md.length ? { envs: [...registry.envs, ...md] } : registry;
  _mdCache.set(hass.states, { registry, entities: hass.entities, model });
  return model;
};

// Portainer (core integration, 2025.10+): its translation keys mapped to the ones the cards read (Dockhand's),
// per device model; entities not listed are not used. Keys starting with "_" have no Dockhand counterpart.
const PORTAINER_KEYS = {
  Endpoint: {
    status: "online",
    docker_version: "host_docker_version",
    operating_system: "_os",
    architecture: "_arch",
    containers_count: "containers",
    containers_running: "_running",
    images_count: "image_count",
    memory_total: "_memory_total",
    cpu_total: "_cpu_total",
  },
  Stack: { stack: "_switch", status: "_active", stack_containers_count: "containers_in_stack" },
  Container: {
    container_state: "state",
    container_health_state: "health",
    image: "_image",
    container: "_switch",
    restart_container: "restart",
    container_image_update: "_update",
    cpu_usage_total: "_cpu",
    memory_usage: "_memory",
    memory_limit: "_memory_limit",
  },
};

// Per registry platform: the device model of an environment, and how an entity is keyed on its device.
const REGISTRY_SOURCES = {
  // Keyed by translation_key; primary entities without one (running switch, container update) by "_<domain>".
  dockhand: { env: "Environment", key: (e) => e.translation_key || `_${e.entity_id.split(".")[0]}` },
  portainer: { env: "Endpoint", key: (e, d) => PORTAINER_KEYS[d?.model]?.[e.translation_key] },
};

/**
 * Dockhand and Portainer environments from hass.entities / hass.devices: an environment device, its stacks
 * and its containers (directly or through a stack or a group device).
 */
const resolveRegistry = (hass) => {
  if (!hass.entities || !hass.devices) return null;
  const cached = _cache.get(hass.entities);
  if (cached && cached.devices === hass.devices) return cached.model;

  const byDevice = new Map();
  for (const e of Object.values(hass.entities)) {
    const src = REGISTRY_SOURCES[e.platform];
    if (!src || !e.device_id) continue;
    const key = src.key(e, hass.devices[e.device_id]);
    if (!key) continue;
    const dev = byDevice.get(e.device_id) || { source: e.platform, entities: {} };
    if (!(key in dev.entities)) dev.entities[key] = e.entity_id;
    byDevice.set(e.device_id, dev);
  }

  const devName = (d) => d.name_by_user || d.name || "";
  const envOf = (d, source) => {
    for (let i = 0, cur = d; cur && i < 4; i++, cur = hass.devices[cur.via_device_id]) {
      if (cur.model === REGISTRY_SOURCES[source].env) return cur.id;
    }
    return null;
  };
  // "Docker host – Containers – web" → "web"
  const shortName = (d) => devName(d).split(" – ").pop();

  const envs = new Map();
  for (const [id, { source, entities }] of byDevice) {
    const d = hass.devices[id];
    if (d && d.model === REGISTRY_SOURCES[source].env) envs.set(id, { id, name: devName(d), source, entities, stacks: [], containers: [] });
  }
  for (const [id, { source, entities }] of byDevice) {
    const d = hass.devices[id];
    if (!d) continue;
    const env = envs.get(envOf(d, source));
    if (!env) continue;
    if (d.model === "Container") env.containers.push({ id, name: shortName(d), entities });
    else if (/Stack$/.test(d.model || "")) env.stacks.push({ id, name: shortName(d), type: d.model, entities });
  }
  const byName = (a, b) => a.name.localeCompare(b.name);
  const model = { envs: [...envs.values()].sort(byName) };
  for (const env of model.envs) {
    env.stacks.sort(byName);
    env.containers.sort(byName);
  }
  _cache.set(hass.entities, { devices: hass.devices, model });
  return model;
};

// Monitor Docker (https://github.com/ualex73/monitor_docker) is configured in YAML and its entities
// have no unique_id: they are not in the entity registry and are found by their entity id instead,
// "<prefix>_<condition>" for the host and "<prefix>_<container>_<condition>" for each container.
const MD_HOST = {
  cpu_usage: ["1cpu", "cpu"],
  memory_usage: ["memory_percent"],
  _memory: ["memory"],
  containers: ["containers_total"],
  _running: ["containers_running"],
  image_count: ["images"],
  host_docker_version: ["version"],
};
const MD_HOST_SUFFIXES = new Set([...Object.values(MD_HOST).flat(), "containers_paused", "containers_stopped"]);
const MD_CT_KEYS = { state: "state", status: "_status", health: "health", image: "_image" };
const MD_CT_RE =
  /^(.+)_(state|status|health|up_time|image_hash|image|1cpu|cpu|memory_percent|memory|network_speed_up|network_speed_down|network_total_up|network_total_down)$/;
const MD_ALLINONE_ATTRS = ["status", "image", "health", "uptime"];

const resolveMonitorDocker = (states, registry = {}) => {
  const free = Object.keys(states).filter((id) => !registry[id]);
  // Instances: host sensors only Monitor Docker creates (mdi:docker counters, version with host details).
  const prefixes = new Set();
  for (const id of free) {
    const m = /^sensor\.(.+)_(containers_total|containers_running|images|version)$/.exec(id);
    if (!m) continue;
    const a = states[id].attributes || {};
    if (m[2] === "version" ? "Online_CPUs" in a || "Memory_limit" in a : a.icon === "mdi:docker") prefixes.add(m[1]);
  }
  if (!prefixes.size) return [];
  // Longest first: "docker_nas" wins over "docker" for sensor.docker_nas_web_state.
  const sorted = [...prefixes].sort((a, b) => b.length - a.length);
  const envs = new Map(
    sorted.map((p) => {
      const entities = {};
      for (const [key, suffixes] of Object.entries(MD_HOST)) {
        const id = suffixes.map((s) => `sensor.${p}_${s}`).find((i) => states[i] && !registry[i]);
        if (id) entities[key] = id;
      }
      const name = p.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
      return [p, { id: `monitor_docker.${p}`, name, source: "monitor_docker", entities, stacks: [], containers: new Map() }];
    })
  );

  for (const id of free) {
    const [domain, obj] = id.split(".");
    if (domain !== "sensor" && domain !== "switch" && domain !== "button") continue;
    const p = sorted.find((x) => obj.startsWith(`${x}_`));
    if (!p) continue;
    const rest = obj.slice(p.length + 1);
    const s = states[id];
    const a = s.attributes || {};
    let cname;
    let key;
    if (domain === "switch") {
      if (a.icon !== "mdi:docker") continue;
      [cname, key] = [rest, "_switch"];
    } else if (domain === "button") {
      if (a.icon !== "mdi:docker" || !rest.endsWith("_restart")) continue;
      [cname, key] = [rest.slice(0, -8), "restart"];
    } else if (MD_HOST_SUFFIXES.has(rest)) {
      continue;
    } else {
      const m = MD_CT_RE.exec(rest);
      if (m) {
        if (!(m[2] in MD_CT_KEYS)) continue;
        [cname, key] = [m[1], MD_CT_KEYS[m[2]]];
      } else if (MD_ALLINONE_ATTRS.some((k) => k in a)) {
        // "allinone": one sensor per container, its state is the container state, the rest attributes.
        [cname, key] = [rest, "state"];
      } else continue;
    }
    const list = envs.get(p).containers;
    const ct = list.get(cname) || { id: `monitor_docker.${p}.${cname}`, slug: cname, entities: {} };
    if (!(key in ct.entities)) ct.entities[key] = id;
    list.set(cname, ct);
  }

  const byName = (a, b) => a.name.localeCompare(b.name);
  const fname = (id, suffix) => {
    const n = id && states[id]?.attributes?.friendly_name;
    return n && suffix ? n.replace(new RegExp(`\\s*${suffix}$`, "i"), "") : n;
  };
  return [...envs.values()]
    .map((env) => {
      const containers = [...env.containers.values()]
        // A container is listed from its state, its status or its switch: a lone restart button is not one.
        .filter((ct) => ct.entities.state || ct.entities._status || ct.entities._switch)
        .map((ct) => {
          const e = ct.entities;
          const name = (fname(e._switch) || fname(e.state, "state") || fname(e._status, "status") || "").trim();
          return { id: ct.id, name: name || ct.slug, entities: e };
        })
        .sort(byName);
      // Every entity id the environment is built from: a container appearing or disappearing changes it.
      const key = [...Object.values(env.entities), ...containers.flatMap((ct) => Object.values(ct.entities))].join(",");
      return { ...env, containers, key };
    })
    .sort(byName);
};

const listEnvs = (hass) => {
  const m = hass && resolve(hass);
  // Dockhand environments by their name only (as before Monitor Docker and Portainer were supported).
  return m ? m.envs.map((e) => ({ value: e.id, label: e.source === "dockhand" ? e.name : `${e.name} (${SOURCES[e.source].name})` })) : [];
};

const findEnv = (hass, config) => {
  const m = resolve(hass);
  if (!m) return { error: "no_registry" };
  if (!m.envs.length) return { error: "no_env" };
  if (!config.environment) return { env: m.envs[0] };
  const env = m.envs.find((e) => e.id === config.environment || e.name === config.environment);
  return env ? { env } : { error: "unknown_env" };
};

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --dh-orange: #f26b21; --dh-ok: var(--success-color, #43a047); --dh-warn: var(--warning-color, #ffa600);
          --dh-crit: var(--error-color, #db4437); --dh-idle: var(--disabled-text-color, #9e9e9e); }
  /* Query container: the header, the mini card rows and the gauges adapt to the card width (Sections view). */
  :host { display: block; }
  ha-card { overflow: hidden; container-type: inline-size; }
  /* A size container has no content width: in a parent that sizes to its content (inline-block, "auto" grid
     column of layout-card / button-card) the card would fall to a few pixels. This empty, zero-height grid
     gives the card a natural (max-content) width of 300 px with no minimum (its min-content width is 0), so in
     a "1fr" grid column or a flex row, wrapped in a div or not, the card still shrinks to its track.
     contain-intrinsic-inline-size or a min-width on the host would be a minimum and overflow there. */
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, 300px); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .ok { --c: var(--dh-ok); } .warn { --c: var(--dh-warn); } .crit { --c: var(--dh-crit); } .idle { --c: var(--dh-idle); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--dh-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          background: color-mix(in srgb, var(--c, var(--dh-ok)) 15%, transparent); color: var(--c, var(--dh-ok)); }
  .bar { height: 4px; border-radius: 3px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; }
  .bar > div { height: 100%; border-radius: 3px; background: var(--c, var(--dh-orange)); transition: width .6s ease; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 8px; }
  /* Tinted round icon, in the status colour like the chip; it opens Dockhand (or the url option). */
  .logo { height: 40px; width: 40px; flex: none; border-radius: 50%; display: grid; place-items: center;
          color: var(--c, var(--dh-ok)); background: color-mix(in srgb, var(--c, var(--dh-ok)) 16%, transparent); }
  .logo .icon { width: 24px; height: 24px; fill: currentColor; }
  /* The title block takes what the chip and buttons leave (flex basis 0) and shrinks with an ellipsis down to
     a few characters; only then does the chip cut its label. */
  .titles { flex: 1 1 0; min-width: 5ch; }
  .header .chip { flex: 0 1 auto; min-width: 0; overflow: hidden; line-height: 16px; box-sizing: border-box; }
  /* Unavailable / unknown: the dot stays grey, the text takes the primary text colour (grey text on a grey
     tint would stay under 4.5:1). */
  .header .chip.idle { color: var(--primary-text-color); }
  .chip-label { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* With a subtitle, the title block starts at the top and the 18 px chip is centred on the 20 px title
     line, not on the two lines. */
  .header:has(.sub) .titles { align-self: flex-start; }
  .header:has(.sub) .chip { align-self: flex-start; margin-top: 1px; }
  @container (max-width: 239px) {
    .header { gap: 6px; }
    .header .logo { height: 32px; width: 32px; }
    .header .logo .icon { width: 18px; height: 18px; }
    /* Only the coloured dot, in an 18 px chip that no longer shrinks: its text stays in title and aria-label. */
    .header .chip { flex: none; padding: 6px; }
    .header .chip .chip-label { display: none; }
  }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: var(--dh-warn); }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px;
          border-radius: 50%; display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
`;

// Appended last to every card style: with "reduce motion" set in the OS / browser, bars, gauge rings and
// section chevrons jump to their new value instead of animating (!important beats every earlier rule).
const MOTION_STYLE = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; animation: none !important; }
  }
`;

// In-card confirmation popup, as in the other ha-* cards (ha-vacuum-card, ha-system-monitor-card): a backdrop
// over the card with a small dialog at the top of the card, so it stays in view when the card is long.
// window.confirm() is blocking and silently neutralised in some webviews; this popup is neither.
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 150px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 14px; line-height: 1.4; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
  .modal-actions .btn { border: none; border-radius: 8px; padding: 8px 14px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer;
                        background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); }
  .modal-actions .btn.primary { background: color-mix(in srgb, var(--primary-color, #03a9f4) 15%, transparent); color: var(--primary-color, #03a9f4); }
  .modal-actions .btn:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
`;

// After the confirmation popup closes, clicks on the card are ignored for this long: the second click of a
// double click on OK would otherwise land on what lies under the button.
const CONFIRM_GUARD_MS = 400;

// A click inside a dialog (more-info opened from the card, say) is not a click outside the card.
const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

class DockerBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Keyboard access: Enter or Space on a focusable non-button element acts as a click.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target.getAttribute?.("role") === "button") {
        ev.preventDefault();
        ev.target.click();
      }
    });
    // Escape closes the confirmation popup (as Cancel). Listened on the window while the popup is open:
    // a re-render or a click on its text can take the focus out of the card.
    // Tab and Shift+Tab stay on the popup's two buttons while it is open.
    this._onKey = (ev) => {
      if (!this._confirm) return;
      if (ev.key === "Tab") {
        const btns = [...(this.shadowRoot.querySelectorAll?.(".modal .btn") || [])];
        if (!btns.length) return;
        ev.preventDefault();
        const i = btns.indexOf(this.shadowRoot.activeElement);
        btns[(i + (ev.shiftKey ? -1 : 1) + btns.length) % btns.length].focus({ preventScroll: true });
        return;
      }
      if (ev.key !== "Escape") return;
      ev.stopPropagation();
      this._closeConfirm();
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    // Render only when a state the card shows has changed, not on every state change of Home Assistant.
    const sig = this._signature();
    if (sameSig(sig, this._sig)) return;
    this._update(sig);
  }

  get hass() {
    return this._hass;
  }

  // A click elsewhere on the page folds the sections back to their defaults (as in ha-carburants-france).
  // A click, not a pointerdown: folding on press would shift the layout under the pointer before the click.
  connectedCallback() {
    this._onOutside ??= (ev) => {
      const foldsOpen = this._folds && Object.keys(this._folds).length;
      if ((!foldsOpen && !this._confirm) || ev.composedPath().includes(this) || inDialog(ev)) return;
      // Closed by a click elsewhere on the page: the focus goes where that click put it.
      if (this._confirm) this._closeConfirm(false);
      if (foldsOpen) {
        this._folds = {};
        this._update();
      }
    };
    document.addEventListener("click", this._onOutside, true);
    // Reattached with the popup still open (view switch, editor): Escape keeps closing it.
    if (this._confirm) window.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onOutside, true);
    window.removeEventListener("keydown", this._onKey);
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this._folds = {};
    this._html = "";
    this._update();
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _tn(key, n, oneKey) {
    return tn(this._hass, this._config, key, n, oneKey);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  // What the render depends on: registries, language and the states of the environment, its stacks
  // and its containers.
  _signature() {
    const h = this._hass;
    const sig = [h.entities, h.devices, h.language, h.locale?.language];
    const { env } = findEnv(h, this._config);
    if (!env) return sig;
    if (env.key !== undefined) sig.push(env.key);
    for (const group of [env, ...env.stacks, ...env.containers]) for (const id of Object.values(group.entities)) sig.push(h.states[id]);
    return sig;
  }

  _update(sig) {
    if (!this._hass || !this._config) return;
    this._sig = sig ?? this._signature();
    let html = this._render();
    if (this._confirm)
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._confirmHtml()}</ha-card>`);
    if (html !== this._html) {
      this._html = html;
      morph(this.shadowRoot, html);
    }
  }

  // Service call whose failure is logged (Home Assistant already shows a toast) instead of left unhandled.
  _call(domain, service, data) {
    return Promise.resolve()
      .then(() => this._hass.callService(domain, service, data))
      .catch((err) => console.error(`docker-card: ${domain}.${service} failed`, err));
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    // Just closed: the rest of a double click on OK does nothing.
    if (!this._confirm && Date.now() - (this._confirmClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    // Confirmation popup open: only its buttons and the backdrop itself (outside the dialog) act.
    if (this._confirm) {
      ev.stopPropagation();
      const action = el?.dataset.action;
      if (action === "confirm_ok") {
        const { run } = this._confirm;
        this._closeConfirm();
        run();
      } else if (action === "confirm_cancel" || (action === "confirm_backdrop" && path[0] === el)) {
        this._closeConfirm();
      }
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity, label } = el.dataset;
    if (action === "fold") {
      this._folds = { ...this._folds, [el.dataset.section]: !this._isOpen(el.dataset.section) };
      this._update();
    } else if (action === "restart") {
      // Unavailable: nothing to restart (the button is disabled, keyboard included). A button entity is
      // "unknown" until first pressed, which is not a reason to block it.
      if (this._s(entity)?.state === "unavailable") return;
      this._openConfirm(
        {
          text: this._t("confirm_restart", { name: label }),
          ok: this._t("restart"),
          run: () => this._call("button", "press", { entity_id: entity }),
        },
        { action, entity }
      );
    } else if (action === "toggle") {
      const state = this._s(entity)?.state;
      // Unavailable or unknown: nothing to start or stop (the button is disabled, keyboard included).
      if (state !== "on" && state !== "off") return;
      if (state === "off") this._call("switch", "turn_on", { entity_id: entity });
      else
        this._openConfirm(
          {
            text: this._t("confirm_stop", { name: label }),
            ok: this._t("stop"),
            run: () => this._call("switch", "turn_off", { entity_id: entity }),
          },
          { action, entity }
        );
    } else if (entity) {
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
    }
  }

  // In-card confirmation before stopping or restarting (see DIALOG_STYLE): Cancel, Escape, the backdrop
  // and a click outside the card all close it without acting.
  // `from` is the button that opened it: the focus goes back to it when the popup closes.
  _openConfirm(confirm, from) {
    this._confirm = { ...confirm, from };
    window.addEventListener("keydown", this._onKey);
    this._update();
    // preventScroll: opening the popup must not bring a scrolled page back to the card.
    this.shadowRoot.querySelector?.(".modal .primary")?.focus({ preventScroll: true });
  }

  _closeConfirm(restoreFocus = true) {
    const from = this._confirm?.from;
    this._confirm = null;
    this._confirmClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
    // Looked up again after the render: the opening button may have been re-created meanwhile (entity ids
    // hold only [a-z0-9_.], safe in the selector).
    if (restoreFocus && from)
      this.shadowRoot
        .querySelector?.(`[data-action="${from.action}"][data-entity="${from.entity}"]`)
        ?.focus({ preventScroll: true });
  }

  _confirmHtml() {
    const c = this._confirm;
    return `<div class="backdrop" data-action="confirm_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-msg">
        <div class="msg" id="confirm-msg">${esc(c.text)}</div>
        <div class="modal-actions">
          <button type="button" class="btn" data-action="confirm_cancel">${esc(this._t("cancel"))}</button>
          <button type="button" class="btn primary" data-action="confirm_ok">${esc(c.ok)}</button>
        </div>
      </div>
    </div>`;
  }

  // Logo target: url option (dockhand_url before 2.0), else the Dockhand web UI advertised by the integration
  // (environment device configuration_url, minus its settings deep link; Portainer's endpoint dashboard),
  // else the website of the source.
  _logoUrl(env) {
    // Only http(s) addresses: any other scheme (javascript:…) would run on a click on the logo.
    const url = this._config.url ?? this._config.dockhand_url;
    if (/^https?:\/\//i.test(url || "")) return url;
    const conf = this._hass.devices?.[env.id]?.configuration_url;
    if (conf) return conf.replace(/\/settings(?:[/?#].*)?$/, "") || conf;
    return SOURCES[env.source].site;
  }

  _header(env) {
    const c = this._config;
    const online = this._s(env.entities.online);
    // on / off: online or offline; unavailable or unknown: said so (grey), never shown as offline.
    const [chipCls, chipKey] =
      online?.state === "on" ? ["ok", "online"] : online?.state === "off" ? ["crit", "offline"] : ["idle", `state_${online?.state === "unknown" ? "unknown" : "unavailable"}`];
    const chipText = esc(this._t(chipKey));
    const docker = this._s(env.entities.host_docker_version)?.state;
    const platform = this._platform(env);
    const conn = this._s(env.entities.connection_type)?.state;
    const srcName = SOURCES[env.source].name;
    // Without an online sensor (Monitor Docker), the logo is tinted while the containers counter answers.
    const total = this._s(env.entities.containers)?.state;
    const logoCls = online ? chipCls : env.source === "monitor_docker" && total !== undefined && total !== "unknown" && total !== "unavailable" ? "ok" : "idle";
    const sub = [docker && docker !== "unknown" && docker !== "unavailable" ? `Docker ${docker}` : null, platform, conn].filter((v) => v && v !== "unknown" && v !== "unavailable");
    return `
      <div class="header">
        <a class="logo-link logo ${logoCls}" href="${esc(this._logoUrl(env))}" target="_blank" rel="noopener noreferrer" title="${esc(srcName)}" aria-label="${esc(srcName)}">${svgIcon(ICONS.docker)}</a>
        <div class="titles">
          <div class="name">${esc(c.title || env.name)}</div>
          ${sub.length ? `<div class="sub">${esc(sub.join(" · "))}</div>` : ""}
        </div>
        ${
          online
            ? `<span class="chip clickable ${chipCls}" role="button" tabindex="0" data-entity="${esc(online.entity_id)}" title="${chipText}" aria-label="${chipText}"><span class="dot"></span><span class="chip-label">${chipText}</span></span>`
            : ""
        }
        ${this._zoomButton()}
      </div>`;
  }

  // Button at the far right of the header: only the mini card has one.
  _zoomButton() {
    return "";
  }

  _error(key) {
    return `<style>${BASE_STYLE}${DIALOG_STYLE}${MOTION_STYLE}</style><ha-card><div class="warning">${esc(
      key === "unknown_env" ? `${this._t(key)}: ${this._config.environment}` : this._t(key)
    )}</div></ha-card>`;
  }

  _containerStats(env) {
    if (env.source !== "dockhand") return this._countedContainerStats(env);
    const s = this._s(env.entities.containers);
    const total = num(s);
    const a = s?.attributes || {};
    // An unknown or unavailable sensor has no attributes: its pending updates are unknown (a dash), not 0.
    const known = !!s && s.state !== "unknown" && s.state !== "unavailable";
    return {
      entity: env.entities.containers,
      total,
      running: a.running ?? null,
      unhealthy: a.unhealthy ?? 0,
      updates: known ? (a.pending_updates_total ?? a.pending_updates ?? 0) : null,
    };
  }

  // Monitor Docker and Portainer: running and total come from their own sensors, unhealthy and updates are
  // counted on the containers. No update entity at all (Monitor Docker): `updates` undefined, no updates
  // tile nor footer.
  _countedContainerStats(env) {
    const unhealthy = env.containers.filter((ct) => this._health(ct.entities) === "unhealthy").length;
    const upd = env.containers.map((ct) => this._s(ct.entities._update)).filter(Boolean);
    return {
      entity: env.entities.containers,
      total: num(this._s(env.entities.containers)),
      running: num(this._s(env.entities._running)),
      unhealthy,
      updates: upd.length ? upd.filter((u) => u.state === "on").length : undefined,
    };
  }

  // Host OS and architecture: Dockhand's platform sensor, Portainer's OS and architecture sensors (disabled
  // by default) or the attributes of Monitor Docker's version sensor.
  _platform(env) {
    const e = env.entities;
    const known = (id) => {
      const st = this._s(id)?.state;
      return st && st !== "unknown" && st !== "unavailable" ? st : null;
    };
    if (env.source === "monitor_docker") {
      const va = this._s(e.host_docker_version)?.attributes || {};
      return [va.OS, va.Architecture].filter(Boolean).join(" ");
    }
    if (env.source === "portainer") return [known(e._os), known(e._arch)].filter(Boolean).join(" ");
    return this._s(e.host_platform)?.state;
  }

  // CPU and memory of the host: { cpu, mem } in %, cores, used / total bytes and the entities they open.
  // Portainer has no host usage sensor: its containers' usage is added up, against the host's cores and
  // memory (the "Total CPU" / "Total memory" sensors, disabled by default; memory falls back on the
  // containers' memory limit, the host memory when none is set).
  _host(env) {
    const e = env.entities;
    if (env.source === "portainer") {
      const sum = (key, of = num) => {
        const vals = env.containers.map((ct) => of(this._s(ct.entities[key]))).filter((v) => v !== null);
        return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
      };
      const cores = num(this._s(e._cpu_total));
      const cpuSum = sum("_cpu");
      const used = sum("_memory", bytesOf);
      const limits = env.containers.map((ct) => bytesOf(this._s(ct.entities._memory_limit))).filter((v) => v);
      const total = bytesOf(this._s(e._memory_total)) ?? (limits.length ? Math.max(...limits) : null);
      return {
        cpu: cores && cpuSum !== null ? cpuSum / cores : null,
        mem: total && used !== null ? (100 * used) / total : null,
        cores,
        used,
        total,
        cpuId: e._cpu_total,
        memId: e._memory_total,
      };
    }
    const cpuS = this._s(e.cpu_usage);
    const memS = this._s(e.memory_usage);
    // Monitor Docker: cores and host memory on the version sensor, containers memory in MiB.
    const md = env.source === "monitor_docker";
    const va = (md && this._s(e.host_docker_version)?.attributes) || {};
    const usedMiB = md ? num(this._s(e._memory)) : null;
    return {
      cpu: num(cpuS),
      mem: num(memS),
      cores: cpuS?.attributes?.cpu_count ?? va.Online_CPUs,
      used: memS?.attributes?.memory_used_bytes ?? (usedMiB !== null ? usedMiB * 1048576 : undefined),
      total: memS?.attributes?.memory_total_bytes ?? va.Memory_limit,
      cpuId: e.cpu_usage,
      memId: e.memory_usage,
    };
  }

  // Stack state: Dockhand's status sensor, else Portainer's active binary sensor (running / stopped).
  _stackStatus(e) {
    if (e.status || !e._active) return { id: e.status, state: this._s(e.status)?.state, s: this._s(e.status) };
    const s = this._s(e._active);
    return { id: e._active, state: { on: "running", off: "stopped" }[s?.state] ?? s?.state, s: undefined };
  }

  // Health sensor, else the attribute of a Monitor Docker "allinone" sensor.
  _health(e) {
    return this._s(e.health)?.state ?? this._s(e.state)?.attributes?.health;
  }

  // Containers list shown: an explicit show_containers, else only for Monitor Docker, which has no stacks.
  _showContainers(env) {
    return this._config.show_containers ?? env?.source === "monitor_docker";
  }
}

// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------

const ring = (pct) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const p = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  return `<svg class="ring" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="${r}" class="track"/>
    <circle cx="32" cy="32" r="${r}" class="value" stroke-dasharray="${((p / 100) * c).toFixed(1)} ${c.toFixed(1)}"/>
  </svg>`;
};

const FULL_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title .count { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .section-title.fold { cursor: pointer; user-select: none; }
  .section-title .chevron { transition: transform .2s ease; }
  .section-title.closed { margin-bottom: 0; }
  .section-title.closed .chevron { transform: rotate(-90deg); }
  .gauges { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
  .gauge { display: flex; flex-direction: column; align-items: center; min-width: 0; }
  /* Ring of 60 px, smaller when the column is narrower (6 columns of a small Sections view). */
  .gauge .gw { position: relative; width: min(60px, 100%); aspect-ratio: 1; }
  .ring { display: block; width: 100%; height: 100%; transform: rotate(-90deg); }
  .ring circle { fill: none; stroke-width: 6; }
  .ring .track { stroke: var(--divider-color, rgba(127,127,127,.25)); }
  .ring .value { stroke: var(--c, var(--dh-orange)); stroke-linecap: round; transition: stroke-dasharray .6s ease; }
  .gauge .val { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .gauge .val b { font-size: 14px; font-weight: 500; }
  .gauge .val .icon { width: 12px; height: 12px; color: var(--secondary-text-color); }
  .gauge .lbl { font-size: 12px; color: var(--secondary-text-color); margin-top: 0; text-align: center; line-height: 1.35; }
  .gauge .lbl small { display: block; font-size: 11px; opacity: .85; }
  .gauge .lbl { max-width: 100%; overflow-wrap: break-word; }
  @container (max-width: 299px) {
    .gauge .val .icon { display: none; }
    .gauge .val b { font-size: 11px; }
    .gauge .lbl, .gauge .lbl small { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  }
  .counts { display: grid; grid-template-columns: repeat(auto-fit, minmax(68px, 1fr)); gap: 6px; }
  .count-tile { display: flex; flex-direction: column; align-items: center; gap: 0; padding: 6px 4px; border-radius: 10px;
                background: var(--secondary-background-color, rgba(127,127,127,.08)); min-width: 0; text-align: center; }
  .count-tile .top { display: flex; align-items: center; gap: 6px; }
  .count-tile .icon { color: var(--c, var(--secondary-text-color)); }
  .count-tile .k { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .count-tile .v { font-size: 14px; font-weight: 500; }
  .count-tile.has-updates { --c: var(--dh-orange); }
  .count-tile.has-updates .v { color: var(--dh-orange); }
  .list { display: flex; flex-direction: column; }
  .item { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.15)); min-width: 0; }
  .item:last-child { border-bottom: none; }
  .item .main { flex: 1; min-width: 0; }
  .item .title { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
  .item .title span:first-child { overflow: hidden; text-overflow: ellipsis; }
  .item .detail { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tag { font-size: 11px; padding: 1px 6px; border-radius: 6px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--secondary-text-color); flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis;
         display: inline-flex; align-items: center; gap: 3px; }
  .tag .icon { width: 12px; height: 12px; }
  .tag.alert { background: color-mix(in srgb, var(--c) 15%, transparent); color: var(--c); }
  .badge-update { color: var(--dh-orange); }
  .badge-update .icon { width: 18px; height: 18px; }
  .ctrl { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; border: none;
          background: transparent; color: var(--secondary-text-color); cursor: pointer; flex: none; padding: 0; }
  .ctrl:hover:not(:disabled) { background: var(--secondary-background-color, rgba(127,127,127,.12)); }
  .ctrl:disabled { opacity: .4; cursor: default; }
  .ctrl.on { color: var(--dh-ok); }
  .ctrl .icon { width: 20px; height: 20px; }
  .empty { font-size: 13px; color: var(--secondary-text-color); padding: 4px 0; }
`;

class DockerCard extends DockerBase {
  static getConfigElement() {
    return document.createElement("docker-card-editor");
  }

  static getStubConfig(hass) {
    const env = listEnvs(hass)[0];
    return env ? { environment: env.value } : {};
  }

  // Rows of about 50 px: header, gauges, counter tiles, then each list title and, when the list is
  // open, its rows — the ones actually listed: only_problems filters them (as _section does), down to
  // a single "nothing to report" line when none needs attention.
  getCardSize() {
    const c = this._config || {};
    let size = 1 + (c.show_stats !== false ? 2 : 0) + (c.show_counts !== false ? 1 : 0);
    const env = this._hass && this._config ? findEnv(this._hass, c).env : null;
    for (const [key, shown, problem] of [
      ["stacks", c.show_stacks !== false, (st) => this._stackProblem(st)],
      ["containers", this._showContainers(env), (ct) => this._containerProblem(ct)],
    ]) {
      const all = env ? env[key].length : 0;
      const n = env && c.only_problems ? Math.max(env[key].filter(problem).length, all ? 1 : 0) : all;
      if (shown && (all || !env)) size += 1 + (this._isOpen(key) ? n : 0);
    }
    return size;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  _render() {
    const { env, error } = findEnv(this._hass, this._config);
    if (error) return this._error(error);
    const c = this._config;
    const parts = [];
    if (c.show_stats !== false) parts.push(this._stats(env));
    if (c.show_counts !== false) parts.push(this._counts(env));
    if (c.show_stacks !== false) parts.push(this._stacks(env));
    if (this._showContainers(env)) parts.push(this._containers(env));
    return `<style>${BASE_STYLE}${DIALOG_STYLE}${FULL_STYLE}${MOTION_STYLE}</style>
      <ha-card>
        ${this._header(env)}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  _gauge(id, label, icon, pct, display, cls) {
    return `<div class="gauge clickable ${cls}" role="button" tabindex="0" data-entity="${esc(id || "")}">
      <div class="gw">${ring(pct)}<div class="val">${svgIcon(icon)}<b>${display}</b></div></div>
      <div class="lbl">${label}</div>
    </div>`;
  }

  _stats(env) {
    const { cpu, mem, cores, used, total, cpuId, memId } = this._host(env);
    const cs = this._containerStats(env);
    const runPct = cs.total ? (100 * (cs.running ?? 0)) / cs.total : null;
    const memLabel = used && total ? `${this._t("memory")}<small>${fmtBytesPair(used, total)}</small>` : this._t("memory");
    return `<div class="gauges">
      ${this._gauge(
        cpuId,
        cores ? `${this._t("cpu")}<small>${esc(cores)} ${esc(this._tn("cores", cores))}</small>` : this._t("cpu"),
        ICONS.cpu,
        cpu,
        cpu === null ? "—" : `${cpu < 10 ? cpu.toFixed(1) : Math.round(cpu)}%`,
        level(cpu, 70, 90)
      )}
      ${this._gauge(memId, memLabel, ICONS.ram, mem, mem === null ? "—" : `${Math.round(mem)}%`, level(mem, 80, 95))}
      ${this._gauge(
        cs.entity,
        `${this._t("containers")}<small>${this._t("running")}</small>`,
        ICONS.container,
        runPct,
        cs.total === null ? "—" : `${esc(cs.running ?? "?")}/${cs.total}`,
        cs.unhealthy > 0 || (runPct !== null && runPct < 100) ? "warn" : "ok"
      )}
    </div>`;
  }

  _counts(env) {
    const e = env.entities;
    const cs = this._containerStats(env);
    const tile = (id, icon, label, value, cls = "") =>
      id && this._s(id)
        ? `<div class="count-tile clickable ${cls}" role="button" tabindex="0" data-key="${esc(id)}" data-entity="${esc(id)}"><div class="top">${svgIcon(icon)}<span class="v">${esc(
            value
          )}</span></div><div class="k">${esc(label)}</div></div>`
        : "";
    const v = (id) => countText(this._s(id));
    const tiles = [
      tile(e.stacks, ICONS.stack, this._t("stacks"), v(e.stacks)),
      tile(e.image_count, ICONS.image, this._t("images"), v(e.image_count)),
      tile(e.volume_count, ICONS.volume, this._t("volumes"), v(e.volume_count)),
      tile(e.network_count, ICONS.network, this._t("networks"), v(e.network_count)),
      cs.updates === undefined ? "" : tile(cs.entity, ICONS.update, this._t("updates"), cs.updates ?? "—", cs.updates > 0 ? "has-updates" : ""),
    ].filter(Boolean);
    return tiles.length ? `<div class="counts">${tiles.join("")}</div>` : "";
  }

  _controls(entities, label) {
    if (this._config.show_controls === false) return "";
    const sw = entities._switch && this._s(entities._switch);
    const out = [];
    const rs = entities.restart && this._s(entities.restart);
    if (rs)
      out.push(
        `<button type="button" class="ctrl" title="${esc(this._t("restart"))}" data-key="restart" data-action="restart" data-entity="${esc(entities.restart)}" data-label="${esc(
          label
        )}"${rs.state === "unavailable" ? " disabled" : ""}>${svgIcon(ICONS.restart)}</button>`
      );
    // An unavailable or unknown switch cannot be started or stopped: its button is shown disabled.
    if (sw)
      out.push(
        `<button type="button" class="ctrl ${sw.state === "on" ? "on" : ""}" title="${esc(this._t("start_stop"))}" data-key="toggle" data-action="toggle" data-entity="${
          esc(sw.entity_id)
        }" data-label="${esc(label)}"${sw.state === "on" || sw.state === "off" ? "" : " disabled"}>${svgIcon(ICONS.power)}</button>`
      );
    return out.join("");
  }

  _stateLabel(state) {
    const k = `state_${String(state || "").toLowerCase()}`;
    const l = this._t(k);
    return l === k ? state : l;
  }

  // Needs attention: not running, update available or Git sync error — what only_problems keeps.
  _stackProblem(st) {
    const e = st.entities;
    return (
      stateClass(this._stackStatus(e).state) !== "ok" ||
      this._s(e.stack_updates_available)?.state === "on" ||
      this._s(e.git_stack_sync_error)?.state === "on"
    );
  }

  _containerProblem(ct) {
    const e = ct.entities;
    return stateClass(this._s(e.state)?.state) !== "ok" || this._s(e._update)?.state === "on" || this._health(e) === "unhealthy";
  }

  _stacks(env) {
    const rows = env.stacks.map((st) => {
      const e = st.entities;
      const status = this._stackStatus(e);
      // A count only: an unknown or unavailable sensor (or attribute) leaves it out of the detail line.
      const attrCount = parseFloat(status.s?.attributes?.container_count);
      const count = num(this._s(e.containers_in_stack)) ?? (Number.isFinite(attrCount) ? attrCount : null);
      const upd = this._s(e.stack_updates_available);
      const hasUpd = upd?.state === "on";
      const syncErr = this._s(e.git_stack_sync_error)?.state === "on";
      const cls = stateClass(status.state);
      const problem = this._stackProblem(st);
      const isGit = /^Git/.test(st.type || "");
      const detail = [
        status.state ? this._stateLabel(status.state) : null,
        count !== null ? `${count} ${this._tn("containers_lc", count, "container_lc")}` : null,
      ].filter(Boolean);
      return {
        problem,
        html: `<div class="item" data-key="${esc(st.id)}">
          <span class="dot ${cls}"></span>
          <div class="main clickable" role="button" tabindex="0" data-entity="${esc(status.id || "")}">
            <div class="title"><span>${esc(st.name)}</span>
              ${isGit ? `<span class="tag">${svgIcon(ICONS.git)}git</span>` : ""}
              ${syncErr ? `<span class="tag alert crit">${esc(this._t("sync_error"))}</span>` : ""}
            </div>
            <div class="detail">${esc(detail.join(" · "))}</div>
          </div>
          ${
            hasUpd
              ? `<span class="badge-update clickable" role="button" tabindex="0" title="${esc(this._t("update_available"))}" data-key="update" data-entity="${esc(upd.entity_id)}">${svgIcon(
                  ICONS.update
                )}</span>`
              : ""
          }
          ${this._controls(e, st.name)}
        </div>`,
      };
    });
    return this._section("stacks", ICONS.stack, this._t("stacks"), rows);
  }

  _containers(env) {
    const rows = env.containers.map((ct) => {
      const e = ct.entities;
      const state = this._s(e.state);
      const upd = this._s(e._update);
      const hasUpd = upd?.state === "on";
      const cls = stateClass(state?.state);
      const unhealthy = this._health(e) === "unhealthy";
      const problem = this._containerProblem(ct);
      // Dockhand and Monitor Docker "allinone": attributes of the state sensor; Monitor Docker: own sensors.
      const known = (s) => (s && s.state !== "unknown" && s.state !== "unavailable" ? s.state : null);
      const status = state?.attributes?.status || known(this._s(e._status)) || (state ? this._stateLabel(state.state) : "");
      const image = state?.attributes?.image || known(this._s(e._image));
      return {
        problem,
        html: `<div class="item" data-key="${esc(ct.id)}">
          <span class="dot ${unhealthy ? "crit" : cls}"></span>
          <div class="main clickable" role="button" tabindex="0" data-entity="${esc(e.state || e._status || "")}">
            <div class="title"><span>${esc(state?.attributes?.name || ct.name)}</span>
              ${unhealthy ? `<span class="tag alert crit">${esc(this._t("unhealthy"))}</span>` : ""}
            </div>
            <div class="detail">${esc([status, image].filter(Boolean).join(" · "))}</div>
          </div>
          ${
            hasUpd
              ? `<span class="badge-update clickable" role="button" tabindex="0" title="${esc(this._t("update_available"))}" data-key="update" data-entity="${esc(upd.entity_id)}">${svgIcon(
                  ICONS.update
                )}</span>`
              : ""
          }
          ${this._controls(e, ct.name)}
        </div>`,
      };
    });
    return this._section("containers", ICONS.container, this._t("containers"), rows);
  }

  // Stacks and containers lists are collapsed until clicked, unless expand_<key> is set.
  _isOpen(key) {
    return this._folds?.[key] ?? this._config[`expand_${key}`] === true;
  }

  _section(key, icon, title, rows) {
    if (!rows.length) return "";
    const shown = this._config.only_problems ? rows.filter((r) => r.problem) : rows;
    // Items needing attention first.
    shown.sort((a, b) => Number(b.problem) - Number(a.problem));
    const open = this._isOpen(key);
    return `<div>
      <div class="section-title fold ${open ? "" : "closed"}" role="button" tabindex="0" aria-expanded="${open}" data-action="fold" data-section="${key}">${svgIcon(icon)}${esc(
        title
      )}<span class="count">${shown.length}/${rows.length}</span>${svgIcon(ICONS.chevron, "chevron")}</div>
      ${open ? `<div class="list">${shown.length ? shown.map((r) => r.html).join("") : `<div class="empty">✓ ${esc(this._t("all_ok"))}</div>`}</div>` : ""}
    </div>`;
  }
}

// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------

const MINI_STYLE = `
  /* The header icon keeps the full card's 40 px (only the narrow-card rule of BASE_STYLE draws it smaller), taller
     than the two title lines: centred, like on the full card. */
  .name { font-size: 16px; }
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  /* Label column of up to 86 px (the bars line up across rows), a bar of at least 24 px, the value at its width. */
  .metric { display: grid; grid-template-columns: 18px minmax(0, 86px) minmax(24px, 1fr) minmax(44px, auto); align-items: center; gap: 8px; font-size: 13px; }
  .metric .icon { color: var(--secondary-text-color); }
  /* Fixed label column (the bars line up across rows): a longer translation is cut, never drawn over the bar. */
  .metric .lbl { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .metric .v { text-align: right; font-weight: 500; white-space: nowrap; }
  @container (max-width: 229px) {
    /* Narrow card (6 columns of a small Sections view): the icon names the row, the label stays in aria-label. */
    .metric { grid-template-columns: 18px minmax(24px, 1fr) minmax(44px, auto); gap: 6px; }
    .metric .lbl { display: none; }
  }
  .foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; flex-wrap: wrap; }
  .foot span { display: inline-flex; align-items: center; gap: 4px; }
  .foot .icon { width: 14px; height: 14px; }
  .foot .upd { color: var(--dh-orange); }
`;

// The mini card extends the full card: its detail button (top right, `zoom: false` removes it) switches it to the
// full card's content, same configuration, and back; a click anywhere outside the card brings it back too.
class DockerMiniCard extends DockerCard {
  static getConfigElement() {
    return document.createElement("docker-mini-card-editor");
  }

  static getStubConfig(hass) {
    return DockerCard.getStubConfig(hass);
  }

  constructor() {
    super();
    this._zoomed = false;
    this.shadowRoot.addEventListener("click", (ev) => this._zoomClick(ev));
    // A click outside the card, and not in a dialog opened from it, brings it back to the compact view.
    this._onUnzoom = (ev) => {
      if (this._zoomed && !ev.composedPath().includes(this) && !inDialog(ev)) this._setZoom(false);
    };
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._onUnzoom, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._onUnzoom, true);
  }

  // A config change (the editor, say) starts over from the compact view: the preview would
  // otherwise stay zoomed in.
  setConfig(config) {
    this._zoomed = false;
    super.setConfig(config);
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 };
  }

  _setZoom(zoomed) {
    this._zoomed = zoomed;
    this._update();
  }

  // A click on the detail button: never a tap on anything else of the card.
  _zoomClick(ev) {
    if (!ev.target?.closest?.(".zoom")) return;
    ev.stopPropagation();
    this._setZoom(!this._zoomed);
    // Keyboard use (Enter / Space: no click count) keeps the focus on the button, without scrolling the view.
    if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    return `<button type="button" class="zoom" title="${esc(this._t(z ? "zoom_out" : "zoom_in"))}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _metric(id, icon, label, pct, display, cls) {
    return `<div class="metric clickable ${cls}" role="button" tabindex="0" data-entity="${esc(id || "")}" aria-label="${esc(label)} ${display}">
      ${svgIcon(icon)}<span class="lbl">${label}</span>
      <div class="bar"><div style="width:${pct === null ? 0 : Math.max(0, Math.min(100, pct))}%"></div></div>
      <span class="v">${display}</span>
    </div>`;
  }

  _render() {
    if (this._zoomed) return super._render();
    const { env, error } = findEnv(this._hass, this._config);
    if (error) return this._error(error);
    const e = env.entities;
    const { cpu, mem, cpuId, memId } = this._host(env);
    const cs = this._containerStats(env);
    const runPct = cs.total ? (100 * (cs.running ?? 0)) / cs.total : null;
    const rows = [
      this._metric(cpuId, ICONS.cpu, this._t("cpu"), cpu, cpu === null ? "—" : `${cpu < 10 ? cpu.toFixed(1) : Math.round(cpu)}%`, level(cpu, 70, 90)),
      this._metric(memId, ICONS.ram, this._t("memory"), mem, mem === null ? "—" : `${Math.round(mem)}%`, level(mem, 80, 95)),
      this._metric(
        cs.entity,
        ICONS.container,
        this._t("containers"),
        runPct,
        cs.total === null ? "—" : `${esc(cs.running ?? "?")}/${cs.total}`,
        cs.unhealthy > 0 || (runPct !== null && runPct < 100) ? "warn" : "ok"
      ),
    ];
    const foot = [];
    const stacks = this._s(e.stacks);
    if (stacks) foot.push(`<span class="clickable" role="button" tabindex="0" data-key="${esc(e.stacks)}" data-entity="${esc(e.stacks)}">${svgIcon(ICONS.stack)}${esc(countText(stacks))} ${esc(this._tn("stacks_lc", stacks.state))}</span>`);
    const images = this._s(e.image_count);
    if (images)
      foot.push(`<span class="clickable" role="button" tabindex="0" data-key="${esc(e.image_count)}" data-entity="${esc(e.image_count)}">${svgIcon(ICONS.image)}${esc(countText(images))} ${esc(this._tn("images_lc", images.state))}</span>`);
    if (this._config.show_updates !== false && cs.entity && cs.updates !== undefined)
      foot.push(
        `<span class="clickable ${cs.updates > 0 ? "upd" : ""}" role="button" tabindex="0" data-key="${esc(cs.entity)}" data-entity="${esc(cs.entity)}">${svgIcon(ICONS.update)}${esc(cs.updates ?? "—")} ${esc(
          this._tn("updates_lc", cs.updates)
        )}</span>`
      );
    return `<style>${BASE_STYLE}${DIALOG_STYLE}${MINI_STYLE}${MOTION_STYLE}</style>
      <ha-card>
        ${this._header(env)}
        <div class="content">
          ${rows.join("")}
          ${foot.length ? `<div class="foot">${foot.join("")}</div>` : ""}
        </div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

class DockerEditorBase extends HTMLElement {
  // [name, default]
  static get toggles() {
    return [];
  }

  setConfig(config) {
    // dockhand_url (before 2.0) is edited as url: the next change saves it under its new name.
    const { dockhand_url, ...rest } = config;
    this._config = dockhand_url && !rest.url ? { ...rest, url: dockhand_url } : rest;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema(envs = listEnvs(this._hass)) {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      { name: "environment", selector: { select: { mode: "dropdown", options: envs } } },
      { name: "title", selector: { text: {} } },
      { name: "url", selector: { text: { type: "url" } } },
      {
        type: "grid",
        name: "",
        schema: [...this.constructor.toggles].map(([name]) => ({ name, selector: { boolean: {} } })),
      },
      {
        name: "language",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: tr("lang_auto") },
              { value: "en", label: "English" },
              { value: "fr", label: "Français" },
              { value: "de", label: "Deutsch" },
              { value: "es", label: "Español" },
              { value: "sr", label: "Српски" },
              { value: "sr-Latn", label: "Srpski (latinica)" },
              { value: "it", label: "Italiano" },
              { value: "nl", label: "Nederlands" },
              { value: "pt", label: "Português (Portugal)" },
              { value: "pl", label: "Polski" },
              { value: "ro", label: "Română" },
              { value: "da", label: "Dansk" },
              { value: "sv", label: "Svenska" },
              { value: "bg", label: "Български" },
              { value: "ru", label: "Русский" },
              { value: "uk", label: "Українська" },
              { value: "hu", label: "Magyar" },
              { value: "sk", label: "Slovenčina" },
              { value: "cs", label: "Čeština" },
              { value: "sl", label: "Slovenščina" },
              { value: "lv", label: "Latviešu" },
              { value: "el", label: "Ελληνικά" },
            ],
          },
        },
      },
    ];
  }

  // [name, default] for the selected environment (`environment` id, else the first one listed).
  _toggles(_environment) {
    return [...this.constructor.toggles];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const envs = listEnvs(this._hass);
    const envOf = (config) => config.environment || envs[0]?.value;
    const toggles = this._toggles(envOf(this._config));
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => STRINGS[lang(this._hass, this._config)][`${s.name}_helper`];
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        const defaults = Object.fromEntries(this._toggles(envOf(config)));
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: drop empty values and toggles left at their default.
          if (v === "" || v === undefined || v === null || (k in defaults && v === defaults[k])) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...this._config };
    for (const [name, def] of toggles) if (data[name] === undefined) data[name] = def;
    if (!data.environment) data.environment = envs[0]?.value;
    this._form.hass = this._hass;
    // hass is pushed on every state change of Home Assistant while the editor is open: reassign data and
    // schema (the schema only depends on the environments and the language) only when they changed, so
    // ha-form is not re-rendered for unrelated state changes.
    const dataKey = JSON.stringify(data);
    if (dataKey !== this._dataKey) {
      this._dataKey = dataKey;
      this._form.data = data;
    }
    const schemaKey = JSON.stringify([envs, lang(this._hass, this._config)]);
    if (schemaKey !== this._schemaKey) {
      this._schemaKey = schemaKey;
      this._form.schema = this._schema(envs);
    }
  }
}

class DockerCardEditor extends DockerEditorBase {
  static get toggles() {
    return [
      ["show_stats", true],
      ["show_counts", true],
      ["show_stacks", true],
      ["show_containers", false],
      ["show_controls", true],
      ["only_problems", false],
      ["expand_stacks", false],
      ["expand_containers", false],
    ];
  }

  // Monitor Docker has no stacks: its containers list is shown by default.
  _toggles(environment) {
    const md = String(environment || "").startsWith("monitor_docker.");
    return super._toggles(environment).map(([name, def]) => [name, name === "show_containers" ? md : def]);
  }
}

class DockerMiniCardEditor extends DockerEditorBase {
  static get toggles() {
    return [
      ["show_updates", true],
      ["zoom", true],
    ];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("docker-card", DockerCard);
define("docker-mini-card", DockerMiniCard);
define("docker-card-editor", DockerCardEditor);
define("docker-mini-card-editor", DockerMiniCardEditor);
// Card types before 2.0: same cards, kept working (subclasses, an element class is defined only once).
define("dockhand-card", class extends DockerCard {});
define("dockhand-mini-card", class extends DockerMiniCard {});

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "docker-card",
    name: "Docker Card",
    description: "Monitor and control Docker hosts (Dockhand, Monitor Docker, Portainer): CPU, memory, containers, stacks and updates.",
  },
  {
    type: "docker-mini-card",
    name: "Docker Mini Card",
    description: "Compact Docker host overview (Dockhand, Monitor Docker, Portainer): CPU, memory, containers and updates.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-docker-card" });
}

console.info(
  `%c DOCKER-CARD %c v${VERSION} `,
  "color: white; background: #f26b21; font-weight: 700;",
  "color: #f26b21; background: white; font-weight: 700;"
);
