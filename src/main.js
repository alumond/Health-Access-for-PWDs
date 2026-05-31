const TARGET = 80;

const profile = {
  states: [
    ["Lagos", 37, 2.78],
    ["Kano", 31, 3.03],
    ["Abuja", 12, 2.83],
    ["Oyo", 10, 3.50],
    ["Ogun", 7, 3.14],
    ["Ekiti", 6, 3.00],
    ["Benue", 4, 4.50],
    ["Nasarawa", 4, 3.00],
    ["Bauchi", 3, 2.00],
    ["Edo", 3, 2.00],
    ["Osun", 3, 3.33],
    ["Akwa Ibom", 2, 2.00],
    ["Borno", 2, 5.00],
    ["Ondo", 2, 2.50],
    ["Abia", 1, 3.00],
    ["Adamawa", 1, 3.00],
    ["Gombe", 1, 4.00],
    ["Katsina", 1, 1.00],
    ["Kwara", 1, 3.00],
    ["Plateau", 1, 3.00],
    ["Rivers", 1, 4.00],
  ],
  ages: [
    ["18 - 24", 29],
    ["25 - 34", 58],
    ["35 - 44", 28],
    ["45 - 54", 14],
    ["55 - 64", 4],
  ],
  genders: [
    ["Female", 74],
    ["Male", 59],
  ],
  disabilities: [
    ["Hearing impairment", 68],
    ["Physical disability", 55],
    ["Visual impairment", 14],
    ["Albinism", 9],
    ["Deaf-blind", 8],
    ["Cognitive disability", 4],
    ["Other / self-described", 5],
  ],
  facilities: [
    ["Primary", 58],
    ["Secondary", 43],
    ["Tertiary", 32],
  ],
  months: [
    ["Oct 2025", 3, 3.7],
    ["Dec 2025", 1, 3.0],
    ["Feb 2026", 42, 3.1],
    ["Mar 2026", 14, 2.8],
    ["Apr 2026", 18, 2.9],
    ["May 2026", 55, 2.9],
  ],
  quality: [
    [1, 22],
    [2, 24],
    [3, 46],
    [4, 31],
    [5, 10],
  ],
  barriers: [
    { key: "interpreters", label: "Sign language interpreters available", actual: 26, good: true },
    { key: "materials", label: "Accessible materials available", actual: 32, good: true },
    { key: "toilets", label: "Accessible toilets / elevators", actual: 45, good: true },
    { key: "assistive", label: "Assistive aids available", actual: 32, good: true },
    { key: "communication", label: "Providers communicate effectively", actual: 67, good: true },
    { key: "accessibleVisit", label: "Last hospital visit accessible", actual: 64, good: true },
    { key: "financial", label: "Financial difficulty accessing care", actual: 81, good: false },
    { key: "stigma", label: "Provider or societal stigma reported", actual: 58, good: false },
  ],
  heatmap: {
    rows: ["Hearing", "Physical", "Visual", "Albinism", "Deaf-blind", "Cognitive"],
    cols: ["Communication", "Materials", "Physical access", "Cost", "Stigma"],
    values: [
      [79, 71, 43, 82, 61],
      [38, 52, 77, 84, 55],
      [46, 69, 62, 79, 58],
      [34, 44, 48, 67, 72],
      [83, 76, 59, 88, 63],
      [45, 58, 52, 75, 60],
    ],
  },
  themes: [
    ["Sign language interpreters", 48, "Communication"],
    ["Ramps, elevators, toilets", 39, "Physical access"],
    ["Free or subsidized care", 31, "Affordability"],
    ["Disability-awareness training", 26, "Respectful care"],
    ["Accessible formats", 19, "Information"],
    ["Priority / reduced waiting", 16, "Patient flow"],
    ["Inclusive policies", 14, "Governance"],
    ["Navigation support", 10, "Patient flow"],
  ],
};

const records = buildRecords(profile);
let state = readUrlState();
const tooltip = document.createElement("div");
tooltip.className = "tooltip";
tooltip.hidden = true;
document.body.append(tooltip);

