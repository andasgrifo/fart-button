const button = document.querySelector('#fart-button');
const countLabel = document.querySelector('#count');
const verdict = document.querySelector('#verdict');
const pressure = document.querySelector('#pressure');
const meter = document.querySelector('#meter-fill');
const toast = document.querySelector('#toast');
const particles = document.querySelector('#particles');

let count = Number(localStorage.getItem('fartCount') || 0);
let toastTimer;
let activeFart;
let lastSample = -1;

// CC0/public-domain recordings hosted by FartSoundboard, Freesound and BigSoundBank.
const samples = [
  'https://fartsoundboard.com/sounds/bad-chili-fart-wav-94989.mp3',
  'https://fartsoundboard.com/sounds/fart-000303-0158s3-085-087-000-079-031-0-558386.mp3',
  'https://fartsoundboard.com/sounds/fart-000303-0166s3-035-037-000-091-026-0-558385.mp3',
  'https://fartsoundboard.com/sounds/fart-01-242004.mp3',
  'https://fartsoundboard.com/sounds/fart-04-243715.mp3',
  'https://fartsoundboard.com/sounds/fart-1-163378.mp3',
  'https://fartsoundboard.com/sounds/fart-2-163382.mp3',
  'https://fartsoundboard.com/sounds/chair-fart-266450.mp3',
  'https://cdn.freesound.org/previews/640/640798_2628301-hq.mp3',
  'https://cdn.freesound.org/previews/640/640804_2628301-hq.mp3',
  'https://cdn.freesound.org/previews/521/521093_2628301-hq.mp3',
  'https://bigsoundbank.com/UPLOAD/mp3/1031.mp3'
];

const messages = [
  'TOOT DEPLOYED', 'CHEEKS CLEARED', 'GAS RELEASED', 'TROUSER THUNDER',
  'WHO CUT THE CHEESE?', 'AIR BISCUIT SERVED', 'PRESSURE NORMALIZED', 'ABSOLUTE STINKER'
];

const verdicts = [
  'Air quality: regrettable', 'Neighbors alerted: probably', 'Dignity level: critical',
  'Window status: open it', 'Odor radius: expanding', 'Scientific value: enormous'
];

function updateCount() {
  countLabel.textContent = String(count).padStart(3, '0');
}

function chooseSample() {
  let index = lastSample;
  while (index === lastSample) index = Math.floor(Math.random() * samples.length);
  lastSample = index;
  return samples[index];
}

function playWebFart(onFinished, retry = true) {
  if (activeFart) {
    activeFart.onerror = null;
    activeFart.onended = null;
    activeFart.pause();
    activeFart.removeAttribute('src');
  }

  const audio = new Audio(chooseSample());
  let failed = false;
  activeFart = audio;
  audio.preload = 'auto';
  audio.volume = .9;
  audio.playbackRate = .93 + Math.random() * .14;
  audio.preservesPitch = false;
  audio.onended = onFinished;
  audio.onerror = () => {
    if (failed) return;
    failed = true;
    if (retry) playWebFart(onFinished, false);
    else {
      verdict.textContent = 'Web fart unavailable — check your connection';
      onFinished();
    }
  };
  audio.play().catch(() => audio.onerror());
}

function spawnGas() {
  const rect = button.getBoundingClientRect();
  for (let i = 0; i < 18; i += 1) {
    const puff = document.createElement('i');
    const angle = Math.random() * Math.PI * 2;
    const distance = 70 + Math.random() * 170;
    puff.className = 'puff';
    puff.style.setProperty('--x', `${rect.left + rect.width / 2 + (Math.random() - .5) * 45}px`);
    puff.style.setProperty('--y', `${rect.top + rect.height / 2 + (Math.random() - .5) * 45}px`);
    puff.style.setProperty('--size', `${18 + Math.random() * 45}px`);
    puff.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    puff.style.setProperty('--dy', `${Math.sin(angle) * distance - 45}px`);
    puff.style.setProperty('--duration', `${.7 + Math.random() * .8}s`);
    particles.append(puff);
    setTimeout(() => puff.remove(), 1600);
  }
}

function resetPressure() {
  pressure.textContent = 'PRESSURE: READY';
  meter.style.width = '5%';
}

function releaseGas() {
  playWebFart(resetPressure);
  count += 1;
  localStorage.setItem('fartCount', count);
  updateCount();
  spawnGas();

  toast.textContent = messages[Math.floor(Math.random() * messages.length)];
  toast.classList.remove('show');
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1100);

  verdict.textContent = verdicts[Math.floor(Math.random() * verdicts.length)];
  pressure.textContent = 'PRESSURE: STREAMING';
  meter.style.width = `${65 + Math.random() * 35}%`;
  document.body.classList.remove('rumble');
  requestAnimationFrame(() => document.body.classList.add('rumble'));
  if (navigator.vibrate) navigator.vibrate([55, 25, 90]);

  button.classList.add('pressed');
  setTimeout(() => button.classList.remove('pressed'), 160);
}

button.addEventListener('click', releaseGas);
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !event.repeat) {
    event.preventDefault();
    releaseGas();
  }
});

updateCount();
