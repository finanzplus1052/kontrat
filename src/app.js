/**
 * Finanzplus Austria — Portail Contrats
 * Logique applicative complète (SPA minimaliste, stockage localStorage)
 */

'use strict';

/* ══════════════════════════════════════════════════════
   CONFIGURATION
══════════════════════════════════════════════════════ */
const CONFIG = {
  ADMIN_PASSWORD : 'FP@Admin2026',   // ← Changer avant déploiement
  MAX_ATTEMPTS   : 6,
  STORAGE_KEY    : 'fp_dossiers_v1',
  SESSION_KEY    : 'fp_admin_session',
  ATTEMPTS_KEY   : 'fp_attempts_v1',
};

/* ══════════════════════════════════════════════════════
   DOSSIERS PRÉ-CHARGÉS (disponibles sans localStorage)
══════════════════════════════════════════════════════ */
const PRELOADED_DOSSIERS = {
  'AT-2026-00147': {
    id: 'AT-2026-00147',
    client: 'Kleinert Kerstin',
    fileName: 'AT-2026-00147.pdf',
    fileUrl: 'public/AT-2026-00147.pdf',
    date: new Date().toISOString(),
    isPreloaded: true
  }
};

/* ══════════════════════════════════════════════════════
   COUCHE STOCKAGE
   Structure localStorage :
   { [DOSSIER_ID]: { id, client, fileName, fileData (base64), date } }
══════════════════════════════════════════════════════ */

/** Retourne tous les dossiers. */
function getDossiers() {
  try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

/** Persiste l'objet complet des dossiers. */
function saveDossiers(data) {
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
}

/** Récupère un dossier par son ID (insensible à la casse). */
function getDossier(id) {
  const normalizedId = id.trim().toUpperCase();
  // Cherche d'abord dans les dossiers pré-chargés
  if (PRELOADED_DOSSIERS[normalizedId]) {
    return PRELOADED_DOSSIERS[normalizedId];
  }
  // Sinon cherche dans localStorage
  return getDossiers()[normalizedId] || null;
}

/** Ajoute ou écrase un dossier. */
function putDossier(dossier) {
  const data = getDossiers();
  data[dossier.id.toUpperCase()] = dossier;
  saveDossiers(data);
}

/** Supprime un dossier. */
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
   SESSION ADMIN (sessionStorage — expire à fermeture)
══════════════════════════════════════════════════════ */
function isAdminLoggedIn()  { return sessionStorage.getItem(CONFIG.SESSION_KEY) === '1'; }
function setAdminSession()  { sessionStorage.setItem(CONFIG.SESSION_KEY, '1'); }
function clearAdminSession(){ sessionStorage.removeItem(CONFIG.SESSION_KEY); }

/* ══════════════════════════════════════════════════════
   UTILITAIRES
══════════════════════════════════════════════════════ */

/** Formate une date ISO en allemand lisible. */
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

/** Échappe les caractères HTML pour éviter les injections. */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Affiche un message dans un élément dédié. */
function showMsg(el, html, type) {
  el.className = `msg show msg-${type}`;
  el.innerHTML = html;
}

/** Cache un message. */
function hideMsg(el) { el.className = 'msg'; el.innerHTML = ''; }

/* ══════════════════════════════════════════════════════
   ROUTER — affichage des écrans
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
  // Relance l'animation CSS à chaque appel
  svg.style.animation = 'none';
  svg.offsetHeight; // force reflow
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

/** Met à jour l'affichage du compteur de tentatives restantes. */
function updateAttemptsDisplay() {
  const left = CONFIG.MAX_ATTEMPTS - getAttempts().count;
  if (left <= 3 && left > 0) {
    elAttInfo.textContent = `⚠ ${left} tentative(s) restante(s)`;
    elAttInfo.className   = 'attempts-info warn';
  } else {
    elAttInfo.textContent = '';
    elAttInfo.className   = 'attempts-info';
  }
}

/** Vérifie le blocage et bascule la vue si nécessaire. */
function checkBlocked() {
  if (isBlocked()) {
    document.getElementById('view-search').style.display  = 'none';
    document.getElementById('view-blocked').style.display = '';
    return true;
  }
  return false;
}

// Initialisation au chargement de la page
checkBlocked();
updateAttemptsDisplay();

elBtnSrch.addEventListener('click', handleSearch);
elInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });

function handleSearch() {
  if (checkBlocked()) return;

  const val = elInput.value.trim().toUpperCase();
  hideMsg(elMsgSrch);
  elResBlock.style.display = 'none';

  // Validations
  if (!val) {
    showMsg(elMsgSrch, 'Bitte geben Sie eine Aktennummer ein.', 'warn');
    return;
  }
  if (!/^[A-Z0-9\-]{4,20}$/.test(val)) {
    showMsg(elMsgSrch, 'Ungültiges Format. Beispiel: <strong>FP-2026-4H8K</strong>', 'warn');
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
      (left <= 3 ? `<br/><small>${left} Versuch(e) verbleibend vor Sperrung.</small>` : ''),
      'error',
    );
    return;
  }

  // Succès — animation sceau puis affichage des infos
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

    elResBlock.style.display = 'block';
    hideMsg(elMsgSrch);
  });
}

