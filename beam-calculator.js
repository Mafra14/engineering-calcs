// Beam calculator logic - FIXED VERSION
let loadCount = 1;

// Material properties database
const materialProperties = {
    'steel-mild': { E: 200, yield: 250 },
    'steel-stainless': { E: 190, yield: 215 },
    'aluminum-6061': { E: 69, yield: 276 },
    'aluminum-7075': { E: 71.7, yield: 503 },
    'titanium': { E: 116, yield: 880 },
    'brass': { E: 100, yield: 95 }
};

function updateBeamConfiguration() {
    const beamType = document.getElementById('beam-type').value;
    console.log('Beam type changed to:', beamType);
}

function updateMaterial() {
    const material = document.getElementById('beam-material').value;
    const customEGroup = document.getElementById('custom-e-group');
    if (customEGroup) {
        customEGroup.style.display = material === 'custom' ? 'block' : 'none';
    }
}

function updateSectionInputs() {
    const sectionType = document.getElementById('section-type').value;
    
    // Hide all section inputs
    document.querySelectorAll('.section-inputs').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show selected
    const selectedInputs = document.getElementById(sectionType + '-inputs');
    if (selectedInputs) {
        selectedInputs.style.display = 'block';
    }
    
    // Update preview
    updateSectionPreview();
}

function updateSectionPreview() {
    const sectionType = document.getElementById('section-type').value;
    let I, Z, A;
    
    switch(sectionType) {
        case 'rectangular':
            const b = parseFloat(document.getElementById('rect-width')?.value) || 50;
            const h = parseFloat(document.getElementById('rect-height')?.value) || 100;
            I = (b * Math.pow(h, 3)) / 12;
            Z = (b * Math.pow(h, 2)) / 6;
            A = b * h;
            break;
        case 'circular':
            const d = parseFloat(document.getElementById('circle-diameter')?.value) || 50;
            I = (Math.PI * Math.pow(d, 4)) / 64;
            Z = (Math.PI * Math.pow(d, 3)) / 32;
            A = (Math.PI * Math.pow(d, 2)) / 4;
            break;
        case 'hollow-circle':
            const D = parseFloat(document.getElementById('hollow-outer')?.value) || 60;
            const di = parseFloat(document.getElementById('hollow-inner')?.value) || 40;
            I = (Math.PI * (Math.pow(D, 4) - Math.pow(di, 4))) / 64;
            Z = (Math.PI * (Math.pow(D, 4) - Math.pow(di, 4))) / (32 * D);
            A = (Math.PI * (Math.pow(D, 2) - Math.pow(di, 2))) / 4;
            break;
        default:
            I = 4166667;
            Z = 83333;
            A = 5000;
    }
    
    document.getElementById('preview-i').textContent = I.toExponential(2) + ' mm⁴';
    document.getElementById('preview-z').textContent = Z.toFixed(2) + ' mm³';
    document.getElementById('preview-a').textContent = A.toFixed(2) + ' mm²';
}

function updateLoadInputs(loadId) {
    // Update load inputs based on type
}

