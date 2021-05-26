import { Octant } from './Octant';
import { IOctData } from "./OctData";
import { Octree } from "./Octree";

// 快速查找的数据
export interface IOctantDataMapType {
    octdata: IOctData; // 数据
    octant: Octant; // 八叉树节点
}

export class OctreeDealer {
    /**八叉树 */
    private octree: Octree;

    /**惟一id => [数据,所属Octant] */
    private octantDataMap: Map<number, IOctantDataMapType>;

    constructor(tree: Octree) {
        this.octree = tree;
        this.octantDataMap = new Map<number, IOctantDataMapType>();
    }

    /**添加数据与octant的绑定关系 */
    public Set(octData: IOctData, octant: Octant) {
        this.SetData(octData.uniqueId, { octdata: octData, octant: octant });
    }

    /**获取data与其所在的Octant */
    public GetData(uniqueId: number): IOctantDataMapType {
        return this.octantDataMap.get(uniqueId) as IOctantDataMapType;
    }

    /**设置data与其所在的Octant */
    private SetData(uniqueId: number, v: IOctantDataMapType) {
        this.octantDataMap.set(uniqueId, v);
    }

    /**删除数据 */
    public DelData(uniqueId: number) {
        this.octantDataMap.delete(uniqueId);
    }
}