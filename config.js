/* ╔══════════════════════════════════════════════════════════════════╗
   ║                                                                  ║
   ║                     C O N F I G U R A T I O N                    ║
   ║                          VERSION 1.3                             ║
   ║                                                                  ║
   ║  ABOUNADDARA × CNRS × 2026                                       ║
   ║  Expérience interactive : Soliman el-Halabi / Kléber             ║
   ║                                                                  ║
   ║  PHASE 3 : Structuration avancée                                 ║
   ║  → Vues organisées par page/son                                  ║
   ║  → Uniformisation des noms (_ms partout)                         ║
   ║  → Factorisation des redondances                                 ║
   ║                                                                  ║
   ╚══════════════════════════════════════════════════════════════════╝ */

/* ┌──────────────────────────────────────────────────────────────────┐
   │  TABLE DES MATIÈRES                                              │
   ├──────────────────────────────────────────────────────────────────┤
   │  PARTIE A : CONFIGURATION ORIGINALE (Compatibilité)              │
   │    [1]  TORCHE .......................... Ligne  60              │
   │    [2]  AUDIO ........................... Ligne  70              │
   │    [3]  TIMING .......................... Ligne 105              │
   │    [4]  TITRE SITE ...................... Ligne 115              │
   │    [5]  FLÈCHE NAVIGATION ............... Ligne 120              │
   │    [6]  BOUTONS DOCUMENTS ............... Ligne 125              │
   │    [7]  TRANSITIONS ..................... Ligne 140              │
   │    [8]  PAGE COLLABORATION .............. Ligne 150              │
   │    [9]  BARRE NAVIGATION BAS ............ Ligne 180              │
   │    [10] ÉCRAN DÉMARRAGE ................. Ligne 215              │
   │    [11] CHAPITRE 2 ...................... Ligne 220              │
   │    [12] PLAYER MÉDIA .................... Ligne 290              │
   │    [13] TAILLE MINIMALE ................. Ligne 400              │
   │    [14] TYPOGRAPHIE ..................... Ligne 410              │
   │                                                                  │
   │  PARTIE B : VUES ORGANISÉES (Navigation facilitée)               │
   │    [15] CONSTANTES PARTAGÉES ............ Ligne 48               │
   │    [16] VUE PAR PAGE .................... Ligne 45               │
   │    [17] VUE PAR SON ..................... Ligne 75               │
   │    [18] VUE PAR TYPE .................... Ligne625               │
   └──────────────────────────────────────────────────────────────────┘ */


/* ══════════════════════════════════════════════════════════════════
   ══════════════════════════════════════════════════════════════════
   
   PARTIE A : CONFIGURATION ORIGINALE
   
   Cette section conserve l'organisation actuelle pour compatibilité
   avec main.js. Tous les noms de variables sont identiques.
   
   ══════════════════════════════════════════════════════════════════
   ══════════════════════════════════════════════════════════════════ */

