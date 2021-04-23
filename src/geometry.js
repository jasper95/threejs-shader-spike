import * as THREE from 'three';

export class Point {
  constructor({ x, y, z, life }) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.life = life;
  }

  midpoint(pt2) {
    // const pt1 = this;
    // const x = (pt1.x+pt2.x)/2
    // const y = (pt1.y+pt2.y)/2
    // const z = (pt1.z+pt2.z)/2
    // const life = pt1.life + pt2.life;
    const pt1 = this;
    if (pt1.x === pt2.x && pt1.y === pt2.y && pt1.z === pt2.z) return pt1.clone();
    const d = Math.sqrt((pt2.x - pt1.x) ** 2 + (pt2.y - pt1.y) ** 2 + (pt2.z - pt1.z) ** 2);
    const ratio = d / 2 / d;
    const x = (1 - ratio) * pt1.x + ratio * pt2.x;
    const y = (1 - ratio) * pt1.y + ratio * pt2.y;
    const z = (1 - ratio) * pt1.z + ratio * pt2.z;
    const life = (1 - ratio) * pt1.life + ratio * pt2.life;
    return new Point({x, y, z, life });
  }

  setFromVector(vec) {
    this.x = vec.x;
    this.y = vec.y;
    this.z = vec.z;
  }

  asVector() {
    return new THREE.Vector3(this.x, this.y, this.z);
  }

  arcMidpoint(pt2) {
    const mid = this.midpoint(pt2);
    mid.setFromVector(mid.asVector().normalize());
    return mid;
  }

  clone() {
    return new Point({x: this.x, y:this.y, z: this.z, life: this.life});
  }
}

export class Triangle {
  constructor({ vertices, depth = 0 }) {
    this.vertices = vertices;
    this.depth = depth;
  }

  split4() {
    const [a, b, c] = this.vertices;
    const ab = a.arcMidpoint(b);
    const ac = a.arcMidpoint(c);
    const bc = b.arcMidpoint(c);
    const depth = this.depth + 1
    return [
      new Triangle({ vertices: [a, ab, ac], depth }),
      new Triangle({ vertices: [ab, b, bc], depth }),
      new Triangle({ vertices: [ac, bc, c], depth }),
      new Triangle({ vertices: [ab, bc, ac], depth }),
    ];
  }

  split64() {
    const queue = new Queue()
    queue.push(this);
    while(true) {
      const item = queue.pop()
      if(item.depth >= 4) {
        break;
      }
      const splitted = item.split4()
      queue.push(...splitted)
    }
    return queue.data;
  }
}

export class Queue {
  arr = [];
  push(...data) {
    this.arr.unshift(...data.reverse())
  }

  pop() {
    return this.arr.pop()
  }

  get data() {
    return this.arr
  }
}