import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { load } from "./load.mjs";

const { DockerCard, DockerMiniCard, DockerCardEditor, DockerMiniCardEditor, resolve, sameSig, fmtBytesPair, fmtBytes, fmtPct, fmtLang, spark, thresholds, normalizeConfig } = load("docker-card.js", [
  "spark",
  "normalizeConfig",
  "fmtLang",
  "thresholds",
  "DockerCardEditor",
  "DockerMiniCardEditor",
  "fmtBytes",
  "fmtPct",
  "DockerCard",
  "DockerMiniCard",
  "resolve",
  "sameSig",
  "fmtBytesPair",
]);

const devices = {
  env: { id: "env", name: "Docker host", model: "Environment", via_device_id: null },
  grp: { id: "grp", name: "Docker host – Containers", model: "Environment Group", via_device_id: "env" },
  ct: { id: "ct", name: "Docker host – Containers – web", model: "Container", via_device_id: "grp" },
};
const entities = {};
const add = (entity_id, device_id, translation_key) =>
  (entities[entity_id] = { entity_id, device_id, platform: "dockhand", translation_key });
add("sensor.cpu", "env", "cpu_usage");
add("sensor.containers", "env", "containers");
add("sensor.web_state", "ct", "state");

const XSS = `<img src=x onerror="alert(1)">`;
const baseStates = () => ({
  "sensor.cpu": { entity_id: "sensor.cpu", state: "12", attributes: { cpu_count: XSS } },
  "sensor.containers": { entity_id: "sensor.containers", state: "3", attributes: { running: XSS, pending_updates_total: XSS } },
  "sensor.web_state": { entity_id: "sensor.web_state", state: "running", attributes: {} },
  "light.kitchen": { entity_id: "light.kitchen", state: "off", attributes: {} },
});

const make = (Cls, states, config = {}) => {
  const el = new Cls();
  el._config = config;
  el._hass = { states, entities, devices, language: "en" };
  return el;
};

test("resolve groups containers under their environment", () => {
  const model = resolve({ entities, devices });
  assert.equal(model.envs.length, 1);
  assert.equal(model.envs[0].containers[0].name, "web");
});

test("attributes from the API are escaped in the full card", () => {
  const html = make(DockerCard, baseStates())._render();
  assert.ok(!html.includes("<img src=x"), "raw attribute injected");
  assert.ok(html.includes("&lt;img src=x"));
});

test("attributes from the API are escaped in the mini card", () => {
  const html = make(DockerMiniCard, baseStates())._render();
  assert.ok(!html.includes("<img src=x"), "raw attribute injected");
});

test("an unrelated state change keeps the render signature", () => {
  const states = baseStates();
  const before = make(DockerCard, states)._signature();
  const after = make(DockerCard, { ...states, "light.kitchen": { ...states["light.kitchen"], state: "on" } })._signature();
  assert.ok(sameSig(before, after));
});

test("a change of a container state changes the render signature", () => {
  const states = baseStates();
  const before = make(DockerCard, states)._signature();
  const next = { ...states, "sensor.web_state": { ...states["sensor.web_state"], state: "exited" } };
  assert.ok(!sameSig(before, make(DockerCard, next)._signature()));
});

test("url is only used for an http(s) address", () => {
  const env = resolve({ entities, devices }).envs[0];
  const card = (url) => make(DockerCard, baseStates(), { url })._logoUrl(env);
  assert.equal(card("http://nas.local:3000"), "http://nas.local:3000");
  assert.equal(card("HTTPS://dockhand.example"), "HTTPS://dockhand.example");
  assert.ok(!card("javascript:alert(1)").startsWith("javascript"));
  assert.ok(!card(" javascript:alert(1)").includes("javascript"));
});

test("unknown or unavailable counters are shown as a dash", () => {
  const ents = { ...entities, "sensor.images": { entity_id: "sensor.images", device_id: "env", platform: "dockhand", translation_key: "image_count" } };
  const states = { ...baseStates(), "sensor.images": { entity_id: "sensor.images", state: "unavailable", attributes: {} } };
  for (const Cls of [DockerCard, DockerMiniCard]) {
    const el = make(Cls, states);
    el._hass.entities = ents;
    const html = el._render();
    assert.ok(!html.includes("unavailable"), Cls.name);
    assert.ok(html.includes("—"), Cls.name);
  }
});

test("getCardSize follows the sections shown and the open lists", () => {
  const states = baseStates();
  assert.equal(make(DockerCard, states, {}).getCardSize(), 4);
  assert.equal(make(DockerCard, states, { show_system: false, show_counts: false }).getCardSize(), 1);
  assert.equal(make(DockerCard, states, normalizeConfig({ show_stats: false, show_counts: false })).getCardSize(), 1, "show_stats (before 3.5) still read");
  assert.equal(make(DockerCard, states, { show_containers: true }).getCardSize(), 5);
  assert.equal(make(DockerCard, states, { show_containers: true, expand_containers: true }).getCardSize(), 6);
});

