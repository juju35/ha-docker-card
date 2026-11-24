// ---------------------------------------------------------------------------
// Registry-based resolution
// ---------------------------------------------------------------------------
import { SOURCES } from "./core.js";

export const _cache = new WeakMap();
export const _mdCache = new WeakMap();
// Last Monitor Docker discovery (see monitorDockerEnvs).
export let _mdIds = null;

/**
 * Model shared by every source:
 * { envs: [{ id, name, source, entities, stacks: [...], containers: [...] }] }
 * Dockhand and Portainer environments come from the registries, Monitor Docker instances from the states.
 */
export const resolve = (hass) => {
  const registry = resolveRegistry(hass);
  if (!registry || !hass.states) return registry;
  const cached = _mdCache.get(hass.states);
  if (cached && cached.registry === registry && cached.entities === hass.entities) return cached.model;
  const md = monitorDockerEnvs(hass.states, hass.entities);
  if (md.envs.length && md.registry !== registry) md.model = { envs: [...registry.envs, ...md.envs] };
  md.registry = registry;
  const model = md.envs.length ? md.model : registry;
  _mdCache.set(hass.states, { registry, entities: hass.entities, model });
  return model;
};

// Monitor Docker environments, found again only when an entity id appears or disappears (or the registry
// changes): its instances and containers are known by their entity ids, set when Monitor Docker starts, so a
// state change (every few seconds) no longer rescans and regex-matches every state of Home Assistant.
export const monitorDockerEnvs = (states, entities) => {
  const ids = Object.keys(states);
  const hit = _mdIds;
  if (hit && hit.entities === entities && hit.ids.length === ids.length && hit.ids.every((id) => id in states)) return hit;
  _mdIds = { ids, entities, envs: resolveMonitorDocker(states, entities) };
  return _mdIds;
};

// Portainer (core integration, 2025.10+): its translation keys mapped to the ones the cards read (Dockhand's),
// per device model; entities not listed are not used. Keys starting with "_" have no Dockhand counterpart.
export const PORTAINER_KEYS = {
  Endpoint: {
    status: "online",
    docker_version: "host_docker_version",
    operating_system: "_os",
    architecture: "_arch",
    containers_count: "containers",
    containers_running: "_running",
    images_count: "image_count",
    memory_total: "_memory_total",
    cpu_total: "_cpu_total",
  },
  Stack: { stack: "_switch", status: "_active", stack_containers_count: "containers_in_stack" },
  Container: {
    container_state: "state",
    container_health_state: "health",
    image: "_image",
    container: "_switch",
    restart_container: "restart",
    container_image_update: "_update",
    cpu_usage_total: "_cpu",
    memory_usage: "_memory",
    memory_limit: "_memory_limit",
  },
};

// Per registry platform: the device model of an environment, and how an entity is keyed on its device.
export const REGISTRY_SOURCES = {
  // Keyed by translation_key; primary entities without one (running switch, container update) by "_<domain>".
  dockhand: { env: "Environment", key: (e) => e.translation_key || `_${e.entity_id.split(".")[0]}` },
  portainer: { env: "Endpoint", key: (e, d) => PORTAINER_KEYS[d?.model]?.[e.translation_key] },
};

/**
 * Dockhand and Portainer environments from hass.entities / hass.devices: an environment device, its stacks
 * and its containers (directly or through a stack or a group device).
 */
export const resolveRegistry = (hass) => {
  if (!hass.entities || !hass.devices) return null;
  const cached = _cache.get(hass.entities);
  if (cached && cached.devices === hass.devices) return cached.model;

  const byDevice = new Map();
  for (const e of Object.values(hass.entities)) {
    const src = REGISTRY_SOURCES[e.platform];
    if (!src || !e.device_id) continue;
    const key = src.key(e, hass.devices[e.device_id]);
    if (!key) continue;
    const dev = byDevice.get(e.device_id) || { source: e.platform, entities: {} };
    if (!(key in dev.entities)) dev.entities[key] = e.entity_id;
    byDevice.set(e.device_id, dev);
  }

  const devName = (d) => d.name_by_user || d.name || "";
  const envOf = (d, source) => {
    for (let i = 0, cur = d; cur && i < 4; i++, cur = hass.devices[cur.via_device_id]) {
      if (cur.model === REGISTRY_SOURCES[source].env) return cur.id;
    }
    return null;
  };
  // "Docker host – Containers – web" → "web"
  const shortName = (d) => devName(d).split(" – ").pop();

  const envs = new Map();
  for (const [id, { source, entities }] of byDevice) {
    const d = hass.devices[id];
    if (d && d.model === REGISTRY_SOURCES[source].env) envs.set(id, { id, name: devName(d), source, entities, stacks: [], containers: [] });
  }
  for (const [id, { source, entities }] of byDevice) {
    const d = hass.devices[id];
    if (!d) continue;
    const env = envs.get(envOf(d, source));
    if (!env) continue;
    if (d.model === "Container") env.containers.push({ id, name: shortName(d), entities });
    else if (/Stack$/.test(d.model || "")) env.stacks.push({ id, name: shortName(d), type: d.model, entities });
  }
  const byName = (a, b) => a.name.localeCompare(b.name);
  const model = { envs: [...envs.values()].sort(byName) };
  for (const env of model.envs) {
    env.stacks.sort(byName);
    env.containers.sort(byName);
  }
  _cache.set(hass.entities, { devices: hass.devices, model });
  return model;
};

