// Brede Welkaart - Main Application Logic

console.log('=== Brede Welkaart Script Loading ===');

// State
let map;
let currentBoundariesLayer;
let currentRasterLayer;
let currentStarMarker;
let currentCapitalType = 'total';
let currentAdminLevel = 'gemeente';
let currentScale = 'per_hectare';
let capitalData = {};
let selectedRegion = null;
let chart = null;
let currentLanguage = 'nl'; // Default language

// Color schemes for different capital types (3 classes) - High contrast
const colorSchemes = {
    total: ['#deebf7', '#6baed6', '#08306b'],      // Blue: lighter → darker
    balance: ['#fee6ce', '#fed976', '#41ab5d'],    // Red → Yellow → Green (diverging)
    natural: ['#e5f5e0', '#74c476', '#00441b'],    // Green: lighter → darker
    produced: ['#efedf5', '#9e9ac8', '#54278f'],   // Purple: lighter → darker
    human: ['#fee6ce', '#fd8d3c', '#7f2704']       // Orange: lighter → darker
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting initialization');
    init().catch(error => {
        console.error('FATAL ERROR during initialization:', error);
        alert('Er is een fout opgetreden bij het laden van de applicatie. Controleer de console voor details.');
    });
});

async function init() {
    try {
        console.log('Initializing Brede Welkaart...');
        
        // Load saved language preference
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && (savedLanguage === 'nl' || savedLanguage === 'en')) {
            currentLanguage = savedLanguage;
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById(`lang-${currentLanguage}`).classList.add('active');
        }
        
        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            throw new Error('Leaflet library not loaded!');
        }
        console.log('✓ Leaflet loaded:', L.version);
        
        // Initialize map
        console.log('Initializing map...');
        initMap();
        
        // Load initial data
        console.log(`Loading initial data for level: ${currentAdminLevel}`);
        await loadData(currentAdminLevel);
        
        // Setup event listeners
        console.log('Setting up event listeners...');
        setupEventListeners();
        
        // Disable scale options for pixel level on initial load
        // (Not needed as default is now gemeente)
        // Scale options are always enabled by default
        
        // Update page links with current language
        updatePageLinks();
        
        // Apply saved language to UI
        if (currentLanguage !== 'nl') {
            updateAllTranslations();
        }
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
            console.log('✓ Initialization complete!');
        }, 500);
        
    } catch (error) {
        console.error('Error in init():', error);
        throw error;
    }
}

// Language switching functions
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    // Update language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`).classList.add('active');
    
    // Update methodology and about page links to include language parameter
    updatePageLinks();
    
    // Update all translations
    updateAllTranslations();
}

function updatePageLinks() {
    // Update all links to methodology and about pages with current language
    document.querySelectorAll('a[href^="methodologie.html"], a[href^="over.html"]').forEach(link => {
        const basePath = link.getAttribute('href').split('?')[0];
        link.setAttribute('href', `${basePath}?lang=${currentLanguage}`);
    });
}

function updateAllTranslations() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // Update legend
    updateLegend();
    
    // Update info panel if region is selected
    if (selectedRegion) {
        displayRegionInfo(selectedRegion);
    }
    
    // Update tooltips for all boundary features
    if (currentBoundariesLayer && currentAdminLevel !== 'pixel') {
        currentBoundariesLayer.eachLayer(layer => {
            const code = getRegionCode(layer.feature);
            updateTooltip(layer, code);
        });
    }
    
    // Update star marker tooltip
    updateStarMarker();
}

function initMap() {
    // Create map centered on Netherlands
    map = L.map('map', {
        center: [52.2, 5.3],
        zoom: 8,
        minZoom: 7,
        maxZoom: 18,  // Increased to allow more zooming for pixel tiles
        zoomControl: true
    });
    
    // Try multiple tile providers for reliability
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });
    
    tileLayer.on('tileerror', (error) => {
        console.warn('Tile load error, trying fallback:', error);
        // Fallback to OpenStreetMap
        map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                map.removeLayer(layer);
            }
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
    });
    
    tileLayer.addTo(map);
    
    console.log('Map initialized');
}