// Mini card detail button: a mini card whose renders are captured instead of patched into a DOM.
const zoomCard = (config = {}) => {
  const el = make(DockerMiniCard, baseStates(), config);
  el._hass.language = config.language || "en";
  el._update = () => {
    el.html = el._render();
  };
  el.shadowRoot.querySelector = () => null;
  el._update();
  return el;
};
const node = (localName) => ({ localName });
const click = (path, extra = {}) => ({ composedPath: () => path, stopPropagation() {}, detail: 1, ...extra });
const zoomButton = () => click([], { target: { closest: (sel) => (sel === ".zoom" ? {} : null) } });

test("no rewrite under a press: an update is held until the click, which draws it at once, or the release", async () => {
  const el = make(DockerCard, baseStates());
  // The DOM patch is left out (no document here): the renders are counted instead.
  let renders = 0;
  el._render = () => {
    renders++;
    return el._html;
  };
  el._html = "<ha-card></ha-card>";
  // Pressed: an update does not touch the card under the pointer.
  el._onPress();
  el._update();
  assert.equal(renders, 0, "held under the press");
  // Released without a click: drawn right after.
  el._onPressEnd();
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(renders, 1);
  // The click itself draws at once.
  el._onPress();
  el._update();
  el._onPressClick();
  el._update();
  assert.equal(renders, 2);
  el._onPressEnd();
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(renders, 2, "nothing left to draw");
});

