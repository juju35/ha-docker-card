// Browser test (Chromium through Playwright): at the narrowest widths of the Sections view (6 columns of a
// 320 px section, about 156 px, up to a full 460 px column), in long translations, the header title never
// collapses, no chip or button leaves the card, the mini card bars and values stay visible and the full
// card gauges fit. Skipped when Playwright or Chromium is not installed, except in CI, where it must run.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { devices, entities, states } from "../scripts/mock-states.mjs";
import { source } from "./source.mjs";

const src = source;
let browser;
let skip = false;
before(async () => {
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  } catch (err) {
    if (process.env.CI) throw err;
    skip = `Chromium not available: ${err.message.split("\n")[0]}`;
  }
});
after(() => browser?.close());

const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;border-radius:12px;border:1px solid #ddd;overflow:hidden}</style><slot></slot>";
  }
});`;

// Renders each card at each width and returns the measurements (px) of what must stay visible.
const measure = async (cards) => {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1200 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:Roboto,Helvetica,Arial,sans-serif}</style></head><body><div id="root"></div></body></html>`
  );
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: src });
  const out = await page.evaluate(
    ({ cards, states, entities, devices }) => {
      const res = [];
      for (const { type, width, language, zoom } of cards) {
        const box = document.createElement("div");
        box.style.width = `${width}px`;
        document.getElementById("root").replaceChildren(box);
        const el = document.createElement(type);
        el.setConfig({ type: `custom:${type}`, language });
        el.hass = { states, entities, devices, language, locale: { language }, callService: () => {} };
        box.appendChild(el);
        if (zoom) el.shadowRoot.querySelector(".zoom").dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
        const r = el.shadowRoot;
        const card = r.querySelector("ha-card").getBoundingClientRect();
        const rect = (n) => n.getBoundingClientRect();
        const outside = [...r.querySelectorAll(".header > *, .gauge, .metric > *, .foot > span, .count-tile")]
          .filter((n) => {
            const b = rect(n);
            return b.width > 0 && (b.right > card.right + 0.5 || b.left < card.left - 0.5);
          })
          .map((n) => n.className.baseVal ?? n.className);
        const name = r.querySelector(".header .name");
        const chip = r.querySelector(".header .chip");
        const center = (n) => (n ? rect(n).top + rect(n).height / 2 - card.top : null);
        res.push({
          type: zoom ? "mini-zoomed" : type,
          width,
          language,
          title: Math.round(rect(name).width),
          chip: chip ? Math.round(rect(chip).width) : null,
          titleCenter: center(name),
          chipCenter: center(chip),
          hasSub: !!r.querySelector(".header .sub"),
          logo: Math.round(rect(r.querySelector(".header .logo")).width),
          outside,
          bars: [...r.querySelectorAll(".metric .bar")].map((n) => Math.round(rect(n).width)),
          clipped: [...r.querySelectorAll(".metric .v, .gauge .val b")].filter((n) => n.scrollWidth > n.clientWidth + 0.5).map((n) => n.textContent),
          gaugeOverflow: [...r.querySelectorAll(".gauge")].filter((g) => g.scrollWidth > g.clientWidth + 0.5).length,
        });
      }
      return res;
    },
    { cards, states, entities, devices }
  );
  await page.close();
  assert.deepEqual(errors, []);
  return out;
};

const WIDTHS = [156, 175, 200, 246, 300, 460];
const LANGS = ["en", "pl", "sr", "sr-Latn", "el", "ru", "bg"];
const cards = [];
for (const width of WIDTHS)
  for (const language of LANGS)
    for (const [type, zoom] of [
      ["docker-mini-card", false],
      ["docker-mini-card", true],
      ["docker-card", false],
    ])
      cards.push({ type, width, language, zoom });