async function loadData(level) {
    showLoading(true);
    
    try {
        // Clear any existing layers
        if (currentBoundariesLayer) {
            map.removeLayer(currentBoundariesLayer);
            currentBoundariesLayer = null;
        }
        if (currentRasterLayer) {
            map.removeLayer(currentRasterLayer);
            currentRasterLayer = null;
        }
        
        // Handle pixel level differently (tile layer)
        if (level === 'pixel') {
            console.log('Loading pixel-level tiles...');
            displayPixelLayer();
            showLoading(false);
            return;
        }
        
        // Load boundaries
        const boundariesUrl = `data/boundaries/${level === 'provincie' ? 'provincies' : level === 'gemeente' ? 'gemeenten' : 'wijken'}.geojson`;
        console.log(`Fetching boundaries from: ${boundariesUrl}`);
        
        const boundariesResponse = await fetch(boundariesUrl);
        if (!boundariesResponse.ok) {
            throw new Error(`HTTP ${boundariesResponse.status}: ${boundariesResponse.statusText}`);
        }
        
        const contentLength = boundariesResponse.headers.get('content-length');
        if (contentLength) {
            console.log(`Parsing boundaries (${(contentLength / 1024 / 1024).toFixed(1)} MB)...`);
        } else {
            console.log(`Parsing boundaries...`);
        }
        
        const boundariesData = await boundariesResponse.json();
        console.log(`✓ Parsed ${boundariesData.features?.length || 0} boundary features`);
        
        // Load capital data
        const capitalUrl = `data/capitals/${level}_capitals.json`;
        console.log(`Fetching capital data from: ${capitalUrl}`);
        
        const capitalResponse = await fetch(capitalUrl);
        if (!capitalResponse.ok) {
            throw new Error(`HTTP ${capitalResponse.status}: ${capitalResponse.statusText}`);
        }
        
        capitalData = await capitalResponse.json();
        console.log(`✓ Loaded ${level} data:`, Object.keys(capitalData).length, 'regions');
        
        // Display boundaries
        displayBoundaries(boundariesData);
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        console.error('Error type:', typeof error);
        console.error('Error constructor:', error?.constructor?.name);
        if (error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('Error toString:', error.toString());
        }
        
        const errorMsg = error?.message || error?.toString() || 'Onbekende fout';
        alert(`Fout bij het laden van ${level} data:\n${errorMsg}\n\nProbeer de pagina te vernieuwen.`);
    } finally {
        showLoading(false);
    }
}

function displayPixelLayer() {
    console.log(`Creating tile layer for ${currentCapitalType}`);
    
    // Balance is not available at pixel level (no tiles generated)
    if (currentCapitalType === 'balance') {
        console.log('Balance not available at pixel level - switching to gemeente');
        currentAdminLevel = 'gemeente';
        document.querySelector('input[name="admin"][value="gemeente"]').checked = true;
        loadData();
        return;
    }
    
    // Remove existing raster layer
    if (currentRasterLayer) {
        map.removeLayer(currentRasterLayer);
    }
    
    // Remove star marker for pixel level
    if (currentStarMarker) {
        map.removeLayer(currentStarMarker);
        currentStarMarker = null;
    }
    
    // Remove existing pixel info
    selectedRegion = null;
    displayRegionInfo(null);
    
    // Create tile layer URL
    const tileUrl = `data/tiles/${currentCapitalType}/tiles/{z}/{x}/{y}.png`;
    
    // Bounds for Netherlands (to limit tile requests)
    const netherlandsBounds = L.latLngBounds(
        L.latLng(50.5, 3.0),  // Southwest corner
        L.latLng(53.7, 7.5)   // Northeast corner
    );
    
    currentRasterLayer = L.tileLayer(tileUrl, {
        minZoom: 7,
        maxZoom: 18,  // Increased to allow more zooming
        opacity: 0.7,
        bounds: netherlandsBounds,
        tms: true,  // Use TMS coordinate system (gdal2tiles default)
        attribution: 'Pixel-niveau: 100m rasters',
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' // 1x1 transparent PNG
    });
    
    // Suppress tile load errors in console
    currentRasterLayer.on('tileerror', function(error, tile) {
        // Silently handle - tiles outside Netherlands bounds won't exist
    });
    
    currentRasterLayer.addTo(map);
    console.log('✓ Pixel tile layer added to map');
}

