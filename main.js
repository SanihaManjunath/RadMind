const scene = new THREE.Scene();

/* CAMERA */
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 3000);
camera.position.z = 3;

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.4;
document.body.appendChild(renderer.domElement);

/* POST PROCESSING */
const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));

const bloom = new THREE.UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  1.2, 0.8, 0.15
);
composer.addPass(bloom);

/* STARS */
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for (let i = 0; i < 12000; i++) {
  starPos.push((Math.random() - 0.5) * 3000,
               (Math.random() - 0.5) * 3000,
               (Math.random() - 0.5) * 3000);
}
starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })));

/* EARTH */
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load("./assets/earth_daymap.jpg")
  })
);
scene.add(earth);

/* ATMOSPHERE */
scene.add(new THREE.Mesh(
  new THREE.SphereGeometry(1.05, 64, 64),
  new THREE.MeshBasicMaterial({
    color: 0x4fc3f7,
    transparent: true,
    opacity: 0.15
  })
));

scene.add(new THREE.DirectionalLight(0xffffff, 1.4).position.set(5,3,5));
scene.add(new THREE.AmbientLight(0x222222));

/* GEO */
function ll(lat, lon, r=1){
  const phi=(90-lat)*Math.PI/180;
  const theta=(lon+180)*Math.PI/180;
  return new THREE.Vector3(
    -r*Math.sin(phi)*Math.cos(theta),
     r*Math.cos(phi),
     r*Math.sin(phi)*Math.sin(theta)
  );
}

/* CYBER ARC */
function cyberArc(a,b,color){
  const v1=ll(...a), v2=ll(...b);
  const mid=v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(1.6);
  const curve=new THREE.QuadraticBezierCurve3(v1,mid,v2);
  const tube=new THREE.TubeGeometry(curve,120,0.012,8,false);

  const mat=new THREE.ShaderMaterial({
    uniforms:{ c:{value:new THREE.Color(color)}, t:{value:0} },
    vertexShader:`varying float u; void main(){u=uv.x;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform vec3 c;uniform float t;varying float u;
      void main(){float p=smoothstep(t-0.1,t,u)*smoothstep(t+0.1,t,u);
      gl_FragColor=vec4(c,p*1.8);}`,
    transparent:true,
    blending:THREE.AdditiveBlending,
    depthWrite:false
  });

  const mesh=new THREE.Mesh(tube,mat);
  scene.add(mesh);

  let tt=0;
  (function anim(){
    tt+=0.008; mat.uniforms.t.value=tt;
    if(tt<1) requestAnimationFrame(anim);
    else scene.remove(mesh);
  })();

  window.dispatchEvent(new CustomEvent("newAttack",{detail:"Live Attack"}));
}

const COLORS=["#ff1744","#ffca28","#ab47bc","#29b6f6","#66bb6a"];
setInterval(()=>cyberArc(
  [Math.random()*180-90,Math.random()*360-180],
  [Math.random()*180-90,Math.random()*360-180],
  COLORS[Math.floor(Math.random()*COLORS.length)]
),600);

/* LOOP */
(function loop(){
  requestAnimationFrame(loop);
  earth.rotation.y+=0.0006;
  composer.render();
})();
