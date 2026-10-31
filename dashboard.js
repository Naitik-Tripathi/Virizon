(() => {
  const STORAGE_PROFILE = 'wasteconnectDemoCompanyV1';
  const STORAGE_LISTINGS = 'wasteconnectDemoListingsV1';
  const app = document.getElementById('dashboardApp');
  const noCompanyState = document.getElementById('noCompanyState');
  const toast = document.getElementById('dashToast');
  const listingDialog = document.getElementById('listingDialog');
  const listingForm = document.getElementById('listingForm');
  let toastTimer;
  let company = readStorage(STORAGE_PROFILE);
  let listings = readStorage(STORAGE_LISTINGS, []);
  if (!Array.isArray(listings)) listings = [];

  function readStorage(key, fallback = null) {
    for (const storeName of ['localStorage', 'sessionStorage']) {
      try {
        const store = window[storeName];
        const raw = store.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch (_) { /* Storage can be blocked in some browsing contexts. */ }
    }
    return fallback;
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (_) {
        notify('Browser storage is unavailable. Changes may not persist after leaving this page.');
        return false;
      }
    }
  }

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function textOrMissing(value) {
    return value && String(value).trim() ? value : 'Not provided';
  }

  if (!company || !company.companyId) {
    app.hidden = true;
    noCompanyState.hidden = false;
    document.getElementById('headerCompanyName').textContent = 'No company profile';
    return;
  }

  app.hidden = false;
  noCompanyState.hidden = true;
  document.title = `${company.companyName || 'Company'} Dashboard | WasteConnect`;
  document.getElementById('headerCompanyName').textContent = company.companyName || 'Company workspace';
  document.getElementById('sidebarCompanyName').textContent = company.companyName || 'Your company';
  document.getElementById('sidebarCompanyId').textContent = company.companyId;
  document.getElementById('mainCompanyId').textContent = company.companyId;
  document.getElementById('companyInitials').textContent = getInitials(company.companyName);
  document.getElementById('welcomeTitle').textContent = `Welcome, ${company.contactName || company.companyName || 'company team'}`;
  document.getElementById('welcomeSubtitle').textContent = `${company.companyName || 'Your company'} workspace. Manage material details and prepare your profile for review.`;

  document.getElementById('returnHome').addEventListener('click', () => { window.location.href = 'index.html'; });
  document.getElementById('copyCompanyIdMain').addEventListener('click', () => copyText(company.companyId));

  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => showView(button.dataset.view));
  });
  document.querySelectorAll('[data-view-link]').forEach(button => {
    button.addEventListener('click', () => showView(button.dataset.viewLink));
  });
  document.querySelectorAll('[data-action="create-listing"]').forEach(button => {
    button.addEventListener('click', openListingDialog);
  });

  document.getElementById('closeListingDialog').addEventListener('click', closeListingDialog);
  document.getElementById('cancelListing').addEventListener('click', closeListingDialog);
  listingDialog.addEventListener('click', event => {
    if (event.target === listingDialog) closeListingDialog();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && listingDialog.classList.contains('is-open')) closeListingDialog();
  });

  listingForm.addEventListener('submit', event => {
    event.preventDefault();
    const controls = [...listingForm.querySelectorAll('input, select, textarea')];
    for (const control of controls) {
      if (!control.checkValidity()) {
        control.reportValidity();
        return;
      }
    }
    const values = new FormData(listingForm);
    const record = {
      id: `LIST-${Date.now().toString(36).toUpperCase()}`,
      companyId: company.companyId,
      title: String(values.get('title') || '').trim(),
      type: String(values.get('type') || '').trim(),
      quantity: String(values.get('quantity') || '').trim(),
      price: Number(values.get('price')),
      location: String(values.get('location') || '').trim(),
      quality: String(values.get('quality') || '').trim(),
      description: String(values.get('description') || '').trim(),
      status: 'Local demo only',
      createdAt: new Date().toISOString()
    };
    listings = [...listings, record];
    writeStorage(STORAGE_LISTINGS, listings);
    listingForm.reset();
    closeListingDialog();
    renderListings();
    showView('listings');
    notify('Demo listing added to this browser. It is not visible to other companies.');
  });

  renderProfile();
  renderListings();

  function getInitials(name) {
    const parts = String(name || 'WasteConnect').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part[0].toUpperCase()).join('') || 'WC';
  }

  function showView(name) {
    const target = document.querySelector(`[data-panel="${name}"]`);
    if (!target) return;
    document.querySelectorAll('.dash-view').forEach(panel => panel.classList.toggle('is-active', panel === target));
    document.querySelectorAll('.dash-nav-item[data-view]').forEach(button => button.classList.toggle('is-active', button.dataset.view === name));
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function getCompanyListings() {
    return Array.isArray(listings) ? listings.filter(item => item.companyId === company.companyId) : [];
  }

  function renderListings() {
    const ownListings = getCompanyListings();
    document.getElementById('listingCount').textContent = String(ownListings.length);
    const overview = document.getElementById('overviewListings');
    const all = document.getElementById('allListings');
    overview.replaceChildren();
    all.replaceChildren();

    if (!ownListings.length) {
      const empty = document.createElement('div');
      empty.className = 'list-empty';
      const heading = document.createElement('strong');
      heading.textContent = 'No material listings yet';
      const paragraph = document.createElement('p');
      paragraph.textContent = 'Add your first material with quantity, location, and pricing details. It will be saved as a local demo listing.';
      const button = document.createElement('button');
      button.className = 'btn btn-secondary';
      button.type = 'button';
      button.textContent = 'Create first listing';
      button.addEventListener('click', openListingDialog);
      empty.append(heading, paragraph, button);
      overview.append(empty);
      all.append(empty.cloneNode(true));
      const clonedButton = all.querySelector('button');
      if (clonedButton) clonedButton.addEventListener('click', openListingDialog);
      return;
    }

    ownListings.slice().reverse().forEach(item => {
      const card = createListingCard(item);
      overview.append(card.cloneNode(true));
      all.append(card);
    });
  }

  function createListingCard(item) {
    const article = document.createElement('article');
    article.className = 'listing-card';
    const top = document.createElement('div');
    top.className = 'listing-card-top';
    const titleBlock = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = item.title;
    const type = document.createElement('span');
    type.className = 'listing-type';
    type.textContent = item.type;
    titleBlock.append(title, type);
    const status = document.createElement('span');
    status.className = 'demo-listing-status';
    status.textContent = 'Local demo only';
    top.append(titleBlock, status);
    const description = document.createElement('p');
    description.className = 'listing-description';
    description.textContent = item.description;
    const fields = document.createElement('div');
    fields.className = 'listing-fields';
    const details = [
      ['Quantity', item.quantity],
      ['Asking price', Number.isFinite(item.price) ? `₹${item.price.toLocaleString('en-IN')}` : 'Not provided'],
      ['Collection location', item.location],
      ['Quality / grade', item.quality || 'Not specified']
    ];
    details.forEach(([label, value]) => {
      const block = document.createElement('div');
      const span = document.createElement('span');
      span.textContent = label;
      const strong = document.createElement('strong');
      strong.textContent = value;
      block.append(span, strong);
      fields.append(block);
    });
    article.append(top, description, fields);
    return article;
  }

  function renderProfile() {
    const container = document.getElementById('companyProfileDetails');
    container.replaceChildren();
    const fields = [
      ['Company name', company.companyName, false],
      ['Company ID', company.companyId, false],
      ['Industry', company.industry, false],
      ['Company website', company.website, false],
      ['Contact person', company.contactName, false],
      ['Designation', company.designation, false],
      ['Business phone', company.phone, false],
      ['Work email', company.email || company.verifiedEmail, false],
      ['Business purpose', company.purpose, false],
      ['Materials handled', company.materials, false],
      ['Monthly volume', company.volume, false],
      ['Frequency', company.frequency, false],
      ['Collection / storage location', company.storageLocation, false],
      ['GSTIN', company.gstin, false],
      ['Registration / CIN', company.registrationNo, false],
      ['City', company.city, false],
      ['State / region', company.state, false],
      ['Country', company.country, false],
      ['Business address', company.address, true],
      ['Verification status', 'Pending review', false],
      ['Account mode', 'Local prototype', false]
    ];
    fields.forEach(([label, value, full]) => {
      const block = document.createElement('div');
      block.className = `profile-field${full ? ' full' : ''}`;
      const span = document.createElement('span');
      span.textContent = label;
      const strong = document.createElement('strong');
      const shown = textOrMissing(value);
      strong.textContent = shown;
      if (shown === 'Not provided') strong.className = 'not-provided';
      block.append(span, strong);
      container.append(block);
    });
  }

  function openListingDialog() {
    listingDialog.classList.add('is-open');
    listingDialog.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('listingTitle').focus();
  }

  function closeListingDialog() {
    listingDialog.classList.remove('is-open');
    listingDialog.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
      notify('Company ID copied.');
    } catch (_) {
      notify(`Company ID: ${value}`);
    }
  }
})();
