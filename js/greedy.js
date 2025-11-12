// Greedy Best-First Search Implementation
function solveGreedy() {
    clearOutput('greedy');
    
    try {
        // Parse input
        const nodesInput = document.getElementById('greedy-nodes').value;
        const edgesInput = document.getElementById('greedy-edges').value;
        const heuristicInput = document.getElementById('greedy-heuristic').value;
        const start = document.getElementById('greedy-start').value.trim();
        const goal = document.getElementById('greedy-goal').value.trim();
        
        const nodes = parseNodes(nodesInput);
        const edges = parseEdges(edgesInput);
        const heuristic = parseHeuristic(heuristicInput);
        const graph = buildGraph(nodes, edges);
        
        // Validate input
        if (!nodes.includes(start)) {
            throw new Error(`Điểm bắt đầu "${start}" không tồn tại trong đồ thị`);
        }
        if (!nodes.includes(goal)) {
            throw new Error(`Điểm đích "${goal}" không tồn tại trong đồ thị`);
        }
        
        // Greedy Algorithm (f(n) = h(n))
        const openSet = [{ node: start, h: heuristic[start] || 0, cost: 0, path: [start] }];
        const closedSet = new Set();
        let stepCount = 0;
        
        addStep('greedy', ++stepCount, `Bắt đầu Greedy từ <strong>${start}</strong>, mục tiêu: <strong>${goal}</strong>`);
        addStep('greedy', ++stepCount, `Công thức: f(n) = h(n) (chỉ dựa vào heuristic)`);
        
        while (openSet.length > 0) {
            // Sort by h value and get the node with lowest h
            openSet.sort((a, b) => a.h - b.h);
            const current = openSet.shift();
            
            addStep('greedy', ++stepCount, 
                `Chọn <strong>${current.node}</strong> với h=${formatCost(current.h)} (chi phí thực: ${formatCost(current.cost)})`
            );
            
            // Goal found
            if (current.node === goal) {
                showResult('greedy', 'Tìm thấy đường đi!', `
                    <div class="result-item">
                        <strong>Đường đi:</strong> <span class="path-highlight">${formatPath(current.path)}</span>
                    </div>
                    <div class="result-item">
                        <strong>Tổng chi phí:</strong> ${formatCost(current.cost)}
                    </div>
                    <div class="result-item">
                        <strong>Số bước:</strong> ${stepCount}
                    </div>
                    <div class="result-item" style="background: #fff3cd;">
                        <strong>Lưu ý:</strong> Greedy không đảm bảo tìm được đường đi tối ưu, chỉ tìm nhanh dựa vào heuristic
                    </div>
                `);
                
                addStep('greedy', ++stepCount, 
                    `🎯 Đạt đích! Đường đi: <strong>${formatPath(current.path)}</strong>, Chi phí: <strong>${formatCost(current.cost)}</strong>`,
                    'success'
                );
                
                // Visualize
                visualizeGraph('greedy-canvas', nodes, edges, current.path, heuristic);
                return;
            }
            
            closedSet.add(current.node);
            
            // Explore neighbors
            const neighbors = graph[current.node] || [];
            let addedNeighbors = [];
            
            for (let neighbor of neighbors) {
                if (closedSet.has(neighbor.node)) continue;
                
                const h = heuristic[neighbor.node] || 0;
                const newCost = current.cost + neighbor.cost;
                const newPath = [...current.path, neighbor.node];
                
                // Check if neighbor is already in openSet
                const existingIndex = openSet.findIndex(item => item.node === neighbor.node);
                
                if (existingIndex === -1) {
                    openSet.push({ node: neighbor.node, h, cost: newCost, path: newPath });
                    addedNeighbors.push(`${neighbor.node}(h=${formatCost(h)})`);
                }
            }
            
            if (addedNeighbors.length > 0) {
                addStep('greedy', ++stepCount, 
                    `Thêm vào Open: ${addedNeighbors.join(', ')}`
                );
            }
            
            const openNodes = openSet.map(item => `${item.node}(h=${formatCost(item.h)})`).join(', ');
            const closedNodes = Array.from(closedSet).join(', ');
            addStep('greedy', ++stepCount, 
                `Open: [${openNodes}]<br>Closed: [${closedNodes}]`,
                'highlight'
            );
        }
        
        // No path found
        showError('greedy', 'Không tìm thấy đường đi từ ' + start + ' đến ' + goal);
        addStep('greedy', ++stepCount, '❌ Không tìm thấy đường đi');
        
    } catch (error) {
        showError('greedy', error.message);
    }
}
