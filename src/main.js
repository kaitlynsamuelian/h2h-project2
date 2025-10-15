import * as THREE from 'three';
import { ARMeasurement } from './ar-measurement.js';
import { ParametricGenerator } from './parametric-generator.js';
import { STLExporter } from './stl-exporter.js';

class ARRepairKitApp {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.statusEl = document.getElementById('status');
        this.measurementsEl = document.getElementById('measurements');
        
        this.arButton = document.getElementById('ar-button');
        this.clearButton = document.getElementById('clear-button');
        this.generateButton = document.getElementById('generate-button');
        this.exportButton = document.getElementById('export-button');

        this.measurements = [];
        this.generatedPart = null;

        this.init();
    }

    async init() {
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.01,
            100
        );

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.xr.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Initialize AR measurement system
        this.arMeasurement = new ARMeasurement(this.scene, this.renderer);
        this.parametricGenerator = new ParametricGenerator(this.scene);
        this.stlExporter = new STLExporter();

        // Check WebXR support
        await this.checkARSupport();

        // Setup event listeners
        this.setupEventListeners();

        // Start render loop
        this.renderer.setAnimationLoop(() => this.render());

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    async checkARSupport() {
        if ('xr' in navigator) {
            try {
                const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
                if (isSupported) {
                    this.arButton.style.display = 'block';
                    this.statusEl.textContent = 'AR Ready - Tap "Enter AR" to start';
                } else {
                    this.statusEl.textContent = 'AR not supported on this device';
                    this.statusEl.style.color = '#ff9800';
                }
            } catch (error) {
                console.error('Error checking AR support:', error);
                this.statusEl.textContent = 'Error checking AR support';
                this.statusEl.style.color = '#f44336';
            }
        } else {
            this.statusEl.textContent = 'WebXR not available (try on mobile)';
            this.statusEl.style.color = '#ff9800';
        }
    }

    setupEventListeners() {
        this.arButton.addEventListener('click', () => this.startAR());
        this.clearButton.addEventListener('click', () => this.clearMeasurements());
        this.generateButton.addEventListener('click', () => this.generateRepairPart());
        this.exportButton.addEventListener('click', () => this.exportSTL());

        // Listen for measurement updates
        this.arMeasurement.onMeasurementUpdate = (measurements) => {
            this.measurements = measurements;
            this.updateMeasurementsDisplay();
            
            if (measurements.length >= 2) {
                this.clearButton.classList.remove('hidden');
                this.generateButton.classList.remove('hidden');
            }
        };
    }

    async startAR() {
        try {
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.getElementById('ui-overlay') }
            });

            await this.renderer.xr.setSession(session);
            this.arButton.classList.add('hidden');
            this.statusEl.textContent = 'AR Active - Tap to measure';
            
            this.arMeasurement.startSession(session);

            session.addEventListener('end', () => {
                this.arButton.classList.remove('hidden');
                this.statusEl.textContent = 'AR Ended';
            });

        } catch (error) {
            console.error('Error starting AR:', error);
            this.statusEl.textContent = 'Failed to start AR: ' + error.message;
            this.statusEl.style.color = '#f44336';
        }
    }

    clearMeasurements() {
        this.arMeasurement.clearMeasurements();
        this.measurements = [];
        this.updateMeasurementsDisplay();
        this.clearButton.classList.add('hidden');
        this.generateButton.classList.add('hidden');
        this.exportButton.classList.add('hidden');
        
        if (this.generatedPart) {
            this.scene.remove(this.generatedPart);
            this.generatedPart = null;
        }
    }

    updateMeasurementsDisplay() {
        if (this.measurements.length === 0) {
            this.measurementsEl.innerHTML = '';
            return;
        }

        let html = '<div style="margin-top: 8px;">Measurements:</div>';
        
        for (let i = 0; i < this.measurements.length - 1; i++) {
            const distance = this.measurements[i].distanceToNext;
            html += `<div class="measurement-item">
                Point ${i + 1} → ${i + 2}: ${(distance * 100).toFixed(1)} cm
            </div>`;
        }

        this.measurementsEl.innerHTML = html;
    }

    generateRepairPart() {
        if (this.measurements.length < 2) {
            alert('Need at least 2 measurement points');
            return;
        }

        // Clear previous part
        if (this.generatedPart) {
            this.scene.remove(this.generatedPart);
        }

        // Generate parametric part based on measurements
        this.generatedPart = this.parametricGenerator.generateBracket(this.measurements);
        
        this.statusEl.textContent = 'Repair part generated!';
        this.statusEl.style.color = '#4CAF50';
        this.exportButton.classList.remove('hidden');
    }

    exportSTL() {
        if (!this.generatedPart) {
            alert('Generate a part first');
            return;
        }

        try {
            this.stlExporter.export(this.generatedPart, 'repair-part.stl');
            this.statusEl.textContent = 'STL exported successfully!';
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export STL: ' + error.message);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.arMeasurement.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize app when DOM is ready
new ARRepairKitApp();

