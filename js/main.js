/* ============================================
   Edge Controls Work Request Portal
   main.js — Shared Configuration & Utilities
   ============================================ */

// ---- Configuration ----
// Update this URL after deploying the Apps Script backend
const CONFIG = {
  // Paste your deployed Apps Script URL here (the /exec URL)
  // Example: 'https://script.google.com/macros/s/AKfycbw.../exec'
  API_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwcba7S_KIwiyDQGMJ3_G4eR0sqFIkeKumYbSL5CFTz_xZ_63inzn3VM-yf_Q4Bf5xSmA/exec',

  // Request number prefixes (for reference — actual numbering is server-side)
  PREFIX_SERVICE: 'WR-SR-',
  PREFIX_NEW_BUILD: 'WR-NB-'
};

// ---- Cached Data ----
// Customer/site data loaded from the backend on page load
let portalData = {
  customers: [],
  sites: [],
  customerSites: {},  // { "Customer Name": ["Site A", "Site B"] }
  loaded: false
};

// ============================================
//  API COMMUNICATION
// ============================================

/**
 * Submit form data to the Apps Script backend
 * Uses text/plain Content-Type to avoid CORS preflight
 * 
 * @param {Object} data - Form data to submit
 * @returns {Promise<Object>} - { success, requestNumber, message } or { success: false, error }
 */
async function submitRequest(data) {
  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
      redirect: 'follow'
    });

    // Try to read the response as JSON
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      // If we got a response but can't parse it, check HTTP status
      console.warn('Could not parse response as JSON:', text);
      return { success: response.ok, message: 'Request sent' };
    }
  } catch (error) {
    console.error('Submit error:', error);
    // If fetch itself failed (network error, CORS block, etc.)
    // Show a helpful message but don't assume failure —
    // the server may have processed it
    return {
      success: false,
      error: 'Unable to confirm submission. If this persists, please call us directly.'
    };
  }
}

/**
 * Load customers and sites from the Apps Script backend
 * Populates the portalData cache
 */
async function loadCustomersAndSites() {
  if (CONFIG.API_ENDPOINT === 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE') {
    console.warn('API endpoint not configured. Customer/site dropdowns will be empty.');
    return;
  }

  try {
    const url = CONFIG.API_ENDPOINT + '?action=getSites';
    const response = await fetch(url, { redirect: 'follow' });
    const data = await response.json();

    if (data.error) {
      console.error('Error loading sites:', data.error);
      return;
    }

    portalData.customers = data.customers || [];
    portalData.sites = data.sites || [];
    portalData.customerSites = data.customerSites || {};
    portalData.loaded = true;

    // Populate any company dropdowns on the page
    populateCompanyDropdowns();

    console.log('Loaded ' + portalData.customers.length + ' customers, '
      + portalData.sites.length + ' sites');

  } catch (error) {
    console.error('Error loading customer/site data:', error);
  }
}

// ============================================
//  DROPDOWN POPULATION
// ============================================

/**
 * Populate all company dropdown elements on the page
 * Finds <select> elements with id="company" and fills them
 */
function populateCompanyDropdowns() {
  const dropdowns = document.querySelectorAll('select#company');

  dropdowns.forEach(select => {
    // Preserve the first option (placeholder) and last option (new customer)
    const placeholder = select.querySelector('option[value=""]');
    const newOption = select.querySelector('option[value="__new__"]');

    // Clear existing options
    select.innerHTML = '';

    // Add placeholder back
    if (placeholder) {
      select.appendChild(placeholder);
    } else {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Select your company...';
      select.appendChild(opt);
    }

    // Add customers
    portalData.customers.forEach(customer => {
      const opt = document.createElement('option');
      opt.value = customer;
      opt.textContent = customer;
      select.appendChild(opt);
    });

    // Add "new customer" option at the end
    if (newOption) {
      select.appendChild(newOption);
    } else {
      const opt = document.createElement('option');
      opt.value = '__new__';
      opt.textContent = '+ My company isn\'t listed';
      select.appendChild(opt);
    }
  });
}

/**
 * Populate a site dropdown based on selected company
 * Call this when the company dropdown changes
 * 
 * @param {string} customer - Selected customer name
 * @param {HTMLSelectElement} siteSelect - The site dropdown element
 */
function populateSiteDropdown(customer, siteSelect) {
  if (!siteSelect) return;

  // Clear existing options
  siteSelect.innerHTML = '';

  // Add placeholder
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a site...';
  siteSelect.appendChild(placeholder);

  // Add sites for this customer
  if (customer && portalData.customerSites[customer]) {
    const sites = portalData.customerSites[customer].sort();
    sites.forEach(site => {
      const opt = document.createElement('option');
      opt.value = site;
      opt.textContent = site;
      siteSelect.appendChild(opt);
    });
  }

  // Add "new site" option
  const newOpt = document.createElement('option');
  newOpt.value = '__new__';
  newOpt.textContent = '+ Site isn\'t listed';
  siteSelect.appendChild(newOpt);
}

// ============================================
//  FILE HANDLING
// ============================================

/**
 * Prepare files for upload to the backend
 * Files are sent as base64-encoded strings
 * 
 * @param {FileList} files - Files from input element
 * @returns {Promise<Array>} - Array of {name, data, type, size} objects
 */
async function prepareFiles(files) {
  const prepared = [];

  for (const file of files) {
    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds 10MB limit and will be skipped.`);
      continue;
    }

    const base64 = await fileToBase64(file);
    prepared.push({
      name: file.name,
      data: base64,
      type: file.type,
      size: file.size
    });
  }

  return prepared;
}

/**
 * Convert a File to base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

// ============================================
//  UI UTILITIES
// ============================================

/**
 * Show a status message on the page
 */
function showStatus(containerId, message, type = 'success') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<div class="status-message ${type}">${message}</div>`;
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Set button to loading state
 */
function setLoading(button, loading = true) {
  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner"></span> Submitting...';
    button.disabled = true;
  } else {
    button.innerHTML = button.dataset.originalText || 'Submit';
    button.disabled = false;
  }
}

/**
 * Basic form validation — checks all required fields have values
 */
function validateRequired(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  const required = form.querySelectorAll('[required]');
  let valid = true;

  required.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = 'var(--ec-danger)';
      valid = false;
    } else {
      field.style.borderColor = '';
    }
  });

  if (!valid) {
    showStatus('form-status', 'Please fill in all required fields.', 'error');
  }

  return valid;
}

/**
 * Format phone number as (XXX) XXX-XXXX
 */
function formatPhone(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length >= 10) {
    value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6,10)}`;
  }
  input.value = value;
}

// ============================================
//  INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Load customer/site data for dropdowns
  loadCustomersAndSites();

  // Highlight current nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.header-nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.style.color = 'white';
    }
  });
});
