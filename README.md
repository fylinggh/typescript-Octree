# typescript-Octree
a simple typescript octree implementation based on threejs（一种简单的基于threejs的八叉树）

# 示例
// let scene = new THREE.Scene();
// ...

let min = new THREE.Vector3(0, 0, 0);
let max = new THREE.Vector3(40, 40, 40);

let octree = new Octree(min, max, 5);
let octreeHelper = new OctreeFroObject3d(octree);
let octreePainter = new OctreePainter(octree, scene);

// let objs = new Array<THREE.Object3d>();
objs.forEach(obj => {
  octreeHelper.add(obj);
});

octreePainter.drawRoot(true);

//
// let octdata = octree.raycast(ray);
// octdata.forEach(octd => {
//    let obj = (octd.data as THREE.Object3d)
// });



// octree.intersect(abox, octree.root);
// octree.intersect(afrustum, octree.root);
// 
//


