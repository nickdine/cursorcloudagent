import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

function makeGear(teeth: number, radius: number, thickness: number, material: THREE.Material) {
  const gear = new THREE.Group();
  gear.add(new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.68, radius * 0.68, thickness, 40), material));
  const bore = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.14, radius * 0.14, thickness + 0.03, 18),
    material,
  );
  gear.add(bore);
  const toothW = ((Math.PI * 2 * radius) / teeth) * 0.42;
  const toothGeo = new THREE.BoxGeometry(toothW, thickness * 0.82, radius * 0.34);
  for (let i = 0; i < teeth; i += 1) {
    const angle = (i / teeth) * Math.PI * 2;
    const tooth = new THREE.Mesh(toothGeo, material);
    tooth.position.set(Math.cos(angle) * radius * 0.84, 0, Math.sin(angle) * radius * 0.84);
    tooth.rotation.y = Math.PI / 2 - angle;
    gear.add(tooth);
  }
  return gear;
}

function addCylinder(
  parent: THREE.Object3D,
  material: THREE.Material,
  radius: number,
  height: number,
  position: [number, number, number],
  axis: "x" | "y" | "z" = "y",
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 28), material);
  mesh.position.set(...position);
  if (axis === "x") mesh.rotation.z = Math.PI / 2;
  if (axis === "z") mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addBox(
  parent: THREE.Object3D,
  material: THREE.Material,
  size: [number, number, number],
  position: [number, number, number],
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function MechScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const explodedRef = useRef(false);
  const strokeRef = useRef<HTMLSpanElement>(null);
  const angleRef = useRef<HTMLSpanElement>(null);
  const [exploded, setExploded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x14160f);

    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 80);
    camera.position.set(0.2, 1.7, 10.6);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.02, 0.42, 0);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 6;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = 0.65;
    controls.saveState();
    controlsRef.current = controls;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.7;

    scene.add(new THREE.HemisphereLight(0xf7f1e6, 0x3a3428, 0.45));
    const key = new THREE.DirectionalLight(0xfff6ea, 2.2);
    key.position.set(4.5, 6.5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 18;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.bias = -0.00035;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xf0d7a4, 1.15);
    rim.position.set(-5, 2.2, -3);
    scene.add(rim);
    const front = new THREE.DirectionalLight(0xf7f1e6, 0.85);
    front.position.set(-1, 1.4, 6);
    scene.add(front);

    const steel = new THREE.MeshPhysicalMaterial({
      color: 0xd9dcd4,
      metalness: 0.78,
      roughness: 0.26,
      clearcoat: 0.25,
      clearcoatRoughness: 0.35,
    });
    const gunmetal = new THREE.MeshPhysicalMaterial({
      color: 0x6d726a,
      metalness: 0.72,
      roughness: 0.34,
    });
    const brass = new THREE.MeshPhysicalMaterial({
      color: 0xd7a85a,
      metalness: 0.86,
      roughness: 0.22,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
    });
    const mark = new THREE.MeshStandardMaterial({
      color: 0xd83a16,
      roughness: 0.45,
      metalness: 0.15,
    });
    const ink = new THREE.MeshStandardMaterial({
      color: 0x1a1c17,
      roughness: 0.72,
      metalness: 0.2,
    });

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.22, 0.08, 64), ink);
    pedestal.position.y = -0.62;
    pedestal.receiveShadow = true;
    scene.add(pedestal);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.01, 8, 80), brass);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.57;
    scene.add(ring);

    const assembly = new THREE.Group();
    assembly.position.set(-0.42, 0.12, 0);
    assembly.rotation.y = -0.58;
    assembly.rotation.x = 0.2;
    assembly.scale.setScalar(0.84);
    scene.add(assembly);

    addBox(assembly, steel, [4.35, 0.14, 0.2], [0.15, 0.72, 0]);

    const tickGeo = new THREE.BoxGeometry(0.012, 0.05, 0.008);
    const ticks = new THREE.InstancedMesh(tickGeo, ink, 34);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 34; i += 1) {
      const major = i % 5 === 0;
      dummy.scale.set(1, major ? 1.7 : 1, 1);
      dummy.position.set(-1.55 + i * 0.1, 0.82, 0.1);
      dummy.updateMatrix();
      ticks.setMatrixAt(i, dummy.matrix);
    }
    ticks.castShadow = true;
    assembly.add(ticks);

    const fixedJaw = new THREE.Group();
    assembly.add(fixedJaw);
    addBox(fixedJaw, steel, [0.16, 1.18, 0.2], [-1.9, 0.16, 0]);
    addBox(fixedJaw, steel, [0.72, 0.12, 0.2], [-1.48, -0.38, 0]);

    const slider = new THREE.Group();
    assembly.add(slider);
    addBox(slider, gunmetal, [0.82, 0.4, 0.34], [0, 0.72, 0]);
    addBox(slider, steel, [0.14, 0.92, 0.2], [0.2, 0.2, 0]);
    addBox(slider, steel, [0.58, 0.11, 0.2], [-0.12, -0.2, 0]);
    addCylinder(slider, mark, 0.07, 0.08, [0.18, 0.96, 0]);
    addCylinder(slider, brass, 0.11, 0.16, [0.52, 0.72, 0], "x");

    const vernier = new THREE.InstancedMesh(tickGeo, mark, 8);
    for (let i = 0; i < 8; i += 1) {
      dummy.scale.set(1, 1, 1);
      dummy.position.set(-0.28 + i * 0.06, 0.9, 0.175);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      vernier.setMatrixAt(i, dummy.matrix);
    }
    slider.add(vernier);

    const pinionRadius = 0.2;
    const pinionRig = new THREE.Group();
    pinionRig.position.set(0.05, 0.28, 0.22);
    pinionRig.rotation.x = Math.PI / 2;
    const pinion = makeGear(14, pinionRadius, 0.07, brass);
    pinionRig.add(pinion);
    slider.add(pinionRig);

    for (let i = 0; i < 28; i += 1) {
      addBox(assembly, brass, [0.03, 0.05, 0.06], [-1.15 + i * 0.1, 0.52, 0.16]);
    }

    const depthRod = addBox(slider, ink, [1.7, 0.025, 0.025], [1.15, 0.72, 0]);
    depthRod.castShadow = false;

    assembly.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    pedestal.castShadow = false;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let frame = 0;
    let explode = 0;
    let raf = 0;

    const render = () => {
      const t = reduce ? 0.4 : clock.getElapsedTime();
      const stroke = Math.sin(t * 0.7) * 0.48 - 0.08;
      const target = explodedRef.current ? 1 : 0;
      explode += (target - explode) * (reduce ? 1 : 0.08);

      slider.position.set(stroke, explode * 0.42, explode * 0.28);
      fixedJaw.position.set(-explode * 0.36, 0, -explode * 0.05);
      pinion.rotation.y = -stroke / pinionRadius;

      if (frame % 2 === 0) {
        const mm = (stroke + 0.7) * 46;
        if (strokeRef.current) strokeRef.current.textContent = mm.toFixed(1);
        if (angleRef.current) {
          const deg = THREE.MathUtils.radToDeg(pinion.rotation.y);
          angleRef.current.textContent = `${deg.toFixed(0)}°`;
        }
      }
      frame += 1;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      controlsRef.current = null;
      const materials = new Set<THREE.Material>();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const list = Array.isArray(obj.material) ? obj.material : [obj.material];
          list.forEach((material) => materials.add(material));
        }
      });
      materials.forEach((material) => material.dispose());
      env.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  function toggleExploded() {
    explodedRef.current = !explodedRef.current;
    setExploded(explodedRef.current);
  }

  return (
    <div className="viewport">
      <p className="sr-only">
        可拖动旋转的游标卡尺剖视。黄铜齿轮与齿条啮合，游标随转动往复，读数跟着行程变化。
      </p>
      {failed ? (
        <p className="viewport-fallback">当前浏览器没有可用的 WebGL，三维剖视无法启动。</p>
      ) : (
        <div ref={mountRef} className="mech-scene" />
      )}
      <div className="viewport-shade" />
      <div className="frame-corners" aria-hidden="true" />
      <div className="viewport-ui">
        <div className="readout">
          <span>剖视 · 齿轮齿条</span>
          <strong>
            行程 <span ref={strokeRef}>32.0</span> mm
          </strong>
          <strong>
            小齿轮 <span ref={angleRef}>0°</span>
          </strong>
          <span>模数 1.25 · 齿数 14</span>
        </div>
        {!failed && (
          <div className="viewport-bottom">
            <p className="viewport-hint">拖动旋转 · 滚轮缩放</p>
            <div className="viewport-actions">
              <button type="button" onClick={() => controlsRef.current?.reset()}>
                复位视角
              </button>
              <button type="button" aria-pressed={exploded} onClick={toggleExploded}>
                {exploded ? "合上装配" : "爆炸查看"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