function displayBoundaries(geojson) {
    // Remove existing layer
    if (currentBoundariesLayer) {
        map.removeLayer(currentBoundariesLayer);
    }
    
    console.log(`Displaying ${geojson.features.length} boundaries`);
    
    // Create new layer
    currentBoundariesLayer = L.geoJSON(geojson, {
        style: styleFeature,
        onEachFeature: onEachFeature
    }).addTo(map);
    
    // Keep current zoom level when switching between admin levels
    console.log(`Displayed ${geojson.features.length} boundaries - maintaining current zoom`);
    
    // Add star marker for highest value region
    updateStarMarker();
    
    // Force map to redraw
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

function updateStarMarker() {
    // Remove existing star marker
    if (currentStarMarker) {
        map.removeLayer(currentStarMarker);
        currentStarMarker = null;
    }
    
    // Skip for pixel level
    if (currentAdminLevel === 'pixel' || !currentBoundariesLayer) {
        return;
    }
    
    // Find region with highest value
    let maxValue = -Infinity;
    let maxRegionCode = null;
    let maxRegionCenter = null;
    
    Object.entries(capitalData).forEach(([code, data]) => {
        const value = getScaledValue(data, currentCapitalType);
        if (value > maxValue) {
            maxValue = value;
            maxRegionCode = code;
        }
    });
    
    // Find the feature and get its center using Leaflet's built-in methods
    if (maxRegionCode) {
        currentBoundariesLayer.eachLayer(layer => {
            const code = getRegionCode(layer.feature);
            if (code === maxRegionCode) {
                // Use layer bounds center - Leaflet handles coordinate system correctly
                const bounds = layer.getBounds();
                maxRegionCenter = bounds.getCenter();
            }
        });
    }
    
    // Add star marker
    if (maxRegionCenter) {
        const starSvg = `
            <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                      fill="#FFD700" 
                      stroke="#FFA500" 
                      stroke-width="1"/>
            </svg>
        `;
        
        const starIcon = L.divIcon({
            className: 'star-marker-professional',
            html: starSvg,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        
        currentStarMarker = L.marker(maxRegionCenter, { 
            icon: starIcon,
            zIndexOffset: 1000,
            pane: 'markerPane'
        }).addTo(map);
        
        // Add tooltip
        const regionData = capitalData[maxRegionCode];
        if (regionData) {
            currentStarMarker.bindTooltip(
                `<strong>${t('starHighest')}</strong><br>${regionData.naam}`,
                { permanent: false, direction: 'top', offset: [0, -16] }
            );
        }
        
        console.log(`⭐ Star marker placed at ${regionData?.naam || maxRegionCode} (${maxRegionCenter.lat.toFixed(4)}, ${maxRegionCenter.lng.toFixed(4)}) with value ${maxValue.toFixed(2)}`);
    }
}

function styleFeature(feature) {
    const code = getRegionCode(feature);
    const data = capitalData[code];
    
    // Adjust border weight based on admin level
    const borderWeights = {
        provincie: { normal: 2, selected: 3 },
        gemeente: { normal: 1, selected: 2 },
        wijk: { normal: 0.5, selected: 1.5 }
    };
    const weights = borderWeights[currentAdminLevel] || { normal: 1, selected: 2 };
    
    if (!data) {
        console.warn('No data for region:', code);
        return {
            fillColor: '#cccccc',
            weight: weights.normal,
            opacity: 1,
            color: '#666666',
            fillOpacity: 0.5
        };
    }
    
    const value = getScaledValue(data, currentCapitalType);
    const color = getColor(value, currentCapitalType);
    
    const style = {
        fillColor: color,
        weight: selectedRegion === code ? weights.selected : weights.normal,
        opacity: 1,
        color: selectedRegion === code ? '#00aa7c' : '#333333',
        fillOpacity: 0.7
    };
    
    return style;
}

function getNationalAverage(capitalType) {
    // Calculate national average for current scale (excluding proportion and vs_national)
    if (currentScale === 'proportion' || currentScale === 'vs_national') {
        // Use absolute values for base calculation
        const values = Object.values(capitalData)
            .map(d => d[capitalType] || 0)
            .filter(v => v > 0);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    } else if (currentScale === 'per_capita') {
        const field = `${capitalType}_per_capita`;
        const values = Object.values(capitalData)
            .map(d => d[field] || 0)
            .filter(v => v > 0);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    } else if (currentScale === 'per_hectare') {
        const field = `${capitalType}_per_hectare`;
        const values = Object.values(capitalData)
            .map(d => (d[field] || 0) * 1000000)
            .filter(v => v > 0);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    } else {
        // absolute
        const values = Object.values(capitalData)
            .map(d => d[capitalType] || 0)
            .filter(v => v > 0);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }
}

function getNationalAveragePerHectare(capitalType) {
    // Calculate national average per hectare (used for vs_national comparison)
    const field = `${capitalType}_per_hectare`;
    const values = Object.values(capitalData)
        .map(d => (d[field] || 0) * 1000000) // Convert to EUR/ha
        .filter(v => v > 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function calculateBalanceScore(regionData) {
    // Calculate balance score: how many capitals are above NL average (per hectare)
    // Returns -3 to +3 (all below to all above)
    const capitalTypes = ['natural', 'produced', 'human'];
    let score = 0;
    
    capitalTypes.forEach(type => {
        const field = `${type}_per_hectare`;
        const regionalValue = (regionData[field] || 0) * 1000000; // EUR/ha
        const nationalAvg = getNationalAveragePerHectare(type);
        
        if (nationalAvg > 0) {
            const deviation = ((regionalValue - nationalAvg) / nationalAvg) * 100;
            
            // Count as above/below if deviation > 5%
            if (deviation > 5) {
                score += 1; // Above average
            } else if (deviation < -5) {
                score -= 1; // Below average
            }
            // Within ±5% counts as neutral (0)
        }
    });
    
    return score; // Range: -3 (all below) to +3 (all above)
}

function getScaledValue(regionData, capitalType) {
    // Special handling for balance
    if (capitalType === 'balance') {
        return calculateBalanceScore(regionData);
    }
    
    // Get the appropriate value based on current scale
    if (currentScale === 'per_capita') {
        const field = `${capitalType}_per_capita`;
        return regionData[field] || 0;
    } else if (currentScale === 'per_hectare') {
        // per_hectare values are in millions EUR/ha, convert to EUR/ha for consistency
        const field = `${capitalType}_per_hectare`;
        return (regionData[field] || 0) * 1000000;
    } else if (currentScale === 'proportion') {
        // Calculate proportion as percentage of total
        if (capitalType === 'total') {
            return 100; // Total is always 100%
        }
        const capitalValue = regionData[capitalType] || 0;
        const totalValue = regionData['total'] || 1; // Avoid division by zero
        return (capitalValue / totalValue) * 100;
    } else if (currentScale === 'vs_national') {
        // Calculate percentage deviation from national average
        // Use per_hectare values for normalization (fairer comparison across different sized regions)
        const field = `${capitalType}_per_hectare`;
        const regionalValue = (regionData[field] || 0) * 1000000; // Convert to EUR/ha
        const nationalAvg = getNationalAveragePerHectare(capitalType);
        
        if (nationalAvg === 0) return 0;
        
        // Return percentage deviation: (regional - national) / national * 100
        return ((regionalValue - nationalAvg) / nationalAvg) * 100;
    } else {
        // absolute - in millions EUR
        return regionData[capitalType] || 0;
    }
}

// Helper function to interpolate between two hex colors
function interpolateColor(color1, color2, factor) {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);
    
    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;
    
    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;
    
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Generate 10-class gradient from color scheme
function generateGradient(colors) {
    const gradient = [];
    const stepsPerSegment = 5; // 5 steps between each pair of colors
    
    // First segment: light → medium
    for (let i = 0; i < stepsPerSegment; i++) {
        const factor = i / stepsPerSegment;
        gradient.push(interpolateColor(colors[0], colors[1], factor));
    }
    
    // Second segment: medium → dark
    for (let i = 0; i < stepsPerSegment; i++) {
        const factor = i / stepsPerSegment;
        gradient.push(interpolateColor(colors[1], colors[2], factor));
    }
    
    return gradient;
}

function getColor(value, capitalType) {
    // Special handling for balance: fixed 5-class scheme based on score
    if (capitalType === 'balance') {
        // Value is score from -3 to +3
        if (value === 3) {
            return '#1a9850';  // Dark green: all 3 above average
        } else if (value === 2 || value === 1) {
            return '#91cf60';  // Light green: 1-2 above average
        } else if (value === 0) {
            return '#ffffbf';  // Yellow: balanced (all within ±5%)
        } else if (value === -1 || value === -2) {
            return '#fc8d59';  // Light red: 1-2 below average
        } else {  // value === -3
            return '#d73027';  // Dark red: all 3 below average
        }
    }
    
    // Special handling for vs_national scale: fixed thresholds
    if (currentScale === 'vs_national') {
        // Fixed 5-class diverging color scheme
        // Value is percentage deviation from national average
        if (value < -25) {
            return '#d73027';  // Dark red: < -25%
        } else if (value < -5) {
            return '#fc8d59';  // Light red: -25% to -5%
        } else if (value <= 5) {
            return '#ffffbf';  // Light yellow: -5% to 5% (average)
        } else if (value <= 25) {
            return '#91cf60';  // Light green: 5% to 25%
        } else {
            return '#1a9850';  // Dark green: > 25%
        }
    }
    
    // Regular quantile-based coloring for other scales
    const baseColors = colorSchemes[capitalType];
    const colors = generateGradient(baseColors);
    
    // Get all values for quantile calculation using current scale
    const allValues = Object.values(capitalData)
        .map(d => getScaledValue(d, capitalType))
        .filter(v => v > 0)
        .sort((a, b) => a - b);
    
    if (allValues.length === 0) return colors[0];
    
    // Calculate quantiles for 10 classes
    const numClasses = 10;
    for (let i = 0; i < numClasses; i++) {
        const quantile = allValues[Math.floor(allValues.length * ((i + 1) / numClasses))];
        if (value <= quantile) {
            return colors[i];
        }
    }
    
    return colors[numClasses - 1];  // Highest class
}

function onEachFeature(feature, layer) {
    // Hover effects
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: selectFeature
    });
    
    // Tooltip - will be updated dynamically
    const code = getRegionCode(feature);
    const data = capitalData[code];
    
    if (data) {
        updateTooltip(layer, code);
    }
}

function updateTooltip(layer, code) {
    const data = capitalData[code];
    if (!data) return;
    
    const value = getScaledValue(data, currentCapitalType);
    
    const capitalNames = {
        total: t('capitalTotal'),
        balance: t('capitalBalance'),
        natural: t('capitalNatural'),
        produced: t('capitalProduced'),
        human: t('capitalHuman')
    };
    
    let formatted, unit, prefix;
    
    // Special formatting for balance
    if (currentCapitalType === 'balance') {
        const balanceLabels = {
            '-3': t('balanceAllBelow'),
            '-2': t('balance2Below'),
            '-1': t('balance1Below'),
            '0': t('balanceBalanced'),
            '1': t('balance1Above'),
            '2': t('balance2Above'),
            '3': t('balanceAllAbove')
        };
        formatted = balanceLabels[value.toString()] || t('balanceUnknown');
        unit = '';
        prefix = '';
    } else if (currentScale === 'absolute') {
        formatted = formatValue(value, true);
        unit = ' ' + t('unitBillion');
        prefix = '€';
    } else if (currentScale === 'per_capita') {
        formatted = formatValue(value);
        unit = ' ' + t('unitPerPerson');
        prefix = '€';
    } else if (currentScale === 'per_hectare') {
        formatted = formatValue(value);
        unit = t('unitPerHectare');
        prefix = '€';
    } else if (currentScale === 'proportion') {
        formatted = value.toFixed(1);
        unit = t('unitPercent');
        prefix = '';
    } else if (currentScale === 'vs_national') {
        // Format as percentage deviation from national average
        const sign = value >= 0 ? '+' : '';
        formatted = value.toFixed(1);
        unit = t('unitVsNational');
        prefix = sign;
    }
    
    const capitalName = capitalNames[currentCapitalType];
    layer.bindTooltip(
        `<strong>${data.naam}</strong><br>${capitalName}: ${prefix}${formatted}${unit}`, 
        { sticky: true }
    );
}

function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#00aa7c',
        fillOpacity: 0.9
    });
    layer.bringToFront();
}

