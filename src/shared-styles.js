// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------
import { ICONS, SOURCES } from "./core.js";
import { bytesOf, esc, fmtLang, fmtPct, level, morph, normalizeConfig, num, sameSig, svgIcon, t, thresholds, tn } from "./helpers.js";
import { findEnv } from "./registry-based-resolution.js";

export const BASE_STYLE = `
  :host { --dh-orange: #f26b21; --dh-ok: var(--success-color, #43a047); --dh-warn: var(--warning-color, #ffa600);
          --dh-crit: var(--error-color, #db4437); --dh-idle: var(--secondary-text-color, #9e9e9e); }
  /* Query container: the header, the mini card rows and the gauges adapt to the card width (Sections view). */
  :host { display: block; }
  ha-card { overflow: hidden; container: dk-card / inline-size; }
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
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .header .chip { flex: 0 1 auto; min-width: 0; overflow: hidden; line-height: 16px; box-sizing: border-box; }
  /* Unavailable / unknown: the dot stays grey, the text takes the primary text colour (grey text on a grey
     tint would stay under 4.5:1). */
  .header .chip.idle { color: var(--primary-text-color); }
  .chip-label { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* Banner and classic header: the chip sits on the title line, right after the title, when the whole title and its
     whole label fit there. Otherwise the chip goes on its own line under the subtitle, and when even that is too tight
     only its dot is left (its text stays in title and aria-label). Decided by measure (see _fitPill). */
  .titles { display: flex; flex-direction: column; align-items: flex-start; container: dk-titles / inline-size; }
  .titles > * { max-width: 100%; }
  .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .trow .name { flex: 0 1 auto; min-width: 0; }
  .trow .chip { flex: none; max-width: none; }
  .titles.pill-below .trow { display: contents; }
  .titles.pill-below .trow .name, .titles.pill-below .trow .chip { max-width: 100%; }
  .titles.pill-below .trow .chip { order: 3; margin-top: 3px; }
  .titles.pill-dot .trow .chip { padding: 6px; } .titles.pill-dot .trow .chip .chip-label { display: none; }
  @container dk-card (max-width: 239px) {
    .header { gap: 6px; }
    /* The full card's icon draws smaller; the mini card's keeps its 40 px, compact or detailed view. */
    :host(:not([mini])) .header .logo { height: 32px; width: 32px; }
    :host(:not([mini])) .header .logo .icon { width: 18px; height: 18px; }
  }
  /* At 200 px or less, only the coloured dot, in an 18 px chip that no longer shrinks: its text stays in title and
     aria-label. */
  @container dk-card (max-width: 200px) {
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
export const MOTION_STYLE = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; animation: none !important; }
  }
`;

// In-card confirmation popup, as in the other ha-* cards (ha-vacuum-card, ha-system-monitor-card): a backdrop
// over the card with a small dialog at the top of the card, so it stays in view when the card is long.
// window.confirm() is blocking and silently neutralised in some webviews; this popup is neither.
// ---------------------------------------------------------------------------
// Illustrated header: the Docker whale carrying its containers on the sea, at the right of a 90 px banner
// (200 × 80 picture over a 10 px quay strip). The left of the banner is open sky for the icon and the title.
// ---------------------------------------------------------------------------

// The width of an element's whole text in fractional pixels, even while it is cut with an ellipsis (0 when hidden).
export const textWidth = (el) => {
  if (!el?.getClientRects?.().length || typeof document.createRange !== "function") return 0;
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
};

