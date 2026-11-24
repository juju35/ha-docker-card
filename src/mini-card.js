// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { countText, esc, svgIcon } from "./helpers.js";
import { findEnv } from "./registry-based-resolution.js";
import { BASE_STYLE, DIALOG_STYLE, MOTION_STYLE, inDialog, rangeText, spark, watchOutside } from "./shared-styles.js";
import { DockerCard } from "./full-card.js";

export const MINI_STYLE = `
  /* The header icon keeps the full card's 40 px at every width (the narrow-card rule of BASE_STYLE skips :host([mini])),
     taller than the two title lines: centred, like on the full card. */
  .name { font-size: 16px; }
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  /* Label column of up to 86 px (the bars line up across rows), a bar of at least 24 px, the value at its width. */
  .metric { display: grid; grid-template-columns: 18px minmax(0, 86px) minmax(24px, 1fr) minmax(44px, auto); align-items: center; gap: 8px; font-size: 13px; }
  .metric .icon { color: var(--secondary-text-color); }
  /* 24 h curve of the CPU and memory rows (the recorder's 5-minute means), in the row's colour, behind the bar only:
     it never crosses the label or the value. */
  .metric { position: relative; }
  .metric > :not(.spark) { position: relative; }
  .metric .spark { position: absolute; grid-area: 1 / 3 / 2 / 4; inset: -3px 0; width: 100%; height: calc(100% + 6px); pointer-events: none; }
  .spark-a { fill: color-mix(in srgb, var(--c, var(--dh-ok)) 12%, transparent); }
  .spark-l { fill: none; stroke: color-mix(in srgb, var(--c, var(--dh-ok)) 50%, transparent); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
  /* Fixed label column (the bars line up across rows): a longer translation is cut, never drawn over the bar. */
  .metric .lbl { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .metric .v { text-align: right; font-weight: 500; white-space: nowrap; }
  @container dk-card (max-width: 229px) {
    /* Narrow card (6 columns of a small Sections view): the icon names the row, the label stays in aria-label. */
    .metric { grid-template-columns: 18px minmax(24px, 1fr) minmax(44px, auto); gap: 6px; }
    .metric .lbl { display: none; }
    .metric .spark { grid-area: 1 / 2 / 2 / 3; }
  }
  .foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; flex-wrap: wrap; }
  .foot span { display: inline-flex; align-items: center; gap: 4px; }
  .foot .icon { width: 14px; height: 14px; }
  .foot .upd { color: var(--dh-orange); }
`;

// The mini card extends the full card: its detail button (top right, `zoom: false` removes it) switches it to the
// full card's content, same configuration, and back; a click anywhere outside the card brings it back too.
export class DockerMiniCard extends DockerCard {
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
    this._unzoom = watchOutside(
      (ev) => !ev.composedPath().includes(this) && !inDialog(ev),
      () => {
        if (this._zoomed) this._setZoom(false);
      },
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this._unzoom.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom.off();
    // Back to the compact view once off the screen (see the full card).
    this._zoomed = false;
  }

  // A config change (the editor, say) starts over from the compact view: the preview would
  // otherwise stay zoomed in.
  setConfig(config) {
    this._zoomed = false;
    this.setAttribute("mini", "");
    super.setConfig(config);
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  // rows: "auto" in both views: the Sections grid sizes the card to its content (compact rows, or the full card).
  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
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

  // A row: icon, label, bar and value, over its 24 h sparkline when there is one.
  _metric(id, icon, label, pct, display, cls, points) {
    const range = rangeText(points, this._loc());
    return `<div class="metric clickable ${cls}" role="button" tabindex="0" data-entity="${esc(id || "")}" aria-label="${esc(label)} ${display}"${range ? ` title="${esc(label + range)}"` : ""}>
      ${spark(points, this._histEnd)}${svgIcon(icon)}<span class="lbl">${label}</span>
      <div class="bar"><div style="width:${pct === null ? 0 : Math.max(0, Math.min(100, pct))}%"></div></div>
      <span class="v">${display}</span>
    </div>`;
  }

  _render() {
    if (this._zoomed) return super._render();
    const { env, error } = findEnv(this._hass, this._config);
    if (error) return this._error(error);
    const e = env.entities;
    const { cpu, mem, cpuId, memId, perCore } = this._host(env);
    const { hist } = this._usageHist(env);
    const cs = this._containerStats(env);
    const runPct = cs.total ? (100 * (cs.running ?? 0)) / cs.total : null;
    const rows = [
      this._metric(cpuId, ICONS.cpu, this._t("cpu"), cpu, cpu === null ? "—" : `${Math.round(cpu)}%`, perCore ? "ok" : this._level("cpu", cpu), hist?.[cpuId]),
      this._metric(memId, ICONS.ram, this._t("memory"), mem, mem === null ? "—" : `${Math.round(mem)}%`, this._level("ram", mem), hist?.[memId]),
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
    return `<style>${BASE_STYLE}${this._bannerStyle()}${DIALOG_STYLE}${MINI_STYLE}${MOTION_STYLE}</style>
      <ha-card>
        ${this._header(env)}
        <div class="content">
          ${rows.join("")}
          ${foot.length ? `<div class="foot">${foot.join("")}</div>` : ""}
        </div>
      </ha-card>`;
  }
}
