/* ============================================
   Edge Controls Work Request Portal
   Shared Configuration & Utilities
   ============================================ */

// ---- Configuration ----
// Update this URL after deploying the Apps Script backend
const CONFIG = {
  API_ENDPOINT: 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE',
  
  // Request number prefixes
  PREFIX_SERVICE: 'WR-SR-',
  PREFIX_NEW_BUILD: 'WR-NB-',
  STARTING_NUMBER: 1000,

  // Notification recipients (for reference — actual notifications handled server-side)
  NOTIFY_MANAGERS: [
    'ballen@edgecontrols.com',      // Blayne Allen
    'cvaldiviezo@edgecontrols.com',  // Chris Valdiviezo
    'janderson@edgecontrols.com',    // Jonathan Anderson
    'mwinder@edgecontrols.com'       // Mark Winder
  ]
};

// ---- Utility Functions ----

/**
 * Submit form data to the Apps Script backend
 * @param {Object} data - Form data to submit
 * @returns {Promise<Object>} - Response from server
 */
async function submitRequest(data) {
  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors', // Apps Script requires this from cross-origin
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    // Note: no-cors mode returns opaque response
    // We'll handle confirmation via redirect or polling
    return { success: true };
  } catch (error) {
    console.error('Submit error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload files to the Apps Script backend
 * Files are sent as base64-encoded strings
 * @param {FileList} files - Files from input element
 * @returns {Promise<Array>} - Array of {name, data, type} objects
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
 * Basic form validation
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

// ---- Page Detection ----
// Add active class to current nav link
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.header-nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.style.color = 'white';
    }
  });
});
