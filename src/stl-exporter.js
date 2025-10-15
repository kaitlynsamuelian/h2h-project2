import * as THREE from 'three';

export class STLExporter {
    constructor() {}

    /**
     * Export a Three.js object to STL format (binary)
     */
    export(object, filename = 'model.stl') {
        const stlString = this.generateSTL(object);
        this.downloadSTL(stlString, filename);
    }

    generateSTL(object) {
        let output = '';

        // Header
        output += 'solid exported\n';

        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const geometry = child.geometry;
                const matrix = child.matrixWorld;

                if (geometry.isBufferGeometry) {
                    const vertices = geometry.attributes.position;
                    const indices = geometry.index;

                    if (indices !== null) {
                        // Indexed geometry
                        for (let i = 0; i < indices.count; i += 3) {
                            const a = indices.getX(i);
                            const b = indices.getX(i + 1);
                            const c = indices.getX(i + 2);

                            const vA = this.getVertex(vertices, a, matrix);
                            const vB = this.getVertex(vertices, b, matrix);
                            const vC = this.getVertex(vertices, c, matrix);

                            output += this.generateFacet(vA, vB, vC);
                        }
                    } else {
                        // Non-indexed geometry
                        for (let i = 0; i < vertices.count; i += 3) {
                            const vA = this.getVertex(vertices, i, matrix);
                            const vB = this.getVertex(vertices, i + 1, matrix);
                            const vC = this.getVertex(vertices, i + 2, matrix);

                            output += this.generateFacet(vA, vB, vC);
                        }
                    }
                }
            }
        });

        output += 'endsolid exported\n';
        return output;
    }

    getVertex(vertices, index, matrix) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(vertices, index);
        vertex.applyMatrix4(matrix);
        return vertex;
    }

    generateFacet(vA, vB, vC) {
        // Calculate normal
        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();
        cb.subVectors(vC, vB);
        ab.subVectors(vA, vB);
        cb.cross(ab);
        cb.normalize();

        let output = '';
        output += `  facet normal ${cb.x.toExponential()} ${cb.y.toExponential()} ${cb.z.toExponential()}\n`;
        output += '    outer loop\n';
        output += `      vertex ${vA.x.toExponential()} ${vA.y.toExponential()} ${vA.z.toExponential()}\n`;
        output += `      vertex ${vB.x.toExponential()} ${vB.y.toExponential()} ${vB.z.toExponential()}\n`;
        output += `      vertex ${vC.x.toExponential()} ${vC.y.toExponential()} ${vC.z.toExponential()}\n`;
        output += '    endloop\n';
        output += '  endfacet\n';

        return output;
    }

    downloadSTL(stlString, filename) {
        const blob = new Blob([stlString], { type: 'text/plain' });
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    /**
     * Export to binary STL (more compact, better for 3D printers)
     */
    exportBinary(object, filename = 'model.stl') {
        const triangles = this.getTriangles(object);
        const buffer = new ArrayBuffer(80 + 4 + triangles.length * 50);
        const view = new DataView(buffer);

        // Header (80 bytes)
        for (let i = 0; i < 80; i++) {
            view.setUint8(i, 0);
        }

        // Number of triangles
        view.setUint32(80, triangles.length, true);

        let offset = 84;
        triangles.forEach((triangle) => {
            // Normal
            view.setFloat32(offset, triangle.normal.x, true);
            view.setFloat32(offset + 4, triangle.normal.y, true);
            view.setFloat32(offset + 8, triangle.normal.z, true);
            offset += 12;

            // Vertices
            for (let i = 0; i < 3; i++) {
                view.setFloat32(offset, triangle.vertices[i].x, true);
                view.setFloat32(offset + 4, triangle.vertices[i].y, true);
                view.setFloat32(offset + 8, triangle.vertices[i].z, true);
                offset += 12;
            }

            // Attribute byte count
            view.setUint16(offset, 0, true);
            offset += 2;
        });

        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    getTriangles(object) {
        const triangles = [];

        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const geometry = child.geometry;
                const matrix = child.matrixWorld;

                if (geometry.isBufferGeometry) {
                    const vertices = geometry.attributes.position;
                    const indices = geometry.index;

                    const processTriangle = (a, b, c) => {
                        const vA = this.getVertex(vertices, a, matrix);
                        const vB = this.getVertex(vertices, b, matrix);
                        const vC = this.getVertex(vertices, c, matrix);

                        const cb = new THREE.Vector3();
                        const ab = new THREE.Vector3();
                        cb.subVectors(vC, vB);
                        ab.subVectors(vA, vB);
                        cb.cross(ab);
                        cb.normalize();

                        triangles.push({
                            normal: cb,
                            vertices: [vA, vB, vC]
                        });
                    };

                    if (indices !== null) {
                        for (let i = 0; i < indices.count; i += 3) {
                            processTriangle(
                                indices.getX(i),
                                indices.getX(i + 1),
                                indices.getX(i + 2)
                            );
                        }
                    } else {
                        for (let i = 0; i < vertices.count; i += 3) {
                            processTriangle(i, i + 1, i + 2);
                        }
                    }
                }
            }
        });

        return triangles;
    }
}

