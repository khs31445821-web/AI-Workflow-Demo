let token = sessionStorage.getItem('portfolioAdminToken') || '';
const $ = (s) => document.querySelector(s);

function show(selector, message, error = false) {
  const el = $(selector);
  el.textContent = message;
  el.className = `status ${error ? 'error' : 'success'}`;
}

async function api(url, options = {}) {
  const headers = { 'content-type': 'application/json', ...(options.headers || {}) };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || '요청 실패');
  return json;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));
}

function renderOrder(order) {
  const draft = order.draft ? `
    <div class="draft"><b>${escapeHtml(order.draft.title)}</b> · ${escapeHtml(order.draft.selectedGenre)}\n\n${escapeHtml(order.draft.lyrics)}</div>
    <div class="review-actions">
      <button class="button small primary" data-action="approve" data-id="${order.id}">승인</button>
      <button class="button small danger" data-action="change" data-id="${order.id}">수정 요청</button>
      ${order.status === 'APPROVED' ? `<button class="button small" data-action="publish" data-id="${order.id}">공개</button>` : ''}
    </div>` : '';

  const resultLink = order.publicToken ? `<p><a href="/result.html?token=${encodeURIComponent(order.publicToken)}" target="_blank">공개 결과 열기 ↗</a></p>` : '';
  const audit = (order.audit || []).slice(0, 4).map((a) => `<div>${escapeHtml(a.at)} · <b>${escapeHtml(a.actor)}</b> · ${escapeHtml(a.event)}</div>`).join('');
  return `<article class="order-card">
    <div class="order-top"><div><b>${escapeHtml(order.orderNumber)}</b><div class="order-meta">${escapeHtml(order.customerName)} · ${escapeHtml(order.intake?.occasion || '입력 전')}</div></div><span class="status-chip">${escapeHtml(order.status)}</span></div>
    ${draft}${resultLink}
    <div class="audit"><b>Recent audit trail</b>${audit || '<div>로그 없음</div>'}</div>
  </article>`;
}

async function loadOrders() {
  if (!token) return;
  try {
    const json = await api('/api/admin/orders');
    $('#orders').innerHTML = json.orders.map(renderOrder).join('') || '<p class="muted">주문 없음</p>';
  } catch (error) {
    $('#orders').innerHTML = `<p class="status error">${escapeHtml(error.message)}</p>`;
  }
}

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const form = new FormData(event.currentTarget);
    const json = await api('/api/admin/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) });
    token = json.token;
    sessionStorage.setItem('portfolioAdminToken', token);
    show('#loginStatus', '관리자 인증 완료');
    await loadOrders();
  } catch (error) {
    show('#loginStatus', error.message, true);
  }
});

$('#manualForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const form = new FormData(event.currentTarget);
    const json = await api('/api/admin/orders', { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) });
    show('#manualStatus', `${json.order.orderNumber} 생성 완료`);
    event.currentTarget.reset();
    await loadOrders();
  } catch (error) {
    show('#manualStatus', error.message, true);
  }
});

$('#refreshButton').addEventListener('click', loadOrders);
$('#orders').addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  try {
    if (action === 'approve' || action === 'change') {
      const decision = action === 'approve' ? 'APPROVE' : 'REQUEST_CHANGE';
      const note = action === 'approve' ? 'Human reviewer checked the synthetic draft.' : 'Please regenerate after revisiting input.';
      await api(`/api/admin/orders/${id}/review`, { method: 'POST', body: JSON.stringify({ decision, note }) });
    } else if (action === 'publish') {
      await api(`/api/admin/orders/${id}/publish`, { method: 'POST', body: '{}' });
    }
    await loadOrders();
  } catch (error) {
    alert(error.message);
  }
});

if (token) loadOrders();
