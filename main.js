

/* ══════════════════════════════════════════════════════════════════
   MAIN.JS — VERSION OPTIMISÉE
   
   Refactorisation Niveau 1 :
   - Helpers factorisés (show/hide/SVG/timers)
   - Moins de duplication
   - Code plus maintenable
   
   Changements principaux :
   - Section HELPERS ajoutée (ligne ~40)
   - Timers centralisés (pageTimers au lieu de 3 variables)
   - Fonctions hide* simplifiées
   - Création SVG factorisée
   ══════════════════════════════════════════════════════════════════ */



/* ══════════════════════════════════════
   ÉTAT GLOBAL
══════════════════════════════════════ */

/* ── Taille minimale — lit CONFIG.MIN_SIZE et l'applique sur <html>
   Le CSS (overflow:auto sur html) assure l'apparition des scrollbars. */
(function() {
  const ms = CONFIG.MIN_SIZE;
  if (ms) {
    /* Applique les tailles minimales sur #app (le conteneur scrollable)
       et sur html/body pour que le scroll apparaisse correctement.     */
    const app = document.getElementById('app');
    if (app) {
      app.style.minWidth  = ms.width  + 'px';
      app.style.minHeight = ms.height + 'px';
    }
    document.documentElement.style.minWidth  = ms.width  + 'px';
    document.documentElement.style.minHeight = ms.height + 'px';
  }
})();

/* ── Dimensions viewport clampées au minimum ────────────────────────────
   vW() et vH() remplacent vW()/Height dans tous les calculs.
   Sous MIN_SIZE, le contenu reste à taille fixe et les scrollbars défilent. */
function vW() { return Math.max(CONFIG.MIN_SIZE.width,  window.innerWidth);  }
function vH() { return Math.max(CONFIG.MIN_SIZE.height, window.innerHeight); }

/* ── Taille de police proportionnelle depuis CONFIG.FONTS ───────────────
   Prend le nom d'une clé FONTS, retourne la taille en px clampée.
   Utilise vW() pour la proportionnalité cross-browser (pas de vw CSS). */
function fontPx(key) {
  const f = CONFIG.FONTS?.[key];
  if (!f) return 12;
  const raw = vW() * f.size_vw / 100;
  return Math.round(Math.max(f.size_min, Math.min(f.size_max, raw)));
}

const canvas   = document.getElementById('overlay-canvas');

/* ══════════════════════════════════════════════════════════════════
   HELPERS — Fonctions utilitaires factorisées
   
   Cette section regroupe les fonctions communes pour éviter
   la duplication de code dans show/hide/build
   ══════════════════════════════════════════════════════════════════ */

/* ── GESTION UI GÉNÉRIQUE ────────────────────────────────────────── */

/**
 * Affiche un élément UI avec transition opacity
 * @param {string|HTMLElement} el - ID ou élément DOM
 * @param {number} duration - Durée transition (ms)
 */
function showUI(el, duration = 1000) {
  const element = typeof el === 'string' ? document.getElementById(el) : el;
  if (!element) return;
  
  element.style.transition = `opacity ${duration}ms ease`;
  element.style.opacity = '1';
  element.classList.add('visible');
}

/**
 * Cache un élément UI avec transition opacity
 * @param {string|HTMLElement} el - ID ou élément DOM
 * @param {number} duration - Durée transition (ms)
 * @param {function} onComplete - Callback après transition
 */
function hideUI(el, duration = 400, onComplete = null) {
  const element = typeof el === 'string' ? document.getElementById(el) : el;
  if (!element) return;
  
  element.style.transition = `opacity ${duration}ms ease`;
  element.style.opacity = '0';
  element.classList.remove('visible');
  
  if (onComplete) {
    setTimeout(onComplete, duration + 20);
  }
}

/**
 * Nettoie le contenu d'un élément après un délai
 * @param {string|HTMLElement} el - ID ou élément DOM
 * @param {number} delay - Délai avant nettoyage (ms)
 */
function clearUIContent(el, delay = 0) {
  const element = typeof el === 'string' ? document.getElementById(el) : el;
  if (!element) return;
  
  if (delay > 0) {
    setTimeout(() => { element.innerHTML = ''; }, delay);
  } else {
    element.innerHTML = '';
  }
}


/* ── GESTION TIMERS PAR PAGE ─────────────────────────────────────── */

/**
 * Stockage centralisé des timers par page
 */
const pageTimers = {
  page1: [],
  page2: [],
  page3: [],
  global: [],
};

/**
 * Ajoute un timer à une page
 * @param {string} page - 'page1', 'page2', 'page3', 'global'
 * @param {number} timerId - ID retourné par setTimeout
 */
function addTimer(page, timerId) {
  if (pageTimers[page]) {
    pageTimers[page].push(timerId);
  }
}

/**
 * Nettoie tous les timers d'une page
 * @param {string} page - 'page1', 'page2', 'page3', 'global'
 */
function clearTimers(page) {
  if (pageTimers[page]) {
    pageTimers[page].forEach(clearTimeout);
    pageTimers[page] = [];
  }
}

/**
 * Nettoie tous les timers de toutes les pages
 */
function clearAllTimers() {
  Object.keys(pageTimers).forEach(clearTimers);
}


/* ── CRÉATION SVG ────────────────────────────────────────────────── */

/**
 * Crée un élément SVG
 * @param {number} width - Largeur
 * @param {number} height - Hauteur
 * @param {string} viewBox - ViewBox (optionnel)
 * @returns {SVGElement}
 */
function createSVG(width, height, viewBox = null) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  if (viewBox) svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('overflow', 'visible');
  return svg;
}

/**
 * Crée un élément SVG (circle, rect, path, etc.)
 * @param {string} type - Type d'élément ('circle', 'rect', 'path', 'line', 'g', 'text')
 * @param {object} attrs - Attributs à appliquer
 * @returns {SVGElement}
 */
function createSVGElement(type, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', type);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
  return el;
}

/**
 * Crée un cercle SVG
 * @param {number} cx - Centre X
 * @param {number} cy - Centre Y
 * @param {number} r - Rayon
 * @param {object} style - Propriétés de style
 * @returns {SVGCircleElement}
 */
function createCircle(cx, cy, r, style = {}) {
  return createSVGElement('circle', {
    cx, cy, r,
    fill: style.fill || 'none',
    stroke: style.stroke || 'rgba(255,255,255,0.75)',
    'stroke-width': style.strokeWidth || '1.2',
    ...style
  });
}

/**
 * Crée un rectangle SVG
 * @param {number} x - Position X
 * @param {number} y - Position Y
 * @param {number} width - Largeur
 * @param {number} height - Hauteur
 * @param {object} style - Propriétés de style
 * @returns {SVGRectElement}
 */
function createRect(x, y, width, height, style = {}) {
  return createSVGElement('rect', {
    x, y, width, height,
    fill: style.fill || 'none',
    stroke: style.stroke || 'rgba(255,255,255,0.75)',
    'stroke-width': style.strokeWidth || '0.8',
    ...style
  });
}

/**
 * Crée un path SVG
 * @param {string} d - Commandes path
 * @param {object} style - Propriétés de style
 * @returns {SVGPathElement}
 */
function createPath(d, style = {}) {
  return createSVGElement('path', {
    d,
    fill: style.fill || 'none',
    stroke: style.stroke || 'rgba(255,255,255,0.80)',
    'stroke-width': style.strokeWidth || '1.4',
    'stroke-linecap': style.linecap || 'round',
    'stroke-linejoin': style.linejoin || 'round',
    ...style
  });
}

/**
 * Crée un texte SVG
 * @param {string} text - Contenu texte
 * @param {number} x - Position X
 * @param {number} y - Position Y
 * @param {object} style - Propriétés de style
 * @returns {SVGTextElement}
 */
function createText(text, x, y, style = {}) {
  const textEl = createSVGElement('text', {
    x, y,
    fill: style.fill || 'rgba(255,255,255,0.82)',
    'font-family': style.fontFamily || 'Cinzel, serif',
    'font-size': style.fontSize || '12',
    'font-weight': style.fontWeight || '400',
    'letter-spacing': style.letterSpacing || '0.18em',
    'text-transform': style.textTransform || 'uppercase',
    'dominant-baseline': style.baseline || 'middle',
    'text-anchor': style.anchor || 'middle',
    ...style
  });
  textEl.textContent = text;
  return textEl;
}


/* ── ANIMATIONS COMMUNES ─────────────────────────────────────────── */

/**
 * Anime le dessin d'un élément SVG avec stroke-dasharray
 * @param {SVGElement} element - Élément à animer
 * @param {number} duration - Durée animation (ms)
 * @param {number} delay - Délai avant animation (ms)
 * @param {string} easing - Courbe d'animation CSS
 */
function animateDraw(element, duration = 1400, delay = 0, easing = 'cubic-bezier(0.4,0,0.2,1)') {
  const length = element.getTotalLength ? element.getTotalLength() : 
                 (element.getAttribute('stroke-dasharray') || '200');
  
  element.setAttribute('stroke-dasharray', length);
  element.setAttribute('stroke-dashoffset', length);
  element.style.transition = `stroke-dashoffset ${duration}ms ${easing} ${delay}ms, stroke 0.3s, filter 0.3s`;
  
  requestAnimationFrame(() => requestAnimationFrame(() => {
    element.setAttribute('stroke-dashoffset', '0');
  }));
}

/**
 * Applique l'effet hover doré aux éléments SVG
 * @param {SVGElement[]} strokeElements - Éléments avec stroke
 * @param {SVGElement[]} fillElements - Éléments avec fill
 */
function applyGoldenHover(strokeElements = [], fillElements = []) {
  const hoverColor = 'rgba(255,220,120,1)';
  strokeElements.forEach(el => {
    if (el) el.setAttribute('stroke', hoverColor);
  });
  fillElements.forEach(el => {
    if (el) el.setAttribute('fill', hoverColor);
  });
}

/**
 * Retire l'effet hover doré
 * @param {SVGElement[]} strokeElements - Éléments avec stroke
 * @param {SVGElement[]} fillElements - Éléments avec fill
 * @param {string} defaultStrokeColor - Couleur stroke par défaut
 * @param {string} defaultFillColor - Couleur fill par défaut
 */
function removeGoldenHover(strokeElements = [], fillElements = [], 
                          defaultStrokeColor = 'rgba(255,255,255,0.72)',
                          defaultFillColor = 'rgba(255,255,255,0.82)') {
  strokeElements.forEach(el => {
    if (el) el.setAttribute('stroke', defaultStrokeColor);
  });
  fillElements.forEach(el => {
    if (el) el.setAttribute('fill', defaultFillColor);
  });
}


/* ── UTILITAIRES DIVERS ──────────────────────────────────────────── */

/**
 * Applique l'effet de push aux éléments voisins lors du hover
 * @param {HTMLElement[]} allElements - Tous les éléments
 * @param {number} hoveredIndex - Index de l'élément survolé
 * @param {number} pushAmount - Distance de push (%)
 * @param {string} direction - 'x' ou 'y'
 */
function applyNeighborPush(allElements, hoveredIndex, pushAmount = 1.4, direction = 'y') {
  allElements.forEach((el, i) => {
    if (i < hoveredIndex) {
      const transform = direction === 'y' 
        ? `translateY(-${pushAmount}%)` 
        : `translateX(-${pushAmount}%)`;
      el.style.transform = transform;
      el.classList.add(direction === 'y' ? 'push-up' : 'push-left');
    } else if (i > hoveredIndex) {
      const transform = direction === 'y' 
        ? `translateY(${pushAmount}%)` 
        : `translateX(${pushAmount}%)`;
      el.style.transform = transform;
      el.classList.add(direction === 'y' ? 'push-down' : 'push-right');
    }
  });
}

/**
 * Retire l'effet de push des éléments voisins
 * @param {HTMLElement[]} allElements - Tous les éléments
 */
function clearNeighborPush(allElements) {
  allElements.forEach(el => {
    el.style.transform = '';
    el.classList.remove('push-up', 'push-down', 'push-left', 'push-right');
  });
}

/* ══════════════════════════════════════════════════════════════════
   FIN HELPERS
   ══════════════════════════════════════════════════════════════════ */

const ctx      = canvas.getContext('2d');
const cursorEl = document.getElementById('cursor');
const veilEl   = document.getElementById('veil');
const elChapterQuote = document.getElementById('chapter-quote');

/* Éléments statiques — référencés une seule fois */
const elDocBtns      = document.getElementById('doc-btns');
const elNavBar       = document.getElementById('nav-bar');
const elRomanCircles = document.getElementById('roman-circles');
const elHoverTitle   = document.getElementById('hover-title');
const elSkipBtn      = document.getElementById('skip-btn');
const elChapSubtitle = document.getElementById('chapitre-subtitle');
const elBgVitrine    = document.getElementById('bg-vitrine');
const elBgPhren      = document.getElementById('bg-phrenologie');
const elBgCollab     = document.getElementById('bg-collaboration');
const elBgChap       = document.getElementById('bg-chapitre2');
const elHotspotLayer = document.getElementById('hotspot-layer');
const elMediaPlayer  = document.getElementById('media-player');

let mouseX = vW()/2, mouseY = vH()/2;
let torchX = mouseX, torchY = mouseY;
let torchBaseRadius = 0, torchTargetRadius = 0;
let experienceStarted = false;
let currentPage = 0;       // 0=vitrine  1=phrenologie  2=collaboration
let isTransitioning = false;
let navBarDrawn = false;
/* Quand true : la torche reste figée au centre (séquence phréno chapitre 2) */
let _torchCentered = false;
let _playerSrc        = null;
let _playerResizeRaf  = null;
let _playerMainSvg    = null;   // SVG plein-écran (rect + boutons audio/vidéo)
let _playerCloseSvg   = null;   // SVG indépendant pour la croix
let _playerCloseGroup = null;   // <g> contenant cercle+croix (pour le scale hover)
let _playerRect       = null;
let _playerCloseHit   = null;
let _playerCloseCirc  = null;
let _playerCloseCross = null;
let _playerWaveCanvas = null;
let _playerPlayHit    = null;
let _playerPlayCircle = null;
let _playerPlayIcon   = null;
let _playerPauseIcon  = null;
let _playerVideoScaleBtn   = null;
let _playerVideoScaleCirc  = null;
let _playerVideoScaleIcon  = null;
let _playerVideoSeekWrap   = null;
let _playerVideoSeekBase   = null;
let _playerVideoSeekFill   = null;
let _playerVideoSepLine    = null;
let _playerVideoLayout     = null;
let _playerVideoScaleAnimRaf = null;
let _resizeUiTimer = null;

/* ══════════════════════════════════════
   UTILITAIRES — factorisation
══════════════════════════════════════ */

/* ── Uniformise la taille de police d'un tableau d'éléments SVG text
      pour qu'aucun ne dépasse maxWidth px.
      Retourne la taille finale unifiée. ── */
function unifyFontSize(textElements, maxWidth, startSize) {
  let unified = startSize;
  textElements.forEach(txt => {
    let fs = startSize;
    while (txt.getComputedTextLength() > maxWidth && fs > 6) {
      fs -= 0.5;
      txt.setAttribute('font-size', fs + 'px');
    }
    if (fs < unified) unified = fs;
  });
  textElements.forEach(txt => txt.setAttribute('font-size', unified + 'px'));
  return unified;
}

/* ── Applique le style doré (hover) à des éléments SVG stroke/fill ── */
function applyGoldenHover(strokeEls, fillEls) {
  const strokeGlow = 'drop-shadow(0 0 7px rgba(255,210,80,0.80)) drop-shadow(0 0 20px rgba(255,170,30,0.50))';
  strokeEls.forEach(el => {
    if (!el) return;
    el.style.stroke = 'rgba(255,230,130,0.95)';
    el.style.filter = strokeGlow;
  });
  fillEls.forEach(el => {
    if (!el) return;
    el.style.fill = 'rgba(255,220,120,1)';
  });
}

/* ── Retire le style doré et remet les valeurs par défaut ── */
function removeGoldenHover(strokeEls, fillEls, defaultStrokeColor) {
  strokeEls.forEach(el => {
    if (!el) return;
    el.style.stroke = defaultStrokeColor;
    el.style.filter = '';
  });
  fillEls.forEach(el => {
    if (!el) return;
    // La couleur de fill par défaut est encodée dans l'attribut SVG — on le restaure
    el.style.fill = '';
  });
}

/* ── Applique push-up/push-down aux voisins d'un élément dans un tableau ── */
function applyNeighborPush(allEls, hoveredIndex) {
  allEls.forEach((el, j) => {
    el.classList.remove('push-up', 'push-down');
    if (j < hoveredIndex) el.classList.add('push-up');
    if (j > hoveredIndex) el.classList.add('push-down');
  });
}

function clearNeighborPush(allEls) {
  allEls.forEach(el => el.classList.remove('push-up', 'push-down'));
}


/* ══════════════════════════════════════
   DIMENSIONS
══════════════════════════════════════ */
function updateTorchTarget() {
  if (currentPage === 3) {
    const C3 = CONFIG.CHAPITRE2;
    /* Mode phréno (torche figée) ou interactif (suit la souris) */
    const taille = _torchCentered
      ? (C3.torch_phren       ?? 1.5)
      : (C3.torch_interactive ?? 1.5);
    torchTargetRadius = Math.min(vW(), vH()) * taille;
  } else if (currentPage === 2) {
    torchTargetRadius = Math.min(vW(), vH()) * CONFIG.COLLAB.torch_taille;
  } else if (currentPage === 1) {
    torchTargetRadius = Math.min(vW(), vH()) * CONFIG.TORCH.taille_phren;
  } else {
    torchTargetRadius = Math.min(vW(), vH()) * CONFIG.TORCH.taille_vitrine;
  }
}
updateTorchTarget();

function arrowSizePx() {
  return Math.max(36, Math.round(vH() * CONFIG.ARROW.size_vh / 100));
}
function docBtnPx() {
  return {
    w: Math.max(120, Math.round(vW()  * CONFIG.DOCS.width_vw  / 100)),
    h: Math.max(36,  Math.round(vH() * CONFIG.DOCS.height_vh / 100)),
  };
}

function resizeCanvas() {
  canvas.width  = vW();
  canvas.height = vH();
  updateTorchTarget();
}
resizeCanvas();

let _lastWindowW = vW();
let _lastWindowH = vH();
let _mediaResizeTimer = null;

