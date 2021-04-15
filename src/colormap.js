import rgb from 'hsv-rgb';

// const H = 179, S = 100, V = 100;
const H = 240;
const S = 100;
const V = 100;

const shiftScale = (min, max) => {
  const minscale = -1e17;
  const maxscale = 1e17;
  const r = [min, max];
  const shift = -r[0];
  let scale = r[1] - r[0];
  if (scale * scale > 1e-30) scale = 1.0 / scale;
  else scale = scale < 0.0 ? minscale : maxscale;

  return [shift, scale];
};

// const MIN = min;
// const MAX = max;
// const RANGE = MAX - MIN;

class ColorMap {
  colorTable = [];

  uses = [];

  cnt = 0;

  hmin = H;

  hmax = 0;

  out = [];

  last = 0;

  constructor(numColors, min, max) {
    this.numColors = numColors;
    this.min = min;
    this.max = max;
    this.range = max - min;

    const [shift, scale] = shiftScale(min, max);
    this.shift = shift; // -min;
    this.scale = scale; // numColors / (max - min);

    this.maxIndex = numColors - 1;
    const hinc = H / this.maxIndex; // H * (0.6667 / this.maxIndex);
    for (let i = 0; i <= this.maxIndex; i++) {
      const mx = Math.pow(this.maxIndex, 2) - Math.pow(this.maxIndex - i, 2);
      const my = Math.sqrt(mx);

      const clr = rgb(my * hinc, S, V);
      const adj = clr; // .map(v => 127.5 * (1.0 + Math.cos((1.0 - v) * Math.PI)));
      this.colorTable.push(adj);
      this.uses.push({ cnt: 0, min: Number.MAX_VALUE, max: Number.MIN_VALUE });
      this.last = my * hinc;
    }
    console.log('this.colorTable', this.colorTable)
  }

  map(aLife) {
    const index = Math.round((aLife-this.min)/this.range)
    return this.colorTable[index]
  }
}

export { ColorMap };
