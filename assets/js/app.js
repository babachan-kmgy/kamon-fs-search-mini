// ===============================
// KAMON FS Search Mini - app.js
// ローカル辞書 + FamilySearch プロキシ連携 完全版
// ===============================

// --- KAMON データ取得（ローカル JSON 読み込み） ---
async function loadKamonData() {
  const url = 'assets/data/kamon_data.json';  // ローカル辞書

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("HTTP Error: " + res.status);
    }
    return await res.json();
  } catch (e) {
    console.error("KAMON データ取得エラー:", e);
    return [];
  }
}

// --- KAMON 検索処理 ---
async function searchKamon(keyword) {
  const data = await loadKamonData();
  const lower = keyword.toLowerCase();

  return data.filter(item => {
    const text = [
      item.sei || "",
      item.kamon || "",
      item.notes || ""
    ].join(" ").toLowerCase();

    return text.includes(lower);
  });
}

// --- KAMON 結果表示 ---
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

// ===============================
// FamilySearch API（ローカルプロキシ経由）
// ===============================
async function searchFS(keyword) {
  const url = `http://localhost:3000/api/fs?q=${encodeURIComponent(keyword)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    return await res.json();
  } catch (e) {
    console.error("FS API error:", e);
    return null;
  }
}

// --- FamilySearch 結果表示 ---
function renderFSResults(data) {
  const container = document.getElementById("fsResults");
  container.innerHTML = "";

  if (!data || !data.results || data.results.length === 0) {
    container.innerHTML = "<p>該当なし</p>";
    return;
  }

  data.results.forEach(item => {
    const div = document.createElement("div");
    div.className = "result-item";

    div.innerHTML = `
      <h3>${item.display?.name || "不明"}</h3>
      <p>生年: ${item.display?.birthDate || "不明"}</p>
      <p>没年: ${item.display?.deathDate || "不明"}</p>
    `;

    container.appendChild(div);
  });
}

// ===============================
// 検索イベント（KAMON + FS）
// ===============================
document.getElementById("searchBtn").addEventListener("click", async () => {
  const keyword = document.getElementById("keyword").value.trim();
  if (keyword === "") {
    alert("検索ワードを入力してください");
    return;
  }

  // KAMON
  const results = await searchKamon(keyword);
  renderKamonResults(results);

  // FamilySearch（ローカルプロキシ）
  const fsData = await searchFS(keyword);
  renderFSResults(fsData);
});

// --- Enter キーで検索 ---
document.getElementById("keyword").addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    const keyword = document.getElementById("keyword").value.trim();
    if (keyword === "") return;

    const results = await searchKamon(keyword);
    renderKamonResults(results);

    const fsData = await searchFS(keyword);
    renderFSResults(fsData);
  }
});
