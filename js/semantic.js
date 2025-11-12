// Semantic Network Implementation
function solveSemantic() {
    clearOutput('semantic');
    
    try {
        // Parse input
        const entitiesInput = document.getElementById('semantic-entities').value;
        const relationsInput = document.getElementById('semantic-relations').value;
        const query = document.getElementById('semantic-query').value.trim();
        
        // Parse entities
        const entities = entitiesInput.split(',').map(e => e.trim()).filter(e => e);
        
        // Parse relations
        const relations = [];
        const lines = relationsInput.split('\n').filter(line => line.trim());
        
        for (let line of lines) {
            const parts = line.split('-');
            if (parts.length === 3) {
                relations.push({
                    from: parts[0].trim(),
                    relation: parts[1].trim(),
                    to: parts[2].trim()
                });
            }
        }
        
        if (entities.length === 0) {
            throw new Error('Cần ít nhất 1 entity');
        }
        
        if (relations.length === 0) {
            throw new Error('Cần ít nhất 1 relation');
        }
        
        let stepCount = 0;
        addStep('semantic', ++stepCount, 
            `Xây dựng mạng ngữ nghĩa với ${entities.length} entities và ${relations.length} relations`
        );
        
        // Build knowledge base
        const knowledgeBase = {};
        
        entities.forEach(entity => {
            knowledgeBase[entity] = {
                directRelations: [],
                inheritedRelations: []
            };
        });
        
        // Add direct relations
        relations.forEach(rel => {
            if (knowledgeBase[rel.from]) {
                knowledgeBase[rel.from].directRelations.push({
                    relation: rel.relation,
                    target: rel.to
                });
            }
        });
        
        addStep('semantic', ++stepCount, 
            `Xây dựng knowledge base hoàn thành`
        );
        
        // Query the knowledge base
        if (!query) {
            throw new Error('Vui lòng nhập entity cần truy vấn');
        }
        
        if (!knowledgeBase[query]) {
            throw new Error(`Entity "${query}" không tồn tại trong knowledge base`);
        }
        
        addStep('semantic', ++stepCount, 
            `<strong>Truy vấn: Tìm tất cả thuộc tính của "${query}"</strong>`,
            'highlight'
        );
        
        // Perform inference using inheritance
        const allProperties = inferProperties(query, knowledgeBase, relations, stepCount);
        
        // Display results
        let resultHtml = `
            <div class="result-item">
                <strong>Entity truy vấn:</strong> ${query}
            </div>
            <div class="result-item">
                <strong>Số thuộc tính tìm thấy:</strong> ${allProperties.direct.length + allProperties.inherited.length}
            </div>
        `;
        
        // Direct properties
        if (allProperties.direct.length > 0) {
            resultHtml += '<h4>Thuộc tính trực tiếp:</h4>';
            resultHtml += '<table class="probability-table">';
            resultHtml += '<tr><th>Relation</th><th>Target</th></tr>';
            
            allProperties.direct.forEach(prop => {
                resultHtml += `<tr>
                    <td>${prop.relation}</td>
                    <td>${prop.target}</td>
                </tr>`;
            });
            
            resultHtml += '</table>';
        }
        
        // Inherited properties
        if (allProperties.inherited.length > 0) {
            resultHtml += '<h4>Thuộc tính kế thừa (qua is-a):</h4>';
            resultHtml += '<table class="probability-table">';
            resultHtml += '<tr><th>Relation</th><th>Target</th><th>Kế thừa từ</th></tr>';
            
            allProperties.inherited.forEach(prop => {
                resultHtml += `<tr>
                    <td>${prop.relation}</td>
                    <td>${prop.target}</td>
                    <td>${prop.inheritedFrom}</td>
                </tr>`;
            });
            
            resultHtml += '</table>';
        }
        
        // All relations summary
        resultHtml += '<h4>Tổng hợp tri thức:</h4>';
        resultHtml += '<div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">';
        
        const allRels = [...allProperties.direct, ...allProperties.inherited];
        const summary = {};
        
        allRels.forEach(prop => {
            if (!summary[prop.relation]) {
                summary[prop.relation] = [];
            }
            summary[prop.relation].push(prop.target);
        });
        
        for (let rel in summary) {
            resultHtml += `<div style="margin: 5px 0;"><strong>${query}</strong> <em>${rel}</em> <strong>${summary[rel].join(', ')}</strong></div>`;
        }
        
        resultHtml += '</div>';
        
        showResult('semantic', 'Truy vấn tri thức hoàn thành!', resultHtml);
        
        addStep('semantic', ++stepCount, 
            `✅ Tìm thấy ${allProperties.direct.length} thuộc tính trực tiếp và ${allProperties.inherited.length} thuộc tính kế thừa`,
            'success'
        );
        
        // Visualize
        visualizeSemanticNetwork('semantic-canvas', entities, relations, query);
        
    } catch (error) {
        showError('semantic', error.message);
    }
}

