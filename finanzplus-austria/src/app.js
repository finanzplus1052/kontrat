/**
 * Finanzplus Austria — Vertragsportal
 * Logique applicative complète (SPA minimaliste, stockage localStorage)
 */

'use strict';

/* ══════════════════════════════════════════════════════
   CONFIGURATION
══════════════════════════════════════════════════════ */
const CONFIG = {
  ADMIN_PASSWORD : 'FP@Admin2026',
  MAX_ATTEMPTS   : 6,
  STORAGE_KEY    : 'fp_dossiers_v1',
  SESSION_KEY    : 'fp_admin_session',
  ATTEMPTS_KEY   : 'fp_attempts_v1',
};

/* ══════════════════════════════════════════════════════
   DOSSIERS STATIQUES — servis directement depuis le repo
   Le PDF est dans le même dossier que index.html.
   On ne passe PAS par localStorage pour ces dossiers.
══════════════════════════════════════════════════════ */
const STATIC_DOSSIERS = {
  'AT-2026-00147': {
    id       : 'AT-2026-00147',
    client   : 'Frau Anja Ilona Schimitz',
    fileName : 'AT-2026-00147.pdf',
    fileUrl  : 'AT-2026-00147.pdf',
    date     : '2026-07-28T00:00:00.000Z',
  },
};

/* ══════════════════════════════════════════════════════
   COUCHE STOCKAGE (pour les dossiers ajoutés via admin)
   { [DOSSIER_ID]: { id, client, fileName, fileData (base64), date } }
══════════════════════════════════════════════════════ */

function getDossiers() {
  try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveDossiers(data) {
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
}

/** Récupère un dossier : d'abord dans les statiques, puis dans localStorage. */
function getDossier(id) {
  const key = id.trim().toUpperCase();
  return STATIC_DOSSIERS[key] || getDossiers()[key] || null;
}

function putDossier(dossier) {
  const data = getDossiers();
  data[dossier.id.toUpperCase()] = dossier;
  saveDossiers(data);
}

function deleteDossier(id) {
  const data = getDossiers();
  delete data[id.toUpperCase()];
  saveDossiers(data);
}

/* ══════════════════════════════════════════════════════
   GESTION DES TENTATIVES (anti-brute-force)
══════════════════════════════════════════════════════ */
function getAttempts()  {
  try { return JSON.parse(localStorage.getItem(CONFIG.ATTEMPTS_KEY) || '{"count":0}'); }
  catch { return { count: 0 }; }
}
function incAttempts()  {
  const a = getAttempts(); a.count++;
  localStorage.setItem(CONFIG.ATTEMPTS_KEY, JSON.stringify(a));
  return a.count;
}
function resetAttempts() {
  localStorage.setItem(CONFIG.ATTEMPTS_KEY, JSON.stringify({ count: 0 }));
}
function isBlocked() { return getAttempts().count >= CONFIG.MAX_ATTEMPTS; }

/* ══════════════════════════════════════════════════════
   SESSION ADMIN
══════════════════════════════════════════════════════ */
function isAdminLoggedIn()  { return sessionStorage.getItem(CONFIG.SESSION_KEY) === '1'; }
function setAdminSession()  { sessionStorage.setItem(CONFIG.SESSION_KEY, '1'); }
function clearAdminSession(){ sessionStorage.removeItem(CONFIG.SESSION_KEY); }

/* ══════════════════════════════════════════════════════
   UTILITAIRES
══════════════════════════════════════════════════════ */

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showMsg(el, html, type) {
  el.className = `msg show msg-${type}`;
  el.innerHTML = html;
}

function hideMsg(el) { el.className = 'msg'; el.innerHTML = ''; }

/* ══════════════════════════════════════════════════════
   ROUTER
══════════════════════════════════════════════════════ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

/* ══════════════════════════════════════════════════════
   ANIMATION SCEAU
══════════════════════════════════════════════════════ */
function showSeal(callback) {
  const overlay = document.getElementById('seal-overlay');
  const svg     = overlay.querySelector('.seal-svg');
  overlay.classList.add('active');
  svg.style.animation = 'none';
  svg.offsetHeight;
  svg.style.animation = '';
  setTimeout(() => {
    overlay.classList.remove('active');
    if (typeof callback === 'function') callback();
  }, 2300);
}

/* ══════════════════════════════════════════════════════
   PAGE CLIENT — Recherche de dossier
══════════════════════════════════════════════════════ */
const elInput    = document.getElementById('dossierId');
const elBtnSrch  = document.getElementById('btn-search');
const elMsgSrch  = document.getElementById('msg-search');
const elAttInfo  = document.getElementById('attempts-info');
const elResBlock = document.getElementById('result-block');

function updateAttemptsDisplay() {
  const left = CONFIG.MAX_ATTEMPTS - getAttempts().count;
  if (left <= 3 && left > 0) {
    elAttInfo.textContent = `⚠ Noch ${left} Versuch(e)`;
    elAttInfo.className   = 'attempts-info warn';
  } else {
    elAttInfo.textContent = '';
    elAttInfo.className   = 'attempts-info';
  }
}

function checkBlocked() {
  if (isBlocked()) {
    document.getElementById('view-search').style.display  = 'none';
    document.getElementById('view-blocked').style.display = '';
    return true;
  }
  return false;
}

checkBlocked();
updateAttemptsDisplay();

elBtnSrch.addEventListener('click', handleSearch);
elInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });

