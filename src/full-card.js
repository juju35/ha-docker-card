// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { bytesOf, countText, esc, fmtBytes, fmtBytesPair, fmtPct, num, stateClass, svgIcon } from "./helpers.js";
import { findEnv, listEnvs } from "./registry-based-resolution.js";
import { BASE_STYLE, DIALOG_STYLE, DockerBase, HIST_REFRESH, HIST_WAIT, HIST_WINDOW, MOTION_STYLE, rangeText, spark } from "./shared-styles.js";

export const ring = (pct) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const p = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  return `<svg class="ring" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="${r}" class="track"/>
    <circle cx="32" cy="32" r="${r}" class="value" stroke-dasharray="${((p / 100) * c).toFixed(1)} ${c.toFixed(1)}"/>
  </svg>`;
};

export const FULL_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title .count { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .section-title.fold { cursor: pointer; user-select: none; }
  .section-title .chevron { transition: transform .2s ease; }
  .section-title.closed { margin-bottom: 0; }
  .section-title.closed .chevron { transform: rotate(-90deg); }
  .gauges { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
  .section-title .unit { text-transform: none; }
  .gauge { display: flex; flex-direction: column; align-items: center; min-width: 0; position: relative; border-radius: 10px; overflow: hidden; }
  .gauge > :not(.spark) { position: relative; }
  /* 24 h curve in its own 24 px band under the ring and the label, never behind the text. */
  .gauge:has(> .spark) { padding-bottom: 28px; }
  .gauge .spark { position: absolute; inset: auto 0 0; width: 100%; height: 24px; pointer-events: none; }
  .spark-a { fill: color-mix(in srgb, var(--c) 12%, transparent); }
  .spark-l { fill: none; stroke: color-mix(in srgb, var(--c) 50%, transparent); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
  /* Ring of 60 px, smaller when the column is narrower (6 columns of a small Sections view). */
  .gauge .gw { position: relative; width: min(60px, 100%); aspect-ratio: 1; }
  .ring { display: block; width: 100%; height: 100%; transform: rotate(-90deg); }
  .ring circle { fill: none; stroke-width: 6; }
  .ring .track { stroke: var(--divider-color, rgba(127,127,127,.25)); }
  .ring .value { stroke: var(--c, var(--dh-orange)); stroke-linecap: round; transition: stroke-dasharray .6s ease; }
  .gauge .val { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .gauge .val b { font-size: 14px; font-weight: 500; }
  .gauge .val .icon { width: 12px; height: 12px; color: var(--secondary-text-color); }
  .gauge .lbl { font-size: 12px; color: var(--secondary-text-color); margin-top: 0; text-align: center; line-height: 1.35; }
  .gauge .lbl small { display: block; font-size: 11px; opacity: .85; }
  .gauge .lbl { max-width: 100%; overflow-wrap: break-word; }
  @container dk-card (max-width: 299px) {
    .gauge .val .icon { display: none; }
    .gauge .val b { font-size: 11px; }
    .gauge .lbl, .gauge .lbl small { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  }
  .counts { display: grid; grid-template-columns: repeat(auto-fit, minmax(68px, 1fr)); gap: 6px; }
  .count-tile { display: flex; flex-direction: column; align-items: center; gap: 0; padding: 6px 4px; border-radius: 10px;
                background: var(--secondary-background-color, rgba(127,127,127,.08)); min-width: 0; text-align: center; }
  .count-tile .top { display: flex; align-items: center; gap: 6px; }
  .count-tile .icon { color: var(--c, var(--secondary-text-color)); }
  .count-tile .k { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .count-tile .v { font-size: 14px; font-weight: 500; }
  .count-tile.has-updates { --c: var(--dh-orange); }
  .count-tile.has-updates .v { color: var(--dh-orange); }
  .list { display: flex; flex-direction: column; }
  .item { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.15)); min-width: 0; }
  /* CPU over the last 24 hours behind a container's row, discreet. */
  .item { position: relative; }
  .item > :not(.spark) { position: relative; }
  .item:has(> .spark) { padding-bottom: 15px; }
  .item > .spark { position: absolute; inset: auto 0 2px; width: 100%; height: 12px; pointer-events: none; --c: var(--primary-color, #03a9f4); opacity: .7; }
  .item:last-child { border-bottom: none; }
  .item .main { flex: 1; min-width: 0; }
  .item .title { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
  .item .title span:first-child { overflow: hidden; text-overflow: ellipsis; }
  .item .detail { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tag { font-size: 11px; padding: 1px 6px; border-radius: 6px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--secondary-text-color); flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis;
         display: inline-flex; align-items: center; gap: 3px; }
  .tag .icon { width: 12px; height: 12px; }
  .tag.alert { background: color-mix(in srgb, var(--c) 15%, transparent); color: var(--c); }
  .badge-update { color: var(--dh-orange); }
  .badge-update .icon { width: 18px; height: 18px; }
  .ctrl.badge-update { color: var(--dh-orange); }
  .ct-tools { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .ct-search { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; padding: 0 8px; height: 30px; box-sizing: border-box;
               border: 1px solid var(--divider-color, rgba(127,127,127,.25)); border-radius: 8px; color: var(--secondary-text-color); }
  .ct-search .icon { width: 16px; height: 16px; }
  .ct-search:focus-within { border-color: var(--primary-color, #03a9f4); }
  .ct-search input { all: unset; flex: 1; min-width: 0; font-size: 13px; color: var(--primary-text-color); }
  .ct-search input::placeholder { color: var(--secondary-text-color); }
  .ct-sort { flex: none; max-width: 45%; height: 30px; padding: 0 6px; font: inherit; font-size: 13px; border-radius: 8px; cursor: pointer;
             border: 1px solid var(--divider-color, rgba(127,127,127,.25)); background: transparent; color: var(--primary-text-color); }
  .ct-sort option { background: var(--card-background-color, #fff); color: var(--primary-text-color); }
  .ct-sort:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  .ctrl { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; border: none;
          background: transparent; color: var(--secondary-text-color); cursor: pointer; flex: none; padding: 0; }
  .ctrl:hover:not(:disabled) { background: var(--secondary-background-color, rgba(127,127,127,.12)); }
  .ctrl:disabled { opacity: .4; cursor: default; }
  .ctrl.on { color: var(--dh-ok); }
  .ctrl .icon { width: 20px; height: 20px; }
  .empty { font-size: 13px; color: var(--secondary-text-color); padding: 4px 0; }
`;

export class DockerCard extends DockerBase {
  constructor() {
    super();
    // Containers list search (filters as you type) and sort, kept while the card lives (not in the config).
    this.shadowRoot.addEventListener("input", (ev) => {
      if (ev.target?.dataset?.ctl !== "search") return;
      this._ctQuery = ev.target.value;
      this._update();
    });
    this.shadowRoot.addEventListener("change", (ev) => {
      if (ev.target?.dataset?.ctl !== "sort") return;
      this._ctSort = ev.target.value;
      this._update();
    });
  }

  static getConfigElement() {
    return document.createElement("docker-card-editor");
  }

  static getStubConfig(hass) {
    const env = listEnvs(hass)[0];
    return env ? { environment: env.value } : {};
  }

  // Rows of about 50 px: header, gauges, counter tiles, then each list title and, when the list is
  // open, its rows — the ones actually listed: only_problems filters them (as _section does), down to
  // a single "nothing to report" line when none needs attention.
  getCardSize() {
    const c = this._config || {};
    let size = 1 + (c.show_system !== false ? 2 : 0) + (c.show_counts !== false ? 1 : 0);
    const env = this._hass && this._config ? findEnv(this._hass, c).env : null;
    for (const [key, shown, problem] of [
      ["stacks", c.show_stacks !== false, (st) => this._stackProblem(st)],
      ["containers", this._showContainers(env), (ct) => this._containerProblem(ct)],
    ]) {
      const all = env ? env[key].length : 0;
      const n = env && c.only_problems ? Math.max(env[key].filter(problem).length, all ? 1 : 0) : all;
      if (shown && (all || !env)) size += 1 + (this._isOpen(key) ? n : 0);
    }
    return size;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  _render() {
    const { env, error } = findEnv(this._hass, this._config);
    if (error) return this._error(error);
    const c = this._config;
    const parts = [];
    if (c.show_system !== false) parts.push(this._stats(env));
    if (c.show_counts !== false) parts.push(this._counts(env));
    if (c.show_stacks !== false) parts.push(this._stacks(env));
    if (this._showContainers(env)) parts.push(this._containers(env));
    return `<style>${BASE_STYLE}${this._bannerStyle()}${DIALOG_STYLE}${FULL_STYLE}${MOTION_STYLE}</style>
      <ha-card>
        ${this._header(env)}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  _gauge(id, label, icon, pct, display, cls, hist = null) {
    const range = rangeText(hist, this._loc());
    return `<div class="gauge clickable ${cls}" role="button" tabindex="0" data-entity="${esc(id || "")}"${range ? ` title="${esc(label + range)}"` : ""}>${spark(hist, this._histEnd, 100)}
      <div class="gw">${ring(pct)}<div class="val">${svgIcon(icon)}<b>${display}</b></div></div>
      <div class="lbl">${label}</div>
    </div>`;
  }

  _stats(env) {
    const { cpu, mem, cores, used, total, cpuId, memId, perCore } = this._host(env);
    const { hist } = this._usageHist(env);
    const cs = this._containerStats(env);
    const runPct = cs.total ? (100 * (cs.running ?? 0)) / cs.total : null;
    const memLabel = used && total ? `${this._t("memory")}<small>${fmtBytesPair(used, total, this._loc())}</small>` : this._t("memory");
    return `<div class="gauges">
      ${this._gauge(
        cpuId,
        cores
          ? `${this._t("cpu")}<small>${esc(cores)} ${esc(this._tn("cores", cores))}</small>`
          : perCore
            ? `${this._t("cpu")}<small>${this._t("containers")}</small>`
            : this._t("cpu"),
        ICONS.cpu,
        cpu,
        cpu === null ? "—" : `${Math.round(cpu)}%`,
        perCore ? "ok" : this._level("cpu", cpu),
        hist?.[cpuId]
      )}
      ${this._gauge(memId, memLabel, ICONS.ram, mem, mem === null ? "—" : `${Math.round(mem)}%`, this._level("ram", mem), hist?.[memId])}
      ${this._gauge(
        cs.entity,
        `${this._t("containers")}<small>${this._t("running")}</small>`,
        ICONS.container,
        runPct,
        cs.total === null ? "—" : `${esc(cs.running ?? "?")}/${cs.total}`,
        cs.unhealthy > 0 || (runPct !== null && runPct < 100) ? "warn" : "ok"
      )}
    </div>`;
  }

  // The host CPU and memory usage sensors whose 24 h history is drawn (none when show_history is false).
  // Portainer has none: its CPU and memory entities are the core count and the total memory, whose curves
  // would only draw a flat line labelled as usage.
  _usageIds(env) {
    if (this._config.show_history === false || env.source === "portainer") return {};
    const { cpuId, memId } = this._host(env);
    return { cpuId, memId };
  }

  // 24 h usage points of the host CPU and memory sensors, { [id]: [{ t, v }] } (nothing yet at first).
  _usageHist(env) {
    const { cpuId, memId } = this._usageIds(env);
    return { cpuId, memId, hist: this._history([cpuId, memId, ...this._ctCpuIds(env)].filter(Boolean)) };
  }

  // The containers' CPU sensors whose 24 h curve is drawn behind their row: only while the containers list is open,
  // in the same statistics query as the host's (none when show_history is false).
  _ctCpuIds(env) {
    const c = this._config;
    if (c.show_history === false || !this._showContainers(env) || !this._isOpen("containers")) return [];
    return env.containers.map((ct) => ct.entities.container_cpu_percent ?? ct.entities._cpu).filter(Boolean);
  }

  // 24 h of 5-minute means from the recorder's statistics, fetched again every 5 minutes, as { t, v } points
  // (t: start of the 5-minute period, in ms; Home Assistant sends a number, older versions an ISO date).
  // Returns what is already there (nothing at first): the card renders again when the answer comes.
  _history(ids) {
    const key = ids.join(",");
    if (key && this._hass.callWS && (this._histKey !== key || Date.now() - this._histAt > HIST_REFRESH)) {
      const end = Date.now();
      // Other series: until their first answer (or failure), the curves already known stay and the new ones keep
      // their box (HIST_WAIT).
      if (this._histKey !== key) this._histWait = true;
      this._histKey = key;
      this._histAt = end;
      this._hass
        .callWS({
          type: "recorder/statistics_during_period",
          start_time: new Date(end - HIST_WINDOW).toISOString(),
          statistic_ids: ids,
          period: "5minute",
          types: ["mean"],
        })
        .then((r) => {
          if (this._histKey !== key) return;
          this._histWait = false;
          const point = (p) => ({ t: typeof p.start === "number" ? p.start : Date.parse(p.start), v: p.mean });
          this._hist = Object.fromEntries(
            ids.map((id) => [id, (r?.[id] || []).map(point).filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v))])
          );
          this._histEnd = end;
          // Left the page meanwhile: kept for its return (connectedCallback renders it), nothing drawn now.
          if (this.isConnected !== false) this._update();
        })
        // No statistics (sensor without state_class, recorder off): try again in a minute, nothing meanwhile.
        .catch(() => {
          this._histAt = Date.now() - HIST_REFRESH + 60000;
          if (this._histKey !== key || !this._histWait) return;
          this._histWait = false;
          if (this.isConnected !== false) this._update();
        });
    }
    if (this._histKey !== key) return null;
    if (!this._histWait) return this._hist;
    return Object.fromEntries(ids.map((id) => [id, this._hist?.[id] ?? HIST_WAIT]));
  }

  _counts(env) {
    const e = env.entities;
    const cs = this._containerStats(env);
    const tile = (id, icon, label, value, cls = "") =>
      id && this._s(id)
        ? `<div class="count-tile clickable ${cls}" role="button" tabindex="0" data-key="${esc(id)}" data-entity="${esc(id)}"><div class="top">${svgIcon(icon)}<span class="v">${esc(
            value
          )}</span></div><div class="k">${esc(label)}</div></div>`
        : "";
    const v = (id) => countText(this._s(id));
    const tiles = [
      tile(e.stacks, ICONS.stack, this._t("stacks"), v(e.stacks)),
      tile(e.image_count, ICONS.image, this._t("images"), v(e.image_count)),
      tile(e.volume_count, ICONS.volume, this._t("volumes"), v(e.volume_count)),
      tile(e.network_count, ICONS.network, this._t("networks"), v(e.network_count)),
      cs.updates === undefined ? "" : tile(cs.entity, ICONS.update, this._t("updates"), cs.updates ?? "—", cs.updates > 0 ? "has-updates" : ""),
    ].filter(Boolean);
    return tiles.length ? `<div class="counts">${tiles.join("")}</div>` : "";
  }

  _controls(entities, label) {
    if (this._config.show_controls === false) return "";
    const sw = entities._switch && this._s(entities._switch);
    const out = [];
    const rs = entities.restart && this._s(entities.restart);
    if (rs)
      out.push(
        `<button type="button" class="ctrl" title="${esc(this._t("restart"))}" data-key="restart" data-action="restart" data-entity="${esc(entities.restart)}" data-label="${esc(
          label
        )}"${rs.state === "unavailable" ? " disabled" : ""}>${svgIcon(ICONS.restart)}</button>`
      );
    // An unavailable or unknown switch cannot be started or stopped: its button is shown disabled.
    if (sw)
      out.push(
        `<button type="button" class="ctrl ${sw.state === "on" ? "on" : ""}" title="${esc(this._t("start_stop"))}" data-key="toggle" data-action="toggle" data-entity="${
          esc(sw.entity_id)
        }" data-label="${esc(label)}"${sw.state === "on" || sw.state === "off" ? "" : " disabled"}>${svgIcon(ICONS.power)}</button>`
      );
    return out.join("");
  }

  // Pending update of a stack or container. An update entity that can install (a container image, Dockhand or
  // Portainer) is a button asking for confirmation, then calling update.install; disabled while unavailable or
  // installing. Otherwise (stack updates binary sensor, show_controls: false, no install support) a badge that
  // opens the more-info dialog.
  _updateBadge(upd, label) {
    const id = upd.entity_id;
    const features = upd.attributes?.supported_features;
    const canInstall = id.startsWith("update.") && this._config.show_controls !== false && (features === undefined || (features & 1) === 1);
    if (canInstall) {
      const off = upd.state === "unavailable" || !!upd.attributes?.in_progress;
      return `<button type="button" class="ctrl badge-update" title="${esc(this._t("install"))}" aria-label="${esc(this._t("install"))} ${esc(label)}" data-key="update" data-action="install" data-entity="${esc(
        id
      )}" data-label="${esc(label)}"${off ? " disabled" : ""}>${svgIcon(ICONS.install)}</button>`;
    }
    return `<span class="badge-update clickable" role="button" tabindex="0" title="${esc(this._t("update_available"))}" data-key="update" data-entity="${esc(id)}">${svgIcon(
      ICONS.update
    )}</span>`;
  }

  _stateLabel(state) {
    const k = `state_${String(state || "").toLowerCase()}`;
    const l = this._t(k);
    return l === k ? state : l;
  }

  // Needs attention: not running, update available or Git sync error — what only_problems keeps.
  _stackProblem(st) {
    const e = st.entities;
    return (
      stateClass(this._stackStatus(e).state) !== "ok" ||
      this._s(e.stack_updates_available)?.state === "on" ||
      this._s(e.git_stack_sync_error)?.state === "on"
    );
  }

  _containerProblem(ct) {
    const e = ct.entities;
    return stateClass(this._s(e.state)?.state) !== "ok" || this._s(e._update)?.state === "on" || this._health(e) === "unhealthy";
  }

  _stacks(env) {
    const rows = env.stacks.map((st) => {
      const e = st.entities;
      const status = this._stackStatus(e);
      // A count only: an unknown or unavailable sensor (or attribute) leaves it out of the detail line.
      const attrCount = parseFloat(status.s?.attributes?.container_count);
      const count = num(this._s(e.containers_in_stack)) ?? (Number.isFinite(attrCount) ? attrCount : null);
      const upd = this._s(e.stack_updates_available);
      const hasUpd = upd?.state === "on";
      const syncErr = this._s(e.git_stack_sync_error)?.state === "on";
      const cls = stateClass(status.state);
      const problem = this._stackProblem(st);
      const isGit = /^Git/.test(st.type || "");
      const detail = [
        status.state ? this._stateLabel(status.state) : null,
        count !== null ? `${count} ${this._tn("containers_lc", count, "container_lc")}` : null,
      ].filter(Boolean);
      return {
        problem,
        html: `<div class="item" data-key="${esc(st.id)}">
          <span class="dot ${cls}"></span>
          <div class="main clickable" role="button" tabindex="0" data-entity="${esc(status.id || "")}">
            <div class="title"><span>${esc(st.name)}</span>
              ${isGit ? `<span class="tag">${svgIcon(ICONS.git)}git</span>` : ""}
              ${syncErr ? `<span class="tag alert crit">${esc(this._t("sync_error"))}</span>` : ""}
            </div>
            <div class="detail">${esc(detail.join(" · "))}</div>
          </div>
          ${hasUpd ? this._updateBadge(upd, st.name) : ""}
          ${this._controls(e, st.name)}
        </div>`,
      };
    });
    return this._section("stacks", ICONS.stack, this._t("stacks"), rows);
  }

  // CPU (%) and memory (bytes) of a container: Dockhand's diagnostic sensors, Portainer's and Monitor Docker's.
  _ctUsage(e) {
    return { cpu: num(this._s(e.container_cpu_percent ?? e._cpu)), mem: bytesOf(this._s(e.container_memory_usage ?? e._memory)) };
  }

  _containers(env) {
    const sort = this._ctSort ?? "name";
    const query = (this._ctQuery ?? "").trim().toLowerCase();
    // Their CPU over 24 h behind each row, from the statistics already fetched with the host's (see _usageHist).
    const hist = this._ctCpuIds(env).length ? this._usageHist(env).hist : null;
    const rows = env.containers.map((ct) => {
      const e = ct.entities;
      const cpuId = e.container_cpu_percent ?? e._cpu;
      const usage = this._ctUsage(e);
      const state = this._s(e.state);
      const upd = this._s(e._update);
      const hasUpd = upd?.state === "on";
      const cls = stateClass(state?.state);
      const unhealthy = this._health(e) === "unhealthy";
      const problem = this._containerProblem(ct);
      // Dockhand and Monitor Docker "allinone": attributes of the state sensor; Monitor Docker: own sensors.
      const known = (s) => (s && s.state !== "unknown" && s.state !== "unavailable" ? s.state : null);
      const status = state?.attributes?.status || known(this._s(e._status)) || (state ? this._stateLabel(state.state) : "");
      const image = state?.attributes?.image || known(this._s(e._image));
      const name = state?.attributes?.name || ct.name;
      // Sorted by CPU or memory: that value leads the detail line.
      const value = sort === "cpu" && usage.cpu !== null ? fmtPct(usage.cpu, this._loc()) : sort === "memory" && usage.mem !== null ? fmtBytes(usage.mem, this._loc()) : null;
      return {
        problem,
        usage,
        match: !query || name.toLowerCase().includes(query) || ct.name.toLowerCase().includes(query),
        html: `<div class="item" data-key="${esc(ct.id)}">${hist && cpuId ? spark(hist[cpuId], this._histEnd) : ""}
          <span class="dot ${unhealthy ? "crit" : cls}"></span>
          <div class="main clickable" role="button" tabindex="0" data-entity="${esc(e.state || e._status || "")}"${hist && cpuId && rangeText(hist[cpuId], this._loc()) ? ` title="${esc(`${name} · CPU${rangeText(hist[cpuId], this._loc())}`)}"` : ""}>
            <div class="title"><span>${esc(name)}</span>
              ${unhealthy ? `<span class="tag alert crit">${esc(this._t("unhealthy"))}</span>` : ""}
            </div>
            <div class="detail">${esc([value, status, image].filter(Boolean).join(" · "))}</div>
          </div>
          ${hasUpd ? this._updateBadge(upd, ct.name) : ""}
          ${this._controls(e, ct.name)}
        </div>`,
      };
    });
    // Sort options: by name (items needing attention first, as the stacks), else by CPU or memory, highest first
    // (containers without the value last); only the measures some container has are offered.
    const has = { cpu: rows.some((r) => r.usage.cpu !== null), memory: rows.some((r) => r.usage.mem !== null) };
    const by = has[sort] ? sort : "name";
    if (by !== "name") {
      const v = (r) => (by === "cpu" ? r.usage.cpu : r.usage.mem) ?? -1;
      rows.sort((a, b) => v(b) - v(a));
    }
    const opts = [["name", "sort_name"], ["cpu", "cpu"], ["memory", "memory"]].filter(([k]) => k === "name" || has[k]);
    const tools = `<div class="ct-tools">
        <label class="ct-search">${svgIcon(ICONS.search)}<input type="search" data-ctl="search" placeholder="${esc(this._t("search"))}" aria-label="${esc(
          this._t("search")
        )}" value="${esc(this._ctQuery ?? "")}" autocomplete="off" spellcheck="false"></label>
        ${
          opts.length > 1
            ? `<select class="ct-sort" data-ctl="sort" aria-label="${esc(this._t("sort_by"))}" title="${esc(this._t("sort_by"))}">${opts
                .map(([k, l]) => `<option value="${k}"${k === by ? " selected" : ""}>${esc(this._t(l))}</option>`)
                .join("")}</select>`
            : ""
        }
      </div>`;
    return this._section("containers", ICONS.container, this._t("containers"), rows, { tools, keepOrder: by !== "name", query: !!query });
  }

  // Stacks and containers lists are collapsed until clicked, unless expand_<key> is set.
  _isOpen(key) {
    return this._folds?.[key] ?? this._config[`expand_${key}`] === true;
  }

  // `tools`: shown above the open list (containers search and sort); rows with `match: false` are filtered out by
  // that search; `keepOrder`: the rows are already sorted (by CPU or memory).
  _section(key, icon, title, rows, { tools = "", keepOrder = false, query = false } = {}) {
    if (!rows.length) return "";
    const shown = rows.filter((r) => r.match !== false && (!this._config.only_problems || r.problem));
    // Items needing attention first.
    if (!keepOrder) shown.sort((a, b) => Number(b.problem) - Number(a.problem));
    const open = this._isOpen(key);
    const empty = query ? this._t("no_match") : `✓ ${this._t("all_ok")}`;
    return `<div>
      <div class="section-title fold ${open ? "" : "closed"}" role="button" tabindex="0" aria-expanded="${open}" data-action="fold" data-section="${key}">${svgIcon(icon)}${esc(
        title
      )}<span class="count">${shown.length}/${rows.length}</span>${svgIcon(ICONS.chevron, "chevron")}</div>
      ${open ? `${tools}<div class="list">${shown.length ? shown.map((r) => r.html).join("") : `<div class="empty">${esc(empty)}</div>`}</div>` : ""}
    </div>`;
  }
}
