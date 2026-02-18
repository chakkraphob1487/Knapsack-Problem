// ===========================
// Knapsack Problem - Frontend
// ===========================

const API_BASE = '';

// Sample items for initial load
const sampleItemsGreedy = [
    { name: 'แล็ปท็อป', weight: 10, value: 60 },
    { name: 'กล้อง', weight: 20, value: 100 },
    { name: 'หนังสือ', weight: 30, value: 120 },
];

// Sample items for DP (from example table)
const sampleItemsDP = [
    { name: 'แล็ปท็อป', weight: 10, value: 60 },
    { name: 'กล้อง', weight: 20, value: 100 },
    { name: 'หนังสือ', weight: 30, value: 120 },
];

// ===== Query Parameters Utilities =====
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        tab: params.get('tab'),
        strategy: params.get('strategy'),
        capacity: params.get('capacity'),
        items: params.get('items') // Format: "name1,w1,v1;name2,w2,v2"
    };
}

function loadFromQueryParams() {
    const params = getQueryParams();
    
    // Load tab
    if (params.tab && (params.tab === 'greedy' || params.tab === 'dp')) {
        switchTab(params.tab);
    }
    
    // Load strategy (for greedy)
    if (params.strategy && params.tab === 'greedy') {
        const strategySelect = document.getElementById('greedy-strategy');
        if (strategySelect && ['ratio', 'value', 'weight'].includes(params.strategy)) {
            strategySelect.value = params.strategy;
        }
    }
    
    // Load capacity
    if (params.capacity) {
        const capacityInput = document.getElementById(`${params.tab || 'greedy'}-capacity`);
        if (capacityInput) {
            capacityInput.value = params.capacity;
        }
    }
    
    // Load items
    if (params.items) {
        const tab = params.tab || 'greedy';
        const container = document.getElementById(`${tab}-items`);
        container.innerHTML = '';
        
        const itemsData = params.items.split(';');
        itemsData.forEach(itemStr => {
            const [name, weight, value] = itemStr.split(',');
            if (name && weight && value) {
                addItemRow(tab, decodeURIComponent(name), parseFloat(weight), parseFloat(value));
            }
        });
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initItems('greedy');
    initItems('dp');
    
    // Load from query parameters if present
    const params = getQueryParams();
    if (params.tab || params.strategy || params.capacity || params.items) {
        loadFromQueryParams();
    }
});

function initItems(tab) {
    const container = document.getElementById(`${tab}-items`);
    container.innerHTML = '';
    const items = tab === 'dp' ? sampleItemsDP : sampleItemsGreedy;
    items.forEach((item, idx) => {
        addItemRow(tab, item.name, item.weight, item.value);
    });
    
    // Set default capacity for DP
    if (tab === 'dp') {
        document.getElementById('dp-capacity').value = 11;
    }
}

// ===== Tab Switching =====
function switchTab(tab) {
    // Hide all
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active-greedy', 'active-dp');
    });

    // Show selected
    document.getElementById(`content-${tab}`).classList.add('active');
    const btn = document.getElementById(`tab-${tab}`);
    btn.classList.add(tab === 'greedy' ? 'active-greedy' : 'active-dp');
}

// ===== Add / Remove Items =====
let itemCounters = { greedy: 0, dp: 0 };

function addItem(tab) {
    addItemRow(tab, '', '', '');
}

function addItemRow(tab, name, weight, value) {
    const container = document.getElementById(`${tab}-items`);
    itemCounters[tab]++;
    const idx = itemCounters[tab];

    const row = document.createElement('div');
    row.className = 'input-row-with-delete';
    row.id = `${tab}-row-${idx}`;
    row.innerHTML = `
        <div class="form-group">
            <label>ชื่อสิ่งของ</label>
            <input type="text" placeholder="เช่น แล็ปท็อป" value="${name}">
        </div>
        <div class="form-group">
            <label>น้ำหนัก (w)</label>
            <input type="number" placeholder="เช่น 10" min="1" value="${weight}">
        </div>
        <div class="form-group">
            <label>มูลค่า (v)</label>
            <input type="number" placeholder="เช่น 60" min="1" value="${value}">
        </div>
        <button class="btn btn-delete" onclick="removeItem('${tab}', ${idx})" title="ลบ">✕</button>
    `;
    container.appendChild(row);

    // Animate in
    row.style.opacity = '0';
    row.style.transform = 'translateY(-10px)';
    requestAnimationFrame(() => {
        row.style.transition = 'all 0.3s ease';
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
    });
}

