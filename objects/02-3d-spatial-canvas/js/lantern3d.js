(function(){
const container=document.getElementById("lantern-canvas");
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x34413b); scene.fog=new THREE.FogExp2(0x34413b,.055);
const camera=new THREE.PerspectiveCamera(42,container.clientWidth/container.clientHeight,.1,100); camera.position.set(5.8,4.2,7.4);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(container.clientWidth,container.clientHeight); container.appendChild(renderer.domElement);
const controls=new THREE.OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.autoRotate=true; controls.autoRotateSpeed=.38;
const paper=new THREE.MeshStandardMaterial({color:0xf3f0e8,roughness:.78}), warm=new THREE.MeshStandardMaterial({color:0xd4cdc1,roughness:.7}), red=new THREE.MeshStandardMaterial({color:0x9f796c,roughness:.56}), gold=new THREE.MeshStandardMaterial({color:0x819389,roughness:.38,metalness:.35}), dark=new THREE.MeshStandardMaterial({color:0x2f3632,roughness:.86});
const base=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.8,.28,96),dark); base.position.y=-.35; scene.add(base);
const ring=new THREE.Mesh(new THREE.TorusGeometry(2.25,.018,12,160),gold); ring.rotation.x=Math.PI/2; ring.position.y=.02; scene.add(ring);
const core=new THREE.Mesh(new THREE.SphereGeometry(.55,48,24),new THREE.MeshStandardMaterial({color:0xd8cbb6,emissive:0x819389,emissiveIntensity:1.15,roughness:.25})); core.position.y=1.12; scene.add(core);
const cards=[]; function card(angle,radius,height,scale,isRed){let g=new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(1.15*scale,.025,.76*scale),isRed?warm:paper)); let seal=new THREE.Mesh(new THREE.CylinderGeometry(.08*scale,.08*scale,.03,32),isRed?red:gold); seal.rotation.x=Math.PI/2; seal.position.set(.34*scale,.035,.18*scale); g.add(seal); g.position.set(Math.cos(angle)*radius,height,Math.sin(angle)*radius); g.rotation.set(-.12,-angle+Math.PI/2,Math.sin(angle)*.25); scene.add(g); cards.push({mesh:g,angle,radius,height});}
for(let i=0;i<20;i++) card(Math.PI*2/20*i,2+(i%3)*.22,.5+(i%6)*.25,.72+(i%4)*.08,i%4===0);
const dust=[]; const dustMat=new THREE.MeshStandardMaterial({color:0xe3d8c5,emissive:0x819389,emissiveIntensity:.6});
for(let i=0;i<120;i++){let d=new THREE.Mesh(new THREE.SphereGeometry(Math.random()*.018+.01,8,6),dustMat); d.position.set((Math.random()-.5)*6,Math.random()*3.5+.1,(Math.random()-.5)*5.5); scene.add(d); dust.push(d);}
scene.add(new THREE.AmbientLight(0xb5aea1,.55)); const key=new THREE.DirectionalLight(0xe3d8c5,1.3); key.position.set(4,6,4); scene.add(key); const point=new THREE.PointLight(0x9aa99f,2.6,8); point.position.set(0,1.25,0); scene.add(point);
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate); const t=clock.getElapsedTime(); core.scale.setScalar(1+Math.sin(t*2.1)*.04); cards.forEach((c,i)=>{let a=c.angle+t*.09; c.mesh.position.x=Math.cos(a)*c.radius; c.mesh.position.z=Math.sin(a)*c.radius; c.mesh.position.y=c.height+Math.sin(t*.9+i)*.08; c.mesh.rotation.y=-a+Math.PI/2;}); dust.forEach((d,i)=>{d.position.y+=Math.sin(t*.8+i)*.0014; d.position.x+=Math.sin(t*.45+i*.3)*.0009;}); point.intensity=2.4+Math.sin(t*1.8)*.35; controls.update(); renderer.render(scene,camera);}
animate(); window.addEventListener("resize",()=>{camera.aspect=container.clientWidth/container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth,container.clientHeight);});
})();
