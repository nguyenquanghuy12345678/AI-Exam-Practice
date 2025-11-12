// Decision Tree Implementation using ID3 Algorithm
function solveDecisionTree() {
    clearOutput('decisiontree');
    
    try {
        // Parse input
        const dataInput = document.getElementById('decisiontree-data').value;
        const predictInput = document.getElementById('decisiontree-predict').value;
        
        // Parse CSV data
        const lines = dataInput.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('Dữ liệu không đủ');
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        const classLabel = headers[headers.length - 1];
        const features = headers.slice(0, -1);
        
        // Parse training data
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((h, idx) => {
                    row[h] = values[idx];
                });
                data.push(row);
            }
        }
        
        // Parse prediction input
        const predictData = {};
        const predictLines = predictInput.split('\n').filter(line => line.trim());
        for (let line of predictLines) {
            const [key, value] = line.split('=').map(s => s.trim());
            if (key && value) {
                predictData[key] = value;
            }
        }
        
        let stepCount = 0;
        addStep('decisiontree', ++stepCount, 
            `Xây dựng cây quyết định từ ${data.length} mẫu dữ liệu`
        );
        
        // Build decision tree using ID3
        const tree = buildTree(data, features, classLabel, stepCount);
        
        addStep('decisiontree', ++stepCount, 
            `✅ Hoàn thành xây dựng cây quyết định`,
            'success'
        );
        
        // Make prediction
        addStep('decisiontree', ++stepCount, 
            `Dự đoán cho: ${JSON.stringify(predictData)}`,
            'highlight'
        );
        
        const prediction = predict(tree.tree, predictData, stepCount);
        
        // Display result
        const treeStr = JSON.stringify(tree.tree, null, 2);
        showResult('decisiontree', 'Cây quyết định đã xây dựng', `
            <div class="result-item">
                <strong>Thuật toán:</strong> ID3 (Iterative Dichotomiser 3)
            </div>
            <div class="result-item">
                <strong>Tiêu chí phân chia:</strong> Information Gain (dựa trên Entropy)
            </div>
            <div class="result-item">
                <strong>Cấu trúc cây:</strong>
                <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto;">${treeStr}</pre>
            </div>
            <div class="result-item" style="background: #d4edda;">
                <strong>Kết quả dự đoán:</strong> ${prediction.prediction}
            </div>
            <div class="result-item">
                <strong>Đường đi trên cây:</strong> ${prediction.path.join(' → ')}
            </div>
        `);
        
        addStep('decisiontree', ++stepCount, 
            `🎯 Dự đoán: <strong>${prediction.prediction}</strong>`,
            'success'
        );
        
        // Visualize
        visualizeDecisionTree('decisiontree-canvas', tree.tree);
        
    } catch (error) {
        showError('decisiontree', error.message);
    }
}

// Calculate entropy
function calculateEntropy(data, classLabel) {
    const classCounts = {};
    data.forEach(row => {
        const cls = row[classLabel];
        classCounts[cls] = (classCounts[cls] || 0) + 1;
    });
    
    let entropy = 0;
    const total = data.length;
    
    for (let cls in classCounts) {
        const p = classCounts[cls] / total;
        entropy -= p * Math.log2(p);
    }
    
    return entropy;
}

// Calculate information gain
function calculateInformationGain(data, feature, classLabel) {
    const total = data.length;
    const parentEntropy = calculateEntropy(data, classLabel);
    
    // Group by feature values
    const groups = {};
    data.forEach(row => {
        const value = row[feature];
        if (!groups[value]) groups[value] = [];
        groups[value].push(row);
    });
    
    // Calculate weighted entropy
    let weightedEntropy = 0;
    for (let value in groups) {
        const subset = groups[value];
        const weight = subset.length / total;
        weightedEntropy += weight * calculateEntropy(subset, classLabel);
    }
    
    return parentEntropy - weightedEntropy;
}

