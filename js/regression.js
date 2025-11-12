// Linear Regression Implementation
function solveRegression() {
    clearOutput('regression');
    
    try {
        // Parse input
        const dataInput = document.getElementById('regression-data').value;
        const predictX = parseFloat(document.getElementById('regression-predict').value);
        
        // Parse data points
        const lines = dataInput.split('\n').filter(line => line.trim());
        const data = [];
        
        for (let line of lines) {
            const parts = line.split(',').map(p => parseFloat(p.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                data.push({ x: parts[0], y: parts[1] });
            }
        }
        
        if (data.length < 2) {
            throw new Error('Cần ít nhất 2 điểm dữ liệu');
        }
        
        let stepCount = 0;
        addStep('regression', ++stepCount, 
            `Dữ liệu: ${data.length} điểm (x, y)`
        );
        
        // Calculate means
        const n = data.length;
        const sumX = data.reduce((sum, point) => sum + point.x, 0);
        const sumY = data.reduce((sum, point) => sum + point.y, 0);
        const meanX = sumX / n;
        const meanY = sumY / n;
        
        addStep('regression', ++stepCount, 
            `Tính trung bình:<br>x̄ = ${sumX}/${n} = ${meanX.toFixed(2)}<br>ȳ = ${sumY}/${n} = ${meanY.toFixed(2)}`
        );
        
        // Calculate slope (b) and intercept (a)
        // b = Σ[(xi - x̄)(yi - ȳ)] / Σ[(xi - x̄)²]
        let numerator = 0;
        let denominator = 0;
        
        addStep('regression', ++stepCount, 
            `Tính hệ số b (slope):`,
            'highlight'
        );
        
        let calcTable = '<table class="probability-table">';
        calcTable += '<tr><th>x</th><th>y</th><th>(x - x̄)</th><th>(y - ȳ)</th><th>(x - x̄)(y - ȳ)</th><th>(x - x̄)²</th></tr>';
        
        for (let point of data) {
            const xDiff = point.x - meanX;
            const yDiff = point.y - meanY;
            const product = xDiff * yDiff;
            const xDiffSq = xDiff * xDiff;
            
            numerator += product;
            denominator += xDiffSq;
            
            calcTable += `<tr>
                <td>${point.x}</td>
                <td>${point.y}</td>
                <td>${xDiff.toFixed(2)}</td>
                <td>${yDiff.toFixed(2)}</td>
                <td>${product.toFixed(2)}</td>
                <td>${xDiffSq.toFixed(2)}</td>
            </tr>`;
        }
        
        calcTable += `<tr style="font-weight: bold; background: #f0f4ff;">
            <td colspan="4">Tổng:</td>
            <td>${numerator.toFixed(2)}</td>
            <td>${denominator.toFixed(2)}</td>
        </tr>`;
        calcTable += '</table>';
        
        const b = numerator / denominator;
        const a = meanY - b * meanX;
        
        addStep('regression', ++stepCount, 
            `<div class="formula">b = Σ[(x - x̄)(y - ȳ)] / Σ[(x - x̄)²] = ${numerator.toFixed(2)} / ${denominator.toFixed(2)} = ${b.toFixed(4)}</div>`
        );
        
        addStep('regression', ++stepCount, 
            `Tính hệ số a (intercept):`,
            'highlight'
        );
        
        addStep('regression', ++stepCount, 
            `<div class="formula">a = ȳ - b × x̄ = ${meanY.toFixed(2)} - ${b.toFixed(4)} × ${meanX.toFixed(2)} = ${a.toFixed(4)}</div>`
        );
        
        // Regression equation
        addStep('regression', ++stepCount, 
            `<div class="formula">Phương trình hồi quy: Ŷ = ${a.toFixed(2)} + ${b.toFixed(2)}X</div>`,
            'success'
        );
        
        // Make prediction
        const predictedY = a + b * predictX;
        
        addStep('regression', ++stepCount, 
            `Dự đoán cho x = ${predictX}:`,
            'highlight'
        );
        
        addStep('regression', ++stepCount, 
            `<div class="formula">Ŷ = ${a.toFixed(2)} + ${b.toFixed(2)} × ${predictX} = ${predictedY.toFixed(2)}</div>`,
            'success'
        );
        
        // Calculate R²
        const yPredicted = data.map(point => a + b * point.x);
        const ssRes = data.reduce((sum, point, i) => {
            return sum + Math.pow(point.y - yPredicted[i], 2);
        }, 0);
        const ssTot = data.reduce((sum, point) => {
            return sum + Math.pow(point.y - meanY, 2);
        }, 0);
        const rSquared = 1 - (ssRes / ssTot);
        
        addStep('regression', ++stepCount, 
            `Hệ số xác định R² = ${rSquared.toFixed(4)} (${(rSquared * 100).toFixed(2)}%)`
        );
        
        // Display result
        const resultHtml = calcTable + `
            <div class="result-item">
                <strong>Phương trình hồi quy:</strong> 
                <div class="formula" style="font-size: 1.2em; margin: 10px 0;">Ŷ = ${a.toFixed(2)} + ${b.toFixed(2)}X</div>
            </div>
            <div class="result-item">
                <strong>Hệ số góc (b):</strong> ${b.toFixed(4)}
            </div>
            <div class="result-item">
                <strong>Hệ số chặn (a):</strong> ${a.toFixed(4)}
            </div>
            <div class="result-item">
                <strong>R² (độ phù hợp):</strong> ${rSquared.toFixed(4)} (${(rSquared * 100).toFixed(2)}%)
            </div>
            <div class="result-item" style="background: #d4edda;">
                <strong>Dự đoán cho x = ${predictX}:</strong> Ŷ = ${predictedY.toFixed(2)}
            </div>
        `;
        
        showResult('regression', 'Hồi quy tuyến tính hoàn thành!', resultHtml);
        
        // Visualize
        visualizeRegression('regression-canvas', data, a, b, predictX, predictedY);
        
    } catch (error) {
        showError('regression', error.message);
    }
}
