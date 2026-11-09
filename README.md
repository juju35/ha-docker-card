# ha-docker-card

[![Marketplace](https://img.shields.io/badge/Marketplace-Custom-41BDF5.svg)](https://www.home-assistant.io/integrations/marketplace/)
[![HACS Validation](https://github.com/juju35/ha-docker-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-docker-card/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-docker-card/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-docker-card/actions/workflows/validate.yml)
[![Lint](https://github.com/juju35/ha-docker-card/actions/workflows/lint.yml/badge.svg)](https://github.com/juju35/ha-docker-card/actions/workflows/lint.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-docker-card)](https://github.com/juju35/ha-docker-card/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/juju35/ha-docker-card/blob/main/LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/julienstep9)

Lovelace cards for Home Assistant to monitor and control Docker hosts: CPU, memory, containers, stacks and pending updates at a glance.

Supported integrations:

- [Dockhand](https://github.com/raetha/ha-dockhand) — environments managed by [Dockhand](https://dockhand.pro), with stacks, Git sync and image updates;
- [Monitor Docker](https://github.com/ualex73/monitor_docker) — Docker hosts and their containers;
- [Portainer](https://www.home-assistant.io/integrations/portainer/) — Portainer endpoints, their stacks and containers, with image updates.

Entities are **discovered automatically**, you don't have to pick them one by one, and it works whatever your Home Assistant language.

[![Open your Home Assistant instance and open a repository inside the Marketplace.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-docker-card&category=plugin)

| Docker Card | Docker Mini Card |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card.png" alt="docker-card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/mini-card.png" alt="docker-mini-card" width="400"> |

## Features

- Two cards: a full **Docker Card** and a compact **Docker Mini Card**
- Automatic discovery of the Dockhand environments, Monitor Docker instances and Portainer endpoints (several of each supported)
- CPU, memory and running containers gauges, Docker version and connection type
- CPU and RAM over the last 24 hours (recorder statistics), drawn behind the CPU and RAM gauges and, on the mini card, behind the CPU and RAM rows, on a real time axis: missing data shows as a gap
- Configurable CPU and memory alert thresholds (orange / red)
- Stacks, images, volumes, networks and pending updates counters
- Stacks list with status, Git badge, sync errors and available updates
- Optional containers list with state, health, image and available updates, a search field (filters by name) and a sort by name, CPU or memory; each container's CPU over the last 24 hours drawn behind its row (with `show_history`)
- Image update button on containers with an update available (Dockhand, Portainer): it asks for confirmation, then installs the update (`update.install`)
- Start / stop and restart buttons for stacks and containers (with confirmation)
- "Only items needing attention" mode: stopped, unhealthy or outdated first
- Click any value to open its Home Assistant history (more-info dialog)
- Detail button at the top right of the mini card: it switches to the full card and back; a click anywhere outside the card brings the compact view back
- Visual editor in the dashboard UI for both cards (no YAML needed)
- Light and dark mode; English, French, German, Spanish, Serbian (Cyrillic and Latin), Italian, Dutch, European Portuguese, Polish, Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian and Greek
- Single file, no external dependency

## Supported integrations

| Integration | What the cards show |
|---|---|
| [Dockhand](https://github.com/raetha/ha-dockhand) (Marketplace) | Everything: CPU, memory and containers gauges, Docker version, stacks with Git badge, sync errors and updates, images, volumes, networks, containers, start / stop and restart |
| [Monitor Docker](https://github.com/ualex73/monitor_docker) (Marketplace, YAML) | CPU, memory and containers gauges, Docker version, OS and architecture, images, containers with start / stop and restart; no stacks, volumes, networks nor image updates. Details in [Monitor Docker](#monitor-docker) |
| [Portainer](https://www.home-assistant.io/integrations/portainer/) (built in, 2025.10 and later) | Status, Docker version, OS and architecture, CPU, memory and containers gauges, images and updates, stacks and containers with start / stop and restart. Details in [Portainer](#portainer) |

Several environments, instances and endpoints are supported, and the sources can be mixed: each one shows in the editor's environment list.

## Prerequisites

Home Assistant 2024.8 or later, and one of:

- the [Dockhand integration](https://github.com/raetha/ha-dockhand) (available in the Marketplace), installed and configured;
- the [Monitor Docker integration](https://github.com/ualex73/monitor_docker) (available in the Marketplace), configured in YAML — see [Monitor Docker](#monitor-docker) below;
- the [Portainer integration](https://www.home-assistant.io/integrations/portainer/) (built into Home Assistant 2025.10 and later) — see [Portainer](#portainer) below.

## Installation

### Via the Marketplace (recommended)

Click the button below to add the repository directly:

[![Add to the Marketplace](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-docker-card&category=plugin)

Then click **Install**, and reload your browser when the Marketplace asks you to.

Or manually:

1. Open **Settings → Marketplace → Add from link** (top right; this needs a GitHub account connected)
2. Add `https://github.com/juju35/ha-docker-card` — Type: **Dashboard**
3. Open **Docker Card** and click **Install**
4. Clear your browser cache and refresh

### Manual

1. Download `docker-card.js` and the `docker-card.i18n.*.js` translation files from the [latest release](https://github.com/juju35/ha-docker-card/releases/latest)
2. Copy them all to `/config/www/` (without the translation files, the cards show in English)
3. Go to **Settings → Dashboards → ⋮ → Resources** → Add resource:
   - URL: `/local/docker-card.js`
   - Type: **JavaScript Module**
4. Clear your browser cache and refresh

## Configuration

### Visual editor

Edit a dashboard, click **Add card** and search for **Docker Card** or **Docker Mini Card**. The first environment is preselected; pick another one in the list if you have several, set an optional title, choose the sections to display and the language. The preview updates live, and options left at their default are kept out of the generated YAML.

### Minimal

```yaml
type: custom:docker-card
```

```yaml
type: custom:docker-mini-card
```

### Full options

```yaml
type: custom:docker-card
environment: Docker host
title: Docker
url: http://192.168.1.10:3000
show_system: true
show_counts: true
show_stacks: true
show_containers: true
show_controls: true
only_problems: false
expand_stacks: false
expand_containers: false
cpu_warning: 70
cpu_critical: 90
ram_warning: 80
ram_critical: 95
language: fr
```

```yaml
type: custom:docker-mini-card
environment: Docker host
title: Docker
url: http://192.168.1.10:3000
show_history: true
show_updates: true
zoom: true
language: fr
```

### Options reference

| Option | Card | Default | Description |
|---|---|---|---|
| `environment` | both | First environment | Environment to display. Dockhand: its name (as shown in Dockhand) or its Home Assistant device id (set by the visual editor). Monitor Docker: `monitor_docker.<prefix>` (`monitor_docker.docker` for `name: Docker`). Portainer: the endpoint name or its device id |
| `title` | both | Environment name | Card title |
| `url` | both | Detected | Address opened in a new tab when clicking the header icon. Defaults to the Dockhand web UI known by the integration, or [dockhand.pro](https://dockhand.pro) if none ([Monitor Docker](https://github.com/ualex73/monitor_docker) for a Monitor Docker instance). Portainer: the endpoint dashboard in Portainer |
| `show_system` | full | `true` | CPU, RAM and running containers gauges (`show_stats` before 3.5.0, still read) |
| `show_history` | both | `true` | CPU and RAM curves of the last 24 hours (0-100 % scale), from the recorder's 5-minute statistics, placed on a 24 h time axis with a gap where data is missing (shown once the statistics exist). Full card: behind the CPU and RAM gauges (needs `show_system`); mini card: behind the CPU and RAM rows. Not for Portainer, which has no host usage sensor |
| `show_counts` | full | `true` | Stacks, images, volumes, networks and updates counters |
| `show_stacks` | full | `true` | Stacks list |
| `show_containers` | full | `false` (`true` for Monitor Docker) | Containers list |
| `show_controls` | full | `true` | Start / stop, restart and image update buttons (`false`: the update icon only opens the update entity) |
| `only_problems` | full | `false` | Only list stacks and containers that are stopped, unhealthy, out of sync or have an update |
| `expand_stacks` | full | `false` | Stacks list expanded when the card loads (click the section title to fold / unfold) |
| `expand_containers` | full | `false` | Containers list expanded when the card loads (click the section title to fold / unfold) |
| `show_updates` | mini | `true` | Pending updates in the footer |
| `cpu_warning` / `cpu_critical` | both | `70` / `90` | CPU usage (%) from which the CPU gauge or row turns orange / red |
| `ram_warning` / `ram_critical` | both | `80` / `95` | RAM usage (%) from which the RAM gauge or row turns orange / red (`memory_warning` / `memory_critical` before 3.5.0, still read) |
| `zoom` | mini | `true` | Detail button at the top right: switches to the full card and back (`false` removes it) |
| `language` | both | Auto | Force language: `en`, `fr`, `de`, `es`, `sr`, `sr-Latn`, `it`, `nl`, `pt`, `pl`, `ro`, `da`, `sv`, `bg`, `ru`, `uk`, `hu`, `sk`, `cs`, `sl`, `lv` or `el` (auto-detects from HA settings) |

## Upgrading from ha-dockhand-card

Before 2.0, this repository was `ha-dockhand-card` and the cards were `custom:dockhand-card` / `custom:dockhand-mini-card`, loaded from `dockhand-card.js`.

- The old card types keep working: no dashboard to edit. New cards are `custom:docker-card` / `custom:docker-mini-card`.
- `dockhand_url` is now `url`; the old name is still read, and the visual editor saves it under its new name.
- The file is now `docker-card.js`: with the Marketplace, reinstall the card (the dashboard resource follows); with a manual install, update the resource URL to `/local/docker-card.js`.

## Monitor Docker

The cards also show the instances of [Monitor Docker](https://github.com/ualex73/monitor_docker), side by side with the Dockhand environments: pick one in the editor's environment list, where it is labelled `<name> (Monitor Docker)`.

```yaml
# configuration.yaml
monitor_docker:
  - name: Docker
    switchenabled: true   # start / stop buttons (default)
    buttonenabled: true   # restart buttons
```

```yaml
type: custom:docker-card
environment: monitor_docker.docker
```

What the card uses, when the condition is monitored (all of them by default):

| Card | Monitor Docker |
|---|---|
| CPU gauge | `containers_1cpu_percentage` (else `containers_cpu_percentage`), cores from the `version` sensor |
| Memory gauge | `containers_memory_percentage`, used memory from `containers_memory`, host memory from the `version` sensor |
| Containers gauge | `containers_running` / `containers_total` |
| Images counter | `images` |
| Header | Docker version, OS and architecture from the `version` sensor |
| Containers list | `state`, `status`, `health` and `image` of each container (or the `allinone` sensor), its switch and restart button |

Monitor Docker has no stacks, volumes, networks nor image updates: those sections, counters and the updates footer are left out, and the containers list is shown by default. Its entities have no unique id, so the card finds them by their entity id (`sensor.<prefix>_containers_total`, `sensor.<prefix>_<container>_state`, `switch.<prefix>_<container>`…): keep the entity ids Monitor Docker creates. Restart buttons only exist with `buttonenabled`.

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-monitor-docker.png" alt="card with Monitor Docker" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-monitor-docker-dark.png" alt="card with Monitor Docker dark" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/mini-card-monitor-docker.png" alt="mini card with Monitor Docker" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/mini-card-monitor-docker-dark.png" alt="mini card with Monitor Docker dark" width="400"> |

## Portainer

The cards also show the endpoints of the [Portainer integration](https://www.home-assistant.io/integrations/portainer/) (Home Assistant 2025.10 and later), side by side with the other sources: pick one in the editor's environment list, where it is labelled `<name> (Portainer)`.

```yaml
type: custom:docker-card
environment: local
show_containers: true
```

Like for Dockhand, its entities are found through the Home Assistant registries (`translation_key`, endpoint → stack → container devices), whatever their entity ids or language.

| Card | Portainer |
|---|---|
| Header | Status (online chip), Docker version, OS and architecture |
| CPU gauge | Containers' CPU usage added up, against the host's **Total CPU** |
| Memory gauge | Containers' memory usage added up, against the host's **Total memory** (else the largest container memory limit) |
| Containers gauge | Containers running / Container count |
| Images and updates | Image count; updates counted on the containers' image update entities |
| Stacks list | Status, container count and start / stop switch |
| Containers list | State, health, image, image update, start / stop switch and restart button |

Portainer has no host usage sensor: enable the **Total CPU** sensor of the endpoint (disabled by default) for the CPU gauge, and **Total memory** for an exact memory gauge. **Docker version**, **Operating system** and **Architecture** (also disabled by default) fill the header. With no host usage sensor, there are no 24 h CPU and memory curves either. The CPU and memory usage sensors of the containers are diagnostic entities, enabled by default.

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-portainer.png" alt="card with Portainer" width="348"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-portainer-dark.png" alt="card with Portainer dark" width="348"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/mini-card-portainer.png" alt="mini card with Portainer" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/mini-card-portainer-dark.png" alt="mini card with Portainer dark" width="400"> |

## Screenshots

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card.png" alt="card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-dark.png" alt="card dark" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/mini-card.png" alt="mini card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/mini-card-dark.png" alt="mini card dark" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/mini-card-zoom.png" alt="mini card zoomed in" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/mini-card-zoom-dark.png" alt="mini card zoomed in dark" width="400"> |

Only items needing attention (`only_problems: true`, containers list shown, both lists expanded):

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-problems.png" alt="only items needing attention" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-problems-dark.png" alt="only items needing attention dark" width="400"> |

Containers list:

| Light | Dark |
|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-containers.png" alt="containers" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-containers-dark.png" alt="containers dark" width="400"> |

### Animations

| Animation | Light | Dark |
|---|---|---|
| Folding sections | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-sections.gif" alt="sections folding and unfolding" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-sections-dark.gif" alt="sections folding and unfolding dark" width="400"> |
| Live gauges | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-gauges.gif" alt="gauges animating on a state change" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/card-gauges-dark.gif" alt="gauges animating on a state change dark" width="400"> |
| Mini card detail button | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/mini-card-zoom.gif" alt="mini card switching to the full card and back" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-docker-card/main/screenshots/mini-card-zoom-dark.gif" alt="mini card switching to the full card and back dark" width="400"> |

- `card-sections.gif` / `card-sections-dark.gif` — the stacks list folds and unfolds on a click on its title, with the chevron rotating along (the containers list, when shown, works the same way).
- `card-gauges.gif` / `card-gauges-dark.gif` — the CPU and memory rings and labels follow every state change with a smooth transition.
- `mini-card-zoom.gif` / `mini-card-zoom-dark.gif` — the detail button switches the mini card to the full card and back.

## How it works

For Dockhand, the cards read the Home Assistant entity and device registries instead of entity ids: every entity of the Dockhand integration is matched by its `translation_key` (`cpu_usage`, `containers`, `status`, `restart`…) and by the device it belongs to (`Environment`, `Container`, `*Stack`). Entity ids can therefore be in any language or renamed without breaking the cards.

Some sensors of the integration are disabled by default (Docker version, host platform…). Enable them in Home Assistant to show them in the header.

The start / stop button uses the stack or container switch, and the restart button presses the integration's **Restart** button. The image update button of a container calls `update.install` on its update entity; it is shown when the entity has an update available and can install it, and is disabled while the update is in progress. Stopping, restarting and updating ask for confirmation.

The containers list has a search field, which filters it by name as you type, and a sort menu: by name (items needing attention first) or, when the integration provides them, by CPU or memory use, highest first, the value leading each row's detail line. CPU and memory come from Dockhand's container CPU / memory usage sensors (diagnostic), Portainer's container usage sensors or Monitor Docker's `cpu` and `memory` conditions. The search and the sort are not saved in the configuration.

Thresholds:

| Value | Orange | Red |
|---|---|---|
| CPU usage | 70 % | 90 % |
| RAM usage | 80 % | 95 % |
| Containers | some are not running or unhealthy | — |

## Development

```bash
npm install
npm run build        # bundles src/docker-card.js into dist/docker-card.js
npm run check        # builds and checks the card (run in CI)
npm run screenshots  # renders the cards with mock data (scripts/mock-states*.mjs) into screenshots/, PNG and animated GIF (needs ffmpeg)
```

The **Screenshots** workflow re-renders `screenshots/` on every pull request touching `src/`, `scripts/`, `images/` or `package-lock.json` (a Playwright/Chromium bump changes the rendering) and commits the refreshed captures onto the pull request's branch, so the README always matches the code.

`dist/` is not committed: `npm run build` creates it locally, CI builds it on every push, and the release workflow attaches the built file to the release, which is where the Marketplace installs it from.

### Releasing

1. Bump `version` in `package.json`
2. Add a `## <version>` section at the top of [CHANGELOG.md](https://github.com/juju35/ha-docker-card/blob/main/CHANGELOG.md)
3. Push to `main`: the **Release** workflow builds the card, creates the tag and the GitHub release with the changelog section as notes, and attaches `docker-card.js`

## Translations

The cards auto-detect the language from your Home Assistant settings. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |
| Deutsch | `de` |
| Español | `es` |
| Српски | `sr` |
| Srpski (latinica) | `sr-Latn` |
| Italiano | `it` |
| Nederlands | `nl` |
| Português (European) | `pt` |
| Polski | `pl` |
| Română | `ro` |
| Dansk | `da` |
| Svenska | `sv` |
| Български | `bg` |
| Русский | `ru` |
| Українська | `uk` |
| Magyar | `hu` |
| Slovenčina | `sk` |
| Čeština | `cs` |
| Slovenščina | `sl` |
| Latviešu | `lv` |
| Ελληνικά | `el` |

Contributions for additional languages are welcome!

## Credits

Dockhand is a project by [Finsys](https://github.com/Finsys/dockhand), with its Home Assistant integration by [raetha](https://github.com/raetha/ha-dockhand). Monitor Docker is a project by [ualex73](https://github.com/ualex73/monitor_docker). Portainer is a project by [Portainer.io](https://www.portainer.io), with its Home Assistant integration in Home Assistant core.

## License

[MIT](https://github.com/juju35/ha-docker-card/blob/main/LICENSE)

## Support

If you find this project useful, you can support its development:

<a href="https://buymeacoffee.com/julienstep9"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>
