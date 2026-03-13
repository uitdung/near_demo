/**
 * NEAR property-registry demo frontend.
 */

const API_BASE = window.location.port === '8081'
    ? 'http://localhost:3000/api'
    : '/api';

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
const txSemanticNote = document.getElementById('txSemanticNote');
const txOperation = document.getElementById('txOperation');
const txMethod = document.getElementById('txMethod');
const txNetwork = document.getElementById('txNetwork');
const txSigner = document.getElementById('txSigner');
const txReceiver = document.getElementById('txReceiver');
const txBlockHash = document.getElementById('txBlockHash');
const txGasUsed = document.getElementById('txGasUsed');
const txReceiptCount = document.getElementById('txReceiptCount');
const txRequestStart = document.getElementById('txRequestStart');
const txResponseReceived = document.getElementById('txResponseReceived');
const txDuration = document.getElementById('txDuration');
const txObservedBlockTime = document.getElementById('txObservedBlockTime');
const txObservedBlockHeight = document.getElementById('txObservedBlockHeight');
const txExplorer = document.getElementById('txExplorer');
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
const propertyDetailModal = document.getElementById('propertyDetailModal');
const propertyDetailCloseBtn = document.getElementById('propertyDetailCloseBtn');
const propertyDetailTitle = document.getElementById('propertyDetailTitle');
const propertyDetailSubtitle = document.getElementById('propertyDetailSubtitle');
const detailPropertyId = document.getElementById('detailPropertyId');
const detailDescription = document.getElementById('detailDescription');
const detailOwner = document.getElementById('detailOwner');
const detailUpdatedBy = document.getElementById('detailUpdatedBy');
const detailTimestamp = document.getElementById('detailTimestamp');
const detailNetwork = document.getElementById('detailNetwork');
const detailContractId = document.getElementById('detailContractId');
const detailRpcUrl = document.getElementById('detailRpcUrl');
const detailBlockHeight = document.getElementById('detailBlockHeight');
const detailBlockHash = document.getElementById('detailBlockHash');
const detailRawPairs = document.getElementById('detailRawPairs');
const detailContractExplorer = document.getElementById('detailContractExplorer');
const detailUpdaterExplorer = document.getElementById('detailUpdaterExplorer');
const detailHistoryNote = document.getElementById('detailHistoryNote');
const detailHistoryTimeline = document.getElementById('detailHistoryTimeline');
const batchJsonFileInput = document.getElementById('batchJsonFileInput');
const batchImportBtn = document.getElementById('batchImportBtn');
const batchValidationMessage = document.getElementById('batchValidationMessage');
const batchItemCount = document.getElementById('batchItemCount');
const batchTransactionsSubmitted = document.getElementById('batchTransactionsSubmitted');
const batchCreatedCount = document.getElementById('batchCreatedCount');
const batchUpdatedCount = document.getElementById('batchUpdatedCount');
const batchSuccessCount = document.getElementById('batchSuccessCount');
const batchFailureCount = document.getElementById('batchFailureCount');
const batchDuration = document.getElementById('batchDuration');
const batchAverageDuration = document.getElementById('batchAverageDuration');
const batchThroughput = document.getElementById('batchThroughput');
const batchTransactionThroughput = document.getElementById('batchTransactionThroughput');
const batchPreviewContent = document.getElementById('batchPreviewContent');
const batchResultsSection = document.getElementById('batchResultsSection');
const batchResultsBody = document.getElementById('batchResultsBody');

let batchItems = [];

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
    propertyDetailCloseBtn.addEventListener('click', closePropertyDetailModal);
    propertyDetailModal.addEventListener('click', (event) => {
        if (event.target.dataset.closeModal === 'true') {
            closePropertyDetailModal();
        }
    });
    batchJsonFileInput.addEventListener('change', handleBatchFileSelection);
    batchImportBtn.addEventListener('click', handleBatchImport);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !propertyDetailModal.hidden) {
            closePropertyDetailModal();
        }
    });
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

function formatGas(value) {
    const numeric = Number(value || 0);
    return Number.isFinite(numeric) ? `${numeric.toLocaleString('vi-VN')} gas` : '-';
}

function formatCount(value) {
    const numeric = Number(value || 0);
    return Number.isFinite(numeric) ? numeric.toLocaleString('vi-VN') : '-';
}

function formatDurationMs(value) {
    const numeric = Number(value || 0);
    return Number.isFinite(numeric) ? `${numeric.toLocaleString('vi-VN')} ms` : '-';
}

function formatDatetime(isoString) {
    if (!isoString) return '-';
    try {
        return new Date(isoString).toLocaleString('vi-VN');
    } catch {
        return isoString;
    }
}