window.addEventListener('resize', () => {
    document.body.classList.add('resizing');

  if (_resizeUiTimer) clearTimeout(_resizeUiTimer);
  _resizeUiTimer = setTimeout(() => {
    document.body.classList.remove('resizing');
  }, 120);
  
  resizeCanvas();
  resizeArrowSvg();

  /* Recalcule la font du titre — fontPx dépend de vW() qui change au resize */
  const titleEl = document.getElementById('site-title');
  if (titleEl && titleEl.innerHTML) _applyTitleFont(titleEl);

  const dc = elDocBtns;
  if (dc.classList.contains('visible')) resizeDocBtns();

  const rc = elRomanCircles;
  if (rc.classList.contains('visible')) {
    const C   = CONFIG.COLLAB;
    const sz  = Math.max(36, Math.round(vH() * C.circle_size_vh / 100));
    const gap = Math.max(8,  Math.round(vH() * (C.circle_gap_vh ?? 3) / 100));
    rc.style.gap = gap + 'px';
    rc.style.top = (C.circle_top_pct ?? 50) + '%';
    rc.querySelectorAll('.roman-btn').forEach(btn => {
      btn.style.width  = sz + 'px';
      btn.style.height = sz + 'px';
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', sz);
        svg.setAttribute('height', sz);
      }
      const num = btn.querySelector('.roman-num');
      if (num) {
        const fR = CONFIG.FONTS?.roman;
        const fszR = fR
          ? Math.max(fR.size_min, Math.min(fR.size_max, Math.round(vW() * fR.size_vw / 100)))
          : Math.round(sz * 0.28);
        num.setAttribute('font-size', fszR);
      }
    });
  }

  if (navBarDrawn) drawNavBar(false);
  if (elSkipBtn.classList.contains('visible')) showSkipButton();

  handleMediaPlayerResize();

  const dw = Math.abs(vW() - _lastWindowW);
  const dh = Math.abs(vH() - _lastWindowH);

  _lastWindowW = vW();
  _lastWindowH = vH();

  if (_mediaResizeTimer) clearTimeout(_mediaResizeTimer);

  _mediaResizeTimer = setTimeout(() => {
    if (_playerActive && (dw > 140 || dh > 140)) {
      rebuildActiveMediaPlayer();
    }
  }, 120);
});


/* ══════════════════════════════════════
   OSCILLATEURS
══════════════════════════════════════ */
const O = {
  b1:{s:.00044,p:Math.random()*6.28,a:.062}, b2:{s:.00071,p:Math.random()*6.28,a:.038},
  f1:{s:.0088, p:Math.random()*6.28,a:.024}, f2:{s:.0141, p:Math.random()*6.28,a:.017},
  f3:{s:.0229, p:Math.random()*6.28,a:.011}, f4:{s:.0373, p:Math.random()*6.28,a:.006},
  dx:{s:.00058,p:Math.random()*6.28,a:3.2 }, dy:{s:.00074,p:Math.random()*6.28,a:2.5 },
  w: {s:.00041,p:Math.random()*6.28,a:1.0 },
};
const osc = (o, t) => Math.sin(t * o.s + o.p) * o.a;


/* ══════════════════════════════════════
   SUIVI SOURIS — curseur sur tous les éléments cliquables
   Le curseur s'agrandit sur : flèche, doc-btns, roman-btns,
   nav-btn-zones, fs-btn, et tout élément [data-clickable]
   PERF : elementFromPoint throttlé à ~60fps max
══════════════════════════════════════ */
const CLICKABLE_SELECTORS = [
  '#nav-arrow',
  '.doc-btn',
  '.roman-btn',
  '.nav-btn-zone',
  '#fs-btn',
  '[data-clickable]',
].join(',');

let _lastHitCheck = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorEl.style.left = mouseX + 'px';
  cursorEl.style.top  = mouseY + 'px';

  const now = Date.now();
  if (now - _lastHitCheck < 16) return;
  _lastHitCheck = now;

  const hit = document.elementFromPoint(mouseX, mouseY);
  const isClickable = hit && (hit.matches(CLICKABLE_SELECTORS) || hit.closest(CLICKABLE_SELECTORS));
  const isHotspot   = hit && (hit.matches('.hotspot-zone') || hit.closest('.hotspot-zone'));

  cursorEl.classList.toggle('active', !!isClickable);
  cursorEl.classList.toggle('hotspot', !!isHotspot);
});


/* ══════════════════════════════════════
   TORCHE
══════════════════════════════════════ */
function safeGrad(x0, y0, r0, x1, y1, r1) {
  if ([x0,y0,r0,x1,y1,r1].some(v => !isFinite(v) || isNaN(v))) return null;
  return ctx.createRadialGradient(x0, y0, Math.max(0, r0), x1, y1, Math.max(0.001, r1));
}

function renderTorch(t) {
  const W = canvas.width, H = canvas.height;

  if (_torchCentered) {
    /* Séquence phréno chapitre 2 : torche figée au centre, recalculée au resize */
    torchX = W / 2;
    torchY = H / 2;
  } else {
    torchX += (mouseX - torchX) * CONFIG.TORCH.lag;
    torchY += (mouseY - torchY) * CONFIG.TORCH.lag;
  }
  const active = torchBaseRadius > 5;
  const cx = torchX + (active ? osc(O.dx, t) : 0);
  const cy = torchY + (active ? osc(O.dy, t) : 0);
  const intensity = 1 + osc(O.b1,t) + osc(O.b2,t) + osc(O.f1,t) + osc(O.f2,t) + osc(O.f3,t) + osc(O.f4,t);
  const r  = Math.max(0, torchBaseRadius * Math.max(0.72, intensity));
  const wp = osc(O.w, t);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (r < 1) return;
  ctx.globalCompositeOperation = 'destination-out';
  const g1 = safeGrad(cx,cy,0,cx,cy,r*3.4);
  if (g1) { g1.addColorStop(0,'rgba(0,0,0,0.28)'); g1.addColorStop(0.22,'rgba(0,0,0,0.16)');
    g1.addColorStop(0.55,'rgba(0,0,0,0.07)'); g1.addColorStop(0.82,'rgba(0,0,0,0.02)'); g1.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cx,cy,r*3.4,0,Math.PI*2); ctx.fillStyle=g1; ctx.fill(); }
  const g2 = safeGrad(cx,cy,0,cx,cy,r*2.0);
  if (g2) { g2.addColorStop(0,'rgba(0,0,0,0.44)'); g2.addColorStop(0.35,'rgba(0,0,0,0.28)');
    g2.addColorStop(0.68,'rgba(0,0,0,0.10)'); g2.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cx,cy,r*2.0,0,Math.PI*2); ctx.fillStyle=g2; ctx.fill(); }
  const g3 = safeGrad(cx,cy,0,cx,cy,r);
  if (g3) { g3.addColorStop(0,'rgba(0,0,0,0.78)'); g3.addColorStop(0.28,'rgba(0,0,0,0.68)');
    g3.addColorStop(0.58,'rgba(0,0,0,0.42)'); g3.addColorStop(0.82,'rgba(0,0,0,0.16)'); g3.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle=g3; ctx.fill(); }
  const rC = Math.max(1, r*(0.28 + Math.abs(osc(O.f1,t))*0.15));
  const gC = safeGrad(cx,cy,0,cx,cy,rC);
  if (gC) { gC.addColorStop(0,'rgba(0,0,0,0.18)'); gC.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cx,cy,rC,0,Math.PI*2); ctx.fillStyle=gC; ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
  const wR = Math.max(1, r*0.62*Math.max(0.55, intensity));
  const wA = 0.048 + Math.abs(wp)*0.028;
  const gW = safeGrad(cx,cy,0,cx,cy,wR);
  if (gW) { const gb = Math.floor(Math.max(0, Math.min(255, 185+wp*14)));
    gW.addColorStop(0,`rgba(255,${gb},70,${(wA*1.5).toFixed(3)})`);
    gW.addColorStop(0.45,`rgba(255,170,55,${wA.toFixed(3)})`); gW.addColorStop(1,'rgba(255,130,20,0)');
    ctx.beginPath(); ctx.arc(cx,cy,wR,0,Math.PI*2); ctx.fillStyle=gW; ctx.fill(); }
  const vIn  = Math.max(0, r*1.05), vOut = Math.max(vIn+1, Math.sqrt(W*W+H*H)*0.72);
  const gV   = safeGrad(cx,cy,vIn,cx,cy,vOut);
  if (gV) { gV.addColorStop(0,'rgba(0,0,0,0)'); gV.addColorStop(0.2,'rgba(0,0,0,0.18)');
    gV.addColorStop(0.6,'rgba(0,0,0,0.55)'); gV.addColorStop(1,'rgba(0,0,0,0.92)');
    ctx.fillStyle=gV; ctx.fillRect(0,0,W,H); }
}
(function loop(t) { renderTorch(t); requestAnimationFrame(loop); })();

let growAnimId = null;
function growTorch(target, durationMs) {
  if (growAnimId) cancelAnimationFrame(growAnimId);
  const start = torchBaseRadius, diff = target - start, t0 = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / durationMs, 1);
    const e = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
    torchBaseRadius = start + diff*e;
    if (p < 1) { growAnimId = requestAnimationFrame(step); } else { growAnimId = null; }
  }
  growAnimId = requestAnimationFrame(step);
}


/* ══════════════════════════════════════
   AUDIO
   museeGain est gardé en référence globale pour pouvoir
   faire des fades depuis n'importe où.
══════════════════════════════════════ */
let audioCtx  = null;
let museeGain = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

async function loadBuffer(url) {
  const ac = getAudioCtx();
  try {
    return await ac.decodeAudioData(await (await fetch(url)).arrayBuffer());
  } catch(e) { return null; }
}

async function startMuseeLoop() {
  const ac  = getAudioCtx();
  const buf = await loadBuffer('sons/MuseeLoop.mp3');
  if (!buf) return;
  const src = ac.createBufferSource();
  museeGain = ac.createGain();
  src.buffer = buf; src.loop = true;
  museeGain.gain.setValueAtTime(0, ac.currentTime);
  museeGain.gain.linearRampToValueAtTime(
    CONFIG.AUDIO.musee_vol, ac.currentTime + CONFIG.AUDIO.fadeDuration / 1000
  );
  src.connect(museeGain); museeGain.connect(ac.destination); src.start();
}

/* Fade le gain musée vers une valeur cible sur durationMs */
function fadeMusee(toVol, durationMs) {
  if (!museeGain) return;
  const ac = getAudioCtx();
  museeGain.gain.cancelScheduledValues(ac.currentTime);
  museeGain.gain.setValueAtTime(museeGain.gain.value, ac.currentTime);
  museeGain.gain.linearRampToValueAtTime(toVol, ac.currentTime + durationMs / 1000);
}

/* Joue S-phrenologie.mp3 une fois avec fade in/out, puis refade le musée.
   La source est stockée globalement pour pouvoir être coupée si on quitte. */
let phrenSrc  = null;
let phrenGain = null;

async function playPhrenoSound() {
  const ac  = getAudioCtx();
  const A   = CONFIG.AUDIO;
  const buf = await loadBuffer('sons/S-phrenologie.mp3');
  if (!buf) return null;

  // Fade out musée
  fadeMusee(0, A.musee_fade);

  phrenSrc  = ac.createBufferSource();
  phrenGain = ac.createGain();
  phrenSrc.buffer = buf; phrenSrc.loop = false;
  const dur = buf.duration;

  phrenGain.gain.setValueAtTime(0, ac.currentTime);
  phrenGain.gain.linearRampToValueAtTime(1.0, ac.currentTime + A.phren_fade_in / 1000);
  const fadeOutStart = Math.max(A.phren_fade_in / 1000, dur - A.phren_fade_out / 1000);
  phrenGain.gain.setValueAtTime(1.0, ac.currentTime + fadeOutStart);
  phrenGain.gain.linearRampToValueAtTime(0, ac.currentTime + dur);

  phrenSrc.connect(phrenGain); phrenGain.connect(ac.destination); phrenSrc.start();

  // Fin naturelle : on nettoie seulement. La suite est gérée par la séquence de navigation.
  phrenSrc.onended = () => {
    if (phrenSrc === null) return;
    phrenSrc = null; phrenGain = null;
  };

  return phrenSrc;
}

/* Coupe S-phrenologie.mp3 immédiatement et remet le musée au bon niveau */
function stopPhrenoSound() {
  if (phrenSrc) {
    try { phrenSrc.onended = null; phrenSrc.stop(); } catch(e) {}
    phrenSrc = null; phrenGain = null;
  }
  fadeMusee(CONFIG.AUDIO.musee_vol, CONFIG.AUDIO.musee_fade);
}



/* Boucle Sanza (chapitre 2) — même architecture que museeLoop */
let sanzaSrc  = null;
let sanzaGain = null;

async function startSanzaLoop() {
  const ac  = getAudioCtx();
  const buf = await loadBuffer('sons/buste.mp3');
  if (!buf) return;
  // Si déjà en cours, on ne relance pas
  if (sanzaSrc) return;
  sanzaSrc  = ac.createBufferSource();
  sanzaGain = ac.createGain();
  sanzaSrc.buffer = buf; sanzaSrc.loop = true;
  sanzaGain.gain.setValueAtTime(0, ac.currentTime);
  sanzaGain.gain.linearRampToValueAtTime(
  CONFIG.AUDIO.sanza_vol,
  ac.currentTime + CONFIG.AUDIO.sanza_fade_in / 1000
);
  sanzaSrc.connect(sanzaGain); sanzaGain.connect(ac.destination); sanzaSrc.start();
  sanzaSrc.onended = () => { sanzaSrc = null; sanzaGain = null; };
}

function stopSanzaLoop(fadeDurationMs) {
  if (!sanzaGain) return;
  const ac = getAudioCtx();
  const ms = fadeDurationMs || CONFIG.AUDIO.sanza_fade_out;
  sanzaGain.gain.cancelScheduledValues(ac.currentTime);
  sanzaGain.gain.setValueAtTime(sanzaGain.gain.value, ac.currentTime);
  sanzaGain.gain.linearRampToValueAtTime(0, ac.currentTime + ms / 1000);
  const s = sanzaSrc; const g = sanzaGain;
  sanzaSrc = null; sanzaGain = null;
  setTimeout(() => { try { s.stop(); } catch(e) {} }, ms + 50);
}

/* Boucle Silence (transition chapitre 2 → collab) — même architecture */
let silenceSrc  = null;
let silenceGain = null;

async function startSilenceLoop() {
  const ac  = getAudioCtx();
  const buf = await loadBuffer('Collaboration/Chapitre2/Silence.mp3');
  if (!buf) return;
  // Si déjà en cours, on ne relance pas
  if (silenceSrc) return;
  silenceSrc  = ac.createBufferSource();
  silenceGain = ac.createGain();
  silenceSrc.buffer = buf; silenceSrc.loop = true;
  silenceGain.gain.setValueAtTime(0, ac.currentTime);
  silenceGain.gain.linearRampToValueAtTime(
    CONFIG.AUDIO.silence_vol,
    ac.currentTime + CONFIG.AUDIO.silence_fade_in / 1000
  );
  silenceSrc.connect(silenceGain); silenceGain.connect(ac.destination); silenceSrc.start();
  silenceSrc.onended = () => { silenceSrc = null; silenceGain = null; };
}

function stopSilenceLoop(fadeDurationMs) {
  if (!silenceGain) return;
  const ac = getAudioCtx();
  const ms = fadeDurationMs || CONFIG.AUDIO.silence_fade_out;
  silenceGain.gain.cancelScheduledValues(ac.currentTime);
  silenceGain.gain.setValueAtTime(silenceGain.gain.value, ac.currentTime);
  silenceGain.gain.linearRampToValueAtTime(0, ac.currentTime + ms / 1000);
  const s = silenceSrc; const g = silenceGain;
  silenceSrc = null; silenceGain = null;
  setTimeout(() => { try { s.stop(); } catch(e) {} }, ms + 50);
}

/* Boucle Collaboration (espace collaboration) — même architecture */
let collabSrc  = null;
let collabGain = null;

async function startCollabLoop() {
  const ac  = getAudioCtx();
  const buf = await loadBuffer('sons/collaboration.mp3');
  if (!buf) return;
  // Si déjà en cours, on ne relance pas
  if (collabSrc) return;
  collabSrc  = ac.createBufferSource();
  collabGain = ac.createGain();
  collabSrc.buffer = buf; collabSrc.loop = true;
  collabGain.gain.setValueAtTime(0, ac.currentTime);
  collabGain.gain.linearRampToValueAtTime(
    CONFIG.AUDIO.collab_vol,
    ac.currentTime + CONFIG.AUDIO.collab_fade_in / 1000
  );
  collabSrc.connect(collabGain); collabGain.connect(ac.destination); collabSrc.start();
  collabSrc.onended = () => { collabSrc = null; collabGain = null; };
}

function stopCollabLoop(fadeDurationMs) {
  if (!collabGain) return;
  const ac = getAudioCtx();
  const ms = fadeDurationMs || CONFIG.AUDIO.collab_fade_out;
  collabGain.gain.cancelScheduledValues(ac.currentTime);
  collabGain.gain.setValueAtTime(collabGain.gain.value, ac.currentTime);
  collabGain.gain.linearRampToValueAtTime(0, ac.currentTime + ms / 1000);
  const s = collabSrc; const g = collabGain;
  collabSrc = null; collabGain = null;
  setTimeout(() => { try { s.stop(); } catch(e) {} }, ms + 50);
}


/* ══════════════════════════════════════
   PLEIN ÉCRAN
══════════════════════════════════════ */
const fsBtn   = document.getElementById('fs-btn');
const enterFS = () => { const el = document.documentElement;
  (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen)?.call(el); };
const exitFS  = () => { (document.exitFullscreen || document.webkitExitFullscreen ||
  document.mozCancelFullScreen || document.msExitFullscreen)?.call(document); };
const isFS    = () => !!(document.fullscreenElement || document.webkitFullscreenElement ||
  document.mozFullScreenElement || document.msFullscreenElement);
fsBtn.addEventListener('click', () => isFS() ? exitFS() : enterFS());
['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','msfullscreenchange']
  .forEach(ev => document.addEventListener(ev, () => {
    document.body.classList.toggle('is-fullscreen', isFS());
    _rebuildFsBtn();
  }));

/* ── Bouton fullscreen — cercle SVG identique à la flèche ──
   Reconstruit au chargement et à chaque changement fullscreen + resize.   */
