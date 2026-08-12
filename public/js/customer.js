let token = sessionStorage.getItem('portfolioCustomerToken') || '';
const $ = (s) => document.querySelector(s);

function status(selector, message, error = false) {
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

$('#verifyForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const form = new FormData(event.currentTarget);
    const json = await api('/api/customer/verify', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form))
    });
    token = json.token;
    sessionStorage.setItem('portfolioCustomerToken', token);
    $('#intakeSection').classList.remove('hidden');
    status('#verifyStatus', `확인 완료 · 상태 ${json.order.status}`);
  } catch (error) {
    status('#verifyStatus', error.message, true);
  }
});

$('#intakeForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const form = new FormData(event.currentTarget);
    const json = await api('/api/customer/intake', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form))
    });
    $('#generateSection').classList.remove('hidden');
    status('#intakeStatus', `입력 저장 완료 · 상태 ${json.order.status}`);
  } catch (error) {
    status('#intakeStatus', error.message, true);
  }
});

$('#generateButton').addEventListener('click', async () => {
  try {
    const json = await api('/api/customer/generate', { method: 'POST', body: '{}' });
    status('#generateStatus', `${json.message} 관리자 페이지에서 검토하세요.`);
  } catch (error) {
    status('#generateStatus', error.message, true);
  }
});
