// Minimax Algorithm (without pruning) Implementation
function solveMinimax() {
    clearOutput('minimax');
    
    try {
        // Parse input
        const treeInput = document.getElementById('minimax-tree').value;
        const lines = treeInput.split('\n').filter(line => line.trim());
        
        // Build tree structure
        const tree = {};
        const children = {};
        let root = null;
        
        // First pass: create all nodes
        for (let line of lines) {
            const parts = line.split('-');
            if (parts.length !== 3) continue;
            
            const node = parts[0].trim();
            const type = parts[1].trim();
            const parent = parts[2].trim();
            
            if (parent === 'null') {
                root = node;
            }
            
            tree[node] = {
                name: node,
                type: type,
                parent: parent,
                value: null
            };
            
            // Check if type is a number (leaf node)
            const numValue = parseFloat(type);
            if (!isNaN(numValue)) {
                tree[node].value = numValue;
                tree[node].type = 'LEAF';
            }
            
            if (parent !== 'null') {
                if (!children[parent]) children[parent] = [];
                children[parent].push(node);
            }
        }
        
        if (!root) {
            throw new Error('Không tìm thấy node gốc (root)');
        }
        
        let stepCount = 0;
        addStep('minimax', ++stepCount, `Bắt đầu Minimax từ node gốc <strong>${root}</strong>`);
        addStep('minimax', ++stepCount, `⚠️ Lưu ý: Minimax duyệt toàn bộ cây (KHÔNG cắt tỉa)`);
        
        // Calculate total nodes
        const totalNodes = Object.keys(tree).length;
        
        // Minimax without pruning
        const result = minimax(root, tree, children, stepCount);
        
        // Display result
        showResult('minimax', 'Kết quả Minimax', `
            <div class="result-item">
                <strong>Giá trị tối ưu tại node gốc ${root}:</strong> ${result.value}
            </div>
            <div class="result-item">
                <strong>Tổng số node đã duyệt:</strong> ${totalNodes}/${totalNodes} (100%)
            </div>
            <div class="result-item" style="background: #fff3cd;">
                <strong>So sánh:</strong> Minimax duyệt toàn bộ cây, trong khi Alpha-Beta có thể cắt bớt nhiều nhánh
            </div>
        `);
        
        // Visualize tree
        visualizeMinimaxTree('minimax-canvas', tree, children, root);
        
    } catch (error) {
        showError('minimax', error.message);
    }
}

function minimax(node, tree, children, stepCount) {
    const nodeData = tree[node];
    
    // Leaf node
    if (nodeData.type === 'LEAF') {
        addStep('minimax', ++stepCount, 
            `Node lá <strong>${node}</strong> có giá trị: ${nodeData.value}`
        );
        return { value: nodeData.value, stepCount };
    }
    
    const nodeChildren = children[node] || [];
    const isMax = nodeData.type === 'MAX';
    let value = isMax ? -Infinity : Infinity;
    
    addStep('minimax', ++stepCount, 
        `Xét node <strong>${node}</strong> (${nodeData.type})`,
        'highlight'
    );
    
    for (let child of nodeChildren) {
        const result = minimax(child, tree, children, stepCount);
        stepCount = result.stepCount;
        
        if (isMax) {
            const oldValue = value;
            value = Math.max(value, result.value);
            if (value !== oldValue) {
                addStep('minimax', ++stepCount, 
                    `Node MAX <strong>${node}</strong>: Cập nhật giá trị = max(${oldValue === -Infinity ? '-∞' : oldValue}, ${result.value}) = ${value}`
                );
            }
        } else {
            const oldValue = value;
            value = Math.min(value, result.value);
            if (value !== oldValue) {
                addStep('minimax', ++stepCount, 
                    `Node MIN <strong>${node}</strong>: Cập nhật giá trị = min(${oldValue === Infinity ? '+∞' : oldValue}, ${result.value}) = ${value}`
                );
            }
        }
    }
    
    addStep('minimax', ++stepCount, 
        `Node <strong>${node}</strong> trả về giá trị: <strong>${value}</strong>`
    );
    
    tree[node].finalValue = value;
    return { value, stepCount };
}

// Visualization for Minimax tree
function visualizeMinimaxTree(canvasId, tree, children, root) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Calculate positions (same as visualizeTree)
    const levels = {};
    const positions = {};
    
    function calculateLevel(node, level = 0) {
        if (!levels[level]) levels[level] = [];
        levels[level].push(node);
        
        const nodeChildren = children[node] || [];
        nodeChildren.forEach(child => calculateLevel(child, level + 1));
    }
    
    calculateLevel(root);
    
    const levelHeight = height / (Object.keys(levels).length + 1);
    
    Object.keys(levels).forEach(level => {
        const nodesInLevel = levels[level];
        const levelWidth = width / (nodesInLevel.length + 1);
        
        nodesInLevel.forEach((node, i) => {
            positions[node] = {
                x: levelWidth * (i + 1),
                y: levelHeight * (parseInt(level) + 1)
            };
        });
    });
    
    // Draw edges
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    
    Object.keys(children).forEach(parent => {
        const parentPos = positions[parent];
        children[parent].forEach(child => {
            const childPos = positions[child];
            
            ctx.beginPath();
            ctx.moveTo(parentPos.x, parentPos.y);
            ctx.lineTo(childPos.x, childPos.y);
            ctx.stroke();
        });
    });
    
    // Draw nodes
    Object.keys(tree).forEach(nodeName => {
        const node = tree[nodeName];
        const pos = positions[nodeName];
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI);
        
        if (node.type === 'MAX') {
            ctx.fillStyle = '#d4edda';
        } else if (node.type === 'MIN') {
            ctx.fillStyle = '#fff3cd';
        } else {
            ctx.fillStyle = '#e7f3ff';
        }
        
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nodeName, pos.x, pos.y - 5);
        
        // Draw value/type
        ctx.font = '11px Arial';
        const label = node.value !== null ? node.value : node.type;
        ctx.fillText(label, pos.x, pos.y + 8);
        
        // Draw final value if calculated
        if (node.finalValue !== undefined) {
            ctx.fillStyle = '#667eea';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(`[${node.finalValue}]`, pos.x, pos.y + 40);
        }
    });
    
    // Draw legend
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('⚠️ Tất cả node đều được duyệt (không cắt tỉa)', 10, height - 10);
}
