import * as THREE from 'three';

export class ParametricGenerator {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Generate a simple L-bracket based on measurements
     * This is a starting point - can be expanded to generate more complex parts
     */
    generateBracket(measurements) {
        if (measurements.length < 2) {
            throw new Error('Need at least 2 measurements to generate bracket');
        }

        // Use first measurement for one dimension, second for another
        const width = measurements[0].distanceToNext;
        const height = measurements.length > 1 ? measurements[1].distanceToNext : width;
        const thickness = 0.01; // 1cm default thickness

        // Create an L-shaped bracket
        const group = new THREE.Group();

        // Horizontal part
        const horizontalGeometry = new THREE.BoxGeometry(width, thickness, thickness);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x4CAF50,
            roughness: 0.7,
            metalness: 0.3
        });
        const horizontalPart = new THREE.Mesh(horizontalGeometry, material);
        horizontalPart.position.set(width / 2, 0, 0);

        // Vertical part
        const verticalGeometry = new THREE.BoxGeometry(thickness, height, thickness);
        const verticalPart = new THREE.Mesh(verticalGeometry, material);
        verticalPart.position.set(0, height / 2, 0);

        group.add(horizontalPart);
        group.add(verticalPart);

        // Position the bracket at the first measurement point
        if (measurements.length > 0) {
            group.position.copy(measurements[0].position);
        }

        this.scene.add(group);
        return group;
    }

    /**
     * Generate a simple shim/spacer based on measurements
     */
    generateShim(measurements) {
        if (measurements.length < 1) {
            throw new Error('Need at least 1 measurement to generate shim');
        }

        const thickness = measurements[0].distanceToNext;
        const diameter = 0.02; // 2cm default diameter

        const geometry = new THREE.CylinderGeometry(diameter, diameter, thickness, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x2196F3,
            roughness: 0.7,
            metalness: 0.3
        });
        const shim = new THREE.Mesh(geometry, material);

        if (measurements.length > 0) {
            shim.position.copy(measurements[0].position);
        }

        this.scene.add(shim);
        return shim;
    }

    /**
     * Generate a parametric box with custom dimensions
     */
    generateBox(width, height, depth, thickness = 0.005) {
        const group = new THREE.Group();
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xFF9800,
            roughness: 0.7,
            metalness: 0.3,
            side: THREE.DoubleSide
        });

        // Bottom
        const bottom = new THREE.Mesh(
            new THREE.BoxGeometry(width, thickness, depth),
            material
        );
        bottom.position.y = thickness / 2;

        // Walls
        const wall1 = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, thickness),
            material
        );
        wall1.position.set(0, height / 2, depth / 2);

        const wall2 = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, thickness),
            material
        );
        wall2.position.set(0, height / 2, -depth / 2);

        const wall3 = new THREE.Mesh(
            new THREE.BoxGeometry(thickness, height, depth),
            material
        );
        wall3.position.set(width / 2, height / 2, 0);

        const wall4 = new THREE.Mesh(
            new THREE.BoxGeometry(thickness, height, depth),
            material
        );
        wall4.position.set(-width / 2, height / 2, 0);

        group.add(bottom, wall1, wall2, wall3, wall4);
        this.scene.add(group);
        return group;
    }
}