const CONFIG = {


/* ══════════════════════════════════════════════════════════════════
   [1] TORCHE — Effet de lumière canvas
   ══════════════════════════════════════════════════════════════════ */

  TORCH: {
    // ── Tailles par page (fraction de min(largeur, hauteur)) ──
    taille_vitrine:  0.65,   // Page 0 (Vitrine) — Grande torche
    taille_phren:    0.22,   // Page 1 (Phrénologie) — Petite torche intime
    
    // ── Animation initiale ──
    growDuration: 20000,     // Durée ouverture progressive (ms)
    
    // ── Comportement souris ──
    lag: 0.068,              // Inertie (0.01=lent, 0.2=rapide)
  },


/* ══════════════════════════════════════════════════════════════════
   [2] AUDIO — Tous les sons du site
   ══════════════════════════════════════════════════════════════════ */

  AUDIO: {
    
    /* ── MUSEELOOP.MP3 (Boucle de fond permanente) ────────────── */
    musee_vol:      1,       // Volume (0→1)
    fadeDuration:   3500,    // Fade-in initial au démarrage (ms)
    musee_fade:     2500,    // Fade out/in lors des transitions (ms)
    
    /* ── S-PHRENOLOGIE.MP3 (Chapitre 2 — Séquence intro) ─────── */
    phren_fade_in:  1800,    // Fade-in (ms)
    phren_fade_out: 2200,    // Fade-out (ms)
    
    /* ── SANZA.MP3 (Chapitre 2 — Mode interactif) ────────────── */
    sanza_vol:      0.65,    // Volume (0→1)
    sanza_fade_in:  2000,    // Fade-in (ms)
    sanza_fade_out: 1200,    // Fade-out (ms)
    
    /* ── SILENCE.MP3 (Transition Chapitre 2 → Collaboration) ── */
    silence_vol:      0.75,  // Volume (0→1)
    silence_fade_in:  1200,  // Fade-in (ms)
    silence_fade_out: 1800,  // Fade-out (ms)
    
    /* ── COLLABORATION.MP3 (Musique de l'espace collaboration) ── */
    collab_vol:       1.0,   // Volume (0→1)
    collab_fade_in:   2500,  // Fade-in (ms)
    collab_fade_out:  2000,  // Fade-out (ms)
    
    /* ── DÉLAI INTRO CHAPITRE 2 ── */
    phren_intro_delay: 1800, // Délai avant démarrage S-phrenologie.mp3 (ms)
  },


/* ══════════════════════════════════════════════════════════════════
   [3] TIMING — Délais des animations UI
   ══════════════════════════════════════════════════════════════════ */

  TIMING: {
    arrow_appear:     6000,  // Délai avant flèche page 0 (ms)
    docs_delay:       2200,  // Délai flèche → boutons docs (ms)
    navbar_delay:     1800,  // Délai boutons docs → barre nav (ms)
    title_char_delay: 65,    // Délai entre lettres du titre (ms)
    title_start:      800,   // Délai avant animation titre (ms)
  },


/* ══════════════════════════════════════════════════════════════════
   [4] TITRE SITE — Titre haut gauche
   ══════════════════════════════════════════════════════════════════ */

  TITLE: { 
    texte: ['Abounaddara', '—', 'CNRS', '—', '2026'], 
    couleur: 'rgba(210,175,90,1)' 
  },


/* ══════════════════════════════════════════════════════════════════
   [5] FLÈCHE NAVIGATION
   ══════════════════════════════════════════════════════════════════ */

  ARROW: { 
    size_vh: 7  // Diamètre en % hauteur viewport
  },


/* ══════════════════════════════════════════════════════════════════
   [6] BOUTONS DOCUMENTS — Colonne droite (Page 1)
   ══════════════════════════════════════════════════════════════════ */

  DOCS: {
    // ── Position et taille ──
    width_vw:  16,    // Largeur (% largeur viewport)
    height_vh: 7,     // Hauteur (% hauteur viewport)
    right_pct: 3.5,   // Distance du bord droit (%)
    top_pct:   3.2,   // Distance du haut (%)
    gap_vh:    1.8,   // Espacement vertical (% hauteur viewport)
    
    // ── Contenu ──
    labels:  ['Document 1', 'Document 2', 'Document 3', 'Document 4'],
    
    // ── Actions (null = placeholder) ──
    actions: [null, null, null, null],
  },


/* ══════════════════════════════════════════════════════════════════
   [7] TRANSITIONS — Voile noir entre pages
   ══════════════════════════════════════════════════════════════════ */

  TRANSITION: { 
    veil_in:       700,   // Fondu vers noir (ms)
    veil_hold:     120,   // Pause noir total (ms)
    veil_out:      900,   // Fondu sortie (ms)
    torch_restore: 4000,  // Restauration torche (ms)
  },
  
  TITLE_SWAP_MS: 620,  // Durée swap titre (ms) — Doit matcher CSS 0.6s


/* ══════════════════════════════════════════════════════════════════
   [8] PAGE COLLABORATION — Cercles romains I→V (Page 2)
   ══════════════════════════════════════════════════════════════════ */

  COLLAB: {
    
    // ── Torche ──
    torch_taille: 0.45,       // Taille (fraction de min(largeur, hauteur))
    
    // ── Cercles romains ──
    circles_delay:   3500,    // Délai avant apparition (ms)
    circles_stagger: 300,     // Délai entre chaque cercle (ms)
    
    circle_size_vh:  15,      // Diamètre de chaque cercle (% hauteur viewport)
    circle_gap_vh:   8,       // Espace entre cercles (% hauteur viewport)
    circle_top_pct:  50,      // Position verticale du centre (%, 50 = milieu)
    
    // ── Labels ──
    labels: ['I', 'II', 'III', 'IV', 'V'],
    
    // ── Titres au survol (null = pas de titre) ──
    hover_titles: [
      'Chapitre 1',
      'Pourquoi Soliman el Halabi aurait&#8209;il tué Kléber&nbsp;?',
      'Héritage Colonial',
      'Histoire et Violence',
      'Chapitre 5',
    ],
  },


/* ══════════════════════════════════════════════════════════════════
   [9] BARRE NAVIGATION BAS — 3 sections (Page 1)
   ══════════════════════════════════════════════════════════════════ */

  NAV: {
    
    // ── Dimensions ──
    bottom: 0.05,      // Position bas (fraction)
    height: 0.08,      // Hauteur (fraction)
    width:  0.80,      // Largeur (fraction)
    
    // ── Style ──
    stroke_color: 'rgba(255,255,255,0.80)',
    stroke_width: 0.8,
    
    // ── Animations ──
    draw_speed: 1.1,   // Vitesse dessin rectangle (secondes)
    sep_speed:  0.5,   // Vitesse séparateurs (secondes)
    sep_delay:  0.3,   // Délai entre séparateurs (secondes)
    text_delay: 0.25,  // Délai apparition texte (secondes)
    text_fade:  0.4,   // Durée fade texte (secondes)
    
    // ── Boutons ──
    btn_font:           'Cinzel, serif',
    btn_color:          'rgba(255,255,255,0.85)',
    btn_color_hover:    'rgba(255,220,120,1)',
    btn_letter_spacing: '0.18em',
    
    labels: ['Carnet de Recherche', 'Collaboration', 'À Propos'],
    
    // ── Actions (null = placeholder, 'collab' = aller page 2) ──
    actions: [null, 'collab', null],
  },


/* ══════════════════════════════════════════════════════════════════
   [10] ÉCRAN DÉMARRAGE
   ══════════════════════════════════════════════════════════════════ */

  START_SCREEN: { 
    fadeOut: 1400  // Durée disparition (ms)
  },


/* ══════════════════════════════════════════════════════════════════
   [11] CHAPITRE 2 — Exploration avec hotspots (Page 3)
   ══════════════════════════════════════════════════════════════════ */

  CHAPITRE2: {
    
    // ── Sous-titre ──
    subtitle: 'Pourquoi Soliman el&#8209;Halabi aurait&#8209;il tué Kléber ?',
    
    // ── Mode debug ──
    debug: false,  // true = zones colorées + panneau coordonnées
    
    /* ── TORCHE Chapitre 2 ────────────────────────────────────── */
    // Toutes les valeurs sont des fractions de min(largeur, hauteur)
    
    torch_phren:       2.0,   // Taille pendant séquence phréno (figée au centre)
    torch_interactive: 2.5,   // Taille en mode interactif (suit la souris)
    torch_media_dim:   0.4,   // Facteur de réduction pendant lecture média
    
    /* ── HOTSPOTS — 9 zones interactives ──────────────────────── */
    // Coordonnées en % de la fenêtre (responsive)
    // l = left, t = top, w = width, h = height
    // media = chemin fichier audio/vidéo
    
    hotspots: [
      { img: 'himg-1', label: 'Langage',       l: 61, t: 40, w: 28, h: 35, media: 'Collaboration/Chapitre2/S1.mp3'        },
      { img: 'himg-2', label: '33',            l: 12, t: 41, w: 29, h: 37, media: 'Collaboration/Chapitre2/C2.mp3'        },
      { img: 'himg-3', label: 'Éventualité',   l: 46, t:  0, w: 22, h: 22, media: 'Collaboration/Chapitre2/S2.mp3'        },
      { img: 'himg-4', label: 'Individualité', l: 46, t: 22, w: 19, h: 26, media: 'Collaboration/Chapitre2/Emprise.mp4'   },
      { img: 'himg-5', label: 'Pesanteur',     l: 67, t: 18, w: 13, h: 22, media: 'Collaboration/Chapitre2/Theatre.mp4'  },
      { img: 'himg-6', label: '27',            l: 21, t:  5, w: 32, h: 23, media: 'Collaboration/Chapitre2/Defenseur.mp4'},
      { img: 'himg-7', label: 'Temps',         l: 72, t:  6, w: 20, h: 17, media: 'Collaboration/Chapitre2/Silence.mp4'  },
      { img: 'himg-8', label: '25',            l: 19, t: 23, w: 11, h: 20, media: 'Collaboration/Chapitre2/Klaxon.mp3'   },
      { img: 'himg-9', label: 'Nez',           l: 38, t: 62, w: 22, h: 22, media: 'Collaboration/Chapitre2/S3.mp3'       },
    ],
  },


/* ══════════════════════════════════════════════════════════════════
   [12] PLAYER MÉDIA — Lecteur audio/vidéo (hotspots chapitre 2)
   
   → Toutes les valeurs en FRACTIONS de l'écran (responsive natif)
   → Séparé en sous-sections logiques
   ══════════════════════════════════════════════════════════════════ */

  PLAYER: {

    /* ════════════ AUDIO ═══════════════════════════════════════ */
    
    audio_w:    0.62,   // Largeur player (fraction largeur écran)
    audio_h:    0.16,   // Hauteur player (fraction hauteur écran)
    
    audio_bg_opacity: 0.35,  // Opacité fond
    
    // ── Waveform ──
    wave_color: 'rgba(255,255,255,0.75)',  // Couleur signal
    wave_width: 1.5,                       // Épaisseur trait
    
    audio_wave_h:   0.62,  // Hauteur waveform (fraction du rectangle)
    audio_wave_gap: 0.08,  // Espace entre bouton play et waveform

    /* ════════════ VIDÉO ═══════════════════════════════════════ */
    
    video_ratio: 0.95,  // Ratio hauteur/largeur (0.95 = presque carré)
    
    video_bg_opacity: 0.75,  // Opacité fond
    
    // ── Tailles (fraction écran) ──
    video_min_w: 0.30,  // Taille MIN (compacte)
    video_max_w: 0.80,  // Taille MAX (immersive)
    
    // ── Animation agrandissement ──
    video_scale_duration_ms: 700,  // Durée (ms)
    video_scale_ease_power:  3.5,  // Courbe (2.0=linéaire, 2.6=naturel, 3.5+=organique)
    
    // ── Barre de lecture ──
    video_seek_h:     0.12,  // Hauteur zone seek (fraction du player)
    video_seek_thick: 1.2,   // Épaisseur ligne progression

    /* ════════════ COMMUN AUDIO/VIDÉO ═════════════════════════ */
    
    // ── Layout interne ──
    media_inset:  0.0005,  // Marge interne minimale
    video_ctrl_h: 0.14,    // Hauteur zone contrôles vidéo
    
    // ── Style général ──
    stroke:      'rgba(255,255,255,0.85)',  // Couleur contour SVG
    draw_speed:  0.9,                       // Durée animation dessin (secondes)
    fade_out_ms: 950,                       // Durée disparition (ms)
    fade_out_y:  18,                        // Glissement vertical (px)
    
    // ── Boutons ──
    btn_color:       'rgba(255,255,255,0.82)',  // Couleur normale
    btn_color_hover: 'rgba(255,220,120,1)',     // Couleur hover (doré)
    
    // ── Croix fermeture ──
    close_size:  0.028,  // Taille cercle (proportion écran)
    close_delay: 0.5,    // Délai apparition (secondes)
    
    // ── Torche pendant lecture ──
    torch_dim: 0.8,   // Intensité (0=éteinte, 1=normale)
    torch_ms:  800,   // Durée transition (ms)
  },


/* ══════════════════════════════════════════════════════════════════
   [13] TAILLE MINIMALE — Fenêtre
   ══════════════════════════════════════════════════════════════════ */

  MIN_SIZE: {
    width:  600,   // Largeur minimale avant scroll (px)
    height: 450,   // Hauteur minimale avant scroll (px)
  },


/* ══════════════════════════════════════════════════════════════════
   [14] TYPOGRAPHIE — Toutes les polices du site
   
   Principe : Taille proportionnelle avec min/max
   → size_vw  = taille en % largeur écran (responsive)
   → size_min = taille plancher en px (lisibilité garantie)
   → size_max = taille plafond en px (confort grands écrans)
   ══════════════════════════════════════════════════════════════════ */

  FONTS: {

    /* ── Titre principal (ABOUNADDARA — CNRS — 2026) ───────── */
    title: {
      family:  'Cinzel, serif',
      size_vw: 1.1,
      size_min: 9,
      size_max: 18,
      weight:  400,
      spacing: '0.30em',
      style:   'normal',
      color:   'rgba(210,175,90,1)',
    },

    /* ── Sous-titre chapitre 2 ────────────────────────────── */
    subtitle: {
      family:  'Cinzel, serif',
      size_vw: 0.75,
      size_min: 7,
      size_max: 13,
      weight:  400,
      spacing: '0.18em',
      style:   'normal',
      color:   'rgba(210,175,90,0.78)',
    },

    /* ── Boutons documents (Document 1, Document 2...) ────── */
    doc_btns: {
      family:  'Cinzel, serif',
      size_vw: 0.80,
      size_min: 8,
      size_max: 14,
      weight:  400,
      spacing: '0.18em',
      style:   'normal',
    },

    /* ── Barre navigation bas (Carnet, Collaboration...) ──── */
    nav_btns: {
      family:  'Cinzel, serif',
      size_vw: 1.20,
      size_min: 12,
      size_max: 26,
      weight:  300,
      spacing: '0.18em',
      style:   'normal',
    },

    /* ── Cercles romains (I, II, III, IV, V) ───────────────── */
    roman: {
      family:  'Cinzel, serif',
      size_vw: 1.6,
      size_min: 10,
      size_max: 28,
      weight:  600,
      spacing: '0.08em',
      style:   'normal',
    },

    /* ── Titres au survol (hover_titles + labels hotspots) ── */
    hover_title: {
      family:  'Playfair Display, Cormorant Garamond, Georgia, serif',
      size_vw: 2.0,
      size_min: 14,
      size_max: 36,
      weight:  300,
      spacing: '0.06em',
      style:   'italic',
      color:   'rgba(255,255,255,0.82)',
    },

  },


/* ══════════════════════════════════════════════════════════════════
   ══════════════════════════════════════════════════════════════════
   
   PARTIE B : VUES ORGANISÉES
   
   Cette section propose des vues alternatives pour naviguer
   facilement dans la configuration. Ce sont des RÉFÉRENCES vers
   les vraies valeurs ci-dessus, pas de nouvelles données.
   
   → Ne change RIEN au fonctionnement
   → Juste pour faciliter la navigation et la compréhension
   
   ══════════════════════════════════════════════════════════════════
   ══════════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════════════
   [15] CONSTANTES PARTAGÉES — Factorisation des valeurs répétées
   ══════════════════════════════════════════════════════════════════ */

  _SHARED: {
    // ── Couleurs communes ──
    color_gold:       'rgba(210,175,90,1)',      // Or titre
    color_gold_soft:  'rgba(210,175,90,0.78)',   // Or doux
    color_white:      'rgba(255,255,255,0.85)',  // Blanc principal
    color_hover:      'rgba(255,220,120,1)',     // Doré au survol (utilisé 3x)
    
    // ── Traits ──
    stroke_standard:  0.8,  // Épaisseur standard (utilisée 2x)
    
    // ── Marges standard ──
    margin_top:       3.2,  // Marge haut (%)
    margin_side:      3.5,  // Marge côtés (%)
  },


/* ══════════════════════════════════════════════════════════════════
   [16] VUE PAR PAGE — Tous les paramètres d'une page au même endroit
   ══════════════════════════════════════════════════════════════════ */

  _PAGES: {
    
    /* ────────────────────────────────────────────────────────── */
    PAGE_0_VITRINE: {
      nom: 'Vitrine Orfila',
      background: 'images/vitrineOrfila.png',
      
      torche: {
        taille: () => CONFIG.TORCH.taille_vitrine,          // 0.65
        lag: () => CONFIG.TORCH.lag,                        // 0.068
        grow_ms: () => CONFIG.TORCH.growDuration,           // 20000
      },
      
      timing: {
        arrow_ms: () => CONFIG.TIMING.arrow_appear,         // 6000
        title_start_ms: () => CONFIG.TIMING.title_start,    // 800
        title_char_ms: () => CONFIG.TIMING.title_char_delay,// 65
      },
      
      ui: {
        title: () => CONFIG.TITLE,
        arrow_vh: () => CONFIG.ARROW.size_vh,               // 7
      },
    },
    
    /* ────────────────────────────────────────────────────────── */
    PAGE_1_PHRENOLOGIE: {
      nom: 'Phrénologie et Documents',
      background: 'images/phrenologie.png',
      
      torche: {
        taille: () => CONFIG.TORCH.taille_phren,            // 0.22
      },
      
      timing: {
        docs_delay_ms: () => CONFIG.TIMING.docs_delay,      // 2200
        navbar_delay_ms: () => CONFIG.TIMING.navbar_delay,  // 1800
      },
      
      ui: {
        arrow_vh: () => CONFIG.ARROW.size_vh,               // 7
        docs: () => CONFIG.DOCS,
        nav: () => CONFIG.NAV,
      },
    },
    
    /* ────────────────────────────────────────────────────────── */
    PAGE_2_COLLABORATION: {
      nom: 'Espace Collaboratif',
      background: 'images/collaboration.png',
      
      torche: {
        taille: () => CONFIG.COLLAB.torch_taille,           // 0.45
      },
      
      timing: {
        circles_delay_ms: () => CONFIG.COLLAB.circles_delay,    // 3500
        circles_stagger_ms: () => CONFIG.COLLAB.circles_stagger,// 300
      },
      
      ui: {
        arrow_vh: () => CONFIG.ARROW.size_vh,               // 7
        circles: () => CONFIG.COLLAB,
      },
    },
    
    /* ────────────────────────────────────────────────────────── */
    PAGE_3_CHAPITRE2: {
      nom: 'Chapitre 2 — Exploration Interactive',
      background: 'images/chapitre2base.png',
      
      torche: {
        taille_phren: () => CONFIG.CHAPITRE2.torch_phren,         // 2.0
        taille_interactive: () => CONFIG.CHAPITRE2.torch_interactive, // 2.5
        reduction_media: () => CONFIG.CHAPITRE2.torch_media_dim,  // 0.4
      },
      
      ui: {
        subtitle: () => CONFIG.CHAPITRE2.subtitle,
        hotspots: () => CONFIG.CHAPITRE2.hotspots,          // 9 zones
        debug: () => CONFIG.CHAPITRE2.debug,                // false
      },
      
      player: () => CONFIG.PLAYER,
    },
    
  },


/* ══════════════════════════════════════════════════════════════════
   [17] VUE PAR SON — Tous les paramètres audio regroupés par fichier
   ══════════════════════════════════════════════════════════════════ */

  _SOUNDS: {
    
    /* ────────────────────────────────────────────────────────── */
    MUSEE_LOOP: {
      fichier: 'sons/MuseeLoop.mp3',
      type: 'loop',
      contexte: 'Boucle de fond permanente',
      
      volume: () => CONFIG.AUDIO.musee_vol,               // 1
      fade_in_initial_ms: () => CONFIG.AUDIO.fadeDuration,// 3500
      fade_normal_ms: () => CONFIG.AUDIO.musee_fade,      // 2500
    },
    
    /* ────────────────────────────────────────────────────────── */
    PHRENOLOGIE: {
      fichier: 'sons/S-phrenologie.mp3',
      type: 'oneshot',
      contexte: 'Chapitre 2 — Séquence intro (phréno)',
      
      fade_in_ms: () => CONFIG.AUDIO.phren_fade_in,       // 1800
      fade_out_ms: () => CONFIG.AUDIO.phren_fade_out,     // 2200
    },
    
    /* ────────────────────────────────────────────────────────── */
    SANZA: {
      fichier: 'sons/Sanza.mp3',
      type: 'loop',
      contexte: 'Chapitre 2 — Mode interactif',
      
      volume: () => CONFIG.AUDIO.sanza_vol,               // 0.65
      fade_in_ms: () => CONFIG.AUDIO.sanza_fade_in,       // 2000
      fade_out_ms: () => CONFIG.AUDIO.sanza_fade_out,     // 1200
    },
    
    /* ────────────────────────────────────────────────────────── */
    SILENCE: {
      fichier: 'Collaboration/Chapitre2/Silence.mp3',
      type: 'loop',
      contexte: 'Transition Chapitre 2 → Collaboration',
      
      volume: () => CONFIG.AUDIO.silence_vol,             // 0.75
      fade_in_ms: () => CONFIG.AUDIO.silence_fade_in,     // 1200
      fade_out_ms: () => CONFIG.AUDIO.silence_fade_out,   // 1800
    },
    
    /* ────────────────────────────────────────────────────────── */
    COLLABORATION: {
      fichier: 'sons/collaboration.mp3',
      type: 'loop',
      contexte: 'Musique de l\'espace collaboration',
      
      volume: () => CONFIG.AUDIO.collab_vol,              // 1.0
      fade_in_ms: () => CONFIG.AUDIO.collab_fade_in,      // 2500
      fade_out_ms: () => CONFIG.AUDIO.collab_fade_out,    // 2000
    },
    
  },


/* ══════════════════════════════════════════════════════════════════
   [18] VUE PAR TYPE — Regroupement par catégorie
   ══════════════════════════════════════════════════════════════════ */

  _BY_TYPE: {
    
    /* ── TOUTES LES TAILLES DE TORCHE ─────────────────────── */
    TORCH_SIZES: {
      page0_vitrine:      () => CONFIG.TORCH.taille_vitrine,           // 0.65
      page1_phrenologie:  () => CONFIG.TORCH.taille_phren,             // 0.22
      page2_collab:       () => CONFIG.COLLAB.torch_taille,            // 0.45
      page3_phren_fixed:  () => CONFIG.CHAPITRE2.torch_phren,          // 2.0
      page3_interactive:  () => CONFIG.CHAPITRE2.torch_interactive,    // 2.5
      media_reduction:    () => CONFIG.CHAPITRE2.torch_media_dim,      // 0.4
      player_reduction:   () => CONFIG.PLAYER.torch_dim,               // 0.8
    },
    
    /* ── TOUS LES DÉLAIS (TIMING) ───────────────────────────── */
    ALL_TIMINGS_MS: {
      // Page 0
      arrow_page0:        () => CONFIG.TIMING.arrow_appear,            // 6000
      title_start:        () => CONFIG.TIMING.title_start,             // 800
      title_char:         () => CONFIG.TIMING.title_char_delay,        // 65
      
      // Page 1
      docs_appear:        () => CONFIG.TIMING.docs_delay,              // 2200
      navbar_appear:      () => CONFIG.TIMING.navbar_delay,            // 1800
      
      // Page 2
      circles_appear:     () => CONFIG.COLLAB.circles_delay,           // 3500
      circles_stagger:    () => CONFIG.COLLAB.circles_stagger,         // 300
      
      // Transitions
      veil_in:            () => CONFIG.TRANSITION.veil_in,             // 700
      veil_hold:          () => CONFIG.TRANSITION.veil_hold,           // 120
      veil_out:           () => CONFIG.TRANSITION.veil_out,            // 900
      torch_restore:      () => CONFIG.TRANSITION.torch_restore,       // 4000
      title_swap:         () => CONFIG.TITLE_SWAP_MS,                  // 620
      
      // Écran démarrage
      start_fadeout:      () => CONFIG.START_SCREEN.fadeOut,           // 1400
      
      // Player
      player_fadeout:     () => CONFIG.PLAYER.fade_out_ms,             // 950
      player_torch:       () => CONFIG.PLAYER.torch_ms,                // 800
      video_scale:        () => CONFIG.PLAYER.video_scale_duration_ms, // 560
    },
    
    /* ── TOUTES LES COULEURS ────────────────────────────────── */
    ALL_COLORS: {
      gold_title:         () => CONFIG.TITLE.couleur,                  // rgba(210,175,90,1)
      gold_subtitle:      () => CONFIG.FONTS.subtitle.color,           // rgba(210,175,90,0.78)
      white_main:         () => CONFIG.NAV.btn_color,                  // rgba(255,255,255,0.85)
      hover_gold:         () => CONFIG.NAV.btn_color_hover,            // rgba(255,220,120,1) — Utilisé 3x
      hover_title_white:  () => CONFIG.FONTS.hover_title.color,        // rgba(255,255,255,0.82)
      stroke_white:       () => CONFIG.NAV.stroke_color,               // rgba(255,255,255,0.80)
      waveform:           () => CONFIG.PLAYER.wave_color,              // rgba(255,255,255,0.75)
    },
    
  },

};

/* ╔══════════════════════════════════════════════════════════════════╗
   ║                    FIN DE CONFIGURATION                          ║
   ║                                                                  ║
   ║  COMMENT UTILISER LES VUES ORGANISÉES ?                          ║
   ║  ─────────────────────────────────────────────────────────────   ║
   ║                                                                  ║
   ║  1. Pour naviguer rapidement :                                   ║
   ║     CONFIG._PAGES.PAGE_2_COLLABORATION.ui.circles()              ║
   ║                                                                  ║
   ║  2. Pour voir tous les sons :                                    ║
   ║     CONFIG._SOUNDS.MUSEE_LOOP                                    ║
   ║                                                                  ║
   ║  3. Pour voir toutes les tailles de torche :                     ║
   ║     CONFIG._BY_TYPE.TORCH_SIZES                                  ║
   ║                                                                  ║
   ║  4. main.js continue d'utiliser :                                ║
   ║     CONFIG.TORCH.taille_vitrine                                  ║
   ║     CONFIG.AUDIO.musee_vol                                       ║
   ║                                                                  ║
   ║                                                                  ║
   ╚══════════════════════════════════════════════════════════════════╝ */
