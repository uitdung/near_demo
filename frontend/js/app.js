/**
 * NEAR property-registry demo frontend.
 */

const API_BASE = '/api';

let allProperties = [];
let analysisSummary = null;

const propertyForm = document.getElementById('propertyForm');
const transferForm = document.getElementById('transferForm');
const propertyIdInput = document.getElementById('propertyIdInput');
const descriptionInput = document.getElementById('descriptionInput');
const ownerInput = document.getElementById('ownerInput');
const transferPropertyIdInput = document.getElementById('transferPropertyIdInput');
const newOwnerInput = document.getElementById('newOwnerInput');
const saveBtn = document.getElementById('saveBtn');
const transferBtn = document.getElementById('transferBtn');
const refreshBtn = document.getElementById('refreshBtn');
const resetBtn = document.getElementById('resetBtn');
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
const ownerCount = document.getElementById('ownerCount');
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

    await Promise.all([loadAnalysisSummary(), loadAllProperties()]);

    propertyForm.addEventListener('submit', handleSaveProperty);
    transferForm.addEventListener('submit', handleTransferProperty);
    refreshBtn.addEventListener('click', refreshDashboard);
    resetBtn.addEventListener('click', handleResetRegistry);
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
            statusText.textContent = 'Đã kết nối tới NEAR property registry backend';
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

function truncate(str, length = 28) {
    if (!str) return '';
    return str.length > length ? `${str.slice(0, length)}...` : str;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}

function setTransactionDetails(transactionHash, explanation) {
    txHash.textContent = transactionHash;
    txHash.href = `https://testnet.nearblocks.io/txns/${transactionHash}`;
    txStatus.textContent = 'Success';
    txExplanation.textContent = explanation;
    transactionInfo.hidden = false;
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

    totalCount.textContent = analysisSummary.contract.totalProperties;
    statsCount.textContent = analysisSummary.contract.totalProperties;
    storageUsage.textContent = `${analysisSummary.storage.usageBytes} bytes`;
    blockHeight.textContent = analysisSummary.state.blockHeight || '-';
    rawPairs.textContent = analysisSummary.state.rawPairs || 0;
    ownerCount.textContent = analysisSummary.contract.totalOwners || 0;
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

async function loadAllProperties() {
    try {
        const response = await fetch(`${API_BASE}/properties`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Không thể tải dữ liệu');
        }

        allProperties = result.data || [];
        renderDataTable();
        totalCount.textContent = allProperties.length;
        statsCount.textContent = allProperties.length;
    } catch (error) {
        showToast(`Lỗi tải dữ liệu: ${error.message}`, 'error');
    }
}

function fillPropertyForm(property) {
    propertyIdInput.value = property.property_id;
    descriptionInput.value = property.description;
    ownerInput.value = property.owner;
    transferPropertyIdInput.value = property.property_id;
}

function renderDataTable() {
    dataBody.innerHTML = '';

    if (allProperties.length === 0) {
        emptyState.hidden = false;
        document.getElementById('dataTable').hidden = true;
        return;
    }

    emptyState.hidden = true;
    document.getElementById('dataTable').hidden = false;

    allProperties.forEach((property) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(property.property_id)}</strong></td>
            <td>${escapeHtml(property.description)}</td>
            <td>${escapeHtml(property.owner)}</td>
            <td class="sender">${escapeHtml(truncate(property.updated_by, 28))}</td>
            <td>${formatTimestamp(property.timestamp)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-secondary edit-btn" data-property-id="${escapeHtml(property.property_id)}">Sửa</button>
                    <button class="btn btn-secondary transfer-btn" data-property-id="${escapeHtml(property.property_id)}" data-owner="${escapeHtml(property.owner)}">Transfer</button>
                    <button class="btn btn-danger delete-btn" data-property-id="${escapeHtml(property.property_id)}">Xóa</button>
                </div>
            </td>
        `;
        dataBody.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const property = allProperties.find((item) => item.property_id === button.dataset.propertyId);
            if (property) {
                fillPropertyForm(property);
                showToast(`Đã nạp property ${property.property_id} vào form để cập nhật.`, 'success');
            }
        });
    });

    document.querySelectorAll('.transfer-btn').forEach((button) => {
        button.addEventListener('click', () => {
            transferPropertyIdInput.value = button.dataset.propertyId;
            newOwnerInput.focus();
            showToast(`Sẵn sàng chuyển quyền sở hữu cho ${button.dataset.propertyId}.`, 'success');
        });
    });

    document.querySelectorAll('.delete-btn').forEach((button) => {
        button.addEventListener('click', () => handleDeleteProperty(button.dataset.propertyId));
    });
}

async function handleSaveProperty(event) {
    event.preventDefault();

    const propertyId = propertyIdInput.value.trim();
    const description = descriptionInput.value.trim();
    const owner = ownerInput.value.trim();

    if (!propertyId || !description || !owner) {
        showToast('Vui lòng nhập property_id, description và owner.', 'error');
        return;
    }

    setButtonLoading(saveBtn, true);
    transactionInfo.hidden = true;

    try {
        const response = await fetch(`${API_BASE}/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                property_id: propertyId,
                description,
                owner,
            }),
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Lưu property thất bại');
        }

        setTransactionDetails(result.transaction.hash, result.explanation);
        propertyForm.reset();
        transferPropertyIdInput.value = propertyId;
        showToast(
            result.mode === 'create'
                ? 'Đã tạo property mới trên blockchain.'
                : 'Đã cập nhật property trên blockchain.',
            'success'
        );
        await refreshDashboard();
    } catch (error) {
        showToast(`Lỗi lưu property: ${error.message}`, 'error');
    } finally {
        setButtonLoading(saveBtn, false);
    }
}

