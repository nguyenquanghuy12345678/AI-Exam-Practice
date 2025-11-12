// A* Search Algorithm Implementation
function solveAStar() {
    clearOutput('astar');
    
    try {
        // Parse input
        const nodesInput = document.getElementById('astar-nodes').value;
        const edgesInput = document.getElementById('astar-edges').value;
        const heuristicInput = document.getElementById('astar-heuristic').value;
        const start = document.getElementById('astar-start').value.trim();
        const goal = document.getElementById('astar-goal').value.trim();
        
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
        
        // A* Algorithm
        const openSet = [{ node: start, g: 0, h: heuristic[start] || 0, f: heuristic[start] || 0, path: [start] }];
        const closedSet = new Set();
        let stepCount = 0;
        
        addStep('astar', ++stepCount, `Bắt đầu từ <strong>${start}</strong>, mục tiêu: <strong>${goal}</strong>`);
        addStep('astar', ++stepCount, `Open: [${start}], Closed: []`);
        
        while (openSet.length > 0) {
            // Sort by f value and get the node with lowest f
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            addStep('astar', ++stepCount, 
                `Chọn <strong>${current.node}</strong> với f=${formatCost(current.f)} (g=${formatCost(current.g)}, h=${formatCost(current.h)})`
            );
            
            // Goal found
            if (current.node === goal) {
                const totalCost = current.g;
                showResult('astar', 'Tìm thấy đường đi!', `
                    <div class="result-item">
                        <strong>Đường đi:</strong> <span class="path-highlight">${formatPath(current.path)}</span>
                    </div>
                    <div class="result-item">
                        <strong>Tổng chi phí:</strong> ${formatCost(totalCost)}
                    </div>
                    <div class="result-item">
                        <strong>Số bước:</strong> ${stepCount}
                    </div>
                `);
                
                addStep('astar', ++stepCount, 
                    `🎯 Đạt đích! Đường đi: <strong>${formatPath(current.path)}</strong>, Chi phí: <strong>${formatCost(totalCost)}</strong>`,
                    'success'
                );
                
                // Visualize
                visualizeGraph('astar-canvas', nodes, edges, current.path, heuristic);
                return;
            }
            
            closedSet.add(current.node);
            
            // Explore neighbors
            const neighbors = graph[current.node] || [];
            for (let neighbor of neighbors) {
                if (closedSet.has(neighbor.node)) continue;
                
                const g = current.g + neighbor.cost;
                const h = heuristic[neighbor.node] || 0;
                const f = g + h;
                const newPath = [...current.path, neighbor.node];
                
                // Check if neighbor is already in openSet
                const existingIndex = openSet.findIndex(item => item.node === neighbor.node);
                
                if (existingIndex === -1) {
                    openSet.push({ node: neighbor.node, g, h, f, path: newPath });
                    addStep('astar', ++stepCount, 
                        `Thêm <strong>${neighbor.node}</strong> vào Open: f=${formatCost(f)} (g=${formatCost(g)} + h=${formatCost(h)})`
                    );
                } else if (g < openSet[existingIndex].g) {
                    openSet[existingIndex] = { node: neighbor.node, g, h, f, path: newPath };
                    addStep('astar', ++stepCount, 
                        `Cập nhật <strong>${neighbor.node}</strong>: f=${formatCost(f)} (tốt hơn)`
                    );
                }
            }
            
            const openNodes = openSet.map(item => `${item.node}(${formatCost(item.f)})`).join(', ');
            const closedNodes = Array.from(closedSet).join(', ');
            addStep('astar', ++stepCount, 
                `Open: [${openNodes}]<br>Closed: [${closedNodes}]`,
                'highlight'
            );
        }
        
        // No path found
        showError('astar', 'Không tìm thấy đường đi từ ' + start + ' đến ' + goal);
        addStep('astar', ++stepCount, '❌ Không tìm thấy đường đi', 'error');
        
    } catch (error) {
        showError('astar', error.message);
    }
}
