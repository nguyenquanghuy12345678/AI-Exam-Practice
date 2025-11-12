// Alpha-Beta Pruning (Minimax) Implementation
function solveAlphaBeta() {
    clearOutput('alphabeta');
    
    try {
        // Parse input
        const treeInput = document.getElementById('alphabeta-tree').value;
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
                value: null,
                alpha: -Infinity,
                beta: Infinity,
                pruned: false
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
        addStep('alphabeta', ++stepCount, `Bắt đầu Alpha-Beta Pruning từ node gốc <strong>${root}</strong>`);
        addStep('alphabeta', ++stepCount, `Alpha ban đầu = -∞, Beta ban đầu = +∞`);
        
        // Alpha-Beta Minimax
        const result = alphabeta(root, tree, children, -Infinity, Infinity, stepCount);
        
        // Display result
        showResult('alphabeta', 'Kết quả Alpha-Beta Pruning', `
            <div class="result-item">
                <strong>Giá trị tối ưu tại node gốc ${root}:</strong> ${result.value}
            </div>
            <div class="result-item">
                <strong>Số node đã cắt tỉa:</strong> ${result.prunedCount}
            </div>
            <div class="result-item">
                <strong>Các node bị cắt:</strong> ${result.prunedNodes.join(', ') || 'Không có'}
            </div>
        `);
        
        // Visualize tree
        visualizeTree('alphabeta-canvas', tree, children, root, result.prunedNodes);
        
    } catch (error) {
        showError('alphabeta', error.message);
    }
}

function alphabeta(node, tree, children, alpha, beta, stepCount) {
    const nodeData = tree[node];
    
    // Leaf node
    if (nodeData.type === 'LEAF') {
        addStep('alphabeta', ++stepCount, 
            `Node lá <strong>${node}</strong> có giá trị: ${nodeData.value}`
        );
        return { value: nodeData.value, stepCount, prunedNodes: [], prunedCount: 0 };
    }
    
    const nodeChildren = children[node] || [];
    const isMax = nodeData.type === 'MAX';
    let value = isMax ? -Infinity : Infinity;
    let prunedNodes = [];
    let prunedCount = 0;
    
    addStep('alphabeta', ++stepCount, 
        `Xét node <strong>${node}</strong> (${nodeData.type}), α=${alpha === -Infinity ? '-∞' : alpha}, β=${beta === Infinity ? '+∞' : beta}`,
        'highlight'
    );
    
    for (let i = 0; i < nodeChildren.length; i++) {
        const child = nodeChildren[i];
        
        // Check if should prune
        if ((isMax && value >= beta) || (!isMax && value <= alpha)) {
            addStep('alphabeta', ++stepCount, 
                `⚡ Cắt tỉa! Bỏ qua các node còn lại: ${nodeChildren.slice(i).join(', ')}`,
                'success'
            );
            prunedNodes.push(...nodeChildren.slice(i));
            prunedCount += nodeChildren.length - i;
            
            for (let j = i; j < nodeChildren.length; j++) {
                tree[nodeChildren[j]].pruned = true;
            }
            break;
        }
        
        const result = alphabeta(child, tree, children, alpha, beta, stepCount);
        stepCount = result.stepCount;
        prunedNodes.push(...result.prunedNodes);
        prunedCount += result.prunedCount;
        
        if (isMax) {
            if (result.value > value) {
                value = result.value;
                addStep('alphabeta', ++stepCount, 
                    `Node MAX <strong>${node}</strong>: Cập nhật giá trị = max(${value}, ${result.value}) = ${value}`
                );
            }
            alpha = Math.max(alpha, value);
        } else {
            if (result.value < value) {
                value = result.value;
                addStep('alphabeta', ++stepCount, 
                    `Node MIN <strong>${node}</strong>: Cập nhật giá trị = min(${value}, ${result.value}) = ${value}`
                );
            }
            beta = Math.min(beta, value);
        }
        
        addStep('alphabeta', ++stepCount, 
            `Sau xét ${child}: α=${alpha === -Infinity ? '-∞' : alpha}, β=${beta === Infinity ? '+∞' : beta}`
        );
    }
    
    addStep('alphabeta', ++stepCount, 
        `Node <strong>${node}</strong> trả về giá trị: <strong>${value}</strong>`
    );
    
    return { value, stepCount, prunedNodes, prunedCount };
}
