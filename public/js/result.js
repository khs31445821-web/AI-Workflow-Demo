const root = document.querySelector('#result');
const token = new URLSearchParams(location.search).get('token');

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));
}

async function load() {
  if (!token) {
    root.innerHTML = '<p class="status error">공개 토큰이 없습니다.</p>';
    return;
  }
  const res = await fetch(`/api/result/${encodeURIComponent(token)}`);
  const json = await res.json();
  if (!res.ok) {
    root.innerHTML = `<p class="status error">${esc(json.error)}</p>`;
    return;
  }
  const r = json.result;
  root.innerHTML = `
    <span class="eyebrow">PUBLISHED AFTER HUMAN APPROVAL</span>
    <h1 class="result-title">${esc(r.draft.title)}</h1>
    <p class="muted">${esc(r.occasion)} · ${esc(r.draft.selectedGenre)}</p>
    <h2>Lyrics</h2><div class="result-pre">${esc(r.draft.lyrics)}</div>
    <h2>Letter</h2><div class="result-pre">${esc(r.draft.letter)}</div>
    <h2>Production brief</h2><div class="result-pre">${esc(r.draft.productionBrief)}</div>
    <p class="muted">Synthetic portfolio output. No production customer data or proprietary prompt is used.</p>`;
}
load();
