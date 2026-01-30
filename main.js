const scene = new THREE.Scene();

/* CAMERA */
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 3000);
camera.position.z = 3;

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.4;
document.body.appendChild(renderer.domElement);

/* POST PROCESSING (BLOOM) */
const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));

const bloom = new THREE.UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2,
  0.8,
  0.15
);
composer.addPass(bloom);

/* STARS */
const stars = new THREE.Points(
  new THREE.BufferGeometry().setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      Array.from({length: 12000}, () => (Math.random()-0.5)*3000), 3
    )
  ),
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })
);
scene.add(stars);

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

/* LIGHTS */
scene.add(new THREE.DirectionalLight(0xffffff, 1.4).position.set(5,3,5));
scene.add(new THREE.AmbientLight(0x222222));

/* GEO */
function latLngToVec3(lat, lon, r=1){
  const phi=(90-lat)*Math.PI/180;
  const theta=(lon+180)*Math.PI/180;
  return new THREE.Vector3(
    -r*Math.sin(phi)*Math.cos(theta),
     r*Math.cos(phi),
     r*Math.sin(phi)*Math.sin(theta)
  );
}

/* CYBER ARC SHADER */
function createCyberArc(start, end, color){
  const v1=latLngToVec3(...start);
  const v2=latLngToVec3(...end);
  const mid=v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(1.6);

  const curve=new THREE.QuadraticBezierCurve3(v1,mid,v2);
  const tube=new THREE.TubeGeometry(curve,100,0.01,8,false);

  const material=new THREE.ShaderMaterial({
    uniforms:{
      color:{value:new THREE.Color(color)},
      time:{value:0}
    },
    vertexShader:`
      varying float vPos;
      void main(){
        vPos = uv.x;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader:`
      uniform vec3 color;
      uniform float time;
      varying float vPos;
      void main(){
        float glow = smoothstep(time-0.1, time, vPos) * smoothstep(time+0.1, time, vPos);
        gl_FragColor = vec4(color, glow*1.8);
      }
    `,
    transparent:true,
    blending:THREE.AdditiveBlending,
    depthWrite:false
  });

  const mesh=new THREE.Mesh(tube,material);
  scene.add(mesh);

  let t=0;
  function animateArc(){
    t+=0.008;
    material.uniforms.time.value=t;
    if(t<1) requestAnimationFrame(animateArc);
    else scene.remove(mesh);
  }
  animateArc();
}

/* COLORS */
const COLORS=["#ff1744","#ffca28","#ab47bc","#29b6f6","#66bb6a"];

/* LIVE ATTACK FLOW */
setInterval(()=>{
  createCyberArc(
    [Math.random()*180-90,Math.random()*360-180],
    [Math.random()*180-90,Math.random()*360-180],
    COLORS[Math.floor(Math.random()*COLORS.length)]
  );
},600);

/* RENDER LOOP */
function animate(){
  requestAnimationFrame(animate);
  earth.rotation.y+=0.0006;
  composer.render();
}
animate();

window.addEventListener("resize",()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  composer.setSize(window.innerWidth,window.innerHeight);
});