/** Téléchargement du PDF depuis le base64 stocké ou depuis un fichier. */
document.getElementById('btn-download').addEventListener('click', () => {
  const d = getDossier(elInput.value.trim().toUpperCase());
  if (!d) return;

  // Si c'est un dossier pré-chargé avec une URL de fichier
  if (d.isPreloaded && d.fileUrl) {
    const a = document.createElement('a');
    a.href = d.fileUrl;
    a.download = d.fileName;
    a.click();
    return;
  }

  // Sinon, téléchargement depuis base64 (localStorage)
  if (!d.fileData) return;
  const bytes = atob(d.fileData);
  const ab    = new ArrayBuffer(bytes.length);
  const ia    = new Uint8Array(ab);
  for (let i = 0; i < bytes.length; i++) ia[i] = bytes.charCodeAt(i);

  const url = URL.createObjectURL(new Blob([ab], { type: 'application/pdf' }));
  Object.assign(document.createElement('a'), { href: url, download: d.fileName }).click();
  URL.revokeObjectURL(url);
});

/** Réinitialise la vue pour consulter un autre dossier. */
document.getElementById('btn-another').addEventListener('click', () => {
  elInput.value            = '';
  elResBlock.style.display = 'none';
  hideMsg(elMsgSrch);
  elInput.focus();
});

/* ══════════════════════════════════════════════════════
   LIEN DISCRET → ESPACE CONSEILLER
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

  // Validations
  if (!idVal || !client || !fi.files.length) {
    showMsg(msgEl, 'Alle Felder sind erforderlich.', 'warn'); return;
  }
  if (!/^[A-Z0-9\-]{4,20}$/.test(idVal)) {
    showMsg(msgEl, 'Ungültiges Nummernformat (z.B.: FP-2026-4H8K).', 'warn'); return;
  }
  const file = fi.files[0];
  if (file.type !== 'application/pdf') {
    showMsg(msgEl, 'Nur PDF-Dateien werden akzeptiert.', 'warn'); return;
  }
  // Limite de taille supprimée - accepte n'importe quelle taille de fichier

  const btn = document.getElementById('btn-upload');
  btn.innerHTML = '<span class="spinner"></span> Speichern…';
  btn.disabled  = true;

  const reader  = new FileReader();
  reader.onload = e => {
    putDossier({
      id       : idVal,
      client,
      fileName : file.name,
      fileData : e.target.result.split(',')[1], // base64 pur (sans l'entête data:…)
      date     : new Date().toISOString(),
    });
    // Réinitialiser le formulaire
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
   ADMIN — Rendu du tableau des dossiers
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

  // Délégation des suppressions
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

/* ══════════════════════════════════════════════════════
   EXPORT / IMPORT DES DONNÉES
══════════════════════════════════════════════════════ */

/** Exporte toutes les données en fichier JSON */
document.getElementById('btn-export').addEventListener('click', () => {
  const data = getDossiers();
  const count = Object.keys(data).length;
  
  if (count === 0) {
    const msgEl = document.getElementById('msg-delete');
    showMsg(msgEl, 'Keine Akten zum Exportieren vorhanden.', 'warn');
    setTimeout(() => hideMsg(msgEl), 3000);
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];
  const filename = `finanzplus-akten-${date}.json`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  const msgEl = document.getElementById('msg-delete');
  showMsg(msgEl, `✓ ${count} Akte(n) erfolgreich exportiert: <strong>${filename}</strong>`, 'success');
  setTimeout(() => hideMsg(msgEl), 4000);
});

/** Déclenche la sélection de fichier pour l'import */
document.getElementById('btn-import').addEventListener('click', () => {
  document.getElementById('import-file').click();
});

/** Importe les données depuis un fichier JSON */
document.getElementById('import-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const msgEl = document.getElementById('msg-import');
  hideMsg(msgEl);

  if (!file.name.endsWith('.json')) {
    showMsg(msgEl, 'Bitte wählen Sie eine gültige JSON-Datei.', 'warn');
    e.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      
      // Validation basique
      if (typeof importedData !== 'object' || importedData === null) {
        throw new Error('Format invalide');
      }

      // Fusionner avec les données existantes
      const currentData = getDossiers();
      let newCount = 0;
      let updatedCount = 0;

      Object.keys(importedData).forEach(key => {
        if (currentData[key]) {
          updatedCount++;
        } else {
          newCount++;
        }
        currentData[key] = importedData[key];
      });

      saveDossiers(currentData);
      renderAdminTable();

      const totalImported = newCount + updatedCount;
      showMsg(msgEl,
        `✓ Import erfolgreich: <strong>${totalImported} Akte(n)</strong> ` +
        `(${newCount} neu, ${updatedCount} aktualisiert)`,
        'success'
      );
      setTimeout(() => hideMsg(msgEl), 5000);

    } catch (err) {
      showMsg(msgEl, 'Fehler beim Importieren der Datei. Bitte überprüfen Sie das Format.', 'error');
    }
    e.target.value = '';
  };

  reader.onerror = () => {
    showMsg(msgEl, 'Fehler beim Lesen der Datei.', 'error');
    e.target.value = '';
  };

  reader.readAsText(file);
});
