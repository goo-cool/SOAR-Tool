/* ═══════════════════════════════════════════════════
   SOAR Tool — Frontend Application Logic
   Orchestrates all 4 modules via API calls
═══════════════════════════════════════════════════ */

// ── Background canvas ────────────────────────────────
(function() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let nodes = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Create floating nodes
  for (let i = 0; i < 40; i++) {
    nodes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,180,255,${0.06 * (1 - d / 140)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    // draw nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,180,255,0.25)';
      ctx.fill();
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Clock ────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleTimeString('en-US', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// ── Tab navigation ────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
    const titles = {
      overview: 'Security Operations Overview',
      detection: 'Module 01 — Threat Detection',
      intelligence: 'Module 02 — Threat Intelligence',
      response: 'Module 03 — Automated Response',
      timeline: 'Module 04 — Incident Timeline'
    };
    document.getElementById('page-title').textContent = titles[tab];
  });
});

// ── Charts ────────────────────────────────────────────
let barChart = null, radarChart = null;

function initBarChart(data) {
  const ctx = document.getElementById('barChart').getContext('2d');
  if (barChart) barChart.destroy();

  const colors = data.map(d =>
    d.severity === 'Critical' ? 'rgba(255,51,85,0.8)' : 'rgba(255,170,0,0.8)'
  );

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.ip),
      datasets: [{
        label: 'Failed Login Attempts',
        data: data.map(d => d.count),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0b1220',
          borderColor: '#1e2e42', borderWidth: 1,
          titleColor: '#00d4ff', bodyColor: '#b8cfe0',
          callbacks: {
            title: items => items[0].label,
            label: item => ` ${item.raw} failed attempts`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#2e4860', font: { family: 'DM Mono', size: 9 }, maxRotation: 30 },
          grid: { color: '#162030' }
        },
        y: {
          ticks: { color: '#2e4860', font: { family: 'DM Mono', size: 10 } },
          grid: { color: '#162030' }
        }
      }
    }
  });
}

function initRadarChart(alerts) {
  const ctx = document.getElementById('radarChart').getContext('2d');
  if (radarChart) radarChart.destroy();

  const labels = alerts.map(a => a.ip.split('.').slice(-2).join('.'));
  const scores = alerts.map(a => a.intel ? a.intel.score : 50);
  const counts = alerts.map(a => Math.min(a.failed_count, 40));

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'Threat Score',
          data: scores,
          borderColor: 'rgba(255,51,85,0.8)',
          backgroundColor: 'rgba(255,51,85,0.1)',
          pointBackgroundColor: 'rgba(255,51,85,1)',
          pointRadius: 3,
        },
        {
          label: 'Attack Volume',
          data: counts,
          borderColor: 'rgba(0,212,255,0.8)',
          backgroundColor: 'rgba(0,212,255,0.08)',
          pointBackgroundColor: 'rgba(0,212,255,1)',
          pointRadius: 3,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#5c7a94', font: { family: 'DM Mono', size: 10 }, boxWidth: 10 }
        }
      },
      scales: {
        r: {
          grid: { color: '#162030' },
          pointLabels: { color: '#2e4860', font: { family: 'DM Mono', size: 9 } },
          ticks: { display: false },
          angleLines: { color: '#162030' }
        }
      }
    }
  });
}

// ── Severity / classification helpers ─────────────────
function sevBadge(s) {
  const m = { Critical: 'badge-crit', High: 'badge-high', Medium: 'badge-med' };
  return `<span class="badge ${m[s] || 'badge-med'}">${s}</span>`;
}
function classBadge(c) {
  const m = { malicious: 'badge-mal', suspicious: 'badge-sus', clean: 'badge-clean' };
  return `<span class="badge ${m[c] || 'badge-clean'}">${c.toUpperCase()}</span>`;
}
function statusBadge(s) {
  const m = { 'Auto-Blocked': 'badge-blk', 'Under Review': 'badge-rev' };
  return `<span class="badge ${m[s] || 'badge-med'}">${s}</span>`;
}
function scoreColor(n) {
  if (n >= 75) return '#ff3355';
  if (n >= 40) return '#ffaa00';
  return '#00e88a';
}

// ── Render alerts table ───────────────────────────────
function renderAlertsTable(alerts) {
  const tbody = document.getElementById('alerts-tbody');
  if (!alerts.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="tbl-empty">No alerts detected.</td></tr>';
    return;
  }
  tbody.innerHTML = alerts.map(a => {
    const intel = a.intel || {};
    const score = intel.score || 0;
    const cls = intel.classification || 'unknown';
    return `<tr>
      <td class="mono-cell">${a.id}</td>
      <td class="mono-cell">${a.ip}</td>
      <td><strong>${a.failed_count}</strong></td>
      <td>${sevBadge(a.severity)}</td>
      <td>
        <div class="score-bar-wrap">
          <div class="score-bar"><div class="score-fill" style="width:${score}%;background:${scoreColor(score)}"></div></div>
          <span style="font-family:var(--font-m);font-size:10px;color:${scoreColor(score)}">${score}</span>
        </div>
      </td>
      <td>${classBadge(cls)}</td>
      <td>${statusBadge(a.status)}</td>
      <td><button class="btn-sm" onclick="showPlaybook('${a.id}', '${a.ip}')">View Playbook</button></td>
    </tr>`;
  }).join('');
}

