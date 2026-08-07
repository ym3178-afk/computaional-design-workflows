(function(){
const container=document.getElementById("ocean-canvas");
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x34413b); scene.fog=new THREE.FogExp2(0x34413b,.06);
const camera=new THREE.PerspectiveCamera(42,container.clientWidth/container.clientHeight,.1,120); camera.position.set(6.8,5.2,8.5);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(container.clientWidth,container.clientHeight); container.appendChild(renderer.domElement);
const controls=new THREE.OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.autoRotate=true; controls.autoRotateSpeed=.18;
const paper=new THREE.MeshStandardMaterial({color:0xf3f0e8,roughness:.76}), warm=new THREE.MeshStandardMaterial({color:0xd4cdc1,roughness:.72}), red=new THREE.MeshStandardMaterial({color:0x9f796c,roughness:.54}), water=new THREE.MeshStandardMaterial({color:0x34413b,roughness:.86});
scene.add(new THREE.AmbientLight(0xb5aea1,.45)); const moon=new THREE.DirectionalLight(0xe3d8c5,1.25); moon.position.set(-4,7,5); scene.add(moon); const goldLight=new THREE.PointLight(0x9aa99f,2,10); scene.add(goldLight);
const base=new THREE.Mesh(new THREE.CylinderGeometry(5.2,5.7,.22,128),water); base.position.y=-.55; scene.add(base);
const group=new THREE.Group(); scene.add(group); const letters=[],cols=34,rows=22,spacing=.28;
for(let ix=0;ix<cols;ix++){for(let iz=0;iz<rows;iz++){let x=(ix-cols/2)*spacing,z=(iz-rows/2)*spacing,page=new THREE.Mesh(new THREE.BoxGeometry(.19,.012,.14),(ix+iz)%7===0?warm:paper); page.position.set(x,0,z); page.rotation.y=Math.random()*.18-.09; if((ix+iz)%15===0){let seal=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.01,16),red); seal.rotation.x=Math.PI/2; seal.position.set(.045,.012,.03); page.add(seal);} group.add(page); letters.push({mesh:page,ix,iz,x,z});}}
const mouse={x:0,y:0}; container.addEventListener("mousemove",e=>{const r=container.getBoundingClientRect(); mouse.x=((e.clientX-r.left)/r.width-.5)*2; mouse.y=-((e.clientY-r.top)/r.height-.5)*2;});
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate); const t=clock.getElapsedTime(); letters.forEach(l=>{let w1=Math.sin(t*1.1+l.ix*.34+l.iz*.18),w2=Math.cos(t*.75+l.iz*.45),rip=Math.sin((l.x-mouse.x*2.5)*2.4+(l.z+mouse.y*2)*1.7+t*2)*.08,y=w1*.22+w2*.12+rip; l.mesh.position.y=y; l.mesh.rotation.x=w1*.22; l.mesh.rotation.z=w2*.16;}); group.rotation.y=Math.sin(t*.12)*.08; goldLight.position.set(mouse.x*2.2,2.2,-mouse.y*2.2); controls.update(); renderer.render(scene,camera);}
animate(); window.addEventListener("resize",()=>{camera.aspect=container.clientWidth/container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth,container.clientHeight);});
})();