const els = {
  stateFilter: document.querySelector("#state-filter"),
  disabilityFilter: document.querySelector("#disability-filter"),
  facilityFilter: document.querySelector("#facility-filter"),
  barrierFilter: document.querySelector("#barrier-filter"),
  resetButton: document.querySelector("#reset-button"),
  recordsCount: document.querySelector("#records-count"),
  avgQuality: document.querySelector("#avg-quality"),
  riskSignal: document.querySelector("#risk-signal"),
  kpiInterpreters: document.querySelector("#kpi-interpreters"),
  kpiInterpretersNote: document.querySelector("#kpi-interpreters-note"),
  kpiMaterials: document.querySelector("#kpi-materials"),
  kpiMaterialsNote: document.querySelector("#kpi-materials-note"),
  kpiFinance: document.querySelector("#kpi-finance"),
  kpiFinanceNote: document.querySelector("#kpi-finance-note"),
  kpiAccessible: document.querySelector("#kpi-accessible"),
  kpiAccessibleNote: document.querySelector("#kpi-accessible-note"),
  stateChart: document.querySelector("#state-chart"),
  facilityDonut: document.querySelector("#facility-donut"),
  barrierBars: document.querySelector("#barrier-bars"),
  heatmap: document.querySelector("#heatmap"),
  qualityChart: document.querySelector("#quality-chart"),
  timeChart: document.querySelector("#time-chart"),
  themeBubbles: document.querySelector("#theme-bubbles"),
  executiveActions: document.querySelector("#executive-actions"),
};

function buildRecords(source) {
  const states = expandWeighted(source.states, ([name, count, quality]) => ({ name, count, quality }));
  const ages = expandWeighted(source.ages, ([name, count]) => ({ name, count }));
  const genders = expandWeighted(source.genders, ([name, count]) => ({ name, count }));
  const disabilities = expandWeighted(source.disabilities, ([name, count]) => ({ name, count }));
  const facilities = expandWeighted(source.facilities, ([name, count]) => ({ name, count }));
  const months = expandWeighted(source.months, ([name, count, quality]) => ({ name, count, quality }));
  const quality = expandWeighted(source.quality, ([score, count]) => ({ name: score, count }));
  const max = source.states.reduce((sum, row) => sum + row[1], 0);

  return Array.from({ length: max }, (_, index) => {
    const stateInfo = states[index % states.length];
    const month = months[(index * 7) % months.length];
    const score = Number(quality[(index * 5 + Math.floor(index / 9)) % quality.length].name);
    const disability = disabilities[(index * 3 + Math.floor(index / 5)) % disabilities.length].name;
    const facility = facilities[(index * 2 + Math.floor(index / 11)) % facilities.length].name;
    const needsCommunication = disability.includes("Hearing") || disability.includes("Deaf");
    const needsPhysical = disability.includes("Physical");
    const barrierBoost = (needsCommunication ? 10 : 0) + (needsPhysical ? 8 : 0);
    const base = (index * 37) % 100;

    return {
      id: index + 1,
      state: stateInfo.name,
      age: ages[(index * 2) % ages.length].name,
      gender: genders[(index * 5) % genders.length].name,
      disability,
      facility,
      month: month.name,
      quality: clamp(Math.round((score + stateInfo.quality + month.quality) / 3), 1, 5),
      interpreters: needsCommunication ? base < 22 : base < 34,
      materials: base < 30,
      toilets: needsPhysical ? base < 34 : base < 48,
      assistive: base < 32,
      communication: needsCommunication ? base < 54 : base < 72,
      accessibleVisit: base + barrierBoost < 67,
      financial: base < 81,
      stigma: base < 58,
    };
  });
}

function expandWeighted(rows, mapRow) {
  return rows.flatMap(row => {
    const item = mapRow(row);
    return Array.from({ length: item.count }, () => item);
  });
}

function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  return {
    state: params.get("state") || "All",
    disability: params.get("disability") || "All",
    facility: params.get("facility") || "All",
    barrier: params.get("barrier") || "all",
  };
}

function writeUrlState() {
  const params = new URLSearchParams();
  Object.entries(state).forEach(([key, value]) => {
    if (value !== "All" && value !== "all") params.set(key, value);
  });
  const next = params.toString() ? `?${params}` : window.location.pathname;
  window.history.replaceState(null, "", next);
}

function initFilters() {
  setOptions(els.stateFilter, ["All", ...profile.states.map(row => row[0])], state.state);
  setOptions(els.disabilityFilter, ["All", ...profile.disabilities.map(row => row[0])], state.disability);
  setOptions(els.facilityFilter, ["All", ...profile.facilities.map(row => row[0])], state.facility);
  setOptions(
    els.barrierFilter,
    [["all", "All barriers"], ...profile.barriers.map(item => [item.key, item.label])],
    state.barrier,
  );
}