function removeItem(tab, idx) {
    const row = document.getElementById(`${tab}-row-${idx}`);
    if (row) {
        row.style.transition = 'all 0.25s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => row.remove(), 250);
    }
}

// ===== Collect Items =====
function getItems(tab) {
    const container = document.getElementById(`${tab}-items`);
    const rows = container.querySelectorAll('.input-row-with-delete');
    const items = [];

    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const name = inputs[0].value.trim() || `สิ่งของ ${items.length + 1}`;
        const weight = parseFloat(inputs[1].value);
        const value = parseFloat(inputs[2].value);

        if (!isNaN(weight) && !isNaN(value) && weight > 0 && value > 0) {
            items.push({ name, weight, value });
        }
    });

    return items;
}

// ===== Generate Share Link =====
function generateShareLink(tab) {
    const items = getItems(tab);
    const capacity = parseFloat(document.getElementById(`${tab}-capacity`).value);
    
    if (items.length === 0 || isNaN(capacity) || capacity <= 0) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วนก่อนแชร์ลิงก์');
        return;
    }
    
    const params = new URLSearchParams();
    params.set('tab', tab);
    params.set('capacity', capacity);
    
    // Add strategy for greedy
    if (tab === 'greedy') {
        const strategy = document.getElementById('greedy-strategy').value;
        params.set('strategy', strategy);
    }
    
    // Encode items: "name1,w1,v1;name2,w2,v2"
    const itemsStr = items.map(item => 
        `${encodeURIComponent(item.name)},${item.weight},${item.value}`
    ).join(';');
    params.set('items', itemsStr);
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
        showNotification('คัดลอกลิงก์แล้ว! 🎉', 'success');
    }).catch(() => {
        // Fallback: show URL in alert
        prompt('คัดลอกลิงก์นี้:', url);
    });
}

// ===== Show Notification =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(139, 92, 246, 0.9)'};
        color: white;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== Solve Greedy =====