// Build decision tree
function buildTree(data, features, classLabel, stepCount) {
    // Base case: all same class
    const classes = [...new Set(data.map(row => row[classLabel]))];
    if (classes.length === 1) {
        return { tree: classes[0], stepCount };
    }
    
    // Base case: no more features
    if (features.length === 0) {
        // Return majority class
        const classCounts = {};
        data.forEach(row => {
            const cls = row[classLabel];
            classCounts[cls] = (classCounts[cls] || 0) + 1;
        });
        const majority = Object.keys(classCounts).reduce((a, b) => 
            classCounts[a] > classCounts[b] ? a : b
        );
        return { tree: majority, stepCount };
    }
    
    // Find best feature to split
    let bestFeature = null;
    let bestGain = -1;
    
    addStep('decisiontree', ++stepCount, 
        `Tính Information Gain cho các feature: ${features.join(', ')}`
    );
    
    for (let feature of features) {
        const gain = calculateInformationGain(data, feature, classLabel);
        addStep('decisiontree', ++stepCount, 
            `IG(${feature}) = ${gain.toFixed(4)}`
        );
        
        if (gain > bestGain) {
            bestGain = gain;
            bestFeature = feature;
        }
    }
    
    addStep('decisiontree', ++stepCount, 
        `Chọn feature <strong>${bestFeature}</strong> (IG = ${bestGain.toFixed(4)}) để phân chia`,
        'highlight'
    );
    
    // Create tree node
    const tree = {
        feature: bestFeature,
        children: {}
    };
    
    // Group by best feature
    const groups = {};
    data.forEach(row => {
        const value = row[bestFeature];
        if (!groups[value]) groups[value] = [];
        groups[value].push(row);
    });
    
    // Recursively build subtrees
    const remainingFeatures = features.filter(f => f !== bestFeature);
    
    for (let value in groups) {
        const subset = groups[value];
        const result = buildTree(subset, remainingFeatures, classLabel, stepCount);
        tree.children[value] = result.tree;
        stepCount = result.stepCount;
    }
    
    return { tree, stepCount };
}

// Make prediction using decision tree
function predict(tree, data, stepCount) {
    const path = [];
    
    function traverse(node, currentData) {
        // Leaf node
        if (typeof node === 'string') {
            return node;
        }
        
        const feature = node.feature;
        const value = currentData[feature];
        
        addStep('decisiontree', ++stepCount, 
            `Kiểm tra feature <strong>${feature}</strong> = ${value}`
        );
        
        path.push(`${feature}=${value}`);
        
        if (node.children[value]) {
            return traverse(node.children[value], currentData);
        } else {
            // Value not seen in training data
            return 'Unknown';
        }
    }
    
    const prediction = traverse(tree, data);
    return { prediction, path };
}

// Visualize decision tree
function visualizeDecisionTree(canvasId, tree) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Calculate tree structure
    const levels = {};
    const positions = {};
    let nodeId = 0;
    
    function calculateLevels(node, level = 0, parentId = null) {
        if (!levels[level]) levels[level] = [];
        
        const currentId = nodeId++;
        const nodeInfo = {
            id: currentId,
            node: node,
            parentId: parentId
        };
        
        levels[level].push(nodeInfo);
        
        if (typeof node === 'object' && node.children) {
            for (let value in node.children) {
                calculateLevels(node.children[value], level + 1, currentId);
            }
        }
        
        return currentId;
    }
    
    calculateLevels(tree);
    
    const levelHeight = height / (Object.keys(levels).length + 1);
    
    // Calculate positions
    Object.keys(levels).forEach(level => {
        const nodesInLevel = levels[level];
        const levelWidth = width / (nodesInLevel.length + 1);
        
        nodesInLevel.forEach((nodeInfo, i) => {
            positions[nodeInfo.id] = {
                x: levelWidth * (i + 1),
                y: levelHeight * (parseInt(level) + 1),
                node: nodeInfo.node,
                parentId: nodeInfo.parentId
            };
        });
    });
    
    // Draw edges
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.font = '10px Arial';
    
    Object.keys(positions).forEach(id => {
        const pos = positions[id];
        if (pos.parentId !== null) {
            const parentPos = positions[pos.parentId];
            
            ctx.beginPath();
            ctx.moveTo(parentPos.x, parentPos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    });
    
    // Draw nodes
    Object.keys(positions).forEach(id => {
        const pos = positions[id];
        const node = pos.node;
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
        
        if (typeof node === 'string') {
            // Leaf node
            ctx.fillStyle = '#d4edda';
        } else {
            // Decision node
            ctx.fillStyle = '#fff3cd';
        }
        
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (typeof node === 'string') {
            ctx.fillText(node, pos.x, pos.y);
        } else {
            ctx.fillText(node.feature, pos.x, pos.y);
        }
    });
}