test("narrow widths: title kept, nothing out of the card, bars and values visible", async (t) => {
  if (skip) return t.skip(skip);
  for (const m of await measure(cards)) {
    const at = `${m.type} ${m.width}px ${m.language}`;
    t.diagnostic(`${at}: title ${m.title}px, chip ${m.chip}px, bars ${m.bars.join("/")}`);
    assert.ok(m.title >= 28, `${at}: title only ${m.title}px wide`);
    assert.deepEqual(m.outside, [], `${at}: out of the card`);
    for (const b of m.bars) assert.ok(b >= 20, `${at}: bar only ${b}px wide`);
    assert.deepEqual(m.clipped, [], `${at}: clipped values`);
    assert.equal(m.gaugeOverflow, 0, `${at}: gauge content wider than its column`);
    // The mini card's header icon keeps its 40 px at every width, compact or detailed; only the full card's shrinks.
    if (m.type !== "docker-card") assert.equal(m.logo, 40, `${at}: header icon ${m.logo}px`);
    else assert.equal(m.logo, m.width < 240 ? 32 : 40, `${at}: header icon ${m.logo}px`);
  }
});

test("header chip lines up with the title line when there is a subtitle", async (t) => {
  if (skip) return t.skip(skip);
  for (const m of await measure([
    { type: "docker-card", width: 460, language: "en" },
    { type: "docker-mini-card", width: 460, language: "en" },
    { type: "docker-mini-card", width: 300, language: "pl" },
  ])) {
    assert.ok(m.hasSub, "the mock environment has a subtitle");
    assert.ok(Math.abs(m.chipCenter - m.titleCenter) <= 2, `${m.type} ${m.width}px: chip centre ${m.chipCenter} vs title centre ${m.titleCenter}`);
  }
});

