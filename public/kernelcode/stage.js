/* Thiagao Ai - particle stage for the sub pages. Same shader as the home page, shapes morph with page scroll. */
import * as THREE from 'three';
const body=document.body;
const shapes=(body.dataset.shapes||'sphere').split(',').map(s=>s.trim());
const shiftX=parseFloat(body.dataset.x||'0');
const stageEl=document.getElementById('stage');
if(body.dataset.dim) stageEl.style.opacity=body.dataset.dim;
const PN=24000;
const renderer=new THREE.WebGLRenderer({canvas:stageEl,alpha:true,antialias:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75)); renderer.setClearColor(0,0);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,1,1,8000);
function size(){
  renderer.setSize(innerWidth,innerHeight,false); camera.aspect=innerWidth/innerHeight;
  camera.position.z=(innerHeight/2)/Math.tan(22.5*Math.PI/180); camera.updateProjectionMatrix();
}
size();

/* voxel cells for the < T > wordmark (T is 7x9, chevrons 6x9, one cell gap) */
const T=[]; for(let r=0;r<9;r++)for(let c=0;c<7;c++) if(r<2||(c>=2&&c<=4)) T.push([c,r]);
const CH=[]; for(let r=0;r<9;r++){ const k=Math.abs(r-4); CH.push([k,r],[k+1,r]); }
function wordmarkCells(){
  const cells=[]; // left chevron, gap, T, gap, right chevron (mirrored)
  CH.forEach(([c,r])=>cells.push([c,r]));
  T.forEach(([c,r])=>cells.push([c+7,r]));
  CH.forEach(([c,r])=>cells.push([20-c,r]));
  return {cells,w:21,h:9};
}
function fromCells(out,cells,w,h,cell){
  for(let i=0;i<PN;i++){
    const q=cells[(Math.random()*cells.length)|0];
    out[i*3]=(q[0]+Math.random()*0.97-w/2)*cell;
    out[i*3+1]=(h/2-q[1]-Math.random()*0.97)*cell;
    out[i*3+2]=(Math.random()-0.5)*cell*0.55;
  }
}
const GEN={
  sphere(out){
    const R=Math.min(300,innerWidth*0.36,innerHeight*0.38), g=Math.PI*(3-Math.sqrt(5));
    for(let i=0;i<PN;i++){ const y=1-(i/(PN-1))*2, r=Math.sqrt(Math.max(0,1-y*y)), t=g*i, j=1+(Math.random()-0.5)*0.06;
      out[i*3]=Math.cos(t)*r*R*j; out[i*3+1]=y*R*j; out[i*3+2]=Math.sin(t)*r*R*j; }
  },
  wordmark(out){ const m=wordmarkCells(); fromCells(out,m.cells,m.w,m.h,Math.min(innerWidth*0.86,1100)/m.w); },
  T(out){ const cell=Math.min(innerHeight*0.56/9,innerWidth*0.62/7); fromCells(out,T,7,9,cell); },
  wave(out){
    const sx=Math.max(0.5,innerWidth/1440);
    for(let i=0;i<PN;i++){ const x=(Math.random()-0.5)*1900*sx, z=-800+Math.random()*1300;
      out[i*3]=x; out[i*3+1]=-170+Math.sin(x*0.007/sx+z*0.006)*70+Math.cos(z*0.012)*38; out[i*3+2]=z; }
  },
  rings(out){
    const k=Math.min(1,Math.min(innerWidth,innerHeight)/760);
    for(let i=0;i<PN;i++){ const ring=(Math.random()*13)|0, a=Math.random()*Math.PI*2, rad=(70+ring*34)*k*(1+(Math.random()-0.5)*0.015);
      out[i*3]=Math.cos(a)*rad; out[i*3+1]=Math.sin(a)*rad; out[i*3+2]=Math.sin(a*3+ring)*22*k; }
  }
};
const SPINS={sphere:1,rings:0.6,wave:0,wordmark:0,T:0};
const pA=new Float32Array(PN*3),pB=new Float32Array(PN*3),pC=new Float32Array(PN*3);
const sd=new Float32Array(PN),sc=new Float32Array(PN),al=new Float32Array(PN);
for(let i=0;i<PN;i++){ sd[i]=Math.random(); sc[i]=0.5+Math.random()*0.85; const u=Math.random(); al[i]=0.22+0.78*u*u; }
function layout(){
  (GEN[shapes[0]]||GEN.sphere)(pA);
  (GEN[shapes[1]||shapes[0]]||GEN.sphere)(pB);
  (GEN[shapes[2]||shapes[1]||shapes[0]]||GEN.sphere)(pC);
  ['pA','pB','pC'].forEach(k=>geo.attributes[k].needsUpdate=true);
}
const geo=new THREE.BufferGeometry();
geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(PN*3),3));
geo.setAttribute('pA',new THREE.BufferAttribute(pA,3));
geo.setAttribute('pB',new THREE.BufferAttribute(pB,3));
geo.setAttribute('pC',new THREE.BufferAttribute(pC,3));
geo.setAttribute('sd',new THREE.BufferAttribute(sd,1));
geo.setAttribute('sc',new THREE.BufferAttribute(sc,1));
geo.setAttribute('al',new THREE.BufferAttribute(al,1));
geo.boundingSphere=new THREE.Sphere(new THREE.Vector3(),3000);
const uniforms={wA:{value:1},wB:{value:0},wC:{value:0},squeeze:{value:1},time:{value:0},psize:{value:2.5}};
const VERT=`
attribute vec3 pA;
attribute vec3 pB;
attribute vec3 pC;
attribute float sd;
attribute float sc;
attribute float al;
uniform float wA, wB, wC, squeeze, time, psize;
varying float vA;
varying float vBoost;
void main(){
  vec3 p = pA*wA + pB*wB + pC*wC;
  float s = sd*6.2831;
  p += vec3(sin(time*.55+s*3.1), cos(time*.47+s*2.3), sin(time*.61+s*4.7))*1.8;
  p.x *= squeeze;
  p.z *= squeeze;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = psize * sc * (760.0 / max(1.0, -mv.z));
  vA = al * clamp(1.0 - (-mv.z - 520.0) / 2600.0, .22, 1.0);
  vBoost = clamp(wB + wC, 0.0, 1.0);
}`;
const FRAG=`
precision mediump float;
varying float vA;
varying float vBoost;
void main(){
  float m = 1.0 - smoothstep(.30, .5, length(gl_PointCoord - 0.5));
  if (m <= 0.002) discard;
  float a = m * vA * mix(1.0, 1.9, vBoost);
  gl_FragColor = vec4(1.0, 1.0, 1.0, min(a, 1.0));
}`;
const mat=new THREE.ShaderMaterial({uniforms,vertexShader:VERT,fragmentShader:FRAG,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
const points=new THREE.Points(geo,mat); points.frustumCulled=false; scene.add(points);
layout();

const smooth=t=>t*t*(3-2*t), clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
let px=0,py=0; addEventListener('pointermove',e=>{px=e.clientX/innerWidth-0.5;py=e.clientY/innerHeight-0.5;});
let spin=0,last=performance.now();
function frame(now){
  const dt=Math.min(0.1,(now-last)/1000); last=now;
  const max=Math.max(1,document.documentElement.scrollHeight-innerHeight), p=clamp(scrollY/max,0,1);
  let wA=1,wB=0,wC=0,sq=1;
  if(shapes.length===2){ const k=smooth(clamp((p-0.30)/0.40,0,1)); wA=1-k; wB=k; sq=1-0.93*Math.sin(Math.PI*k); }
  else if(shapes.length>=3){
    if(p<0.5){ const k=smooth(clamp((p-0.15)/0.30,0,1)); wA=1-k; wB=k; sq=1-0.93*Math.sin(Math.PI*k); }
    else { const k=smooth(clamp((p-0.55)/0.30,0,1)); wA=0; wB=1-k; wC=k; sq=1-0.93*Math.sin(Math.PI*k); }
  }
  uniforms.wA.value=wA; uniforms.wB.value=wB; uniforms.wC.value=wC; uniforms.squeeze.value=Math.max(sq,0.02); uniforms.time.value=now/1000;
  const sp=(SPINS[shapes[0]]||0)*wA+(SPINS[shapes[1]||shapes[0]]||0)*wB+(SPINS[shapes[2]||shapes[0]]||0)*wC;
  spin+=dt*0.085*sp;
  points.rotation.y=spin+px*0.16; points.rotation.x=py*0.09;
  points.position.x=innerWidth>900?innerWidth*shiftX:0;
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
let rz=0; function onR(){ cancelAnimationFrame(rz); rz=requestAnimationFrame(()=>{ size(); layout(); }); }
addEventListener('resize',onR);