async function handleTransferProperty(event) {
    event.preventDefault();

    const propertyId = transferPropertyIdInput.value.trim();
    const newOwner = newOwnerInput.value.trim();

    if (!propertyId || !newOwner) {
        showToast('Vui lòng nhập property_id và new owner.', 'error');
        return;
    }

    setButtonLoading(transferBtn, true);

    try {
        const response = await fetch(`${API_BASE}/properties/${encodeURIComponent(propertyId)}/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ new_owner: newOwner }),
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Transfer owner thất bại');
        }

        setTransactionDetails(result.transaction.hash, result.explanation);
        transferForm.reset();
        showToast('Đã gửi giao dịch chuyển quyền sở hữu.', 'success');
        await refreshDashboard();
    } catch (error) {
        showToast(`Lỗi transfer property: ${error.message}`, 'error');
    } finally {
        setButtonLoading(transferBtn, false);
    }
}

async function handleDeleteProperty(propertyId) {
    if (!window.confirm(`Bạn có chắc muốn xóa property "${propertyId}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/properties/${encodeURIComponent(propertyId)}`, {
            method: 'DELETE',
        });
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Xóa property thất bại');
        }

        setTransactionDetails(result.transaction.hash, result.explanation);
        showToast('Đã gửi giao dịch xóa property.', 'success');
        await refreshDashboard();
    } catch (error) {
        showToast(`Lỗi xóa property: ${error.message}`, 'error');
    }
}

async function handleResetRegistry() {
    const confirmed = window.confirm(
        'Reset registry sẽ bỏ toàn bộ registry hiện tại để làm sạch state cũ không tương thích. Bạn có chắc muốn tiếp tục?'
    );

    if (!confirmed) {
        return;
    }

    setButtonLoading(resetBtn, true);

    try {
        const response = await fetch(`${API_BASE}/admin/reset`, {
            method: 'POST',
        });
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Reset registry thất bại');
        }

        propertyForm.reset();
        transferForm.reset();
        allProperties = [];
        renderDataTable();
        setTransactionDetails(result.transaction.hash, result.explanation);
        showToast('Đã reset registry trên account hiện tại.', 'success');
        await refreshDashboard();
    } catch (error) {
        showToast(`Lỗi reset registry: ${error.message}`, 'error');
    } finally {
        setButtonLoading(resetBtn, false);
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
        link.download = 'near_properties_export.json';
        link.click();
        URL.revokeObjectURL(url);
        showToast('Đã xuất JSON của property registry.', 'success');
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
        link.download = 'near_properties_export.csv';
        link.click();
        URL.revokeObjectURL(url);
        showToast('Đã xuất CSV của property registry.', 'success');
    } catch (error) {
        showToast(`Lỗi export CSV: ${error.message}`, 'error');
    }
}

async function refreshDashboard() {
    await Promise.all([loadAnalysisSummary(), loadAllProperties()]);
}

document.addEventListener('DOMContentLoaded', init);
