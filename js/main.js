// Main JavaScript - Algorithm Switcher
function switchAlgorithm() {
    const selected = document.getElementById('algorithm').value;
    const panels = document.querySelectorAll('.algorithm-panel');
    
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    document.getElementById(selected + '-panel').classList.add('active');
}

// Helper function to parse input data
function parseNodes(input) {
    return input.split(',').map(n => n.trim()).filter(n => n);
}

function parseEdges(input) {
    const edges = [];
    const lines = input.split('\n').filter(line => line.trim());
    
    for (let line of lines) {
        const parts = line.split('-');
        if (parts.length === 3) {
            edges.push({
                from: parts[0].trim(),
                to: parts[1].trim(),
                cost: parseFloat(parts[2].trim())
            });
        }
    }
    return edges;
}

function parseHeuristic(input) {
    const heuristic = {};
    const lines = input.split('\n').filter(line => line.trim());
    
    for (let line of lines) {
        const parts = line.split('=');
        if (parts.length === 2) {
            heuristic[parts[0].trim()] = parseFloat(parts[1].trim());
        }
    }
    return heuristic;
}

// Build graph adjacency list
function buildGraph(nodes, edges) {
    const graph = {};
    
    nodes.forEach(node => {
        graph[node] = [];
    });
    
    edges.forEach(edge => {
        graph[edge.from].push({ node: edge.to, cost: edge.cost });
        // Uncomment for bidirectional graph
        // graph[edge.to].push({ node: edge.from, cost: edge.cost });
    });
    
    return graph;
}

// Format output
function formatPath(path) {
    return path.join(' → ');
}

function formatCost(cost) {
    return cost.toFixed(2);
}

// Clear output
function clearOutput(prefix) {
    document.getElementById(prefix + '-output').innerHTML = '';
    document.getElementById(prefix + '-steps').innerHTML = '';
}

// Display error
function showError(prefix, message) {
    const output = document.getElementById(prefix + '-output');
    output.className = 'result-box error';
    output.innerHTML = `
        <h4>❌ Lỗi</h4>
        <p>${message}</p>
    `;
}

// Display success result
function showResult(prefix, title, data) {
    const output = document.getElementById(prefix + '-output');
    output.className = 'result-box';
    output.innerHTML = `<h4>✅ ${title}</h4>` + data;
}

// Add step to visualization
function addStep(prefix, stepNumber, content, className = '') {
    const stepsBox = document.getElementById(prefix + '-steps');
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step ' + className;
    stepDiv.innerHTML = `<span class="step-number">${stepNumber}</span>${content}`;
    stepsBox.appendChild(stepDiv);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Algorithm Solver initialized');
});