// Card mounted in `wrapCss` (a box of `width` px, or a container without a definite width), in each
// language and with every entity normal or unavailable. Returns, per card, the header chip label and title
// measurements and the ha-card width.
const render = async ({ widths, wraps = [], langs, states: stateSets }) => {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1200 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:Roboto,Helvetica,Arial,sans-serif}</style></head><body><div id="root"></div></body></html>`
  );
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: src });
  const out = await page.evaluate(
    ({ widths, wraps, langs, stateSets, entities, devices }) => {
      const res = [];
      const boxes = [...widths.map((w) => ({ at: `${w}px`, css: `width:${w}px` })), ...wraps];
      for (const { at, css, wrapped, childCss, track } of boxes)
        for (const language of langs)
          for (const [st, states] of Object.entries(stateSets))
            for (const [type, zoom, illustration] of [
              ["docker-mini-card", false, true],
              ["docker-mini-card", true, true],
              ["docker-card", false, true],
              ["docker-mini-card", false, false],
              ["docker-card", false, false],
            ]) {
              const box = document.createElement("div");
              box.style.cssText = css;
              document.getElementById("root").replaceChildren(box);
              const el = document.createElement(type);
              el.setConfig({ type: `custom:${type}`, language, ...(illustration ? {} : { illustration: false }) });
              el.hass = { states, entities, devices, language, locale: { language }, callService: () => {} };
              // Card placed directly in the container, or wrapped in a plain <div> (as many layout cards do).
              const parent = wrapped ? box.appendChild(document.createElement("div")) : box;
              if (childCss) (wrapped ? parent : el).style.cssText = childCss;
              parent.appendChild(el);
              if (zoom) el.shadowRoot.querySelector(".zoom").dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
              const r = el.shadowRoot;
              const label = r.querySelector(".header .chip-label");
              // The chip right after the title on its line (8 px gap), or on its own line under it.
              const n = r.querySelector(".header .name").getBoundingClientRect();
              const p = label.parentElement.getBoundingClientRect();
              const sameLine = Math.abs(p.top + p.height / 2 - (n.top + n.height / 2)) < 3;
              const placed = sameLine ? Math.abs(p.left - n.right - 8) <= 1 : p.top >= n.bottom - 0.5;
              res.push({
                at: `${zoom ? "mini-zoomed" : type}${illustration ? "" : " classic"} ${at} ${language} ${st}`,
                track,
                overflow: box.scrollWidth - box.clientWidth,
                card: Math.round(r.querySelector("ha-card").getBoundingClientRect().width),
                title: Math.round(r.querySelector(".header .name").getBoundingClientRect().width),
                label: label.textContent,
                labelShown: getComputedStyle(label).display !== "none",
                labelCut: label.scrollWidth > label.clientWidth + 0.5,
                placed,
                chipShare: sameLine ? p.width / r.querySelector(".header .titles").getBoundingClientRect().width : 0,
              });
            }
      return res;
    },
    { widths, wraps, langs, stateSets, entities, devices }
  );
  await page.close();
  assert.deepEqual(errors, []);
  return out;
};

const unavailable = Object.fromEntries(Object.entries(states).map(([id, s]) => [id, { ...s, state: "unavailable" }]));

test("header chip: its whole label shows from 245 to 500 px, the title keeps a few characters", async (t) => {
  if (skip) return t.skip(skip);
  for (const m of await render({
    widths: [245, 280, 320, 364, 400, 500],
    langs: ["en", "pl", "sr-Latn", "el", "ru", "bg"],
    states: { normal: states, unavailable },
  })) {
    t.diagnostic(`${m.at}: title ${m.title}px, chip "${m.label}"`);
    assert.ok(m.labelShown, `${m.at}: chip reduced to its dot`);
    assert.equal(m.labelCut, false, `${m.at}: chip label "${m.label}" cut`);
    assert.ok(m.title >= 40, `${m.at}: title only ${m.title}px wide`);
    assert.ok(m.placed, `${m.at}: chip neither right after the title nor under it`);
    assert.ok(m.chipShare <= 0.52, `${m.at}: chip takes ${Math.round(m.chipShare * 100)} % of the title block`);
  }
});

test("header chip: only its dot at 200 px or less, banner and classic header", async (t) => {
  if (skip) return t.skip(skip);
  for (const m of await render({ widths: [175, 200], langs: ["en"], states: { normal: states } })) {
    assert.equal(m.labelShown, false, `${m.at}: chip label shown`);
    assert.ok(m.placed, `${m.at}: chip neither right after the title nor under it`);
  }
});

// Each context with the card placed directly or wrapped in a <div>.
const contexts = (list) => list.flatMap((c) => [c, { ...c, at: `${c.at} in a div`, wrapped: true }]);

test("container without a definite width (inline-block, auto grid column): the card keeps a usable width", async (t) => {
  if (skip) return t.skip(skip);
  for (const m of await render({
    widths: [],
    wraps: contexts([
      { at: "inline-block", css: "display:inline-block" },
      { at: "grid auto", css: "display:grid;grid-template-columns:auto;justify-content:start" },
    ]),
    langs: ["en"],
    states: { normal: states },
  })) {
    t.diagnostic(`${m.at}: card ${m.card}px`);
    assert.ok(m.card >= 240, `${m.at}: card only ${m.card}px wide`);
  }
});

test("1fr columns and flex rows narrower than the card's natural width: the card shrinks to its track", async (t) => {
  if (skip) return t.skip(skip);
  const wraps = [];
  for (const w of [320, 360, 500]) {
    wraps.push({ at: `grid 1fr 1fr ${w}px`, css: `display:grid;grid-template-columns:1fr 1fr;width:${w}px`, track: w / 2 });
    wraps.push({ at: `grid repeat(3,1fr) ${w}px`, css: `display:grid;grid-template-columns:repeat(3,1fr);width:${w}px`, track: w / 3 });
    wraps.push({ at: `flex row ${w}px`, css: `display:flex;width:${w}px`, childCss: "flex:1 1 0", track: w });
    wraps.push({ at: `flex row ${w / 2}px`, css: `display:flex;width:${w / 2}px`, childCss: "flex:1 1 auto", track: w / 2 });
  }
  for (const m of await render({ widths: [], wraps: contexts(wraps), langs: ["en"], states: { normal: states } })) {
    t.diagnostic(`${m.at}: card ${m.card}px, track ${m.track}px, overflow ${m.overflow}px`);
    assert.ok(m.card > 0 && m.card <= Math.ceil(m.track), `${m.at}: card ${m.card}px in a ${m.track}px track`);
    assert.ok(m.overflow <= 0, `${m.at}: content ${m.overflow}px wider than the container`);
  }
});

// Home Assistant's <ha-card> is a Lit element: it shows its content from its first update only, a microtask after it is
// connected, so whatever the card measures before that is 0 px wide. With such a stand-in, the status pill must be in
// its place (and the card at its height) from the first frame, and keep them through state updates.
const LIT_HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block;overflow:hidden}</style>"; }
  connectedCallback() {
    if (this.updateComplete) return;
    this.hasUpdated = false;
    this.updateComplete = Promise.resolve().then(() => { this.shadowRoot.appendChild(document.createElement("slot")); this.hasUpdated = true; return true; });
  }
});`;