function handleSearch() {
  if (checkBlocked()) return;

  const val = elInput.value.trim().toUpperCase();
  hideMsg(elMsgSrch);
  elResBlock.style.display = 'none';

  if (!val) {
    showMsg(elMsgSrch, 'Bitte geben Sie eine Aktennummer ein.', 'warn');
    return;
  }
  if (!/^[A-Z0-9\-]{4,20}$/.test(val)) {
    showMsg(elMsgSrch, 'Ungültiges Format. Beispiel: <strong>DV-2024-00031</strong>', 'warn');
    return;
  }

  const dossier = getDossier(val);

  if (!dossier) {
    const nb   = incAttempts();
    const left = CONFIG.MAX_ATTEMPTS - nb;
    updateAttemptsDisplay();
    if (checkBlocked()) return;
    showMsg(elMsgSrch,
      `Keine Akte gefunden für <strong>${val}</strong>. Bitte überprüfen Sie Ihre Eingabe.` +
      (left <= 3 ? `<br/><small>Noch ${left} Versuch(e) vor der Sperrung.</small>` : ''),
      'error',
    );
    return;
  }

  // Succès
  resetAttempts();
  updateAttemptsDisplay();
  elBtnSrch.innerHTML = '<span class="spinner"></span>';
  elBtnSrch.disabled  = true;

  showSeal(() => {
    elBtnSrch.innerHTML = 'Weiter &rarr;';
    elBtnSrch.disabled  = false;

    document.getElementById('res-num').textContent    = dossier.id;
    document.getElementById('res-client').textContent = dossier.client;
    document.getElementById('res-file').textContent   = dossier.fileName;
    document.getElementById('res-date').textContent   = fmtDate(dossier.date);

    elResBlock.style.display = '';
    hideMsg(elMsgSrch);
  });
}

/* ══════════════════════════════════════════════════════
   TÉLÉCHARGEMENT DU PDF
   — dossier statique : lien direct vers le fichier
   — dossier admin    : reconstruction depuis base64
══════════════════════════════════════════════════════ */
document.getElementById('btn-download').addEventListener('click', () => {
  const val = elInput.value.trim().toUpperCase();
  const d   = getDossier(val);
  if (!d) return;

  // Dossier statique : téléchargement direct via <a>
  if (d.fileUrl) {
    const a = document.createElement('a');
    a.href     = d.fileUrl;
    a.download = d.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Dossier admin (base64 localStorage)
  if (!d.fileData) return;
  const bytes = atob(d.fileData);
  const ab    = new ArrayBuffer(bytes.length);
  const ia    = new Uint8Array(ab);
  for (let i = 0; i < bytes.length; i++) ia[i] = bytes.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([ab], { type: 'application/pdf' }));
  Object.assign(document.createElement('a'), { href: url, download: d.fileName }).click();
  URL.revokeObjectURL(url);
});

document.getElementById('btn-another').addEventListener('click', () => {
  elInput.value            = '';
  elResBlock.style.display = 'none';
  hideMsg(elMsgSrch);
  elInput.focus();
});

/* ══════════════════════════════════════════════════════
   LIEN DISCRET → BERATERBEREICH
══════════════════════════════════════════════════════ */
document.getElementById('admin-link').addEventListener('click', () => {
  if (isAdminLoggedIn()) {
    showScreen('screen-admin-dash');
    renderAdminTable();
  } else {
    showScreen('screen-admin-login');
    document.getElementById('admin-pwd').value = '';
    hideMsg(document.getElementById('msg-admin-login'));
  }
});

