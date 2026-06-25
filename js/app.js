/* ════════════════════════════════════════════════════════════
   APP.JS — Fonctions communes à toutes les pages NexaDesk
   ════════════════════════════════════════════════════════════

   Ce fichier regroupe le JavaScript qui se répétait sur chaque
   page (sidebar mobile, toast, toggle switch). Au lieu de copier
   ce code dans chaque .html, on l'écrit une seule fois ici et on
   l'importe avec :

       <script src="js/app.js"></script>

   À mettre dans le <head> ou en fin de <body>, AVANT le script
   spécifique de chaque page (chat.js, ou le code inline de la
   page) si ce dernier appelle une de ces fonctions.
   ──────────────────────────────────────────────────────────── */


/* ────────────────────────────────────────────────────────────
   1. SIDEBAR MOBILE (menu burger)
   ────────────────────────────────────────────────────────────
   Utilisé sur toutes les pages via :
     <button onclick="openSidebar()">  → bouton burger dans la topbar
     <div id="overlay" onclick="closeSidebar()"> → fond sombre cliquable
     <aside id="sidebar"> → doit avoir la classe .open quand ouverte
   ──────────────────────────────────────────────────────────── */

function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.remove('hidden');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.add('hidden');
}

/* Fermer automatiquement la sidebar si on repasse en taille desktop
   (évite que le menu reste "ouvert" en arrière-plan après un redimensionnement) */
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) {
    closeSidebar();
  }
});

/* Variante "toggleSidebar" : utilisée par les pages qui ont un seul
   bouton burger faisant à la fois ouvrir/fermer (index, commandes,
   conversations), avec une div #mobile-overlay au lieu de #overlay. */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay') || document.getElementById('overlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('hidden');
}


/* ────────────────────────────────────────────────────────────
   2. TOAST DE NOTIFICATION
   ────────────────────────────────────────────────────────────
   Affiche un petit message en bas à droite pendant 3 secondes.
   Nécessite dans le HTML de la page :

     <div id="toast" class="hidden fixed bottom-6 right-6 z-50 ...">
       <span id="toastText">Action effectuée</span>
     </div>

   Utilisation : showToast("Mon message de confirmation");
   ──────────────────────────────────────────────────────────── */

let toastTimer;

function showToast(message) {
  const toast = document.getElementById('toast');
  const text  = document.getElementById('toastText') || document.getElementById('toast-text');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}


/* ────────────────────────────────────────────────────────────
   3. TOGGLE SWITCH (interrupteur on/off réutilisable)
   ────────────────────────────────────────────────────────────
   Utilisé dans Notifications et Paramètres IA.
   Structure HTML attendue :

     <button class="toggle-btn w-11 h-6 rounded-full bg-indigo-500 relative"
             data-on="true" onclick="toggleSwitch(this)">
       <span class="block w-4 h-4 bg-white rounded-full absolute top-1 right-1"></span>
     </button>

   Le bouton bascule entre :
     - ON  : fond bg-indigo-500, rond positionné à right-1
     - OFF : fond bg-slate-200, rond positionné à left-1
   ──────────────────────────────────────────────────────────── */

function toggleSwitch(btn) {
  const isOn = btn.dataset.on === 'true';
  btn.dataset.on = !isOn;
  const dot = btn.querySelector('span');

  if (!isOn) {
    // Passe à ON
    btn.classList.remove('bg-slate-200');
    btn.classList.add('bg-indigo-500');
    dot.classList.remove('left-1');
    dot.classList.add('right-1');
  } else {
    // Passe à OFF
    btn.classList.remove('bg-indigo-500');
    btn.classList.add('bg-slate-200');
    dot.classList.remove('right-1');
    dot.classList.add('left-1');
  }

  return !isOn; // retourne le nouvel état, utile si on veut réagir au changement
}


/* ────────────────────────────────────────────────────────────
   4. FORMATAGE DE DATE (utilisé dans Réservations, Commandes…)
   ──────────────────────────────────────────────────────────── */

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function nowTime() {
  const d = new Date();
  return d.getHours().toString().padStart(2, '0') + ':' +
         d.getMinutes().toString().padStart(2, '0');
}


/* ────────────────────────────────────────────────────────────
   5. INITIALISATION COMMUNE
   ────────────────────────────────────────────────────────────
   Marque automatiquement le lien de la sidebar correspondant à
   la page actuelle avec la classe "active", en comparant l'URL.
   Ça évite d'avoir à coder en dur "active" sur chaque page :
   une seule source de vérité (le nom du fichier).
   ──────────────────────────────────────────────────────────── */

function highlightActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', highlightActiveNavLink);