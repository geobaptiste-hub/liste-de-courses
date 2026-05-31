// ===== DONNÉES =====
const STORES = [
  { id: 'superu', name: 'Super U',  emoji: '🔴' },
  { id: 'lidl',   name: 'Lidl',    emoji: '🔵' },
  { id: 'action', name: 'Action',  emoji: '🟠' },
  { id: 'autre',  name: 'Autre',   emoji: '🟣' },
];

// Structure des données en localStorage
// items[storeId] = [{ id, name, checked }]
// alarm = { day, time, active }
// collapsed[storeId][tab] = bool

let state = {
  items: {},      // { superu: [{id, name, checked}], ... }
  alarm: { day: '5', time: '16:00', active: false },
  collapsed: {},  // { validation: {superu: false, ...}, liste: {...} }
};

let alarmInterval = null;

// ===== INIT =====
function init() {
  loadState();
  renderAll();
  startAlarmChecker();
}

// ===== PERSISTANCE =====
function saveState() {
  localStorage.setItem('liste-course-v2', JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem('liste-course-v2');
  if (raw) {
    try {
      const saved = JSON.parse(raw);
      state = { ...state, ...saved };
    } catch(e) {}
  }
  // Init stores vides si besoin
  STORES.forEach(s => {
    if (!state.items[s.id]) state.items[s.id] = [];
    if (!state.collapsed.validation) state.collapsed.validation = {};
    if (!state.collapsed.liste) state.collapsed.liste = {};
  });
}

// ===== RENDU GLOBAL =====
function renderAll() {
  renderValidation();
  renderListe();
  renderAlarm();
}

// ===== ONGLET 1 : VALIDATION =====
function renderValidation() {
  const container = document.getElementById('validation-stores');
  container.innerHTML = '';

  STORES.forEach(store => {
    const items = state.items[store.id] || [];
    const isCollapsed = state.collapsed.validation[store.id] ?? false;
    const checkedCount = items.filter(i => i.checked).length;
    const allChecked = items.length > 0 && checkedCount === items.length;

    const block = document.createElement('div');
    block.className = 'store-block' + (isCollapsed ? ' collapsed' : '');
    block.dataset.store = store.id;

    block.innerHTML = `
      <div class="store-header" onclick="toggleCollapse('validation','${store.id}')">
        <div class="store-title">
          <span class="store-emoji">${store.emoji}</span>
          <span>${store.name}</span>
          <span class="store-badge ${items.length === 0 ? 'zero' : ''}">${checkedCount}/${items.length}</span>
        </div>
        <span class="store-chevron">▼</span>
      </div>
      <div class="store-body">
        <div class="item-list" id="val-list-${store.id}">
          ${items.length === 0
            ? `<p class="empty-store">Aucun produit pour ce magasin.</p>`
            : items.map(item => `
              <div class="item-row ${item.checked ? 'checked' : ''}" onclick="toggleItem('${store.id}','${item.id}')" id="val-item-${item.id}">
                <div class="item-check"><span class="item-check-icon">✓</span></div>
                <span class="item-name">${escHtml(item.name)}</span>
              </div>
            `).join('')
          }
        </div>
        <div class="store-footer">
          <button class="btn-validate-store"
            ${!allChecked ? 'disabled' : ''}
            onclick="validateAndClear('${store.id}')">
            🗑️ Valider et effacer ${store.name}
          </button>
        </div>
      </div>
    `;
    container.appendChild(block);
  });
}

function toggleItem(storeId, itemId) {
  const item = state.items[storeId].find(i => i.id === itemId);
  if (item) {
    item.checked = !item.checked;
    saveState();
    renderValidation();
  }
}

function validateAndClear(storeId) {
  const items = state.items[storeId] || [];
  const allChecked = items.length > 0 && items.every(i => i.checked);
  if (!allChecked) return;

  const storeName = STORES.find(s => s.id === storeId)?.name || storeId;
  if (!confirm(`Effacer tous les produits de ${storeName} ?`)) return;

  state.items[storeId] = [];
  saveState();
  renderAll();
  showToast(`✅ ${storeName} vidé !`);
}

// ===== ONGLET 2 : LISTE =====
function renderListe() {
  const container = document.getElementById('liste-stores');
  container.innerHTML = '';

  STORES.forEach(store => {
    const items = state.items[store.id] || [];
    const isCollapsed = state.collapsed.liste[store.id] ?? false;

    const block = document.createElement('div');
    block.className = 'store-block' + (isCollapsed ? ' collapsed' : '');
    block.dataset.store = store.id;

    block.innerHTML = `
      <div class="store-header" onclick="toggleCollapse('liste','${store.id}')">
        <div class="store-title">
          <span class="store-emoji">${store.emoji}</span>
          <span>${store.name}</span>
          <span class="store-badge ${items.length === 0 ? 'zero' : ''}">${items.length}</span>
        </div>
        <span class="store-chevron">▼</span>
      </div>
      <div class="store-body">
        <div class="add-item-row">
          <input
            class="add-item-input"
            type="text"
            id="input-${store.id}"
            placeholder="Ajouter un produit…"
            onkeydown="handleAddKey(event,'${store.id}')"
            autocomplete="off"
          />
          <button class="btn-add" onclick="addItem('${store.id}')">+</button>
        </div>
        <div class="item-list" id="liste-list-${store.id}">
          ${items.length === 0
            ? `<p class="empty-store">Aucun produit pour ce magasin.</p>`
            : items.map(item => `
              <div class="liste-item-row" id="liste-item-${item.id}">
                <span class="liste-item-name">${escHtml(item.name)}</span>
                <button class="btn-remove" onclick="removeItem('${store.id}','${item.id}')">−</button>
              </div>
            `).join('')
          }
        </div>
      </div>
    `;
    container.appendChild(block);
  });
}

function handleAddKey(e, storeId) {
  if (e.key === 'Enter') addItem(storeId);
}

function addItem(storeId) {
  const input = document.getElementById(`input-${storeId}`);
  const name = input.value.trim();
  if (!name) return;

  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name: name,
    checked: false,
  };

  if (!state.items[storeId]) state.items[storeId] = [];
  state.items[storeId].push(newItem);
  input.value = '';
  saveState();
  renderAll();

  // Scroll to the newly added item
  setTimeout(() => {
    const el = document.getElementById(`liste-item-${newItem.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function removeItem(storeId, itemId) {
  state.items[storeId] = (state.items[storeId] || []).filter(i => i.id !== itemId);
  saveState();
  renderAll();
}

// ===== COLLAPSE =====
function toggleCollapse(tab, storeId) {
  if (!state.collapsed[tab]) state.collapsed[tab] = {};
  state.collapsed[tab][storeId] = !state.collapsed[tab][storeId];
  saveState();
  if (tab === 'validation') renderValidation();
  else renderListe();
}

// ===== ONGLET 4 : ALARME =====
function renderAlarm() {
  const a = state.alarm;
  document.getElementById('alarm-day').value = a.day;
  document.getElementById('alarm-time').value = a.time;
  const btn = document.getElementById('alarm-btn');
  const status = document.getElementById('alarm-status');
  if (a.active) {
    btn.textContent = '🔕 Désactiver le rappel';
    btn.classList.add('active');
    const dayNames = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    status.textContent = `⏰ Rappel actif : ${dayNames[parseInt(a.day)]} à ${a.time}`;
  } else {
    btn.textContent = '🔔 Activer le rappel';
    btn.classList.remove('active');
    status.textContent = '';
  }
}

function toggleAlarm() {
  state.alarm.day = document.getElementById('alarm-day').value;
  state.alarm.time = document.getElementById('alarm-time').value;
  state.alarm.active = !state.alarm.active;

  if (state.alarm.active) {
    requestNotifPermission();
  }

  saveState();
  renderAlarm();
}

function requestNotifPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function startAlarmChecker() {
  if (alarmInterval) clearInterval(alarmInterval);
  alarmInterval = setInterval(checkAlarm, 30000);
  checkAlarm();
}

function checkAlarm() {
  const a = state.alarm;
  if (!a.active) return;
  const now = new Date();
  const nowDay = now.getDay().toString();
  const nowTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  if (nowDay === a.day && nowTime === a.time) {
    fireAlarm();
  }
}

function fireAlarm() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🛒 Liste de Course', {
      body: 'N\'oubliez pas vos paniers !',
      icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shopping%20cart/3D/shopping_cart_3d.png'
    });
  }
  showToast('🛒 N\'oubliez pas vos paniers !');
}

// ===== TABS =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
  });
});

// Sauvegarde alarme en temps réel
document.getElementById('alarm-day').addEventListener('change', () => {
  state.alarm.day = document.getElementById('alarm-day').value;
  saveState();
});
document.getElementById('alarm-time').addEventListener('change', () => {
  state.alarm.time = document.getElementById('alarm-time').value;
  saveState();
});

// ===== TOAST =====
let toastTimeout;
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 2800);
}

// ===== UTILS =====
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== GO =====
init();
