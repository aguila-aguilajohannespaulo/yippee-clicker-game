// Let Currency be YIPPEE (Shown in label)
const CURRENCY_NAME = 'YIPPEE';

// Milestone images - Main center PNG switches everytime the milestone hits
const MILESTONE_IMAGES = [
  { total: 0,      src: 'assets/img/YippeeBase.png'       },
  { total: 100,    src: 'assets/img/Milestone1Yippee.png' },
  { total: 1000,   src: 'assets/img/Milestone2Yippee.png' },
  { total: 10000,  src: 'assets/img/Milestone3Yippee.png' },
  { total: 100000, src: 'assets/img/Milestone4Yippee.png' },
  { total: 1000000, src: 'assets/img/Milestone5Yippee.png' },
];
// Upgrades - Can be modified and added more if needed
const UPGRADES = [
  { id:'cursor', name:'Scrolling Clicks', icon:'🖱️', desc:'+1/sec per click — Provides off-scrolling (auto-click) YIPPEES!', baseCost:15, costMult:1, cps:1, cpc:0, count:0 },
  { id:'unc', name:'Unc Status', icon:'👵', desc:'+5/sec per unc — Inviting Unc Status people for YIPPEES!', baseCost:50, costMult:1.10, cps:5, cpc:0, count:0 },
  { id:'fake', name:'Fake Yippee Creatures', icon:'👥', desc:'+25/sec per fake — Fake Yippees joins in..', baseCost:1100, costMult:1.15, cps:25, cpc:0, count:0 },
  { id:'neighbor', name:'Neighbor Yippee',  icon:'🙋', desc:'+50/sec per neighbor — Neighbors says hi!', baseCost:12000, costMult:1.2, cps:50, cpc:0, count:0 },
  { id:'god', name:'TUNG TUNG YIPPEE GOD', icon:'😶‍🌫️', desc:'+200/sec per Tung Tung Yippee God — Tung Yippee God helps you', baseCost:420000, costMult:2, cps:200,  cpc:0, count:0 },
  { id:'enhance_click', name:'Superior Click', icon:'💪', desc:'+1 per click — Strengthen your YIPPEE', baseCost:25, costMult:1, cps:0, cpc:1, count:0 },
  { id:'better_click', name:'Aura Training', icon:'🙎🏼', desc:'+5 per click — Nonchalant Pose = AURA!', baseCost:250, costMult:1.10, cps:0, cpc:5, count:0 },
  { id:'brainrot_click', name:'Brainrot Scrolling', icon:'📲', desc:'+50 per click — Doomscrolling Instagram', baseCost:2300, costMult:1.15, cps:0, cpc:50, count:0 },
  { id:'aura_click', name:'Aura Farmer', icon:'🧘🏼', desc:'+250 per click — "Im Stronger, Im smarter, IM BETTER"', baseCost:200000, costMult:1.2, cps:0, cpc:250, count:0 },
  { id:'godly_click', name:'YIPPEE STRENGTH!', icon:'⛓️‍💥', desc:'+500 per click — Yippee StrongMan helps you out', baseCost:676767, costMult:1.25, cps:0, cpc:500, count:0 },
  { id:'dog', name:'Doggy Support!', icon:'🐶', desc:'+250 per click and 250 per second — Paulos Dog floats for YIPPEEs', baseCost:50000, costMult:3, cps:250, cpc:250, count:0 },
  { id:'cat', name:'Kitty Support!', icon:'🐱', desc:'+500 per click and 500 per second — Lilys Cat floats for YIPPEEs', baseCost:100000, costMult:3, cps:500, cpc:500, count:0 },
];
// Milestone - Provides the needed requirements for the milestone to achieve (and pop up a notification)
const MILESTONES = [
  { total:100,    id:'ms-100',  label:'💩 100 YIPPEESSS!'             },
  { total:1000,   id:'ms-1k',   label:'🤡 1,000 YIPPEESSS!'           },
  { total:10000,  id:'ms-10k',  label:'😲 10,000 YIPPEESSS!'          },
  { total:100000, id:'ms-100k', label:'😈 100,000 YIPPEESSS!'         },
  { total:1e6,    id:'ms-1m',   label:'🎉 ONE MILLION YIPPEESSS! :DD' },
];
// The url for the firebase database
const FIREBASE_DB_URL = 'https://yippeeclicker-default-rtdb.asia-southeast1.firebasedatabase.app';
// Save Key - Used per account using the Firebase UID, set by the maingame.html once the authentication has been confirmed and put into place
let SAVE_KEY = 'clicker_save_guest'; // fallback if no UID yet

