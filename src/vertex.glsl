attribute vec4 c_color;
precision highp float;
uniform mat4 model
           , view
           , inverseModel;
uniform vec3 eyePosition
           , lightPosition;

varying vec3 f_normal
           , f_lightDirection
           , f_eyeDirection
           , f_data;
varying vec4 f_color;
varying vec2 f_uv;


void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  //Lighting geometry parameters
  vec4 cameraCoordinate = view * vec4(position , 1.0);
  cameraCoordinate.xyz /= cameraCoordinate.w;
  f_lightDirection = lightPosition - cameraCoordinate.xyz;
  f_eyeDirection   = eyePosition - cameraCoordinate.xyz;
  f_normal  = normalize((vec4(normal, 0.0) * inverseModel).xyz);

  f_color          = c_color;
  f_data           = position;
  f_uv             = uv;
}