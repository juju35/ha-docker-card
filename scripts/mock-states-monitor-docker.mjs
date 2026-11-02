// Mock Home Assistant states shaped like Monitor Docker (`monitor_docker: - name: Docker`), used to
// render the Monitor Docker screenshots. Its entities have no unique_id: none is in the registry.
export const states = {};

const st = (entity_id, state, attributes = {}) => (states[entity_id] = { entity_id, state: String(state), attributes });

st("sensor.docker_version", "27.5.1", {
  Online_CPUs: 8,
  Memory_limit: 33498525696,
  OS: "Debian GNU/Linux 12 (bookworm)",
  Architecture: "x86_64",
  friendly_name: "Version",
  icon: "mdi:information-outline",
});
st("sensor.docker_1cpu", "9.8", { unit_of_measurement: "%", friendly_name: "1CPU", icon: "mdi:chip" });
st("sensor.docker_memory", "6144", { unit_of_measurement: "MiB", friendly_name: "Memory", icon: "mdi:memory" });
st("sensor.docker_memory_percent", "19.2", { unit_of_measurement: "%", friendly_name: "Memory (percent)", icon: "mdi:memory" });
st("sensor.docker_images", "9", { friendly_name: "Images", icon: "mdi:docker" });

const containers = [
  ["grafana", "running", "healthy", "grafana/grafana:11.4.0", "Up 12 days"],
  ["media-server", "running", "healthy", "example/media-server:latest", "Up 3 days"],
  ["mqtt", "running", "unknown", "eclipse-mosquitto:2", "Up 12 days"],
  ["postgres", "running", "unhealthy", "postgres:16", "Up 2 hours"],
  ["prometheus", "running", "unknown", "prom/prometheus:v3.1.0", "Up 12 days"],
  ["reverse-proxy", "running", "healthy", "example/reverse-proxy:latest", "Up 12 days"],
  ["status-page", "exited", "unknown", "example/status-page:latest", "Exited (0) 2 hours ago"],
];
st("sensor.docker_containers_total", containers.length, { friendly_name: "Containers Total", icon: "mdi:docker" });
st("sensor.docker_containers_running", containers.filter(([, s]) => s === "running").length, { friendly_name: "Containers Running", icon: "mdi:docker" });

for (const [name, state, health, image, status] of containers) {
  const slug = `docker_${name.replace(/-/g, "_")}`;
  st(`sensor.${slug}_state`, state, { friendly_name: `${name} State` });
  st(`sensor.${slug}_status`, status, { friendly_name: `${name} Status` });
  st(`sensor.${slug}_health`, health, { friendly_name: `${name} Health` });
  st(`sensor.${slug}_image`, image, { friendly_name: `${name} Image` });
  st(`switch.${slug}`, state === "running" ? "on" : "off", { friendly_name: name, icon: "mdi:docker" });
  st(`button.${slug}_restart`, "unknown", { friendly_name: `${name} Restart`, icon: "mdi:docker" });
}