function setSaveKey(uid) {
  SAVE_KEY = 'clicker_save_' + uid; // Each user logged onto the game has different save slots
}
// State - Used for upgrades
let state = { yippee: 0, totalEarned: 0, clicks: 0 };

const calcCPC = () => 1 + UPGRADES.reduce((s, u) => s + u.cpc * u.count, 0);
const calcCPS = () =>     UPGRADES.reduce((s, u) => s + u.cps * u.count, 0);
const upgradeCost = u  => Math.floor(u.baseCost * Math.pow(u.costMult, u.count));

// Milestone Images functionality - Updates based on total earned YIPPEEs
let _lastMilestoneImg = '';
function updateClickerImage() {
  let imgSrc = MILESTONE_IMAGES[0].src;
  for (const m of MILESTONE_IMAGES) {
    if (state.totalEarned >= m.total) imgSrc = m.src;
  }
  if (imgSrc !== _lastMilestoneImg) {
    const el = document.getElementById('clicker-img');
    if (el) { el.src = imgSrc; _lastMilestoneImg = imgSrc; }
  }
}

// Floating Upgrade Characters - Showcases the users that they've bought something beneficial and adds display on to the board.
// Buying more upgrades adds more characters!
const FLOAT_CONFIGS = [
  { upgradeId: 'fake',    src: 'assets/img/Yippee1.png', maxCount: 8, minOpacity: 0.04, maxOpacity: 0.10, size: 30  },
  { upgradeId: 'neighbor',    src: 'assets/img/Upgrade4.png', maxCount: 6, minOpacity: 0.06, maxOpacity: 0.18, size: 60  },
  { upgradeId: 'god', src: 'assets/img/Upgrade5.png', maxCount: 5, minOpacity: 0.10, maxOpacity: 0.25, size: 100  },
  { upgradeId: 'godly_click', src: 'assets/img/Upgrade10.png', maxCount: 2, minOpacity: 0.10, maxOpacity: 0.15, size: 130  },
  { upgradeId: 'dog', src: 'assets/img/DogUpgrade.png', maxCount: 1, minOpacity: 0.10, maxOpacity: 0.10, size: 70  },
  { upgradeId: 'cat', src: 'assets/img/CatUpgrade.png', maxCount: 1, minOpacity: 0.10, maxOpacity: 0.10, size: 70  },
];

let _floatSprites    = [];   // Checks active DOM elements
let _lastFloatCounts = {};   // Tracks last rendered counts to avoid thrashing

