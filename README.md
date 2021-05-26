# typescript-Octree
a simple typescript octree implementation based on threejs（一种简单的基于threejs的八叉树）

# 示例
// let scene = new THREE.Scene();

// ...



let min = new THREE.Vector3(0, 0, 0); // 下限

let max = new THREE.Vector3(40, 40, 40); // 上限

let octree = new Octree(min, max, 5); // 下限, 上限, 深度

let octreeHelper = new OctreeFroObject3d(octree); // 辅助创建object3d八叉树

let octreePainter = new OctreePainter(octree, scene); // 绘制八叉树

// let objs = new Array<THREE.Object3d>();

objs.forEach(obj => {

  octreeHelper.add(obj); // 添加对象
  
  //或
  
  //octree.addTo(octree.createOctData(obj.box, obj)); // 添加对象
  
});

octreePainter.drawRoot(true); // 绘制八叉树

//
// let octdata = octree.raycast(ray); // 投射

// octdata.forEach(octd => {

//    let obj = (octd.data as THREE.Object3d) // 相交的每个对象执行操作

// });



// octree.intersect(abox, octree.root); // 与box相交的

// octree.intersect(afrustum, octree.root); // 与frustum相交的