// ── Render Intel Cards ────────────────────────────────
function renderIntelCards(alerts) {
  const container = document.getElementById('intel-cards');
  const enriched = alerts.filter(a => a.intel);
  if (!enriched.length) {
    container.innerHTML = '<div class="intel-placeholder">No intelligence data yet…</div>';
    return;
  }
  container.innerHTML = enriched.map(a => {
    const i = a.intel;
    const cls = i.classification;
    const tags = (i.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
    return `<div class="intel-card ${cls}">
      <div class="intel-hdr">
        <span class="intel-ip">${a.ip}</span>
        <div class="intel-score">
          <div class="score-ring ${cls}">${i.score}</div>
          ${classBadge(cls)}
        </div>
      </div>
      <div class="intel-body">
        <div class="intel-row"><span class="intel-key">Reports</span><span class="intel-val">${i.reports}</span></div>
        <div class="intel-row"><span class="intel-key">Country</span><span class="intel-val">${i.country}</span></div>
        <div class="intel-row"><span class="intel-key">ISP</span><span class="intel-val">${i.isp}</span></div>
        <div class="intel-row"><span class="intel-key">Last Seen</span><span class="intel-val">${i.last_reported}</span></div>
        <div class="intel-row"><span class="intel-key">Source</span><span class="intel-val">${i.source}</span></div>
        <div class="intel-row" style="flex-wrap:wrap;gap:4px"><span class="intel-key" style="width:100%;margin-bottom:4px">Tags</span>${tags || '<span class="intel-val">none</span>'}</div>
      </div>
    </div>`;
  }).join('');
}

// ── Render Timeline ────────────────────────────────────
function renderTimeline(timeline) {
  const body = document.getElementById('timeline-body');
  if (!timeline.length) {
    body.innerHTML = '<div class="tl-empty">No events yet…</div>';
    return;
  }
  body.innerHTML = timeline.map(ev => `
    <div class="tl-item">
      <div class="tl-dot ${ev.type}"></div>
      <div class="tl-right">
        <div class="tl-time">${ev.time}</div>
        <div class="tl-event">${ev.event}</div>
        <div class="tl-ip">${ev.ip}</div>
      </div>
    </div>
  `).join('');
}

// ── Render Playbook Results ────────────────────────────
function renderPlaybookResults(playbooks) {
  const container = document.getElementById('playbook-results');
  document.getElementById('pb-count').textContent = `${playbooks.length} playbook${playbooks.length !== 1 ? 's' : ''} run`;

  if (!playbooks.length) {
    container.innerHTML = '<div class="tbl-empty" style="padding:32px;text-align:center">No playbooks executed yet.</div>';
    return;
  }

  container.innerHTML = playbooks.map(pb => `
    <div class="pb-result-card">
      <div class="pb-result-hdr">
        <div>
          <div class="pb-result-ip">${pb.ip}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:3px">${pb.playbook} · ${pb.started_at}</div>
        </div>
        <span class="badge badge-blk">COMPLETED</span>
      </div>
      <div class="pb-result-body">
        ${pb.actions.map(a => `
          <div class="pb-step done">
            <div class="pb-step-icon">${a.icon}</div>
            <div>
              <div class="pb-step-name">Step ${a.step}: ${a.name}</div>
              <div class="pb-step-detail">${a.detail}</div>
            </div>
            <div class="pb-step-ts">${a.timestamp}</div>
          </div>
        `).join('')}
      </div>
      <div class="pb-mitre">MITRE: ${pb.mitre_tactics.join(' · ')}</div>
    </div>
  `).join('');
}

// ── Render Detection Tab ──────────────────────────────
function renderDetectionTab(data) {
  document.getElementById('det-total').textContent = data.summary.total_logs;
  document.getElementById('det-failed').textContent = data.summary.failed_logins;
  document.getElementById('det-alerts').textContent = data.summary.alerts_generated;
  const accepted = data.summary.total_logs - data.summary.failed_logins;
  document.getElementById('det-accepted').textContent = accepted;

  const terminal = document.getElementById('det-logs');
  terminal.innerHTML = (data.sample_logs || []).map(log => {
    const isFail = log.includes('Failed');
    return `<div class="${isFail ? 'fail' : 'ok'}">${log}</div>`;
  }).join('');
  terminal.scrollTop = terminal.scrollHeight;
}

// ── Render Log Feed (overview) ────────────────────────
function renderLogFeed(logs) {
  const feed = document.getElementById('log-feed');
  feed.innerHTML = '';
  logs.forEach((log, i) => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = `log-entry ${log.includes('Failed') ? 'fail' : 'ok'}`;
      div.textContent = log;
      feed.appendChild(div);
      feed.scrollTop = feed.scrollHeight;
    }, i * 80);
  });
}

