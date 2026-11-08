import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { DockerCard, DockerMiniCard, resolve } = load("docker-card.js", ["DockerCard", "DockerMiniCard", "resolve"]);

// Values built in the card's context: compared as JSON (another realm's arrays are not deepEqual).
const same = (a, b) => assert.equal(JSON.stringify(a), JSON.stringify(b));

// Portainer (core integration): endpoint → stack → container devices, entities keyed by translation_key.
const devices = {
  ep: { id: "ep", name: "local", model: "Endpoint", via_device_id: null, configuration_url: "http://portainer.local:9000/#!/1/docker/dashboard" },
  stk: { id: "stk", name: "monitoring", model: "Stack", via_device_id: "ep" },
  web: { id: "web", name: "web", model: "Container", via_device_id: "ep" },
  graf: { id: "graf", name: "grafana", model: "Container", via_device_id: "stk" },
  // Dockhand environment alongside: both sources listed
  env: { id: "env", name: "Docker host", model: "Environment", via_device_id: null },
};
const entities = {};
const states = {};
const add = (entity_id, device_id, translation_key, state, attributes = {}, platform = "portainer") => {
  entities[entity_id] = { entity_id, device_id, platform, translation_key };
  states[entity_id] = { entity_id, state: String(state), attributes };
};
add("binary_sensor.local_status", "ep", "status", "on");
add("sensor.local_docker_version", "ep", "docker_version", "28.0.1");
add("sensor.local_operating_system", "ep", "operating_system", "linux");
add("sensor.local_architecture", "ep", "architecture", "x86_64");
add("sensor.local_container_count", "ep", "containers_count", 2);
add("sensor.local_containers_running", "ep", "containers_running", 1);
add("sensor.local_image_count", "ep", "images_count", 4);
add("sensor.local_total_cpu", "ep", "cpu_total", 4);
add("sensor.local_total_memory", "ep", "memory_total", 8, { unit_of_measurement: "GB" });
add("button.local_prune_unused_images", "ep", "images_prune", "unknown");
add("switch.monitoring_stack", "stk", "stack", "on");
add("binary_sensor.monitoring_status", "stk", "status", "on");
add("sensor.monitoring_container_count", "stk", "stack_containers_count", 1);
add("sensor.web_state", "web", "container_state", "exited");
add("sensor.web_image", "web", "image", "nginx:latest");
add("switch.web_container", "web", "container", "off");
add("button.web_restart_container", "web", "restart_container", "unknown");
add("binary_sensor.web_status", "web", "status", "off");
add("update.web_image", "web", "container_image_update", "on");
add("sensor.grafana_state", "graf", "container_state", "running");
add("sensor.grafana_health", "graf", "container_health_state", "unhealthy");
add("sensor.grafana_image", "graf", "image", "grafana/grafana:11");
add("sensor.grafana_cpu", "graf", "cpu_usage_total", 40, { unit_of_measurement: "%" });
add("sensor.grafana_memory", "graf", "memory_usage", 2000, { unit_of_measurement: "MB" });
add("switch.grafana_container", "graf", "container", "on");
add("update.grafana_image", "graf", "container_image_update", "off");
add("sensor.cpu", "env", "cpu_usage", 1, {}, "dockhand");

const make = (Cls, config = {}, st = states) => {
  const el = new Cls();
  el._config = config;
  el._hass = { states: st, entities, devices, language: "en" };
  return el;
};

test("Portainer endpoints, stacks and containers are resolved next to Dockhand", () => {
  const { envs } = resolve({ states, entities, devices });
  same(
    envs.map((e) => [e.id, e.source]),
    [
      ["env", "dockhand"],
      ["ep", "portainer"],
    ]
  );
  const ep = envs.find((e) => e.id === "ep");
  same(
    ep.containers.map((c) => c.name),
    ["grafana", "web"]
  );
  same(
    ep.stacks.map((s) => s.name),
    ["monitoring"]
  );
  assert.equal(ep.entities.online, "binary_sensor.local_status");
  assert.equal(ep.entities.containers, "sensor.local_container_count");
  const web = ep.containers.find((c) => c.name === "web").entities;
  assert.equal(web.state, "sensor.web_state");
  assert.equal(web._switch, "switch.web_container");
  assert.equal(web.restart, "button.web_restart_container");
  assert.equal(web._update, "update.web_image");
  // The container's running binary sensor is not taken for a status.
  assert.ok(!Object.values(web).includes("binary_sensor.web_status"));
});

