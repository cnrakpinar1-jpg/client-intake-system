// ============================================================
// CLIENT INTAKE SYSTEM — script.js
// ============================================================

// ---------- localStorage key ----------
const STORAGE_KEY = 'client-intake-inquiries';

// ---------- Storage helpers ----------

// Read inquiries from localStorage.
// Returns the saved array, or null if nothing is saved yet.
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
    return null;
  }
}

// Write the current inquiries array to localStorage.
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

// ---------- State ----------
let inquiries = [];      // source of truth — kept in sync with localStorage
let activeFilter = 'All';
let searchQuery = '';

// ---------- Avatar color palette ----------
const AVATAR_COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#0891b2',
  '#059669', '#d97706', '#dc2626', '#0284c7'
];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  return name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ---------- Sample seed data ----------
const SEED_DATA = [
  {
    id: uid(),
    fullName: 'Marcus Chen',
    company: 'Brightline Studio',
    email: 'marcus@brightline.io',
    phone: '+1 (415) 882-3301',
    service: 'Web Design',
    budget: '$1,000 – $2,500',
    contactMethod: 'Email',
    summary: 'We need a full redesign of our agency website. Looking for a modern portfolio layout with case studies and a contact form. Must be mobile-first.',
    status: 'Contacted',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: uid(),
    fullName: 'Aisha Patel',
    company: 'GrowthLoop',
    email: 'aisha@growthloop.co',
    phone: '+1 (212) 555-0174',
    service: 'Lead Generation',
    budget: '$2,500+',
    contactMethod: 'WhatsApp',
    summary: 'We run B2B SaaS and need a scalable outbound lead-gen system. Ideally integrated with HubSpot. Monthly retainer preferred.',
    status: 'Qualified',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: uid(),
    fullName: 'Ryan Torres',
    company: '',
    email: 'ryan.t@gmail.com',
    phone: '+1 (310) 201-5599',
    service: 'Automation',
    budget: '$500 – $1,000',
    contactMethod: 'Phone',
    summary: 'Freelancer. I need a Zapier-based automation to connect my Typeform leads to a Google Sheet and send a welcome email automatically.',
    status: 'New',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
];

// ---------- Utility ----------
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ---------- Toast ----------
let toastTimer;
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 2800);
}

// ---------- Stats ----------
function updateStats() {
  // Count each status group once so we don't loop the array five separate times.
  const counts = { New: 0, Contacted: 0, Qualified: 0, Closed: 0 };
  inquiries.forEach(i => { if (counts[i.status] !== undefined) counts[i.status]++; });
  const total = inquiries.length;

  // Header pills (compact view in the sticky bar)
  document.getElementById('statTotal').textContent     = total;
  document.getElementById('statNew').textContent       = counts.New;
  document.getElementById('statQualified').textContent = counts.Qualified;
  document.getElementById('inquiryCount').textContent  = total;

  // Dashboard summary cards
  document.getElementById('dashTotal').textContent     = total;
  document.getElementById('dashNew').textContent       = counts.New;
  document.getElementById('dashContacted').textContent = counts.Contacted;
  document.getElementById('dashQualified').textContent = counts.Qualified;
  document.getElementById('dashClosed').textContent    = counts.Closed;
}