// Infer properties using inheritance
function inferProperties(entity, knowledgeBase, relations, stepCount) {
    const direct = knowledgeBase[entity].directRelations;
    const inherited = [];
    const visited = new Set();
    
    // Find parent entities (is-a relations)
    function findParents(currentEntity) {
        if (visited.has(currentEntity)) return;
        visited.add(currentEntity);
        
        const directRels = knowledgeBase[currentEntity]?.directRelations || [];
        
        for (let rel of directRels) {
            if (rel.relation === 'is-a' || rel.relation === 'is a') {
                const parent = rel.target;
                
                addStep('semantic', ++stepCount, 
                    `${currentEntity} kế thừa từ ${parent} (qua is-a)`
                );
                
                // Get properties from parent
                const parentRels = knowledgeBase[parent]?.directRelations || [];
                
                for (let parentRel of parentRels) {
                    // Don't inherit is-a relations
                    if (parentRel.relation !== 'is-a' && parentRel.relation !== 'is a') {
                        // Check if not already have this property
                        const alreadyHas = direct.some(d => 
                            d.relation === parentRel.relation && d.target === parentRel.target
                        );
                        
                        if (!alreadyHas) {
                            inherited.push({
                                relation: parentRel.relation,
                                target: parentRel.target,
                                inheritedFrom: parent
                            });
                            
                            addStep('semantic', ++stepCount, 
                                `  → Kế thừa: ${parentRel.relation} ${parentRel.target}`
                            );
                        }
                    }
                }
                
                // Recursively find grandparents
                findParents(parent);
            }
        }
    }
    
    addStep('semantic', ++stepCount, 
        `Tìm thuộc tính trực tiếp của ${entity}:`
    );
    
    direct.forEach(rel => {
        addStep('semantic', ++stepCount, 
            `  → ${rel.relation}: ${rel.target}`
        );
    });
    
    addStep('semantic', ++stepCount, 
        `Tìm thuộc tính kế thừa:`,
        'highlight'
    );
    
    findParents(entity);
    
    return { direct, inherited };
}

// Visualize semantic network
function visualizeSemanticNetwork(canvasId, entities, relations, highlightEntity) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Calculate positions (force-directed layout simplified)
    const positions = {};
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    entities.forEach((entity, i) => {
        const angle = (2 * Math.PI * i) / entities.length;
        positions[entity] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });
    
    // Draw relations (edges)
    ctx.font = '10px Arial';
    
    relations.forEach(rel => {
        const from = positions[rel.from];
        const to = positions[rel.to];
        
        if (!from || !to) return;
        
        const isHighlighted = rel.from === highlightEntity || rel.to === highlightEntity;
        
        // Draw arrow
        ctx.strokeStyle = isHighlighted ? '#e74c3c' : '#999';
        ctx.lineWidth = isHighlighted ? 3 : 1.5;
        
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const endX = to.x - 35 * Math.cos(angle);
        const endY = to.y - 35 * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw arrowhead
        const headlen = 10;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - headlen * Math.cos(angle - Math.PI / 6),
            endY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - headlen * Math.cos(angle + Math.PI / 6),
            endY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        
        // Draw relation label
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(midX - 25, midY - 8, 50, 16);
        
        ctx.fillStyle = isHighlighted ? '#e74c3c' : '#333';
        ctx.font = isHighlighted ? 'bold 10px Arial' : '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rel.relation, midX, midY);
    });
    
    // Draw entities (nodes)
    entities.forEach(entity => {
        const pos = positions[entity];
        const isHighlighted = entity === highlightEntity;
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
        
        if (isHighlighted) {
            ctx.fillStyle = '#e74c3c';
        } else {
            ctx.fillStyle = '#3498db';
        }
        
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = 'white';
        ctx.font = isHighlighted ? 'bold 11px Arial' : '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Wrap text if too long
        const maxWidth = 50;
        const words = entity.split(' ');
        
        if (words.length > 1) {
            ctx.fillText(words[0], pos.x, pos.y - 5);
            ctx.fillText(words.slice(1).join(' '), pos.x, pos.y + 5);
        } else {
            ctx.fillText(entity, pos.x, pos.y);
        }
    });
    
    // Draw legend
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Query: ${highlightEntity}`, 10, height - 10);
}
