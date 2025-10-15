# AR Repair Kit Generator

An AR-based measurement tool that generates 3D-printable repair parts using WebXR and Three.js.

## 🎯 Project Goal

Use phone AR to measure broken objects, generate parametric repair parts in-browser, and export for 3D printing or laser cutting.

## 🚀 Current Status: MVP Phase 1

**What works now:**
- ✅ WebXR AR session initialization
- ✅ AR measurement system (tap to place points)
- ✅ Real-time distance calculation between points
- ✅ Simple parametric bracket generation
- ✅ STL export (ASCII and binary formats)

**What's next:**
- 🔜 ArUco marker detection for better alignment
- 🔜 More parametric shapes (shims, clips, brackets)
- 🔜 Improved UI for shape selection
- 🔜 NeRF/PolyCam integration for complex geometry
- 🔜 AI-suggested repair strategies

## 📁 Project Structure

```
h2h-project2/
├── index.html              # Main HTML with UI
├── package.json            # Dependencies
├── src/
│   ├── main.js            # Main application logic
│   ├── ar-measurement.js  # AR measurement & hit testing
│   ├── parametric-generator.js  # Parametric shape generation
│   └── stl-exporter.js    # STL export functionality
└── README.md              # This file
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- A WebXR-compatible device (Android phone with Chrome/Edge, or iPhone with WebXR Viewer)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server will start on `http://localhost:5173` (or similar).

### Testing on Mobile

1. Make sure your phone and computer are on the same network
2. Note the local IP address shown in the terminal (e.g., `http://192.168.1.x:5173`)
3. Open that URL on your phone's browser
4. Grant camera permissions when prompted
5. Tap "Enter AR" to start

## 📱 How to Use

1. **Enter AR Mode**: Tap the "Enter AR" button
2. **Take Measurements**: 
   - Point your phone at a surface
   - Tap to place measurement points
   - Measurements appear between consecutive points
3. **Generate Part**: 
   - Once you have 2+ measurements, tap "Generate Repair Part"
   - A parametric bracket will be created based on your measurements
4. **Export STL**: 
   - Tap "Export STL" to download the 3D model
   - Import into your slicer software (Cura, PrusaSlicer, etc.)
5. **3D Print**: Print your custom repair part!

## 🔧 Technical Architecture

### Core Technologies
- **Three.js**: 3D rendering and geometry
- **WebXR Device API**: AR session management
- **Hit Test API**: Surface detection in AR
- **Custom STL Exporter**: Converts Three.js meshes to printable files

### Key Components

#### ARMeasurement (`ar-measurement.js`)
- Manages WebXR session
- Handles hit testing (surface detection)
- Places measurement points and calculates distances
- Renders visual feedback (reticle, points, lines)

#### ParametricGenerator (`parametric-generator.js`)
- Generates 3D geometry based on measurements
- Currently supports: brackets, shims, boxes
- Easy to extend with new parametric shapes

#### STLExporter (`stl-exporter.js`)
- Exports Three.js objects to STL format
- Supports both ASCII and binary STL
- Handles geometry traversal and transformation

## 🎨 Customization Ideas

### Add New Parametric Shapes

Edit `src/parametric-generator.js`:

```javascript
generateCustomPart(measurements) {
    // Your custom geometry logic here
    const width = measurements[0].distanceToNext;
    const geometry = new THREE.BoxGeometry(width, 0.01, 0.01);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    return mesh;
}
```

### Improve Measurement Accuracy

- Add ArUco marker detection for reference points
- Implement multi-view measurement averaging
- Add manual dimension adjustment UI

### Add Material Properties

- Specify infill percentage for 3D printing
- Set wall thickness parameters
- Add support structure generation

## 🐛 Troubleshooting

**"AR not supported" message:**
- Ensure you're using a compatible browser (Chrome/Edge on Android, or WebXR Viewer on iOS)
- Check that you're on HTTPS or localhost (WebXR requires secure context)

**Camera not working:**
- Grant camera permissions when prompted
- Check browser settings if permissions were previously denied

**Measurements seem inaccurate:**
- Ensure good lighting conditions
- Hold phone steady when placing points
- Try placing points on high-contrast surfaces

**STL export fails:**
- Make sure you've generated a part first
- Check browser console for error details

## 📚 Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [STL File Format](https://en.wikipedia.org/wiki/STL_(file_format))
- [OpenSCAD](https://openscad.org/) - For inspiration on parametric CAD

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- [x] Basic AR measurement
- [x] Simple parametric shapes
- [x] STL export
- [ ] Test with real 3D print

### Phase 2: Enhanced Measurement
- [ ] ArUco marker integration
- [ ] Multiple shape templates
- [ ] UI for shape selection
- [ ] Dimension editing interface

### Phase 3: Advanced Features
- [ ] NeRF/PolyCam scan integration
- [ ] AI-suggested repair strategies
- [ ] Multi-material support
- [ ] Cloud save/share functionality

### Phase 4: Production Ready
- [ ] Comprehensive error handling
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Documentation and tutorials

## 📝 License

MIT

---

**Happy Making! 🛠️✨**

