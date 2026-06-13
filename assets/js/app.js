// ===============================
// KAMON FS Search Mini - app.js
// 姓検索（sei → kamon）対応 完全版
// ===============================

// --- GitHub Pages 判定 ---
const isGithubPages = location.hostname.includes("github.io");

// --- KAMON データ取得（ローカル JSON 読み込み） ---
async function loadKamonData() {
  const url = 'assets/data/kamon_data.json';  // 姓辞書

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error("KAMON データ取得エラー: HTTP", res.status);
      return [];
    }
    return await res.json();
  } catch (e) {
    console.error("KAMON データ取得エラー:", e);
    return [];
  }
}

// ===============================
// ★ 姓検索ロジック（sei / kamon / desc）
// ===============================
function searchKamon(data, keyword) {
  if (!keyword) return [];

  keyword = keyword.trim();

  return data.filter(item =>
    (item.sei && item.sei.includes(keyword)) ||
    (item.kamon && item.kamon.includes(keyword)) ||
    (item.desc && item.desc.includes(keyword))
  );
}

// --- FamilySearch API（ローカル専用プロキシ） ---
async function searchFS(query) {
  try {
    const res = await fetch(`http://localhost:3000/api/fs?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (e) {
    console.error("FS API error:", e);
    return null;
  }
}

// ===============================
// DOM 操作（GitHub Pages 判定を含む）
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

  // --- GitHub Pages では FS 検索を無効化 ---
  if (isGithubPages) {
    const fsBtn = document.getElementById("fs-search-btn");
    const fsInput = document.getElementById("fs-input");
    const fsNote = document.getElementById("fs-note");

    if (fsBtn) fsBtn.disabled = true;
    if (fsInput) fsInput.disabled = true;

    if (fsNote) {
      fsNote.textContent = "※ FamilySearch 検索はローカル環境専用です";
      fsNote.style.color = "gray";
      fsNote.style.fontSize = "0.9em";
      fsNote.style.marginTop = "4px";
    }
  }

  // --- KAMON データ読み込み ---
  const kamonData = await loadKamonData();

  // --- KAMON（姓）検索ボタン ---
  document.getElementById("kamon-search-btn")?.addEventListener("click", () => {
    const keyword = document.getElementById("kamon-input").value;
    const results = searchKamon(kamonData, keyword);

    const out = document.getElementById("kamon-results");
    out.innerHTML = "";

    if (results.length === 0) {
      out.textContent = "該当する家紋が見つかりませんでした。";
      return;
    }

    results.forEach(item => {
      const div = document.createElement("div");
      div.className = "result-item";
      div.innerHTML = `
        <strong>${item.sei}</strong>（家紋：${item.kamon}）<br>
        <span>${item.desc || ""}</span>
      `;
      out.appendChild(div);
    });
  });

  // --- FS 検索ボタン（ローカル専用） ---
  document.getElementById("fs-search-btn")?.addEventListener("click", async () => {
    if (isGithubPages) return; // GitHub Pages では動作しない

    const keyword = document.getElementById("fs-input").value;
    const out = document.getElementById("fs-results");
    out.innerHTML = "検索中…";

    const data = await searchFS(keyword);

    if (!data) {
      out.textContent = "FamilySearch API への接続に失敗しました（ローカル専用）。";
      return;
    }

    out.textContent = JSON.stringify(data, null, 2);
  });

});
