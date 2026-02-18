module.exports = (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { items, capacity } = req.body;
        const n = items.length;
        const W = Math.floor(capacity);

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
};
