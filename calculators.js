// ============================================
// EngineeringCalc - Calculator Logic
// Professional engineering calculations
// ============================================

// Material Database
const materials = [
    { id: 'steel-mild', name: 'Mild Steel', type: 'metal', density: 7850, youngsModulus: 200, yieldStrength: 250, ultimateStrength: 400, poissonRatio: 0.3 },
    { id: 'steel-stainless', name: 'Stainless Steel', type: 'metal', density: 8000, youngsModulus: 190, yieldStrength: 200, ultimateStrength: 540, poissonRatio: 0.3 },
    { id: 'aluminum-6061', name: 'Aluminum 6061-T6', type: 'metal', density: 2700, youngsModulus: 69, yieldStrength: 276, ultimateStrength: 310, poissonRatio: 0.33 },
    { id: 'aluminum-7075', name: 'Aluminum 7075-T6', type: 'metal', density: 2810, youngsModulus: 71.7, yieldStrength: 503, ultimateStrength: 572, poissonRatio: 0.33 },
    { id: 'titanium', name: 'Titanium Ti-6Al-4V', type: 'metal', density: 4430, youngsModulus: 116, yieldStrength: 880, ultimateStrength: 950, poissonRatio: 0.31 },
    { id: 'copper', name: 'Copper', type: 'metal', density: 8960, youngsModulus: 117, yieldStrength: 70, ultimateStrength: 220, poissonRatio: 0.34 },
    { id: 'brass', name: 'Brass', type: 'metal', density: 8530, youngsModulus: 100, yieldStrength: 95, ultimateStrength: 340, poissonRatio: 0.35 },
    { id: 'abs', name: 'ABS Plastic', type: 'plastic', density: 1050, youngsModulus: 2.3, yieldStrength: 30, ultimateStrength: 40, poissonRatio: 0.35 },
    { id: 'nylon', name: 'Nylon 6/6', type: 'plastic', density: 1140, youngsModulus: 2.8, yieldStrength: 60, ultimateStrength: 75, poissonRatio: 0.41 },
    { id: 'ptfe', name: 'PTFE (Teflon)', type: 'plastic', density: 2200, youngsModulus: 0.5, yieldStrength: 15, ultimateStrength: 25, poissonRatio: 0.46 },
    { id: 'polycarbonate', name: 'Polycarbonate', type: 'plastic', density: 1200, youngsModulus: 2.4, yieldStrength: 62, ultimateStrength: 70, poissonRatio: 0.37 },
    { id: 'carbon-fiber', name: 'Carbon Fiber (T300)', type: 'composite', density: 1600, youngsModulus: 140, yieldStrength: 1500, ultimateStrength: 1800, poissonRatio: 0.3 },
    { id: 'fiberglass', name: 'Fiberglass (E-Glass)', type: 'composite', density: 1850, youngsModulus: 72, yieldStrength: 200, ultimateStrength: 340, poissonRatio: 0.25 }
];

const unitConversions = {
    length: { m: 1, mm: 0.001, km: 1000, ft: 0.3048, in: 0.0254 },
    force: { N: 1, kN: 1000, lbf: 4.44822, kgf: 9.80665 },
    pressure: { Pa: 1, kPa: 1000, MPa: 1000000, GPa: 1000000000, psi: 6894.76, ksi: 6894760 },
    volume: { m3: 1, L: 0.001, mL: 0.000001, gal: 0.00378541, ft3: 0.0283168, in3: 0.000016387 },
    power: { W: 1, kW: 1000, MW: 1000000, hp: 745.7, 'hp-e': 746 }
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Material dropdown
    const materialSelect = document.getElementById('beam-material');
    if (materialSelect) {
        materialSelect.addEventListener('change', updateBeamInputs);
    }
    
    // Shape dropdown
    const shapeSelect = document.getElementById('beam-shape');
    if (shapeSelect) {
        shapeSelect.addEventListener('change', updateShapeInputs);
    }
    
    // Force type dropdown
    const forceTypeSelect = document.getElementById('force-type');
    if (forceTypeSelect) {
        forceTypeSelect.addEventListener('change', updateStressInputs);
    }
    
    // Render materials
    renderMaterials();
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
});

function updateBeamInputs() {
    const material = document.getElementById('beam-material').value;
    const customEGroup = document.getElementById('custom-e-group');
    if (customEGroup) {
        customEGroup.style.display = material === 'custom' ? 'block' : 'none';
    }
}

function updateShapeInputs() {
    const shape = document.getElementById('beam-shape').value;
    const rectangularDims = document.getElementById('rectangular-dims');
    const circularDims = document.getElementById('circular-dims');
    
    if (rectangularDims) rectangularDims.style.display = shape === 'rectangular' ? 'block' : 'none';
    if (circularDims) circularDims.style.display = shape === 'circular' ? 'block' : 'none';
}

