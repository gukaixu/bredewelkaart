# Pixel-Level Visualization

The Brede Welkaart web application now supports pixel-level visualization (100m resolution) using pre-rendered web map tiles.

## Implementation

### Tile Generation
Web map tiles are generated from the capital raster files using `scripts/generate_web_tiles.py`:

```bash
cd /Users/kees/Library/CloudStorage/OneDrive-ErasmusUniversityRotterdam/EUR/iwi
source venv/bin/activate
python scripts/generate_web_tiles.py
```

**Source Files:**
- `outputs/maps/total_capital_2023_100m.tif`
- `outputs/maps/natural_capital_2023_100m.tif`
- `outputs/maps/produced_capital_2023_100m.tif`
- `outputs/maps/human_capital_2023_100m.tif`

**Output Location:**
- `web/data/tiles/{capital_type}/tiles/`

**Tile Specifications:**
- Format: PNG with transparency (RGBA)
- Zoom levels: 7-13
- Classification: 3-class tertiles (Laag, Gemiddeld, Hoog)
- Opacity: 70%
- Total size: ~275 MB (63-73 MB per capital type)

### Color Schemes
Each capital type uses a 3-class color scheme:
- **Total Capital**: Blue gradient (#c6dbef → #6baed6 → #08519c)
- **Natural Capital**: Green gradient (#c7e9c0 → #74c476 → #238b45)
- **Produced Capital**: Blue gradient (same as total)
- **Human Capital**: Orange gradient (#fdd0a2 → #fd8d3c → #a63603)

### Web Integration
The pixel level is integrated into the web app as a fourth "Niveau" option:
- **Provincie**: Aggregated provincial boundaries
- **Gemeente**: Aggregated municipal boundaries
- **Wijk**: Aggregated district boundaries
- **Pixel (100m)**: 100-meter resolution raster tiles

**Behavior:**
- When "Pixel (100m)" is selected, the app loads pre-rendered tiles via Leaflet's `TileLayer`
- Scale options (Per Inwoner, Per Hectare, Aandeel %) are disabled at pixel level
- Capital type switching dynamically reloads the appropriate tile set
- No clickable regions or statistics at pixel level (purely visual)

## Technical Details

### Tile Format (XYZ)
Standard web map tile format:
```
web/data/tiles/{capital_type}/tiles/{z}/{x}/{y}.png
```

### Leaflet Integration
```javascript
const tileUrl = `data/tiles/${currentCapitalType}/tiles/{z}/{x}/{y}.png`;

currentRasterLayer = L.tileLayer(tileUrl, {
    minZoom: 7,
    maxZoom: 13,
    opacity: 0.7,
    attribution: 'Pixel-niveau: 100m rasters'
});
```

### Advantages
✅ **Fast loading**: Progressive tile loading (only visible tiles are fetched)
✅ **Smooth zooming**: Pre-rendered at multiple zoom levels
✅ **Browser-friendly**: Standard PNG images, no specialized libraries
✅ **Cacheable**: Browser can cache individual tiles
✅ **Scalable**: Works well even with large datasets

### Limitations
⚠ **Static colors**: Colors are pre-rendered (cannot dynamically adjust)
⚠ **No interaction**: Pixel values cannot be queried on click
⚠ **Disk space**: Requires ~275 MB for all tile sets
⚠ **Regeneration**: Must rerun script if source rasters change

## Updating Tiles
If the source raster files are updated:

1. Regenerate the tiles:
   ```bash
   python scripts/generate_web_tiles.py
   ```

2. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)

3. Reload the web application

## Performance
- **Initial load**: <1 second (only visible tiles)
- **Zoom transition**: Instant (tiles pre-rendered)
- **Capital switch**: <500ms (new tile set)
- **Memory usage**: Minimal (tiles loaded on-demand)

## Future Enhancements
Potential improvements:
- Add pixel value display on hover (requires additional GeoTIFF API)
- Support additional zoom levels (14-16 for urban detail)
- Add continuous color scale option
- Implement client-side reclassification