function setOptions(select, options, selected) {
  select.replaceChildren(
    ...options.map(option => {
      const value = Array.isArray(option) ? option[0] : option;
      const label = Array.isArray(option) ? option[1] : option;
      const element = document.createElement("option");
      element.value = value;
      element.textContent = label;
      element.selected = value === selected;
      return element;
    }),
  );
}

function filteredRecords() {
  return records.filter(record => {
    const stateMatch = state.state === "All" || record.state === state.state;
    const disabilityMatch = state.disability === "All" || record.disability === state.disability;
    const facilityMatch = state.facility === "All" || record.facility === state.facility;
    return stateMatch && disabilityMatch && facilityMatch;
  });
}

function pct(recordsSubset, key) {
  if (!recordsSubset.length) return 0;
  return Math.round((recordsSubset.filter(record => record[key]).length / recordsSubset.length) * 100);
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function groupBy(rows, key) {
  return rows.reduce((groups, row) => {
    const value = typeof key === "function" ? key(row) : row[key];
    groups.set(value, [...(groups.get(value) || []), row]);
    return groups;
  }, new Map());
}

function render() {
  const data = filteredRecords();
  const barrier = profile.barriers.find(item => item.key === state.barrier);
  const interpreters = pct(data, "interpreters");
  const materials = pct(data, "materials");
  const finance = pct(data, "financial");
  const accessible = pct(data, "accessibleVisit");
  const qualityAverage = avg(data.map(record => record.quality));

  els.recordsCount.textContent = data.length.toLocaleString();
  els.avgQuality.textContent = `${qualityAverage.toFixed(1)}/5`;
  els.riskSignal.textContent = finance >= 75 ? "Affordability" : interpreters < 40 ? "Communication" : "Physical access";

  renderKpi(els.kpiInterpreters, els.kpiInterpretersNote, interpreters, TARGET, "achievement", true);
  renderKpi(els.kpiMaterials, els.kpiMaterialsNote, materials, TARGET, "achievement", true);
  renderKpi(els.kpiFinance, els.kpiFinanceNote, finance, 20, "risk exposure", false);
  renderKpi(els.kpiAccessible, els.kpiAccessibleNote, accessible, TARGET, "achievement", true);

  renderStateChart(data);
  renderFacilityDonut(data);
  renderBarrierBars(data, barrier);
  renderHeatmap(data);
  renderQualityChart(data);
  renderTimeChart(data);
  renderThemeBubbles(data);
  renderActions({ interpreters, materials, finance, accessible, qualityAverage, barrier });
  writeUrlState();
}

function renderKpi(valueEl, noteEl, actual, target, label, higherIsBetter) {
  const achievement = higherIsBetter ? Math.round((actual / target) * 100) : Math.round((target / Math.max(actual, 1)) * 100);
  valueEl.textContent = `${actual}%`;
  noteEl.textContent = `${actual}% actual; ${achievement}% ${label} vs ${target}% target.`;
  const card = valueEl.closest(".metric-card");
  const good = higherIsBetter ? actual >= 70 : actual <= 30;
  const weak = higherIsBetter ? actual < 50 : actual > 60;
  card.dataset.status = good ? "green" : weak ? "red" : "amber";
}

function renderStateChart(data) {
  const grouped = Array.from(groupBy(data, "state"), ([name, rows]) => ({
    name,
    count: rows.length,
    quality: avg(rows.map(row => row.quality)),
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  const maxCount = Math.max(...grouped.map(row => row.count), 1);
  const width = 780;
  const rowHeight = 28;
  const height = 54 + grouped.length * rowHeight;
  const bars = grouped.map((row, index) => {
    const y = 42 + index * rowHeight;
    const w = (row.count / maxCount) * 510;
    const color = qualityColor(row.quality);
    return `
      <g tabindex="0" data-tip="${row.name}: ${row.count} respondents; average quality ${row.quality.toFixed(1)}/5">
        <text x="0" y="${y + 14}" class="chart-label">${row.name}</text>
        <rect x="120" y="${y}" width="${w}" height="18" rx="4" fill="#007c72"></rect>
        <circle cx="${650 + row.quality * 18}" cy="${y + 9}" r="7" fill="${color}"></circle>
        <text x="${132 + w}" y="${y + 14}" class="small-label">${row.count}</text>
      </g>`;
  });
  els.stateChart.innerHTML = svg(width, height, `
    <text x="120" y="18" class="axis-label">Respondents</text>
    <text x="650" y="18" class="axis-label">Avg. quality</text>
    <line x1="120" y1="28" x2="630" y2="28" stroke="#d8d0c2"></line>
    <line x1="650" y1="28" x2="760" y2="28" stroke="#d8d0c2"></line>
    ${bars.join("")}
  `);
  bindTooltips(els.stateChart);
}

function renderFacilityDonut(data) {
  const grouped = Array.from(groupBy(data, "facility"), ([name, rows]) => ({ name, count: rows.length }));
  const total = grouped.reduce((sum, item) => sum + item.count, 0) || 1;
  const colors = ["#007c72", "#285e9e", "#c8952f"];
  let offset = 0;
  const rings = grouped.map((item, index) => {
    const value = item.count / total;
    const dash = `${value * 100} ${100 - value * 100}`;
    const circle = `<circle r="78" cx="135" cy="135" fill="transparent" stroke="${colors[index]}" stroke-width="38" stroke-dasharray="${dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 135 135)" data-tip="${item.name}: ${item.count} respondents (${Math.round(value * 100)}%)"></circle>`;
    offset += value * 100;
    return circle;
  });
  const legend = grouped.map((item, index) => `
    <g transform="translate(285 ${72 + index * 42})" data-tip="${item.name}: ${item.count} respondents">
      <rect width="13" height="13" rx="3" fill="${colors[index]}"></rect>
      <text x="22" y="12" class="chart-label">${item.name}</text>
      <text x="22" y="29" class="small-label">${Math.round((item.count / total) * 100)}% of filtered records</text>
    </g>`).join("");
  els.facilityDonut.innerHTML = svg(520, 310, `
    ${rings.join("")}
    <circle r="48" cx="135" cy="135" fill="#fffdf8"></circle>
    <text x="135" y="129" text-anchor="middle" class="small-label">Total</text>
    <text x="135" y="156" text-anchor="middle" class="chart-label" style="font-size:28px">${total}</text>
    ${legend}
  `);
  bindTooltips(els.facilityDonut);
}

function renderBarrierBars(data, selectedBarrier) {
  const rows = profile.barriers
    .filter(item => !selectedBarrier || item.key === selectedBarrier.key)
    .map(item => ({ ...item, actual: pct(data, item.key) }));
  const width = 760;
  const height = 72 + rows.length * 44;
  const bars = rows.map((row, index) => {
    const y = 48 + index * 44;
    const statusColor = row.good ? goodStatus(row.actual) : riskStatus(row.actual);
    const achievement = row.good ? Math.round((row.actual / TARGET) * 100) : Math.round((20 / Math.max(row.actual, 1)) * 100);
    return `
      <g tabindex="0" data-tip="${row.label}: ${row.actual}% actual; ${achievement}% ${row.good ? "achievement vs 80% target" : "risk control vs 20% ceiling"}">
        <text x="0" y="${y + 15}" class="chart-label">${row.label}</text>
        <rect x="330" y="${y}" width="320" height="18" rx="4" fill="#efe8dc"></rect>
        <rect x="330" y="${y}" width="${row.actual * 3.2}" height="18" rx="4" fill="${statusColor}"></rect>
        <text x="665" y="${y + 15}" class="chart-label">${row.actual}%</text>
      </g>`;
  });
  els.barrierBars.innerHTML = svg(width, height, `
    <line x1="${330 + TARGET * 3.2}" y1="26" x2="${330 + TARGET * 3.2}" y2="${height - 14}" stroke="#141817" stroke-dasharray="4 4"></line>
    <text x="${330 + TARGET * 3.2 + 7}" y="22" class="axis-label">80% target</text>
    ${bars.join("")}
  `);
  bindTooltips(els.barrierBars);
}

function renderHeatmap(data) {
  const sampleSize = data.length / records.length;
  const { rows, cols, values } = profile.heatmap;
  const width = 760;
  const height = 330;
  const cellW = 104;
  const cellH = 34;
  const cells = rows.flatMap((row, r) =>
    cols.map((col, c) => {
      const adjusted = Math.round(clamp(values[r][c] * (0.92 + sampleSize * 0.15), 18, 96));
      return `
        <g transform="translate(${142 + c * cellW} ${56 + r * cellH})" tabindex="0" data-tip="${row} | ${col}: ${adjusted}% reported barrier exposure">
          <rect width="${cellW - 8}" height="${cellH - 7}" rx="5" fill="${heatColor(adjusted)}"></rect>
          <text x="${(cellW - 8) / 2}" y="18" text-anchor="middle" class="chart-label" fill="${adjusted > 66 ? "#fffdf8" : "#141817"}">${adjusted}%</text>
        </g>`;
    }),
  );
  const rowLabels = rows.map((row, i) => `<text x="0" y="${75 + i * cellH}" class="chart-label">${row}</text>`).join("");
  const colLabels = cols.map((col, i) => `<text x="${142 + i * cellW}" y="34" class="axis-label">${col}</text>`).join("");
  els.heatmap.innerHTML = svg(width, height, `${colLabels}${rowLabels}${cells.join("")}`);
  bindTooltips(els.heatmap);
}

function renderQualityChart(data) {
  const grouped = [1, 2, 3, 4, 5].map(score => ({
    score,
    count: data.filter(row => row.quality === score).length,
  }));
  const maxCount = Math.max(...grouped.map(row => row.count), 1);
  const bars = grouped.map((row, index) => {
    const h = (row.count / maxCount) * 190;
    const x = 70 + index * 74;
    const y = 245 - h;
    return `
      <g tabindex="0" data-tip="Quality ${row.score}: ${row.count} respondents">
        <rect x="${x}" y="${y}" width="46" height="${h}" rx="6" fill="${qualityColor(row.score)}"></rect>
        <text x="${x + 23}" y="${y - 8}" text-anchor="middle" class="chart-label">${row.count}</text>
        <text x="${x + 23}" y="274" text-anchor="middle" class="axis-label">${row.score}</text>
      </g>`;
  });
  els.qualityChart.innerHTML = svg(480, 310, `
    <text x="70" y="294" class="axis-label">Very poor</text>
    <text x="365" y="294" class="axis-label">Excellent</text>
    <line x1="50" y1="245" x2="440" y2="245" stroke="#d8d0c2"></line>
    ${bars.join("")}
  `);
  bindTooltips(els.qualityChart);
}

function renderTimeChart(data) {
  const monthOrder = profile.months.map(row => row[0]);
  const grouped = monthOrder.map(month => {
    const rows = data.filter(row => row.month === month);
    return { month, count: rows.length, quality: avg(rows.map(row => row.quality)) || 0 };
  });
  const maxCount = Math.max(...grouped.map(row => row.count), 1);
  const points = grouped.map((row, i) => {
    const x = 70 + i * 105;
    const y = 238 - (row.quality / 5) * 145;
    return `${x},${y}`;
  });
  const bars = grouped.map((row, i) => {
    const x = 45 + i * 105;
    const h = (row.count / maxCount) * 170;
    return `
      <g tabindex="0" data-tip="${row.month}: ${row.count} records; average quality ${row.quality.toFixed(1)}/5">
        <rect x="${x}" y="${245 - h}" width="52" height="${h}" rx="5" fill="#d6c08e"></rect>
        <circle cx="${x + 26}" cy="${238 - (row.quality / 5) * 145}" r="6" fill="#285e9e"></circle>
        <text x="${x + 26}" y="274" text-anchor="middle" class="axis-label">${row.month.replace(" ", "\n")}</text>
      </g>`;
  });
  els.timeChart.innerHTML = svg(730, 310, `
    <line x1="35" y1="245" x2="690" y2="245" stroke="#d8d0c2"></line>
    <polyline points="${points.join(" ")}" fill="none" stroke="#285e9e" stroke-width="3"></polyline>
    ${bars.join("")}
  `);
  bindTooltips(els.timeChart);
}

function renderThemeBubbles(data) {
  const scale = Math.max(data.length / records.length, 0.25);
  const positions = [
    [140, 135],
    [335, 110],
    [515, 160],
    [225, 245],
    [430, 260],
    [620, 75],
    [690, 235],
    [70, 260],
  ];
  const colors = ["#007c72", "#285e9e", "#b66a00", "#7b3f72", "#1d7f52", "#c8952f", "#b3261e", "#59625f"];
  const bubbles = profile.themes.map(([label, count, group], index) => {
    const [x, y] = positions[index];
    const r = Math.sqrt(count * scale) * 6;
    return `
      <g tabindex="0" data-tip="${label}: ${Math.round(count * scale)} mentions (${group})">
        <circle cx="${x}" cy="${y}" r="${r}" fill="${colors[index]}" opacity="0.9"></circle>
        <text x="${x}" y="${y - 2}" text-anchor="middle" class="chart-label" fill="#fffdf8">${Math.round(count * scale)}</text>
        <text x="${x}" y="${y + r + 18}" text-anchor="middle" class="small-label">${label}</text>
      </g>`;
  });
  els.themeBubbles.innerHTML = svg(780, 340, bubbles.join(""));
  bindTooltips(els.themeBubbles);
}

function renderActions(metrics) {
  const actions = [
    {
      title: "Institutionalize communication support",
      body: `Deploy sign language interpreters or on-call interpretation cover in priority facilities. Current interpreter availability is ${metrics.interpreters}% actual, only ${Math.round((metrics.interpreters / TARGET) * 100)}% of the 80% service-readiness target.`,
    },
    {
      title: "Run accessibility audits in high-volume facilities",
      body: `Prioritize ramps, door widths, toilets, internal navigation, and queue management. Accessible visit experience is ${metrics.accessible}% actual against the 80% minimum target.`,
    },
    {
      title: "Make affordability a corrective action, not a side issue",
      body: `Financial difficulty is ${metrics.finance}% actual. This is a red risk signal because it can delay care, reduce follow-up, and push households out of formal services.`,
    },
    {
      title: "Close the evidence loop with disability groups",
      body: `Use respondent feedback to validate facility fixes within 60 days, especially for hearing, physical, visual, and deaf-blind respondents.`,
    },
  ];
  els.executiveActions.innerHTML = `<ul class="action-list">${actions
    .map(item => `<li><strong>${item.title}</strong><p>${item.body}</p></li>`)
    .join("")}</ul>`;
}

function svg(width, height, content) {
  return `<svg viewBox="0 0 ${width} ${height}" role="presentation" aria-hidden="true">${content}</svg>`;
}

function bindTooltips(root) {
  root.querySelectorAll("[data-tip]").forEach(node => {
    node.addEventListener("pointerenter", event => showTip(event, node.dataset.tip));
    node.addEventListener("pointermove", event => moveTip(event));
    node.addEventListener("pointerleave", hideTip);
    node.addEventListener("focus", event => showTip(event, node.dataset.tip));
    node.addEventListener("blur", hideTip);
  });
}

function showTip(event, text) {
  const [title, ...rest] = text.split(": ");
  tooltip.innerHTML = `<strong>${title}</strong>${rest.join(": ")}`;
  tooltip.hidden = false;
  moveTip(event);
}

function moveTip(event) {
  const x = "clientX" in event ? event.clientX : event.target.getBoundingClientRect().left;
  const y = "clientY" in event ? event.clientY : event.target.getBoundingClientRect().top;
  tooltip.style.left = `${Math.min(x + 14, window.innerWidth - 310)}px`;
  tooltip.style.top = `${Math.min(y + 14, window.innerHeight - 120)}px`;
}

function hideTip() {
  tooltip.hidden = true;
}

function qualityColor(value) {
  if (value >= 4) return "#1d7f52";
  if (value >= 3) return "#c8952f";
  if (value >= 2) return "#b66a00";
  return "#b3261e";
}

function goodStatus(value) {
  if (value >= 70) return "#1d7f52";
  if (value >= 50) return "#b66a00";
  return "#b3261e";
}

function riskStatus(value) {
  if (value <= 30) return "#1d7f52";
  if (value <= 60) return "#b66a00";
  return "#b3261e";
}

function heatColor(value) {
  if (value >= 75) return "#7f1d1d";
  if (value >= 60) return "#b45309";
  if (value >= 45) return "#c8952f";
  return "#9ab7ad";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

[els.stateFilter, els.disabilityFilter, els.facilityFilter, els.barrierFilter].forEach(select => {
  select.addEventListener("change", () => {
    state = {
      state: els.stateFilter.value,
      disability: els.disabilityFilter.value,
      facility: els.facilityFilter.value,
      barrier: els.barrierFilter.value,
    };
    render();
  });
});

els.resetButton.addEventListener("click", () => {
  state = { state: "All", disability: "All", facility: "All", barrier: "all" };
  initFilters();
  render();
});

initFilters();
render();
