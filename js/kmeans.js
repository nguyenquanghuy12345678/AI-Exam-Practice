// K-Means Clustering Implementation
function solveKMeans() {
    clearOutput('kmeans');
    
    try {
        // Parse input
        const dataInput = document.getElementById('kmeans-data').value;
        const k = parseInt(document.getElementById('kmeans-k').value);
        const maxIterations = parseInt(document.getElementById('kmeans-iterations').value);
        
        // Parse data points
        const lines = dataInput.split('\n').filter(line => line.trim());
        const points = [];
        
        for (let line of lines) {
            const parts = line.split(',').map(p => parseFloat(p.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                points.push({ x: parts[0], y: parts[1] });
            }
        }
        
        if (points.length < k) {
            throw new Error(`Cần ít nhất ${k} điểm dữ liệu cho ${k} cụm`);
        }
        
        let stepCount = 0;
        addStep('kmeans', ++stepCount, 
            `Bắt đầu K-Means với ${points.length} điểm, K=${k}`
        );
        
        // Initialize centroids (randomly select k points)
        const centroids = [];
        const selectedIndices = new Set();
        
        while (centroids.length < k) {
            const idx = Math.floor(Math.random() * points.length);
            if (!selectedIndices.has(idx)) {
                selectedIndices.add(idx);
                centroids.push({ ...points[idx] });
            }
        }
        
        addStep('kmeans', ++stepCount, 
            `Khởi tạo ${k} centroids ngẫu nhiên: ${centroids.map((c, i) => `C${i+1}(${c.x.toFixed(1)}, ${c.y.toFixed(1)})`).join(', ')}`
        );
        
        let clusters = [];
        let iteration = 0;
        let converged = false;
        const history = [];
        
        while (iteration < maxIterations && !converged) {
            iteration++;
            addStep('kmeans', ++stepCount, 
                `<strong>Iteration ${iteration}</strong>`,
                'highlight'
            );
            
            // Assign points to nearest centroid
            clusters = Array(k).fill(null).map(() => []);
            
            points.forEach((point, idx) => {
                let minDist = Infinity;
                let nearestCluster = 0;
                
                centroids.forEach((centroid, cIdx) => {
                    const dist = Math.sqrt(
                        Math.pow(point.x - centroid.x, 2) + 
                        Math.pow(point.y - centroid.y, 2)
                    );
                    
                    if (dist < minDist) {
                        minDist = dist;
                        nearestCluster = cIdx;
                    }
                });
                
                clusters[nearestCluster].push(idx);
            });
            
            addStep('kmeans', ++stepCount, 
                `Gán điểm: ${clusters.map((c, i) => `Cluster ${i+1}: ${c.length} điểm`).join(', ')}`
            );
            
            // Calculate new centroids
            const newCentroids = [];
            let moved = false;
            
            clusters.forEach((cluster, cIdx) => {
                if (cluster.length === 0) {
                    // Keep old centroid if no points
                    newCentroids.push({ ...centroids[cIdx] });
                } else {
                    const sumX = cluster.reduce((sum, idx) => sum + points[idx].x, 0);
                    const sumY = cluster.reduce((sum, idx) => sum + points[idx].y, 0);
                    
                    const newCentroid = {
                        x: sumX / cluster.length,
                        y: sumY / cluster.length
                    };
                    
                    newCentroids.push(newCentroid);
                    
                    // Check if moved
                    const dist = Math.sqrt(
                        Math.pow(newCentroid.x - centroids[cIdx].x, 2) + 
                        Math.pow(newCentroid.y - centroids[cIdx].y, 2)
                    );
                    
                    if (dist > 0.001) {
                        moved = true;
                    }
                }
            });
            
            addStep('kmeans', ++stepCount, 
                `Cập nhật centroids: ${newCentroids.map((c, i) => `C${i+1}(${c.x.toFixed(2)}, ${c.y.toFixed(2)})`).join(', ')}`
            );
            
            // Save history for visualization
            history.push({
                centroids: [...newCentroids],
                clusters: clusters.map(c => [...c])
            });
            
            if (!moved) {
                converged = true;
                addStep('kmeans', ++stepCount, 
                    `✅ Hội tụ! Centroids không thay đổi`,
                    'success'
                );
            }
            
            centroids.splice(0, centroids.length, ...newCentroids);
        }
        
        // Calculate final statistics
        const clusterSizes = clusters.map(c => c.length);
        const wcss = clusters.reduce((sum, cluster, cIdx) => {
            return sum + cluster.reduce((clusterSum, idx) => {
                const point = points[idx];
                const centroid = centroids[cIdx];
                const dist = Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2);
                return clusterSum + dist;
            }, 0);
        }, 0);
        
        // Display result
        let resultHtml = `
            <div class="result-item">
                <strong>Số lần lặp:</strong> ${iteration}
            </div>
            <div class="result-item">
                <strong>Trạng thái:</strong> ${converged ? 'Hội tụ ✅' : 'Đạt max iterations'}
            </div>
            <div class="result-item">
                <strong>WCSS (Within-Cluster Sum of Squares):</strong> ${wcss.toFixed(2)}
            </div>
        `;
        
        resultHtml += '<h4>Kết quả phân cụm:</h4><table class="probability-table">';
        resultHtml += '<tr><th>Cluster</th><th>Centroid</th><th>Số điểm</th><th>Các điểm</th></tr>';
        
        clusters.forEach((cluster, idx) => {
            const centroid = centroids[idx];
            const pointList = cluster.map(i => `P${i+1}(${points[i].x},${points[i].y})`).join(', ');
            
            resultHtml += `<tr>
                <td>Cluster ${idx + 1}</td>
                <td>(${centroid.x.toFixed(2)}, ${centroid.y.toFixed(2)})</td>
                <td>${cluster.length}</td>
                <td style="font-size: 0.85em;">${pointList || 'Rỗng'}</td>
            </tr>`;
        });
        
        resultHtml += '</table>';
        
        showResult('kmeans', 'Phân cụm hoàn thành!', resultHtml);
        
        // Visualize
        visualizeKMeans('kmeans-canvas', points, centroids, clusters);
        
    } catch (error) {
        showError('kmeans', error.message);
    }
}