function resetHighlight(e) {
    if (selectedRegion !== getRegionCode(e.target.feature)) {
        currentBoundariesLayer.resetStyle(e.target);
    }
}

function selectFeature(e) {
    const code = getRegionCode(e.target.feature);
    selectedRegion = code;
    
    // Update styles
    currentBoundariesLayer.eachLayer(layer => {
        currentBoundariesLayer.resetStyle(layer);
    });
    
    e.target.setStyle({
        weight: 3,
        color: '#00aa7c'
    });
    
    // Update info panel
    displayRegionInfo(code);
}

function displayRegionInfo(code) {
    const data = capitalData[code];
    
    if (!data) {
        document.getElementById('info-content').innerHTML = `
            <h2 data-i18n="infoPanelTitle">${t('infoPanelTitle')}</h2>
            <p style="color: #64748b; margin-top: 1rem; line-height: 1.8;" data-i18n="infoPanelIntro">
                ${t('infoPanelIntro')}
            </p>
            <p style="color: #64748b; margin-top: 0.75rem; line-height: 1.8;">
                <strong style="color: #1e293b;" data-i18n="infoPanelInstruction">${t('infoPanelInstruction')}</strong> <span data-i18n="infoPanelInstructionText">${t('infoPanelInstructionText')}</span>
            </p>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
                <a href="methodologie.html" style="color: #00aa7c; text-decoration: none; font-size: 0.95rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span data-i18n="linkMethodology">${t('linkMethodology')}</span>
                </a>
                <a href="over.html" style="color: #00aa7c; text-decoration: none; font-size: 0.95rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span data-i18n="aboutUsLink">${t('aboutUsLink')}</span>
                </a>
            </div>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; text-align: center;">
                <img src="assets/logo-eur.png" 
                     alt="Erasmus Universiteit Rotterdam" 
                     style="max-width: 180px; height: auto; opacity: 0.9; margin-bottom: 1.5rem;">
                <p style="font-size: 0.75rem; color: var(--text-light); margin-bottom: 0.5rem; font-weight: 500;">Funded by</p>
                <img src="assets/convergence-logo.jpg" 
                     alt="Convergence" 
                     style="max-width: 160px; height: auto; opacity: 0.85;">
            </div>
        `;
        return;
    }
    
    const unitBillion = t('unitBillion');
    const unitHa = t('unitHectares');
    
    const html = `
        <h2>${data.naam}</h2>
        ${data.gemeente ? `<p style="color: #666; margin-bottom: 1rem;"><span data-i18n="infoGemeente">${t('infoGemeente')}</span> ${data.gemeente}</p>` : ''}
        
        <div class="stat-row">
            <span class="stat-label" data-i18n="infoPopulation">${t('infoPopulation')}</span>
            <span class="stat-value">${formatValue(data.population)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label" data-i18n="infoArea">${t('infoArea')}</span>
            <span class="stat-value">${formatValue(data.area_hectares)} ${unitHa}</span>
        </div>
        
        <h3 data-i18n="infoCapitalHeading">${t('infoCapitalHeading')}</h3>
        <div class="stat-row">
            <span class="stat-label capital-human" data-i18n="infoCapitalHuman">${t('infoCapitalHuman')}</span>
            <span class="stat-value">€${formatValue(data.human, true)} ${unitBillion}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label capital-produced" data-i18n="infoCapitalProduced">${t('infoCapitalProduced')}</span>
            <span class="stat-value">€${formatValue(data.produced, true)} ${unitBillion}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label capital-natural" data-i18n="infoCapitalNatural">${t('infoCapitalNatural')}</span>
            <span class="stat-value">€${formatValue(data.natural, true)} ${unitBillion}</span>
        </div>
        <div class="stat-row stat-row-total">
            <span class="stat-label capital-total" data-i18n="infoCapitalTotal">${t('infoCapitalTotal')}</span>
            <span class="stat-value">€${formatValue(data.total, true)} ${unitBillion}</span>
        </div>
        
        <div id="chart-container">
            <canvas id="capital-chart"></canvas>
        </div>
        
        <h3 data-i18n="infoPerCapitaHeading">${t('infoPerCapitaHeading')}</h3>
        <div class="stat-row">
            <span class="stat-label" data-i18n="infoCapitalHuman">${t('infoCapitalHuman')}</span>
            <span class="stat-value">€${formatValue(data.human_per_capita)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label" data-i18n="infoCapitalProduced">${t('infoCapitalProduced')}</span>
            <span class="stat-value">€${formatValue(data.produced_per_capita)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label" data-i18n="infoCapitalNatural">${t('infoCapitalNatural')}</span>
            <span class="stat-value">€${formatValue(data.natural_per_capita)}</span>
        </div>
        <div class="stat-row stat-row-total">
            <span class="stat-label capital-total" data-i18n="infoCapitalTotal">${t('infoCapitalTotal')}</span>
            <span class="stat-value">€${formatValue(data.total_per_capita)}</span>
        </div>
        
        <h3 data-i18n="infoPerHectareHeading">${t('infoPerHectareHeading')}</h3>
        <div class="stat-row">
            <span class="stat-label" data-i18n="infoCapitalHuman">${t('infoCapitalHuman')}</span>
            <span class="stat-value">€${formatValue(data.human_per_hectare * 1000000)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label" data-i18n="infoCapitalProduced">${t('infoCapitalProduced')}</span>
            <span class="stat-value">€${formatValue(data.produced_per_hectare * 1000000)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label" data-i18n="infoCapitalNatural">${t('infoCapitalNatural')}</span>
            <span class="stat-value">€${formatValue(data.natural_per_hectare * 1000000)}</span>
        </div>
        <div class="stat-row stat-row-total">
            <span class="stat-label capital-total" data-i18n="infoCapitalTotal">${t('infoCapitalTotal')}</span>
            <span class="stat-value">€${formatValue(data.total_per_hectare * 1000000)}</span>
        </div>
        
        <h3 data-i18n="infoProportionHeading">${t('infoProportionHeading')}</h3>
        <div class="stat-row">
            <span class="stat-label" data-i18n="infoCapitalHuman">${t('infoCapitalHuman')}</span>
            <span class="stat-value">${((data.human / data.total) * 100).toFixed(1)}%</span>
        </div>
        <div class="stat-row">
            <span class="stat-label" data-i18n="infoCapitalProduced">${t('infoCapitalProduced')}</span>
            <span class="stat-value">${((data.produced / data.total) * 100).toFixed(1)}%</span>
        </div>
        <div class="stat-row">
            <span class="stat-label" data-i18n="infoCapitalNatural">${t('infoCapitalNatural')}</span>
            <span class="stat-value">${((data.natural / data.total) * 100).toFixed(1)}%</span>
        </div>
        <div class="stat-row stat-row-total">
            <span class="stat-label capital-total" data-i18n="infoCapitalTotal">${t('infoCapitalTotal')}</span>
            <span class="stat-value">100.0%</span>
        </div>
    `;
    
    document.getElementById('info-content').innerHTML = html;
    
    // Create chart
    createChart(data);
}

