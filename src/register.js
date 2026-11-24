// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { DockerCard } from "./full-card.js";
import { DockerMiniCard } from "./mini-card.js";
import { DockerCardEditor, DockerMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
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
