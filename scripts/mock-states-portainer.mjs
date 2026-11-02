// Mock Home Assistant registries and states shaped like the Portainer integration (core, 2025.10+): an
// endpoint, its stacks and its containers, used to render the Portainer screenshots. Entity ids in French
// on purpose: the cards never rely on them.
import { mockRegistry } from "./mock-states.mjs";

const { states, entities, devices, device, entity } = mockRegistry("portainer");
export { devices, entities, states };

device("ep", "local", "Endpoint");
devices.ep.configuration_url = "http://192.168.1.10:9000/#!/1/docker/dashboard";
entity("binary_sensor.local_statut", "ep", "status", "on");
entity("sensor.local_version_de_docker", "ep", "docker_version", "28.0.1");
entity("sensor.local_systeme", "ep", "operating_system", "linux");
entity("sensor.local_architecture", "ep", "architecture", "x86_64");
entity("sensor.local_cpu_total", "ep", "cpu_total", 8);
entity("sensor.local_memoire_totale", "ep", "memory_total", 33.5, { unit_of_measurement: "GB" });
entity("sensor.local_images", "ep", "images_count", 11);

// [name, stack or null, state, health, image, cpu %, memory MB, update]
const containers = [
  ["grafana", "monitoring", "running", "healthy", "grafana/grafana:11.4.0", 12.5, 310, false],
  ["prometheus", "monitoring", "running", null, "prom/prometheus:v3.1.0", 18.2, 820, false],
  ["media-server", "media", "running", "healthy", "example/media-server:latest", 64.0, 2400, true],
  ["postgres", "data", "running", "unhealthy", "postgres:16", 9.1, 610, false],
  ["status-page", null, "exited", null, "example/status-page:latest", null, null, false],
  ["reverse-proxy", null, "running", null, "example/reverse-proxy:latest", 3.4, 95, false],
];
const stacks = [...new Set(containers.map((c) => c[1]).filter(Boolean))];
for (const name of stacks) {
  const n = containers.filter((c) => c[1] === name).length;
  device(`stack_${name}`, name, "Stack", "ep");
  entity(`switch.${name}_stack`, `stack_${name}`, "stack", "on");
  entity(`binary_sensor.${name}_statut`, `stack_${name}`, "status", "on");
  entity(`sensor.${name}_conteneurs`, `stack_${name}`, "stack_containers_count", n);
}
for (const [name, stack, state, health, image, cpu, mem, upd] of containers) {
  const id = `ct_${name}`;
  const slug = name.replace(/-/g, "_");
  device(id, name, "Container", stack ? `stack_${stack}` : "ep");
  entity(`sensor.${slug}_etat`, id, "container_state", state);
  if (health) entity(`sensor.${slug}_sante`, id, "container_health_state", health);
  entity(`sensor.${slug}_image`, id, "image", image);
  if (cpu !== null) entity(`sensor.${slug}_cpu`, id, "cpu_usage_total", cpu, { unit_of_measurement: "%" });
  if (mem !== null) entity(`sensor.${slug}_memoire`, id, "memory_usage", mem, { unit_of_measurement: "MB" });
  entity(`switch.${slug}_conteneur`, id, "container", state === "running" ? "on" : "off");
  entity(`button.${slug}_redemarrer`, id, "restart_container", "unknown");
  entity(`update.${slug}_image`, id, "container_image_update", upd ? "on" : "off");
}
const running = containers.filter((c) => c[2] === "running").length;
entity("sensor.local_conteneurs", "ep", "containers_count", containers.length);
entity("sensor.local_conteneurs_en_cours", "ep", "containers_running", running);