function _rebuildFsBtn() {
  const sz  = arrowSizePx();
  const expanded = isFS();
  const stroke   = 'rgba(255,255,255,0.75)';
  const strokeGlow = 'drop-shadow(0 0 7px rgba(255,210,80,0.80)) drop-shadow(0 0 20px rgba(255,170,30,0.50))';

  /* viewBox 0 0 24 24, rendu à sz px.
     La flèche utilise viewBox 0 0 70 70 avec stroke-width 1.2/1.4.
     Pour le même rendu visuel : multiplier par (24/70) ≈ 0.343
     → carré : 1.2 × 0.343 ≈ 0.41  — icônes : 1.4 × 0.343 ≈ 0.48 */
  const swRect = '0.41';
  const swIcon = '0.48';

  const perim = 4 * 22;   // périmètre du carré 22×22

  const iconExpand = `
    <polyline points="15,3 21,3 21,9" fill="none" stroke="${stroke}" stroke-width="${swIcon}" stroke-linecap="round" stroke-linejoin="round" style="transition:stroke .3s,filter .3s;"/>
    <polyline points="9,21 3,21 3,15" fill="none" stroke="${stroke}" stroke-width="${swIcon}" stroke-linecap="round" stroke-linejoin="round" style="transition:stroke .3s,filter .3s;"/>
    <line x1="21" y1="3" x2="14" y2="10" stroke="${stroke}" stroke-width="${swIcon}" stroke-linecap="round" style="transition:stroke .3s,filter .3s;"/>
    <line x1="3" y1="21" x2="10" y2="14" stroke="${stroke}" stroke-width="${swIcon}" stroke-linecap="round" style="transition:stroke .3s,filter .3s;"/>`;

  const iconCollapse = `
    <polyline points="4,14 10,14 10,20" fill="none" stroke="${stroke}" stroke-width="${swIcon}" stroke-linecap="round" stroke-linejoin="round" style="transition:stroke .3s,filter .3s;"/>
    <polyline points="20,10 14,10 14,4" fill="none" stroke="${stroke}" stroke-width="${swIcon}" stroke-linecap="round" stroke-linejoin="round" style="transition:stroke .3s,filter .3s;"/>
    <line x1="10" y1="14" x2="3" y2="21" stroke="${stroke}" stroke-width="${swIcon}" stroke-linecap="round" style="transition:stroke .3s,filter .3s;"/>
    <line x1="14" y1="10" x2="21" y2="3" stroke="${stroke}" stroke-width="${swIcon}" stroke-linecap="round" style="transition:stroke .3s,filter .3s;"/>`;

  fsBtn.innerHTML = `
    <svg width="${sz}" height="${sz}" viewBox="0 0 24 24" overflow="visible"
         style="display:block;transition:transform .35s cubic-bezier(0.34,1.56,0.64,1);transform-origin:center;">
      <rect x="1" y="1" width="22" height="22" rx="1.5"
        fill="none" stroke="${stroke}" stroke-width="${swRect}"
        stroke-dasharray="${perim}" stroke-dashoffset="0"
        style="transition:stroke .3s,filter .3s;"/>
      ${expanded ? iconCollapse : iconExpand}
    </svg>`;

  const svgEl   = fsBtn.querySelector('svg');
  const strokes = fsBtn.querySelectorAll('[stroke]');

  fsBtn.onmouseenter = () => {
    svgEl.style.transform = 'scale(1.22)';
    strokes.forEach(el => { el.style.stroke = 'rgba(255,230,130,0.95)'; el.style.filter = strokeGlow; });
  };
  fsBtn.onmouseleave = () => {
    svgEl.style.transform = 'scale(1)';
    strokes.forEach(el => { el.style.stroke = stroke; el.style.filter = ''; });
  };
}
_rebuildFsBtn();
window.addEventListener('resize', _rebuildFsBtn);


/* ══════════════════════════════════════
   TITRE
══════════════════════════════════════ */
function _applyTitleFont(el) {
  const f = CONFIG.FONTS?.title;
  if (!f) return;
  el.style.fontFamily    = f.family;
  el.style.fontSize      = fontPx('title') + 'px';
  el.style.fontWeight    = f.weight;
  el.style.letterSpacing = f.spacing;
  el.style.fontStyle     = f.style;
  el.style.color         = f.color;
}

function revealTitle() {
  const el = document.getElementById('site-title');
  _applyTitleFont(el);
  let html = '', charIdx = 0;
  CONFIG.TITLE.texte.forEach(part => {
    if (part === '—') { html += `<span class="sep">—</span>`; }
    else { part.split('').forEach(ch => {
      html += `<span class="char" data-i="${charIdx}">${ch === ' ' ? '&nbsp;' : ch}</span>`; charIdx++;
    }); }
  });
  el.innerHTML = html;
  el.querySelectorAll('.char').forEach((s, i) => {
    setTimeout(() => { s.style.opacity = '1'; s.style.transform = 'translateY(0)'; },
      CONFIG.TIMING.title_start + i * CONFIG.TIMING.title_char_delay + Math.random()*20);
  });
  el.querySelectorAll('.sep').forEach((s, i) => {
    setTimeout(() => { s.style.opacity = '0.6'; }, CONFIG.TIMING.title_start + (i+1)*340);
  });
}


/* ══════════════════════════════════════
   FLÈCHE — même logique que les boutons doc :
   innerHTML reconstruit à chaque affichage → éléments neufs
   sans historique CSS → dashoffset de départ garanti
══════════════════════════════════════ */
const arrowEl = document.getElementById('nav-arrow');

/* Au resize : reconstruit le SVG à la nouvelle taille, dessin déjà terminé */
function resizeArrowSvg() {
  if (!arrowEl.classList.contains('visible')) return;
  const sz   = arrowSizePx();
  const CIRC = 201;
  const PLEN = 60;
  const existingPath = arrowEl.querySelector('path');
  const d = existingPath ? existingPath.getAttribute('d') : 'M35 22 L35 48 M24 37 L35 48 L46 37';

  arrowEl.innerHTML = `
    <svg width="${sz}" height="${sz}" viewBox="0 0 70 70" overflow="visible">
      <circle class="arrow-c" cx="35" cy="35" r="32"
        fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"
        stroke-dasharray="${CIRC}" stroke-dashoffset="0"/>
      <path class="arrow-p" d="${d}"
        fill="none" stroke="rgba(255,255,255,0.80)" stroke-width="1.4"
        stroke-linecap="round" stroke-linejoin="round"
        stroke-dasharray="${PLEN}" stroke-dashoffset="0"/>
    </svg>`;

  const c = arrowEl.querySelector('.arrow-c');
  const p = arrowEl.querySelector('.arrow-p');
  c.style.transition = 'stroke .3s, filter .3s';
  p.style.transition = 'stroke .3s, filter .3s';
  _attachArrowHover(c, p);
}

/* Attache le hover doré sur les éléments c et p du SVG flèche */
function _attachArrowHover(c, p) {
  arrowEl.onmouseenter = () => applyGoldenHover([c, p], []);
  arrowEl.onmouseleave = () => {
    c.style.stroke = 'rgba(255,255,255,0.75)'; c.style.filter = '';
    p.style.stroke = 'rgba(255,255,255,0.80)'; p.style.filter = '';
  };
}

// false au démarrage — la flèche n'est pas encore visible,
// sera mis à true dans showArrow() pendant le dessin.
let arrowDrawing = false;

function showArrow(page) {
  const sz   = arrowSizePx();
  const CIRC = 201;
  const PLEN = 60;

  let d, posClass;
  if (page === 1) {
    d = 'M35 48 L35 22 M24 33 L35 22 L46 33';
    posClass = 'pos-top';
  } else if (page === 2) {
    d = 'M48 35 L22 35 M33 24 L22 35 L33 46';
    posClass = 'pos-left';
  } else {
    d = 'M35 22 L35 48 M24 37 L35 48 L46 37';
    posClass = 'pos-bottom';
  }

  arrowEl.classList.remove('pos-bottom', 'pos-top', 'pos-left');
  arrowEl.classList.add(posClass);

  arrowEl.innerHTML = `
    <svg width="${sz}" height="${sz}" viewBox="0 0 70 70" overflow="visible">
      <circle class="arrow-c" cx="35" cy="35" r="32"
        fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"
        stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"/>
      <path class="arrow-p" d="${d}"
        fill="none" stroke="rgba(255,255,255,0.80)" stroke-width="1.4"
        stroke-linecap="round" stroke-linejoin="round"
        stroke-dasharray="${PLEN}" stroke-dashoffset="${PLEN}"/>
    </svg>`;

  arrowEl.style.transition = 'opacity 1.0s ease';
  arrowEl.style.opacity    = '1';
  arrowEl.classList.add('visible');

  const c = arrowEl.querySelector('.arrow-c');
  const p = arrowEl.querySelector('.arrow-p');
  c.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1), stroke .3s, filter .3s';
  p.style.transition = 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1) 1.3s, stroke .3s, filter .3s';

  // Bloque l'interaction pendant le dessin
  // circle: 1.4s + path delay 1.3s + path duration 0.7s = 2.0s total
  arrowDrawing = true;
  setTimeout(() => { arrowDrawing = false; }, 2100);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    c.setAttribute('stroke-dashoffset', '0');
    p.setAttribute('stroke-dashoffset', '0');
  }));

  _attachArrowHover(c, p);
}

function hideArrow() {
  hideUI(arrowEl, 400, () => { arrowEl.innerHTML = ''; }), 420;
}


/* ══════════════════════════════════════
   BOUTONS DOCUMENTS — proportionnels, même technique de dessin
   FIX : buildDocBtns gère l'animation (animate=true) et le resize (animate=false)
         pour éviter la duplication entre buildDocBtns et resizeDocBtns.
══════════════════════════════════════ */
function _buildDocBtnsDOM(animate) {
  const container = elDocBtns;
  const D = CONFIG.DOCS;
  const { w, h }  = docBtnPx();
  const perim      = 2 * (w + h);
  const f          = CONFIG.FONTS?.doc_btns;
  const fontSizeStart = f
    ? Math.max(f.size_min, Math.min(f.size_max, Math.round(vW() * f.size_vw / 100)))
    : Math.min(16, Math.max(9, Math.round(h * 0.38)));
  const maxTextW   = w * 0.76;

  /* Position et espacement depuis la config */
  container.style.right = (D.right_pct ?? 3.5) + '%';
  container.style.top   = (D.top_pct   ?? 3.2) + '%';
  container.style.gap   = Math.max(4, Math.round(vH() * (D.gap_vh ?? 1.8) / 100)) + 'px';

  if (animate) {
    // Construction complète (première fois)
    container.innerHTML = '';
    CONFIG.DOCS.labels.forEach((label, i) => {
      const btn = document.createElement('div');
      btn.className    = 'doc-btn';
      btn.style.width  = w + 'px';
      btn.style.height = h + 'px';
      btn.innerHTML = `
        <svg width="${w}" height="${h}">
          <rect class="doc-rect"
                x="1" y="1" width="${w-2}" height="${h-2}"
                stroke-dasharray="${perim}" stroke-dashoffset="${perim}"/>
          <text class="doc-label"
                x="${w/2}" y="${h/2}"
                font-size="${fontSizeStart}"
                font-family="${f?.family ?? 'Cinzel, serif'}"
                font-weight="${f?.weight ?? 400}"
                letter-spacing="${f?.spacing ?? '0.18em'}">${label}</text>
        </svg>`;

      const action = CONFIG.DOCS.actions[i];
      btn.addEventListener('click', () => {
        if (isTransitioning) return;
        if (action === 'collab') navigateTo(2);
        else console.log('Doc:', label);
      });
      container.appendChild(btn);
    });
  } else {
    // Mise à jour dimensions seulement (resize)
    container.querySelectorAll('.doc-btn').forEach((btn, i) => {
      btn.style.width  = w + 'px';
      btn.style.height = h + 'px';
      const rect  = btn.querySelector('.doc-rect');
      const label = btn.querySelector('.doc-label');
      const svg   = btn.querySelector('svg');
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      rect.setAttribute('width',  w - 2);
      rect.setAttribute('height', h - 2);
      rect.setAttribute('stroke-dasharray', perim);
      rect.setAttribute('stroke-dashoffset', '0');
      label.setAttribute('x', w / 2);
      label.setAttribute('y', h / 2);
      label.setAttribute('font-size', fontSizeStart + 'px');
    });
  }

  // Uniformisation police (commune aux deux modes)
  const allTexts = Array.from(container.querySelectorAll('.doc-label'));
  unifyFontSize(allTexts, maxTextW, fontSizeStart);

  return container;
}

function _attachDocBtnsHover(container) {
  const allBtns = Array.from(container.querySelectorAll('.doc-btn'));
  allBtns.forEach((btn, i) => {
    btn.onmouseenter = () => {
      btn.classList.add('hovered');
      applyNeighborPush(allBtns, i);
      applyGoldenHover(
        [btn.querySelector('.doc-rect')],
        [btn.querySelector('.doc-label')]
      );
    };
    btn.onmouseleave = () => {
      btn.classList.remove('hovered');
      clearNeighborPush(allBtns);
      const r = btn.querySelector('.doc-rect');
      const l = btn.querySelector('.doc-label');
      if (r) { r.style.stroke = 'rgba(255,255,255,0.72)'; r.style.filter = ''; }
      if (l) l.style.fill = 'rgba(255,255,255,0.82)';
    };
  });
  return allBtns;
}

function showDocBtns() {
  const container = _buildDocBtnsDOM(true);
  // CRITICAL : supprimer l'opacity inline mise par hideUI, sinon elle bloque le CSS
  container.style.opacity = '';
  container.classList.add('visible');

  const allBtns = _attachDocBtnsHover(container);

  // Animation d'entrée en cascade
  allBtns.forEach((btn, i) => {
    const rect  = btn.querySelector('.doc-rect');
    const label = btn.querySelector('.doc-label');
    const delayMs = i * 220;
    setTimeout(() => {
      rect.classList.remove('drawn');
      label.classList.remove('drawn');
      void rect.offsetWidth;
      rect.classList.add('drawn');
      setTimeout(() => label.classList.add('drawn'), 850);
    }, delayMs);
  });
}

function resizeDocBtns() {
  // FIX : reconstruit le DOM ET réattache les hovers (évitait leur perte au resize)
  _buildDocBtnsDOM(false);
  _attachDocBtnsHover(elDocBtns);
}

function hideDocBtns() {
  hideUI(elDocBtns, 600, () => { elDocBtns.innerHTML = ''; });
}


/* ══════════════════════════════════════
   BARRE NAVIGATION BAS
══════════════════════════════════════ */
function drawNavBar(animate) {
  const C  = CONFIG.NAV;
  const W  = vW(), H = vH();
  const ns = 'http://www.w3.org/2000/svg';

  /* ── Alignement parfait avec le bouton fullscreen ──────────────────
     Le fsBtn : hauteur = arrowSizePx(), bottom = 5% → centre à 5%+4%=9%
     La nav bar partage la même hauteur et le même bottom → centres alignés. */
  const sz      = arrowSizePx();          // hauteur nav = hauteur fsBtn
  const h       = sz;
  const bottom  = Math.round(H * 0.05);   // même bottom que fsBtn (5%)
  const y       = H - bottom - h;         // bord supérieur de la nav

  /* Largeur : centrée, laisse la place au fsBtn (right:3.5%) + sz + marge */
  const fsBtnW  = sz + Math.round(W * 0.035) * 2;   // emprise fsBtn à droite
  const maxW    = W - Math.round(W * 0.035) - fsBtnW; // largeur max disponible
  const bw      = Math.min(Math.round(W * C.width), maxW);
  const x       = Math.round((W - bw) / 2);

  const N = C.labels.length;

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', W); svg.setAttribute('height', H);

  // Rectangle extérieur
  const perim = 2 * (bw + h);
  const outerRect = document.createElementNS(ns, 'rect');
  outerRect.setAttribute('class', 'nav-rect-path');
  outerRect.setAttribute('x', x); outerRect.setAttribute('y', y);
  outerRect.setAttribute('width', bw); outerRect.setAttribute('height', h);
  outerRect.setAttribute('stroke', C.stroke_color); outerRect.setAttribute('stroke-width', C.stroke_width);
  outerRect.style.strokeDasharray  = perim;
  outerRect.style.strokeDashoffset = animate ? perim : '0';
  outerRect.style.transition = animate ? `stroke-dashoffset ${C.draw_speed}s cubic-bezier(0.4,0,0.2,1)` : 'none';
  svg.appendChild(outerRect);

  // Séparateurs — stockés pour animation hover
  const seps = [], sepDefaultX = [];
  for (let i = 1; i < N; i++) {
    const sx = x + i * bw / N;
    sepDefaultX.push(sx);
    const sep = document.createElementNS(ns, 'line');
    sep.setAttribute('class', 'nav-rect-path');
    sep.setAttribute('x1', sx); sep.setAttribute('y1', y);
    sep.setAttribute('x2', sx); sep.setAttribute('y2', y + h);
    sep.setAttribute('stroke', C.stroke_color); sep.setAttribute('stroke-width', C.stroke_width);
    const d = C.draw_speed + (i-1) * C.sep_delay;
    sep.style.strokeDasharray  = h;
    sep.style.strokeDashoffset = animate ? h : '0';
    sep.style.transition = animate ? `stroke-dashoffset ${C.sep_speed}s cubic-bezier(0.4,0,0.2,1) ${d}s` : 'none';
    svg.appendChild(sep); seps.push(sep);
  }

  // Textes + zones
  const txts = [], zones = [];
  const cellW = bw / N;

  C.labels.forEach((label, i) => {
    const cx = x + (i + 0.5) * cellW, cy = y + h / 2;
    const d  = C.draw_speed + i * C.sep_delay + C.text_delay;
    const txt = document.createElementNS(ns, 'text');
    txt.setAttribute('class', 'nav-btn-label');
    txt.setAttribute('x', cx); txt.setAttribute('y', cy);
    txt.setAttribute('fill', C.btn_color);
    const fNav = CONFIG.FONTS?.nav_btns;
    const navFontSize = fNav
      ? Math.max(fNav.size_min, Math.min(fNav.size_max, Math.round(vW() * fNav.size_vw / 100)))
      : Math.round(h * 0.38);
    txt.setAttribute('font-family',   fNav?.family  ?? C.btn_font);
    txt.setAttribute('font-size',     navFontSize + 'px');
    txt.setAttribute('letter-spacing', fNav?.spacing ?? C.btn_letter_spacing);
    txt.setAttribute('font-weight',   fNav?.weight  ?? 300);
    txt.textContent = label;
    txt.style.opacity    = animate ? '0' : '1';
    txt.style.transition = animate ? `opacity ${C.text_fade}s ease ${d}s` : 'none';
    svg.appendChild(txt); txts.push(txt);

    const zone = document.createElementNS(ns, 'rect');
    zone.setAttribute('class', 'nav-btn-zone');
    zone.setAttribute('x', x + i * cellW); zone.setAttribute('y', y);
    zone.setAttribute('width', cellW); zone.setAttribute('height', h);
    zone.setAttribute('fill', 'transparent');
    svg.appendChild(zone); zones.push(zone);
  });

  // Injection dans le DOM
  const bar = elNavBar;
  bar.innerHTML = ''; bar.style.width = W + 'px'; bar.style.height = H + 'px';
  bar.appendChild(svg);

  // Uniformisation police — factorisation
  unifyFontSize(txts, cellW * 0.82, parseFloat(txts[0].getAttribute('font-size')));

  if (animate) {
    setTimeout(() => {
      outerRect.style.strokeDashoffset = '0';
      seps.forEach(s => s.style.strokeDashoffset = '0');
      txts.forEach(t => t.style.opacity = '1');
    }, 40);
  }
  navBarDrawn = true;

  /* ── Hover : séparateurs animés + texte centré + espacement ──
     Le bouton survolé "pousse" les séparateurs qui l'entourent vers l'extérieur.
     L'animation est faite par interpolation JS (ease-out) sur ~600ms. */
  const EXPAND  = cellW * 0.18;
  const DUR_MS  = 600;
  let animRaf   = null;
  let sepCurX   = sepDefaultX.slice();

  function animateSeps(targetX, targetTxtX, hovI) {
    if (animRaf) { cancelAnimationFrame(animRaf); animRaf = null; }
    const startX  = sepCurX.slice();
    const startTX = txts.map(t => parseFloat(t.getAttribute('x')));
    const t0      = performance.now();

    function step(now) {
      const p = Math.min((now - t0) / DUR_MS, 1);
      const e = 1 - Math.pow(1 - p, 3);  // ease-out cubic
      seps.forEach((sep, si) => {
        const nx = startX[si] + (targetX[si] - startX[si]) * e;
        sepCurX[si] = nx;
        sep.setAttribute('x1', nx); sep.setAttribute('x2', nx);
      });
      txts.forEach((txt, ti) => {
        const nx = startTX[ti] + (targetTxtX[ti] - startTX[ti]) * e;
        txt.setAttribute('x', nx);
        txt.setAttribute('fill', ti === hovI ? C.btn_color_hover : C.btn_color);
      });
      if (p < 1) { animRaf = requestAnimationFrame(step); } else { animRaf = null; }
    }
    animRaf = requestAnimationFrame(step);
  }

  zones.forEach((zone, i) => {
    zone.addEventListener('mouseenter', () => {
      const tSepX = sepDefaultX.map((sx, si) => {
        if (si === i - 1) return sx - EXPAND;
        if (si === i)     return sx + EXPAND;
        return sx;
      });
      const tTxtX = txts.map((_, ti) => {
        const leftX  = ti === 0     ? x      : (tSepX[ti-1] ?? sepDefaultX[ti-1]);
        const rightX = ti === N - 1 ? x + bw : (tSepX[ti]   ?? sepDefaultX[ti]);
        return (leftX + rightX) / 2;
      });
      animateSeps(tSepX, tTxtX, i);
      txts[i].setAttribute('fill', C.btn_color_hover);
    });

    zone.addEventListener('mouseleave', () => {
      const tTxtX = txts.map((_, ti) => x + (ti + 0.5) * cellW);
      animateSeps(sepDefaultX.slice(), tTxtX, -1);
      txts.forEach(t => t.setAttribute('fill', C.btn_color));
    });

    zone.addEventListener('click', () => {
      if (isTransitioning) return;
      // FIX : utilise CONFIG.NAV.actions pour piloter la navigation (cohérence avec DOCS)
      const action = C.actions && C.actions[i];
      if (action === 'collab') navigateTo(2);
      else console.log('Nav:', C.labels[i]);
    });
  });
}

