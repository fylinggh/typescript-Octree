import * as THREE from "three";
import { Octree } from './Octree';
import { Octant } from './Octant';

/**显示生成的八叉树 */
export class OctreePainter {
    private octree: Octree;
    private container: THREE.Object3D;
    private boxContainer: THREE.Group;
    constructor(octree: Octree, con: THREE.Object3D) {
        this.octree = octree;
        this.container = con;
        this.boxContainer = new THREE.Group();

        this.container.add(this.boxContainer);
    }

    drawRoot(visible: boolean) {
        if (this.boxContainer.children.length == 0) {
            this.drawItem(this.octree.root);
        }

        this.boxContainer.visible = !!visible;
    }

    public drawItem(octant: Octant, recursion: boolean = true) {
        let box = octant.box;
        let bh = new THREE.Box3Helper(box, new THREE.Color(0xff00ff));
        // @ts-ignore
        bh.material.depthTest = false;
        this.boxContainer.add(bh);

        if (recursion) {
            if (octant.children.length > 0) {
                octant.children.forEach(oct => {
                    this.drawItem(oct);
                })
            }
        }
    }

    public clear() {
        this.boxContainer.children.forEach(obj => {
            //@ts-ignore
            obj["geometry"].dispose();
            //@ts-ignore
            obj["material"].dispose();
        });

        this.boxContainer.children.splice(0, this.boxContainer.children.length);
    }
}
