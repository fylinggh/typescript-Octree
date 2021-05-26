import * as THREE from "three";
import { Box3 } from "three";
import { IOctData } from './OctData';

/**数据类型 */
export type OctantDataType = THREE.Box3 | THREE.Sphere | THREE.Frustum | THREE.Line3 | THREE.Ray;

export class Octant {
    /**子节点 */
    children: Octant[] = [];
    /**本节点存储的数据 */
    data: IOctData[] = [];
    min: THREE.Vector3;
    max: THREE.Vector3;
    /**递增的uniqueid，每个元素一个惟一的id */
    static incrUniqueId: number = 1;
    /**当前深度 */
    depthLevel: number;
    constructor(min: THREE.Vector3, max: THREE.Vector3, depthLevel: number) {
        this.min = min.clone();
        this.max = max.clone();
        this.depthLevel = depthLevel;
    }

    /**获取中心点 */
    get Center() {
        return new THREE.Vector3().lerpVectors(this.min, this.max, 0.5);
    }

    /**分割成8个区域 */
    split() {
        let center = this.Center;

        let boxes = new Array<THREE.Box3>(8);

        boxes[0] = new THREE.Box3(this.min.clone(), center.clone());
        boxes[1] = new THREE.Box3(new THREE.Vector3(center.x, this.min.y, this.min.z), new THREE.Vector3(this.max.x, center.y, center.z));
        boxes[2] = new THREE.Box3(new THREE.Vector3(center.x, center.y, this.min.z), new THREE.Vector3(this.max.x, this.max.y, center.z));
        boxes[3] = new THREE.Box3(new THREE.Vector3(this.min.x, center.y, this.min.z), new THREE.Vector3(center.x, this.max.y, center.z));

        boxes[4] = new THREE.Box3(new THREE.Vector3(this.min.x, this.min.y, center.z), new THREE.Vector3(center.x, center.y, this.max.z));
        boxes[5] = new THREE.Box3(new THREE.Vector3(center.x, this.min.y, center.z), new THREE.Vector3(this.max.x, center.y, this.max.z));
        boxes[6] = new THREE.Box3(new THREE.Vector3(center.x, center.y, center.z), new THREE.Vector3(this.max.x, this.max.y, this.max.z));
        boxes[7] = new THREE.Box3(new THREE.Vector3(this.min.x, center.y, center.z), new THREE.Vector3(center.x, this.max.y, this.max.z));

        boxes.forEach(b => {
            this.children.push(new Octant(b.min, b.max, this.depthLevel + 1));
        });
    }

    /**移除子链 */
    unsplit() {
        if (this.children.length > 0) { // 清空子链
            this.children.forEach(oct => oct.dispose());
            this.children = [];
        }
    }

    /**释放 */
    dispose() {

    }

    // 包含当前octant是否容纳data
    contain(data: IOctData | THREE.Box3 | THREE.Sphere | THREE.Frustum | THREE.Line3 | THREE.Vector3): boolean {
        let isContain: boolean = false;

        // 当前octant是否容纳 data
        let box = this.box;

        //@ts-ignore
        let realData = this.isIOctData(data) ? data.test : data;

        if (realData instanceof THREE.Box3) { // 包围盒
            isContain = box.containsBox(realData);
        } else if (realData instanceof THREE.Sphere) { // 包围球
            let bBox = realData.getBoundingBox(new THREE.Box3);
            isContain = box.containsBox(bBox);
        } else if (realData instanceof THREE.Frustum) {
            isContain = realData.intersectsBox(box);
        } else if (realData instanceof THREE.Line3) {
            isContain = box.containsPoint(realData.start) && box.containsPoint(realData.end);
        } else if (realData instanceof THREE.Vector3) {
            isContain = box.containsPoint(realData);
        } else {
            isContain = false;
        }

        return isContain;
    }