function addLoad() {
    loadCount++;
    const container = document.getElementById('loads-container');
    
    const loadHTML = `
        <div class="load-item" data-load-id="${loadCount}">
            <div class="load-header">
                <span class="load-number">Load ${loadCount}</span>
                <button class="load-remove" onclick="removeLoad(${loadCount})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="input-group">
                <label>Load Type</label>
                <select class="load-type full-width" onchange="updateLoadInputs(${loadCount})">
                    <option value="point">Point Load</option>
                    <option value="udl">Uniformly Distributed</option>
                    <option value="moment">Applied Moment</option>
                </select>
            </div>
            <div class="load-inputs" id="load-inputs-${loadCount}">
                <div class="input-row">
                    <div class="input-group">
                        <label>Magnitude (P)</label>
                        <div class="input-wrapper">
                            <input type="number" class="load-magnitude" placeholder="1000" step="0.1" value="1000">
                            <select class="load-magnitude-unit">
                                <option value="N">N</option>
                                <option value="kN">kN</option>
                                <option value="lbf">lbf</option>
                            </select>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Position (a)</label>
                        <div class="input-wrapper">
                            <input type="number" class="load-position" placeholder="1.0" step="0.01" value="1.0">
                            <span class="unit-label">m</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', loadHTML);
}

function removeLoad(loadId) {
    const loadEl = document.querySelector(`[data-load-id="${loadId}"]`);
    if (loadEl && loadCount > 1) {
        loadEl.remove();
        loadCount--;
        // Renumber remaining loads
        document.querySelectorAll('.load-item').forEach((el, idx) => {
            el.querySelector('.load-number').textContent = `Load ${idx + 1}`;
        });
    }
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById('tab-' + tabName).classList.add('active');
    event.target.classList.add('active');
}

function calculateBeam() {
    console.log('Calculating beam...');
    
    // Get inputs
    const length = parseFloat(document.getElementById('beam-length').value) || 2;
    const lengthUnit = document.getElementById('beam-length-unit').value;
    const beamType = document.getElementById('beam-type').value;
    const material = document.getElementById('beam-material').value;
    const sectionType = document.getElementById('section-type').value;
    
    // Convert length to meters
    let L = length;
    if (lengthUnit === 'mm') L = length / 1000;
    else if (lengthUnit === 'ft') L = length * 0.3048;
    else if (lengthUnit === 'in') L = length * 0.0254;
    
    // Get material properties
    let E;
    if (material === 'custom') {
        E = parseFloat(document.getElementById('custom-e').value) || 200;
    } else {
        E = materialProperties[material]?.E || 200;
    }
    E = E * 1e9; // Convert GPa to Pa
    
    // Get section properties
    let I, Z, A;
    switch(sectionType) {
        case 'rectangular':
            const b = (parseFloat(document.getElementById('rect-width')?.value) || 50) / 1000;
            const h = (parseFloat(document.getElementById('rect-height')?.value) || 100) / 1000;
            I = (b * Math.pow(h, 3)) / 12;
            Z = (b * Math.pow(h, 2)) / 6;
            A = b * h;
            break;
        case 'circular':
            const d = (parseFloat(document.getElementById('circle-diameter')?.value) || 50) / 1000;
            I = (Math.PI * Math.pow(d, 4)) / 64;
            Z = (Math.PI * Math.pow(d, 3)) / 32;
            A = (Math.PI * Math.pow(d, 2)) / 4;
            break;
        case 'hollow-circle':
            const D = (parseFloat(document.getElementById('hollow-outer')?.value) || 60) / 1000;
            const di = (parseFloat(document.getElementById('hollow-inner')?.value) || 40) / 1000;
            I = (Math.PI * (Math.pow(D, 4) - Math.pow(di, 4))) / 64;
            Z = (Math.PI * (Math.PI * (Math.pow(D, 4) - Math.pow(di, 4)))) / (32 * D);
            A = (Math.PI * (Math.pow(D, 2) - Math.pow(di, 2))) / 4;
            break;
        default:
            I = 4.17e-6;
            Z = 8.33e-5;
            A = 5e-3;
    }
    
    // Get load
    const loadMagnitude = parseFloat(document.querySelector('.load-magnitude')?.value) || 1000;
    const loadUnit = document.querySelector('.load-magnitude-unit')?.value || 'N';
    const loadPosition = parseFloat(document.querySelector('.load-position')?.value) || (L / 2);
    
    // Convert load to Newtons
    let P = loadMagnitude;
    if (loadUnit === 'kN') P = loadMagnitude * 1000;
    else if (loadUnit === 'lbf') P = loadMagnitude * 4.44822;
    
    // Calculate based on beam type
    let maxDeflection, maxSlope, maxMoment, reactionA, reactionB, momentA, momentB, maxStress;
    
    if (beamType === 'simply-supported') {
        const a = loadPosition;
        const b = L - a;
        
        // Reactions
        reactionA = (P * b) / L;
        reactionB = (P * a) / L;
        momentA = 0;
        momentB = 0;
        
        // Maximum moment
        maxMoment = (P * a * b) / L;
        
        // Maximum deflection (at load point for point load)
        maxDeflection = (P * Math.pow(a, 2) * Math.pow(b, 2)) / (3 * E * I * L);
        
        // Maximum slope
        maxSlope = (P * b * (Math.pow(L, 2) - Math.pow(b, 2))) / (6 * E * I * L);
        
    } else if (beamType === 'cantilever') {
        const a = loadPosition;
        
        // Reactions
        reactionA = P;
        reactionB = 0;
        momentA = -P * a;
        momentB = 0;
        
        // Maximum moment
        maxMoment = P * a;
        
        // Maximum deflection
        maxDeflection = (P * Math.pow(a, 3)) / (3 * E * I);
        
        // Maximum slope
        maxSlope = (P * Math.pow(a, 2)) / (2 * E * I);
        
    } else {
        // Default to simply supported
        reactionA = P / 2;
        reactionB = P / 2;
        momentA = 0;
        momentB = 0;
        maxMoment = (P * L) / 4;
        maxDeflection = (P * Math.pow(L, 3)) / (48 * E * I);
        maxSlope = (P * Math.pow(L, 2)) / (16 * E * I);
    }
    
    // Calculate stress
    maxStress = (maxMoment / Z) / 1e6; // Convert to MPa
    
    // Factor of safety
    const yieldStrength = materialProperties[material]?.yield || 250;
    const fos = yieldStrength / maxStress;
    
    // Update results
    document.getElementById('max-deflection').textContent = (maxDeflection * 1000).toFixed(3);
    document.getElementById('deflection-location').textContent = `at x = ${loadPosition.toFixed(2)} m`;
    document.getElementById('max-slope').textContent = maxSlope.toFixed(6);
    document.getElementById('max-bending-stress').textContent = maxStress.toFixed(2);
    document.getElementById('reaction-a').textContent = reactionA.toFixed(2);
    document.getElementById('reaction-b').textContent = reactionB.toFixed(2);
    document.getElementById('moment-a').textContent = momentA.toFixed(2);
    document.getElementById('moment-b').textContent = momentB.toFixed(2);
    document.getElementById('max-moment').textContent = maxMoment.toFixed(2);
    document.getElementById('moment-location').textContent = `at x = ${loadPosition.toFixed(2)} m`;
    document.getElementById('factor-safety').textContent = fos.toFixed(2);
    
    // Update safety status
    const statusEl = document.getElementById('safety-status');
    if (fos >= 2) {
        statusEl.textContent = 'Safe';
        statusEl.className = 'result-status safe';
    } else if (fos >= 1.5) {
        statusEl.textContent = 'Caution';
        statusEl.className = 'result-status warning';
    } else {
        statusEl.textContent = 'Unsafe';
        statusEl.className = 'result-status danger';
    }
    
    // Update section properties display
    document.getElementById('result-i').textContent = I.toExponential(2);
    document.getElementById('result-z').textContent = Z.toExponential(2);
    document.getElementById('result-e').textContent = (E / 1e9).toFixed(1);
    
    // Update formula
    const formulaEl = document.getElementById('formula-specific');
    const formulaDescEl = document.getElementById('formula-desc');
    
    if (beamType === 'simply-supported') {
        formulaEl.textContent = 'δ = (P·a²·b²) / (3·E·I·L)';
        formulaDescEl.textContent = 'Simply supported beam with point load at distance a from support A';
    } else if (beamType === 'cantilever') {
        formulaEl.textContent = 'δ = (P·a³) / (3·E·I)';
        formulaDescEl.textContent = 'Cantilever beam with point load at free end';
    }
    
    // Draw diagrams
    drawBeamDiagram();
    drawShearDiagram();
    drawMomentDiagram();
    drawDeflectionDiagram();
    
    console.log('Calculation complete!');
}

function drawBeamDiagram() {
    const canvas = document.getElementById('beam-diagram');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple beam representation
    ctx.strokeStyle = '#3d7bc9';
    ctx.lineWidth = 3;
    
    // Beam line
    ctx.beginPath();
    ctx.moveTo(50, 100);
    ctx.lineTo(650, 100);
    ctx.stroke();
    
    // Supports
    ctx.fillStyle = '#334155';
    // Support A (triangle)
    ctx.beginPath();
    ctx.moveTo(50, 100);
    ctx.lineTo(40, 130);
    ctx.lineTo(60, 130);
    ctx.closePath();
    ctx.fill();
    
    // Support B (triangle)
    ctx.beginPath();
    ctx.moveTo(650, 100);
    ctx.lineTo(640, 130);
    ctx.lineTo(660, 130);
    ctx.closePath();
    ctx.fill();
    
    // Load arrow
    ctx.strokeStyle = '#f43f5e';
    ctx.fillStyle = '#f43f5e';
    const loadX = 350;
    ctx.beginPath();
    ctx.moveTo(loadX, 60);
    ctx.lineTo(loadX, 100);
    ctx.stroke();
    
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(loadX - 5, 65);
    ctx.lineTo(loadX, 60);
    ctx.lineTo(loadX + 5, 65);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#334155';
    ctx.font = '14px Inter';
    ctx.fillText('A', 45, 150);
    ctx.fillText('B', 645, 150);
    ctx.fillText('P', loadX - 5, 50);
}

function drawShearDiagram() {
    const canvas = document.getElementById('shear-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 125);
    ctx.lineTo(650, 125);
    ctx.stroke();
    
    // Draw shear diagram (simplified)
    ctx.strokeStyle = '#3d7bc9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(350, 50);
    ctx.lineTo(350, 200);
    ctx.lineTo(650, 200);
    ctx.stroke();
}

function drawMomentDiagram() {
    const canvas = document.getElementById('moment-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 200);
    ctx.lineTo(650, 200);
    ctx.stroke();
    
    // Draw moment diagram (triangular)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 200);
    ctx.quadraticCurveTo(350, 20, 650, 200);
    ctx.stroke();
}

function drawDeflectionDiagram() {
    const canvas = document.getElementById('deflection-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw original beam
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(650, 50);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw deflected shape
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.quadraticCurveTo(350, 180, 650, 50);
    ctx.stroke();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Beam calculator initialized');
    updateMaterial();
    updateSectionInputs();
    
    // Add event listeners for real-time preview updates
    document.getElementById('rect-width')?.addEventListener('input', updateSectionPreview);
    document.getElementById('rect-height')?.addEventListener('input', updateSectionPreview);
    document.getElementById('circle-diameter')?.addEventListener('input', updateSectionPreview);
    document.getElementById('hollow-outer')?.addEventListener('input', updateSectionPreview);
    document.getElementById('hollow-inner')?.addEventListener('input', updateSectionPreview);
});