function updateStressInputs() {
    const forceType = document.getElementById('force-type').value;
    const momentArmGroup = document.getElementById('moment-arm-group');
    const sectionModulusGroup = document.getElementById('section-modulus-group');
    const forceUnit = document.getElementById('stress-force-unit');
    const formulaDisplay = document.getElementById('stress-formula');
    const formulaDesc = document.querySelector('#stress .formula-desc');
    
    if (!forceUnit) return;
    
    forceUnit.innerHTML = '';
    if (forceType === 'axial') {
        forceUnit.innerHTML = '<option value="N">N</option><option value="kN">kN</option><option value="lbf">lbf</option>';
        if (momentArmGroup) momentArmGroup.style.display = 'none';
        if (sectionModulusGroup) sectionModulusGroup.style.display = 'none';
        if (formulaDisplay) formulaDisplay.textContent = 'σ = F / A';
        if (formulaDesc) formulaDesc.textContent = 'Normal stress for axial loading';
    } else if (forceType === 'bending') {
        forceUnit.innerHTML = '<option value="Nm">N·m</option><option value="Nmm">N·mm</option>';
        if (momentArmGroup) momentArmGroup.style.display = 'none';
        if (sectionModulusGroup) sectionModulusGroup.style.display = 'block';
        if (formulaDisplay) formulaDisplay.textContent = 'σ = M / Z';
        if (formulaDesc) formulaDesc.textContent = 'Bending stress using section modulus';
    } else if (forceType === 'torsion') {
        forceUnit.innerHTML = '<option value="Nm">N·m</option><option value="Nmm">N·mm</option>';
        if (momentArmGroup) momentArmGroup.style.display = 'block';
        if (sectionModulusGroup) sectionModulusGroup.style.display = 'none';
        if (formulaDisplay) formulaDisplay.textContent = 'τ = T·r / J';
        if (formulaDesc) formulaDesc.textContent = 'Shear stress in torsion (simplified)';
    }
}

function calculateBeam() {
    const length = parseFloat(document.getElementById('beam-length').value);
    const lengthUnit = document.getElementById('beam-length-unit').value;
    const load = parseFloat(document.getElementById('beam-load').value);
    const loadUnit = document.getElementById('beam-load-unit').value;
    const loadPosition = parseFloat(document.getElementById('load-position').value);
    const material = document.getElementById('beam-material').value;
    const shape = document.getElementById('beam-shape').value;
    
    if (!length || !load || !loadPosition) {
        alert('Please fill in all required fields');
        return;
    }
    
    const L = length * unitConversions.length[lengthUnit];
    const P = load * unitConversions.force[loadUnit];
    const a = loadPosition * unitConversions.length[lengthUnit];
    const b = L - a;
    
    let E;
    if (material === 'custom') {
        E = parseFloat(document.getElementById('custom-e').value) * 1e9;
    } else {
        const materialData = materials.find(m => m.id === material);
        E = (materialData ? materialData.youngsModulus : 200) * 1e9;
    }
    
    let I, y;
    if (shape === 'rectangular') {
        const width = parseFloat(document.getElementById('beam-width').value) / 1000;
        const height = parseFloat(document.getElementById('beam-height').value) / 1000;
        I = (width * Math.pow(height, 3)) / 12;
        y = height / 2;
    } else if (shape === 'circular') {
        const diameter = parseFloat(document.getElementById('beam-diameter').value) / 1000;
        const r = diameter / 2;
        I = (Math.PI * Math.pow(r, 4)) / 4;
        y = r;
    } else {
        I = 1e-6;
        y = 0.05;
    }
    
    const deflection = (P * Math.pow(a, 2) * Math.pow(b, 2)) / (3 * E * I * L);
    const M_max = (P * a * b) / L;
    const stress = (M_max * y) / I;
    const R_A = (P * b) / L;
    const R_B = (P * a) / L;
    
    document.getElementById('max-deflection').textContent = (deflection * 1000).toFixed(4);
    document.getElementById('max-stress').textContent = (stress / 1e6).toFixed(2);
    document.getElementById('reaction-a').textContent = R_A.toFixed(2);
    document.getElementById('reaction-b').textContent = R_B.toFixed(2);
}