    /**盒子与线的交点 */
    private intersectLine(box: THREE.Box3, line: THREE.Line3) {
        if (box.containsPoint(line.start) || box.containsPoint(line.end)) { // 端点在包围盒内部，则相交
            return true;
        } else {
            let dir = new THREE.Vector3().subVectors(line.end, line.start).normalize();
            let ray = new THREE.Ray(line.start, dir);
            let intersectPt = ray.intersectBox(box, new THREE.Vector3());
            if (intersectPt) { // 射线与包围盒有交点
                let dis1 = line.start.distanceToSquared(intersectPt);
                let dis2 = line.start.distanceToSquared(line.end);

                if (dis1 <= dis2) { // 交点在线上，则相交
                    return true;
                }
            }
        }

        return false;
    }

    // 两个元素是否相交
    intersect(data1: any, data2: any): boolean {
        let data4 = this.isIOctData(data1) ? data1.test : data1;
        let data3 = this.isIOctData(data2) ? data2.test : data2;

        if (data4 instanceof THREE.Box3) {
            if (data3 instanceof THREE.Box3) {
                return data4.intersectsBox(data3);
            } else if (data3 instanceof THREE.Sphere) {
                return data4.intersectsSphere(data3);
            } else if (data3 instanceof THREE.Frustum) {
                return data3.intersectsBox(data4);
            } else if (data3 instanceof THREE.Ray) {
                return data3.intersectsBox(data4);
            } else if (data3 instanceof THREE.Line3) {
                return this.intersectLine(data4, data3);
            } else if (data3 instanceof THREE.Vector3) {
                return data4.containsPoint(data3);
            }
        } else if (data4 instanceof THREE.Sphere) {
            if (data3 instanceof THREE.Box3) {
                return data4.intersectsBox(data3);
            } else if (data3 instanceof THREE.Sphere) {
                return data4.intersectsSphere(data3);
            } else if (data3 instanceof THREE.Frustum) {
                return data3.intersectsSphere(data4);
            }
        } else if (data4 instanceof THREE.Frustum) {
            if (data3 instanceof THREE.Box3) {
                return data4.intersectsBox(data3);
            } else if (data3 instanceof THREE.Sphere) {
                return data4.intersectsSphere(data3);
            }
        } else if (data4 instanceof THREE.Vector3) {
            if (data3 instanceof THREE.Box3) {
                return data3.containsPoint(data4);
            } else if (data3 instanceof THREE.Sphere) {
                return data4.distanceToSquared(data3.center) <= data3.radius * data3.radius;
            } else if (data3 instanceof THREE.Frustum) {
                return data3.containsPoint(data4);
            } else if (data3 instanceof THREE.Ray) {
                return data3.distanceToPoint(data4) <= 1e-8;
            } else if (data3 instanceof THREE.Line3) {
                let dd = data3.closestPointToPointParameter(data4, false);
                return dd >= 0 && dd <= 1;
            }
        }

        console.log("无法识别的两种类型,不能求交: ", data1, ",", data3);
        return false;
    }

    // 相交与包含
    intersectByOctant(data: any): boolean {
        if (this.contain(data)) return true; // 完全包含
        else if (this.intersect(this.box, data)) return true; // 相交
        else return false; // 不相交也不包含
    }

    /**获取包围盒 */
    get box(): THREE.Box3 {
        return new THREE.Box3(this.min, this.max);
    }

    /**添加元素 */
    add(data: IOctData): IOctData {
        if (data.uniqueId == -1) {
            data.uniqueId = Octant.incrUniqueId++;
        }
        this.data.push(data);

        return this.data[this.data.length - 1];
    }

    /**移除元素 */
    remove(dataOrUniqueId: IOctData | number) {
        // @ts-ignore
        let uniqueId = this.isIOctData(dataOrUniqueId) ? dataOrUniqueId.uniqueId : dataOrUniqueId;
        let ix = this.data.findIndex(x => x.uniqueId == uniqueId);

        this.data.splice(ix, 1); // 删除
    }

    /**是否是IOctData接口 */
    isIOctData(data: IOctData | any): boolean {
        let v = typeof (data as IOctData)['uniqueId'] !== 'undefined';
        return v;
    }
}