function showNavBar() {
  drawNavBar(true);
  // CRITICAL : supprimer l'opacity inline mise par hideUI, sinon elle bloque le CSS
  elNavBar.style.opacity = '';
  // FIX : setTimeout 16ms (1 frame) plus robuste que double rAF sur mobile
  setTimeout(() => {
    elNavBar.classList.add('visible');
  }, 16);
}

function hideNavBar() {
  hideUI(elNavBar, 900, () => { 
    elNavBar.innerHTML = ''; 
    navBarDrawn = false; 
  });
}


/* ══════════════════════════════════════
   UI PAGE 1 — séquence d'apparition
   flèche → docs_delay → boutons → navbar_delay → menu bas
══════════════════════════════════════ */
/**
 * Affiche l'UI complète de la page 1 (phrénologie)
 * Séquence : flèche → boutons docs (delay 2.2s) → barre nav (delay 1.8s)
 */
function showPage1UI() {
  clearTimers('page1');
  showArrow(1);
  addTimer('page1', setTimeout(() => {
    showDocBtns();
    addTimer('page1', setTimeout(() => showNavBar(), CONFIG.TIMING.navbar_delay));
  }, CONFIG.TIMING.docs_delay));
}

/**
 * Cache tous les éléments UI de la page 1 (phrénologie)
 * Nettoie aussi tous les timers en cours
 */
function hideAllPage1UI() {
  clearTimers('page1');
  hideArrow(); hideDocBtns(); hideNavBar();
}


/* ══════════════════════════════════════
   CERCLES ROMAINS (page collaboration)
   Au survol :
   - Le cercle grossit (scale 1.32, CSS .hovered)
   - Les voisins s'écartent (.push-up / .push-down)
   - Un titre apparaît en bas si configuré
══════════════════════════════════════ */

/* ── Gestion fluide du titre hover bas ──
   Principe : au lieu d'ajouter/retirer .visible directement (ce qui produit
   des saccades quand on passe vite d'un cercle à l'autre), on utilise un
   mini state machine avec un timer de "micro-pause" :
   — si on change de titre rapidement, on cross-fade sans passer par
     l'état invisible (swap direct texte + relance transition)
   — si on quitte sans entrer sur un autre bouton, on fait un vrai fade out ──*/
let _hoverTitleCurrent  = null;   // texte actuellement affiché (ou en cours d'apparition)
let _hoverTitleLeaveTimer = null; // timer du fade-out (annulé si on entre sur un autre btn)

function _applyHoverTitleFont(el) {
  const f = CONFIG.FONTS?.hover_title;
  if (!f) return;
  el.style.fontFamily    = f.family;
  el.style.fontSize      = fontPx('hover_title') + 'px';
  el.style.fontWeight    = f.weight;
  el.style.letterSpacing = f.spacing;
  el.style.fontStyle     = f.style;
  if (f.color) el.style.color = f.color;
}

function _setHoverTitle(titleEl, newText) {
  if (_hoverTitleLeaveTimer !== null) {
    clearTimeout(_hoverTitleLeaveTimer);
    _hoverTitleLeaveTimer = null;
  }

  if (!newText) {
    titleEl.classList.remove('visible');
    _hoverTitleCurrent = null;
    return;
  }

  if (_hoverTitleCurrent === newText) return;

  _applyHoverTitleFont(titleEl);

  if (!_hoverTitleCurrent) {
    titleEl.innerHTML = `<span class="ht-text">${newText}</span>`;
    _hoverTitleCurrent = newText;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      titleEl.classList.add('visible');
    }));
  } else {
    const span = titleEl.querySelector('.ht-text');
    if (!span) {
      titleEl.innerHTML = `<span class="ht-text">${newText}</span>`;
      _hoverTitleCurrent = newText;
      return;
    }
    span.classList.add('fading');
    _hoverTitleCurrent = newText;
    setTimeout(() => {
      // 2. Swap du texte pendant que c'est invisible
      span.innerHTML = newText;
      // 3. Fade in immédiat
      span.classList.remove('fading');
    }, 230); // légèrement > transition opacity 0.22s
  }
}

function _clearHoverTitle(titleEl) {
  if (_hoverTitleLeaveTimer !== null) clearTimeout(_hoverTitleLeaveTimer);
  _hoverTitleLeaveTimer = setTimeout(() => {
    // Fade out global du conteneur (glissement + opacity)
    titleEl.classList.remove('visible');
    _hoverTitleCurrent = null;
    _hoverTitleLeaveTimer = null;
  }, 30);
}

function showRomanCircles() {
  const container = elRomanCircles;
  const titleEl   = elHoverTitle;
  container.innerHTML = '';
  // Réinitialise l'état du titre
  _hoverTitleCurrent    = null;
  _hoverTitleLeaveTimer = null;

  const C    = CONFIG.COLLAB;
  const sz   = Math.max(36, Math.round(vH() * C.circle_size_vh / 100));
  const gap  = Math.max(8,  Math.round(vH() * (C.circle_gap_vh  ?? 3)  / 100));
  const topPct = C.circle_top_pct ?? 50;
  const CIRC = 201;

  const fRoman   = CONFIG.FONTS?.roman;
  const fontSize = fRoman
    ? Math.max(fRoman.size_min, Math.min(fRoman.size_max, Math.round(vW() * fRoman.size_vw / 100)))
    : Math.round(sz * 0.28);
  const fontFamily  = fRoman?.family  ?? 'Cinzel, serif';
  const fontWeight  = fRoman?.weight  ?? 400;
  const fontSpacing = fRoman?.spacing ?? '0.08em';

  /* Position verticale depuis la config */
  container.style.top  = topPct + '%';
  container.style.transform = 'translate(-50%, -50%)';
  /* Espacement horizontal depuis la config */
  container.style.gap  = gap + 'px';

  C.labels.forEach((label, i) => {
    const btn = document.createElement('div');
    btn.className    = 'roman-btn';
    btn.style.width  = sz + 'px';
    btn.style.height = sz + 'px';

    /* fontSize/fontFamily/fontWeight/fontSpacing calculés depuis CONFIG.FONTS.roman */
    btn.innerHTML = `
      <svg width="${sz}" height="${sz}" viewBox="0 0 70 70" overflow="visible">
        <circle class="roman-c" cx="35" cy="35" r="32"
          fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="1.0"
          stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"/>
        <text class="roman-num"
          x="35" y="36"
          font-size="${fontSize}" font-family="${fontFamily}" font-weight="${fontWeight}"
          fill="rgba(255,255,255,0.88)"
          dominant-baseline="middle" text-anchor="middle"
          letter-spacing="${fontSpacing}"
          style="opacity:0;">${label}</text>
      </svg>`;

    btn.addEventListener('click', () => {
      if (isTransitioning) return;
      if (i === 1) startChapitre2Sequence();
      else console.log('Roman:', label);
    });
    container.appendChild(btn);
  });

  container.classList.add('visible');

  const allBtns = Array.from(container.querySelectorAll('.roman-btn'));

  // Animation d'entrée en cascade
  allBtns.forEach((btn, i) => {
    const c   = btn.querySelector('.roman-c');
    const num = btn.querySelector('.roman-num');

    setTimeout(() => {
      c.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke .3s, filter .3s';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        c.setAttribute('stroke-dashoffset', '0');
        setTimeout(() => {
          num.style.transition = 'opacity 0.7s ease, fill .25s ease';
          num.style.opacity    = '1';
        }, 1000);
      }));

      // ── Hover ──
      btn.onmouseenter = () => {
        btn.classList.add('hovered');
        applyNeighborPush(allBtns, i);
        // Lueur dorée sur le cercle
        c.style.stroke = 'rgba(255,230,130,0.95)';
        c.style.filter = 'drop-shadow(0 0 8px rgba(255,210,80,0.70)) drop-shadow(0 0 20px rgba(255,160,20,0.38))';
        num.style.fill = 'rgba(255,220,120,1)';
        // Titre bas — cross-fade fluide
        const title = C.hover_titles && C.hover_titles[i];
        _setHoverTitle(titleEl, title || null);
      };

      btn.onmouseleave = () => {
        btn.classList.remove('hovered');
        clearNeighborPush(allBtns);
        c.style.stroke = 'rgba(255,255,255,0.72)';
        c.style.filter = '';
        num.style.fill = 'rgba(255,255,255,0.88)';
        // Fade out différé (annulé si on entre sur un autre bouton dans les 30ms)
        _clearHoverTitle(titleEl);
      };

    }, i * C.circles_stagger);
  });
}

function hideRomanCircles() {
  const container = elRomanCircles;
  const titleEl   = elHoverTitle;
  container.classList.remove('visible');
  titleEl.classList.remove('visible');
  // Nettoie l'état du cross-fade
  if (_hoverTitleLeaveTimer !== null) { clearTimeout(_hoverTitleLeaveTimer); _hoverTitleLeaveTimer = null; }
  _hoverTitleCurrent = null;
  // Légèrement supérieur à la transition CSS opacity (0.6s)
  setTimeout(() => { container.innerHTML = ''; }, 700);
}

/* ══════════════════════════════════════
   UI PAGE 2 — séquence d'apparition
   flèche gauche → circles_delay → cercles romains
   Audio : fade out musée, fade in S-phrenologie, puis musée revient
══════════════════════════════════════ */
/**
 * Affiche l'UI complète de la page 2 (collaboration)
 * Séquence : flèche → cercles romains (delay 3.5s)
 */
function showPage2UI() {
  clearTimers('page2');
  const bgCollab = elBgCollab;
  const bgChap   = elBgChap;
  bgCollab.style.backgroundImage = 'url("images/collaboration.png")';
  bgCollab.style.opacity = '1';
  bgCollab.style.transform = 'scale(1)';
  bgChap.classList.remove('zoomed');
  bgChap.removeAttribute('style');
  hideSkipButton();
  hideChapitre2Header();
  showArrow(2);
  addTimer('page2', setTimeout(showRomanCircles, CONFIG.COLLAB.circles_delay));
  
  // Audio : muter MuseeLoop et démarrer Collaboration
  fadeMusee(0, 1500);
  startCollabLoop();
}

/* Retour depuis chapitre → espace collab sans rejouer S-phrenologie */
function showPage2UIReturn() {
  clearTimers('page2');
  showArrow(2);
  // Délai court au retour : les cercles réapparaissent rapidement (pas besoin du délai initial)
  addTimer('page2', setTimeout(showRomanCircles, 800));
  // Pas de playPhrenoSound() — on démarre collaboration à la place
  startCollabLoop();
}

/**
 * Cache tous les éléments UI de la page 2 (collaboration)
 * Nettoie aussi tous les timers en cours
 */
function hideAllPage2UI() {
  clearTimers('page2');
  hideArrow();
  hideRomanCircles();
  hideSkipButton();
  hideChapitre2Header();
  stopPhrenoSound();
  // Stopper la musique collaboration et remettre MuseeLoop
  stopCollabLoop(1500);
  fadeMusee(CONFIG.AUDIO.musee_vol, 2000);
}

async function startChapitre2Sequence() {
  if (isTransitioning || currentPage !== 2) return;
  isTransitioning = true;

  clearTimers('page2');
  hideArrow();
  hideRomanCircles();

  const titleEl  = elHoverTitle;
  const bgCollab = elBgCollab;
  const bgChap   = elBgChap;

  titleEl.classList.remove('visible');
  _hoverTitleCurrent = null;

  bgChap.classList.remove('zoomed');
  bgChap.removeAttribute('style');
  hideSkipButton();
  hideChapitre2Header();
  bgCollab.style.transition = 'opacity 1.2s ease, transform 1.6s cubic-bezier(0.25,0.46,0.45,0.94)';
  bgCollab.style.transform  = 'scale(1)';
  
  // Stopper la musique collaboration
  stopCollabLoop(900);

  await fadeVeil(1, 900);

  bgCollab.style.backgroundImage = 'url("images/chapitre2.png")';
  bgCollab.style.transform       = 'scale(1.05)';

  currentPage = 3;
  _torchCentered = true;   // torche figée au centre pendant la séquence phréno
  updateTorchTarget();
  growTorch(torchTargetRadius, 1200);
  swapSiteTitle(true);
  showChapitre2Header();

  await fadeVeil(0, 950);

  // DÉLAI avant de démarrer S-phrenologie.mp3
  await wait(CONFIG.AUDIO.phren_intro_delay || 1500);
  
  // Bouton "Passer" apparaît EN MÊME TEMPS que le son démarre
  showSkipButton();

  const src = await playPhrenoSound();
  if (!src) {
    startChapitre2InteractiveZoom(false);
    return;
  }

  src.addEventListener('ended', () => {
    if (currentPage !== 3) return;
    startChapitre2InteractiveZoom(false);
  }, { once: true });
}


function showChapitre2Header() {
  const sub = elChapSubtitle;
  sub.innerHTML = CONFIG.CHAPITRE2.subtitle;
  const f = CONFIG.FONTS?.subtitle;
  if (f) {
    sub.style.fontFamily    = f.family;
    sub.style.fontSize      = fontPx('subtitle') + 'px';
    sub.style.fontWeight    = f.weight;
    sub.style.letterSpacing = f.spacing;
    sub.style.fontStyle     = f.style;
    /* color gérée par CSS via .visible — ne pas mettre inline pour
       que hideChapitre2Header puisse la retirer proprement         */
  }
  sub.classList.add('visible');
}

function hideChapitre2Header() {
  /* Effacer la couleur inline — sinon elle écrase la transition CSS vers transparent */
  elChapSubtitle.style.color = '';
  elChapSubtitle.classList.remove('visible');
}

function showSkipButton() {
  const container = elSkipBtn;
  const W = Math.max(150, Math.round(vW() * 0.13));
  const H = Math.max(42, Math.round(vH() * 0.052));
  const perim = 2 * (W + H);
  const fontSizeStart = Math.min(15, Math.max(9, Math.round(H * 0.34)));
  container.innerHTML = `
    <div class="skip-wrap" data-clickable="true" aria-label="Passer au chapitre interactif">
      <svg width="${W}" height="${H}">
        <rect class="skip-rect" x="1" y="1" width="${W-2}" height="${H-2}"
          stroke-dasharray="${perim}" stroke-dashoffset="${perim}"/>
        <text class="skip-label" x="${W/2}" y="${H/2}" font-size="${fontSizeStart}">Passer</text>
      </svg>
    </div>`;

  const wrap  = container.querySelector('.skip-wrap');
  const rect  = container.querySelector('.skip-rect');
  const label = container.querySelector('.skip-label');
  unifyFontSize([label], W * 0.72, fontSizeStart);

  wrap.addEventListener('mouseenter', () => {
    wrap.classList.add('hovered');
    applyGoldenHover([rect], [label]);
  });
  wrap.addEventListener('mouseleave', () => {
    wrap.classList.remove('hovered');
    rect.style.stroke = 'rgba(255,255,255,0.72)';
    rect.style.filter = '';
    label.style.fill  = 'rgba(255,255,255,0.82)';
  });
  wrap.addEventListener('click', () => {
    if (currentPage !== 3) return;
    startChapitre2InteractiveZoom(true);
  });

  container.classList.add('visible');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    rect.classList.add('drawn');
    setTimeout(() => label.classList.add('drawn'), 850);
  }));
}

function hideSkipButton() {
  const container = elSkipBtn;
  container.classList.remove('visible');
  setTimeout(() => { if (!container.classList.contains('visible')) container.innerHTML = ''; }, 700);
}

function startChapitre2InteractiveZoom(fromSkip) {
  if (currentPage !== 3) return;
  if (fromSkip) {
    stopPhrenoSound();
    fadeMusee(0, 300);
  }
  /* La torche reste au centre même en mode interactif.
     Elle sera libérée uniquement à la sortie du chapitre (hideAllPage3UI). */
  _torchCentered = true;
  updateTorchTarget();
  growTorch(torchTargetRadius, 800);
  hideSkipButton();
  showPage3UI();
  isTransitioning = false;
}

/* ══════════════════════
   HOTSPOTS CHAPITRE 2
   Les coordonnées sont dans CONFIG.CHAPITRE2.hotspots (haut du script)
══════════════════════ */

const _DBG_FILL   = ['rgba(255,80,80,.28)','rgba(80,160,255,.28)','rgba(80,220,120,.28)',
                     'rgba(255,200,60,.28)','rgba(200,80,255,.28)','rgba(60,220,220,.28)',
                     'rgba(255,140,40,.28)','rgba(180,255,80,.28)'];
const _DBG_STROKE = ['#f88','#6af','#5e8','#fd4','#d6f','#4ee','#fa6','#af5'];

let _activeHotspot    = null;
let _hotspotLeaveTimer = null;

function _showHotspotImg(imgId) {
  if (_hotspotLeaveTimer) { clearTimeout(_hotspotLeaveTimer); _hotspotLeaveTimer = null; }
  if (_activeHotspot === imgId) return;
  if (_activeHotspot) document.getElementById(_activeHotspot).classList.remove('active');
  _activeHotspot = imgId;
  document.getElementById(imgId).classList.add('active');
}

function _hideHotspotImg() {
  if (_hotspotLeaveTimer) clearTimeout(_hotspotLeaveTimer);
  _hotspotLeaveTimer = setTimeout(() => {
    if (_activeHotspot) {
      document.getElementById(_activeHotspot).classList.remove('active');
      _activeHotspot = null;
    }
    _hotspotLeaveTimer = null;
  }, 40);
}

