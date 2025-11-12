// Uniform Cost Search (UCS) Implementation
function solveUCS() {
    clearOutput('ucs');
    
    try {
        // Parse input
        const nodesInput = document.getElementById('ucs-nodes').value;
        const edgesInput = document.getElementById('ucs-edges').value;
        const start = document.getElementById('ucs-start').value.trim();
        const goal = document.getElementById('ucs-goal').value.trim();
        
        const nodes = parseNodes(nodesInput);
        const edges = parseEdges(edgesInput);
        const graph = buildGraph(nodes, edges);
        
        // Validate input
        if (!nodes.includes(start)) {
            throw new Error(`Điểm bắt đầu "${start}" không tồn tại trong đồ thị`);
        }
        if (!nodes.includes(goal)) {
            throw new Error(`Điểm đích "${goal}" không tồn tại trong đồ thị`);
        }
        
        // UCS Algorithm (f(n) = g(n))
        const openSet = [{ node: start, cost: 0, path: [start] }];
        const closedSet = new Set();
        const visited = {};
        let stepCount = 0;
        
        addStep('ucs', ++stepCount, `Bắt đầu UCS từ <strong>${start}</strong>, mục tiêu: <strong>${goal}</strong>`);
        addStep('ucs', ++stepCount, `Công thức: f(n) = g(n) (chỉ dựa vào chi phí thực tế)`);
        
        while (openSet.length > 0) {
            // Sort by cost and get the node with lowest cost
            openSet.sort((a, b) => a.cost - b.cost);
            const current = openSet.shift();
            
            addStep('ucs', ++stepCount, 
                `Chọn <strong>${current.node}</strong> với chi phí g=${formatCost(current.cost)}`
            );
            
            // Skip if already visited with lower cost
            if (visited[current.node] && visited[current.node] < current.cost) {
                continue;
            }
            visited[current.node] = current.cost;
            
            // Goal found
            if (current.node === goal) {
                showResult('ucs', 'Tìm thấy đường đi!', `
                    <div class="result-item">
                        <strong>Đường đi:</strong> <span class="path-highlight">${formatPath(current.path)}</span>
                    </div>
                    <div class="result-item">
                        <strong>Tổng chi phí:</strong> ${formatCost(current.cost)}
                    </div>
                    <div class="result-item">
                        <strong>Số bước:</strong> ${stepCount}
                    </div>
                `);
                
                addStep('ucs', ++stepCount, 
                    `🎯 Đạt đích! Đường đi: <strong>${formatPath(current.path)}</strong>, Chi phí: <strong>${formatCost(current.cost)}</strong>`,
                    'success'
                );
                
                // Visualize
                visualizeGraph('ucs-canvas', nodes, edges, current.path);
                return;
            }
            
            closedSet.add(current.node);
            
            // Explore neighbors
            const neighbors = graph[current.node] || [];
            for (let neighbor of neighbors) {
                if (closedSet.has(neighbor.node)) continue;
                
                const newCost = current.cost + neighbor.cost;
                const newPath = [...current.path, neighbor.node];
                
                // Add to open set
                openSet.push({ node: neighbor.node, cost: newCost, path: newPath });
                addStep('ucs', ++stepCount, 
                    `Thêm <strong>${neighbor.node}</strong> vào Open: g=${formatCost(newCost)} (từ ${current.node}, cộng ${neighbor.cost})`
                );
            }
            
            const openNodes = openSet.map(item => `${item.node}(${formatCost(item.cost)})`).join(', ');
            const closedNodes = Array.from(closedSet).join(', ');
            addStep('ucs', ++stepCount, 
                `Open: [${openNodes}]<br>Closed: [${closedNodes}]`,
                'highlight'
            );
        }
        
        // No path found
        showError('ucs', 'Không tìm thấy đường đi từ ' + start + ' đến ' + goal);
        addStep('ucs', ++stepCount, '❌ Không tìm thấy đường đi');
        
    } catch (error) {
        showError('ucs', error.message);
    }
}
