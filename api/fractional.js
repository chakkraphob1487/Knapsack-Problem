module.exports = (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { items, capacity, strategy = 'ratio' } = req.body;

        const itemsWithMetrics = items.map((item, index) => ({
            ...item,
            index: index + 1,
            ratio: item.value / item.weight,
        }));

        let sortedItems;
        let strategyName;
        let sortCriterion;

        if (strategy === 'value') {
            sortedItems = [...itemsWithMetrics].sort((a, b) => b.value - a.value);
            strategyName = 'เลือกของที่มีมูลค่าสูงสุด (Max Value)';
            sortCriterion = 'value';
        } else if (strategy === 'weight') {
            sortedItems = [...itemsWithMetrics].sort((a, b) => a.weight - b.weight);
            strategyName = 'เลือกของน้ำหนักน้อยสุด (Min Weight)';
            sortCriterion = 'weight';
        } else {
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
};