function buildHotspots() {
  const HS      = CONFIG.CHAPITRE2.hotspots;
  const isDbg   = CONFIG.CHAPITRE2.debug;
  const layer   = elHotspotLayer;
  const titleEl = elHoverTitle;
  layer.innerHTML = '';

  /* Réinitialise l'état du titre (même logique que showRomanCircles) */
  _hoverTitleCurrent    = null;
  _hoverTitleLeaveTimer = null;

  HS.forEach((h, i) => {
    const zone = document.createElement('div');
    zone.className     = 'hotspot-zone';
    zone.dataset.hspot = h.img;
    zone.style.left    = h.l + '%';
    zone.style.top     = h.t + '%';
    zone.style.width   = h.w + '%';
    zone.style.height  = h.h + '%';

    /* Label affiché : nombre → "Zone N", texte → texte tel quel */
    const displayLabel = /^\d+$/.test(h.label.trim())
      ? 'Zone\u00A0' + h.label.trim()
      : h.label;

    if (isDbg) {
      zone.style.background   = _DBG_FILL[i % _DBG_FILL.length];
      zone.style.border       = '1.5px dashed ' + _DBG_STROKE[i % _DBG_STROKE.length];
      zone.style.boxSizing    = 'border-box';
      zone.style.borderRadius = '2px';
      const lbl = document.createElement('span');
      lbl.textContent = h.label;
      lbl.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;' +
        'justify-content:center;font-family:monospace;font-size:clamp(8px,.9vw,11px);' +
        'font-weight:bold;color:' + _DBG_STROKE[i % _DBG_STROKE.length] + ';' +
        'text-shadow:0 1px 3px #000;pointer-events:none;text-align:center;padding:2px;';
      zone.appendChild(lbl);
    }

    zone.addEventListener('mouseenter', () => {
      _showHotspotImg(h.img);
      cursorEl.classList.add('active', 'hotspot');
      _setHoverTitle(titleEl, displayLabel);
      if (isDbg) _dbgHighlight(h.img, true);
    });

    zone.addEventListener('mouseleave', () => {
      _hideHotspotImg();
      cursorEl.classList.remove('hotspot');
      /* Si un player est actif sur ce hotspot, le titre reste affiché */
      if (_playerActive && _playerHoverTitle === displayLabel) {
        // ne pas effacer — le titre reste pendant la lecture
      } else {
        _clearHoverTitle(titleEl);
      }
      if (isDbg) _dbgHighlight(h.img, false);
    });

    zone.addEventListener('click', () => {
      if (h.media) {
        /* Mémorise le titre pour qu'il reste pendant la lecture */
        _playerHoverTitle = displayLabel;
        /* Annule le timer de disparition du titre si on vient de quitter la zone */
        if (_hoverTitleLeaveTimer !== null) {
          clearTimeout(_hoverTitleLeaveTimer);
          _hoverTitleLeaveTimer = null;
        }
        openMediaPlayer(h.media, h.label);
      }
    });
    layer.appendChild(zone);
  });

  if (isDbg) _dbgBuildPanel();
  else        _dbgRemovePanel();
}

function _dbgBuildPanel() {
  _dbgRemovePanel();
  const HS = CONFIG.CHAPITRE2.hotspots;
  const panel = document.createElement('div');
  panel.id = '_dbg_panel';
  panel.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
    'background:rgba(0,0,0,0.88);border-top:1px solid rgba(255,255,255,0.12);' +
    'font-family:monospace;font-size:11px;padding:6px 10px 8px;pointer-events:auto;';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;';
  header.innerHTML = '<span style="color:rgba(255,220,80,.9);letter-spacing:.1em;font-size:10px;text-transform:uppercase;">' +
    '&#10006; Debug Hotspots &#8212; CONFIG.CHAPITRE2.hotspots</span>';
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copier CONFIG';
  copyBtn.style.cssText = 'background:rgba(255,220,80,.15);border:1px solid rgba(255,220,80,.4);' +
    'color:rgba(255,220,80,.9);font-family:monospace;font-size:9px;cursor:pointer;padding:2px 9px;border-radius:3px;';
  copyBtn.addEventListener('click', _dbgCopy);
  header.appendChild(copyBtn);
  panel.appendChild(header);

  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px 16px;';
  HS.forEach((h, i) => {
    const row = document.createElement('div');
    row.id = '_dbg_row_' + h.img;
    row.style.cssText = 'display:flex;align-items:center;gap:5px;padding:2px 4px;' +
      'border-left:3px solid ' + _DBG_STROKE[i % _DBG_STROKE.length] + ';border-radius:2px;transition:background .12s;';
    row.innerHTML =
      '<span style="color:' + _DBG_STROKE[i % _DBG_STROKE.length] + ';font-weight:bold;min-width:90px;">' + h.label + '</span>' +
      '<span style="color:rgba(180,255,140,.9);">' +
        'l:<b>' + h.l + '</b>  t:<b>' + h.t + '</b>  w:<b>' + h.w + '</b>  h:<b>' + h.h + '</b>' +
      '</span>';
    grid.appendChild(row);
  });
  panel.appendChild(grid);

  const outWrap = document.createElement('div');
  outWrap.id = '_dbg_outwrap';
  outWrap.style.display = 'none';
  outWrap.style.marginTop = '5px';
  const ta = document.createElement('textarea');
  ta.id = '_dbg_out'; ta.readOnly = true;
  ta.style.cssText = 'width:100%;height:96px;background:rgba(0,0,0,.6);color:rgba(180,255,140,.95);' +
    'font-family:monospace;font-size:10px;border:1px solid rgba(255,255,255,.2);padding:5px;border-radius:3px;resize:vertical;';
  const hint = document.createElement('div');
  hint.textContent = 'Copiez ce bloc et remplacez hotspots:[...] dans CONFIG.CHAPITRE2';
  hint.style.cssText = 'color:rgba(255,255,255,.35);font-size:9px;margin-top:2px;';
  outWrap.appendChild(ta); outWrap.appendChild(hint);
  panel.appendChild(outWrap);
  document.body.appendChild(panel);
}

function _dbgRemovePanel() {
  const p = document.getElementById('_dbg_panel');
  if (p) p.remove();
}

function _dbgHighlight(imgId, on) {
  const row = document.getElementById('_dbg_row_' + imgId);
  if (row) row.style.background = on ? 'rgba(255,255,255,.08)' : '';
}

function _dbgCopy() {
  const HS = CONFIG.CHAPITRE2.hotspots;
  const lines = HS.map(h =>
    "      { img: '" + h.img + "', label: '" + h.label + "'," +
    ' '.repeat(Math.max(1, 14 - h.label.length)) +
    'l: ' + String(h.l).padStart(2) + ', t: ' + String(h.t).padStart(2) +
    ', w: ' + String(h.w).padStart(2) + ', h: ' + String(h.h).padStart(2) + ' },'
  ).join('\n');
  const blob = '    hotspots : [\n' + lines + '\n    ],';
  const wrap = document.getElementById('_dbg_outwrap');
  const out  = document.getElementById('_dbg_out');
  out.value = blob;
  wrap.style.display = 'block';
  out.select();
  try {
    document.execCommand('copy');
    out.style.borderColor = 'rgba(80,255,120,.7)';
    setTimeout(() => out.style.borderColor = 'rgba(255,255,255,.2)', 1200);
  } catch(e) {}
}

/* ══════════════════════
   PLAYER MÉDIA
   Audio (mp3) : rectangle large + waveform + play/pause
   Vidéo (mp4) : rectangle carré + vidéo + barre + play/pause
   Tous les paramètres visuels sont dans CONFIG.PLAYER
══════════════════════ */

let _playerActive  = false;
let _playerAudio   = null;
let _playerVideo   = null;
let _analyser      = null;
let _waveRaf       = null;
let _torchBefore   = 0;
let _playerHoverTitle = null;  // titre affiché pendant la lecture d'un hotspot

function _isVideo(src) { return /\.mp4$/i.test(src); }

function _getVideoRectFromWidth(videoWidthFrac) {
  const P = CONFIG.PLAYER;
  const W = vW();
  const H = vH();

  let rw = W * videoWidthFrac;
  let rh = rw * P.video_ratio;

  if (rh > H * 0.80) {
    rh = H * 0.80;
    rw = rh / P.video_ratio;
  }

  return {
    rw,
    rh,
    rx: (W - rw) / 2,
    ry: (H - rh) / 2
  };
}

/* Retourne les dimensions centrées du player audio */
function _getAudioRect() {
  const P = CONFIG.PLAYER;
  const W = vW();
  const H = vH();
  let rw = W * P.audio_w;
  let rh = H * P.audio_h;
  if (rh > H * 0.24) rh = H * 0.24;
  if (rw > W * 0.82) rw = W * 0.82;
  return { rw, rh, rx: (W - rw) / 2, ry: (H - rh) / 2 };
}

function _applyVideoScale() {
  if (!_playerActive || !_playerVideoLayout || !_playerVideo) return;

  const P = CONFIG.PLAYER;

  if (_playerVideoScaleAnimRaf) {
    cancelAnimationFrame(_playerVideoScaleAnimRaf);
    _playerVideoScaleAnimRaf = null;
  }

  const start = _playerVideoLayout.videoWidthFrac ?? P.video_min_w;
  const nextExpanded = !_playerVideoLayout.isExpanded;
  const end = nextExpanded ? P.video_max_w : P.video_min_w;

  _playerVideoLayout.isExpanded = nextExpanded;
  _playerVideoLayout.targetWidthFrac = end;

  /* Morphing des 4 coins : vers l'intérieur (compress) ou l'extérieur (expand) */
  if (_playerVideoScaleIcon) {
    const circ   = _playerVideoScaleCirc;
    const cx     = parseFloat(circ?.getAttribute('cx') ?? rightCX);
    const cy     = parseFloat(circ?.getAttribute('cy') ?? bCY);
    const r      = parseFloat(circ?.getAttribute('r')  ?? bR);
    const armC   = r * 0.38;
    const distBig   = r * 0.52;
    const distSmall = r * 0.24;
    const dist   = nextExpanded ? distSmall : distBig;
    const cdefs  = [[-1,-1],[1,-1],[1,1],[-1,1]];
    Array.from(_playerVideoScaleIcon.querySelectorAll('path')).forEach((p, i) => {
      const [sx, sy] = cdefs[i];
      const px = cx + sx * dist;
      const py = cy + sy * dist;
      p.setAttribute('d', `M${px},${py + sy*armC} L${px},${py} L${px + sx*armC},${py}`);
    });
  }

  /* Titre témoignage (bas) : disparaît à l'agrandissement, revient à la réduction.
     elChapSubtitle (haut gauche) n'est PAS touché ici — il est géré par la navigation. */
  if (nextExpanded) {
    elHoverTitle.classList.remove('visible');
    _hoverTitleCurrent = null;
  } else {
    /* Titre témoignage : revient si un titre est mémorisé */
    if (_playerHoverTitle) {
      setTimeout(() => {
        if (_playerActive && _playerHoverTitle) _setHoverTitle(elHoverTitle, _playerHoverTitle);
      }, 200);
    }
  }

  const duration = P.video_scale_duration_ms ?? 760;
  const easePower = P.video_scale_ease_power ?? 2.6;
  const t0 = performance.now();

  function step(now) {
    if (!_playerActive || !_playerVideoLayout || !_playerVideo) {
      _playerVideoScaleAnimRaf = null;
      return;
    }

    const p = Math.min((now - t0) / duration, 1);
    const e = 1 - Math.pow(1 - p, easePower);

    _playerVideoLayout.videoWidthFrac = start + (end - start) * e;
    handleMediaPlayerResize();

    if (p < 1) {
      _playerVideoScaleAnimRaf = requestAnimationFrame(step);
    } else {
      _playerVideoLayout.videoWidthFrac = end;
      _playerVideoScaleAnimRaf = null;
      handleMediaPlayerResize();
    }
  }

  _playerVideoScaleAnimRaf = requestAnimationFrame(step);
}

function _updateVideoSeekUI() {
  if (!_playerVideo || !_playerVideoSeekFill) return;
  const dur = _playerVideo.duration;
  const cur = _playerVideo.currentTime;

  let ratio = 0;
  if (isFinite(dur) && dur > 0) ratio = Math.max(0, Math.min(1, cur / dur));

  _playerVideoSeekFill.setAttribute('x2',
    parseFloat(_playerVideoSeekBase.getAttribute('x1')) +
    (parseFloat(_playerVideoSeekBase.getAttribute('x2')) - parseFloat(_playerVideoSeekBase.getAttribute('x1'))) * ratio
  );
}

function openMediaPlayer(src, label) {
  ++_closeSessionId;
  if (_playerActive) closeMediaPlayer();

  stopSanzaLoop(CONFIG.AUDIO.sanza_fade_out);

  _playerActive = true;
  _playerSrc    = src;
  _torchBefore  = torchTargetRadius;

  const P = CONFIG.PLAYER;
  const W = vW();
  const H = vH();
  const isVid = _isVideo(src);

  if (isVid) {
    _playerVideoLayout = {
      videoWidthFrac: P.video_min_w,
      targetWidthFrac: P.video_min_w,
      isExpanded: false
    };
  } else {
    _playerVideoLayout = null;
  }

  /* Facteur de réduction torche : chapitre 2 a sa propre valeur */
  const torchDim = (currentPage === 3)
    ? (CONFIG.CHAPITRE2.torch_media_dim ?? 0.8)
    : P.torch_dim;
  growTorch(torchTargetRadius * torchDim, P.torch_ms);

  /* Disparition élégante de la flèche et du bouton fullscreen */
  const _fadeMs = P.torch_ms;
  arrowEl.style.transition = 'opacity ' + (_fadeMs / 1000) + 's ease';
  arrowEl.style.opacity    = '0';
  fsBtn.style.transition   = 'opacity ' + (_fadeMs / 1000) + 's ease';
  fsBtn.style.opacity      = '0';

  let rw, rh, rx, ry;
  if (isVid) {
    const vr = _getVideoRectFromWidth(_playerVideoLayout.videoWidthFrac);
    ({ rw, rh, rx, ry } = vr);
  } else {
    ({ rw, rh, rx, ry } = _getAudioRect());
  }

  const el = elMediaPlayer;
  el.innerHTML = '';

  const backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:absolute;inset:0;z-index:29;';
  el.appendChild(backdrop);

  const ns = 'http://www.w3.org/2000/svg';

  /* SVG principal — plein écran, contient le rect du cadre + boutons audio/vidéo.
     On stocke la référence pour pouvoir redimensionner au resize.              */
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width',  '100%');
  svg.setAttribute('height', '100%');
  svg.style.cssText = 'position:absolute;inset:0;z-index:30;pointer-events:none;';
  _playerMainSvg = svg;

  const perim = 2 * (rw + rh);
  const rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('x', rx);
  rect.setAttribute('y', ry);
  rect.setAttribute('width', rw);
  rect.setAttribute('height', rh);
  const rectBgOpacity = isVid ? P.video_bg_opacity : P.audio_bg_opacity;
  rect.setAttribute('fill', 'rgba(0,0,0,' + rectBgOpacity + ')');
  rect.setAttribute('stroke', P.stroke);
  rect.setAttribute('stroke-width', '1.2');
  rect.style.strokeDasharray = perim;
  rect.style.strokeDashoffset = perim;
  rect.style.transition = 'stroke-dashoffset ' + P.draw_speed + 's cubic-bezier(0.4,0,0.2,1)';
  svg.appendChild(rect);
  _playerRect = rect;

  el.appendChild(svg);

  /* ── Croix de fermeture ────────────────────────────────────────────────
     Son propre SVG position:fixed taille arrowSizePx(), placé top:3.5vh/right:3.5vw.
     Coordonnées LOCALES au SVG (centre = cR,cR) → jamais clippé par le SVG principal.
     Scale au hover sur le <g> interne, transform-origin centré.                      */
  const cSz      = arrowSizePx();
  const cR       = cSz / 2;
  const cMarginR = Math.round(W * 0.035);
  const cMarginT = Math.round(H * 0.035);
  const closeDelay = P.draw_speed + P.close_delay;
  const cPer     = Math.round(2 * Math.PI * cR);
  const csR      = cR * 0.46;
  const cx0 = cR, cy0 = cR;   // centre dans le repère local du closeSvg

  const closeSvg = document.createElementNS(ns, 'svg');
  closeSvg.setAttribute('width',   cSz);
  closeSvg.setAttribute('height',  cSz);
  closeSvg.setAttribute('overflow', 'visible');
  closeSvg.style.cssText =
    'position:absolute;z-index:32;pointer-events:none;' +
    'right:' + cMarginR + 'px;top:' + cMarginT + 'px;' +
    'width:' + cSz + 'px;height:' + cSz + 'px;';
  _playerCloseSvg = closeSvg;

  const closeGroup = document.createElementNS(ns, 'g');
  closeGroup.style.transformOrigin = cx0 + 'px ' + cy0 + 'px';
  closeGroup.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
  _playerCloseGroup = closeGroup;

  const closeCirc = document.createElementNS(ns, 'circle');
  closeCirc.setAttribute('cx', cx0);
  closeCirc.setAttribute('cy', cy0);
  closeCirc.setAttribute('r',  cR - 1);
  closeCirc.setAttribute('fill', 'none');
  closeCirc.setAttribute('stroke', P.stroke);
  closeCirc.setAttribute('stroke-width', '1.2');
  closeCirc.style.strokeDasharray  = cPer;
  closeCirc.style.strokeDashoffset = cPer;
  closeCirc.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1) ' + closeDelay + 's, stroke 0.2s, filter 0.2s';
  _playerCloseCirc = closeCirc;

  const cross = document.createElementNS(ns, 'g');
  cross.setAttribute('stroke', P.stroke);
  cross.setAttribute('stroke-width', '1.4');
  cross.setAttribute('stroke-linecap', 'round');
  cross.style.opacity    = '0';
  cross.style.transition = 'opacity 0.3s ease ' + (closeDelay + 0.55) + 's, stroke 0.2s, filter 0.2s';
  const l1 = document.createElementNS(ns, 'line');
  l1.setAttribute('x1', cx0 - csR); l1.setAttribute('y1', cy0 - csR);
  l1.setAttribute('x2', cx0 + csR); l1.setAttribute('y2', cy0 + csR);
  const l2 = document.createElementNS(ns, 'line');
  l2.setAttribute('x1', cx0 + csR); l2.setAttribute('y1', cy0 - csR);
  l2.setAttribute('x2', cx0 - csR); l2.setAttribute('y2', cy0 + csR);
  cross.appendChild(l1); cross.appendChild(l2);
  _playerCloseCross = cross;

  closeGroup.appendChild(closeCirc);
  closeGroup.appendChild(cross);
  closeSvg.appendChild(closeGroup);
  el.appendChild(closeSvg);

  const closeHit = document.createElement('div');
  closeHit.dataset.clickable = '1';
  closeHit.style.cssText =
    'position:absolute;z-index:33;border-radius:50%;cursor:none;' +
    'width:' + cSz + 'px;height:' + cSz + 'px;' +
    'right:' + cMarginR + 'px;top:' + cMarginT + 'px;';
  closeHit.addEventListener('click', () => _cinematicClose());
  closeHit.addEventListener('mouseenter', () => {
    closeGroup.style.transform = 'scale(1.22)';
    closeCirc.setAttribute('stroke', P.btn_color_hover);
    closeCirc.style.filter = 'drop-shadow(0 0 7px rgba(255,210,80,0.80)) drop-shadow(0 0 20px rgba(255,170,30,0.50))';
    cross.setAttribute('stroke', P.btn_color_hover);
    cross.style.filter    = 'drop-shadow(0 0 7px rgba(255,210,80,0.80)) drop-shadow(0 0 20px rgba(255,170,30,0.50))';
  });
  closeHit.addEventListener('mouseleave', () => {
    closeGroup.style.transform = 'scale(1)';
    closeCirc.setAttribute('stroke', P.stroke); closeCirc.style.filter = '';
    cross.setAttribute('stroke', P.stroke);     cross.style.filter = '';
  });
  el.appendChild(closeHit);
  _playerCloseHit = closeHit;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    rect.style.strokeDashoffset = '0';
    closeCirc.style.strokeDashoffset = '0';
    cross.style.opacity = '1';
  }));

  if (isVid) _buildVideoPlayer(el, src, rx, ry, rw, rh);
  else _buildAudioPlayer(el, src, rx, ry, rw, rh);
}