for (const [type, config] of ["docker-card", "docker-mini-card"].flatMap((type) => [{}, { title: "Docker host of the main server" }].map((c) => [type, c])).concat([["docker-card", { illustration: false }], ["docker-card", { illustration: false, title: "Docker host of the main server" }]]))
  for (const width of [300, 400])
    test(`${type}${config.title ? " (long title)" : ""}${config.illustration === false ? " (classic header)" : ""} at ${width} px in a Lit-like ha-card: the pill is placed from the first frame and stays`, async (t) => {
      if (skip) return t.skip(skip);
      const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setContent("<!doctype html><body style='margin:0'></body>");
      await page.addScriptTag({ content: LIT_HA_CARD });
      await page.addScriptTag({ content: src });
      const r = await page.evaluate(
        async ({ type, config, width, hass }) => {
          const frame = () => new Promise((done) => requestAnimationFrame(done));
          const box = document.createElement("div");
          box.style.width = `${width}px`;
          document.body.appendChild(box);
          const el = document.createElement(type);
          el.setConfig({ type: `custom:${type}`, ...config });
          hass.callService = () => {};
          el.hass = hass;
          box.appendChild(el);
          const look = () => `${Math.round(el.getBoundingClientRect().height)} ${[...el.shadowRoot.querySelectorAll(".titles")].map((n) => n.className).join("|")}`;
          const first = new Set();
          for (let k = 0; k < 6; k++) {
            await frame();
            first.add(look());
          }
          await new Promise((done) => setTimeout(done, 300));
          await frame();
          const settled = look();
          const updates = new Set();
          let h = hass;
          for (let i = 1; i <= 8; i++) {
            const states = { ...h.states };
            if (i % 2) states["sensor.layout_probe"] = { entity_id: "sensor.layout_probe", state: String(i), attributes: {} };
            else {
              states["sensor.host_utilisation_cpu"] = { ...states["sensor.host_utilisation_cpu"], state: String(5 + ((i * 7) % 60)) };
              states["sensor.host_utilisation_memoire"] = { ...states["sensor.host_utilisation_memoire"], state: String(30 + ((i * 3) % 40)) };

            }
            h = { ...h, states };
            el.hass = h;
            await frame();
            await frame();
            updates.add(look());
          }
          return { first: [...first], settled, updates: [...updates] };
        },
        { type, config, width, hass: { states, entities, devices, language: "en", locale: { language: "en" } } },
      );
      await page.close();
      assert.deepEqual(errors, []);
      assert.deepEqual(r.first, [r.settled], "the first frames show the pill where it settles, at the same height");
      assert.deepEqual(r.updates, [r.settled], "state updates keep the pill's place and the height");
    });
