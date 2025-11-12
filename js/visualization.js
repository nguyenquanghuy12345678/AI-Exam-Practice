// Visualization utilities for all algorithms

// Visualize graph for search algorithms
function visualizeGraph(canvasId, nodes, edges, path = [], heuristic = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate node positions (circular layout)
    const positions = {};
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        positions[node] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });
    
    // Draw edges
    ctx.lineWidth = 2;
    edges.forEach(edge => {
        const from = positions[edge.from];
        const to = positions[edge.to];
        
        if (!from || !to) return;
        
        // Check if edge is in path
        const inPath = path.some((node, i) => {
            if (i === 0) return false;
            return (path[i - 1] === edge.from && path[i] === edge.to) ||
                   (path[i - 1] === edge.to && path[i] === edge.from);
        });
        
        ctx.strokeStyle = inPath ? '#28a745' : '#999';
        ctx.lineWidth = inPath ? 4 : 2;
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        
        // Draw cost label
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(midX - 15, midY - 10, 30, 20);
        
        ctx.fillStyle = inPath ? '#28a745' : '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.cost.toString(), midX, midY);
    });
    
    // Draw nodes
    nodes.forEach(node => {
        const pos = positions[node];
        const inPath = path.includes(node);
        const isStart = path.length > 0 && path[0] === node;
        const isGoal = path.length > 0 && path[path.length - 1] === node;
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI);
        
        if (isStart) {
            ctx.fillStyle = '#007bff';
        } else if (isGoal) {
            ctx.fillStyle = '#28a745';
        } else if (inPath) {
            ctx.fillStyle = '#ffc107';
        } else {
            ctx.fillStyle = '#f8f9fa';
        }
        
        ctx.fill();
        ctx.strokeStyle = inPath ? '#333' : '#999';
        ctx.lineWidth = inPath ? 3 : 2;
        ctx.stroke();
        
        // Draw node label
        ctx.fillStyle = isStart || isGoal ? 'white' : '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node, pos.x, pos.y);
        
        // Draw heuristic if available
        if (heuristic[node] !== undefined) {
            ctx.fillStyle = 'white';
            ctx.fillRect(pos.x - 20, pos.y + 30, 40, 18);
            
            ctx.fillStyle = '#667eea';
            ctx.font = 'bold 11px Arial';
            ctx.fillText(`h=${heuristic[node]}`, pos.x, pos.y + 39);
        }
    });
    
    // Draw legend
    drawLegend(ctx, width, height, true);
}

// Visualize tree for Alpha-Beta
function visualizeTree(canvasId, tree, children, root, prunedNodes = []) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Calculate positions
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
            
            const isPruned = prunedNodes.includes(child);
            ctx.strokeStyle = isPruned ? '#dc3545' : '#999';
            ctx.lineWidth = isPruned ? 3 : 2;
            
            if (isPruned) {
                ctx.setLineDash([5, 5]);
            } else {
                ctx.setLineDash([]);
            }
            
            ctx.beginPath();
            ctx.moveTo(parentPos.x, parentPos.y);
            ctx.lineTo(childPos.x, childPos.y);
            ctx.stroke();
        });
    });
    
    ctx.setLineDash([]);
    
    // Draw nodes
    Object.keys(tree).forEach(nodeName => {
        const node = tree[nodeName];
        const pos = positions[nodeName];
        const isPruned = prunedNodes.includes(nodeName);
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI);
        
        if (isPruned) {
            ctx.fillStyle = '#ffdddd';
        } else if (node.type === 'MAX') {
            ctx.fillStyle = '#d4edda';
        } else if (node.type === 'MIN') {
            ctx.fillStyle = '#fff3cd';
        } else {
            ctx.fillStyle = '#e7f3ff';
        }
        
        ctx.fill();
        ctx.strokeStyle = isPruned ? '#dc3545' : '#333';
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
        
        // Draw pruned mark
        if (isPruned) {
            ctx.fillStyle = '#dc3545';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('✂ PRUNED', pos.x, pos.y + 40);
        }
    });
}

// Visualize regression
function visualizeRegression(canvasId, data, a, b, predictX, predictY) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Find data range
    const xValues = data.map(p => p.x);
    const yValues = data.map(p => p.y);
    
    const minX = Math.min(...xValues, predictX) - 1;
    const maxX = Math.max(...xValues, predictX) + 1;
    const minY = Math.min(...yValues, predictY) - 20;
    const maxY = Math.max(...yValues, predictY) + 20;
    
    const padding = 50;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Scale functions
    const scaleX = (x) => padding + ((x - minX) / (maxX - minX)) * chartWidth;
    const scaleY = (y) => height - padding - ((y - minY) / (maxY - minY)) * chartHeight;
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let x = Math.ceil(minX); x <= maxX; x++) {
        const px = scaleX(x);
        ctx.fillText(x.toString(), px, height - padding + 20);
        
        ctx.beginPath();
        ctx.moveTo(px, height - padding);
        ctx.lineTo(px, height - padding + 5);
        ctx.stroke();
    }
    
    ctx.textAlign = 'right';
    for (let y = Math.ceil(minY); y <= maxY; y += 20) {
        const py = scaleY(y);
        ctx.fillText(y.toString(), padding - 10, py + 5);
        
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(padding - 5, py);
        ctx.stroke();
    }
    
    // Draw regression line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const y1 = a + b * minX;
    const y2 = a + b * maxX;
    
    ctx.moveTo(scaleX(minX), scaleY(y1));
    ctx.lineTo(scaleX(maxX), scaleY(y2));
    ctx.stroke();
    
    // Draw data points
    data.forEach(point => {
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(scaleX(point.x), scaleY(point.y), 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // Draw prediction point
    ctx.fillStyle = '#dc3545';
    ctx.beginPath();
    ctx.arc(scaleX(predictX), scaleY(predictY), 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw prediction label
    ctx.fillStyle = '#dc3545';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`(${predictX}, ${predictY.toFixed(2)})`, scaleX(predictX) + 10, scaleY(predictY) - 10);
    
    // Draw equation
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Ŷ = ${a.toFixed(2)} + ${b.toFixed(2)}X`, width / 2, 30);
}

// Draw legend
function drawLegend(ctx, width, height, showHeuristic = false) {
    const legendX = 10;
    const legendY = 10;
    
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    // Start node
    ctx.fillStyle = '#007bff';
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY + 10, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.fillText('Start', legendX + 25, legendY + 15);
    
    // Goal node
    ctx.fillStyle = '#28a745';
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY + 30, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.fillText('Goal', legendX + 25, legendY + 35);
    
    // Path node
    ctx.fillStyle = '#ffc107';
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY + 50, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.fillText('Path', legendX + 25, legendY + 55);
}