function updateBatchSummary(summary = {}) {
    batchItemCount.textContent = formatCount(summary.totalItems || batchItems.length || 0);
    batchTransactionsSubmitted.textContent = formatCount(summary.transactionsSubmitted || 0);
    batchCreatedCount.textContent = formatCount(summary.createdCount || 0);
    batchUpdatedCount.textContent = formatCount(summary.updatedCount || 0);
    batchSuccessCount.textContent = formatCount(summary.successCount || 0);
    batchFailureCount.textContent = formatCount(summary.failureCount || 0);
    batchDuration.textContent = summary.durationMs ? formatDurationMs(summary.durationMs) : '-';
    batchAverageDuration.textContent = summary.averageDurationMs ? formatDurationMs(summary.averageDurationMs) : '-';
    batchThroughput.textContent = summary.throughputPerSecond ? `${summary.throughputPerSecond} records/s` : '-';
    batchTransactionThroughput.textContent = summary.transactionThroughputPerSecond ? `${summary.transactionThroughputPerSecond} tx/s` : '-';
}

function setBatchValidationState(message, isValid = false) {
    batchValidationMessage.textContent = message;
    batchImportBtn.disabled = !isValid;
}

function renderBatchPreview(items = []) {
    batchPreviewContent.textContent = JSON.stringify(items.slice(0, 5), null, 2);
}

function renderBatchResults(results = []) {
    batchResultsBody.innerHTML = '';

    if (!results.length) {
        batchResultsSection.hidden = true;
        return;
    }

    batchResultsSection.hidden = false;
    results.forEach((item, index) => {
        const row = document.createElement('tr');
        const transactionHash = item.transaction?.hash
            ? `<a href="${escapeHtml(item.transaction.explorerUrl || '#')}" target="_blank" class="hash-link">${escapeHtml(truncate(item.transaction.hash, 20))}</a>`
            : '-';
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(item.property_id || '-')}</td>
            <td><span class="status-badge ${item.success ? '' : 'status-badge-error'}">${item.success ? 'Success' : 'Failed'}</span></td>
            <td>${escapeHtml(formatDurationMs(item.durationMs))}</td>
            <td>${transactionHash}</td>
            <td>${escapeHtml(item.transaction ? formatGas(item.transaction.gasBurned) : '-')}</td>
            <td>${escapeHtml(item.error || '-')}</td>
        `;
        batchResultsBody.appendChild(row);
    });
}

function setTransactionDetails(transaction = {}, explanation = '') {
    txHash.textContent = transaction.hash || '-';
    txHash.href = transaction.explorerUrl || `https://testnet.nearblocks.io/txns/${transaction.hash}`;
    txStatus.textContent = transaction.status || 'Success';
    txExplanation.textContent = explanation || '-';
    txSemanticNote.textContent = `${transaction.operationType || 'Blockchain write'} là một signed transaction đi qua RPC, validator, execution outcome và cập nhật contract state trên NEAR.`;
    txOperation.textContent = transaction.operationType || '-';
    txMethod.textContent = transaction.methodName || '-';
    txNetwork.textContent = transaction.networkId || '-';
    txSigner.textContent = transaction.signerId || '-';
    txReceiver.textContent = transaction.receiverId || '-';
    txBlockHash.textContent = transaction.blockHash || '-';
    txGasUsed.textContent = formatGas(transaction.gasBurned);
    txReceiptCount.textContent = formatCount(transaction.receiptCount);
    txRequestStart.textContent = transaction.requestStartedAt ? formatDatetime(new Date(transaction.requestStartedAt).toISOString()) : '-';
    txResponseReceived.textContent = transaction.requestRespondedAt ? formatDatetime(new Date(transaction.requestRespondedAt).toISOString()) : '-';
    txDuration.textContent = formatDurationMs(transaction.durationMs);
    txObservedBlockTime.textContent = formatDatetime(transaction.observedBlockTimestamp);
    txObservedBlockHeight.textContent = transaction.observedBlockHeight ? formatCount(transaction.observedBlockHeight) : '-';
    txExplorer.href = transaction.explorerUrl || '#';
    transactionInfo.hidden = false;
}

function closePropertyDetailModal() {
    propertyDetailModal.hidden = true;
    document.body.style.overflow = '';
}

function openPropertyDetailModal() {
    propertyDetailModal.hidden = false;
    document.body.style.overflow = 'hidden';
}

function validateBatchItems(items) {
    if (!Array.isArray(items)) {
        throw new Error('JSON phải là một array các property objects');
    }

    if (items.length === 0) {
        throw new Error('JSON không được rỗng');
    }

    return items.map((item, index) => {
        const propertyId = String(item?.property_id || '').trim();
        const description = String(item?.description || '').trim();
        const owner = String(item?.owner || '').trim();

        if (!propertyId || !description || !owner) {
            throw new Error(`Item ${index + 1} thiếu property_id, description hoặc owner`);
        }

        return {
            property_id: propertyId,
            description,
            owner,
        };
    });
}

async function handleBatchFileSelection(event) {
    const file = event.target.files?.[0];
    batchItems = [];
    batchResultsBody.innerHTML = '';
    batchResultsSection.hidden = true;
    updateBatchSummary({ totalItems: 0, successCount: 0, failureCount: 0 });

    if (!file) {
        renderBatchPreview([]);
        setBatchValidationState('Chưa có file JSON nào được chọn.', false);
        return;
    }

    try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        batchItems = validateBatchItems(parsed);
        renderBatchPreview(batchItems);
        updateBatchSummary({ totalItems: batchItems.length, successCount: 0, failureCount: 0, transactionsSubmitted: 0, createdCount: 0, updatedCount: 0 });
        setBatchValidationState(`Đã nạp ${batchItems.length} items từ file ${file.name}. Sẵn sàng chạy một batch transaction để upsert toàn bộ records.`, true);
    } catch (error) {
        batchItems = [];
        renderBatchPreview([]);
        setBatchValidationState(`File JSON không hợp lệ: ${error.message}`, false);
        showToast(`Lỗi file JSON: ${error.message}`, 'error');
    }
}

