/**
 * NEAR Demo Frontend Application
 * 
 * Handles UI interactions and API calls to backend
 */

// API Base URL - adjust if backend runs on different port
const API_BASE = 'http://localhost:3000/api';

// State
let allData = [];

// DOM Elements
const dataForm = document.getElementById('dataForm');
const keyInput = document.getElementById('keyInput');
const valueInput = document.getElementById('valueInput');
const saveBtn = document.getElementById('saveBtn');
const refreshBtn = document.getElementById('refreshBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const dataBody = document.getElementById('dataBody');
const emptyState = document.getElementById('emptyState');
const totalCount = document.getElementById('totalCount');
const transactionInfo = document.getElementById('transactionInfo');
const txHash = document.getElementById('txHash');
const txStatus = document.getElementById('txStatus');
const connectionStatus = document.getElementById('connectionStatus');
const toastContainer = document.getElementById('toastContainer');

/**
 * Initialize application
 */
async function init() {
    updateConnectionStatus('connecting');

    // Check backend connection
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            updateConnectionStatus('connected');
        } else {
            updateConnectionStatus('error');
        }
    } catch (error) {
        updateConnectionStatus('error');
        showToast('Cannot connect to backend. Make sure server is running.', 'error');
    }

    // Load initial data
    await loadAllData();

    // Event listeners
    dataForm.addEventListener('submit', handleSaveData);
    refreshBtn.addEventListener('click', loadAllData);
    exportJsonBtn.addEventListener('click', exportJSON);
    exportCsvBtn.addEventListener('click', exportCSV);
}

/**
 * Update connection status UI
 */
function updateConnectionStatus(status) {
    const statusDot = connectionStatus.querySelector('.status-dot');
    const statusText = connectionStatus.querySelector('.status-text');

    switch (status) {
        case 'connecting':
            statusText.textContent = 'Connecting...';
            statusDot.className = 'status-dot';
            break;
        case 'connected':
            statusText.textContent = 'Connected to NEAR';
            statusDot.className = 'status-dot connected';
            break;
        case 'error':
            statusText.textContent = 'Connection failed';
            statusDot.className = 'status-dot';
            statusDot.style.background = 'var(--error)';
            break;
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

/**
 * Toggle button loading state
 */
function setButtonLoading(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');

    if (loading) {
        button.disabled = true;
        if (btnText) btnText.hidden = true;
        if (btnLoading) btnLoading.hidden = false;
    } else {
        button.disabled = false;
        if (btnText) btnText.hidden = false;
        if (btnLoading) btnLoading.hidden = true;
    }
}

/**
 * Format timestamp to readable date
 */
function formatTimestamp(timestamp) {
    try {
        // NEAR timestamps are in nanoseconds
        const ns = parseInt(timestamp);
        const ms = ns / 1000000;
        const date = new Date(ms);
        return date.toLocaleString('vi-VN');
    } catch {
        return timestamp;
    }
}

/**
 * Truncate string for display
 */
function truncate(str, length = 20) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
}

/**
 * Load all data from backend
 */
async function loadAllData() {
    try {
        const response = await fetch(`${API_BASE}/data`);
        const result = await response.json();

        if (result.success) {
            allData = result.data || [];
            renderDataTable();
            totalCount.textContent = allData.length;
        } else {
            showToast('Failed to load data: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error loading data: ' + error.message, 'error');
    }
}

/**
 * Render data table
 */
function renderDataTable() {
    dataBody.innerHTML = '';

    if (allData.length === 0) {
        emptyState.hidden = false;
        document.querySelector('.data-table').hidden = true;
        return;
    }

    emptyState.hidden = true;
    document.querySelector('.data-table').hidden = false;

    allData.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td><strong>${escapeHtml(entry.key)}</strong></td>
      <td>${escapeHtml(entry.value)}</td>
      <td class="sender">${truncate(entry.sender, 25)}</td>
      <td>${formatTimestamp(entry.timestamp)}</td>
      <td>
        <button class="btn btn-danger delete-btn" data-key="${escapeHtml(entry.key)}">
          Delete
        </button>
      </td>
    `;
        dataBody.appendChild(row);
    });

    // Add delete event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteData(btn.dataset.key));
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handle save data form submission
 */
async function handleSaveData(e) {
    e.preventDefault();

    const key = keyInput.value.trim();
    const value = valueInput.value.trim();

    if (!key || !value) {
        showToast('Please enter both key and value', 'error');
        return;
    }

    setButtonLoading(saveBtn, true);
    transactionInfo.hidden = true;

    try {
        const response = await fetch(`${API_BASE}/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key, value }),
        });

        const result = await response.json();

        if (result.success) {
            showToast(`Data saved successfully! Key: ${key}`, 'success');

            // Show transaction info
            if (result.transaction) {
                txHash.textContent = result.transaction.hash;
                txHash.href = `https://testnet.nearblocks.io/txns/${result.transaction.hash}`;
                txStatus.textContent = 'Success';
                transactionInfo.hidden = false;
            }

            // Clear form
            keyInput.value = '';
            valueInput.value = '';

            // Reload data
            await loadAllData();
        } else {
            showToast('Failed to save data: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error saving data: ' + error.message, 'error');
    } finally {
        setButtonLoading(saveBtn, false);
    }
}

/**
 * Handle delete data
 */
async function handleDeleteData(key) {
    if (!confirm(`Are you sure you want to delete "${key}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/data/${encodeURIComponent(key)}`, {
            method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
            showToast(`Deleted: ${key}`, 'success');
            await loadAllData();
        } else {
            showToast('Failed to delete: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error deleting data: ' + error.message, 'error');
    }
}

/**
 * Export data as JSON
 */
async function exportJSON() {
    try {
        const response = await fetch(`${API_BASE}/export/json`);
        const data = await response.json();

        // Create and download file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'near_data_export.json';
        a.click();
        URL.revokeObjectURL(url);

        showToast('JSON exported successfully!', 'success');
    } catch (error) {
        showToast('Error exporting JSON: ' + error.message, 'error');
    }
}

/**
 * Export data as CSV
 */
async function exportCSV() {
    try {
        const response = await fetch(`${API_BASE}/export/csv`);
        const csv = await response.text();

        // Create and download file
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'near_data_export.csv';
        a.click();
        URL.revokeObjectURL(url);

        showToast('CSV exported successfully!', 'success');
    } catch (error) {
        showToast('Error exporting CSV: ' + error.message, 'error');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