// ── Animate playbook flow nodes ───────────────────────
async function animatePlaybookFlow() {
  for (let i = 1; i <= 7; i++) {
    const node = document.getElementById(`pb-${i}`);
    if (!node) continue;
    node.classList.add('pb-running');
    await delay(600);
    node.classList.remove('pb-running');
    node.classList.add('pb-done');
  }
}

// ── Show playbook modal ───────────────────────────────
async function showPlaybook(alertId, ip) {
  document.getElementById('modal-title').textContent = `Playbook — ${ip}`;
  document.getElementById('modal-body').innerHTML = '<div style="text-align:center;padding:32px"><div class="spin"></div><div style="margin-top:12px;color:var(--text3);font-size:12px">Loading execution log…</div></div>';
  document.getElementById('modal-bg').classList.add('open');

  try {
    const res = await fetch(`/api/playbook/run/${alertId}/${ip}`);
    const pb = await res.json();
    document.getElementById('modal-body').innerHTML = `
      <div style="margin-bottom:12px;font-size:11px;color:var(--text3);font-family:var(--font-m)">
        ${pb.playbook} · Started ${pb.started_at} · Completed ${pb.completed_at}
      </div>
      ${pb.actions.map(a => `
        <div class="pb-step done" style="margin-bottom:1px;border-radius:4px">
          <div class="pb-step-icon">${a.icon}</div>
          <div style="flex:1">
            <div class="pb-step-name">Step ${a.step}: ${a.name}</div>
            <div class="pb-step-detail">${a.description}</div>
            <div class="pb-step-detail" style="color:var(--mono);margin-top:2px">${a.detail}</div>
          </div>
          <div class="pb-step-ts">${a.timestamp}</div>
        </div>
      `).join('')}
      <div style="margin-top:14px;padding:10px 12px;background:var(--bg2);border-radius:6px;font-family:var(--font-m);font-size:10px;color:var(--text3)">
        <div style="margin-bottom:4px">MITRE ATT&CK: ${pb.mitre_tactics.join(' · ')}</div>
        <div style="color:var(--green)">${pb.outcome}</div>
      </div>
    `;
  } catch (e) {
    document.getElementById('modal-body').innerHTML = '<div style="color:var(--red);padding:20px">Failed to load playbook data.</div>';
  }
}

function closeModal() {
  document.getElementById('modal-bg').classList.remove('open');
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── MAIN: Run Full Pipeline ───────────────────────────
async function runFullPipeline() {
  const btn = document.getElementById('run-pipeline-btn');
  const status = document.getElementById('pipeline-status');
  const pip = status.querySelector('.pip-dot');

  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span> Running Pipeline…';
  pip.className = 'pip-dot running';
  status.innerHTML = '<span class="pip-dot running"></span> Pipeline Running';

  try {
    const res = await fetch('/api/demo/full');
    const data = await res.json();

    // ── Update summary cards
    const cardData = [
      { id: 'c-logs',    val: data.summary.total_logs },
      { id: 'c-failed',  val: data.summary.failed_logins },
      { id: 'c-alerts',  val: data.summary.alerts_generated },
      { id: 'c-blocked', val: data.summary.auto_blocked },
    ];
    cardData.forEach(c => {
      const el = document.getElementById(c.id);
      el.textContent = c.val;
      el.closest('.card').classList.add('pop');
      setTimeout(() => el.closest('.card').classList.remove('pop'), 500);
    });

    // ── Bar chart
    initBarChart(data.chart_data);

    // ── Log feed
    renderLogFeed(data.sample_logs);

    // ── Alerts table
    renderAlertsTable(data.alerts);

    // ── Detection tab
    renderDetectionTab(data);

    // ── Intel cards
    renderIntelCards(data.alerts);

    // ── Playbook results
    renderPlaybookResults(data.playbooks);

    // ── Animate playbook flow
    animatePlaybookFlow();

    // ── Timeline
    renderTimeline(data.timeline);
    initRadarChart(data.alerts);

    // ── Done
    await delay(800);
    status.innerHTML = '<span class="pip-dot done"></span> Pipeline Complete';
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run Again';

  } catch (err) {
    console.error(err);
    status.innerHTML = '<span class="pip-dot" style="background:var(--red)"></span> Pipeline Error';
    btn.disabled = false;
    btn.innerHTML = '⚠ Retry Pipeline';
  }
}

// Auto-run on load after brief delay
setTimeout(() => runFullPipeline(), 800);
