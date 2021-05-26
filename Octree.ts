import * as THREE from "three";
import { Octant } from './Octant';
import { IOctData } from './OctData';
import { OctreeDealer } from './OctreeDealer';

// 八叉树
export class Octree {
    /**根节点 */
    private _root: Octant;
    /**最大深度 */
    private maxDepth: number;
    /**管理数据对象 */
    public octreeDealer: OctreeDealer;

    public get root() {
        return this._root;
    }
    /**
     * 初始化
     * @param min 最小对角点 
     * @param max 最大对角点
     * @param maxDepth 最大深度
     */
    constructor(min: THREE.Vector3, max: THREE.Vector3, maxDepth: number) {
        this._root = new Octant(min, max, 1);
        this.maxDepth = maxDepth;
        this.octreeDealer = new OctreeDealer(this);
    }

    /**增加到八叉树中 */
    addTo(data: IOctData): IOctData {
        return this.add(data, this._root);
    }

    /**增加元素到节点 */
    add(data: IOctData, octant: Octant): IOctData {
        let octData: IOctData;
        if (octant.children.length == 0 && octant.data.length == 0) { // 新开的链
            octData = octant.add(data); // 添加到该链
            this.octreeDealer.Set(octData, octant);
        } else {
            if (octant.depthLevel == this.maxDepth) { // 达到了最大深度，不再向下细分
                octData = octant.add(data);
                this.octreeDealer.Set(octData, octant);
            } else { // 没有达到最大深度，则要创建子链
                if (octant.children.length == 0) { // 创建子链
                    octant.split(); // 创建子链
                    // octant.children.length == 8;
                    if (octant.data.length > 0) { // 处理已经存在的数据
                        let odata = octant.data.shift() as IOctData;
                        if (octant.data.length != 0) throw "error,新创建链时就应该数据为1";
                        octData = this.add(odata, octant);
                    }
                }

                // 找到容纳的第一个子链
                let hasOct = octant.children.find(oct => oct.contain(data));// 子链是否能容纳data

                if (hasOct == undefined) { // 子链不能添加，则添加到自身
                    octData = octant.add(data); // 添加到自身
                    this.octreeDealer.Set(octData, octant);
                } else { // 有能包含的子链
                    octData = this.add(data, hasOct);
                }
            }
        }

        return octData;
    }

    /**移除id所标识的数据 */
    remove(uniqueId: number): void {
        let data = this.octreeDealer.GetData(uniqueId); // 查询到uniqueId所绑定的octant
        if (!data) throw `${uniqueId}:在八叉树中不存在这个惟一Id所标识的元素`;

        data.octant.remove(data.octdata);
        this.octreeDealer.DelData(uniqueId);
    }

    // 在八叉树中查找与data存在相交的所有数据
    intersect(data: THREE.Box3 | THREE.Sphere | THREE.Frustum | THREE.Ray | THREE.Line3 | THREE.Vector3, octant: Octant): IOctData[] {
        if (!octant.intersectByOctant(data)) return []; // 与当前链不相交/包含

        let arr: IOctData[] = []; // 相交的元素集合
        if (octant.data.length > 0) { // 本链上的数据与data是否相交
            octant.data.forEach(dt => {
                if (octant.intersect(dt, data)) { // 两个data是否相交
                    arr.push(dt);
                }
            });
        }

        if (octant.children.length > 0) { // 子链上的数据
            octant.children.forEach(oct => {
                let as = this.intersect(data, oct);
                if (as.length > 0) {
                    arr.push(...as);
                }
            });
        }

        return arr;
    }

    /**相交的叶节点 */
    intersectOctants(data: THREE.Box3 | THREE.Sphere | THREE.Frustum | THREE.Ray | THREE.Line3 | THREE.Vector3, octant: Octant): Octant[] {
        if (!octant.intersectByOctant(data)) return []; // 与当前链不相交/包含

        let arr = [];
        if (octant.children.length > 0) { // 子链上的数据
            octant.children.forEach(oct => {
                let as = this.intersectOctants(data, oct);
                if (as.length > 0) {
                    arr.push(...as);
                }
            });
        } else {
            arr.push(octant);
        }

        return arr;
    }

    /**与八叉树相交的元素 */
    intersectBy(data: THREE.Box3 | THREE.Sphere | THREE.Frustum | THREE.Ray | THREE.Line3 | THREE.Vector3): IOctData[] {
        return this.intersect(data, this._root);
    }

    /**投射相交 */
    raycast(ray: THREE.Ray): IOctData[] {
        return this.intersect(ray, this._root);
    }

    /**收缩空链 */
    shrink(octant: Octant): void {
        if (octant.children.length > 0) { // 叶节点为的children.length为0，不会进来
            octant.children.forEach(oct => {
                this.shrink(oct);
            });

            let hasOcts = octant.children.filter(oct => {
                return oct.data.length > 0
            });

            if (hasOcts.length == 0) { // 子节点没有数据则收缩
                octant.unsplit();
            }
        }
    }

    /**创建IOctData数据 */
    public createOctData(test: any, data: any): IOctData {
        return { test: test, data: data, uniqueId: -1 } as IOctData;
    }
}