test("folding: a tap elsewhere (pointer), not a drag that ends outside; leaving the page folds back too", () => {
  const el = zoomCard();
  el.connectedCallback();
  el._folds = { containers: true };
  // A slider pressed in the card and released outside of it: nothing folds.
  el._outside.tap(click([node("div"), el]));
  assert.deepEqual({ ...el._folds }, { containers: true });
  // A tap on a spot that sends no click (iOS): the pointer alone folds.
  el._outside.tap(click([node("body")]));
  assert.deepEqual({ ...el._folds }, {});
  // Left zoomed with a section open and back: compact, folded.
  el._zoomClick(zoomButton());
  el._folds = { containers: true };
  el.disconnectedCallback();
  el.connectedCallback();
  assert.equal(el._zoomed, false);
  assert.deepEqual({ ...el._folds }, {});
  assert.match(el.html, /class="metric/);
  el.disconnectedCallback();
});

test("the mini card detail button switches to the full card content and back", () => {
  const el = zoomCard();
  const full = make(DockerCard, el._hass.states);
  full._hass = el._hass;
  assert.match(el.html, /class="metric/);
  // Rightmost header element.
  assert.match(el.html, /<button type="button" class="zoom" title="Show the full card">[\s\S]*?<\/button>\s*<\/div>/);
  assert.equal(el.getCardSize(), 3);
  let stopped = false;
  el._zoomClick({ ...zoomButton(), stopPropagation: () => (stopped = true) });
  assert.equal(stopped, true);
  assert.equal(el._zoomed, true);
  assert.doesNotMatch(el.html, /class="metric/);
  assert.match(el.html, /class="gauges/);
  assert.equal(el.html.replace(/<button type="button" class="zoom"[\s\S]*?<\/button>/, ""), full._render());
  assert.match(el.html, /<button type="button" class="zoom" title="Back to the compact view">/);
  assert.equal(el.getCardSize(), full.getCardSize());
  assert.deepEqual({ ...el.getGridOptions() }, { ...full.getGridOptions(), rows: "auto" });
  el._zoomClick(zoomButton());
  assert.equal(el._zoomed, false);
  assert.match(el.html, /class="metric/);
  assert.equal(el.getCardSize(), 3);
  assert.deepEqual({ ...el.getGridOptions() }, { columns: 6, min_columns: 6, rows: "auto" });
});

test("a click outside the mini card collapses it, a click inside or in a dialog does not", () => {
  const el = zoomCard({ language: "fr" });
  assert.match(el.html, /title="Afficher la carte complète"/);
  el._zoomClick(zoomButton());
  assert.match(el.html, /title="Revenir à la vue compacte"/);
  el._unzoom.tap(click([node("div"), el, node("body")]));
  assert.equal(el._zoomed, true);
  for (const dialog of ["ha-more-info-dialog", "ha-dialog", "dialog"]) {
    el._unzoom.tap(click([node("div"), node(dialog), node("body")]));
    assert.equal(el._zoomed, true, dialog);
  }
  // Other clicks on the card leave it as it is.
  el._zoomClick(click([el], { target: { closest: () => null } }));
  assert.equal(el._zoomed, true);
  el._unzoom.tap(click([node("div"), node("body")]));
  assert.equal(el._zoomed, false);
  assert.match(el.html, /class="metric/);
});

test("zoom: false removes the mini card detail button, the full card has none", () => {
  assert.doesNotMatch(zoomCard({ zoom: false }).html, /class="zoom"/);
  assert.doesNotMatch(make(DockerCard, baseStates())._render(), /class="zoom"/);
});

test("memory label keeps the used unit when it differs from the total's", () => {
  const GB = 1024 ** 3;
  assert.equal(fmtBytesPair(980 * 1024 ** 2, 62.5 * GB), "980 MiB / 62.5 GiB");
  assert.equal(fmtBytesPair(12.3 * GB, 62.5 * GB), "12.3 / 62.5 GiB");
});

test("numbers use the card's language: decimal comma in French, dot in English", () => {
  const GB = 1024 ** 3;
  assert.equal(fmtBytesPair(12.3 * GB, 62.5 * GB, "fr"), "12,3 / 62,5 GiB");
  assert.equal(fmtBytes(1.5 * GB, "de"), "1,5 GiB");
  assert.equal(fmtBytes(1.5 * GB), "1.5 GiB");
  assert.equal(fmtPct(4.2, "fr"), "4,2%");
  assert.equal(fmtPct(4, "en"), "4.0%");
  assert.equal(fmtPct(42.4, "fr"), "42%");
  // Host CPU and RAM: whole percentages, like the other cards.
  const states = baseStates();
  states["sensor.cpu"] = { ...states["sensor.cpu"], state: "4.6" };
  assert.match(make(DockerCard, states, { language: "fr" })._render(), /<b>5%<\/b>/);
  assert.match(make(DockerMiniCard, states, { language: "fr" })._render(), /<span class="v">5%<\/span>/);
});

test("getCardSize applies the only_problems filter, as the rendered sections do", () => {
  const devs = { ...devices, ct2: { id: "ct2", name: "Docker host – Containers – db", model: "Container", via_device_id: "grp" } };
  const ents = { ...entities, "sensor.db_state": { entity_id: "sensor.db_state", device_id: "ct2", platform: "dockhand", translation_key: "state" } };
  const states = { ...baseStates(), "sensor.db_state": { entity_id: "sensor.db_state", state: "exited", attributes: {} } };
  const mk = (config) => {
    const el = new DockerCard();
    el._config = config;
    el._hass = { states, entities: ents, devices: devs, language: "en" };
    return el;
  };
  const config = { show_containers: true, expand_containers: true };
  assert.equal(mk(config).getCardSize(), 7); // header + gauges + counts + title + both containers
  assert.equal(mk({ ...config, only_problems: true }).getCardSize(), 6); // only the stopped container is listed
});

test("restart asks for an in-card confirmation, Cancel closes it without acting", async () => {
  const el = make(DockerCard, baseStates());
  const calls = [];
  el._hass.callService = (d, s, data) => calls.push(`${d}.${s} ${data.entity_id}`);
  el._update = () => {
    let html = el._render();
    if (el._confirm) html = html.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${el._confirmHtml()}</ha-card>`);
    el.html = html;
  };
  el._onClick(click([{ dataset: { action: "restart", entity: "button.web_restart", label: "web" } }]));
  await null;
  assert.ok(el._confirm, "no confirmation opened");
  assert.deepEqual(calls, []);
  assert.match(el.html, /class="dialog-open"/);
  assert.match(el.html, /Restart web\?/);
  el._onClick(click([{ dataset: { action: "confirm_cancel" } }]));
  await null;
  assert.equal(el._confirm, null);
  assert.deepEqual(calls, []);
  assert.doesNotMatch(el.html, /class="dialog-open"/);
});

test("stopping asks for an in-card confirmation, starting does not", async () => {
  const states = { ...baseStates(), "switch.web": { entity_id: "switch.web", state: "on", attributes: {} } };
  const el = make(DockerCard, states);
  const calls = [];
  el._hass.callService = (d, s, data) => calls.push(`${d}.${s} ${data.entity_id}`);
  el._update = () => {};
  el._onClick(click([{ dataset: { action: "toggle", entity: "switch.web", label: "web" } }]));
  await null;
  assert.ok(el._confirm);
  assert.deepEqual(calls, []);
  el._onClick(click([{ dataset: { action: "confirm_ok" } }]));
  await null;
  assert.deepEqual(calls, ["switch.turn_off switch.web"]);
  assert.equal(el._confirm, null);
  // Starting a stopped switch needs no confirmation.
  const el2 = make(DockerCard, { ...baseStates(), "switch.db": { entity_id: "switch.db", state: "off", attributes: {} } });
  const calls2 = [];
  el2._hass.callService = (d, s, data) => calls2.push(`${d}.${s} ${data.entity_id}`);
  el2._update = () => {};
  el2._onClick(click([{ dataset: { action: "toggle", entity: "switch.db", label: "db" } }]));
  await null;
  assert.equal(el2._confirm ?? null, null);
  assert.deepEqual(calls2, ["switch.turn_on switch.db"]);
});

test("an unavailable or unknown switch is neither started nor stopped, its button is disabled", async () => {
  for (const state of ["unavailable", "unknown"]) {
    const el = make(DockerCard, { ...baseStates(), "switch.web": { entity_id: "switch.web", state, attributes: {} } });
    const calls = [];
    el._hass.callService = (d, s, data) => calls.push(`${d}.${s} ${data.entity_id}`);
    el._update = () => {};
    el._onClick(click([{ dataset: { action: "toggle", entity: "switch.web", label: "web" } }]));
    await null;
    assert.equal(el._confirm ?? null, null, state);
    assert.deepEqual(calls, [], state);
    assert.match(el._controls({ _switch: "switch.web" }, "web"), / disabled>/, state);
  }
  const on = make(DockerCard, { ...baseStates(), "switch.web": { entity_id: "switch.web", state: "on", attributes: {} } });
  assert.doesNotMatch(on._controls({ _switch: "switch.web" }, "web"), /disabled/);
});

test("closing the confirmation gives the focus back to the button that opened it", async () => {
  const el = make(DockerCard, baseStates());
  el._hass.callService = () => {};
  el._update = () => {};
  const focused = [];
  el.shadowRoot.querySelector = (sel) => ({ focus: () => focused.push(sel) });
  el._onClick(click([{ dataset: { action: "restart", entity: "button.web_restart", label: "web" } }]));
  el._onClick(click([{ dataset: { action: "confirm_cancel" } }]));
  assert.equal(focused.at(-1), '[data-action="restart"][data-entity="button.web_restart"]');
  // Closed by a click elsewhere on the page: the focus is left where that click put it.
  el._onClick(click([{ dataset: { action: "restart", entity: "button.web_restart", label: "web" } }]));
  const n = focused.length;
  el.connectedCallback();
  el._outside.tap(click([node("body")]));
  assert.equal(el._confirm, null);
  assert.equal(focused.length, n);
});

test("Tab stays on the confirmation buttons", () => {
  const el = make(DockerCard, baseStates());
  el._update = () => {};
  const focused = [];
  const btns = ["cancel", "ok"].map((name) => ({ name, focus: () => focused.push(name) }));
  el.shadowRoot.querySelector = () => null;
  el.shadowRoot.querySelectorAll = () => btns;
  el.shadowRoot.activeElement = btns[1];
  el._openConfirm({ text: "", ok: "", run() {} });
  let prevented = false;
  el._onKey({ key: "Tab", shiftKey: false, preventDefault: () => (prevented = true) });
  assert.equal(prevented, true);
  assert.equal(focused.at(-1), "cancel");
  el.shadowRoot.activeElement = btns[0];
  el._onKey({ key: "Tab", shiftKey: true, preventDefault() {} });
  assert.equal(focused.at(-1), "ok");
});

test("German keeps its capitalised nouns in inline counts", () => {
  const ents = {
    ...entities,
    "sensor.stacks": { entity_id: "sensor.stacks", device_id: "env", platform: "dockhand", translation_key: "stacks" },
  };
  const states = { ...baseStates(), "sensor.stacks": { entity_id: "sensor.stacks", state: "5", attributes: {} } };
  const el = make(DockerMiniCard, states, { language: "de" });
  el._hass.entities = ents;
  const html = el._render();
  assert.match(html, /5 Stacks/);
  assert.doesNotMatch(html, /\d (stacks|updates)\b/);
  const en = make(DockerMiniCard, states);
  en._hass.entities = ents;
  assert.match(en._render(), /5 stacks/);
});

test("an unavailable containers sensor shows its pending updates as a dash, not 0", () => {
  const states = { ...baseStates(), "sensor.containers": { entity_id: "sensor.containers", state: "unavailable", attributes: {} } };
  const env = resolve({ entities, devices }).envs[0];
  assert.equal(make(DockerCard, states)._containerStats(env).updates, null);
  for (const Cls of [DockerCard, DockerMiniCard]) {
    const html = make(Cls, states)._render();
    assert.doesNotMatch(html, />0 ?(<\/span>)? ?updates/i, Cls.name);
    assert.doesNotMatch(html, /class="v">0</, Cls.name);
  }
  assert.equal(make(DockerCard, { ...baseStates(), "sensor.containers": { entity_id: "sensor.containers", state: "3", attributes: {} } })._containerStats(env).updates, 0);
});

test("a stack whose container count is unavailable leaves it out of its detail line", () => {
  const devs = { ...devices, stk: { id: "stk", name: "Docker host – Stacks – app", model: "Stack", via_device_id: "env" } };
  const ents = {
    ...entities,
    "sensor.app_status": { entity_id: "sensor.app_status", device_id: "stk", platform: "dockhand", translation_key: "status" },
    "sensor.app_count": { entity_id: "sensor.app_count", device_id: "stk", platform: "dockhand", translation_key: "containers_in_stack" },
  };
  const mk = (count, attrs = {}) => {
    const el = new DockerCard();
    el._config = { expand_stacks: true };
    el._hass = {
      states: {
        ...baseStates(),
        "sensor.app_status": { entity_id: "sensor.app_status", state: "running", attributes: attrs },
        "sensor.app_count": { entity_id: "sensor.app_count", state: count, attributes: {} },
      },
      entities: ents,
      devices: devs,
      language: "en",
    };
    return el._render();
  };
  assert.match(mk("2"), /Running · 2 containers/);
  assert.match(mk("1"), /Running · 1 container</);
  const html = mk("unavailable");
  assert.doesNotMatch(html, /unavailable containers/);
  assert.match(html, /class="detail">Running</);
  assert.match(mk("unknown", { container_count: 3 }), /Running · 3 containers/);
});

test("unavailable and unknown states are translated", () => {
  const el = make(DockerCard, baseStates(), { language: "fr" });
  assert.equal(el._stateLabel("unavailable"), "Indisponible");
  assert.equal(el._stateLabel("unknown"), "Inconnu");
});

test("header subtitle hides unavailable or unknown host sensors", () => {
  const ents = { ...entities };
  const addEnv = (id, key) => (ents[id] = { entity_id: id, device_id: "env", platform: "dockhand", translation_key: key });
  addEnv("sensor.docker_version", "host_docker_version");
  addEnv("sensor.platform", "host_platform");
  addEnv("sensor.conn", "connection_type");
  const sub = (docker, platform, conn) => {
    const el = new DockerCard();
    el._config = { language: "fr" };
    const st = (id, state) => ({ entity_id: id, state, attributes: {} });
    el._hass = {
      states: {
        ...baseStates(),
        "sensor.docker_version": st("sensor.docker_version", docker),
        "sensor.platform": st("sensor.platform", platform),
        "sensor.conn": st("sensor.conn", conn),
      },
      entities: ents,
      devices,
      language: "fr",
    };
    return el._render().match(/<div class="sub">([^<]*)<\/div>/)?.[1] ?? null;
  };
  assert.equal(sub("unavailable", "unavailable", "unavailable"), null);
  assert.equal(sub("unknown", "unknown", "unknown"), null);
  assert.equal(sub("unavailable", "linux", "socket"), "linux · socket");
  assert.equal(sub("27.3.1", "unavailable", "socket"), "Docker 27.3.1 · socket");
  assert.equal(sub("27.3.1", "linux", "socket"), "Docker 27.3.1 · linux · socket");
});

test("an unavailable restart button is disabled and does nothing; a never pressed one (unknown) still works", async () => {
  const st = (state) => ({ ...baseStates(), "button.web_restart": { entity_id: "button.web_restart", state, attributes: {} } });
  const el = make(DockerCard, st("unavailable"));
  const calls = [];
  el._hass.callService = (d, s, data) => calls.push(`${d}.${s} ${data.entity_id}`);
  el._update = () => {};
  assert.match(el._controls({ restart: "button.web_restart" }, "web"), / disabled>/);
  el._onClick(click([{ dataset: { action: "restart", entity: "button.web_restart", label: "web" } }]));
  await null;
  assert.equal(el._confirm ?? null, null);
  assert.deepEqual(calls, []);
  // A button entity is "unknown" until first pressed: that is not unavailable.
  for (const state of ["unknown", "2026-11-01T10:00:00+00:00"]) {
    const ok = make(DockerCard, st(state));
    ok._update = () => {};
    assert.doesNotMatch(ok._controls({ restart: "button.web_restart" }, "web"), /disabled/, state);
    ok._onClick(click([{ dataset: { action: "restart", entity: "button.web_restart", label: "web" } }]));
    await null;
    assert.ok(ok._confirm, state);
  }
});

test("header chip: an unavailable or unknown online sensor is shown as such, not as Offline", () => {
  const ents = { ...entities, "binary_sensor.online": { entity_id: "binary_sensor.online", device_id: "env", platform: "dockhand", translation_key: "online" } };
  const chip = (state, language = "en") => {
    const el = new DockerCard();
    el._config = { language };
    el._hass = {
      states: { ...baseStates(), "binary_sensor.online": { entity_id: "binary_sensor.online", state, attributes: {} } },
      entities: ents,
      devices,
      language,
    };
    const m = el._render().match(/<span class="chip ([^"]*)"[^>]*>([\s\S]*?)<\/span><\/span>/);
    return m && `${m[1].split(" ").filter((c) => ["ok", "crit", "idle"].includes(c)).join("")}:${m[2].replace(/<[^>]+>/g, "").trim()}`;
  };
  assert.equal(chip("on"), "ok:Online");
  assert.equal(chip("off"), "crit:Offline");
  assert.equal(chip("unavailable"), "idle:Unavailable");
  assert.equal(chip("unknown"), "idle:Unknown");
  assert.equal(chip("unavailable", "fr"), "idle:Indisponible");
});

test("the header chip keeps its text in title and aria-label (the label can be hidden on a narrow card)", () => {
  const ents = { ...entities, "binary_sensor.online": { entity_id: "binary_sensor.online", device_id: "env", platform: "dockhand", translation_key: "online" } };
  const el = new DockerCard();
  el._config = { language: "sr" };
  el._hass = { states: { ...baseStates(), "binary_sensor.online": { entity_id: "binary_sensor.online", state: "on", attributes: {} } }, entities: ents, devices, language: "sr" };
  const html = el._render();
  assert.match(html, /<span class="chip [^"]*"[^>]* title="На мрежи" aria-label="На мрежи"/);
  assert.match(html, /<span class="chip-label">На мрежи<\/span>/);
});

test("the confirmation popup is named by its question (aria-labelledby)", async () => {
  const el = make(DockerCard, baseStates());
  el._update = () => {};
  el._onClick(click([{ dataset: { action: "restart", entity: "button.web_restart", label: "web" } }]));
  await null;
  const html = el._confirmHtml();
  const id = html.match(/role="dialog" aria-modal="true" aria-labelledby="([^"]+)"/)?.[1];
  assert.ok(id, "no aria-labelledby");
  assert.match(html, new RegExp(`<div class="msg" id="${id}">Restart web\\?</div>`));
});

test("header icon: the Docker icon in the status color, a link to Dockhand", () => {
  const ents = { ...entities, "binary_sensor.online": { entity_id: "binary_sensor.online", device_id: "env", platform: "dockhand", translation_key: "online" } };
  const icon = (state, config = {}) => {
    const el = new DockerCard();
    el._config = { language: "en", ...config };
    el._hass = { states: { ...baseStates(), "binary_sensor.online": { entity_id: "binary_sensor.online", state, attributes: {} } }, entities: ents, devices, language: "en" };
    return el._render().match(/<a class="logo-link logo (\w+)" href="([^"]*)"[^>]*><svg class="icon /)?.slice(1).join(" ");
  };
  assert.equal(icon("on", { url: "http://dockhand.local" }), "ok http://dockhand.local");
  // dockhand_url: the option's name before 2.0.
  assert.equal(icon("on", { dockhand_url: "http://dockhand.local" }), "ok http://dockhand.local");
  assert.match(icon("off"), /^crit /);
  assert.match(icon("unavailable"), /^idle /);
  // show_logo is gone: an old false value no longer hides the icon.
  assert.match(icon("on", { show_logo: false }), /^ok /);
});

test("the mini card keeps the full card's header icon size, even on a narrow card", () => {
  const src = readFileSync(new URL("../src/docker-card.js", import.meta.url), "utf8");
  const mini = src.match(/const MINI_STYLE = `([\s\S]*?)`;/)[1].replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(mini, /\.logo[^{]*\{/, "MINI_STYLE does not resize or move the header icon");
  assert.match(src, /\.logo \{ height: 40px; width: 40px;/);
  // The narrow-card rule that draws the icon at 32 px leaves the mini card (its mini attribute) out.
  const base = src.match(/const BASE_STYLE = `([\s\S]*?)`;/)[1].replace(/\/\*[\s\S]*?\*\//g, "");
  for (const rule of base.match(/[^{}]*\.logo[^{]*\{[^}]*height: 32px[^}]*\}/g) || []) assert.match(rule, /:host\(:not\(\[mini\]\)\)/);
  const el = new DockerMiniCard();
  el._update = () => {};
  el.setConfig({});
  assert.equal(el.attributes?.mini, "");
});

test("the card types before 2.0 still render the cards", () => {
  const { customElements } = load("docker-card.js", ["customElements"]);
  for (const [old, cur] of [
    ["dockhand-card", "docker-card"],
    ["dockhand-mini-card", "docker-mini-card"],
  ]) {
    const Old = customElements.get(old);
    assert.ok(Old, `${old} is not defined`);
    assert.ok(Old.prototype instanceof customElements.get(cur), `${old} is not a ${cur}`);
  }
});

test("CPU and memory 24 h history from the recorder statistics, refreshed every 5 minutes, off with show_history: false", async () => {
  const calls = [];
  const el = new DockerCard();
  el._config = {};
  el._hass = {
    states: baseStates(),
    entities,
    devices,
    language: "en",
    callWS: async (msg) => {
      calls.push(msg);
      const t0 = Date.now() - 3600000;
      return Object.fromEntries(msg.statistic_ids.map((id) => [id, [10, 40, 20].map((mean, i) => ({ start: t0 + i * 300000, mean }))]));
    },
  };
  el._update = () => {
    el.html = el._render();
  };
  el._update();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].type, "recorder/statistics_during_period");
  assert.ok(calls[0].statistic_ids.length >= 1);
  // The curves are drawn behind the CPU and RAM gauges, on a 0-100 scale, once the statistics arrive.
  // With a curve, the gauge's tooltip gives its 24 h low and high (the curve has no scale).
  const gaugeSpark = /class="gauge clickable \w*" role="button" tabindex="0" data-entity="sensor\.cpu"( title="[^"]*")?><svg class="spark"/;
  assert.doesNotMatch(el.html, gaugeSpark);
  await new Promise((r) => setTimeout(r, 0));
  assert.match(el.html, gaugeSpark);
  assert.match(el.html, /data-entity="sensor\.cpu" title="[^"]* · 24 h 10%? – 40%"/);
  assert.doesNotMatch(el.html, /Last 24/);
  el._update();
  assert.equal(calls.length, 1, "no new query within 5 minutes");

  const off = new DockerCard();
  off._config = { show_history: false };
  off._hass = el._hass;
  assert.doesNotMatch(off._render(), /class="spark"/);
  assert.equal(calls.length, 1);
});

test("mini card: 24 h sparklines behind the CPU and memory rows, none with show_history: false", async () => {
  const calls = [];
  const states = baseStates();
  const hass = {
    states,
    entities,
    devices,
    language: "en",
    callWS: async (msg) => {
      calls.push(msg);
      const t0 = Date.now() - 3600000;
      return Object.fromEntries(msg.statistic_ids.map((id) => [id, [10, 40, 20].map((mean, i) => ({ start: t0 + i * 300000, mean }))]));
    },
  };
  const el = new DockerMiniCard();
  el._config = {};
  el._hass = hass;
  el._update = () => {
    el.html = el._render();
  };
  el._update();
  assert.equal(calls.length, 1);
  assert.doesNotMatch(el.html, /class="spark"/);
  await new Promise((r) => setTimeout(r, 0));
  const cpuRow = el.html.match(/<div class="metric[^"]*"[^>]*data-entity="sensor\.cpu"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/)?.[1] || "";
  assert.match(cpuRow, /^\s*<svg class="spark"/, "the sparkline is drawn first, behind the row");
  assert.equal(el.html.match(/class="spark"/g).length, 1, "only the rows with a usage history get one");

  const off = new DockerMiniCard();
  off._config = { show_history: false };
  off._hass = hass;
  assert.doesNotMatch(off._render(), /class="spark"/);
  assert.equal(calls.length, 1);
});

test("sparklines sit on a real 24 h time axis and break on missing data", () => {
  const end = Date.UTC(2026, 10, 7, 12);
  const at = (h, v) => ({ t: end - h * 3600000, v });
  // Two runs of 5-minute points, 3 hours apart: two segments, each starting with a move.
  const svg = spark([at(12, 10), at(12 - 5 / 60, 20), at(12 - 10 / 60, 10), at(9, 40), at(9 - 5 / 60, 20)], end);
  const line = /class="spark-l" d="([^"]+)"/.exec(svg)[1];
  const area = /class="spark-a" d="([^"]+)"/.exec(svg)[1];
  assert.equal(line.match(/M/g).length, 2);
  assert.equal(area.match(/Z/g).length, 2);
  // x is the time within the window: 12 h before the end is the middle, 9 h before is 62.5 %.
  assert.match(line, /^M50\.00,/);
  assert.match(line, /M62\.50,2\.00/, "the peak (40) at the top");
  // Evenly spaced points with no gap: one segment; nothing under two points.
  assert.equal(spark([at(1, 1), at(1 - 5 / 60, 2)], end).match(/class="spark-l" d="M[^M"]*"/g).length, 1);
  assert.equal(spark([at(1, 1)], end), "");
  // A lone point between two gaps still draws a short stroke.
  assert.match(spark([at(10, 1), at(5, 2), at(1, 1)], end), /h0\.4/);
});

test("history points take their time from the statistics start (number or ISO date)", async () => {
  const el = new DockerCard();
  el._config = {};
  const t0 = Date.now() - 7200000;
  el._hass = {
    states: baseStates(),
    entities,
    devices,
    language: "en",
    callWS: async (msg) =>
      Object.fromEntries(msg.statistic_ids.map((id) => [id, [{ start: t0, mean: 5 }, { start: new Date(t0 + 300000).toISOString(), mean: 6 }, { start: null, mean: 7 }]])),
  };
  el._update = () => {};
  el._history(["sensor.cpu"]);
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(JSON.stringify(el._hist["sensor.cpu"]), JSON.stringify([{ t: t0, v: 5 }, { t: t0 + 300000, v: 6 }]));
});

// A container with an image update entity, for the install button tests.
const withUpdate = (attributes = {}, state = "on") => {
  const ents = { ...entities, "update.web": { entity_id: "update.web", device_id: "ct", platform: "dockhand", translation_key: null } };
  const states = { ...baseStates(), "update.web": { entity_id: "update.web", state, attributes } };
  const el = make(DockerCard, states, { show_containers: true, expand_containers: true });
  el._hass.entities = ents;
  return el;
};

test("an available image update is a button that confirms, then calls update.install", async () => {
  const el = withUpdate();
  const html = el._render();
  assert.match(html, /<button type="button" class="ctrl badge-update" title="Update"[^>]*data-action="install" data-entity="update.web" data-label="web">/);
  const calls = [];
  el._hass.callService = (d, s, data) => calls.push(`${d}.${s} ${data.entity_id}`);
  el._update = () => {
    let h = el._render();
    if (el._confirm) h = h.replace(/<ha-card>([\s\S]*)<\/ha-card>\s*$/, (_, inner) => `<ha-card class="dialog-open">${inner}${el._confirmHtml()}</ha-card>`);
    el.html = h;
  };
  el._onClick(click([{ dataset: { action: "install", entity: "update.web", label: "web" } }]));
  await null;
  assert.ok(el._confirm, "no confirmation opened");
  assert.deepEqual(calls, []);
  assert.match(el.html, /Update web to the latest image\?/);
  el._onClick(click([{ dataset: { action: "confirm_ok" } }]));
  await null;
  assert.deepEqual(calls, ["update.install update.web"]);
  assert.equal(el._confirm, null);
});

test("no install while unavailable or installing; a badge without install support or with show_controls: false", async () => {
  for (const [attrs, state] of [[{ in_progress: true }, "on"], [{}, "unavailable"]]) {
    const el = withUpdate(attrs, state);
    el._update = () => {};
    const calls = [];
    el._hass.callService = (d, s) => calls.push(`${d}.${s}`);
    if (state === "on") assert.match(el._render(), /data-action="install"[^>]* disabled>/);
    el._onClick(click([{ dataset: { action: "install", entity: "update.web", label: "web" } }]));
    await null;
    assert.equal(el._confirm ?? null, null);
    assert.deepEqual(calls, []);
  }
  // supported_features without INSTALL (1): the more-info badge.
  const noInstall = withUpdate({ supported_features: 16 })._render();
  assert.doesNotMatch(noInstall, /data-action="install"/);
  assert.match(noInstall, /<span class="badge-update clickable"[^>]*data-entity="update.web"/);
  const noControls = withUpdate();
  noControls._config.show_controls = false;
  assert.doesNotMatch(noControls._render(), /data-action="install"/);
});

test("number locale keeps Home Assistant's region when its language matches the card's", () => {
  const hass = (language) => ({ locale: { language } });
  assert.equal(fmtLang(hass("de-CH")), "de-CH");
  assert.equal(fmtLang(hass("fr-CA"), { language: "fr" }), "fr-CA");
  assert.equal(fmtLang(hass("fr-CA"), { language: "de" }), "de", "another card language drops the region");
  assert.equal(fmtLang(hass("pt")), "pt-PT");
  assert.equal(fmtLang(hass("pt-BR")), "pt-BR");
  assert.equal(fmtLang(hass("sr-Latn")), "sr-Latn");
  assert.equal(fmtLang(hass("ja")), "en");
  const el = make(DockerCard, baseStates());
  el._hass = { ...el._hass, locale: { language: "de-CH" } };
  assert.equal(el._loc(), "de-CH");
});

test("CPU and RAM thresholds: defaults 70/90 and 80/95, overridable in the config", () => {
  assert.deepEqual([...thresholds({}, "cpu")], [70, 90]);
  assert.deepEqual([...thresholds(undefined, "ram")], [80, 95]);
  assert.deepEqual([...thresholds({ ram_warning: 60, ram_critical: "85" }, "ram")], [60, 85]);
  // memory_* (before 3.5) still read by the cards, ram_* winning when both are set.
  const legacy = normalizeConfig({ memory_warning: 10, memory_critical: 20, ram_critical: 30 });
  assert.deepEqual([legacy.ram_warning, legacy.ram_critical, legacy.memory_warning], [10, 30, undefined]);
  assert.deepEqual([...thresholds({ cpu_warning: "", cpu_critical: "x" }, "cpu")], [70, 90], "invalid values keep the defaults");
  const cls = (Cls, config) => {
    const html = make(Cls, baseStates(), config)._render(); // CPU at 12 %
    return (Cls === DockerCard ? /class="gauge clickable (\w*)" role="button" tabindex="0" data-entity="sensor\.cpu"/ : /class="metric clickable (\w*)" role="button" tabindex="0" data-entity="sensor\.cpu"/).exec(html)[1];
  };
  for (const Cls of [DockerCard, DockerMiniCard]) {
    assert.equal(cls(Cls, {}), "ok");
    assert.equal(cls(Cls, { cpu_warning: 10 }), "warn");
    assert.equal(cls(Cls, { cpu_warning: 10, cpu_critical: 12 }), "crit");
  }
});

test("Editors: CPU and RAM threshold fields in the full and mini card editors", () => {
  for (const Editor of [DockerCardEditor, DockerMiniCardEditor]) {
    const editor = new Editor();
    editor._config = {};
    const names = editor._schema([]).flatMap((s) => (s.schema ? [...s.schema] : [s])).map((s) => s.name);
    for (const n of ["cpu_warning", "cpu_critical", "ram_warning", "ram_critical"]) assert.ok(names.includes(n), `${Editor.name} ${n}`);
  }
});