// ---------- Render ----------
function filteredInquiries() {
  return inquiries.filter(inq => {
    const matchFilter = activeFilter === 'All' || inq.status === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || inq.fullName.toLowerCase().includes(q)
      || inq.company.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
}

function renderCards() {
  const list = document.getElementById('inquiriesList');
  const empty = document.getElementById('emptyState');
  const visible = filteredInquiries();

  // Remove existing cards (keep emptyState node)
  list.querySelectorAll('.inquiry-card').forEach(c => c.remove());

  if (visible.length === 0) {
    empty.style.display = '';
    return;
  }

  empty.style.display = 'none';

  visible.forEach(inq => {
    const card = buildCard(inq);
    list.appendChild(card);
  });
}

function buildCard(inq) {
  const card = document.createElement('div');
  card.className = 'inquiry-card';
  card.dataset.id = inq.id;

  const color = avatarColor(inq.fullName);
  const ini   = initials(inq.fullName);

  card.innerHTML = `
    <div class="card-main">
      <div class="card-avatar" style="background:${color}">${ini}</div>

      <div class="card-info">
        <div class="card-name">${escHtml(inq.fullName)}</div>
        <div class="card-company">${escHtml(inq.company || '—')}</div>
      </div>

      <div class="card-tags">
        <span class="tag">${escHtml(inq.service)}</span>
        <span class="tag budget">${escHtml(inq.budget)}</span>
      </div>

      <div class="status-wrap">
        <select class="status-select status-${inq.status}" aria-label="Status" data-action="status">
          ${['New','Contacted','Qualified','Closed'].map(s =>
            `<option value="${s}" ${inq.status === s ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
      </div>

      <div class="card-actions">
        <button class="btn-icon" data-action="expand" title="View details" aria-expanded="false">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button class="btn-icon danger" data-action="delete" title="Delete inquiry">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>

    <div class="card-details" id="details-${inq.id}">
      <div class="details-grid">
        <div class="detail-item">
          <label>Email</label>
          <span>${escHtml(inq.email)}</span>
        </div>
        <div class="detail-item">
          <label>Phone</label>
          <span>${escHtml(inq.phone || '—')}</span>
        </div>
        <div class="detail-item">
          <label>Preferred Contact</label>
          <span>${escHtml(inq.contactMethod)}</span>
        </div>
        <div class="detail-item">
          <label>Budget</label>
          <span>${escHtml(inq.budget)}</span>
        </div>
      </div>
      <div class="summary-block">
        <label>Project Summary</label>
        <p>${escHtml(inq.summary)}</p>
      </div>
      <div class="card-date">Submitted: ${formatDate(inq.createdAt)}</div>
    </div>
  `;

  // Wire up events within this card
  card.querySelector('[data-action="status"]').addEventListener('change', e => {
    updateStatus(inq.id, e.target.value);
    e.target.className = `status-select status-${e.target.value}`;
  });

  card.querySelector('[data-action="expand"]').addEventListener('click', e => {
    const btn     = e.currentTarget;
    const details = document.getElementById(`details-${inq.id}`);
    const isOpen  = details.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    btn.style.transform = isOpen ? 'rotate(180deg)' : '';
    btn.style.transition = 'transform .2s ease';
  });

  card.querySelector('[data-action="delete"]').addEventListener('click', () => {
    deleteInquiry(inq.id);
  });

  return card;
}

// Prevent XSS when rendering user-supplied content
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------- CRUD ----------
function addInquiry(data) {
  const inq = { id: uid(), status: 'New', createdAt: new Date().toISOString(), ...data };
  inquiries.unshift(inq);   // newest first
  saveToStorage();
  renderCards();
  updateStats();
  showToast(`Inquiry from ${inq.fullName} added.`, 'success');
}

function updateStatus(id, status) {
  const inq = inquiries.find(i => i.id === id);
  if (inq) {
    inq.status = status;
    saveToStorage();
    updateStats();
    // Re-apply filter in case status change removes card from current view
    if (activeFilter !== 'All' && activeFilter !== status) {
      document.querySelector(`.inquiry-card[data-id="${id}"]`)?.remove();
      if (filteredInquiries().length === 0) document.getElementById('emptyState').style.display = '';
    }
    showToast(`Status updated to "${status}".`);
  }
}

function deleteInquiry(id) {
  const card = document.querySelector(`.inquiry-card[data-id="${id}"]`);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'scale(.97)';
    card.style.transition = 'opacity .18s ease, transform .18s ease';
    setTimeout(() => {
      inquiries = inquiries.filter(i => i.id !== id);
      saveToStorage();
      renderCards();
      updateStats();
    }, 180);
  }
  showToast('Inquiry deleted.', 'error');
}

// ---------- Form validation ----------
const FIELDS = [
  { id: 'fullName', msg: 'Full name is required.' },
  { id: 'email',   msg: 'A valid email is required.',   check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
  { id: 'service', msg: 'Please select a service.' },
  { id: 'budget',  msg: 'Please select a budget range.' },
  { id: 'summary', msg: 'Project summary is required.' }
];

function validateForm() {
  let valid = true;
  FIELDS.forEach(({ id, msg, check }) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(`err-${id}`);
    const val = el.value.trim();
    const fail = !val || (check && !check(val));
    el.classList.toggle('invalid', fail);
    if (err) err.textContent = fail ? msg : '';
    if (fail) valid = false;
  });
  return valid;
}

function clearValidation() {
  FIELDS.forEach(({ id }) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(`err-${id}`);
    el.classList.remove('invalid');
    if (err) err.textContent = '';
  });
}

// ---------- Form events ----------
document.getElementById('clientForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;

  addInquiry({
    fullName:      document.getElementById('fullName').value.trim(),
    company:       document.getElementById('company').value.trim(),
    email:         document.getElementById('email').value.trim(),
    phone:         document.getElementById('phone').value.trim(),
    service:       document.getElementById('service').value,
    budget:        document.getElementById('budget').value,
    contactMethod: document.getElementById('contactMethod').value,
    summary:       document.getElementById('summary').value.trim()
  });

  document.getElementById('clientForm').reset();
  clearValidation();
});

document.getElementById('clearFormBtn').addEventListener('click', () => {
  document.getElementById('clientForm').reset();
  clearValidation();
});

// Remove invalid class on input
['fullName','email','service','budget','summary'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById(id).classList.remove('invalid');
    const err = document.getElementById(`err-${id}`);
    if (err) err.textContent = '';
  });
});

// ---------- Toggle form ----------
document.getElementById('toggleFormBtn').addEventListener('click', () => {
  const btn  = document.getElementById('toggleFormBtn');
  const form = document.getElementById('intakeForm');
  const open = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', !open);
  btn.querySelector('span').textContent = open ? 'Show Form' : 'Hide Form';
  form.classList.toggle('collapsed', open);
});

// ---------- Search ----------
document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value;
  renderCards();
});

// ---------- Filter pills ----------
document.getElementById('filterPills').addEventListener('click', e => {
  const pill = e.target.closest('.pill');
  if (!pill) return;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  activeFilter = pill.dataset.filter;
  renderCards();
});

// ---------- Init ----------
function init() {
  // Use saved data if it exists; otherwise seed with sample data for first run.
  const saved = loadFromStorage();
  if (saved && saved.length > 0) {
    inquiries = saved;
  } else {
    inquiries = [...SEED_DATA];
    saveToStorage();   // persist the seed data so it survives a refresh too
  }
  renderCards();
  updateStats();
}

init();
