import * as THREE from "three";
import { IOctData } from './OctData';
import { Octant } from './Octant';
import { Octree } from './Octree';


export class OctreeFroObject3d {
    public data: Map<number, IOctData>; // object3d => IOctData
    public octree: Octree;

    constructor(octree: Octree) {
        this.data = new Map<number, IOctData>();
        this.octree = octree;
    }

    /**添加 */
    add(obj: THREE.Object3D) {
        let box = new THREE.Box3().setFromObject(obj);
        let octData = this.octree.createOctData(box, obj);
        octData = this.octree.addTo(octData);

        this.data.set(obj.id, octData);
    }

    /**删除 */
    remove(obj: THREE.Object3D) {
        let octData = this.data.get(obj.id) as IOctData;
        this.octree.remove(octData.uniqueId);

        this.data.delete(obj.id);
    }
}