async function handleBatchImport() {
    if (!batchItems.length) {
        showToast('Hãy chọn file JSON hợp lệ trước khi import.', 'error');
        return;
    }

    setButtonLoading(batchImportBtn, true);
    batchImportBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/batch/properties/import-json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: batchItems,
            }),
        });
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Batch import thất bại');
        }

        updateBatchSummary(result.summary);
        renderBatchResults(result.results || []);
        batchValidationMessage.textContent = result.explanation || 'Batch contract import completed.';
        showToast(`Batch transaction hoàn tất: ${result.summary.successCount}/${result.summary.totalItems} records thành công trong ${result.summary.transactionsSubmitted} transaction.`, 'success');
        await refreshDashboard();
    } catch (error) {
        showToast(`Lỗi batch import: ${error.message}`, 'error');
    } finally {
        setButtonLoading(batchImportBtn, false);
        batchImportBtn.disabled = batchItems.length === 0;
    }
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

    totalCount.textContent = analysisSummary.contract.totalProperties ?? 0;
    statsCount.textContent = analysisSummary.contract.totalProperties ?? 0;
    storageUsage.textContent = `${analysisSummary.storage.usageBytes} bytes`;
    blockHeight.textContent = analysisSummary.state.blockHeight || '-';
    rawPairs.textContent = analysisSummary.state.rawPairs ?? 'N/A';
    ownerCount.textContent = analysisSummary.contract.totalOwners ?? 'N/A';

    const notes = [
        analysisSummary.storage.note,
        analysisSummary.contract.note,
        analysisSummary.state.note,
    ].filter(Boolean);
    storageNote.textContent = notes.join(' ');

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
                    <button class="btn btn-secondary history-btn" data-property-id="${escapeHtml(property.property_id)}">Lịch sử</button>
                    <button class="btn btn-secondary detail-btn" data-property-id="${escapeHtml(property.property_id)}">Blockchain detail</button>
                    <button class="btn btn-secondary edit-btn" data-property-id="${escapeHtml(property.property_id)}">Sửa</button>
                    <button class="btn btn-secondary transfer-btn" data-property-id="${escapeHtml(property.property_id)}" data-owner="${escapeHtml(property.owner)}">Transfer</button>
                    <button class="btn btn-danger delete-btn" data-property-id="${escapeHtml(property.property_id)}">Xóa</button>
                </div>
            </td>
        `;
        dataBody.appendChild(row);
    });

    document.querySelectorAll('.history-btn').forEach((button) => {
        button.addEventListener('click', () => handleViewPropertyHistory(button.dataset.propertyId));
    });

    document.querySelectorAll('.detail-btn').forEach((button) => {
        button.addEventListener('click', () => handleViewPropertyBlockchainDetail(button.dataset.propertyId));
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

        setTransactionDetails(result.transaction, result.explanation);
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

        setTransactionDetails(result.transaction, result.explanation);
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

        setTransactionDetails(result.transaction, result.explanation);
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
        setTransactionDetails(result.transaction, result.explanation);
        showToast('Đã reset registry trên account hiện tại.', 'success');
        await refreshDashboard();
    } catch (error) {
        showToast(`Lỗi reset registry: ${error.message}`, 'error');
    } finally {
        setButtonLoading(resetBtn, false);
    }
}

function renderPropertyHistoryTimeline(history = {}) {
    detailHistoryTimeline.innerHTML = '';

    const timeline = Array.isArray(history.timeline) ? history.timeline : [];
    if (timeline.length === 0) {
        detailHistoryTimeline.innerHTML = '<p class="subtle-text">Chưa có timeline để hiển thị.</p>';
        return;
    }

    timeline.forEach((item) => {
        const entry = document.createElement('article');
        const kindClass = item.kind ? `history-entry-${item.kind}` : '';
        entry.className = `history-entry ${kindClass}`.trim();
        const ownerLine = item.owner
            ? `<p><strong>Owner:</strong> ${escapeHtml(item.owner)}</p>`
            : '';
        const previousOwnerLine = item.previousOwner
            ? `<p><strong>Owner cũ:</strong> ${escapeHtml(item.previousOwner)}</p>`
            : '';
        const txLine = item.transactionHash
            ? `<p><strong>Tx:</strong> <a href="${escapeHtml(item.explorerUrl || '#')}" target="_blank" class="hash-link">${escapeHtml(truncate(item.transactionHash, 24))}</a></p>`
            : '';

        entry.innerHTML = `
            <div class="history-entry-head">
                <strong>${escapeHtml(item.label || 'Snapshot')}</strong>
                <span>${escapeHtml(formatTimestamp(item.timestamp || ''))}</span>
            </div>
            <p><strong>Action:</strong> ${escapeHtml(item.action || '-')}</p>
            <p><strong>Actor:</strong> ${escapeHtml(item.actor || '-')}</p>
            ${previousOwnerLine}
            ${ownerLine}
            ${txLine}
            <p>${escapeHtml(item.detail || '')}</p>
        `;
        detailHistoryTimeline.appendChild(entry);
    });
}

function applyPropertyDetailView({ property, blockchain, history, mode = 'detail' }) {
    propertyDetailTitle.textContent = mode === 'history'
        ? `Lịch sử property ${property.property_id}`
        : `Property ${property.property_id}`;
    propertyDetailSubtitle.textContent = mode === 'history'
        ? 'Timeline được dựng từ transaction history để minh họa lúc khởi tạo và các lần đổi chủ sở hữu.'
        : 'Readonly blockchain context for the current property snapshot on NEAR.';
    detailPropertyId.textContent = property.property_id;
    detailDescription.textContent = property.description;
    detailOwner.textContent = property.owner;
    detailUpdatedBy.textContent = property.updated_by;
    detailTimestamp.textContent = formatTimestamp(property.timestamp);
    detailNetwork.textContent = blockchain.networkId || '-';
    detailContractId.textContent = blockchain.contractId || '-';
    detailRpcUrl.textContent = blockchain.rpcUrl || '-';
    detailBlockHeight.textContent = blockchain.latestObservedBlockHeight ? formatCount(blockchain.latestObservedBlockHeight) : '-';
    detailBlockHash.textContent = blockchain.latestObservedBlockHash || '-';
    detailRawPairs.textContent = blockchain.rawStatePairs ? formatCount(blockchain.rawStatePairs) : '-';
    detailContractExplorer.href = blockchain.explorer?.contract || `${blockchain.explorerBaseUrl || '#'}${blockchain.contractId ? `/address/${blockchain.contractId}` : ''}`;
    detailUpdaterExplorer.href = blockchain.explorer?.updater || (property.updated_by && blockchain.explorerBaseUrl ? `${blockchain.explorerBaseUrl}/address/${property.updated_by}` : '#');
    detailHistoryNote.textContent = history.note || '-';
    renderPropertyHistoryTimeline(history);
    openPropertyDetailModal();
}

async function handleViewPropertyBlockchainDetail(propertyId) {
    try {
        const response = await fetch(`${API_BASE}/properties/${encodeURIComponent(propertyId)}/blockchain-detail`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Không thể tải blockchain detail');
        }

        applyPropertyDetailView({
            ...result.data,
            mode: 'detail',
        });
    } catch (error) {
        showToast(`Lỗi tải blockchain detail: ${error.message}`, 'error');
    }
}

async function handleViewPropertyHistory(propertyId) {
    try {
        const response = await fetch(`${API_BASE}/properties/${encodeURIComponent(propertyId)}/history`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Không thể tải lịch sử property');
        }

        applyPropertyDetailView({
            ...result.data,
            mode: 'history',
        });
    } catch (error) {
        showToast(`Lỗi tải lịch sử property: ${error.message}`, 'error');
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