// Visualize K-Means clustering
function visualizeKMeans(canvasId, points, centroids, clusters) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Find data range
    const xValues = points.map(p => p.x);
    const yValues = points.map(p => p.y);
    
    const minX = Math.min(...xValues) - 1;
    const maxX = Math.max(...xValues) + 1;
    const minY = Math.min(...yValues) - 1;
    const maxY = Math.max(...yValues) + 1;
    
    const padding = 50;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Scale functions
    const scaleX = (x) => padding + ((x - minX) / (maxX - minX)) * chartWidth;
    const scaleY = (y) => height - padding - ((y - minY) / (maxY - minY)) * chartHeight;
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Colors for clusters
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    
    // Draw points
    clusters.forEach((cluster, cIdx) => {
        const color = colors[cIdx % colors.length];
        
        cluster.forEach(idx => {
            const point = points[idx];
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(scaleX(point.x), scaleY(point.y), 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    });
    
    // Draw centroids
    centroids.forEach((centroid, idx) => {
        const color = colors[idx % colors.length];
        const x = scaleX(centroid.x);
        const y = scaleY(centroid.y);
        
        // Draw large X
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 10, y - 10);
        ctx.lineTo(x - 10, y + 10);
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`C${idx + 1}`, x, y + 25);
    });
    
    // Draw legend
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    clusters.forEach((cluster, idx) => {
        const color = colors[idx % colors.length];
        const y = 20 + idx * 20;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(15, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#333';
        ctx.fillText(`Cluster ${idx + 1} (${cluster.length} điểm)`, 30, y + 5);
    });
}
