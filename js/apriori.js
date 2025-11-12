// Apriori Algorithm Implementation
function solveApriori() {
    clearOutput('apriori');
    
    try {
        // Parse input
        const dataInput = document.getElementById('apriori-data').value;
        const minSupport = parseFloat(document.getElementById('apriori-support').value) / 100;
        const minConfidence = parseFloat(document.getElementById('apriori-confidence').value) / 100;
        
        // Parse transactions
        const lines = dataInput.split('\n').filter(line => line.trim());
        const transactions = [];
        
        for (let line of lines) {
            const items = line.split(',').map(item => item.trim()).filter(item => item);
            if (items.length > 0) {
                transactions.push(items);
            }
        }
        
        if (transactions.length === 0) {
            throw new Error('Không có dữ liệu giao dịch');
        }
        
        let stepCount = 0;
        addStep('apriori', ++stepCount, 
            `Bắt đầu Apriori với ${transactions.length} transactions`
        );
        addStep('apriori', ++stepCount, 
            `Min Support = ${(minSupport * 100).toFixed(0)}%, Min Confidence = ${(minConfidence * 100).toFixed(0)}%`
        );
        
        // Find all unique items
        const allItems = new Set();
        transactions.forEach(transaction => {
            transaction.forEach(item => allItems.add(item));
        });
        
        addStep('apriori', ++stepCount, 
            `Tìm thấy ${allItems.size} items: ${Array.from(allItems).join(', ')}`
        );
        
        // Generate frequent itemsets
        let currentItemsets = Array.from(allItems).map(item => [item]);
        let allFrequentItemsets = [];
        let k = 1;
        
        while (currentItemsets.length > 0) {
            addStep('apriori', ++stepCount, 
                `<strong>Tìm frequent ${k}-itemsets</strong>`,
                'highlight'
            );
            
            // Calculate support for each itemset
            const itemsetSupport = [];
            
            for (let itemset of currentItemsets) {
                const support = calculateSupport(itemset, transactions);
                
                if (support >= minSupport) {
                    itemsetSupport.push({ itemset, support });
                    allFrequentItemsets.push({ itemset, support });
                    
                    addStep('apriori', ++stepCount, 
                        `{${itemset.join(', ')}} : support = ${(support * 100).toFixed(1)}% ✓`
                    );
                } else {
                    addStep('apriori', ++stepCount, 
                        `{${itemset.join(', ')}} : support = ${(support * 100).toFixed(1)}% ✗ (loại bỏ)`
                    );
                }
            }
            
            addStep('apriori', ++stepCount, 
                `Tìm thấy ${itemsetSupport.length} frequent ${k}-itemsets`
            );
            
            // Generate next level candidates
            if (itemsetSupport.length > 0) {
                currentItemsets = generateCandidates(itemsetSupport.map(is => is.itemset), k + 1);
                k++;
            } else {
                currentItemsets = [];
            }
        }
        
        addStep('apriori', ++stepCount, 
            `Tổng cộng ${allFrequentItemsets.length} frequent itemsets`,
            'success'
        );
        
        // Generate association rules
        addStep('apriori', ++stepCount, 
            `<strong>Tìm association rules</strong>`,
            'highlight'
        );
        
        const rules = [];
        
        for (let itemsetData of allFrequentItemsets) {
            const itemset = itemsetData.itemset;
            
            if (itemset.length < 2) continue;
            
            // Generate all possible rules from this itemset
            const subsets = generateSubsets(itemset);
            
            for (let antecedent of subsets) {
                if (antecedent.length === 0 || antecedent.length === itemset.length) continue;
                
                const consequent = itemset.filter(item => !antecedent.includes(item));
                
                const supportAntecedent = calculateSupport(antecedent, transactions);
                const supportItemset = itemsetData.support;
                const confidence = supportItemset / supportAntecedent;
                
                if (confidence >= minConfidence) {
                    const lift = confidence / calculateSupport(consequent, transactions);
                    
                    rules.push({
                        antecedent,
                        consequent,
                        support: supportItemset,
                        confidence,
                        lift
                    });
                    
                    addStep('apriori', ++stepCount, 
                        `{${antecedent.join(', ')}} → {${consequent.join(', ')}} : conf = ${(confidence * 100).toFixed(1)}%, lift = ${lift.toFixed(2)} ✓`
                    );
                }
            }
        }
        
        // Sort rules by confidence
        rules.sort((a, b) => b.confidence - a.confidence);
        
        // Display results
        let resultHtml = `
            <div class="result-item">
                <strong>Số giao dịch:</strong> ${transactions.length}
            </div>
            <div class="result-item">
                <strong>Số frequent itemsets:</strong> ${allFrequentItemsets.length}
            </div>
            <div class="result-item">
                <strong>Số association rules:</strong> ${rules.length}
            </div>
        `;
        
        // Frequent itemsets table
        resultHtml += '<h4>Frequent Itemsets:</h4>';
        resultHtml += '<table class="probability-table">';
        resultHtml += '<tr><th>Itemset</th><th>Support</th><th>Count</th></tr>';
        
        allFrequentItemsets.slice(0, 15).forEach(itemsetData => {
            const count = Math.round(itemsetData.support * transactions.length);
            resultHtml += `<tr>
                <td>{${itemsetData.itemset.join(', ')}}</td>
                <td>${(itemsetData.support * 100).toFixed(1)}%</td>
                <td>${count}/${transactions.length}</td>
            </tr>`;
        });
        
        if (allFrequentItemsets.length > 15) {
            resultHtml += `<tr><td colspan="3">... và ${allFrequentItemsets.length - 15} itemsets khác</td></tr>`;
        }
        
        resultHtml += '</table>';
        
        // Association rules table
        if (rules.length > 0) {
            resultHtml += '<h4>Association Rules:</h4>';
            resultHtml += '<table class="probability-table">';
            resultHtml += '<tr><th>Rule</th><th>Support</th><th>Confidence</th><th>Lift</th></tr>';
            
            rules.slice(0, 20).forEach(rule => {
                resultHtml += `<tr>
                    <td>{${rule.antecedent.join(', ')}} → {${rule.consequent.join(', ')}}</td>
                    <td>${(rule.support * 100).toFixed(1)}%</td>
                    <td>${(rule.confidence * 100).toFixed(1)}%</td>
                    <td>${rule.lift.toFixed(2)}</td>
                </tr>`;
            });
            
            if (rules.length > 20) {
                resultHtml += `<tr><td colspan="4">... và ${rules.length - 20} rules khác</td></tr>`;
            }
            
            resultHtml += '</table>';
        } else {
            resultHtml += '<div class="result-item" style="background: #fff3cd;">Không tìm thấy association rules thỏa mãn điều kiện</div>';
        }
        
        showResult('apriori', 'Apriori hoàn thành!', resultHtml);
        
        addStep('apriori', ++stepCount, 
            `✅ Tìm thấy ${rules.length} association rules`,
            'success'
        );
        
    } catch (error) {
        showError('apriori', error.message);
    }
}

// Calculate support for an itemset
function calculateSupport(itemset, transactions) {
    let count = 0;
    
    for (let transaction of transactions) {
        const hasAll = itemset.every(item => transaction.includes(item));
        if (hasAll) count++;
    }
    
    return count / transactions.length;
}

// Generate candidate itemsets of size k
function generateCandidates(itemsets, k) {
    const candidates = [];
    
    for (let i = 0; i < itemsets.length; i++) {
        for (let j = i + 1; j < itemsets.length; j++) {
            const itemset1 = itemsets[i];
            const itemset2 = itemsets[j];
            
            // Merge if first k-2 items are the same
            const merged = [...new Set([...itemset1, ...itemset2])];
            
            if (merged.length === k) {
                // Check if candidate already exists
                const exists = candidates.some(c => 
                    c.length === merged.length && c.every(item => merged.includes(item))
                );
                
                if (!exists) {
                    candidates.push(merged.sort());
                }
            }
        }
    }
    
    return candidates;
}

// Generate all subsets of an array
function generateSubsets(arr) {
    const subsets = [[]];
    
    for (let element of arr) {
        const length = subsets.length;
        for (let i = 0; i < length; i++) {
            subsets.push([...subsets[i], element]);
        }
    }
    
    return subsets;
}
