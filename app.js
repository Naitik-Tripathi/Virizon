(() => {
  const backdrop = document.getElementById('joinBackdrop');
  const emailStage = document.getElementById('emailStage');
  const registrationStage = document.getElementById('registrationStage');
  const successStage = document.getElementById('successStage');
  const workEmail = document.getElementById('workEmail');
  const otpBlock = document.getElementById('otpBlock');
  const demoOtp = document.getElementById('demoOtp');
  const form = document.getElementById('registrationForm');
  const steps = [...document.querySelectorAll('.form-step')];
  const progressItems = [...document.querySelectorAll('.progress-item')];
  const progressFill = document.getElementById('progressFill');
  const progressTrack = document.getElementById('progressTrack');
  const backButton = document.getElementById('backStep');
  const nextButton = document.getElementById('nextStep');
  const submitButton = document.getElementById('submitRegistration');
  const stepError = document.getElementById('stepError');
  const finalError = document.getElementById('finalError');
  const toast = document.getElementById('toast');
  const dialog = document.querySelector('.join-modal');
  let currentStep = 0;
  let toastTimer;
  let lastFocused = null;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3400);
  }
  function showOnly(stage) {
    emailStage.style.display = stage === 'email' ? 'flex' : 'none';
    registrationStage.style.display = stage === 'form' ? 'flex' : 'none';
    successStage.classList.toggle('is-visible', stage === 'success');
    dialog.setAttribute('aria-labelledby', stage === 'email' ? 'joinTitle' : stage === 'form' ? 'registrationTitle' : 'successTitle');
  }
  function openModal() {
    lastFocused = document.activeElement;
    form.reset();
    workEmail.value = '';
    demoOtp.value = '';
    otpBlock.classList.remove('is-visible');
    currentStep = 0;
    updateStep();
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    showOnly('email');
    workEmail.focus();
  }
  function closeModal() {
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }
  document.querySelectorAll('[data-open-join]').forEach(button => button.addEventListener('click', openModal));
  document.querySelectorAll('[data-login-demo]').forEach(button => button.addEventListener('click', () => notify('Login is not connected in this prototype yet.')));
  document.getElementById('closeJoin').addEventListener('click', closeModal);
  document.getElementById('cancelRegistration').addEventListener('click', closeModal);
  document.getElementById('finishJoin').addEventListener('click', closeModal);
  document.getElementById('openDashboard').addEventListener('click', () => { window.location.href = 'dashboard.html'; });
  document.getElementById('copyCompanyId').addEventListener('click', () => copyCompanyId());
  backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && backdrop.classList.contains('is-open')) closeModal(); });

  document.getElementById('sendDemoCode').addEventListener('click', () => {
    const email = workEmail.value.trim();
    if (!workEmail.checkValidity() || !email) {
      workEmail.reportValidity();
      return;
    }
    otpBlock.classList.add('is-visible');
    demoOtp.focus();
    notify('Demo mode: use code 123456. No email was sent.');
  });
  document.getElementById('verifyDemoCode').addEventListener('click', () => {
    if (demoOtp.value.trim() !== '123456') {
      demoOtp.setCustomValidity('For this prototype, enter 123456.');
      demoOtp.reportValidity();
      demoOtp.setCustomValidity('');
      return;
    }
    document.getElementById('verifiedEmail').value = workEmail.value.trim();
    currentStep = 0;
    updateStep();
    showOnly('form');
    document.getElementById('companyName').focus();
  });
  function validateCurrentStep() {
    const current = steps[currentStep];
    const controls = [...current.querySelectorAll('input, select, textarea')];
    for (const control of controls) {
      if (control.type === 'radio') continue;
      if (!control.checkValidity()) {
        control.reportValidity();
        return false;
      }
      if (control.type === 'url' && control.value.trim()) {
        try { new URL(control.value); } catch (_) { control.setCustomValidity('Enter a full website URL, including https://'); control.reportValidity(); control.setCustomValidity(''); return false; }
      }
    }
    const radios = [...current.querySelectorAll('input[type="radio"][required]')];
    const radioNames = [...new Set(radios.map(radio => radio.name))];
    for (const name of radioNames) {
      if (!current.querySelector(`input[type="radio"][name="${name}"]:checked`)) {
        notify('Please choose how your company will use WasteConnect.');
        radios[0]?.focus();
        return false;
      }
    }
    return true;
  }
  function updateStep() {
    steps.forEach((step, index) => step.classList.toggle('is-active', index === currentStep));
    progressItems.forEach((item, index) => {
      item.classList.toggle('active', index === currentStep);
      item.classList.toggle('complete', index < currentStep);
      if (index === currentStep) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      item.querySelector('.progress-number').textContent = index < currentStep ? '✓' : String(index + 1);
    });
    progressFill.style.width = `${(currentStep / (steps.length - 1)) * 100}%`;
    progressTrack.setAttribute('aria-valuenow', String(currentStep + 1));
    backButton.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
    nextButton.style.display = currentStep === steps.length - 1 ? 'none' : 'inline-flex';
    submitButton.style.display = currentStep === steps.length - 1 ? 'inline-flex' : 'none';
    stepError.classList.remove('is-visible');
    finalError.classList.remove('is-visible');
    document.querySelector('.registration-scroll').scrollTop = 0;
  }
  nextButton.addEventListener('click', () => {
    if (!validateCurrentStep()) {
      stepError.classList.add('is-visible');
      return;
    }
    currentStep = Math.min(currentStep + 1, steps.length - 1);
    updateStep();
  });
  backButton.addEventListener('click', () => {
    currentStep = Math.max(currentStep - 1, 0);
    updateStep();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateCurrentStep()) {
      stepError.classList.add('is-visible');
      return;
    }
    const confirmation = document.getElementById('confirmAccuracy');
    if (!confirmation.checked) {
      finalError.classList.add('is-visible');
      confirmation.focus();
      return;
    }
    const profile = collectDemoCompany();
    const saved = saveDemoCompany(profile);
    document.getElementById('createdCompanyId').textContent = profile.companyId;
    document.getElementById('copyCompanyId').textContent = 'Copy ID';
    const note = document.querySelector('#successStage .success-note');
    note.innerHTML = '<strong>Prototype notice:</strong> This Company ID is generated locally for demonstration. It is not a verified account number. Profile fields are stored only in this browser; uploaded documents are not saved. Live registration, secure storage, email verification, and company review must be connected before launch.';
    if (!saved) {
      note.innerHTML = '<strong>Storage notice:</strong> The Company ID was generated, but browser storage is unavailable. Keep the ID visible here and avoid refreshing before opening the dashboard. Live registration requires a secure backend.';
    }
    showOnly('success');
  });

  function makeCompanyId() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    if (window.crypto && window.crypto.getRandomValues) {
      const values = new Uint8Array(6);
      window.crypto.getRandomValues(values);
      code = [...values].map(value => alphabet[value % alphabet.length]).join('');
    } else {
      code = Math.random().toString(36).slice(2, 8).toUpperCase();
    }
    return `WC-${new Date().getFullYear()}-${code}`;
  }

  function collectDemoCompany() {
    const profile = {};
    const excluded = new Set(['businessDoc', 'gstDoc', 'confirmAccuracy']);
    for (const [key, value] of new FormData(form).entries()) {
      if (excluded.has(key)) continue;
      if (value instanceof File) continue;
      profile[key] = String(value).trim();
    }
    profile.companyId = makeCompanyId();
    profile.email = workEmail.value.trim();
    profile.verificationStatus = 'Pending review';
    profile.registrationMode = 'Local prototype';
    profile.createdAt = new Date().toISOString();
    return profile;
  }

  function saveDemoCompany(profile) {
    try {
      localStorage.setItem('wasteconnectDemoCompanyV1', JSON.stringify(profile));
      return true;
    } catch (_) {
      try {
        sessionStorage.setItem('wasteconnectDemoCompanyV1', JSON.stringify(profile));
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  async function copyCompanyId() {
    const companyId = document.getElementById('createdCompanyId').textContent;
    try {
      await navigator.clipboard.writeText(companyId);
      notify('Company ID copied.');
    } catch (_) {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('createdCompanyId'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      notify('Select and copy the Company ID.');
    }
  }
})();