async function solveGreedy() {
    const items = getItems('greedy');
    const capacity = parseFloat(document.getElementById('greedy-capacity').value);
    const strategy = document.getElementById('greedy-strategy').value;

    if (items.length === 0 || isNaN(capacity) || capacity <= 0) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    const resultDiv = document.getElementById('greedy-result');
    resultDiv.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <span>กำลังคำนวณ...</span>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/api/fractional`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, capacity, strategy })
        });

        const data = await response.json();

        if (data.success) {
            renderGreedyResult(data);
        } else {
            resultDiv.innerHTML = `<div class="card" style="color: var(--accent-rose);">❌ Error: ${data.error}</div>`;
        }
    } catch (err) {
        resultDiv.innerHTML = `<div class="card" style="color: var(--accent-rose);">❌ ไม่สามารถเชื่อมต่อ Server ได้</div>`;
    }
}

// ===== Render Greedy Result =====
function renderGreedyResult(data) {
    const resultDiv = document.getElementById('greedy-result');

    let html = `<div class="result-section">`;

    // Strategy Info
    html += `
        <div class="result-card" style="background: rgba(139, 92, 246, 0.05); border-color: rgba(139, 92, 246, 0.2); margin-bottom: 16px;">
            <div class="result-title">🎯 เกณฑ์การเลือก: ${data.strategy}</div>
        </div>
    `;

    // Max Value
    html += `
        <div class="max-value-box">
            <span class="label">💰 มูลค่ารวมสูงสุด (Max Value)</span>
            <span class="value">${data.totalValue}</span>
        </div>
    `;

    // Determine sort criterion label
    let sortLabel = 'Ratio (v/w)';
    let sortKey = 'ratio';
    if (data.sortCriterion === 'value') {
        sortLabel = 'มูลค่า (v)';
        sortKey = 'value';
    } else if (data.sortCriterion === 'weight') {
        sortLabel = 'น้ำหนัก (w)';
        sortKey = 'weight';
    }

    // Sorted Items Table
    html += `
        <div class="result-card">
            <div class="result-title">📋 สิ่งของเรียงตามเกณฑ์ที่เลือก</div>
            <table class="result-table">
                <thead>
                    <tr>
                        <th>ลำดับ</th>
                        <th>ชื่อ</th>
                        <th>น้ำหนัก (w)</th>
                        <th>มูลค่า (v)</th>
                        <th>Ratio (v/w)</th>
                        <th style="background: rgba(139, 92, 246, 0.15);">${sortLabel} ⭐</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.sortedItems.forEach((item, idx) => {
        const highlightValue = sortKey === 'value' ? item.value : (sortKey === 'weight' ? item.weight : item.ratio);
        html += `
            <tr>
                <td>${idx + 1}</td>
                <td style="font-weight:600;">${item.name}</td>
                <td>${item.weight}</td>
                <td>${item.value}</td>
                <td>${item.ratio}</td>
                <td style="color: var(--accent-purple); font-weight:700; background: rgba(139, 92, 246, 0.08);">${highlightValue}</td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;

    // Step-by-step Picking
    html += `
        <div class="result-card">
            <div class="result-title">🔄 ลำดับการหยิบของ (Step-by-Step)</div>
            <div class="step-list">
    `;

    data.steps.forEach((step, idx) => {
        const fractionWidth = (step.fraction * 100).toFixed(0);
        html += `
            <div class="step-item" style="animation-delay: ${idx * 0.1}s">
                <div class="step-number">${idx + 1}</div>
                <div class="step-detail">
                    <h4>หยิบ "${step.name}" (สิ่งของที่ ${step.itemIndex})</h4>
                    <p>
                        น้ำหนัก: ${step.weight} | มูลค่า: ${step.value} | Ratio: ${step.ratio}
                    </p>
                    <div class="fraction-bar" style="margin: 8px 0;">
                        <div class="fraction-bar-track">
                            <div class="fraction-bar-fill" style="width: ${fractionWidth}%"></div>
                        </div>
                        <span class="fraction-text">${step.fractionPercent}</span>
                    </div>
                    <p>
                        หยิบน้ำหนัก: <strong>${step.weightTaken}</strong> |
                        ได้มูลค่า: <strong>${step.valueTaken}</strong> |
                        ความจุคงเหลือ: <strong>${step.remainingCapacity}</strong>
                    </p>
                    <span class="step-value">มูลค่าสะสม: ${step.cumulativeValue}</span>
                </div>
            </div>
        `;
    });

    html += `</div></div>`;

    // Summary Table
    html += `
        <div class="result-card">
            <div class="result-title">📊 สรุปผลการหยิบ</div>
            <table class="result-table">
                <thead>
                    <tr>
                        <th>ลำดับ</th>
                        <th>สิ่งของ</th>
                        <th>สัดส่วนที่หยิบ</th>
                        <th>น้ำหนักที่หยิบ</th>
                        <th>มูลค่าที่ได้</th>
                        <th>มูลค่าสะสม</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.steps.forEach((step, idx) => {
        html += `
            <tr>
                <td>${idx + 1}</td>
                <td style="font-weight:600;">${step.name}</td>
                <td>
                    <div class="fraction-bar">
                        <div class="fraction-bar-track">
                            <div class="fraction-bar-fill" style="width: ${(step.fraction * 100).toFixed(0)}%"></div>
                        </div>
                        <span class="fraction-text">${step.fractionPercent}</span>
                    </div>
                </td>
                <td>${step.weightTaken}</td>
                <td style="color: var(--accent-amber); font-weight:600;">${step.valueTaken}</td>
                <td style="color: var(--accent-green); font-weight:700;">${step.cumulativeValue}</td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;

    html += `</div>`;
    resultDiv.innerHTML = html;
}

// ===== Solve DP =====
async function solveDP() {
    const items = getItems('dp');
    const capacity = parseFloat(document.getElementById('dp-capacity').value);

    if (items.length === 0 || isNaN(capacity) || capacity <= 0) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    // Check capacity is integer for DP
    if (!Number.isInteger(capacity)) {
        alert('ความจุของเป้ต้องเป็นจำนวนเต็มสำหรับ 0/1 Knapsack');
        return;
    }

    const resultDiv = document.getElementById('dp-result');
    resultDiv.innerHTML = `
        <div class="loading">
            <div class="spinner" style="border-top-color: var(--accent-blue);"></div>
            <span>กำลังคำนวณ...</span>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/api/knapsack01`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, capacity })
        });

        const data = await response.json();

        if (data.success) {
            renderDPResult(data);
        } else {
            resultDiv.innerHTML = `<div class="card" style="color: var(--accent-rose);">❌ Error: ${data.error}</div>`;
        }
    } catch (err) {
        resultDiv.innerHTML = `<div class="card" style="color: var(--accent-rose);">❌ ไม่สามารถเชื่อมต่อ Server ได้</div>`;
    }
}

// ===== Render DP Result =====
function renderDPResult(data) {
    const resultDiv = document.getElementById('dp-result');

    let html = `<div class="result-section">`;

    // Max Value
    html += `
        <div class="max-value-box">
            <span class="label">💰 มูลค่ารวมสูงสุด (Max Value)</span>
            <span class="value">${data.totalValue}</span>
        </div>
    `;

    // Selected Items
    html += `
        <div class="result-card dp-result">
            <div class="result-title">✅ สิ่งของที่ถูกเลือก</div>
            <div class="selected-items-list">
    `;

    let totalWeight = 0;
    data.selectedItems.forEach((item, idx) => {
        totalWeight += item.weight;
        html += `
            <div class="selected-badge" style="animation-delay: ${idx * 0.1}s">
                <span class="badge-name">📦 ${item.name}</span>
                <span class="badge-info">w=${item.weight}, v=${item.value}</span>
            </div>
        `;
    });

    html += `</div>`;

    html += `
        <table class="result-table" style="margin-top: 16px;">
            <thead>
                <tr>
                    <th>สิ่งของที่</th>
                    <th>ชื่อ</th>
                    <th>น้ำหนัก (w)</th>
                    <th>มูลค่า (v)</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.selectedItems.forEach(item => {
        html += `
            <tr>
                <td>${item.index}</td>
                <td style="font-weight:600; color: var(--accent-green);">${item.name}</td>
                <td>${item.weight}</td>
                <td style="color: var(--accent-amber); font-weight:600;">${item.value}</td>
            </tr>
        `;
    });

    html += `
            <tr style="background: rgba(255,255,255,0.04); font-weight: 700;">
                <td colspan="2" style="text-align: right;">รวม</td>
                <td>${totalWeight}</td>
                <td style="color: var(--accent-amber);">${data.totalValue}</td>
            </tr>
        </tbody></table>
    </div>`;

    // DP Table
    if (data.dpTable && data.capacity <= 30 && data.items.length <= 10) {
        html += `
            <div class="result-card dp-result">
                <div class="result-title">📊 ตาราง DP (Dynamic Programming Table)</div>
                <div class="dp-table-wrapper">
                    <table class="dp-table">
                        <thead>
                            <tr>
                                <th>Item \\ W</th>
        `;

        for (let w = 0; w <= data.capacity; w++) {
            html += `<th>${w}</th>`;
        }
        html += `</tr></thead><tbody>`;

        // Find traceback path for highlighting
        const tracebackCells = findTracebackPath(data);

        for (let i = 0; i <= data.items.length; i++) {
            html += `<tr>`;
            if (i === 0) {
                html += `<td class="row-header">∅ (ไม่มีของ)</td>`;
            } else {
                html += `<td class="row-header">${data.items[i - 1].name} (w=${data.items[i - 1].weight}, v=${data.items[i - 1].value})</td>`;
            }

            for (let w = 0; w <= data.capacity; w++) {
                const isOnPath = tracebackCells.some(c => c.i === i && c.w === w);
                const isMax = (i === data.items.length && w === data.capacity);
                let cls = '';
                if (isMax) cls = 'highlight';
                else if (isOnPath) cls = 'selected-path';

                html += `<td class="${cls}">${data.dpTable[i][w]}</td>`;
            }
            html += `</tr>`;
        }

        html += `</tbody></table></div>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 8px;">
                🟢 เซลล์สีเขียว = เส้นทาง Traceback | 🔵 เซลล์สีน้ำเงิน = คำตอบสูงสุด
            </p>
        </div>`;
    } else if (data.dpTable) {
        html += `
            <div class="result-card dp-result">
                <div class="result-title">📊 ตาราง DP</div>
                <p style="color: var(--text-secondary);">
                    ⚠️ ตาราง DP มีขนาดใหญ่เกินไปสำหรับการแสดงผล (ความจุ: ${data.capacity}, จำนวนของ: ${data.items.length})
                    <br>แสดงเฉพาะผลลัพธ์ที่เลือก
                </p>
            </div>
        `;
    }

    html += `</div>`;
    resultDiv.innerHTML = html;
}

// ===== Find Traceback Path for DP =====
function findTracebackPath(data) {
    const cells = [];
    const n = data.items.length;
    let w = data.capacity;

    cells.push({ i: n, w: w });

    for (let i = n; i > 0; i--) {
        if (data.dpTable[i][w] !== data.dpTable[i - 1][w]) {
            // Item i was selected
            cells.push({ i: i - 1, w: w - data.items[i - 1].weight });
            w -= data.items[i - 1].weight;
        } else {
            cells.push({ i: i - 1, w: w });
        }
    }

    return cells;
}