/* ══════════════════════════════════════════════════════
   AUTHENTIFICATION ADMIN
══════════════════════════════════════════════════════ */
document.getElementById('btn-admin-login').addEventListener('click', doAdminLogin);
document.getElementById('admin-pwd').addEventListener('keydown', e => {
  if (e.key === 'Enter') doAdminLogin();
});

function doAdminLogin() {
  const pwd = document.getElementById('admin-pwd').value;
  const msg = document.getElementById('msg-admin-login');
  if (pwd === CONFIG.ADMIN_PASSWORD) {
    setAdminSession();
    showScreen('screen-admin-dash');
    renderAdminTable();
  } else {
    showMsg(msg, 'Falscher Zugangscode. Bitte versuchen Sie es erneut.', 'error');
  }
}

document.getElementById('btn-back-home').addEventListener('click', () => showScreen('screen-home'));
document.getElementById('btn-logout').addEventListener('click', () => {
  clearAdminSession();
  showScreen('screen-home');
});

/* ══════════════════════════════════════════════════════
   ADMIN — Dépôt d'un dossier
══════════════════════════════════════════════════════ */
document.getElementById('btn-upload').addEventListener('click', handleUpload);

function handleUpload() {
  const idVal  = document.getElementById('a-dossier-id').value.trim().toUpperCase();
  const client = document.getElementById('a-client').value.trim();
  const fi     = document.getElementById('a-file');
  const msgEl  = document.getElementById('msg-upload');
  hideMsg(msgEl);

  if (!idVal || !client || !fi.files.length) {
    showMsg(msgEl, 'Alle Felder sind Pflichtfelder.', 'warn'); return;
  }
  if (!/^[A-Z0-9\-]{4,20}$/.test(idVal)) {
    showMsg(msgEl, 'Ungültiges Nummernformat (z. B.: AT-2026-00147).', 'warn'); return;
  }
  const file = fi.files[0];
  if (file.type !== 'application/pdf') {
    showMsg(msgEl, 'Nur PDF-Dateien werden akzeptiert.', 'warn'); return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showMsg(msgEl, 'Die Datei darf 10 MB nicht überschreiten.', 'warn'); return;
  }

  const btn = document.getElementById('btn-upload');
  btn.innerHTML = '<span class="spinner"></span> Speichern…';
  btn.disabled  = true;

  const reader  = new FileReader();
  reader.onload = e => {
    putDossier({
      id       : idVal,
      client,
      fileName : file.name,
      fileData : e.target.result.split(',')[1],
      date     : new Date().toISOString(),
    });
    document.getElementById('a-dossier-id').value = '';
    document.getElementById('a-client').value     = '';
    fi.value = '';
    btn.innerHTML = 'Akte speichern';
    btn.disabled  = false;
    showMsg(msgEl, `✓ Akte <strong>${idVal}</strong> erfolgreich gespeichert.`, 'success');
    renderAdminTable();
  };
  reader.readAsDataURL(file);
}

/* ══════════════════════════════════════════════════════
   ADMIN — Tableau des dossiers
══════════════════════════════════════════════════════ */
function renderAdminTable() {
  const tbody  = document.getElementById('admin-table-body');
  const empty  = document.getElementById('empty-state');
  const badge  = document.getElementById('badge-count');
  const list   = Object.values(getDossiers())
                        .sort((a, b) => new Date(b.date) - new Date(a.date));

  badge.textContent = list.length;
  tbody.innerHTML   = '';

  if (!list.length) { empty.style.display = ''; return; }
  empty.style.display = 'none';

  list.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-mono">${escHtml(d.id)}</td>
      <td>${escHtml(d.client)}</td>
      <td class="td-file" title="${escHtml(d.fileName)}">${escHtml(d.fileName)}</td>
      <td class="td-date">${fmtDate(d.date)}</td>
      <td>
        <button class="btn btn-danger" data-id="${escHtml(d.id)}">Löschen</button>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', () => handleDelete(btn.dataset.id));
  });
}

function handleDelete(id) {
  deleteDossier(id);
  const msgEl = document.getElementById('msg-delete');
  showMsg(msgEl, `✓ Akte <strong>${escHtml(id)}</strong> erfolgreich gelöscht.`, 'success');
  renderAdminTable();
  setTimeout(() => hideMsg(msgEl), 4000);
}