// Night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the day
// picture after sunset).
export const dkIsNight = (hass, config) => {
  const theme = config?.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// The containers on the whale's back: [x, y, colour], bottom row first; DK_STOP_ORDER is the order in which
// they turn grey as containers stop, DK_SICK the one that turns red when a container is unhealthy.
export const DK_BOXES = [
  [30, -27, "#e5484d"],
  [42, -27, "#f5b400"],
  [54, -27, "#43a047"],
  [66, -27, "#ffffff"],
  [78, -27, "#d4537e"],
  [42, -36, "#1d9e75"],
  [54, -36, "#ef9f27"],
  [66, -36, "#2496ed"],
  [54, -45, "#7f77dd"],
];
export const DK_STOP_ORDER = [8, 7, 4, 5, 0, 6, 3, 1, 2];
export const DK_SICK = 3;
export const DK_WAVE = `M0 60 q5 -2 10 0${" t10 0".repeat(21)}`;

// state: running | stopped (some containers down, `stoppedShare` of them) | unhealthy | offline | unknown.
// `uid` keeps the ids of each card's gradients apart on a page with several cards.
export const dkScene = (uid, night, state, stoppedShare = 0) => {
  const down = state === "offline" || state === "unknown";
  const grey = down ? DK_BOXES.length : state === "stopped" ? Math.min(DK_BOXES.length - 1, Math.max(1, Math.round(stoppedShare * DK_BOXES.length))) : 0;
  const greyed = new Set(DK_STOP_ORDER.slice(0, grey));
  const boxes = DK_BOXES.map(([x, y, c], i) => {
    const sick = state === "unhealthy" && i === DK_SICK;
    const fill = sick ? "#e5484d" : greyed.has(i) ? (night ? "#4a5466" : "#aab4bf") : c;
    return `<rect class="dk-box${sick ? " dk-sick" : ""}${greyed.has(i) ? " dk-off" : ""}" x="${x}" y="${y}" width="11" height="9" fill="${fill}" stroke="#1b74bf" stroke-width=".6"/>`;
  }).join("");
  const alert =
    state === "unhealthy"
      ? `<g class="dk-alert"><circle cx="71.5" cy="-33" r="4.2" fill="#e5484d"/><path d="M71.5 -35.6v3.2M71.5 -30.6v.2" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/></g>`
      : "";
  const stars = night
    ? `<g fill="#fff" opacity=".8">${[[12, 8], [44, 18], [96, 6], [132, 24], [168, 10], [188, 30], [70, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".6"/>`).join("")}</g>`
    : "";
  const sun = night
    ? `<circle cx="40" cy="14" r="5.5" fill="#f3eed2"/><circle cx="42.5" cy="12" r="4.5" fill="#13254a"/>`
    : `<circle cx="40" cy="14" r="9" fill="#ffd65a" opacity=".28"/><circle cx="40" cy="14" r="6" fill="#ffd65a"/>`;
  return `<svg class="dk-scene dk-${state}" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
    <defs><linearGradient id="dk-sea-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? "#1b4470" : "#5cbdf0"}"/><stop offset="1" stop-color="${night ? "#12304f" : "#3aa4e0"}"/></linearGradient></defs>
    ${stars}${sun}<g transform="translate(90 12)"><path class="dk-cloud" d="M-14,4 C-17,4 -18,0 -14.5,-1 C-14,-5 -8,-6 -6,-3 C-4,-8 4,-8 5,-2 C9,-3 12,0 10,4 Z"/></g>
    <rect y="58" width="200" height="22" fill="url(#dk-sea-${uid})"/>
    <g class="dk-bob"><g transform="translate(66 62)"><g class="dk-whale">
      <path d="M0 -4 C0 -14 14 -18 40 -18 H82 C90 -18 94 -16 96 -12 C100 -16 106 -24 112 -24 C110 -18 108 -12 102 -8 C98 4 82 12 56 12 C24 12 0 8 0 -4Z" fill="#2496ed"/>
      <path d="M4 2 C14 8 34 10 56 10 C76 10 90 6 98 -2 C94 8 80 14 56 14 C30 14 10 10 4 2Z" fill="#e8f4fd"/>
      <circle cx="14" cy="-6" r="2" fill="#0b2a4a"/><circle cx="14.6" cy="-6.6" r=".6" fill="#fff"/>
      <path d="M24 0 q4 3 8 0" stroke="#1b74bf" stroke-width="1" fill="none"/>
      ${boxes}${alert}
      ${state === "running" || state === "stopped" ? `<g class="dk-spout"><path d="M18 -18 q-2 -6 -6 -8 M18 -18 q0 -7 0 -10 M18 -18 q2 -6 6 -8" stroke="#bfe6ff" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>` : ""}
      ${down ? `<g class="dk-zz" fill="${night ? "#a9c4ff" : "#3b5b78"}" font-size="7" font-family="sans-serif"><text x="8" y="-20">z</text><text x="2" y="-27" font-size="5">z</text></g>` : ""}
    </g></g></g>
    <path class="dk-wave" d="${DK_WAVE}" stroke="${night ? "#2b5a86" : "#b5e2fa"}" stroke-width="1.2" fill="none"/>
  </svg>`;
};

// The banner: sky gradient (day / night), the scene at the right, the quay strip at the bottom, the header
// (icon, title, subtitle, chip) on the sky at the left. 90 px on the full card and the mini card.
export const DK_BANNER_STYLE = `
  .banner { position: relative; height: 90px; overflow: hidden; color: #0d2a45;
            background: linear-gradient(90deg, #f1f8ff 0%, #e2f1fd 34%, #b9def8 70%, #9fd0f3 100%); }
  .banner.night { color: #fff; background: linear-gradient(90deg, #1b2f52 0%, #15284a 36%, #0f1f3d 72%, #0a1830 100%); }
  /* The scene leaves the text at least 230 px (icon, a few characters of the title, the whole chip), smaller on a
     narrower card, anchored on the quay at the bottom right. */
  .dk-scene { position: absolute; right: 0; bottom: 10px; height: 80px; width: clamp(0px, calc(100% - 230px), 200px);
              -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 14%); mask-image: linear-gradient(90deg, transparent 0, #000 14%); }
  .dk-ground { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: #9aa1a9; box-shadow: inset 0 2px 0 #b5bbc2; }
  .night .dk-ground { background: #2c323b; box-shadow: inset 0 2px 0 #3a414c; }
  /* Centred on the sky above the quay, at its own height: the chip still lines up with the title line. */
  .banner .header { position: absolute; left: 0; top: calc(50% - 5px); transform: translateY(-50%); right: clamp(0px, calc(100% - 230px), 200px);
                    padding: 0 8px 0 12px; box-sizing: border-box; }
  .banner .name { font-weight: 500; }
  .banner .sub { color: #3b5b78; }
  .banner.night .sub { color: rgba(255,255,255,.78); }
  /* The round icon on the sky: a light tile, the icon in the status colour (lighter at night). */
  .banner .logo { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 22%, transparent); }
  .banner.night .logo { color: color-mix(in srgb, var(--c) 72%, #fff); background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner .chip { background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .chip { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .banner > .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; width: 24px; height: 24px; color: #33506b;
                    background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner.night > .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner > .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night > .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
  /* The classic header ended with 8 px of padding: the content keeps that gap under the quay strip. */
  .banner + .content { padding-top: 10px; }
  .banner + .content:empty { display: none; }
  /* Narrow card: no room for the scene beside the text, the sky alone stays. */
  @container dk-card (max-width: 359px) { .dk-scene { display: none; } .banner .header { right: 0; } :host([mini]) .banner .header { right: 30px; } }
  .dk-cloud { fill: #fff; opacity: .92; animation: dk-drift 4s ease-in-out infinite alternate; }
  .night .dk-cloud { opacity: .1; }
  .dk-bob { animation: dk-bob 3s ease-in-out infinite; }
  .dk-wave { animation: dk-wave 3s ease-in-out infinite; }
  .dk-spout { animation: dk-spout 3s ease-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
  .dk-sick, .dk-alert { animation: dk-blink 1.2s ease-in-out infinite; }
  .dk-zz { animation: dk-blink 2.4s ease-in-out infinite; }
  .dk-offline .dk-whale, .dk-unknown .dk-whale { filter: saturate(.25); }
  .dk-offline .dk-bob, .dk-unknown .dk-bob { animation: none; transform: translateY(1.5px); }
  @keyframes dk-drift { to { transform: translateX(4px); } }
  @keyframes dk-bob { 50% { transform: translateY(1.5px); } }
  @keyframes dk-wave { 50% { transform: translateX(-6px); } }
  @keyframes dk-blink { 50% { opacity: .25; } }
  @keyframes dk-spout { 0%, 40% { opacity: 0; transform: scaleY(.2); } 55% { opacity: 1; transform: scaleY(1); } 90%, 100% { opacity: 0; transform: scaleY(1.1); } }
`;

export const DIALOG_STYLE = `
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
export const CONFIRM_GUARD_MS = 400;

// A click inside a dialog (more-info opened from the card, say) is not a click outside the card.
export const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app) a
// tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to the
// page. It counts when the press and the release are both outside the card (a slider dragged out of the card does not
// fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click
// event. `tap(ev)` (a press and a release at the same spot) is for the tests.
export const watchOutside = (isOut, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOut(ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOut(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOut(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};

// Sparkline of a series of { t, v } points (24 h of usage ending at `end`), scaled from 0 to its peak; nothing
// under two points. Points sit on a real time axis: x is their time within the 24 h window, so a missing stretch
// (recorder stopped, sensor unavailable) is a gap — the line and area are broken where two consecutive points
// are more than two sampling periods apart, instead of being joined across the hole.
export const HIST_PERIOD = 5 * 60000;
export const HIST_REFRESH = HIST_PERIOD;
export const HIST_WINDOW = 864e5;
// "· 24 h 2 % – 34 %": a curve's lowest and highest percent, for a tooltip (the curve itself has no scale); "" without one.
export function rangeText(points, loc) {
  if (!points || points.length < 2) return "";
  const vs = points.map((p) => p.v);
  return ` · 24 h ${fmtPct(Math.min(...vs), loc)} – ${fmtPct(Math.max(...vs), loc)}`;
}

// While the first history answer is on its way: the sparkline's box without a curve, so the card has its final height
// from the first render and does not grow (moving the page under it) when the statistics arrive.
export const HIST_WAIT = Object.freeze([]);
export function spark(points, end, max) {
  if (points === HIST_WAIT) return `<svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"></svg>`;
  if (!points || points.length < 2) return "";
  const peak = max || Math.max(...points.map((p) => p.v)) || 1;
  const x = (t) => Math.max(0, Math.min(100, (100 * (t - (end - HIST_WINDOW))) / HIST_WINDOW)).toFixed(2);
  const y = (v) => (30 - (Math.min(Math.max(0, v), peak) / peak) * 28).toFixed(2);
  const segs = [];
  for (const [i, p] of points.entries()) {
    if (!i || p.t - points[i - 1].t > 2 * HIST_PERIOD) segs.push([]);
    segs.at(-1).push(p);
  }
  // A lone point between two gaps gets a short stroke, so it stays visible.
  const line = segs.map((g) => `M${g.map((p) => `${x(p.t)},${y(p.v)}`).join("L")}${g.length === 1 ? "h0.4" : ""}`).join("");
  const area = segs.map((g) => `M${x(g[0].t)},30L${g.map((p) => `${x(p.t)},${y(p.v)}`).join("L")}L${x(g.at(-1).t)},30Z`).join("");
  return `<svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path class="spark-a" d="${area}"/><path class="spark-l" d="${line}"/></svg>`;
}

export let _dkUid = 0;

export class DockerBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    // Unique per card: keeps the illustration's SVG ids apart when several cards share a page.
    this._uid = ++_dkUid;
    // No rewrite of the card between a press and its click: Home Assistant updates the card several times a second,
    // and a rewrite under the pointer replaces the element pressed, so that the click lands on the card itself and
    // does nothing. The update held back is drawn once released: by the click (registered before the card's own
    // handler, which renders at once), else right after the release.
    this._onPress = () => {
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    };
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      setTimeout(() => {
        this._pressing = false;
        if (this._dirty) this._update();
      }, 0);
    };
    this._onPressClick = () => {
      this._pressing = false;
    };
    this.shadowRoot.addEventListener("pointerdown", this._onPress);
    this.shadowRoot.addEventListener("click", this._onPressClick);
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

  // A tap elsewhere on the page folds the sections back to their defaults (as in ha-carburants-france). On the
  // release, not the press: folding on press would shift the layout under the pointer before the click.
  connectedCallback() {
    this._outside ??= watchOutside(
      (ev) => !ev.composedPath().includes(this) && !inDialog(ev),
      () => {
        const foldsOpen = this._folds && Object.keys(this._folds).length;
        if (!foldsOpen && !this._confirm) return;
        // Closed by a click elsewhere on the page: the focus goes where that click put it.
        if (this._confirm) this._closeConfirm(false);
        if (foldsOpen) {
          this._folds = {};
          this._update();
        }
      },
    );
    this._outside.on();
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._pillResize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._pillWidth) return;
        this._pillWidth = w;
        cancelAnimationFrame(this._pillFrame);
        this._pillFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._pillResize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
    // Back on the page after leaving it: rendered again in its default state.
    if (this._hass && this._config) this._update();
  }

  disconnectedCallback() {
    this._pillResize?.disconnect();
    this._pillWidth = null;
    this._pressing = this._dirty = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    this._outside?.off();
    window.removeEventListener("keydown", this._onKey);
    // Left (another dashboard view, a conditional card hidden): back to the defaults, so that the card does not come
    // back unfolded or with its popup open.
    this._folds = {};
    this._confirm = null;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = normalizeConfig(config);
    // show_title / show_subtitle: the header's title / subtitle, hidden by the stylesheet
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
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

  // Locale of the numbers: the card's language, with Home Assistant's region when it matches.
  _loc() {
    return fmtLang(this._hass, this._config);
  }

  // Class of a CPU or memory usage against its thresholds (configured or default): ok, warn or crit.
  _level(metric, v) {
    return level(v, ...thresholds(this._config, metric));
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  // What the render depends on: registries, language and the states of the environment, its stacks
  // and its containers.
  _signature() {
    const h = this._hass;
    const sig = [h.entities, h.devices, h.language, h.locale?.language, !!h.themes?.darkMode];
    const { env } = findEnv(h, this._config);
    if (!env) return sig;
    if (env.key !== undefined) sig.push(env.key);
    for (const group of [env, ...env.stacks, ...env.containers]) for (const id of Object.values(group.entities)) sig.push(h.states[id]);
    return sig;
  }

  _update(sig) {
    if (!this._hass || !this._config) return;
    // Held back under a press (see the constructor): drawn once released.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    this._sig = sig ?? this._signature();
    let html = this._render();
    if (this._confirm)
      html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${this._confirmHtml()}</ha-card>`);
    if (html !== this._html) {
      this._html = html;
      morph(this.shadowRoot, html);
    }
    this._fitPill();
  }

  // The status pill goes on the title row, right after the title, only when the whole title and the pill's whole
  // label fit there; otherwise it takes its own line under the subtitle (.pill-below) and the title keeps its row
  // (cut only when it does not fit alone). The subtitle then keeps one line (its whole text in its tooltip), and when
  // the block still runs out of the banner or into its ground strip, or the label does not fit its own line, the pill
  // keeps its dot alone (.pill-dot, the label in its tooltip and aria-label). Measured after each render and on each
  // new width, never by a fixed width, so that every language fits.
  _fitPill() {
    // Home Assistant's <ha-card> (a Lit element) shows its content only from its first update, a microtask after it
    // is connected: measured before, everything is 0 px wide and the pill lands on the wrong line. Fitted then.
    const haCard = this.shadowRoot?.querySelector?.("ha-card");
    if (haCard && haCard.hasUpdated === false) {
      this._pillWait ??= (haCard.updateComplete?.then ? haCard.updateComplete : new Promise((r) => requestAnimationFrame(r))).then(() => {
        this._pillWait = null;
        this._fitPill();
      });
      return;
    }
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const chips = [...t.querySelectorAll(".chip")];
      if (!chips[0]?.getBoundingClientRect) continue;
      t.classList.remove("pill-below", "pill-dot");
      const sub = t.querySelector(".sub");
      sub?.removeAttribute("title");
      if (!chips[0].querySelector(".chip-label")?.getClientRects().length) continue;
      const avail = t.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(chips[0].parentElement).columnGap) || 0;
      const widths = chips.map((c) => {
        const cs = getComputedStyle(c);
        return c.getBoundingClientRect().width + (parseFloat(cs.marginLeft) || 0) + (parseFloat(cs.marginRight) || 0);
      });
      if (textWidth(t.querySelector(".name")) + widths.reduce((w, c) => w + gap + c, 0) <= avail + 0.01) continue;
      t.classList.add("pill-below");
      if (sub && sub.scrollWidth > sub.clientWidth) sub.title = sub.textContent.trim();
      const banner = t.closest(".banner");
      const box = banner?.getBoundingClientRect();
      const floor = banner?.querySelector(".dk-ground")?.getBoundingClientRect().top ?? box?.bottom;
      const r = t.getBoundingClientRect();
      const out = box && (r.top < box.top - 0.5 || r.bottom > floor + 0.5);
      const room = avail;
      if (out || widths.some((w) => w > room + 0.01)) t.classList.add("pill-dot");
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
    } else if (action === "install") {
      // Unavailable or already installing: nothing to do (the button is disabled, keyboard included).
      const s = this._s(entity);
      if (!s || s.state === "unavailable" || s.attributes?.in_progress) return;
      this._openConfirm(
        {
          text: this._t("confirm_install", { name: label }),
          ok: this._t("install"),
          run: () => this._call("update", "install", { entity_id: entity }),
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

  // In-card confirmation before stopping, restarting or updating (see DIALOG_STYLE): Cancel, Escape, the backdrop
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

  // Overall state of the host, for the header icon colour and the illustration: offline (red), unhealthy
  // containers (red), some containers stopped (amber), all running (green), else unknown (grey).
  _hostState(env) {
    const online = this._s(env.entities.online);
    if (online?.state === "off") return { state: "offline", cls: "crit" };
    const cs = this._containerStats(env);
    const total = Number.isFinite(cs.total) ? cs.total : null;
    if ((online && online.state !== "on") || (!online && total === null)) return { state: "unknown", cls: "idle" };
    if (cs.unhealthy > 0) return { state: "unhealthy", cls: "crit" };
    const stopped = total && Number.isFinite(cs.running) ? Math.max(0, total - cs.running) : 0;
    if (stopped > 0) return { state: "stopped", cls: "warn", share: stopped / total };
    return { state: "running", cls: "ok" };
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
    // The icon is always in the colour of the host's overall state (see _hostState).
    const host = this._hostState(env);
    const sub = [docker && docker !== "unknown" && docker !== "unavailable" ? `Docker ${docker}` : null, platform, conn].filter((v) => v && v !== "unknown" && v !== "unavailable");
    const illustrated = c.illustration !== false;
    const zoom = this._zoomButton();
    const chip = online
      ? `<span class="chip clickable ${chipCls}" role="button" tabindex="0" data-entity="${esc(online.entity_id)}" title="${chipText}" aria-label="${chipText}"><span class="dot"></span><span class="chip-label">${chipText}</span></span>`
      : "";
    const name = `<div class="name">${esc(c.title || env.name)}</div>`;
    // On the banner and the classic header alike, the chip sits right after the title (its own line under the
    // subtitle when the header is narrow).
    const header = `
      <div class="header">
        <a class="logo-link logo ${host.cls}" href="${esc(this._logoUrl(env))}" target="_blank" rel="noopener noreferrer" title="${esc(srcName)}" aria-label="${esc(srcName)}">${svgIcon(ICONS.docker)}</a>
        <div class="titles">
          <div class="trow">${name}${chip}</div>
          ${sub.length ? `<div class="sub">${esc(sub.join(" · "))}</div>` : ""}
        </div>
        ${illustrated ? "" : zoom}
      </div>`;
    if (!illustrated) return header;
    const night = dkIsNight(this._hass, c);
    return `<div class="banner${night ? " night" : ""}">${dkScene(this._uid, night, host.state, host.share)}<div class="dk-ground"></div>${header}${zoom}</div>`;
  }

  // The illustration's styles, only when it is shown.
  _bannerStyle() {
    return this._config.illustration === false ? "" : DK_BANNER_STYLE;
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
      // Without the core count (the endpoint's Total CPU sensor is disabled by default), the containers' CPU sum
      // in Docker's convention (100 % = one core), flagged so it is labelled and not coloured as a host usage.
      return {
        cpu: cpuSum === null ? null : cores ? cpuSum / cores : cpuSum,
        perCore: !cores && cpuSum !== null,
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
