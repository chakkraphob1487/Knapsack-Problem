const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========================
// Fractional Knapsack (Greedy Algorithm)
// ========================
app.post('/api/fractional', (req, res) => {
    try {
        const { items, capacity, strategy = 'ratio' } = req.body;

        // Add index and ratio to items
        const itemsWithMetrics = items.map((item, index) => ({
            ...item,
            index: index + 1,
            ratio: item.value / item.weight,
        }));

        // Sort based on strategy
        let sortedItems;
        let strategyName;
        let sortCriterion;

        if (strategy === 'value') {
            // Strategy 1: Max Value First
            sortedItems = [...itemsWithMetrics].sort((a, b) => b.value - a.value);
            strategyName = 'เลือกของที่มีมูลค่าสูงสุด (Max Value)';
            sortCriterion = 'value';
        } else if (strategy === 'weight') {
            // Strategy 2: Min Weight First
            sortedItems = [...itemsWithMetrics].sort((a, b) => a.weight - b.weight);
            strategyName = 'เลือกของน้ำหนักน้อยสุด (Min Weight)';
            sortCriterion = 'weight';
        } else {
            // Strategy 3 (default): Max Ratio (Value/Weight)
            sortedItems = [...itemsWithMetrics].sort((a, b) => b.ratio - a.ratio);
            strategyName = 'เลือกของที่มีมูลค่าต่อน้ำหนักสูงสุด (Max Value/Weight)';
            sortCriterion = 'ratio';
        }

        let remainingCapacity = capacity;
        let totalValue = 0;
        const steps = [];

        for (const item of sortedItems) {
            if (remainingCapacity <= 0) break;

            if (item.weight <= remainingCapacity) {
                // Take the whole item
                const fraction = 1.0;
                const valueTaken = item.value;
                totalValue += valueTaken;
                remainingCapacity -= item.weight;

                steps.push({
                    itemIndex: item.index,
                    name: item.name,
                    weight: item.weight,
                    value: item.value,
                    ratio: parseFloat(item.ratio.toFixed(4)),
                    fraction: fraction,
                    fractionPercent: '100%',
                    weightTaken: item.weight,
                    valueTaken: parseFloat(valueTaken.toFixed(4)),
                    remainingCapacity: parseFloat(remainingCapacity.toFixed(4)),
                    cumulativeValue: parseFloat(totalValue.toFixed(4))
                });
            } else {
                // Take a fraction of the item
                const fraction = remainingCapacity / item.weight;
                const valueTaken = item.value * fraction;
                totalValue += valueTaken;

                steps.push({
                    itemIndex: item.index,
                    name: item.name,
                    weight: item.weight,
                    value: item.value,
                    ratio: parseFloat(item.ratio.toFixed(4)),
                    fraction: parseFloat(fraction.toFixed(4)),
                    fractionPercent: (fraction * 100).toFixed(2) + '%',
                    weightTaken: parseFloat(remainingCapacity.toFixed(4)),
                    valueTaken: parseFloat(valueTaken.toFixed(4)),
                    remainingCapacity: 0,
                    cumulativeValue: parseFloat(totalValue.toFixed(4))
                });

                remainingCapacity = 0;
            }
        }

        res.json({
            success: true,
            algorithm: 'Fractional Knapsack (Greedy)',
            strategy: strategyName,
            sortCriterion,
            capacity,
            totalValue: parseFloat(totalValue.toFixed(4)),
            steps,
            sortedItems: sortedItems.map(it => ({
                index: it.index,
                name: it.name,
                weight: it.weight,
                value: it.value,
                ratio: parseFloat(it.ratio.toFixed(4))
            }))
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ========================
// 0/1 Knapsack (Dynamic Programming)
// ========================
app.post('/api/knapsack01', (req, res) => {
    try {
        const { items, capacity } = req.body;
        const n = items.length;
        const W = Math.floor(capacity); // Ensure integer capacity

        // Build DP table
        // dp[i][w] = max value using first i items with capacity w
        const dp = [];
        for (let i = 0; i <= n; i++) {
            dp[i] = new Array(W + 1).fill(0);
        }

        for (let i = 1; i <= n; i++) {
            for (let w = 0; w <= W; w++) {
                const itemWeight = Math.floor(items[i - 1].weight);
                const itemValue = items[i - 1].value;
                
                if (itemWeight <= w) {
                    dp[i][w] = Math.max(
                        dp[i - 1][w],
                        dp[i - 1][w - itemWeight] + itemValue
                    );
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }

        // Traceback to find selected items
        const selectedItems = [];
        let w = W;
        for (let i = n; i > 0; i--) {
            if (dp[i][w] !== dp[i - 1][w]) {
                selectedItems.push({
                    index: i,
                    name: items[i - 1].name,
                    weight: items[i - 1].weight,
                    value: items[i - 1].value
                });
                w -= Math.floor(items[i - 1].weight);
            }
        }
        selectedItems.reverse();

        // Format DP table for display
        const dpTable = dp.map(row => [...row]);

        res.json({
            success: true,
            algorithm: '0/1 Knapsack (Dynamic Programming)',
            capacity: W,
            totalValue: dp[n][W],
            selectedItems,
            dpTable,
            items: items.map((item, idx) => ({
                index: idx + 1,
                name: item.name,
                weight: item.weight,
                value: item.value
            }))
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🎒 Knapsack Problem Server is running at http://localhost:${PORT}`);
});
