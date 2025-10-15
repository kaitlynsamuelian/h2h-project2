import * as THREE from 'three';

export class ARMeasurement {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.session = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
        
        this.points = [];
        this.measurements = [];
        this.lines = [];
        this.reticle = null;
        
        this.onMeasurementUpdate = null;

        this.createReticle();
    }

    createReticle() {
        // Visual indicator for where user is pointing
        const geometry = new THREE.RingGeometry(0.015, 0.02, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            side: THREE.DoubleSide 
        });
        this.reticle = new THREE.Mesh(geometry, material);
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);
    }

    async startSession(session) {
        this.session = session;
        
        // Setup input source for tap detection
        this.session.addEventListener('select', (event) => this.onSelect(event));
        
        // Request hit test source
        const viewerSpace = await this.session.requestReferenceSpace('viewer');
        this.hitTestSourceRequested = true;
        
        this.session.requestHitTestSource({ space: viewerSpace }).then((source) => {
            this.hitTestSource = source;
        });
    }

    onSelect(event) {
        if (!this.reticle.visible) return;

        // Place a measurement point at the reticle position
        const pointGeometry = new THREE.SphereGeometry(0.01, 16, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        
        point.position.setFromMatrixPosition(this.reticle.matrix);
        this.scene.add(point);
        this.points.push(point);

        // If we have at least 2 points, draw a line and calculate distance
        if (this.points.length >= 2) {
            const prevPoint = this.points[this.points.length - 2];
            const currPoint = this.points[this.points.length - 1];
            
            const distance = prevPoint.position.distanceTo(currPoint.position);
            
            // Create line between points
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                prevPoint.position,
                currPoint.position
            ]);
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0xffffff,
                linewidth: 2 
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
            this.lines.push(line);

            // Store measurement
            this.measurements.push({
                index: this.points.length - 2,
                position: prevPoint.position.clone(),
                distanceToNext: distance
            });
        }

        // If this is not the first point, update the last measurement
        if (this.points.length >= 2 && this.onMeasurementUpdate) {
            this.onMeasurementUpdate(this.measurements);
        }
    }

    update() {
        if (!this.session) return;

        const frame = this.renderer.xr.getFrame();
        if (!frame) return;

        if (this.hitTestSourceRequested && this.hitTestSource) {
            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const hitTestResults = frame.getHitTestResults(this.hitTestSource);

            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(referenceSpace);

                if (pose) {
                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray(pose.transform.matrix);
                }
            } else {
                this.reticle.visible = false;
            }
        }
    }

    clearMeasurements() {
        // Remove all points
        this.points.forEach(point => this.scene.remove(point));
        this.points = [];

        // Remove all lines
        this.lines.forEach(line => this.scene.remove(line));
        this.lines = [];

        // Clear measurements
        this.measurements = [];
    }

    getMeasurements() {
        return this.measurements;
    }
}

