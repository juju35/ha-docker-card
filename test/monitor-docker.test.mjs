import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

// Values built in the card's context: compared as JSON (another realm's arrays are not deepEqual).
const same = (a, b) => assert.equal(JSON.stringify(a), JSON.stringify(b));

const { DockerCard, DockerMiniCard, resolve, sameSig } = load("docker-card.js", ["DockerCard", "DockerMiniCard", "resolve", "sameSig"]);

// Monitor Docker entities, as created by `monitor_docker: - name: Docker` (no unique_id: not registered).
const st = (entity_id, state, attributes = {}) => [entity_id, { entity_id, state: String(state), attributes }];
const baseStates = () =>
  Object.fromEntries([
    st("sensor.docker_version", "27.5.1", { Online_CPUs: 8, Memory_limit: 16 * 1073741824, OS: "Debian GNU/Linux 12", Architecture: "x86_64", icon: "mdi:information-outline" }),
    st("sensor.docker_containers_total", 3, { icon: "mdi:docker" }),
    st("sensor.docker_containers_running", 2, { icon: "mdi:docker" }),
    st("sensor.docker_images", 5, { icon: "mdi:docker" }),
    st("sensor.docker_cpu", 30, { icon: "mdi:chip" }),
    st("sensor.docker_1cpu", 3.75, { icon: "mdi:chip" }),
    st("sensor.docker_memory", 2048, { icon: "mdi:memory" }),
    st("sensor.docker_memory_percent", 12.5, { icon: "mdi:memory" }),
    // Separate sensors
    st("sensor.docker_web_state", "running", { friendly_name: "web State" }),
    st("sensor.docker_web_status", "Up 2 days", { friendly_name: "web Status" }),
    st("sensor.docker_web_health", "unhealthy", { friendly_name: "web Health" }),
    st("sensor.docker_web_image", "nginx:latest", { friendly_name: "web Image" }),
    st("sensor.docker_web_memory_percent", 1.2, {}),
    st("switch.docker_web", "on", { friendly_name: "web", icon: "mdi:docker" }),
    st("button.docker_web_restart", "unknown", { friendly_name: "web Restart", icon: "mdi:docker" }),
    st("sensor.docker_db_state", "exited", { friendly_name: "db State" }),
    st("switch.docker_db", "off", { friendly_name: "db", icon: "mdi:docker" }),
    // allinone
    st("sensor.docker_cache", "running", { friendly_name: "cache", status: "Up 1 hour", image: "redis:7", health: "healthy" }),
    // Dockhand look-alike, registered: never taken for Monitor Docker
    st("sensor.docker_registered_state", "running", {}),
    st("light.kitchen", "off", {}),
  ]);
const entities = { "sensor.docker_registered_state": { entity_id: "sensor.docker_registered_state", platform: "other" } };

const devices = {};
const make = (Cls, states, config = {}) => {
  const el = new Cls();
  el._config = config;
  el._hass = { states, entities, devices, language: "en" };
  return el;
};

test("Monitor Docker instance and containers are found from the states", () => {
  const { envs } = resolve({ states: baseStates(), entities, devices: {} });
  assert.equal(envs.length, 1);
  const env = envs[0];
  assert.equal(env.id, "monitor_docker.docker");
  assert.equal(env.source, "monitor_docker");
  assert.equal(env.entities.cpu_usage, "sensor.docker_1cpu");
  assert.equal(env.entities.memory_usage, "sensor.docker_memory_percent");
  assert.equal(env.entities.containers, "sensor.docker_containers_total");
  same(
    env.containers.map((c) => c.name),
    ["cache", "db", "web"]
  );
  const web = env.containers.find((c) => c.name === "web").entities;
  same(web, {
    state: "sensor.docker_web_state",
    _status: "sensor.docker_web_status",
    health: "sensor.docker_web_health",
    _image: "sensor.docker_web_image",
    _switch: "switch.docker_web",
    restart: "button.docker_web_restart",
  });
  assert.equal(env.containers.find((c) => c.name === "cache").entities.state, "sensor.docker_cache");
});

test("the longest prefix wins between two instances", () => {
  const states = {
    ...baseStates(),
    ...Object.fromEntries([st("sensor.docker_nas_containers_total", 1, { icon: "mdi:docker" }), st("sensor.docker_nas_app_state", "running", {})]),
  };
  const { envs } = resolve({ states, entities, devices: {} });
  const nas = envs.find((e) => e.id === "monitor_docker.docker_nas");
  same(
    nas.containers.map((c) => c.name),
    ["app"]
  );
  assert.ok(!envs.find((e) => e.id === "monitor_docker.docker").containers.some((c) => c.name === "nas_app"));
});

test("no Monitor Docker without its host sensors", () => {
  const states = Object.fromEntries([st("sensor.docker_web_state", "running", {}), st("switch.docker_web", "on", { icon: "mdi:docker" })]);
  assert.equal(resolve({ states, entities, devices: {} }).envs.length, 0);
});

test("full card shows the containers list, host details and no updates tile", () => {
  const html = make(DockerCard, baseStates(), { expand_containers: true })._render();
  assert.ok(html.includes("Docker 27.5.1 · Debian GNU/Linux 12 x86_64"));
  assert.ok(html.includes("8 cores"));
  assert.ok(html.includes("2/3"));
  assert.ok(html.includes("Up 2 days · nginx:latest"));
  assert.ok(html.includes("Up 1 hour · redis:7"));
  assert.ok(html.includes('data-entity="switch.docker_web"'));
  assert.ok(html.includes('data-entity="button.docker_web_restart"'));
  assert.ok(!html.includes(">Updates<"));
  assert.ok(!html.includes("dockhand.pro"));
});

test("show_containers: false hides the Monitor Docker containers list", () => {
  const html = make(DockerCard, baseStates(), { show_containers: false })._render();
  assert.ok(!html.includes('data-section="containers"'));
});

test("only_problems keeps the stopped and unhealthy containers", () => {
  const card = make(DockerCard, baseStates(), { only_problems: true, expand_containers: true });
  const html = card._render();
  assert.ok(html.includes(">web<") && html.includes(">db<"));
  assert.ok(!html.includes(">cache<"));
});

test("mini card has no updates footer for Monitor Docker", () => {
  const html = make(DockerMiniCard, baseStates())._render();
  assert.ok(html.includes("5 images"));
  assert.ok(!html.includes("update"));
});

test("a new Monitor Docker container changes the render signature", () => {
  const states = baseStates();
  const before = make(DockerCard, states)._signature();
  const next = { ...states, ...Object.fromEntries([st("sensor.docker_new_state", "running", {})]) };
  assert.ok(!sameSig(before, make(DockerCard, next)._signature()));
  const unrelated = { ...states, "light.kitchen": { ...states["light.kitchen"], state: "on" } };
  assert.ok(sameSig(before, make(DockerCard, unrelated)._signature()));
});
