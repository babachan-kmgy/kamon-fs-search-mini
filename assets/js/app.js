// ===============================
// KAMON FS Search Mini - app.js
// データ参照型（kamon-data-v3）完全版
// ===============================

// --- データ取得（オンライン辞書参照） ---
async function loadKamonData() {
  const url = 'https://babachan-kmgy.github.io/kamon-data-v3/data/kamon.json';

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("HTTP Error: " + res.status);
    }
    return await res.json();
  } catch (e) {
    console.error("データ取得エラー:", e);
    return [];
  }
}

// --- 検索処理 ---
async function searchKamon(keyword) {
  const data = await loadKamonData();
  const lower = keyword.toLowerCase();

  return data.filter(item => {
    const text = (
      (item.sei || "") +
      (item.kamon || "") +
      (item.notes || "")
    ).toLowerCase();
    return text.includes(lower);
  });
}

// --- DOM 操作：KAMON の結果表示 ---
function renderKamonResults(results) {
  const container = document.getElementById("kamonResults");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "<p>該当なし</p>";
    return;
  }

  results.forEach(item => {
    const div = document.createElement("div");
    div.className = "result-item";

    div.innerHTML = `
      <h3>${item.sei || "（不明）"}</h3>
      <p><strong>家紋:</strong> ${item.kamon || "（不明）"}</p>
      <p><strong>備考:</strong> ${item.notes || ""}</p>
    `;

    container.appendChild(div);
  });
}

// --- イベント：検索ボタン ---
document.getElementById("searchBtn").addEventListener("click", async () => {
  const keyword = document.getElementById("keyword").value.trim();
  if (keyword === "") {
    alert("検索ワードを入力してください");
    return;
  }

  const results = await searchKamon(keyword);
  renderKamonResults(results);
});

// --- Enter キーで検索 ---
document.getElementById("keyword").addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    const keyword = document.getElementById("keyword").value.trim();
    if (keyword === "") return;

    const results = await searchKamon(keyword);
    renderKamonResults(results);
  }
});
