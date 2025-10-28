# Brede Welkaart - Static Web Application

A professional, interactive web application for visualizing wealth distribution across the Netherlands.

## Features

- **Interactive Map**: Visualize natural, produced, and human capital across different administrative levels
- **Multiple Views**: Switch between provincie, gemeente, and wijk level data
- **Detailed Information**: Click any region to see comprehensive capital statistics
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Pure Static**: No backend required - runs entirely in the browser

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Mapping**: Leaflet.js
- **Charts**: Chart.js
- **Data Format**: GeoJSON for boundaries, JSON for capital data

## Quick Start

### Option 1: Local Testing (Python)

```bash
# Navigate to web folder
cd web

# Start Python HTTP server
python3 -m http.server 8000

# Open browser
open http://localhost:8000
```

### Option 2: Local Testing (Node.js)

```bash
# Install serve globally
npm install -g serve

# Navigate to web folder and serve
cd web
serve -p 8000

# Open browser
open http://localhost:8000
```

### Option 3: Deploy to GitHub Pages

1. Push the `web/` folder to your GitHub repository
2. Go to repository Settings → Pages
3. Select branch and `/web` folder
4. Your site will be available at: `https://username.github.io/repository-name/`

### Option 4: Deploy to Netlify

1. Sign up at netlify.com
2. Drag and drop the `web/` folder
3. Your site will be live instantly with a custom URL

## Folder Structure

```
web/
├── index.html              # Main map page
├── methodologie.html       # Methodology documentation
├── over.html              # About page
├── README.md              # This file
├── css/
│   └── style.css          # All styles
├── js/
│   └── app.js             # Main application logic
├── data/
│   ├── boundaries/
│   │   ├── provincies.geojson   (323 KB)
│   │   ├── gemeenten.geojson    (1.5 MB)
│   │   └── wijken.geojson       (5.5 MB)
│   └── capitals/
│       ├── provincie_capitals.json  (3.5 KB)
│       ├── gemeente_capitals.json   (98 KB)
│       └── wijk_capitals.json       (1.1 MB)
```

**Total Size**: ~8.5 MB (perfect for GitHub Pages, Netlify, or Vercel)

## Browser Compatibility

- Chrome/Edge: ✓ Latest 2 versions
- Firefox: ✓ Latest 2 versions
- Safari: ✓ Latest 2 versions
- Mobile browsers: ✓ iOS Safari, Chrome Mobile

## Data Sources

All data is sourced from:
- CBS Natuurlijk Kapitaalrekeningen 2020
- CBS Kerncijfers Wijken en Buurten 2023
- LitPop methodology with COROP calibration
- IWI 2023 methodology for human capital

See `methodologie.html` for full documentation.

## Performance

- **Initial Load**: < 3 seconds on broadband
- **Province Level**: Instant
- **Municipality Level**: < 1 second
- **Wijk Level**: < 2 seconds (3,411 regions)

## Customization

### Theme Colors

Edit `css/style.css`, line 3-11:

```css
:root {
    --primary: #00aa7c;      /* Main theme color */
    --natural: #2e7d32;      /* Natural capital */
    --produced: #1976d2;     /* Produced capital */
    --human: #f57c00;        /* Human capital */
}
```

### Map Center and Zoom

Edit `js/app.js`, line 36:

```javascript
map = L.map('map', {
    center: [52.2, 5.3],  // [lat, lon]
    zoom: 8,
    minZoom: 7,
    maxZoom: 12
});
```

## Known Limitations

1. **Wijk level data**: Some wijken (5 out of 3,411) have imputed human capital values
2. **Natural capital**: Based on 2020 values, adjusted to 2023 prices
3. **File size**: Wijk GeoJSON is 5.5 MB - first load may be slow on slow connections
4. **Mobile**: Best experience on screens ≥ 768px

## Future Enhancements

- [ ] Add export functionality (PNG, PDF, data)
- [ ] Pre-render raster tiles for faster loading
- [ ] Add comparison mode (compare two regions)
- [ ] Add temporal view (if historical data becomes available)
- [ ] Progressive Web App (PWA) capabilities
- [ ] Multi-language support (English, German)

## License

- **Data**: CC BY 4.0
- **Code**: MIT License
- **Maps**: © OpenStreetMap contributors, © CartoDB

## Support

For questions, issues, or contributions:
- Check the methodology page for data documentation
- See the about page for contact information
- Open an issue in the repository

---

**Version**: 1.0  
**Last Updated**: October 2025  
**Maintainer**: Erasmus University Rotterdam - IWI