// Updates the board everytime a character gets added
function updateFloatingChars() {
  const container = document.getElementById('panel-main');
  if (!container) return;

  FLOAT_CONFIGS.forEach(cfg => {
    const upgrade = UPGRADES.find(u => u.id === cfg.upgradeId);
    if (!upgrade) return;

    // Number of floating characters = min(upgrade count, maxCount)
    const desired = Math.min(upgrade.count, cfg.maxCount);
    const key     = cfg.upgradeId;

    // Only rebuild if current count got changed
    if (_lastFloatCounts[key] === desired) return;
    _lastFloatCounts[key] = desired;

    // Removing existing floaters for this upgrade
    container.querySelectorAll(`.float-char[data-uid="${key}"]`).forEach(el => el.remove());

    for (let i = 0; i < desired; i++) {
      const el = document.createElement('img');
      el.src              = cfg.src;
      el.className        = 'float-char';
      el.dataset.uid      = key;

      // Randomizing its position, size, opacity, animation duration every upgrade (until max)
      const scale   = 0.6 + Math.random() * 0.8;
      const size    = cfg.size * scale;
      const opacity = cfg.minOpacity + Math.random() * (cfg.maxOpacity - cfg.minOpacity);
      const dur     = 8 + Math.random() * 12;          // From 8–20 seconds float cycle
      const delay   = -(Math.random() * dur);           // Randomized start offset
      const left    = 5 + Math.random() * 85;           // Located either 5–90% across panel
      const top     = 5 + Math.random() * 80;           // Located either 5–85% down panel

      el.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: auto;
        left: ${left}%;
        top: ${top}%;
        opacity: ${opacity};
        pointer-events: none;
        z-index: 0;
        animation: floatBob ${dur}s ease-in-out ${delay}s infinite;
        filter: blur(${upgrade.count <= 2 ? 1.5 : 0.5}px);
        transform-origin: center;
      `;

      container.appendChild(el);
    }
  });
}

// Rendering
function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}

function renderHUD() {
  document.getElementById('main-count').textContent  = fmt(state.yippee) + ' ' + CURRENCY_NAME;
  document.getElementById('cps-display').textContent = fmt(calcCPS()) + ' per second';
  document.getElementById('stat-total').textContent  = fmt(state.totalEarned);
  document.getElementById('stat-cpc').textContent    = fmt(calcCPC());
  document.getElementById('stat-cps').textContent    = fmt(calcCPS());
  document.getElementById('stat-clicks').textContent = state.clicks.toLocaleString();
}

let _lastAffordability = [];
let _forceUpgradeRender = true;

function renderUpgrades() {
  const newAffordability = UPGRADES.map(u => state.yippee >= upgradeCost(u));
  const changed = _forceUpgradeRender ||
    newAffordability.some((v, i) => v !== _lastAffordability[i]);
  if (!changed) return;
  _lastAffordability = newAffordability;
  _forceUpgradeRender = false;

  const list = document.getElementById('upgrades-list');
  list.innerHTML = '';
  UPGRADES.forEach((u, i) => {
    const cost = upgradeCost(u);
    const ok   = newAffordability[i];
    const card = document.createElement('div');
    card.className = 'upgrade-card' + (ok ? '' : ' disabled');
    card.innerHTML = `
      <div class="upgrade-header">
        <span class="upgrade-icon">${u.icon}</span>
        <span class="upgrade-name">${u.name}</span>
        <span class="upgrade-count">${u.count}</span>
      </div>
      <div class="upgrade-desc">${u.desc}</div>
      <button class="upgrade-btn">${ok ? '💰 ' : '🔒 '}${fmt(cost)}</button>`;
    card.addEventListener('click', () => {
      if (state.yippee >= upgradeCost(u)) buyUpgrade(u);
    });
    list.appendChild(card);
  });
}

function checkMilestones() {
  MILESTONES.forEach(m => {
    const el = document.getElementById(m.id);
    if (state.totalEarned >= m.total && el && !el.classList.contains('achieved')) {
      el.classList.add('achieved');
      flashBanner(m.label);
    }
  });
  updateClickerImage();
}

let bannerTO;
function flashBanner(text) {
  const b = document.getElementById('milestone-banner');
  b.textContent = text;
  b.classList.add('show');
  clearTimeout(bannerTO);
  bannerTO = setTimeout(() => b.classList.remove('show'), 2500);
}

function render() {
  renderHUD();
  renderUpgrades();
  updateFloatingChars();
}

// Actions
function handleClick(e) {
  const clickSound = new Audio('assets/sound/sfx1.mp3');
  clickSound.volume = 0.1;
  clickSound.play();

  const earned = calcCPC();
  state.yippee     += earned;
  state.totalEarned += earned;
  state.clicks++;

  checkMilestones();
  spawnParticle(e, '+' + fmt(earned));
  render();
}

function buyUpgrade(u) {
  const cost = upgradeCost(u);
  if (state.yippee < cost) return;
  state.yippee -= cost;
  u.count++;
  _forceUpgradeRender = true;
  render();
}

function spawnParticle(e, text) {
  const main = document.getElementById('panel-main');
  const rect = main.getBoundingClientRect();
  const p = document.createElement('div');
  p.className   = 'click-particle';
  p.textContent = text;
  p.style.left  = ((e.clientX || rect.left + rect.width  / 2) - rect.left - 20) + 'px';
  p.style.top   = ((e.clientY || rect.top  + rect.height / 2) - rect.top  - 20) + 'px';
  p.style.zIndex = 5;
  main.appendChild(p);
  setTimeout(() => p.remove(), 950);
}

// Passive Income Looped Function
let lastTick = Date.now();
function gameTick() {
  const now     = Date.now();
  const dt      = (now - lastTick) / 1000;
  lastTick      = now;
  const passive = calcCPS() * dt;
  if (passive > 0) {
    state.yippee     += passive;
    state.totalEarned += passive;
    checkMilestones();
  }
  render();
}
setInterval(gameTick, 100);

// Save and Loading game data used per account through save_key
function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    state,
    upgradeCounts: UPGRADES.map(u => ({ id: u.id, count: u.count }))
  }));
  pushLeaderboard();

  const ind  = document.getElementById('credits-text');
  const orig = ind.textContent;
  ind.textContent = '✓ Game AutoSaved!';
  setTimeout(() => ind.textContent = orig, 2000);
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    Object.assign(state, data.state);
    (data.upgradeCounts || []).forEach(s => {
      const u = UPGRADES.find(u => u.id === s.id);
      if (u) u.count = s.count;
    });
    MILESTONES.forEach(m => {
      const el = document.getElementById(m.id);
      if (el && state.totalEarned >= m.total) el.classList.add('achieved');
    });
    updateClickerImage();
    _forceUpgradeRender = true;
    render();
  } catch (e) { console.warn('Load failed', e); }
}

function confirmReset() {
  if (confirm('Reset all progress? This cannot be undone.')) {
    localStorage.removeItem(SAVE_KEY);
    state = { yippee: 0, totalEarned: 0, clicks: 0 };
    UPGRADES.forEach(u => u.count = 0);
    _forceUpgradeRender = true;
    _lastFloatCounts = {};
    // Removes all floaters
    document.querySelectorAll('.float-char').forEach(el => el.remove());
    updateClickerImage();
    render();
  }
}
setInterval(saveGame, 30000);

// Leaderboard System with the use of Firebase REST API
function getPlayerName() {
  return localStorage.getItem('playerName') || 'Anonymous';
}

async function pushLeaderboard() {
  const user = firebase.auth().currentUser;
  if (!user) return; 

  const uid   = user.uid;
  const name  = user.displayName || user.email;
  const score = Math.floor(state.totalEarned);

  try {
    // Gets the fresh auth token from Firebase [CREATE]
    const token = await user.getIdToken();
    
    // Appends ?auth=TOKEN to authenticate the REST request
    const url   = `${FIREBASE_DB_URL}/leaderboard/${uid}.json?auth=${token}`;

    const res  = await fetch(url);
    const curr = await res.json();
    if (curr && curr.score >= score) return; 

    await fetch(url, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, score, uid })
    });
    
    // Pass the token to the load function so it can read too [READ]
    loadLeaderboard(token);
  } catch (e) {
    console.warn('Leaderboard push failed:', e);
  }
}
// Loading Function
async function loadLeaderboard(passedToken) {
  const container = document.getElementById('leaderboard-list');
  if (!container) return;

  try {
    // Get token if not passed directly from pushLeaderboard
    const user = firebase.auth().currentUser;
    const token = passedToken || (user ? await user.getIdToken() : null);

    const url = token 
      ? `${FIREBASE_DB_URL}/leaderboard.json?auth=${token}`
      : `${FIREBASE_DB_URL}/leaderboard.json`;

    const res  = await fetch(url);
    const data = await res.json();
    if (!data) {
      container.innerHTML = '<div class="top-users">No scores yet!</div>';
      return;
    }
    const entries = Object.values(data).sort((a, b) => b.score - a.score);
    const medals  = ['🥇', '🥈', '🥉'];
    container.innerHTML = entries.slice(0, 3).map((e, i) =>
      `<div class="top-users">${medals[i]} ${e.name} — ${fmt(e.score)}</div>`
    ).join('');
  } catch (err) {
    container.innerHTML = '<div class="top-users">Could not load</div>';
    console.warn('Leaderboard load failed:', err);
  }
}
// Panel Toggles
function togglePanel(which) {
  const panel       = document.getElementById('panel-' + which);
  const wrap        = document.getElementById(which + '-wrap');
  const tab         = document.getElementById(which + '-tab');
  const isCollapsed = panel.classList.toggle('collapsed');
  wrap.classList.toggle('collapsed', isCollapsed);
  if (which === 'store') {
    tab.innerHTML  = isCollapsed ? '&#10095;' : '&#10094;';
    tab.style.left = isCollapsed ? '0px' : '260px';
  } else {
    tab.innerHTML   = isCollapsed ? '&#10094;' : '&#10095;';
    tab.style.right = isCollapsed ? '0px' : '260px';
  }
}

// INIT Function called from the maingame.html after authentication
function initGame(uid) {
  setSaveKey(uid);   // lock save to this account's UID
  document.getElementById('click-btn').addEventListener('click', handleClick);
  loadGame();
  loadLeaderboard();
  render();
}