test("full card: host from the containers' usage, stacks, containers and updates", () => {
  const html = make(DockerCard, { environment: "ep", show_containers: true, expand_stacks: true, expand_containers: true })._render();
  assert.ok(html.includes("Docker 28.0.1 · linux x86_64"));
  assert.ok(html.includes("4 cores"));
  assert.ok(html.includes(">10.0%<") || html.includes(">10%<"), "CPU: 40 % of a core on 4 cores");
  assert.ok(html.includes(">25%<"), "memory: 2 GB of 8 GB");
  assert.ok(html.includes("1/2"));
  assert.ok(html.includes("Running · 1 container"));
  assert.ok(html.includes('data-entity="switch.monitoring_stack"'));
  assert.ok(html.includes("Stopped · nginx:latest"));
  assert.ok(html.includes('data-entity="update.web_image"'));
  assert.ok(html.includes('data-entity="button.web_restart_container"'));
  assert.ok(html.includes("Unhealthy"));
  assert.ok(html.includes('href="http://portainer.local:9000/#!/1/docker/dashboard"'));
  assert.ok(html.includes('title="Portainer"'));
});

test("no 24 h CPU / memory history: Portainer's host entities are the core count and the total memory", async () => {
  const calls = [];
  for (const Cls of [DockerCard, DockerMiniCard]) {
    const el = make(Cls, { environment: "ep" });
    el._hass.callWS = async (msg) => {
      calls.push(msg);
      return {};
    };
    const html = el._render();
    assert.doesNotMatch(html, /class="hist"|class="spark"/);
  }
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(calls, []);
});

test("updates are counted on the containers' update entities", () => {
  const html = make(DockerMiniCard, { environment: "ep" })._render();
  assert.ok(html.includes("1 update"));
  assert.ok(html.includes("4 images"));
});

test("without the host totals (disabled by default) CPU is unknown and memory falls back on the limits", () => {
  const st = { ...states };
  delete st["sensor.local_total_cpu"];
  delete st["sensor.local_total_memory"];
  const limit = { entity_id: "sensor.grafana_memory_limit", state: "4000", attributes: { unit_of_measurement: "MB" } };
  entities[limit.entity_id] = { entity_id: limit.entity_id, device_id: "graf", platform: "portainer", translation_key: "memory_limit" };
  st[limit.entity_id] = limit;
  const host = make(DockerCard, { environment: "ep" }, st)._host(resolve({ states: st, entities: { ...entities }, devices }).envs.find((e) => e.id === "ep"));
  assert.equal(host.cpu, null);
  assert.equal(host.mem, 50);
  delete entities[limit.entity_id];
});

test("containers list: search filters by name, sort by CPU or memory puts the highest first", () => {
  // web gets a high CPU and a low memory use: CPU and memory sorts give opposite orders.
  const ents = { ...entities };
  const st = { ...states };
  for (const [id, key, v] of [["sensor.web_cpu", "cpu_usage_total", 80], ["sensor.web_memory", "memory_usage", 100]]) {
    ents[id] = { entity_id: id, device_id: "web", platform: "portainer", translation_key: key };
    st[id] = { entity_id: id, state: String(v), attributes: { unit_of_measurement: key === "memory_usage" ? "MB" : "%" } };
  }
  const el = make(DockerCard, { environment: "ep", show_containers: true, expand_containers: true }, st);
  el._hass.entities = ents;
  const names = (html) => [...html.matchAll(/<div class="title"><span>([^<]+)<\/span>/g)].map((m) => m[1]).filter((n) => n === "web" || n === "grafana");
  let html = el._render();
  assert.match(html, /<input type="search" data-ctl="search" placeholder="Search containers"/);
  assert.match(html, /<select class="ct-sort" data-ctl="sort"[^>]*><option value="name" selected>Name<\/option><option value="cpu">CPU<\/option><option value="memory">RAM<\/option><\/select>/);
  same(names(html), ["grafana", "web"]);
  el._ctSort = "cpu";
  html = el._render();
  same(names(html), ["web", "grafana"]);
  assert.match(html, /<option value="cpu" selected>/);
  assert.match(html, /<div class="detail">80% · /);
  el._ctSort = "memory";
  html = el._render();
  same(names(html), ["grafana", "web"]);
  assert.match(html, /<div class="detail">1\.86 GiB · /);
  el._ctQuery = "GRAF";
  html = el._render();
  same(names(html), ["grafana"]);
  assert.match(html, /<span class="count">1\/2<\/span>/);
  el._ctQuery = "nothing";
  assert.match(el._render(), /<div class="empty">No matching container<\/div>/);
});

test("containers list: no sort menu without CPU or memory data", () => {
  const html = make(DockerCard, { environment: "ep", show_containers: true, expand_containers: true }, Object.fromEntries(Object.entries(states).filter(([id]) => !/_(cpu|memory)$/.test(id))))._render();
  assert.match(html, /data-ctl="search"/);
  assert.doesNotMatch(html, /data-ctl="sort"/);
});