/* ── AUDIO ─────────────────────────────────────────────────────────── */
function _buildAudioPlayer(el, src, rx, ry, rw, rh) {
  const P  = CONFIG.PLAYER;
  const ns = 'http://www.w3.org/2000/svg';
  const W  = vW();
  const H  = vH();

  const audio = new Audio(src);
  audio.preload = 'auto';
  _playerAudio = audio;

  const btnZoneW = rh;
  const bR   = rh * 0.28;
  const bCX  = rx + btnZoneW * 0.5;
  const bCY  = ry + rh * 0.5;
  const bPer = 2 * Math.PI * bR;
  const btnDelay = P.draw_speed * 0.4;

  const waveGap = rh * P.audio_wave_gap;
  const waveX = rx + btnZoneW + waveGap;
  const waveW = rw - btnZoneW - waveGap * 2;
  const waveH = rh * P.audio_wave_h;
  const waveY = ry + (rh - waveH) / 2;

  const wc = document.createElement('canvas');
  wc.width  = Math.max(2, Math.round(waveW));
  wc.height = Math.max(2, Math.round(waveH));
  wc.style.cssText =
    'position:absolute;z-index:31;pointer-events:none;opacity:0;' +
    'left:' + waveX + 'px;top:' + waveY + 'px;' +
    'width:' + waveW + 'px;height:' + waveH + 'px;' +
    'transition:opacity 0.5s ease ' + (P.draw_speed + 0.2) + 's;';
  el.appendChild(wc);
  _playerWaveCanvas = wc;
  requestAnimationFrame(() => wc.style.opacity = '1');

  const bSvg = document.createElementNS(ns, 'svg');
  bSvg.setAttribute('width', '100%');
  bSvg.setAttribute('height', '100%');
  bSvg.style.cssText = 'position:absolute;inset:0;z-index:33;pointer-events:none;';

  const bCirc = document.createElementNS(ns, 'circle');
  bCirc.setAttribute('cx', bCX);
  bCirc.setAttribute('cy', bCY);
  bCirc.setAttribute('r', bR);
  bCirc.setAttribute('fill', 'none');
  bCirc.setAttribute('stroke', P.btn_color);
  bCirc.setAttribute('stroke-width', '1.0');
  bCirc.style.strokeDasharray = bPer;
  bCirc.style.strokeDashoffset = bPer;
  bCirc.style.transition =
    'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1) ' + btnDelay + 's, stroke 0.2s, filter 0.2s';
  bSvg.appendChild(bCirc);
  _playerPlayCircle = bCirc;

  const ic = bR * 0.42;
  const playIcon = document.createElementNS(ns, 'polygon');
  playIcon.setAttribute(
    'points',
    (bCX - ic * 0.65) + ',' + (bCY - ic) + ' ' +
    (bCX - ic * 0.65) + ',' + (bCY + ic) + ' ' +
    (bCX + ic * 1.1) + ',' + bCY
  );
  playIcon.setAttribute('fill', P.btn_color);
  playIcon.style.opacity = '0';
  playIcon.style.transition = 'opacity 0.2s ease, fill 0.2s, filter 0.2s';
  bSvg.appendChild(playIcon);
  _playerPlayIcon = playIcon;

  const pauseIcon = document.createElementNS(ns, 'g');
  pauseIcon.setAttribute('fill', P.btn_color);
  pauseIcon.style.opacity = '0';
  pauseIcon.style.transition = 'opacity 0.2s ease, fill 0.2s, filter 0.2s';

  const prw = ic * 0.52;
  const gap = ic * 0.34;

  const bar1 = document.createElementNS(ns, 'rect');
  bar1.setAttribute('x', bCX - gap - prw);
  bar1.setAttribute('y', bCY - ic);
  bar1.setAttribute('width', prw);
  bar1.setAttribute('height', ic * 2);

  const bar2 = document.createElementNS(ns, 'rect');
  bar2.setAttribute('x', bCX + gap);
  bar2.setAttribute('y', bCY - ic);
  bar2.setAttribute('width', prw);
  bar2.setAttribute('height', ic * 2);

  pauseIcon.appendChild(bar1);
  pauseIcon.appendChild(bar2);
  bSvg.appendChild(pauseIcon);
  _playerPauseIcon = pauseIcon;

  el.appendChild(bSvg);

  const btnHit = document.createElement('div');
  btnHit.dataset.clickable = '1';
  btnHit.style.cssText =
    'position:absolute;z-index:34;border-radius:50%;cursor:none;' +
    'width:' + (bR * 3.2) + 'px;height:' + (bR * 3.2) + 'px;' +
    'left:' + (bCX - bR * 1.6) + 'px;top:' + (bCY - bR * 1.6) + 'px;';
  el.appendChild(btnHit);
  _playerPlayHit = btnHit;

  function setPlaying(on) {
    playIcon.style.opacity  = on ? '0' : '1';
    pauseIcon.style.opacity = on ? '1' : '0';
  }

  btnHit.addEventListener('mouseenter', () => {
    bCirc.setAttribute('stroke', P.btn_color_hover);
    bCirc.style.filter = 'drop-shadow(0 0 6px rgba(255,210,80,0.8))';
    playIcon.setAttribute('fill', P.btn_color_hover);
    pauseIcon.setAttribute('fill', P.btn_color_hover);
  });

  btnHit.addEventListener('mouseleave', () => {
    bCirc.setAttribute('stroke', P.btn_color);
    bCirc.style.filter = '';
    playIcon.setAttribute('fill', P.btn_color);
    pauseIcon.setAttribute('fill', P.btn_color);
  });

  btnHit.addEventListener('click', async () => {
    if (audio.paused) {
      try { await audio.play(); } catch(e) {}
    } else {
      audio.pause();
    }
  });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    bCirc.style.strokeDashoffset = '0';
  }));

  const ac = getAudioCtx();
  const source = ac.createMediaElementSource(audio);
  const analyser = ac.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  analyser.connect(ac.destination);
  _analyser = analyser;

  audio.addEventListener('play', () => {
    setPlaying(true);
    _drawWaveform(wc, analyser, P);
  });

  audio.addEventListener('pause', () => {
    setPlaying(false);
    if (_waveRaf) {
      cancelAnimationFrame(_waveRaf);
      _waveRaf = null;
    }
    const ctx2 = wc.getContext('2d');
    ctx2.clearRect(0, 0, wc.width, wc.height);
  });

  audio.addEventListener('ended', () => {
    setPlaying(false);
    if (_waveRaf) {
      cancelAnimationFrame(_waveRaf);
      _waveRaf = null;
    }
    const ctx2 = wc.getContext('2d');
    ctx2.clearRect(0, 0, wc.width, wc.height);
    setTimeout(() => _cinematicClose(), 400);
  });

  requestAnimationFrame(() => requestAnimationFrame(async () => {
    try {
      await audio.play();
    } catch(e) {}
  }));
}

function _drawWaveform(canvas, analyser, P) {
  const ctx2 = canvas.getContext('2d');
  const buf  = new Uint8Array(analyser.frequencyBinCount);
  function draw() {
    _waveRaf = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(buf);
    const cW = canvas.width, cH = canvas.height;
    ctx2.clearRect(0, 0, cW, cH);
    ctx2.beginPath();
    ctx2.strokeStyle = P.wave_color;
    ctx2.lineWidth   = P.wave_width;
    const step = cW / buf.length;
    buf.forEach((v, i) => {
      const x = i * step;
      const y = ((v/128)-1) * (cH*0.42) + cH/2;
      i === 0 ? ctx2.moveTo(x,y) : ctx2.lineTo(x,y);
    });
    ctx2.stroke();
  }
  draw();
}


/* ── VIDÉO ──────────────────────────────────────────────────────────── */
function _buildVideoPlayer(el, src, rx, ry, rw, rh) {
  const P   = CONFIG.PLAYER;
  const ns  = 'http://www.w3.org/2000/svg';
  const W   = vW();
  const H   = vH();

  const inset = Math.max(1, Math.round(Math.min(W, H) * P.media_inset));
  const ctrlH = rh * P.video_ctrl_h;
  const vidH  = rh - ctrlH;
  const sepY  = ry + vidH;

  const video = document.createElement('video');
  video.src = src;
  video.preload = 'auto';
  video.playsInline = true;
  _playerVideo = video;

  video.style.cssText =
    'position:absolute;z-index:31;object-fit:contain;background:#000;' +
    'opacity:0;transition:opacity 0.5s ease ' + (P.draw_speed + 0.2) + 's;' +
    'left:' + (rx + inset) + 'px;top:' + (ry + inset) + 'px;' +
    'width:' + Math.max(2, rw - inset * 2) + 'px;' +
    'height:' + Math.max(2, vidH - inset) + 'px;';
  el.appendChild(video);
  requestAnimationFrame(() => video.style.opacity = '1');

  const cSvg = document.createElementNS(ns, 'svg');
  cSvg.setAttribute('width', '100%');
  cSvg.setAttribute('height', '100%');
  cSvg.style.cssText = 'position:absolute;inset:0;z-index:33;pointer-events:none;';

  const sepLine = document.createElementNS(ns, 'line');
  sepLine.setAttribute('x1', rx);
  sepLine.setAttribute('y1', sepY);
  sepLine.setAttribute('x2', rx + rw);
  sepLine.setAttribute('y2', sepY);
  sepLine.setAttribute('stroke', P.stroke);
  sepLine.setAttribute('stroke-width', '1');
  sepLine.style.opacity = '0';
  sepLine.style.transition = 'opacity 0.35s ease ' + (P.draw_speed + 0.15) + 's';
  cSvg.appendChild(sepLine);
  _playerVideoSepLine = sepLine;

  const btnDelay = P.draw_speed * 0.5;
  const sidePad  = rw * 0.03;
  const bR       = ctrlH * 0.30;
  const leftCX   = rx + sidePad + bR;
  const rightCX  = rx + rw - sidePad - bR;
  const bCY      = ry + vidH + ctrlH * 0.5;
  const bPer     = 2 * Math.PI * bR;

  /* Bouton play/pause gauche */
  const playCirc = document.createElementNS(ns, 'circle');
  playCirc.setAttribute('cx', leftCX);
  playCirc.setAttribute('cy', bCY);
  playCirc.setAttribute('r', bR);
  playCirc.setAttribute('fill', 'none');
  playCirc.setAttribute('stroke', P.btn_color);
  playCirc.setAttribute('stroke-width', '1.0');
  playCirc.style.strokeDasharray = bPer;
  playCirc.style.strokeDashoffset = bPer;
  playCirc.style.transition =
    'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1) ' + btnDelay + 's, stroke 0.2s, filter 0.2s';
  cSvg.appendChild(playCirc);
  _playerPlayCircle = playCirc;

  const ic = bR * 0.38;
  const playIcon = document.createElementNS(ns, 'polygon');
  playIcon.setAttribute(
    'points',
    (leftCX - ic * 0.7) + ',' + (bCY - ic) + ' ' +
    (leftCX - ic * 0.7) + ',' + (bCY + ic) + ' ' +
    (leftCX + ic * 1.1) + ',' + bCY
  );
  playIcon.setAttribute('fill', P.btn_color);
  playIcon.style.opacity = '0';
  playIcon.style.transition = 'opacity 0.2s ease, fill 0.2s, filter 0.2s';
  cSvg.appendChild(playIcon);
  _playerPlayIcon = playIcon;

  const pauseIcon = document.createElementNS(ns, 'g');
  pauseIcon.setAttribute('fill', P.btn_color);
  pauseIcon.style.opacity = '0';
  pauseIcon.style.transition = 'opacity 0.2s ease, fill 0.2s, filter 0.2s';

  const prw = ic * 0.52;
  const gap = ic * 0.34;

  const bar1 = document.createElementNS(ns, 'rect');
  bar1.setAttribute('x', leftCX - gap - prw);
  bar1.setAttribute('y', bCY - ic);
  bar1.setAttribute('width', prw);
  bar1.setAttribute('height', ic * 2);

  const bar2 = document.createElementNS(ns, 'rect');
  bar2.setAttribute('x', leftCX + gap);
  bar2.setAttribute('y', bCY - ic);
  bar2.setAttribute('width', prw);
  bar2.setAttribute('height', ic * 2);

  pauseIcon.appendChild(bar1);
  pauseIcon.appendChild(bar2);
  cSvg.appendChild(pauseIcon);
  _playerPauseIcon = pauseIcon;

  /* ── Bouton agrandissement — 4 coins en L, style dev_loop ────────────
     Deux groupes superposés (expand / compress).
     Chaque coin est un path en L animé via stroke-dashoffset + stagger.
     Au toggle : le groupe actif se dessine (offset 0→0), l'autre s'efface (offset 0→len). */
  const sizeCirc = document.createElementNS(ns, 'circle');
  sizeCirc.setAttribute('cx', rightCX);
  sizeCirc.setAttribute('cy', bCY);
  sizeCirc.setAttribute('r', bR);
  sizeCirc.setAttribute('fill', 'none');
  sizeCirc.setAttribute('stroke', P.btn_color);
  sizeCirc.setAttribute('stroke-width', '1.0');
  sizeCirc.style.strokeDasharray  = bPer;
  sizeCirc.style.strokeDashoffset = bPer;
  sizeCirc.style.transition =
    'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1) ' + btnDelay + 's, stroke 0.2s, filter 0.2s';
  cSvg.appendChild(sizeCirc);
  _playerVideoScaleCirc = sizeCirc;

  const arm = bR * 0.38;        // longueur bras du L
  const offBig  = bR * 0.52;   // coins écartés = état expand (vidéo petite)
  const offSmall = bR * 0.24;  // coins serrés  = état compress (vidéo grande)
  const cornerDefs = [[-1,-1],[1,-1],[1,1],[-1,1]];

  /* Calcule le path d'un coin L dans un état donné */
  function _cPathState(cx, cy, sx, sy, dist) {
    const px = cx + sx * dist;
    const py = cy + sy * dist;
    return `M${px},${py + sy*arm} L${px},${py} L${px + sx*arm},${py}`;
  }

  const sizeGroup = document.createElementNS(ns, 'g');
  sizeGroup.style.opacity    = '0';
  sizeGroup.style.transition = 'opacity 0.15s ease';
  _playerVideoScaleIcon = sizeGroup;

  cornerDefs.forEach(([sx, sy], i) => {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', _cPathState(rightCX, bCY, sx, sy, offBig));
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', P.btn_color);
    p.setAttribute('stroke-width', '1.5');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    /* Transition sur d (morphing) + stagger léger */
    p.style.transition =
      `d 0.35s cubic-bezier(0.4,0,0.2,1) ${i * 0.03}s,` +
      `stroke 0.2s, filter 0.2s`;
    sizeGroup.appendChild(p);
  });
  cSvg.appendChild(sizeGroup);

  /* Barre de défilement */
  const seekX1 = leftCX + bR + rw * 0.05;
  const seekX2 = rightCX - bR - rw * 0.05;
  const seekY  = bCY;
  const seekWrapH = ctrlH * P.video_seek_h;

  const seekBase = document.createElementNS(ns, 'line');
  seekBase.setAttribute('x1', seekX1);
  seekBase.setAttribute('y1', seekY);
  seekBase.setAttribute('x2', seekX2);
  seekBase.setAttribute('y2', seekY);
  seekBase.setAttribute('stroke', 'rgba(255,255,255,0.28)');
  seekBase.setAttribute('stroke-width', P.video_seek_thick);
  seekBase.setAttribute('stroke-linecap', 'round');
  cSvg.appendChild(seekBase);
  _playerVideoSeekBase = seekBase;

  const seekFill = document.createElementNS(ns, 'line');
  seekFill.setAttribute('x1', seekX1);
  seekFill.setAttribute('y1', seekY);
  seekFill.setAttribute('x2', seekX1);
  seekFill.setAttribute('y2', seekY);
  seekFill.setAttribute('stroke', P.stroke);
  seekFill.setAttribute('stroke-width', P.video_seek_thick);
  seekFill.setAttribute('stroke-linecap', 'round');
  cSvg.appendChild(seekFill);
  _playerVideoSeekFill = seekFill;

  el.appendChild(cSvg);

  const playHit = document.createElement('div');
  playHit.dataset.clickable = '1';
  playHit.style.cssText =
    'position:absolute;z-index:34;border-radius:50%;cursor:none;' +
    'width:' + (bR * 3.2) + 'px;height:' + (bR * 3.2) + 'px;' +
    'left:' + (leftCX - bR * 1.6) + 'px;top:' + (bCY - bR * 1.6) + 'px;';
  el.appendChild(playHit);
  _playerPlayHit = playHit;

  const sizeHit = document.createElement('div');
  sizeHit.dataset.clickable = '1';
  sizeHit.style.cssText =
    'position:absolute;z-index:34;border-radius:50%;cursor:none;' +
    'width:' + (bR * 3.2) + 'px;height:' + (bR * 3.2) + 'px;' +
    'left:' + (rightCX - bR * 1.6) + 'px;top:' + (bCY - bR * 1.6) + 'px;';
  el.appendChild(sizeHit);
  sizeHit.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
  _playerVideoScaleBtn = sizeHit;

  const seekWrap = document.createElement('div');
  seekWrap.dataset.clickable = '1';
  seekWrap.style.cssText =
    'position:absolute;z-index:34;cursor:none;' +
    'left:' + seekX1 + 'px;' +
    'top:' + (seekY - seekWrapH * 2.5) + 'px;' +
    'width:' + (seekX2 - seekX1) + 'px;' +
    'height:' + (seekWrapH * 5) + 'px;';
  el.appendChild(seekWrap);
  _playerVideoSeekWrap = seekWrap;

  function setPlaying(on) {
    playIcon.style.opacity  = on ? '0' : '1';
    pauseIcon.style.opacity = on ? '1' : '0';
  }

  playHit.addEventListener('mouseenter', () => {
    playCirc.setAttribute('stroke', P.btn_color_hover);
    playCirc.style.filter = 'drop-shadow(0 0 6px rgba(255,210,80,0.8))';
    playIcon.setAttribute('fill', P.btn_color_hover);
    pauseIcon.setAttribute('fill', P.btn_color_hover);
  });

  playHit.addEventListener('mouseleave', () => {
    playCirc.setAttribute('stroke', P.btn_color);
    playCirc.style.filter = '';
    playIcon.setAttribute('fill', P.btn_color);
    pauseIcon.setAttribute('fill', P.btn_color);
  });

sizeHit.addEventListener('mouseenter', () => {
  sizeCirc.setAttribute('stroke', P.btn_color_hover);
  sizeCirc.style.filter = 'drop-shadow(0 0 8px rgba(255,210,80,0.9))';
  if (_playerVideoScaleIcon) {
    _playerVideoScaleIcon.querySelectorAll('path').forEach(p => {
      p.setAttribute('stroke', P.btn_color_hover);
      p.style.filter = 'drop-shadow(0 0 6px rgba(255,210,80,0.8))';
    });
  }
  sizeHit.style.transform = 'scale(1.12)';
});

sizeHit.addEventListener('mouseleave', () => {
  sizeCirc.setAttribute('stroke', P.btn_color);
  sizeCirc.style.filter = '';
  if (_playerVideoScaleIcon) {
    _playerVideoScaleIcon.querySelectorAll('path').forEach(p => {
      p.setAttribute('stroke', P.btn_color);
      p.style.filter = '';
    });
  }
  sizeHit.style.transform = 'scale(1)';
});

  playHit.addEventListener('click', async () => {
    if (video.paused) {
      try { await video.play(); } catch(e) {}
    } else {
      video.pause();
    }
  });

sizeHit.addEventListener('click', () => {
  sizeHit.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.14)' },
      { transform: 'scale(1)' }
    ],
    {
      duration: 420,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
    }
  );

  _applyVideoScale();
});

  seekWrap.addEventListener('click', e => {
    const rect = seekWrap.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (isFinite(video.duration) && video.duration > 0) {
      video.currentTime = video.duration * ratio;
      _updateVideoSeekUI();
    }
  });

  video.addEventListener('timeupdate', _updateVideoSeekUI);
  video.addEventListener('loadedmetadata', _updateVideoSeekUI);
  video.addEventListener('play', () => setPlaying(true));
  video.addEventListener('pause', () => setPlaying(false));
  video.addEventListener('ended', () => {
    setPlaying(false);
    _updateVideoSeekUI();
    setTimeout(() => _cinematicClose(), 600);
  });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    playCirc.style.strokeDashoffset = '0';
    sizeCirc.style.strokeDashoffset = '0';
    sepLine.style.opacity = '1';
    playIcon.style.opacity = '1';
    sizeGroup.style.opacity = '1';
  }));

  requestAnimationFrame(() => requestAnimationFrame(async () => {
    try {
      await video.play();
    } catch(e) {}
  }));
}

