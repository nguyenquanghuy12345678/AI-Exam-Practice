// Naïve Bayes Classifier Implementation
function solveNaiveBayes() {
    clearOutput('naivebayes');
    
    try {
        // Parse input
        const dataInput = document.getElementById('naivebayes-data').value;
        const predictInput = document.getElementById('naivebayes-predict').value;
        
        // Parse CSV data
        const lines = dataInput.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('Dữ liệu không đủ (cần ít nhất header và 1 dòng dữ liệu)');
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        const classLabel = headers[headers.length - 1]; // Last column is class
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
        addStep('naivebayes', ++stepCount, 
            `Dữ liệu huấn luyện: ${data.length} mẫu, ${features.length} đặc trưng`
        );
        addStep('naivebayes', ++stepCount, 
            `Đặc trưng: ${features.join(', ')}<br>Nhãn lớp: ${classLabel}`
        );
        
        // Calculate class probabilities
        const classCounts = {};
        data.forEach(row => {
            const cls = row[classLabel];
            classCounts[cls] = (classCounts[cls] || 0) + 1;
        });
        
        const classes = Object.keys(classCounts);
        const totalSamples = data.length;
        
        addStep('naivebayes', ++stepCount, 
            `Tính xác suất tiên nghiệm P(Class):`,
            'highlight'
        );
        
        const classProbabilities = {};
        let probHtml = '<table class="probability-table"><tr><th>Class</th><th>Count</th><th>P(Class)</th></tr>';
        
        for (let cls of classes) {
            classProbabilities[cls] = classCounts[cls] / totalSamples;
            probHtml += `<tr><td>${cls}</td><td>${classCounts[cls]}</td><td>${classProbabilities[cls].toFixed(4)} = ${classCounts[cls]}/${totalSamples}</td></tr>`;
            addStep('naivebayes', ++stepCount, 
                `P(${cls}) = ${classCounts[cls]}/${totalSamples} = ${classProbabilities[cls].toFixed(4)}`
            );
        }
        probHtml += '</table>';
        
        // Calculate conditional probabilities P(feature|class)
        addStep('naivebayes', ++stepCount, 
            `Tính xác suất có điều kiện P(Feature|Class):`,
            'highlight'
        );
        
        const conditionalProb = {};
        
        for (let feature of features) {
            conditionalProb[feature] = {};
            
            for (let cls of classes) {
                conditionalProb[feature][cls] = {};
                const classData = data.filter(row => row[classLabel] === cls);
                
                // Count occurrences of each value
                const valueCounts = {};
                classData.forEach(row => {
                    const value = row[feature];
                    valueCounts[value] = (valueCounts[value] || 0) + 1;
                });
                
                // Calculate probabilities
                for (let value in valueCounts) {
                    conditionalProb[feature][cls][value] = valueCounts[value] / classData.length;
                }
            }
        }
        
        // Display conditional probabilities
        let condProbHtml = '';
        for (let feature of features) {
            condProbHtml += `<h4>Feature: ${feature}</h4><table class="probability-table">`;
            condProbHtml += '<tr><th>Value</th>';
            for (let cls of classes) {
                condProbHtml += `<th>P(${feature}|${cls})</th>`;
            }
            condProbHtml += '</tr>';
            
            const allValues = new Set();
            for (let cls of classes) {
                Object.keys(conditionalProb[feature][cls]).forEach(v => allValues.add(v));
            }
            
            for (let value of allValues) {
                condProbHtml += `<tr><td>${value}</td>`;
                for (let cls of classes) {
                    const prob = conditionalProb[feature][cls][value] || 0;
                    condProbHtml += `<td>${prob.toFixed(4)}</td>`;
                }
                condProbHtml += '</tr>';
            }
            condProbHtml += '</table>';
        }
        
        // Make prediction
        addStep('naivebayes', ++stepCount, 
            `Dự đoán cho: ${JSON.stringify(predictData)}`,
            'highlight'
        );
        
        const predictions = {};
        
        for (let cls of classes) {
            let prob = classProbabilities[cls];
            let formula = `P(${cls}|X) ∝ P(${cls})`;
            
            addStep('naivebayes', ++stepCount, 
                `Tính cho class <strong>${cls}</strong>:`
            );
            addStep('naivebayes', ++stepCount, 
                `P(${cls}) = ${classProbabilities[cls].toFixed(4)}`
            );
            
            for (let feature in predictData) {
                const value = predictData[feature];
                const condProb = conditionalProb[feature][cls][value] || 0.0001; // Laplace smoothing
                prob *= condProb;
                formula += ` × P(${feature}=${value}|${cls})`;
                
                addStep('naivebayes', ++stepCount, 
                    `P(${feature}=${value}|${cls}) = ${condProb.toFixed(4)}`
                );
            }
            
            predictions[cls] = prob;
            addStep('naivebayes', ++stepCount, 
                `<div class="formula">${formula} = ${prob.toExponential(4)}</div>`
            );
        }
        
        // Find max probability
        let maxProb = -1;
        let predictedClass = null;
        
        for (let cls in predictions) {
            if (predictions[cls] > maxProb) {
                maxProb = predictions[cls];
                predictedClass = cls;
            }
        }
        
        // Normalize probabilities for display
        const totalProb = Object.values(predictions).reduce((a, b) => a + b, 0);
        const normalizedProb = {};
        for (let cls in predictions) {
            normalizedProb[cls] = predictions[cls] / totalProb;
        }
        
        // Display result
        let resultHtml = probHtml + condProbHtml;
        resultHtml += '<h4>Kết quả dự đoán:</h4>';
        resultHtml += '<table class="probability-table"><tr><th>Class</th><th>Xác suất (normalized)</th></tr>';
        
        for (let cls of classes) {
            const highlight = cls === predictedClass ? 'style="background: #d4edda; font-weight: bold;"' : '';
            resultHtml += `<tr ${highlight}><td>${cls}</td><td>${(normalizedProb[cls] * 100).toFixed(2)}%</td></tr>`;
        }
        resultHtml += '</table>';
        
        resultHtml += `
            <div class="result-item" style="margin-top: 20px; background: #d4edda;">
                <strong>Kết luận:</strong> Dự đoán class = <strong>${predictedClass}</strong> (${(normalizedProb[predictedClass] * 100).toFixed(2)}%)
            </div>
        `;
        
        showResult('naivebayes', 'Phân loại thành công!', resultHtml);
        
        addStep('naivebayes', ++stepCount, 
            `🎯 Kết quả: Dự đoán class = <strong>${predictedClass}</strong>`,
            'success'
        );
        
    } catch (error) {
        showError('naivebayes', error.message);
    }
}