function calculateStress() {
    const forceType = document.getElementById('force-type').value;
    const force = parseFloat(document.getElementById('stress-force').value);
    const area = parseFloat(document.getElementById('stress-area').value);
    const areaUnit = document.getElementById('stress-area-unit').value;
    const yieldStrength = parseFloat(document.getElementById('yield-strength').value);
    
    if (!force || (!area && forceType === 'axial') || !yieldStrength) {
        alert('Please fill in all required fields');
        return;
    }
    
    let stress;
    
    if (forceType === 'axial') {
        const forceUnit = document.getElementById('stress-force-unit').value;
        const F = force * unitConversions.force[forceUnit];
        let areaM2;
        switch(areaUnit) {
            case 'mm2': areaM2 = area * 1e-6; break;
            case 'm2': areaM2 = area; break;
            case 'cm2': areaM2 = area * 1e-4; break;
            case 'in2': areaM2 = area * 0.00064516; break;
        }
        stress = F / areaM2;
    } else if (forceType === 'bending') {
        const sectionModulus = parseFloat(document.getElementById('section-modulus').value);
        if (!sectionModulus) { alert('Please enter section modulus'); return; }
        const forceUnit = document.getElementById('stress-force-unit').value;
        const M = forceUnit === 'Nm' ? force : force * 0.001;
        const Z = sectionModulus * 1e-9;
        stress = M / Z;
    } else if (forceType === 'torsion') {
        const momentArm = parseFloat(document.getElementById('moment-arm').value);
        if (!momentArm || !area) { alert('Please enter moment arm and area'); return; }
        const forceUnit = document.getElementById('stress-force-unit').value;
        const T = forceUnit === 'Nm' ? force : force * 0.001;
        const areaM2 = area * 1e-6;
        const r = Math.sqrt(areaM2 / Math.PI);
        const J = (Math.PI * Math.pow(r, 4)) / 2;
        stress = (T * r) / J;
    }
    
    const FOS = yieldStrength / (stress / 1e6);
    const utilization = ((stress / 1e6) / yieldStrength) * 100;
    
    document.getElementById('calculated-stress').textContent = (stress / 1e6).toFixed(2);
    
    const fosElement = document.getElementById('factor-safety');
    const fosStatus = document.getElementById('safety-status');
    fosElement.textContent = FOS.toFixed(2);
    
    if (FOS >= 2) {
        fosStatus.textContent = 'Safe';
        fosStatus.className = 'result-status safe';
        fosElement.style.color = 'var(--success)';
    } else if (FOS >= 1.5) {
        fosStatus.textContent = 'Marginal';
        fosStatus.className = 'result-status warning';
        fosElement.style.color = 'var(--warning)';
    } else {
        fosStatus.textContent = 'Unsafe';
        fosStatus.className = 'result-status danger';
        fosElement.style.color = 'var(--error)';
    }
    
    document.getElementById('utilization').textContent = utilization.toFixed(1);
}

function convertUnits(type) {
    const input = parseFloat(document.getElementById(type + '-input').value);
    const fromUnit = document.getElementById(type + '-from').value;
    const toUnit = document.getElementById(type + '-to').value;
    
    if (!input) {
        document.getElementById(type + '-output').value = '';
        return;
    }
    
    let result;
    
    if (type === 'temp') {
        let celsius;
        if (fromUnit === 'C') celsius = input;
        else if (fromUnit === 'F') celsius = (input - 32) * 5/9;
        else if (fromUnit === 'K') celsius = input - 273.15;
        
        if (toUnit === 'C') result = celsius;
        else if (toUnit === 'F') result = (celsius * 9/5) + 32;
        else if (toUnit === 'K') result = celsius + 273.15;
    } else {
        const conversions = unitConversions[type];
        const baseValue = input * conversions[fromUnit];
        result = baseValue / conversions[toUnit];
    }
    
    document.getElementById(type + '-output').value = result.toFixed(6).replace(/\.?0+$/, '');
}

function renderMaterials(filter = 'all') {
    const grid = document.getElementById('materials-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const filteredMaterials = filter === 'all' ? materials : materials.filter(m => m.type === filter);
    
    filteredMaterials.forEach(material => {
        const card = document.createElement('div');
        card.className = 'material-card';
        card.innerHTML = `
            <div class="material-header">
                <span class="material-name">${material.name}</span>
                <span class="material-type">${material.type}</span>
            </div>
            <div class="material-props">
                <div class="material-prop">
                    <span class="prop-label">Density</span>
                    <span class="prop-value">${material.density.toLocaleString()} kg/m³</span>
                </div>
                <div class="material-prop">
                    <span class="prop-label">E-Modulus</span>
                    <span class="prop-value">${material.youngsModulus} GPa</span>
                </div>
                <div class="material-prop">
                    <span class="prop-label">Yield</span>
                    <span class="prop-value">${material.yieldStrength} MPa</span>
                </div>
                <div class="material-prop">
                    <span class="prop-label">Ultimate</span>
                    <span class="prop-value">${material.ultimateStrength} MPa</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter button functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        renderMaterials(e.target.dataset.filter);
    }
});

// Keyboard shortcuts
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeSection = document.querySelector('.calculator-section:hover');
        if (activeSection) {
            if (activeSection.id === 'beam') calculateBeam();
            else if (activeSection.id === 'stress') calculateStress();
        }
    }
});
