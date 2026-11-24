// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { STRINGS } from "./i18n/strings.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = (config?.language) || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

export const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// Locale of the numbers: Home Assistant's own language when its base matches the card's language
// (keeps the region, e.g. de-CH or fr-CA), otherwise the card's language. Home Assistant's "pt" is
// European Portuguese, which Intl would format as Brazilian, so bare "pt" becomes "pt-PT".
export const fmtLang = (hass, config) => {
  const l = lang(hass, config);
  const ha = hass && (hass.locale?.language || hass.language);
  const loc = ha && ha.split("-")[0] === l ? ha : l;
  return loc === "pt" ? "pt-PT" : loc;
};

// Plural rules of a dictionary: pt is European Portuguese, where 0 takes the plural (Intl's "pt" is Brazilian).
export const pluralLocale = (code) => (code === "pt" ? "pt-PT" : code);

// Counted noun ("4 cores"): the language's Intl.PluralRules form (key_one, key_few, key_many…) when the
// dictionary has it, else `oneKey` for 1 when given, else the key itself. A count that is not a number
// (null, a dash, "unavailable") keeps the key itself.
export const tn = (hass, config, key, n, oneKey) => {
  const code = lang(hass, config);
  const v = n === null || n === undefined || n === "" ? Number.NaN : Number(n);
  if (Number.isFinite(v)) {
    const form = STRINGS[code][`${key}_${new Intl.PluralRules(pluralLocale(code)).select(v)}`];
    if (form) return form;
    if (v === 1 && oneKey) return t(hass, config, oneKey);
  }
  return t(hass, config, key);
};

export const num = (s) => {
  if (!s) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

// Counter value as shown: a dash while the sensor is unknown or unavailable.
export const countText = (s) => (!s || s.state === "unknown" || s.state === "unavailable" ? "—" : s.state);

// Number in the card's language ("1,5" in French): at most `max` decimals, exactly `max` when `fixed`.
export const _numFormats = new Map();
export const fmtNum = (v, locale, max, fixed = false) => {
  const key = `${locale}|${max}|${fixed}`;
  let f = _numFormats.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, { maximumFractionDigits: max, minimumFractionDigits: fixed ? max : 0 });
    _numFormats.set(key, f);
  }
  return f.format(v);
};

// Usage percentage: one decimal under 10 % ("4.2%", "4,2%" in French), whole numbers above.
export const fmtPct = (v, locale = "en") => `${v < 10 ? fmtNum(v, locale, 1, true) : fmtNum(Math.round(v), locale, 0)}%`;

// Data size as [value, unit]: 2 decimals under 10, 1 under 100, none above (trailing zeros dropped).
export const bytesParts = (b, locale = "en") => {
  if (b === null || b === undefined || !Number.isFinite(Number(b))) return null;
  b = Number(b);
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return [fmtNum(b, locale, b >= 100 || i === 0 ? 0 : b >= 10 ? 1 : 2), units[i]];
};

export const fmtBytes = (b, locale) => bytesParts(b, locale)?.join(" ") ?? "—";

// "used / total" label: the unit of used is dropped only when it matches the total's.
export const fmtBytesPair = (used, total, locale) => {
  const u = bytesParts(used, locale);
  const t = bytesParts(total, locale);
  if (!u || !t) return `${fmtBytes(used, locale)} / ${fmtBytes(total, locale)}`;
  return `${u[1] === t[1] ? u[0] : u.join(" ")} / ${t.join(" ")}`;
};

// A data size state in bytes, whatever unit Home Assistant displays it in (Portainer suggests MB).
export const UNIT_BYTES = { B: 1, kB: 1e3, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1048576, GiB: 1073741824, TiB: 1099511627776 };
export const bytesOf = (s) => {
  const v = num(s);
  const k = UNIT_BYTES[s?.attributes?.unit_of_measurement ?? "B"];
  return v === null || !k ? null : v * k;
};

export const level = (v, warn, crit) => (v === null ? "" : v >= crit ? "crit" : v >= warn ? "warn" : "ok");

// Default orange (warning) and red (critical) levels of the CPU and memory usage, in %.
// The card's languages, as the editor offers them (the source of truth for the translation tables' keys).
export const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

export const THRESHOLDS = { cpu_warning: 70, cpu_critical: 90, ram_warning: 80, ram_critical: 95 };

// Options renamed in 3.5.0, still read under their old name: `memory_warning` / `memory_critical` -> `ram_*`,
// `show_stats` -> `show_system`. The new name wins when both are set.
export const LEGACY_OPTIONS = { memory_warning: "ram_warning", memory_critical: "ram_critical", show_stats: "show_system" };
export const normalizeConfig = (config) => {
  const out = { ...config };
  for (const [old, name] of Object.entries(LEGACY_OPTIONS)) {
    if (old in out) {
      if (out[name] === undefined) out[name] = out[old];
      delete out[old];
    }
  }
  return out;
};

// [warning, critical] of a metric ("cpu" or "ram"): the configured values, else the defaults.
export const thresholds = (config, metric) =>
  ["warning", "critical"].map((lvl) => {
    const key = `${metric}_${lvl}`;
    const v = config?.[key];
    return v !== undefined && v !== null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : THRESHOLDS[key];
  });

// Status → color class for containers and stacks.
export const stateClass = (state) => {
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
export const sameSig = (a, b) => !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);

// Patch the shadow DOM in place from the new HTML: nodes whose tag is unchanged are kept, so keyboard
// focus, hover, embedded pictures and CSS transitions survive an update, and only the changed text and
// attributes are written. Rows of a list carry a data-key (their entity or row id) and are matched by it,
// wherever they moved, so a focused row keeps its own data when the list is reordered (a node matched by
// position would be rewritten with the row taking its place, and Enter would act on that row). Nodes
// without a data-key are matched by position.
export const patchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
export const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
export const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
// Moves a kept node. moveBefore (where supported) keeps its focus; insertBefore drops it, which is safe:
// Enter then does nothing rather than act on another row.
export const place = (parent, node, ref) => {
  if (node === ref) return;
  try {
    if (parent.moveBefore && node.parentNode === parent) return parent.moveBefore(node, ref);
  } catch (_e) {
    /* fall back to insertBefore */
  }
  parent.insertBefore(node, ref);
};
export const patchChildren = (cur, next) => {
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
export const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

export const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path d="${path}"/></svg>`;
