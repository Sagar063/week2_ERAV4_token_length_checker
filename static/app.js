const textInput = document.getElementById("textInput");
const btnCount  = document.getElementById("btnCount");
const btnClear  = document.getElementById("btnClear");
const liveCount = document.getElementById("liveCount");
const apiCount  = document.getElementById("apiCount");
const tokensList= document.getElementById("tokensList");

function liveTokenize(s) {
  return s.split(/\s+/).filter(t => t.trim() !== "");
}

function updateLiveCount() {
  const n = liveTokenize(textInput.value).length;
  liveCount.textContent = `Live count: ${n}`;
}
textInput.addEventListener("input", updateLiveCount);
updateLiveCount();

btnCount.addEventListener("click", async () => {
  const text = textInput.value || "";
  apiCount.textContent = "API count: …";
  tokensList.textContent = "[]";
  try {
    const res = await fetch("/api/count", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    apiCount.textContent = `API count: ${data.count}`;
    tokensList.textContent = JSON.stringify(data.tokens, null, 2);
  } catch (e) {
    apiCount.textContent = "API error";
  }
});

btnClear.addEventListener("click", () => {
  textInput.value = "";
  updateLiveCount();
  apiCount.textContent = "API count: –";
  tokensList.textContent = "[]";
});
