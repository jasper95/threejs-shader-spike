import React from 'react';
import ReactPlotly from 'react-plotly.js';
import Delaunator from 'delaunator'
import { Point, Triangle } from './geometry'

const rawPoints = [[1,0,0,1,472500000000000000],[2,0.3616784,0.1741752,0.9158885,217544000000000000],[3,0.0893272,0.391368,0.9158885,472500000000000000],[4,-0.2502892,0.3138528,0.9158885,472500000000000000],[5,-0.4014328,0,0.9158885,179137000000000000],[6,-0.2502892,-0.3138528,0.9158885,472500000000000000],[7,0.0893272,-0.391368,0.9158885,472500000000000000],[8,0.3616784,-0.1741752,0.9158885,217544000000000000],[9,0.7150641,0.0805684,0.6944005,33470100000000000],[10,0.5789795,0.4273063,0.6944005,64390800000000000],[11,0.2877578,0.6595479,0.6944005,382227000000000000],[12,-0.0805684,0.7150641,0.6944005,472500000000000000],[13,-0.4273063,0.5789795,0.6944005,144998000000000000],[14,-0.6595479,0.2877578,0.6944005,42895700000000000],[15,-0.7150641,-0.0805684,0.6944005,33470100000000000],[16,-0.5789795,-0.4273063,0.6944005,64390800000000000],[17,-0.2877578,-0.6595479,0.6944005,382227000000000000],[18,0.0805684,-0.7150641,0.6944005,472500000000000000],[19,0.4273063,-0.5789795,0.6944005,144998000000000000],[20,0.6595479,-0.2877578,0.6944005,42895700000000000],[21,0.9276932,0.0434012,0.370812,15640500000000000],[22,0.8404679,0.3951103,0.370812,15640500000000000],[23,0.6252889,0.6866674,0.370812,53011100000000000],[24,0.3149154,0.8736857,0.370812,305995000000000000],[25,-0.0434012,0.9276932,0.370812,315000000000000000],[26,-0.3951103,0.8404679,0.370812,179137000000000000],[27,-0.6866674,0.6252889,0.370812,35309200000000000],[28,-0.8736857,0.3149154,0.370812,14823100000000000],[29,-0.9276932,-0.0434012,0.370812,15640500000000000],[30,-0.8404679,-0.3951103,0.370812,15640500000000000],[31,-0.6252889,-0.6866674,0.370812,53011100000000000],[32,-0.3149154,-0.8736857,0.370812,305995000000000000],[33,0.0434012,-0.9276932,0.370812,315000000000000000],[34,0.3951103,-0.8404679,0.370812,179137000000000000],[35,0.6866674,-0.6252889,0.370812,35309200000000000],[36,0.8736857,-0.3149154,0.370812,14823100000000000],[37,0.9705966,0.2407121,0,35309200000000000],[38,0.8045978,0.5938202,0,19012300000000000],[39,0.5161062,0.8565245,0,90598800000000000],[40,0.1490423,0.9888308,0,472500000000000000],[41,-0.2407121,0.9705966,0,472500000000000000],[42,-0.5938202,0.8045978,0,60367700000000000],[43,-0.8565245,0.5161062,0,15640500000000000],[44,-0.9888308,0.1490423,0,96633500000000000],[45,-0.9705966,-0.2407121,0,35309200000000000],[46,-0.8045978,-0.5938202,0,19012300000000000],[47,-0.5161062,-0.8565245,0,90598800000000000],[48,-0.1490423,-0.9888308,0,472500000000000000],[49,0.2407121,-0.9705966,0,472500000000000000],[50,0.5938202,-0.8045978,0,60367700000000000],[51,0.8565245,-0.5161062,0,15640500000000000],[52,0.9888308,-0.1490423,0,96633500000000000]];
const points = rawPoints.map(p => new Point({ x: p[1], y: p[2], z: p[3], life: p[4],}))
const indexDelaunay = Delaunator.from(
  points.map(p => {
    return [p.x, p.y];
  })
);
const pIndex = [];
indexDelaunay.triangles.forEach(triangle => {
  pIndex.push(triangle);
})
const faces = pIndex
  .reduce((acc, p, i) => {
    const off = i % 3;
    const idx = (i - off) / 3;
    if (off === 0) acc.push([p]);
    else acc[idx].push(p);
    return acc;
  }, [])
  .map(face => {
    const vertices = face.map(idx => points[idx])
    return new Triangle({ vertices })
  })
  .map(t => t.split64());
const x = []
const y = []
const z = []
const life = []
faces.forEach(triangles => {
  triangles.forEach(triangle => {
    triangle.vertices.forEach(point => {
      x.push(point.x)
      y.push(point.y)
      z.push(point.z)
      life.push(point.life)
    })
  })
})
const x2 = x.map(e => e*-1)
const z2 = z.map(e => e*-1);
const min = Math.min(...life)
const minIndex = life.map((e, i) => e === min ? i: null).filter(Boolean)
export default function Plot() {
  return (
    <ReactPlotly
      data={[
        {
          x,
          y,
          z,
          mode: 'lines',
          line: {
            color: 'rgb(128,128,128)',
            width: 1
          },
          marker: {
            showscale: false,
            showlegend: false,
          },
          type: 'scatter3d',
          showlegend: false,
          showscale: false,
          hoverinfo: 'skip'
        },
        {
          x: x2,
          y,
          z: z2,
          mode: 'lines',
          showlegend: false,
          showscale: false,
          marker: {
            showscale: false,
            showlegend: false,
          },
          line: {
            color: 'rgb(128,128,128)',
            width: 1
          },
          type: 'scatter3d',
          hoverinfo: 'skip'
        },
        {
          x,
          y,
          z,
          intensity: life,
          type: 'mesh3d',
          colorscale: [
            [0, 'rgb(255, 0, 0)'],
            [0.5, 'rgb(0, 255, 0)'],
            [1, 'rgb(0, 0, 255)']
          ],
          hoverinfo: 'x+y+z'
        },
        {
          x: x2,
          y,
          z: z2,
          intensity: life,
          type: 'mesh3d',
          showlegend: false,
          showscale: false,
          colorscale: [
            [0, 'rgb(255, 0, 0)'],
            [0.5, 'rgb(0, 255, 0)'],
            [1, 'rgb(0, 0, 255)']
          ],
          hoverinfo: 'x+y+z',
        },
      ]}
      layout={{
        scene: {
          xaxis: {
            title: ""
          },
          yaxis: {
            title: ""
          },
          zaxis: {
            title: ""
          },
          annotations:[
            ...minIndex.map(index => ({
              x: x[index],
              y: y[index],
              z: z[index],
              ax: 0,
              xref: 'paper',
              yref: 'paper',
              // ax: x[index] > 0 ? -30 : 30,
              ay: -30,
              text: "",
              arrowhead: 1,
              xanchor: "left",
              yanchor: "bottom",
              arrowside: 'start'
            })),
            ...minIndex.map(index => ({
              x: x2[index],
              y: y[index],
              z: z2[index],
              ax: 0,
              xref: 'paper',
              yref: 'paper',
              // ax: x2[index] > 0 ? -30 : 30,
              ay: -30,
              text: "",
              arrowhead: 1,
              xanchor: "left",
              yanchor: "bottom",
              arrowside: 'start'
            }))
          ]
        },
        width: 600, height: 600, title: 'Damage Sphere',
      }}
    />
  );
}