// Monitor Docker (https://github.com/ualex73/monitor_docker) is configured in YAML and its entities
// have no unique_id: they are not in the entity registry and are found by their entity id instead,
// "<prefix>_<condition>" for the host and "<prefix>_<container>_<condition>" for each container.
export const MD_HOST = {
  cpu_usage: ["1cpu", "cpu"],
  memory_usage: ["memory_percent"],
  _memory: ["memory"],
  containers: ["containers_total"],
  _running: ["containers_running"],
  image_count: ["images"],
  host_docker_version: ["version"],
};
export const MD_HOST_SUFFIXES = new Set([...Object.values(MD_HOST).flat(), "containers_paused", "containers_stopped"]);
export const MD_CT_KEYS = { state: "state", status: "_status", health: "health", image: "_image", cpu: "_cpu", memory: "_memory" };
export const MD_CT_RE =
  /^(.+)_(state|status|health|up_time|image_hash|image|1cpu|cpu|memory_percent|memory|network_speed_up|network_speed_down|network_total_up|network_total_down)$/;
export const MD_ALLINONE_ATTRS = ["status", "image", "health", "uptime"];

export const resolveMonitorDocker = (states, registry = {}) => {
  const free = Object.keys(states).filter((id) => !registry[id]);
  // Instances: host sensors only Monitor Docker creates (mdi:docker counters, version with host details).
  const prefixes = new Set();
  for (const id of free) {
    const m = /^sensor\.(.+)_(containers_total|containers_running|images|version)$/.exec(id);
    if (!m) continue;
    const a = states[id].attributes || {};
    if (m[2] === "version" ? "Online_CPUs" in a || "Memory_limit" in a : a.icon === "mdi:docker") prefixes.add(m[1]);
  }
  if (!prefixes.size) return [];
  // Longest first: "docker_nas" wins over "docker" for sensor.docker_nas_web_state.
  const sorted = [...prefixes].sort((a, b) => b.length - a.length);
  const envs = new Map(
    sorted.map((p) => {
      const entities = {};
      for (const [key, suffixes] of Object.entries(MD_HOST)) {
        const id = suffixes.map((s) => `sensor.${p}_${s}`).find((i) => states[i] && !registry[i]);
        if (id) entities[key] = id;
      }
      const name = p.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
      return [p, { id: `monitor_docker.${p}`, name, source: "monitor_docker", entities, stacks: [], containers: new Map() }];
    })
  );

  for (const id of free) {
    const [domain, obj] = id.split(".");
    if (domain !== "sensor" && domain !== "switch" && domain !== "button") continue;
    const p = sorted.find((x) => obj.startsWith(`${x}_`));
    if (!p) continue;
    const rest = obj.slice(p.length + 1);
    const s = states[id];
    const a = s.attributes || {};
    let cname;
    let key;
    if (domain === "switch") {
      if (a.icon !== "mdi:docker") continue;
      [cname, key] = [rest, "_switch"];
    } else if (domain === "button") {
      if (a.icon !== "mdi:docker" || !rest.endsWith("_restart")) continue;
      [cname, key] = [rest.slice(0, -8), "restart"];
    } else if (MD_HOST_SUFFIXES.has(rest)) {
      continue;
    } else {
      const m = MD_CT_RE.exec(rest);
      if (m) {
        if (!(m[2] in MD_CT_KEYS)) continue;
        [cname, key] = [m[1], MD_CT_KEYS[m[2]]];
      } else if (MD_ALLINONE_ATTRS.some((k) => k in a)) {
        // "allinone": one sensor per container, its state is the container state, the rest attributes.
        [cname, key] = [rest, "state"];
      } else continue;
    }
    const list = envs.get(p).containers;
    const ct = list.get(cname) || { id: `monitor_docker.${p}.${cname}`, slug: cname, entities: {} };
    if (!(key in ct.entities)) ct.entities[key] = id;
    list.set(cname, ct);
  }

  const byName = (a, b) => a.name.localeCompare(b.name);
  const fname = (id, suffix) => {
    const n = id && states[id]?.attributes?.friendly_name;
    return n && suffix ? n.replace(new RegExp(`\\s*${suffix}$`, "i"), "") : n;
  };
  return [...envs.values()]
    .map((env) => {
      const containers = [...env.containers.values()]
        // A container is listed from its state, its status or its switch: a lone restart button is not one.
        .filter((ct) => ct.entities.state || ct.entities._status || ct.entities._switch)
        .map((ct) => {
          const e = ct.entities;
          const name = (fname(e._switch) || fname(e.state, "state") || fname(e._status, "status") || "").trim();
          return { id: ct.id, name: name || ct.slug, entities: e };
        })
        .sort(byName);
      // Every entity id the environment is built from: a container appearing or disappearing changes it.
      const key = [...Object.values(env.entities), ...containers.flatMap((ct) => Object.values(ct.entities))].join(",");
      return { ...env, containers, key };
    })
    .sort(byName);
};

export const listEnvs = (hass) => {
  const m = hass && resolve(hass);
  // Dockhand environments by their name only (as before Monitor Docker and Portainer were supported).
  return m ? m.envs.map((e) => ({ value: e.id, label: e.source === "dockhand" ? e.name : `${e.name} (${SOURCES[e.source].name})` })) : [];
};

export const findEnv = (hass, config) => {
  const m = resolve(hass);
  if (!m) return { error: "no_registry" };
  if (!m.envs.length) return { error: "no_env" };
  if (!config.environment) return { env: m.envs[0] };
  const env = m.envs.find((e) => e.id === config.environment || e.name === config.environment);
  return env ? { env } : { error: "unknown_env" };
};
