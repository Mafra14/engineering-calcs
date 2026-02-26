// Section properties calculator
let currentShape = 'rectangle';

function selectShape(shape) {
    currentShape = shape;
    
    // Update UI
    document.querySelectorAll('.shape-option').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`[data-shape="${shape}"]`).classList.add('active');
    
    // Hide all inputs
    document.querySelectorAll('.shape-inputs').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected
    const selectedInputs = document.getElementById(shape + '-inputs');
    if (selectedInputs) {
        selectedInputs.classList.add('active');
    }
}

function calculateSection() {
    let area, cx, cy, ixx, iyy, zxx, zyy, rxx, ryy;
    
    switch(currentShape) {
        case 'rectangle':
            const b = parseFloat(document.getElementById('rect-b').value) || 50;
            const h = parseFloat(document.getElementById('rect-h').value) || 100;
            
            area = b * h;
            cx = b / 2;
            cy = h / 2;
            ixx = (b * Math.pow(h, 3)) / 12;
            iyy = (h * Math.pow(b, 3)) / 12;
            zxx = ixx / (h / 2);
            zyy = iyy / (b / 2);
            rxx = Math.sqrt(ixx / area);
            ryy = Math.sqrt(iyy / area);
            break;
            
        case 'circle':
            const d = parseFloat(document.getElementById('circle-d').value) || 50;
            const r = d / 2;
            
            area = Math.PI * Math.pow(r, 2);
            cx = cy = r;
            ixx = iyy = (Math.PI * Math.pow(r, 4)) / 4;
            zxx = zyy = ixx / r;
            rxx = ryy = r / 2;
            break;
            
        case 'hollow-circle':
            const D = parseFloat(document.getElementById('hollow-D').value) || 60;
            const di = parseFloat(document.getElementById('hollow-d').value) || 40;
            const Ro = D / 2;
            const Ri = di / 2;
            
            area = Math.PI * (Math.pow(Ro, 2) - Math.pow(Ri, 2));
            cx = cy = Ro;
            ixx = iyy = (Math.PI / 4) * (Math.pow(Ro, 4) - Math.pow(Ri, 4));
            zxx = zyy = ixx / Ro;
            rxx = ryy = Math.sqrt(ixx / area);
            break;
            
        default:
            // Mock values for other shapes
            area = 5000;
            cx = 50;
            cy = 50;
            ixx = 4166667;
            iyy = 1041667;
            zxx = 83333;
            zyy = 20833;
            rxx = 28.87;
            ryy = 14.43;
    }
    
    // Display results
    document.getElementById('result-area').textContent = area.toFixed(2);
    document.getElementById('result-cx').textContent = cx.toFixed(2);
    document.getElementById('result-cy').textContent = cy.toFixed(2);
    document.getElementById('result-ixx').textContent = ixx.toExponential(2);
    document.getElementById('result-iyy').textContent = iyy.toExponential(2);
    document.getElementById('result-zxx').textContent = zxx.toFixed(2);
    document.getElementById('result-zyy').textContent = zyy.toFixed(2);
    document.getElementById('result-rxx').textContent = rxx.toFixed(2);
    document.getElementById('result-ryy').textContent = ryy.toFixed(2);
    
    // Draw section
    drawSection();
}

function drawSection() {
    const canvas = document.getElementById('section-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw based on shape
    ctx.strokeStyle = '#3d7bc9';
    ctx.lineWidth = 2;
    
    if (currentShape === 'rectangle') {
        ctx.strokeRect(50, 25, 100, 100);
        // Draw centroid
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(100, 75, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (currentShape === 'circle') {
        ctx.beginPath();
        ctx.arc(100, 75, 50, 0, Math.PI * 2);
        ctx.stroke();
        // Draw centroid
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(100, 75, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function exportCSV() {
    const data = [
        ['Property', 'Value', 'Unit'],
        ['Area', document.getElementById('result-area').textContent, 'mm²'],
        ['Centroid X', document.getElementById('result-cx').textContent, 'mm'],
        ['Centroid Y', document.getElementById('result-cy').textContent, 'mm'],
        ['Ixx', document.getElementById('result-ixx').textContent, 'mm⁴'],
        ['Iyy', document.getElementById('result-iyy').textContent, 'mm⁴'],
        ['Zxx', document.getElementById('result-zxx').textContent, 'mm³'],
        ['Zyy', document.getElementById('result-zyy').textContent, 'mm³']
    ];
    
    const csv = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'section-properties.csv';
    a.click();
}

function copyToClipboard() {
    const text = `Section Properties:
Area: ${document.getElementById('result-area').textContent} mm²
Ixx: ${document.getElementById('result-ixx').textContent} mm⁴
Zxx: ${document.getElementById('result-zxx').textContent} mm³`;
    
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    selectShape('rectangle');
});