function createChart(data) {
    const ctx = document.getElementById('capital-chart');
    
    if (chart) {
        chart.destroy();
    }
    
    const total = data.natural + data.produced + data.human;
    const unitBillion = t('unitBillion');
    
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [t('infoCapitalHuman'), t('infoCapitalProduced'), t('infoCapitalNatural')],
            datasets: [{
                data: [data.human, data.produced, data.natural],
                backgroundColor: ['#f97316', '#7c3aed', '#00a854'],  // Orange, Purple, Green
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverBorderWidth: 4,
                hoverBorderColor: '#00aa7c'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#00aa7c',
                    borderWidth: 2,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return label + ': €' + formatValue(value, true) + ' ' + unitBillion + ' (' + percentage + '%)';
                        }
                    }
                },
                datalabels: {
                    color: function(context) {
                        // Use black text for better contrast on all slices
                        return '#1e293b';
                    },
                    backgroundColor: function(context) {
                        // Add white background for labels
                        return 'rgba(255, 255, 255, 0.9)';
                    },
                    borderRadius: 4,
                    padding: 6,
                    font: {
                        weight: 'bold',
                        size: 13
                    },
                    formatter: function(value, context) {
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return percentage + '%';
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 800,
                easing: 'easeInOutQuart'
            }
        },
        plugins: [ChartDataLabels]
    });
}

