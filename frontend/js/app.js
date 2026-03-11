/**
 * NEAR distributed-database demo frontend.
 */

const API_BASE = '/api';

let allData = [];
let analysisSummary = null;

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
const statsCount = document.getElementById('statsCount');
const transactionInfo = document.getElementById('transactionInfo');
const txHash = document.getElementById('txHash');
const txStatus = document.getElementById('txStatus');
const txExplanation = document.getElementById('txExplanation');
const connectionStatus = document.getElementById('connectionStatus');
const toastContainer = document.getElementById('toastContainer');
const networkId = document.getElementById('networkId');
const contractId = document.getElementById('contractId');
const storageUsage = document.getElementById('storageUsage');
const blockHeight = document.getElementById('blockHeight');
const rawPairs = document.getElementById('rawPairs');
const storageNote = document.getElementById('storageNote');
const conceptGrid = document.getElementById('conceptGrid');

async function init() {
    updateConnectionStatus('connecting');

    try {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) {
            throw new Error('Health check failed');
        }

        const health = await response.json();
        updateConnectionStatus('connected');
        networkId.textContent = health.network || '-';
        contractId.textContent = health.contractId || '-';
    } catch (error) {
        updateConnectionStatus('error');
        showToast('Không thể kết nối backend. Hãy kiểm tra server đang chạy.', 'error');
    }

    await Promise.all([loadAnalysisSummary(), loadAllData()]);

    dataForm.addEventListener('submit', handleSaveData);
    refreshBtn.addEventListener('click', refreshDashboard);
    exportJsonBtn.addEventListener('click', exportJSON);
    exportCsvBtn.addEventListener('click', exportCSV);
}

function updateConnectionStatus(status) {
    const statusDot = connectionStatus.querySelector('.status-dot');
    const statusText = connectionStatus.querySelector('.status-text');

    switch (status) {
        case 'connecting':
            statusText.textContent = 'Đang kết nối tới backend / NEAR...';
            statusDot.className = 'status-dot';
            break;
        case 'connected':
            statusText.textContent = 'Đã kết nối tới NEAR demo backend';
            statusDot.className = 'status-dot connected';
            break;
        default:
            statusText.textContent = 'Kết nối thất bại';
            statusDot.className = 'status-dot error';
            break;
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function setButtonLoading(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');

    button.disabled = loading;
    if (btnText) btnText.hidden = loading;
    if (btnLoading) btnLoading.hidden = !loading;
}

function formatTimestamp(timestamp) {
    try {
        const ns = Number.parseInt(timestamp, 10);
        const ms = ns / 1_000_000;
        return new Date(ms).toLocaleString('vi-VN');
    } catch {
        return timestamp;
    }
}

function truncate(str, length = 24) {
    if (!str) return '';
    return str.length > length ? `${str.slice(0, length)}...` : str;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadAnalysisSummary() {
    try {
        const response = await fetch(`${API_BASE}/analysis/summary`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Không thể tải phần phân tích');
        }

        analysisSummary = result.summary;
        renderAnalysisSummary();
    } catch (error) {
        showToast(`Lỗi tải phân tích: ${error.message}`, 'error');
    }
}

function renderAnalysisSummary() {
    if (!analysisSummary) return;

    totalCount.textContent = analysisSummary.contract.totalEntries;
    statsCount.textContent = analysisSummary.contract.totalEntries;
    storageUsage.textContent = `${analysisSummary.storage.usageBytes} bytes`;
    blockHeight.textContent = analysisSummary.state.blockHeight || '-';
    rawPairs.textContent = analysisSummary.state.rawPairs || 0;
    storageNote.textContent = analysisSummary.storage.note;

    conceptGrid.innerHTML = '';
    analysisSummary.concepts.forEach((concept) => {
        const card = document.createElement('article');
        card.className = 'concept-card';
        card.innerHTML = `
            <h3>${escapeHtml(concept.title)}</h3>
            <p>${escapeHtml(concept.description)}</p>
        `;
        conceptGrid.appendChild(card);
    });
}

async function loadAllData() {
    try {
        const response = await fetch(`${API_BASE}/data`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Không thể tải dữ liệu');
        }

        allData = result.data || [];
        renderDataTable();
        totalCount.textContent = allData.length;
        statsCount.textContent = allData.length;
    } catch (error) {
        showToast(`Lỗi tải dữ liệu: ${error.message}`, 'error');
    }
}

function renderDataTable() {
    dataBody.innerHTML = '';

    if (allData.length === 0) {
        emptyState.hidden = false;
        document.getElementById('dataTable').hidden = true;
        return;
    }

    emptyState.hidden = true;
    document.getElementById('dataTable').hidden = false;

    allData.forEach((entry) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(entry.key)}</strong></td>
            <td>${escapeHtml(entry.value)}</td>
            <td class="sender">${escapeHtml(truncate(entry.sender, 28))}</td>
            <td>${formatTimestamp(entry.timestamp)}</td>
            <td>
                <button class="btn btn-danger delete-btn" data-key="${escapeHtml(entry.key)}">
                    Xóa
                </button>
            </td>
        `;
        dataBody.appendChild(row);
    });

    document.querySelectorAll('.delete-btn').forEach((button) => {
        button.addEventListener('click', () => handleDeleteData(button.dataset.key));
    });
}

async function handleSaveData(event) {
    event.preventDefault();

    const key = keyInput.value.trim();
    const value = valueInput.value.trim();

    if (!key || !value) {
        showToast('Vui lòng nhập cả key và value.', 'error');
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
        if (!result.success) {
            throw new Error(result.error || 'Ghi dữ liệu thất bại');
        }

        txHash.textContent = result.transaction.hash;
        txHash.href = `https://testnet.nearblocks.io/txns/${result.transaction.hash}`;
        txStatus.textContent = 'Success';
        txExplanation.textContent = result.explanation;
        transactionInfo.hidden = false;

        keyInput.value = '';
        valueInput.value = '';

        showToast('Đã ghi dữ liệu lên blockchain thành công.', 'success');
        await refreshDashboard();
    } catch (error) {
        showToast(`Lỗi ghi dữ liệu: ${error.message}`, 'error');
    } finally {
        setButtonLoading(saveBtn, false);
    }
}

async function handleDeleteData(key) {
    if (!window.confirm(`Bạn có chắc muốn xóa key "${key}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/data/${encodeURIComponent(key)}`, {
            method: 'DELETE',
        });
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Xóa dữ liệu thất bại');
        }

        showToast('Đã gửi giao dịch xóa trạng thái.', 'success');
        await refreshDashboard();
    } catch (error) {
        showToast(`Lỗi xóa dữ liệu: ${error.message}`, 'error');
    }
}

async function exportJSON() {
    try {
        const response = await fetch(`${API_BASE}/export/json`);
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'near_data_export.json';
        link.click();
        URL.revokeObjectURL(url);
        showToast('Đã xuất JSON để phục vụ phân tích.', 'success');
    } catch (error) {
        showToast(`Lỗi export JSON: ${error.message}`, 'error');
    }
}

async function exportCSV() {
    try {
        const response = await fetch(`${API_BASE}/export/csv`);
        const csv = await response.text();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'near_data_export.csv';
        link.click();
        URL.revokeObjectURL(url);
        showToast('Đã xuất CSV để phục vụ phân tích.', 'success');
    } catch (error) {
        showToast(`Lỗi export CSV: ${error.message}`, 'error');
    }
}

async function refreshDashboard() {
    await Promise.all([loadAnalysisSummary(), loadAllData()]);
}

document.addEventListener('DOMContentLoaded', init);
