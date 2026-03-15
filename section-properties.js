// Section properties calculator - FIXED VERSION
let currentShape = 'rectangle';

function selectShape(shape) {
    currentShape = shape;
    
    // Update UI
    document.querySelectorAll('.shape-option').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`[data-shape="${shape}"]`)?.classList.add('active');
    
    // Hide all inputs
    document.querySelectorAll('.shape-inputs').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
    });
    
    // Show selected
    const selectedInputs = document.getElementById(shape + '-inputs');
    if (selectedInputs) {
        selectedInputs.classList.add('active');
        selectedInputs.style.display = 'block';
    }
    
    // Auto-calculate on shape change
    calculateSection();
}

function calculateSection() {
    console.log('Calculating section properties for:', currentShape);
    
    let area, cx, cy, ixx, iyy, zxx, zyy, rxx, ryy;
    
    switch(currentShape) {
        case 'rectangle':
            const b = parseFloat(document.getElementById('rect-b')?.value) || 50;
            const h = parseFloat(document.getElementById('rect-h')?.value) || 100;
            
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
            const d = parseFloat(document.getElementById('circle-d')?.value) || 50;
            const r = d / 2;
            
            area = Math.PI * Math.pow(r, 2);
            cx = r;
            cy = r;
            ixx = (Math.PI * Math.pow(r, 4)) / 4;
            iyy = ixx;
            zxx = ixx / r;
            zyy = zxx;
            rxx = r / 2;
            ryy = rxx;
            break;
            
        case 'hollow-circle':
            const D = parseFloat(document.getElementById('hollow-D')?.value) || 60;
            const di = parseFloat(document.getElementById('hollow-d')?.value) || 40;
            const Ro = D / 2;
            const Ri = di / 2;
            
            area = Math.PI * (Math.pow(Ro, 2) - Math.pow(Ri, 2));
            cx = Ro;
            cy = Ro;
            ixx = (Math.PI / 4) * (Math.pow(Ro, 4) - Math.pow(Ri, 4));
            iyy = ixx;
            zxx = ixx / Ro;
            zyy = zxx;
            rxx = Math.sqrt(ixx / area);
            ryy = rxx;
            break;
            
        case 'i-beam':
            const bf = parseFloat(document.getElementById('ibeam-bf')?.value) || 100;
            const tf = parseFloat(document.getElementById('ibeam-tf')?.value) || 10;
            const h = parseFloat(document.getElementById('ibeam-h')?.value) || 100;
            const tw = parseFloat(document.getElementById('ibeam-tw')?.value) || 6;
            const hw = h - 2 * tf;
            
            // Area
            area = 2 * bf * tf + hw * tw;
            
            // Centroid
            cx = bf / 2;
            cy = h / 2;
            
            // Moment of inertia (parallel axis theorem)
            const Iflange = (bf * Math.pow(tf, 3)) / 12;
            const Aflange = bf * tf;
            const dflange = (h - tf) / 2;
            const Iweb = (tw * Math.pow(hw, 3)) / 12;
            
            ixx = 2 * (Iflange + Aflange * Math.pow(dflange, 2)) + Iweb;
            iyy = 2 * ((tf * Math.pow(bf, 3)) / 12) + ((hw * Math.pow(tw, 3)) / 12);
            
            zxx = ixx / (h / 2);
            zyy = iyy / (bf / 2);
            rxx = Math.sqrt(ixx / area);
            ryy = Math.sqrt(iyy / area);
            break;
            
        case 't-section':
            const tbf = parseFloat(document.getElementById('tsection-bf')?.value) || 80;
            const ttf = parseFloat(document.getElementById('tsection-tf')?.value) || 10;
            const th = parseFloat(document.getElementById('tsection-h')?.value) || 100;
            const ttw = parseFloat(document.getElementById('tsection-tw')?.value) || 8;
            const thw = th - ttf;
            
            // Areas
            const Aflange_t = tbf * ttf;
            const Aweb_t = thw * ttw;
            area = Aflange_t + Aweb_t;
            
            // Centroid (from bottom)
            cy = (Aflange_t * (th - ttf/2) + Aweb_t * (thw/2)) / area;
            cx = tbf / 2;
            
            // Moment of inertia
            const yflange = th - ttf/2 - cy;
            const yweb = thw/2 - cy;
            
            ixx = ((tbf * Math.pow(ttf, 3)) / 12 + Aflange_t * Math.pow(yflange, 2)) +
                  ((ttw * Math.pow(thw, 3)) / 12 + Aweb_t * Math.pow(yweb, 2));
            iyy = ((ttf * Math.pow(tbf, 3)) / 12) + ((thw * Math.pow(ttw, 3)) / 12);
            
            zxx = ixx / Math.max(cy, th - cy);
            zyy = iyy / (tbf / 2);
            rxx = Math.sqrt(ixx / area);
            ryy = Math.sqrt(iyy / area);
            break;
            
        case 'channel':
            const cbf = parseFloat(document.getElementById('channel-bf')?.value) || 50;
            const ctf = parseFloat(document.getElementById('channel-tf')?.value) || 8;
            const ch = parseFloat(document.getElementById('channel-h')?.value) || 100;
            const ctw = parseFloat(document.getElementById('channel-tw')?.value) || 6;
            const chw = ch - 2 * ctf;
            
            // Area
            area = 2 * cbf * ctf + chw * ctw;
            
            // Centroid
            const xflange = cbf / 2;
            const xweb = ctw / 2;
            const Aflange_c = cbf * ctf;
            const Aweb_c = chw * ctw;
            cx = (2 * Aflange_c * xflange + Aweb_c * xweb) / area;
            cy = ch / 2;
            
            // Moment of inertia
            ixx = 2 * ((cbf * Math.pow(ctf, 3)) / 12 + Aflange_c * Math.pow((ch - ctf)/2, 2)) +
                  ((ctw * Math.pow(chw, 3)) / 12);
            iyy = 2 * ((ctf * Math.pow(cbf, 3)) / 12 + Aflange_c * Math.pow(cx - xflange, 2)) +
                  ((chw * Math.pow(ctw, 3)) / 12 + Aweb_c * Math.pow(cx - xweb, 2));
            
            zxx = ixx / (ch / 2);
            zyy = iyy / Math.max(cx, cbf - cx);
            rxx = Math.sqrt(ixx / area);
            ryy = Math.sqrt(iyy / area);
            break;
            
        default:
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
    
    console.log('Section calculation complete!');
}

function drawSection() {
    const canvas = document.getElementById('section-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 1.5;
    
    ctx.strokeStyle = '#3d7bc9';
    ctx.fillStyle = 'rgba(61, 123, 201, 0.1)';
    ctx.lineWidth = 2;
    
    switch(currentShape) {
        case 'rectangle':
            const b = parseFloat(document.getElementById('rect-b')?.value) || 50;
            const h = parseFloat(document.getElementById('rect-h')?.value) || 100;
            const w = b * scale;
            const ht = h * scale;
            ctx.fillRect(centerX - w/2, centerY - ht/2, w, ht);
            ctx.strokeRect(centerX - w/2, centerY - ht/2, w, ht);
            break;
            
        case 'circle':
            const d = parseFloat(document.getElementById('circle-d')?.value) || 50;
            const r = (d * scale) / 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'hollow-circle':
            const D = parseFloat(document.getElementById('hollow-D')?.value) || 60;
            const di = parseFloat(document.getElementById('hollow-d')?.value) || 40;
            const Ro = (D * scale) / 2;
            const Ri = (di * scale) / 2;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, Ro, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(centerX, centerY, Ri, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'i-beam':
            // Simplified I-beam drawing
            const ibf = (parseFloat(document.getElementById('ibeam-bf')?.value) || 100) * scale;
            const itf = (parseFloat(document.getElementById('ibeam-tf')?.value) || 10) * scale;
            const ih = (parseFloat(document.getElementById('ibeam-h')?.value) || 100) * scale;
            const itw = (parseFloat(document.getElementById('ibeam-tw')?.value) || 6) * scale;
            
            // Top flange
            ctx.fillRect(centerX - ibf/2, centerY - ih/2, ibf, itf);
            ctx.strokeRect(centerX - ibf/2, centerY - ih/2, ibf, itf);
            
            // Web
            ctx.fillRect(centerX - itw/2, centerY - ih/2 + itf, itw, ih - 2*itf);
            ctx.strokeRect(centerX - itw/2, centerY - ih/2 + itf, itw, ih - 2*itf);
            
            // Bottom flange
            ctx.fillRect(centerX - ibf/2, centerY + ih/2 - itf, ibf, itf);
            ctx.strokeRect(centerX - ibf/2, centerY + ih/2 - itf, ibf, itf);
            break;
    }
    
    // Draw centroid
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
}

function exportCSV() {
    const rows = [
        ['Property', 'Value', 'Unit'],
        ['Area', document.getElementById('result-area').textContent, 'mm²'],
        ['Centroid X', document.getElementById('result-cx').textContent, 'mm'],
        ['Centroid Y', document.getElementById('result-cy').textContent, 'mm'],
        ['Ixx', document.getElementById('result-ixx').textContent, 'mm⁴'],
        ['Iyy', document.getElementById('result-iyy').textContent, 'mm⁴'],
        ['Zxx', document.getElementById('result-zxx').textContent, 'mm³'],
        ['Zyy', document.getElementById('result-zyy').textContent, 'mm³'],
        ['rxx', document.getElementById('result-rxx').textContent, 'mm'],
        ['ryy', document.getElementById('result-ryy').textContent, 'mm']
    ];
    
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'section-properties.csv';
    a.click();
    
    URL.revokeObjectURL(url);
}

function copyToClipboard() {
    const text = `Section Properties:
Area: ${document.getElementById('result-area').textContent} mm²
Ixx: ${document.getElementById('result-ixx').textContent} mm⁴
Zxx: ${document.getElementById('result-zxx').textContent} mm³`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Section properties calculator initialized');
    selectShape('rectangle');
    
    // Add event listeners for real-time calculation
    ['rect-b', 'rect-h', 'circle-d', 'hollow-D', 'hollow-d', 
     'ibeam-bf', 'ibeam-tf', 'ibeam-h', 'ibeam-tw',
     'tsection-bf', 'tsection-tf', 'tsection-h', 'tsection-tw',
     'channel-bf', 'channel-tf', 'channel-h', 'channel-tw'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calculateSection);
    });
});
