// Beam calculator logic
let loadCount = 1;

function updateBeamConfiguration() {
    // Update UI based on beam type
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
}

function updateLoadInputs(loadId) {
    const loadType = document.querySelector(`[data-load-id="${loadId}"] .load-type`).value;
    const inputsContainer = document.getElementById(`load-inputs-${loadId}`);
    
    // Update inputs based on load type
    // Simplified - full implementation would show different fields
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
                <select class="load-type full-width">
                    <option value="point">Point Load</option>
                    <option value="udl">Uniformly Distributed</option>
                    <option value="moment">Applied Moment</option>
                </select>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', loadHTML);
}

function removeLoad(loadId) {
    const loadEl = document.querySelector(`[data-load-id="${loadId}"]`);
    if (loadEl && loadCount > 1) {
        loadEl.remove();
        // Renumber remaining loads
    }
}

function calculateBeam() {
    // Simplified calculation for demo
    // Full implementation would handle all beam types and load combinations
    
    const length = parseFloat(document.getElementById('beam-length').value) || 2;
    const load = 1000;
    
    // Mock results
    document.getElementById('max-deflection').textContent = '1.25';
    document.getElementById('deflection-location').textContent = 'at x = ' + (length/2).toFixed(2) + ' m';
    document.getElementById('max-slope').textContent = '0.003';
    document.getElementById('max-bending-stress').textContent = '125.5';
    document.getElementById('reaction-a').textContent = '500';
    document.getElementById('reaction-b').textContent = '500';
    document.getElementById('moment-a').textContent = '0';
    document.getElementById('moment-b').textContent = '0';
    document.getElementById('max-moment').textContent = '500';
    document.getElementById('moment-location').textContent = 'at x = ' + (length/2).toFixed(2) + ' m';
    document.getElementById('factor-safety').textContent = '1.99';
    document.getElementById('safety-status').textContent = 'Safe';
    document.getElementById('safety-status').className = 'result-status safe';
    
    // Update section properties display
    document.getElementById('result-i').textContent = '4.17e-6';
    document.getElementById('result-z').textContent = '8.33e-5';
    document.getElementById('result-e').textContent = '200';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateMaterial();
    updateSectionInputs();
});