function setupTooltips() {
    const infoIcons = document.querySelectorAll('.info-icon, .info-icon-inline');
    let activeTooltip = null;
    
    infoIcons.forEach(icon => {
        icon.addEventListener('mouseenter', (e) => {
            const tooltipType = icon.getAttribute('data-tooltip');
            const tooltipContent = document.getElementById(`tooltip-${tooltipType}`).innerHTML;
            
            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'capital-tooltip';
            tooltip.innerHTML = tooltipContent;
            document.body.appendChild(tooltip);
            
            // Position tooltip near the icon
            const rect = icon.getBoundingClientRect();
            tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 10}px`;
            tooltip.style.left = `${rect.left + window.scrollX - tooltip.offsetWidth / 2 + icon.offsetWidth / 2}px`;
            
            // Keep tooltip on screen
            const tooltipRect = tooltip.getBoundingClientRect();
            if (tooltipRect.right > window.innerWidth) {
                tooltip.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
            }
            if (tooltipRect.left < 0) {
                tooltip.style.left = '10px';
            }
            if (tooltipRect.top < 0) {
                tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
            }
            
            activeTooltip = tooltip;
        });
        
        icon.addEventListener('mouseleave', () => {
            if (activeTooltip) {
                activeTooltip.remove();
                activeTooltip = null;
            }
        });
    });
}

function setupEventListeners() {
    // Language toggle buttons
    document.getElementById('lang-nl').addEventListener('click', () => setLanguage('nl'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    
    // Title click to reset
    document.querySelector('.sidebar-title').addEventListener('click', () => {
        selectedRegion = null;
        displayRegionInfo(null);
        if (currentBoundariesLayer) {
            currentBoundariesLayer.eachLayer(layer => {
                currentBoundariesLayer.resetStyle(layer);
            });
        }
    });
    
    // Info icon tooltips
    setupTooltips();
    
    // Capital type selector
    document.querySelectorAll('input[name="capital"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentCapitalType = e.target.value;
            updateLegend();
            
            // If at pixel level, reload the tile layer with new capital type
            if (currentAdminLevel === 'pixel') {
                displayPixelLayer();
            } else if (currentBoundariesLayer) {
                currentBoundariesLayer.eachLayer(layer => {
                    currentBoundariesLayer.resetStyle(layer);
                    // Update tooltip with new capital type
                    const code = getRegionCode(layer.feature);
                    updateTooltip(layer, code);
                });
                // Update star marker for new highest value
                updateStarMarker();
            }
        });
    });
    
    // Admin level selector
    document.querySelectorAll('input[name="admin"]').forEach(radio => {
        radio.addEventListener('change', async (e) => {
            currentAdminLevel = e.target.value;
            selectedRegion = null;
            
            // Disable scale options for pixel level
            const scaleOptions = document.querySelectorAll('input[name="scale"]');
            if (currentAdminLevel === 'pixel') {
                scaleOptions.forEach(option => {
                    if (option.value !== 'absolute') {
                        option.disabled = true;
                        option.parentElement.style.opacity = '0.5';
                    }
                });
                // Force absolute scale for pixel level
                currentScale = 'absolute';
                document.querySelector('input[name="scale"][value="absolute"]').checked = true;
            } else {
                scaleOptions.forEach(option => {
                    option.disabled = false;
                    option.parentElement.style.opacity = '1';
                });
            }
            
            await loadData(currentAdminLevel);
        });
    });
    
    // Scale selector
    document.querySelectorAll('input[name="scale"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentScale = e.target.value;
            updateLegend();
            if (currentBoundariesLayer) {
                currentBoundariesLayer.eachLayer(layer => {
                    currentBoundariesLayer.resetStyle(layer);
                    // Update tooltip with new scale
                    const code = getRegionCode(layer.feature);
                    updateTooltip(layer, code);
                });
                // Update star marker for new highest value
                updateStarMarker();
            }
        });
    });
}

function updateLegend() {
    const baseTitles = {
        total: t('capitalTotal') + ' ' + t('capitalHeading'),
        balance: t('capitalBalance'),
        natural: t('capitalNatural'),
        produced: t('capitalProduced'),
        human: t('capitalHuman')
    };
    
    const scaleUnits = {
        absolute: `(${t('unitBillion')} €)`,
        per_capita: `(€ ${t('scalePerCapita').toLowerCase()})`,
        per_hectare: `(€ ${t('scalePerHectare').toLowerCase()})`,
        proportion: `(${t('scaleProportion')})`,
        vs_national: `(${t('scalePerHectare').toLowerCase()}, ${t('scaleVsNational').toLowerCase()})`
    };
    
    // Balance always shows same unit regardless of scale
    const title = currentCapitalType === 'balance' 
        ? `${t('capitalBalance')} (${t('scalePerHectare').toLowerCase()}, ${t('scaleVsNational').toLowerCase()})`
        : `${baseTitles[currentCapitalType]} ${scaleUnits[currentScale]}`;
    document.querySelector('.legend-title').textContent = title;
    
    const legendItems = document.querySelectorAll('.legend-item');
    const legendLabels = document.querySelectorAll('.legend-label');
    const legendColors = document.querySelectorAll('.legend-color');
    
    // Special legend for balance (5 classes)
    if (currentCapitalType === 'balance') {
        // Show all 5 legend items
        legendItems.forEach((item, i) => {
            if (i < 5) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Set 5-class balance colors and labels
        if (legendColors.length >= 5 && legendLabels.length >= 5) {
            legendColors[0].style.background = '#d73027';
            legendLabels[0].textContent = t('legendBalanceAllBelow');
            
            legendColors[1].style.background = '#fc8d59';
            legendLabels[1].textContent = t('legendBalance12Below');
            
            legendColors[2].style.background = '#ffffbf';
            legendLabels[2].textContent = t('legendBalanceBalanced');
            
            legendColors[3].style.background = '#91cf60';
            legendLabels[3].textContent = t('legendBalance12Above');
            
            legendColors[4].style.background = '#1a9850';
            legendLabels[4].textContent = t('legendBalanceAllAbove');
        }
    } else if (currentScale === 'vs_national') {
        // Show only 3 legend items
        legendItems.forEach((item, i) => {
            if (i < 3) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Set 3-class descriptive labels and representative colors
        if (legendColors.length >= 3 && legendLabels.length >= 3) {
            // Dark red: Below national average
            legendColors[0].style.background = '#d73027';
            legendLabels[0].textContent = t('legendVsNationalBelow');
            
            // Yellow: Around average
            legendColors[1].style.background = '#ffffbf';
            legendLabels[1].textContent = t('legendVsNationalAverage');
            
            // Dark green: Above national average
            legendColors[2].style.background = '#1a9850';
            legendLabels[2].textContent = t('legendVsNationalAbove');
        }
    } else {
        // Regular 3-class legend - hide extra items
        legendItems.forEach((item, i) => {
            if (i < 3) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Reset to standard labels
        if (legendLabels.length >= 3) {
            legendLabels[0].textContent = t('legendLow');
            legendLabels[1].textContent = t('legendMedium');
            legendLabels[2].textContent = t('legendHigh');
        }
        
        // Update colors for 3 classes
        const colors = colorSchemes[currentCapitalType];
        legendColors.forEach((el, i) => {
            if (i < colors.length) {
                el.style.background = colors[i];
            }
        });
    }
}

function getRegionCode(feature) {
    const props = feature.properties;
    return props.statcode || props.code || props.pv_code || props.gm_code || props.wk_code;
}

function formatValue(value, inBillions = false) {
    const locale = currentLanguage === 'nl' ? 'nl-NL' : 'en-US';
    
    // If inBillions is true, convert millions to billions with 1 decimal
    if (inBillions) {
        const billions = value / 1000;
        return billions.toLocaleString(locale, { 
            minimumFractionDigits: 1, 
            maximumFractionDigits: 1 
        });
    }
    // For population, use full number with thousand separators
    return Math.round(value).toLocaleString(locale);
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

console.log('Brede Welkaart app loaded');

