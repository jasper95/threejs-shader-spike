import React from 'react';
import * as THREE from "three";
import Delaunator from 'delaunator'
import OrbitControls from 'orbit-controls-es6'
import { Point, Triangle } from './geometry'
import glslify from 'glslify'
import shader from './shader'

const rawPoints = [[1,0,0,1,472500000000000000],[2,0.3616784,0.1741752,0.9158885,217544000000000000],[3,0.0893272,0.391368,0.9158885,472500000000000000],[4,-0.2502892,0.3138528,0.9158885,472500000000000000],[5,-0.4014328,0,0.9158885,179137000000000000],[6,-0.2502892,-0.3138528,0.9158885,472500000000000000],[7,0.0893272,-0.391368,0.9158885,472500000000000000],[8,0.3616784,-0.1741752,0.9158885,217544000000000000],[9,0.7150641,0.0805684,0.6944005,33470100000000000],[10,0.5789795,0.4273063,0.6944005,64390800000000000],[11,0.2877578,0.6595479,0.6944005,382227000000000000],[12,-0.0805684,0.7150641,0.6944005,472500000000000000],[13,-0.4273063,0.5789795,0.6944005,144998000000000000],[14,-0.6595479,0.2877578,0.6944005,42895700000000000],[15,-0.7150641,-0.0805684,0.6944005,33470100000000000],[16,-0.5789795,-0.4273063,0.6944005,64390800000000000],[17,-0.2877578,-0.6595479,0.6944005,382227000000000000],[18,0.0805684,-0.7150641,0.6944005,472500000000000000],[19,0.4273063,-0.5789795,0.6944005,144998000000000000],[20,0.6595479,-0.2877578,0.6944005,42895700000000000],[21,0.9276932,0.0434012,0.370812,15640500000000000],[22,0.8404679,0.3951103,0.370812,15640500000000000],[23,0.6252889,0.6866674,0.370812,53011100000000000],[24,0.3149154,0.8736857,0.370812,305995000000000000],[25,-0.0434012,0.9276932,0.370812,315000000000000000],[26,-0.3951103,0.8404679,0.370812,179137000000000000],[27,-0.6866674,0.6252889,0.370812,35309200000000000],[28,-0.8736857,0.3149154,0.370812,14823100000000000],[29,-0.9276932,-0.0434012,0.370812,15640500000000000],[30,-0.8404679,-0.3951103,0.370812,15640500000000000],[31,-0.6252889,-0.6866674,0.370812,53011100000000000],[32,-0.3149154,-0.8736857,0.370812,305995000000000000],[33,0.0434012,-0.9276932,0.370812,315000000000000000],[34,0.3951103,-0.8404679,0.370812,179137000000000000],[35,0.6866674,-0.6252889,0.370812,35309200000000000],[36,0.8736857,-0.3149154,0.370812,14823100000000000],[37,0.9705966,0.2407121,0,35309200000000000],[38,0.8045978,0.5938202,0,19012300000000000],[39,0.5161062,0.8565245,0,90598800000000000],[40,0.1490423,0.9888308,0,472500000000000000],[41,-0.2407121,0.9705966,0,472500000000000000],[42,-0.5938202,0.8045978,0,60367700000000000],[43,-0.8565245,0.5161062,0,15640500000000000],[44,-0.9888308,0.1490423,0,96633500000000000],[45,-0.9705966,-0.2407121,0,35309200000000000],[46,-0.8045978,-0.5938202,0,19012300000000000],[47,-0.5161062,-0.8565245,0,90598800000000000],[48,-0.1490423,-0.9888308,0,472500000000000000],[49,0.2407121,-0.9705966,0,472500000000000000],[50,0.5938202,-0.8045978,0,60367700000000000],[51,0.8565245,-0.5161062,0,15640500000000000],[52,0.9888308,-0.1490423,0,96633500000000000]];
export default function Scene() {
  React.useEffect(() => {
    const dom = document.getElementById("three");
    const width = 600;
    const height = width;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    const renderer = new THREE.WebGLRenderer();
    // renderer.context.getExtension('OES_standard_derivatives');
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    const controls = new OrbitControls(camera, renderer.domElement);

    dom.appendChild(renderer.domElement);
    renderer.setSize(width, height);
    // camera.position.z = 1000;
    // const light = new THREE.DirectionalLight( 0xffffff );
    // light.position.set( 0, 0, 1 );
    // scene.add( light );

    controls.target = new THREE.Vector3(0, 0, 0);
    controls.maxDistance = 150;

    camera.position.z = 5;
    camera.up = new THREE.Vector3(0, 1, 0);
    
    const points = rawPoints.map(p => new Point({ x: p[1], y: p[2], z: p[3], life: p[4],}))

    const indexDelaunay = Delaunator.from(
      points.map(p => {
        return [p.x, p.y];
      })
    );

    const pIndex = []; // delaunay index => three.js index
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
      // .map(t => t.split4());
    
    const vertices = []
    const life = []
    faces.forEach(triangle => {
      triangle.vertices.forEach(point => {
        vertices.push(point);
        life.push(Math.log10(point.life))
      })
    })
    const minLife = Math.min(...life)
    const maxLife = Math.max(...life)
    const range = maxLife -minLife
    let geometry = new THREE.BufferGeometry().setFromPoints(vertices.map(e => e.asVector()));
    const indexDelaunay2 = Delaunator.from(
      vertices.map(p => {
        return [p.x, p.y];
      })
    );
    const pIndex2 = []
    indexDelaunay2.triangles.forEach(triangle => {
      pIndex2.push(triangle);
    })
    geometry.setIndex(pIndex2);
    geometry.computeVertexNormals()
    console.log('geometry: ', geometry);
    const radius = 200
    const count = geometry.attributes.position.count;
    const positions1 = geometry.attributes.position;
    // const colors1 = geometry.attributes.color;
    const uv = []
    const colors = []
    life.forEach((val, i) => {
      const intensity = (val-minLife/range)
      uv.push(intensity, 0)
      colors.push(0.5,0.5,0.5)
    })
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    console.log('geometry: ', geometry);
    // for ( let i = 0; i < count; i ++ ) {
    //   const color = new THREE.Color();
    //   console.log('0.7*(vertex.life-minLife/range)', 0.7*(Math.log10(life[i])-minLife/range))
    //   color.setHSL(0.6*(life[i]-minLife/range), 1.0, 0.5 );
    //   colors1.setXYZ(i, color.r, color.g, color.b );
    // }
    // console.log('geometry: ', geometry.attributes.color);
    // const material = new THREE.MeshBasicMaterial({
    //   vertexColors: THREE.VertexColors,
    //   side: THREE.DoubleSide,
    // })
    const wireFrameMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } );
    const wireframe = new THREE.Mesh(
      geometry,
      wireFrameMaterial
    )
    const material = new THREE.ShaderMaterial({
      vertexShader: glslify(`
      precision highp float;
      uniform mat4 model
                 , view
                 , projection
                 , inverseModel;
      uniform vec3 eyePosition
                 , lightPosition;
      
      varying vec3 f_normal
                 , f_lightDirection
                 , f_eyeDirection
                 , f_data;
      varying vec3 f_color;
      varying vec2 f_uv;
      
      vec4 project(vec3 p) {
        return projection * view * model * vec4(p, 1.0);
      }
      
      void main() {
        gl_Position      = project(position);
      
        //Lighting geometry parameters
        vec4 cameraCoordinate = view * vec4(position , 1.0);
        cameraCoordinate.xyz /= cameraCoordinate.w;
        f_lightDirection = lightPosition - cameraCoordinate.xyz;
        f_eyeDirection   = eyePosition - cameraCoordinate.xyz;
        f_normal  = normalize((vec4(normal, 0.0) * inverseModel).xyz);
      
        f_color          = color;
        f_data           = position;
        f_uv             = uv;
      }
      `),
      fragmentShader: glslify(`
      #extension GL_OES_standard_derivatives : enable

      precision highp float;
      
      #pragma glslify: cookTorrance = require(glsl-specular-cook-torrance)
      //#pragma glslify: beckmann = require(glsl-specular-beckmann) // used in gl-surface3d
      
      #pragma glslify: outOfRange = require(glsl-out-of-range)
      
      uniform vec3 clipBounds[2];
      uniform float roughness
                  , fresnel
                  , kambient
                  , kdiffuse
                  , kspecular;
      uniform sampler2D texture;
      
      varying vec3 f_normal
                 , f_lightDirection
                 , f_eyeDirection
                 , f_data;
      varying vec3 f_color;
      varying vec2 f_uv;
      
      void main() {
        if (f_color.a == 0.0 ||
          outOfRange(clipBounds[0], clipBounds[1], f_data)
        ) discard;
      
        vec3 N = normalize(f_normal);
        vec3 L = normalize(f_lightDirection);
        vec3 V = normalize(f_eyeDirection);
      
        if(gl_FrontFacing) {
          N = -N;
        }
      
        float specular = min(1.0, max(0.0, cookTorrance(L, V, N, roughness, fresnel)));
        //float specular = max(0.0, beckmann(L, V, N, roughness)); // used in gl-surface3d
      
        float diffuse  = min(kambient + kdiffuse * max(dot(N, L), 0.0), 1.0);
      
        vec4 surfaceColor = vec4(f_color.rgb, 1.0) * texture2D(texture, f_uv);
        vec4 litColor = surfaceColor.a * vec4(diffuse * surfaceColor.rgb + kspecular * vec3(1,1,1) * specular,  1.0);
      
        gl_FragColor = litColor * f_color.a;
      }
      `),
      vertexColors: true,
      defines: {
        USE_MAP: ''
      }
    })
    // const material = new THREE.MeshBasicMaterial({
    //   vertexColors: true,
    // })
    const mesh = new THREE.Mesh(geometry, material);
    // scene.add(wireframe)
    scene.add(mesh)

    const animate = function () {
      requestAnimationFrame( animate );
      renderer.render( scene, camera );
    };

    animate();
  },[])
  return <div id="three"/>
}

function toRgb(minLife, maxLife, val) {
  const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
  const res = ((val-minLife)/(maxLife-minLife)) * (colors.length - 1)
  const [i,f] = [Math.floor(res/1), res%1]
  if (f < Number.EPSILON) {
    return colors[i]
  }
  else {
    const [r1, g1,b1] = colors[i]
    const [r2,g2,b2] = colors[i+1]
    return [Math.floor(r1 + f*(r2-r1)), Math.floor(g1 + f*(g2-g1)), Math.floor(b1 + f*(b2-b1))]
  }
}
