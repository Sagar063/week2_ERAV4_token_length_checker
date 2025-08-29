// Elements
const textInput = document.getElementById("textInput");
const btnCount  = document.getElementById("btnCount");
const btnClear  = document.getElementById("btnClear");
const btnCopy   = document.getElementById("btnCopy");
const btnJson   = document.getElementById("btnExportJson");
const btnCsv    = document.getElementById("btnExportCsv");
const liveCount = document.getElementById("liveCount");
const apiCount  = document.getElementById("apiCount");
const stopTgl   = document.getElementById("stopwordsToggle");
const tokenContainer = document.getElementById("tokenContainer");
const themeToggle = document.getElementById("themeToggle");

// Stats fields
const stWords = document.getElementById("stWords");
const stChars = document.getElementById("stChars");
const stSent  = document.getElementById("stSentences");
const stParas = document.getElementById("stParas");
const stUniq  = document.getElementById("stUnique");
const stAvg   = document.getElementById("stAvgLen");
const stRead  = document.getElementById("stRead");
const stLong  = document.getElementById("stLongest");
const stShort = document.getElementById("stShortest");

let freqChart;

// Live count using simple whitespace split
function liveTokenize(s) {
  return s.trim().length ? s.split(/\s+/).filter(t => t.trim() !== "") : [];
}

function updateLiveCount() {
  const n = liveTokenize(textInput.value).length;
  liveCount.textContent = `Live count: ${n}`;
}
textInput.addEventListener("input", updateLiveCount);
updateLiveCount();

btnCount.addEventListener("click", async () => {
  const text = textInput.value || "";
  const remove_stopwords = stopTgl.checked;
  apiCount.textContent = "API count: …";
  tokenContainer.innerHTML = "";

  // /api/count for simple count (assignment baseline)
  const baseRes = await fetch("/api/count", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ text })
  });
  const baseData = await baseRes.json();
  apiCount.textContent = `API count: ${baseData.count}`;

  // Render color-coded tokens (>7 chars)
  baseData.tokens.forEach(tok => {
    const chip = document.createElement("span");
    chip.className = "token" + (tok.length > 7 ? " long" : "");
    chip.textContent = tok;
    tokenContainer.appendChild(chip);
  });

  // /api/stats for extras
  const statsRes = await fetch("/api/stats", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ text, remove_stopwords })
  });
  const s = await statsRes.json();

  stWords.textContent = s.word_count;
  stChars.textContent = s.char_count;
  stSent.textContent  = s.sentence_count;
  stParas.textContent = s.paragraph_count;
  stUniq.textContent  = s.unique_words;
  stAvg.textContent   = s.avg_word_length;
  stRead.textContent  = s.reading_time_minutes + " min";
  stLong.textContent  = s.longest_word || "–";
  stShort.textContent = s.shortest_word || "–";

  // Top 5 bar chart
  const labels = s.top5.map(t => t[0]);
  const values = s.top5.map(t => t[1]);
  const ctx = document.getElementById("freqChart").getContext("2d");
  if (freqChart) freqChart.destroy();
  freqChart = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ label: "Frequency", data: values }] },
    options: { responsive: true, plugins: { legend: { display:false } }, scales: { y: { beginAtZero:true } } }
  });

  // Word Cloud (uses norm_tokens + frequencies)
  const wcData = s.top5.length ? s.top5 : s.norm_tokens.map(w => [w,1]);
  const cloudElem = document.getElementById("cloud");
  WordCloud(cloudElem, {
    list: wcData, // [ [word, weight], ... ]
    gridSize: 12,
    weightFactor: 12,
    rotateRatio: 0,
    backgroundColor: getComputedStyle(document.body).getPropertyValue("--bg").trim() || "#fff"
  });
});

btnClear.addEventListener("click", () => {
  textInput.value = "";
  updateLiveCount();
  apiCount.textContent = "API count: –";
  tokenContainer.innerHTML = "";
  const cloudElem = document.getElementById("cloud");
  cloudElem.innerHTML = "";
  if (freqChart) freqChart.destroy();
});

btnCopy.addEventListener("click", async () => {
  const chips = [...document.querySelectorAll(".token")].map(el => el.textContent);
  const text = chips.join(" ");
  await navigator.clipboard.writeText(text);
  alert("Tokens copied to clipboard!");
});

async function downloadExport(fmt){
  const text = textInput.value || "";
  const remove_stopwords = stopTgl.checked;
  const res = await fetch("/api/export", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ text, remove_stopwords, format: fmt })
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fmt === "csv" ? "stats.csv" : "stats.json";
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}
btnJson.addEventListener("click", ()=>downloadExport("json"));
btnCsv.addEventListener("click", ()=>downloadExport("csv"));

// Theme toggle
(function initTheme(){
  const saved = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("theme-light", saved === "light");
})();
themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("theme-light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
});