/* ── Fermeture cinématographique ────────────────────────────────────────
   Fade out + glissement vers le bas de tous les éléments du player,
   puis nettoyage réel après l'animation.
   Utilisé par : clic croix, fin audio, fin vidéo.                        */
let _closeSessionId = 0;

function _cinematicClose() {
  if (!_playerActive) return;
  _playerActive = false;

  const P      = CONFIG.PLAYER;
  const fadeMs = P.fade_out_ms || 900;
  const fadeY  = P.fade_out_y  || 18;
  const sid    = ++_closeSessionId;

  if (_waveRaf) { cancelAnimationFrame(_waveRaf); _waveRaf = null; }
  if (_playerAudio) _playerAudio.pause();
  if (_playerVideo) _playerVideo.pause();

  /* Fade + glissement de tous les enfants */
  Array.from(elMediaPlayer.children).forEach(child => {
    child.style.transition =
      'opacity ' + (fadeMs / 1000) + 's cubic-bezier(0.4,0,0.2,1), ' +
      'transform ' + (fadeMs / 1000) + 's cubic-bezier(0.4,0,0.2,1)';
    child.style.opacity   = '0';
    child.style.transform = (child.style.transform || '') + ' translateY(' + fadeY + 'px)';
  });

  setTimeout(() => {
    /* Si un nouveau player a été ouvert entre-temps, ne pas interférer */
    if (sid !== _closeSessionId) return;
    if (_playerAudio) { _playerAudio.src = ''; _playerAudio = null; }
    if (_playerVideo) { _playerVideo.src = ''; _playerVideo = null; }
    _analyser             = null;
    _playerMainSvg        = null;
    _playerCloseSvg       = null;
    _playerCloseGroup     = null;
    _playerRect           = null;
    _playerCloseHit       = null;
    _playerCloseCirc      = null;
    _playerCloseCross     = null;
    _playerWaveCanvas     = null;
    _playerPlayHit        = null;
    _playerPlayCircle     = null;
    _playerPlayIcon       = null;
    _playerPauseIcon      = null;
    _playerSrc            = null;
    _playerVideoScaleBtn  = null;
    _playerVideoSeekWrap  = null;
    _playerVideoSeekBase  = null;
    _playerVideoSeekFill  = null;
    _playerVideoLayout    = null;
    _playerVideoScaleCirc = null;
    _playerVideoScaleIcon = null;
    _playerVideoSepLine   = null;
    elMediaPlayer.innerHTML = '';
    growTorch(_torchBefore, P.torch_ms);
    startSanzaLoop();
    /* Réapparition élégante de la flèche et du bouton fullscreen */
    arrowEl.style.transition = 'opacity ' + (P.torch_ms / 1000) + 's ease';
    arrowEl.style.opacity    = arrowEl.classList.contains('visible') ? '1' : '0';
    fsBtn.style.transition   = 'opacity ' + (P.torch_ms / 1000) + 's ease';
    fsBtn.style.opacity      = '0.85';
    /* Efface le titre témoignage si la souris n'est plus sur une zone */
    _playerHoverTitle = null;
    const stillOnZone = document.querySelector('.hotspot-zone:hover');
    if (!stillOnZone) _clearHoverTitle(elHoverTitle);
  }, fadeMs + 40);
}

/* ── Fermeture ────────────────────────────────────────────────────── */
function closeMediaPlayer() {
  _cinematicClose();
}


function destroyHotspots() {
  _hideHotspotImg();
  if (_activeHotspot) {
    document.getElementById(_activeHotspot).classList.remove('active');
    _activeHotspot = null;
  }
  elHotspotLayer.innerHTML = '';
  document.body.classList.remove('page3');
  _dbgRemovePanel();
  cursorEl.classList.remove('hotspot');
  /* Efface le titre de survol s'il était visible */
  if (_hoverTitleLeaveTimer !== null) { clearTimeout(_hoverTitleLeaveTimer); _hoverTitleLeaveTimer = null; }
  elHoverTitle.classList.remove('visible');
  _hoverTitleCurrent = null;
  _playerHoverTitle  = null;
}

/* ══════════════════════════════════════
   UI PAGE 3 — Chapitre 2
   Zoom bg collaboration + overlay chapitre3base
   sous-titre header + flèche retour
══════════════════════════════════════ */
function showPage3UI() {
  clearTimers('page3');

  const rc = elRomanCircles;
  rc.style.transition = 'opacity 0.4s ease, transform 0.6s cubic-bezier(0.4,0,0.2,1)';
  rc.style.opacity    = '0';
  rc.style.transform  = 'translateX(140px)';

  const bgCollab = elBgCollab;
  bgCollab.style.opacity    = '1';
  bgCollab.style.transition = 'opacity 1.2s ease, transform 1.8s cubic-bezier(0.25,0.46,0.45,0.94)';
  bgCollab.style.transform  = 'scale(1.12)';

  const bgChap = elBgChap;
  bgChap.classList.remove('zoomed');
  bgChap.removeAttribute('style');
  hideChapitre2Header();
  void bgChap.offsetWidth;
  addTimer('page3', setTimeout(() => bgChap.classList.add('zoomed'), 80));

  showChapitre2Header();

  addTimer('page3', setTimeout(() => showArrow(2), 1100));
  addTimer('page3', setTimeout(() => { document.body.classList.add('page3'); buildHotspots(); }, 1800));

  fadeMusee(0, 1800);
  addTimer('page3', setTimeout(() => startSanzaLoop(), 400));
}

/* hideAllPage3UI : utilisé pour retour direct 3→2 (sans cacher la flèche,
   car showPage2UIReturn la redessine immédiatement après) */
function hideAllPage3UI(skipAudioRestore = false) {
  clearTimers('page3');
  _torchCentered = false;   // retour normal, torche suit la souris

  destroyHotspots();
  // Sous-titre disparaît
  hideChapitre2Header();
  hideSkipButton();

  // Reset bg collaboration (scale + opacité + image d'origine)
  const bgCollab = elBgCollab;
  bgCollab.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  bgCollab.style.backgroundImage = 'url("images/collaboration.png")';
  bgCollab.style.transform  = 'scale(1)';
  bgCollab.style.opacity    = '1';

  // Reset overlay chapitre (zoom inverse rapide)
  const bgChap = elBgChap;
  bgChap.classList.remove('zoomed');
  bgChap.removeAttribute('style'); // nettoie les styles inline éventuels

  // Remet les cercles en place proprement
  const rc = elRomanCircles;
  rc.style.transition = '';
  rc.style.opacity    = '';
  rc.style.transform  = '';

  // Ne pas appeler hideArrow() ici — showPage2UIReturn() redessine
  // immédiatement la flèche et le setTimeout de hideArrow l'effacerait

  // Audio : fade out Sanza, retour musée (sans rejouer S-phrenologie)
  // SAUF si on est dans la transition avec texte (skipAudioRestore = true)
  stopSanzaLoop(1600);
  if (!skipAudioRestore) {
    fadeMusee(CONFIG.AUDIO.musee_vol, 2000);
  }
}



/* ══════════════════════════════════════
   SWAP CINÉMATOGRAPHIQUE DU TITRE HAUT GAUCHE
   fadeOut → change contenu → fadeIn
/* ══════════════════════════════════════
   SWAP TITRE
   - Ne se déclenche QUE si on franchit la frontière collab (pages 0/1 ↔ page 2)
   - Entre pages 0 et 1, le titre reste fixe
   - Espace collaboratif apparaît lettre par lettre comme le titre initial
══════════════════════════════════════ */
function swapSiteTitle(toCollab) {
  const el = document.getElementById('site-title');

  /* 1. Fade out vers le haut */
  el.classList.add('fading-out');

  setTimeout(() => {
    el.classList.remove('fading-out');

    if (toCollab) {
      const text = 'Espace collaboratif';
      let html = '';
      text.split('').forEach((ch, i) => {
        html += `<span class="char" data-i="${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`;
      });
      el.innerHTML = html;
      _applyTitleFont(el);
      el.querySelectorAll('.char').forEach((s, i) => {
        setTimeout(() => {
          s.style.opacity   = '1';
          s.style.transform = 'translateY(0)';
        }, i * CONFIG.TIMING.title_char_delay + Math.random() * 20);
      });
    } else {
      let html = '', charIdx = 0;
      CONFIG.TITLE.texte.forEach(part => {
        if (part === '—') { html += `<span class="sep">—</span>`; }
        else { part.split('').forEach(ch => {
          html += `<span class="char" data-i="${charIdx}">${ch === ' ' ? '&nbsp;' : ch}</span>`;
          charIdx++;
        }); }
      });
      el.innerHTML = html;
      _applyTitleFont(el);
      el.querySelectorAll('.char').forEach((s, i) => {
        setTimeout(() => {
          s.style.opacity   = '1';
          s.style.transform = 'translateY(0)';
        }, i * CONFIG.TIMING.title_char_delay + Math.random() * 20);
      });
      el.querySelectorAll('.sep').forEach((s, i) => {
        setTimeout(() => { s.style.opacity = '0.6'; }, (i + 1) * 340);
      });
    }

  }, CONFIG.TITLE_SWAP_MS);
}

function rebuildActiveMediaPlayer() {
  if (!_playerActive || !_playerSrc) return;

  const src = _playerSrc;

  const wasAudioPlaying = !!(_playerAudio && !_playerAudio.paused);
  const wasVideoPlaying = !!(_playerVideo && !_playerVideo.paused);

  if (_playerAudio) { try { _playerAudio.pause(); } catch(e) {} _playerAudio = null; }
  if (_playerVideo) { try { _playerVideo.pause(); } catch(e) {} _playerVideo = null; }
  if (_waveRaf)     { cancelAnimationFrame(_waveRaf); _waveRaf = null; }

  const el = elMediaPlayer;
  el.innerHTML = '';
  _playerActive = false;

  openMediaPlayer(src);

  setTimeout(() => {
    if (wasAudioPlaying && _playerAudio) _playerAudio.play().catch(() => {});
    if (wasVideoPlaying && _playerVideo) _playerVideo.play().catch(() => {});
  }, 60);
}

