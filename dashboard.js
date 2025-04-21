// dashboard.js

// NAVIGATION
const sections = ['dashboard','history','analytics','settings'];
sections.forEach(name => {
  document.getElementById('nav-'+name).addEventListener('click', () => {
    sections.forEach(s => {
      document.getElementById('section-'+s).style.display = (s === name ? 'block' : 'none');
      document.getElementById('nav-'+s).classList.toggle('active', s === name);
    });
  });
});

// LIVE FEED ERROR HANDLING
const feed = document.getElementById('videoFeed');
const feedStatus = document.getElementById('feedStatus');
feed.onerror = () => {
  feedStatus.textContent = '❌ Feed disconnected. Reconnecting...';
  feedStatus.className = 'text-danger';
  setTimeout(() => feed.src = feed.src, 3000);
};

// CANVAS OVERLAY
const canvas = document.getElementById('overlayCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width = feed.clientWidth;
  canvas.height = feed.clientHeight;
}
async function getDetections() {
  try {
    const res = await fetch('http://127.0.0.1:5000/detections');
    return await res.json();
  } catch {
    return [];
  }
}
async function drawOverlay() {
  if (!feed.complete) return;
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dets = await getDetections();
  const now = new Date();
  dets.forEach(d => {
    ctx.strokeStyle = 'red'; ctx.lineWidth = 2;
    ctx.strokeRect(d.x, d.y, d.width, d.height);
    ctx.fillStyle = 'rgba(255,0,0,0.7)';
    ctx.font = '16px Arial';
    ctx.fillText(d.label, d.x + 4, d.y - 4);

    // also push into alerts list
    const time = now.toLocaleTimeString();
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `🔴 ${d.label} detected at ${time}`;
    document.getElementById('alertsList').prepend(li);
  });
}
setInterval(drawOverlay, 500);
window.addEventListener('resize', resizeCanvas);
feed.onload = resizeCanvas;

// HISTORY PANEL
let historyData = [];
async function fetchHistory() {
  try {
    const res = await fetch('http://127.0.0.1:5000/history');
    historyData = await res.json();
  } catch {
    historyData = [];
  }
  renderHistory(historyData);
}
function renderHistory(data) {
  const tbody = document.getElementById('historyBody');
  tbody.innerHTML = '';
  data.forEach(e => {
    const row = `<tr><td>${e.timestamp}</td><td>${e.weapon}</td><td>${e.location}</td></tr>`;
    tbody.insertAdjacentHTML('beforeend', row);
  });
}
document.getElementById('filterWeapon').addEventListener('input', filterHistory);
document.getElementById('filterLocation').addEventListener('input', filterHistory);
document.getElementById('resetFilters').addEventListener('click', () => {
  document.getElementById('filterWeapon').value = '';
  document.getElementById('filterLocation').value = '';
  renderHistory(historyData);
});
function filterHistory() {
  const w = document.getElementById('filterWeapon').value.toLowerCase();
  const l = document.getElementById('filterLocation').value.toLowerCase();
  renderHistory(historyData.filter(e =>
    e.weapon.toLowerCase().includes(w) &&
    e.location.toLowerCase().includes(l)
  ));
}
fetchHistory();

// ANALYTICS PANEL
let chart, analyticsData = { labels: [], counts: [] };
async function fetchAnalytics() {
  try {
    const res = await fetch('http://127.0.0.1:5000/analytics');
    analyticsData = await res.json();
  } catch {
    analyticsData = { labels: [], counts: [] };
  }
  renderChart('bar');
}
function renderChart(type) {
  const ctx2 = document.getElementById('detectionChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx2, {
    type,
    data: {
      labels: analyticsData.labels,
      datasets: [{ label: 'Detections', data: analyticsData.counts, borderWidth: 2, fill: type !== 'line' }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}
document.getElementById('btnBar').addEventListener('click', () => renderChart('bar'));
document.getElementById('btnLine').addEventListener('click', () => renderChart('line'));
fetchAnalytics();