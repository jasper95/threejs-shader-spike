import * as THREE from "three";
import glslify from 'glslify'
import threeGlslify from 'three-glslify'
// import xtend from 'xtend'

const create = threeGlslify(THREE)

//inline our shader code
const source = glslify({
    vertex: `
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
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec4 cameraCoordinate = view * vec4(position , 1.0);
    cameraCoordinate.xyz /= cameraCoordinate.w;
    f_lightDirection = lightPosition - cameraCoordinate.xyz;
    f_eyeDirection   = eyePosition - cameraCoordinate.xyz;
    f_normal  = (normalize((vec4(normal, 0.0) * inverseModel).xyz));
    f_color          = color;
    f_data           = position;
    f_uv             = uv;
  }
    `,
    fragment: `
    precision highp float;
    #pragma glslify: cookTorrance = require(glsl-specular-cook-torrance)
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
      float diffuse  = min(kambient + kdiffuse * max(dot(N, L), 0.0), 1.0);
      vec4 surfaceColor = vec4(f_color.rgb, 1.0) * texture2D(texture, f_uv);
      vec4 litColor = surfaceColor.a * vec4(diffuse * surfaceColor.rgb + kspecular * vec3(1,1,1) * specular,  1.0);
      gl_FragColor = litColor * f_color.a;
    }
    `,
    vertexColors: true,
    sourceOnly: true
})


export default function createShader(opt) {
  return create(source)
}