function handleMediaPlayerResize() {
  if (!_playerActive || (!_playerAudio && !_playerVideo)) return;

  if (_playerResizeRaf) cancelAnimationFrame(_playerResizeRaf);

  _playerResizeRaf = requestAnimationFrame(() => {
    _playerResizeRaf = null;

    const P = CONFIG.PLAYER;
    const W = vW();
    const H = vH();
    const isVid = !!_playerVideo;

    let rw, rh, rx, ry;
    if (isVid) {
      const vr = _getVideoRectFromWidth(_playerVideoLayout?.videoWidthFrac ?? P.video_min_w);
      ({ rw, rh, rx, ry } = vr);
    } else {
      ({ rw, rh, rx, ry } = _getAudioRect());
    }

    /* Rectangle principal */
    if (_playerRect) {
      const perim = 2 * (rw + rh);
      _playerRect.setAttribute('x', rx);
      _playerRect.setAttribute('y', ry);
      _playerRect.setAttribute('width', rw);
      _playerRect.setAttribute('height', rh);
      _playerRect.style.strokeDasharray  = perim;
      _playerRect.style.strokeDashoffset = '0';
      _playerRect.style.transition = 'none';
    }

    /* ── Croix de fermeture ──
       SVG indépendant position:fixed. On met à jour taille + coords internes. */
    const cSzR  = arrowSizePx();
    const cRR   = cSzR / 2;
    const cMarR = Math.round(W * 0.035);
    const cMarT = Math.round(H * 0.035);
    const csRR  = cRR * 0.46;          // bras de la croix
    const cx0R  = cRR, cy0R = cRR;     // centre local au SVG

    if (_playerCloseSvg) {
      _playerCloseSvg.setAttribute('width',  cSzR);
      _playerCloseSvg.setAttribute('height', cSzR);
      _playerCloseSvg.style.right  = cMarR + 'px';
      _playerCloseSvg.style.top    = cMarT + 'px';
      _playerCloseSvg.style.width  = cSzR + 'px';
      _playerCloseSvg.style.height = cSzR + 'px';
    }
    if (_playerCloseGroup) {
      _playerCloseGroup.style.transformOrigin = cx0R + 'px ' + cy0R + 'px';
    }
    if (_playerCloseCirc) {
      _playerCloseCirc.setAttribute('cx', cx0R);
      _playerCloseCirc.setAttribute('cy', cy0R);
      _playerCloseCirc.setAttribute('r',  cRR - 1);
      const cPerR = Math.round(2 * Math.PI * (cRR - 1));
      _playerCloseCirc.style.strokeDasharray  = cPerR;
      _playerCloseCirc.style.strokeDashoffset = '0';
    }
    if (_playerCloseCross) {
      const lines = _playerCloseCross.querySelectorAll('line');
      if (lines[0]) {
        lines[0].setAttribute('x1', cx0R - csRR); lines[0].setAttribute('y1', cy0R - csRR);
        lines[0].setAttribute('x2', cx0R + csRR); lines[0].setAttribute('y2', cy0R + csRR);
      }
      if (lines[1]) {
        lines[1].setAttribute('x1', cx0R + csRR); lines[1].setAttribute('y1', cy0R - csRR);
        lines[1].setAttribute('x2', cx0R - csRR); lines[1].setAttribute('y2', cy0R + csRR);
      }
    }
    if (_playerCloseHit) {
      _playerCloseHit.style.width  = cSzR + 'px';
      _playerCloseHit.style.height = cSzR + 'px';
      _playerCloseHit.style.right  = cMarR + 'px';
      _playerCloseHit.style.top    = cMarT + 'px';
    }

    /* =========================
       VIDÉO
    ========================= */
    if (isVid && _playerVideo) {
      const inset = Math.max(1, Math.round(Math.min(W, H) * P.media_inset));
      const ctrlH = rh * P.video_ctrl_h;
      const vidH = rh - ctrlH;
      const sepY = ry + vidH;

      _playerVideo.style.left = (rx + inset) + 'px';
      _playerVideo.style.top = (ry + inset) + 'px';
      _playerVideo.style.width = Math.max(2, rw - inset * 2) + 'px';
      _playerVideo.style.height = Math.max(2, vidH - inset) + 'px';

      const sidePad = rw * 0.03;
      const bR = ctrlH * 0.30;
      const leftCX = rx + sidePad + bR;
      const rightCX = rx + rw - sidePad - bR;
      const bCY = ry + vidH + ctrlH * 0.5;
      const bPer = 2 * Math.PI * bR;

      const playIc = bR * 0.38;
      const playPrw = playIc * 0.52;
      const playGap = playIc * 0.34;

      if (_playerVideoSepLine) {
        _playerVideoSepLine.setAttribute('x1', rx);
        _playerVideoSepLine.setAttribute('y1', sepY);
        _playerVideoSepLine.setAttribute('x2', rx + rw);
        _playerVideoSepLine.setAttribute('y2', sepY);
        _playerVideoSepLine.style.opacity = '1';
      }

      /* Play/pause vidéo */
      if (_playerPlayCircle) {
        _playerPlayCircle.setAttribute('cx', leftCX);
        _playerPlayCircle.setAttribute('cy', bCY);
        _playerPlayCircle.setAttribute('r', bR);
        _playerPlayCircle.style.strokeDasharray = bPer;
        _playerPlayCircle.style.strokeDashoffset = '0';
      }

      if (_playerPlayIcon) {
        _playerPlayIcon.setAttribute(
          'points',
          (leftCX - playIc * 0.7) + ',' + (bCY - playIc) + ' ' +
          (leftCX - playIc * 0.7) + ',' + (bCY + playIc) + ' ' +
          (leftCX + playIc * 1.1) + ',' + bCY
        );
      }

      if (_playerPauseIcon) {
        const rects = _playerPauseIcon.querySelectorAll('rect');
        if (rects[0]) {
          rects[0].setAttribute('x', leftCX - playGap - playPrw);
          rects[0].setAttribute('y', bCY - playIc);
          rects[0].setAttribute('width', playPrw);
          rects[0].setAttribute('height', playIc * 2);
        }
        if (rects[1]) {
          rects[1].setAttribute('x', leftCX + playGap);
          rects[1].setAttribute('y', bCY - playIc);
          rects[1].setAttribute('width', playPrw);
          rects[1].setAttribute('height', playIc * 2);
        }
      }

      if (_playerPlayHit) {
        _playerPlayHit.style.width = (bR * 3.2) + 'px';
        _playerPlayHit.style.height = (bR * 3.2) + 'px';
        _playerPlayHit.style.left = (leftCX - bR * 1.6) + 'px';
        _playerPlayHit.style.top = (bCY - bR * 1.6) + 'px';
      }

      /* Bouton agrandissement — repositionner cercle + coins */
      if (_playerVideoScaleCirc) {
        _playerVideoScaleCirc.setAttribute('cx', rightCX);
        _playerVideoScaleCirc.setAttribute('cy', bCY);
        _playerVideoScaleCirc.setAttribute('r', bR);
        _playerVideoScaleCirc.style.strokeDasharray = bPer;
        _playerVideoScaleCirc.style.strokeDashoffset = '0';
      }

      if (_playerVideoScaleIcon) {
        const armR     = bR * 0.38;
        const distBigR = bR * 0.52;
        const distSmlR = bR * 0.24;
        const expanded = !!_playerVideoLayout?.isExpanded;
        const dist     = expanded ? distSmlR : distBigR;
        const cdR      = [[-1,-1],[1,-1],[1,1],[-1,1]];
        const paths    = _playerVideoScaleIcon.querySelectorAll('path');
        cdR.forEach(([sx, sy], i) => {
          if (!paths[i]) return;
          const px = rightCX + sx * dist;
          const py = bCY     + sy * dist;
          paths[i].style.transition = 'none';
          paths[i].setAttribute('d', `M${px},${py + sy*armR} L${px},${py} L${px + sx*armR},${py}`);
          requestAnimationFrame(() => {
            paths[i].style.transition =
              `d 0.35s cubic-bezier(0.4,0,0.2,1) ${i * 0.03}s, stroke 0.2s, filter 0.2s`;
          });
        });
        _playerVideoScaleIcon.style.opacity = '1';
      }

      if (_playerVideoScaleBtn) {
        _playerVideoScaleBtn.style.width = (bR * 3.2) + 'px';
        _playerVideoScaleBtn.style.height = (bR * 3.2) + 'px';
        _playerVideoScaleBtn.style.left = (rightCX - bR * 1.6) + 'px';
        _playerVideoScaleBtn.style.top = (bCY - bR * 1.6) + 'px';
      }

      /* Barre de défilement vidéo */
      const seekX1 = leftCX + bR + rw * 0.05;
      const seekX2 = rightCX - bR - rw * 0.05;
      const seekY = bCY;
      const seekWrapH = ctrlH * P.video_seek_h;

      if (_playerVideoSeekWrap) {
        _playerVideoSeekWrap.style.left = seekX1 + 'px';
        _playerVideoSeekWrap.style.top = (seekY - seekWrapH * 2.5) + 'px';
        _playerVideoSeekWrap.style.width = (seekX2 - seekX1) + 'px';
        _playerVideoSeekWrap.style.height = (seekWrapH * 5) + 'px';
      }

      if (_playerVideoSeekBase) {
        _playerVideoSeekBase.setAttribute('x1', seekX1);
        _playerVideoSeekBase.setAttribute('y1', seekY);
        _playerVideoSeekBase.setAttribute('x2', seekX2);
        _playerVideoSeekBase.setAttribute('y2', seekY);
        _playerVideoSeekBase.setAttribute('stroke-width', P.video_seek_thick);
      }

      if (_playerVideoSeekFill) {
        _playerVideoSeekFill.setAttribute('x1', seekX1);
        _playerVideoSeekFill.setAttribute('y1', seekY);
        _playerVideoSeekFill.setAttribute('y2', seekY);
        _playerVideoSeekFill.setAttribute('stroke-width', P.video_seek_thick);
      }

      _updateVideoSeekUI();
    }

    /* =========================
       AUDIO
    ========================= */
    else if (_playerAudio) {
      const btnZoneW = rh;
      const bR = rh * 0.28;
      const bCX = rx + btnZoneW * 0.5;
      const bCY = ry + rh * 0.5;
      const bPer = 2 * Math.PI * bR;

      const waveGap = rh * P.audio_wave_gap;
      const waveX = rx + btnZoneW + waveGap;
      const waveW = rw - btnZoneW - waveGap * 2;
      const waveH = rh * P.audio_wave_h;
      const waveY = ry + (rh - waveH) / 2;

      if (_playerWaveCanvas) {
        _playerWaveCanvas.width = Math.max(2, Math.round(waveW));
        _playerWaveCanvas.height = Math.max(2, Math.round(waveH));
        _playerWaveCanvas.style.left = waveX + 'px';
        _playerWaveCanvas.style.top = waveY + 'px';
        _playerWaveCanvas.style.width = waveW + 'px';
        _playerWaveCanvas.style.height = waveH + 'px';

        if (_playerAudio.paused) {
          const ctx2 = _playerWaveCanvas.getContext('2d');
          ctx2.clearRect(0, 0, _playerWaveCanvas.width, _playerWaveCanvas.height);
        }
      }

      const ic = bR * 0.42;
      const prw = ic * 0.52;
      const gap = ic * 0.34;

      if (_playerPlayCircle) {
        _playerPlayCircle.setAttribute('cx', bCX);
        _playerPlayCircle.setAttribute('cy', bCY);
        _playerPlayCircle.setAttribute('r', bR);
        _playerPlayCircle.style.strokeDasharray = bPer;
        _playerPlayCircle.style.strokeDashoffset = '0';
      }

      if (_playerPlayIcon) {
        _playerPlayIcon.setAttribute(
          'points',
          (bCX - ic * 0.65) + ',' + (bCY - ic) + ' ' +
          (bCX - ic * 0.65) + ',' + (bCY + ic) + ' ' +
          (bCX + ic * 1.1) + ',' + bCY
        );
      }

      if (_playerPauseIcon) {
        const rects = _playerPauseIcon.querySelectorAll('rect');
        if (rects[0]) {
          rects[0].setAttribute('x', bCX - gap - prw);
          rects[0].setAttribute('y', bCY - ic);
          rects[0].setAttribute('width', prw);
          rects[0].setAttribute('height', ic * 2);
        }
        if (rects[1]) {
          rects[1].setAttribute('x', bCX + gap);
          rects[1].setAttribute('y', bCY - ic);
          rects[1].setAttribute('width', prw);
          rects[1].setAttribute('height', ic * 2);
        }
      }

      if (_playerPlayHit) {
        _playerPlayHit.style.width = (bR * 3.2) + 'px';
        _playerPlayHit.style.height = (bR * 3.2) + 'px';
        _playerPlayHit.style.left = (bCX - bR * 1.6) + 'px';
        _playerPlayHit.style.top = (bCY - bR * 1.6) + 'px';
      }
    }
  });
}

/* ══════════════════════════════════════
   VOILE
══════════════════════════════════════ */
function fadeVeil(to, ms) {
  return new Promise(resolve => {
    veilEl.style.transition = `opacity ${ms}ms ease`;
    veilEl.style.opacity    = String(to);
    setTimeout(resolve, ms + 20);
  });
}


/* ══════════════════════════════════════
   TEXTE TRANSITION CHAPITRE 2 → COLLAB
══════════════════════════════════════ */
let _quoteTypingToken = 0;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildChapterQuoteShell() {
  return `
    <div class="quote-inner">
      <span class="quote-body"></span><span class="cursor">|</span>
    </div>
  `;
}

async function typeChapterQuote(fullText, charDelay = 52) {
  if (!elChapterQuote) return;

  const token = ++_quoteTypingToken;
  const text = String(fullText || '').trim();

  elChapterQuote.innerHTML = buildChapterQuoteShell();
  elChapterQuote.classList.add('visible');

  const bodyEl = elChapterQuote.querySelector('.quote-body');
  const cursor = elChapterQuote.querySelector('.cursor');
  if (!bodyEl) return;

  let out = '';
  for (let i = 0; i < text.length; i++) {
    if (token !== _quoteTypingToken) return;

    const ch = text[i];
    out += (ch === '\n') ? '<br>' : escapeHtml(ch);
    bodyEl.innerHTML = out;

    let pause = charDelay;
    if (ch === ' ') pause *= 0.45;
    else if (ch === ',') pause *= 3.2;
    else if (ch === ';' || ch === ':') pause *= 4.8;
    else if (ch === '…') pause *= 6.5;
    else if (ch === '.' || ch === '!') pause *= 7.2;
    else if (ch === '?') pause *= 9.5;
    else if (ch === '\n') pause *= 10.5;
    else if ("àâäéèêëîïôöùûüÿç’\"-".includes(ch)) pause *= 1.15;

    if (/[A-ZÉÈÀÂÎÔÙÇ]/.test(ch) && i > 0) pause *= 1.35;

    const next = text[i + 1] || '';
    if ((ch === '.' || ch === '?' || ch === '!') && next === '\n') pause *= 1.35;

    if (Math.random() < 0.08 && /[a-zàâäéèêëîïôöùûüÿç]/i.test(ch)) {
      pause += 40 + Math.random() * 120;
    }

    await wait(Math.round(pause));
  }

  if (cursor) cursor.style.animation = 'quoteBlink 1.25s steps(1) infinite';
}

function hideChapterQuote(ms = 1200) {
  _quoteTypingToken++;
  if (!elChapterQuote) return;
  elChapterQuote.classList.remove('visible');
  setTimeout(() => {
    if (!elChapterQuote.classList.contains('visible')) elChapterQuote.innerHTML = '';
  }, ms + 80);
}

async function transitionPage3To2WithQuote() {
  const QUOTE_TEXT = `Ce qui a été le plus difficile à comprendre ou à aborder ?

Ce qui m’a le plus dérangé, c’est l’ambiguïté de son geste. Est-ce qu’il est un assassin ? un résistant ? un fanatique ? un héros ? ce n’est pas facile de trancher. On se rend vite compte que ça dépend du point de vue.

Et comme il n’a pas laissé de traces écrites personnelles, on doit lire entre les lignes des récits officiels. C’est frustrant de ne pas vraiment savoir qui il était, ce qu’il pensait, ce qu’il ressentait. Mais c’est aussi ce qui rend cette recherche passionnante.`;

  arrowEl.style.transition = 'opacity 0.25s ease';
  arrowEl.style.opacity = '0';
  arrowEl.classList.remove('visible');
  arrowEl.innerHTML = '';

  // Fade out de Sanza et MuseeLoop IMMÉDIATEMENT
  stopSanzaLoop();
  fadeMusee(0, 800);

  await fadeVeil(1, 1200);

  // S'assurer que MuseeLoop est bien à 0 (au cas où le fade n'est pas terminé)
  if (museeGain) {
    const ac = getAudioCtx();
    museeGain.gain.cancelScheduledValues(ac.currentTime);
    museeGain.gain.setValueAtTime(0, ac.currentTime);
  }

  hideAllPage3UI(true);  // skipAudioRestore = true : NE PAS remettre MuseeLoop
  document.body.classList.remove('page3');
  torchBaseRadius = 0;

  // Démarre Silence.mp3 en loop pendant le texte
  startSilenceLoop();

  // Variable pour détecter si on a skippé
  let hasSkipped = false;
  
  // Lancer le typing en parallèle (pas avec await)
  const typingPromise = typeChapterQuote(QUOTE_TEXT, 54);
  
  // Attendre 2 secondes puis afficher le bouton Skip
  await wait(2000);
  showSkipButton();
  
  // Promise qui attend soit la fin du typing + pause, soit le clic sur Skip
  await new Promise((resolve) => {
    const skipHandler = () => {
      hasSkipped = true;
      // Arrêter le typing immédiatement
      _quoteTypingToken++;
      // Cacher la citation immédiatement
      hideChapterQuote(0);
      // Retirer le listener
      const skipWrap = elSkipBtn.querySelector('.skip-wrap');
      if (skipWrap) {
        skipWrap.removeEventListener('click', skipHandler);
      }
      // Continuer immédiatement
      resolve();
    };
    
    // Attacher le handler de skip
    const skipWrap = elSkipBtn.querySelector('.skip-wrap');
    if (skipWrap) {
      skipWrap.addEventListener('click', skipHandler);
    }
    
    // OU attendre la fin naturelle du typing + pause
    typingPromise.then(() => {
      if (!hasSkipped) {
        return wait(3200);
      }
    }).then(() => {
      if (!hasSkipped) {
        // Retirer le listener
        if (skipWrap) {
          skipWrap.removeEventListener('click', skipHandler);
        }
        resolve();
      }
    });
  });
  
  // Cacher le bouton Skip
  hideSkipButton();

  // CRUCIAL : Nettoyer tous les timers de la page 3 pour éviter qu'ils reconstruisent les hotspots
  clearTimers('page3');
  
  // Réinitialiser les styles inline des cercles romains (mis par showPage3UI)
  const rc = elRomanCircles;
  rc.style.opacity = '';
  rc.style.transform = '';
  rc.style.transition = '';
  
  // Libérer la torche pour qu'elle suive la souris
  _torchCentered = false;
  
  // Passer à la page 2
  currentPage = 2;
  updateTorchTarget();

  // S'assurer que tout est bien nettoyé
  elBgVitrine.style.opacity = '0';
  elBgPhren.style.opacity   = '0';
  elBgCollab.style.opacity  = '1';
  elBgChap.style.opacity    = '0';
  elBgChap.classList.remove('zoomed');
  elBgChap.removeAttribute('style');
  
  // Nettoyer complètement la page 3
  document.body.classList.remove('page3');

  // Afficher l'UI de la page 2 (cercles romains, flèche, musique collaboration)
  showPage2UIReturn();

  // Transition de sortie
  if (!hasSkipped) {
    hideChapterQuote(2600);
  }
  
  // IMPORTANT : Lancer les transitions de sortie en parallèle
  fadeVeil(0, 2600);
  growTorch(torchTargetRadius, 3200);

  // Fade out Silence et fade in Collaboration (pas MuseeLoop !)
  stopSilenceLoop(1800);
  // startCollabLoop() est déjà appelé dans showPage2UIReturn()

  // Attendre que la transition soit terminée avant de libérer isTransitioning
  await wait(2700);
  isTransitioning = false;
}

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
async function navigateTo(target) {
  if (isTransitioning || target === currentPage) return;
  isTransitioning = true;
  const T = CONFIG.TRANSITION;

  // ── Retour page 3 → 2 avec noir + texte tapé ──
  if (currentPage === 3 && target === 2) {
    await transitionPage3To2WithQuote();
    return;
  }

  // Cache UI courante
  if (currentPage === 0) hideArrow();
  if (currentPage === 1) hideAllPage1UI();
  if (currentPage === 2) hideAllPage2UI();
  if (currentPage === 3) hideAllPage3UI();

  // ── Toutes les autres transitions : voile cinématographique ──
  // On ne coupe PAS la torche avant le voile — le voile noir suffit.
  // La torche est restaurée après le fondu de sortie.
  await fadeVeil(1, T.veil_in);

  // Swap fonds
  elBgVitrine.style.opacity = target === 0 ? '1' : '0';
  elBgPhren.style.opacity   = target === 1 ? '1' : '0';
  elBgCollab.style.opacity  = (target === 2 || target === 3) ? '1' : '0';
  // Reset zoom collab si on arrive proprement via voile
  if (target === 2 || target === 3) {
    const bgC = elBgCollab;
    bgC.style.transition = 'none'; bgC.style.transform = 'scale(1)';
  }
  const fromCollab = (currentPage === 2 || currentPage === 3);
  currentPage = target;
  updateTorchTarget();

  await new Promise(r => setTimeout(r, T.veil_hold));
  await fadeVeil(0, T.veil_out);

  /* Restauration torche — depuis page 3 : rapide (déjà au bon niveau).
     Depuis autres pages : restore_ms configurable.                    */
  const restoreMs = (fromCollab && !(currentPage === 2 || currentPage === 3))
    ? 1200   // retour depuis chapitre 2 → plus rapide
    : T.torch_restore;
  growTorch(torchTargetRadius, restoreMs);

  /* Swap titre uniquement si on franchit la frontière collab.
     Entre pages 0↔1 le titre reste fixe.                     */
  const toCollab = (currentPage === 2 || currentPage === 3);
  if (!fromCollab && toCollab)  swapSiteTitle(true);   // entrée collab
  if (fromCollab  && !toCollab) swapSiteTitle(false);  // sortie collab

  // IMPORTANT : attendre un peu après fadeVeil pour que le voile soit bien fermé
  // avant d'afficher l'UI de la nouvelle page
  await new Promise(r => setTimeout(r, 50));

  // UI nouvelle page
  if (currentPage === 0) showArrow(0);
  if (currentPage === 1) showPage1UI();
  if (currentPage === 2) showPage2UI();
  if (currentPage === 3) showPage3UI();
  
  // IMPORTANT : isTransitioning = false APRÈS l'affichage de l'UI
  isTransitioning = false;
}



/* ══════════════════════════════════════
   EVENTS
══════════════════════════════════════ */
let wheelCD = false;
document.addEventListener('wheel', e => {
  if (!experienceStarted || isTransitioning || wheelCD || arrowDrawing) return;
  if (currentPage === 2 || currentPage === 3) return;
  wheelCD = true; setTimeout(() => wheelCD = false, 1400);
  if (e.deltaY > 0 && currentPage === 0)      navigateTo(1);
  else if (e.deltaY < 0 && currentPage === 1) navigateTo(0);
}, { passive: true });

let tY = null;
document.addEventListener('touchstart', e => { if (!experienceStarted) return; tY = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  if (!experienceStarted || isTransitioning || arrowDrawing || tY === null) return;
  const dy = tY - e.changedTouches[0].clientY; tY = null;
  if (Math.abs(dy) < 50) return;
  if (currentPage === 2 || currentPage === 3) return;
  if (dy > 0 && currentPage === 0)      navigateTo(1);
  else if (dy < 0 && currentPage === 1) navigateTo(0);
}, { passive: true });

arrowEl.addEventListener('click', () => {
  if (isTransitioning || arrowDrawing) return;
  if (currentPage === 0) navigateTo(1);
  else if (currentPage === 1) navigateTo(0);
  else if (currentPage === 2) navigateTo(1);
  else if (currentPage === 3) navigateTo(2);
});


/* ══════════════════════════════════════
   DÉMARRAGE
══════════════════════════════════════ */
const startScreen = document.getElementById('start-screen');

async function startExperience() {
  if (experienceStarted) return;
  experienceStarted = true;
  document.body.classList.add('experience-started');
  try { enterFS(); } catch(e) {}
  startScreen.classList.add('hidden');
  setTimeout(() => startScreen.remove(), CONFIG.START_SCREEN.fadeOut + 200);
  revealTitle();
  updateTorchTarget();
  growTorch(torchTargetRadius, CONFIG.TORCH.growDuration);
  startMuseeLoop();
  setTimeout(() => showArrow(0), CONFIG.TIMING.arrow_appear);
}

startScreen.addEventListener('click',      startExperience);
startScreen.addEventListener('touchstart', startExperience, { passive: true });
startScreen.addEventListener('keydown',    startExperience);
