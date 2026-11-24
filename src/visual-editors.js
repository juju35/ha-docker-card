// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { LANGUAGES, THRESHOLDS, lang, normalizeConfig, t } from "./helpers.js";
import { listEnvs } from "./registry-based-resolution.js";
import { STRINGS } from "./i18n/strings.js";

// Editor fields other than toggles and thresholds, left out of the YAML at their default.
export const EDITOR_DEFAULTS = { illustration_theme: "auto" };

export class DockerEditorBase extends HTMLElement {
  // [name, default]
  static get toggles() {
    return [];
  }

  setConfig(config) {
    // dockhand_url (before 2.0) is edited as url: the next change saves it under its new name.
    const { dockhand_url, ...rest } = normalizeConfig(config);
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
        name: "illustration_theme",
        selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((v) => ({ value: v, label: tr(`theme_${v}`) })) } },
      },
      {
        type: "grid",
        name: "",
        schema: [...this.constructor.toggles].map(([name]) => ({ name, selector: { boolean: {} } })),
      },
      {
        type: "grid",
        name: "",
        schema: Object.keys(THRESHOLDS).map((name) => ({
          name,
          selector: { number: { min: 0, max: 100, step: 1, mode: "box", unit_of_measurement: "%" } },
        })),
      },
      {
        name: "language",
        selector: {
          select: {
            mode: "dropdown",
            options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))],
          },
        },
      },
    ];
  }

  // [name, default] for the selected environment (`environment` id, else the first one listed).
  // Monitor Docker has no stacks: its containers list is shown by default.
  _toggles(environment) {
    const md = String(environment || "").startsWith("monitor_docker.");
    return this.constructor.toggles.map(([name, def]) => [name, name === "show_containers" ? md : def]);
  }

  _render() {
    if (!this._hass || !this._config) return;
    const envs = listEnvs(this._hass);
    const envOf = (config) => config.environment || envs[0]?.value;
    const toggles = this._toggles(envOf(this._config));
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => {
        // Threshold fields: "CPU: orange from", "RAM: red from".
        const m = /^(cpu|ram)_(warning|critical)$/.exec(s.name);
        const tr = (k) => t(this._hass, this._config, k);
        return m ? `${tr(m[1] === "ram" ? "memory" : m[1])}: ${tr(`threshold_${m[2]}`)}` : tr(s.name);
      };
      this._form.computeHelper = (s) => STRINGS[lang(this._hass, this._config)][`${s.name}_helper`];
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        const defaults = { ...Object.fromEntries(this._toggles(envOf(config))), ...THRESHOLDS, ...EDITOR_DEFAULTS };
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
    for (const [name, def] of [...toggles, ...Object.entries(THRESHOLDS), ...Object.entries(EDITOR_DEFAULTS)]) if (data[name] === undefined) data[name] = def;
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

export class DockerCardEditor extends DockerEditorBase {
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_system", true],
      ["show_history", true],
      ["show_counts", true],
      ["show_stacks", true],
      ["show_containers", false],
      ["show_controls", true],
      ["only_problems", false],
      ["expand_stacks", false],
      ["expand_containers", false],
    ];
  }
}

export class DockerMiniCardEditor extends DockerEditorBase {
  static get toggles() {
    // The full card's options too: its detail button switches to the full card, which reads them.
    return [...DockerCardEditor.toggles, ["show_updates", true], ["zoom", true]];
  }
}
