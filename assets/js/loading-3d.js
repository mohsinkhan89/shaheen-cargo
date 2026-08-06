(() => {
  const canvas = document.querySelector("#cargoLoadingScene");
  if (!canvas || !window.THREE) return;

  const THREE = window.THREE;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const clock = new THREE.Clock();
  const root = new THREE.Group();

  scene.add(root);
  camera.position.set(-5.7, 3.1, 5.9);
  camera.lookAt(0.55, 0.85, 0.2);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd7e7f0, 1.8));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
  keyLight.position.set(-4.5, 7.8, 5.8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 18;
  keyLight.shadow.camera.left = -8;
  keyLight.shadow.camera.right = 8;
  keyLight.shadow.camera.top = 8;
  keyLight.shadow.camera.bottom = -8;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x9fe7ff, 1.25);
  fillLight.position.set(5.2, 3.2, -4.4);
  scene.add(fillLight);

  const mat = {
    blue: new THREE.MeshStandardMaterial({ color: 0x1192d1, roughness: 0.36, metalness: 0.12 }),
    blue2: new THREE.MeshStandardMaterial({ color: 0x35b8f2, roughness: 0.32, metalness: 0.1 }),
    blueDark: new THREE.MeshStandardMaterial({ color: 0x076897, roughness: 0.42, metalness: 0.12 }),
    interior: new THREE.MeshStandardMaterial({ color: 0xdde7ee, roughness: 0.64, metalness: 0.04 }),
    floor: new THREE.MeshStandardMaterial({ color: 0xeaf3f8, roughness: 0.78 }),
    shadow: new THREE.MeshStandardMaterial({ color: 0xdfeaf2, roughness: 0.82, transparent: true, opacity: 0.9 }),
    cardboard: new THREE.MeshStandardMaterial({ color: 0xce7d2d, roughness: 0.66 }),
    cardboardLight: new THREE.MeshStandardMaterial({ color: 0xf0ae58, roughness: 0.58 }),
    tape: new THREE.MeshStandardMaterial({ color: 0xffe0a8, roughness: 0.48 }),
    skin: new THREE.MeshStandardMaterial({ color: 0xf1b680, roughness: 0.48 }),
    helmet: new THREE.MeshStandardMaterial({ color: 0xf6c12c, roughness: 0.38 }),
    pants: new THREE.MeshStandardMaterial({ color: 0x17345c, roughness: 0.48 }),
    pallet: new THREE.MeshStandardMaterial({ color: 0xb8894d, roughness: 0.7 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x142238, roughness: 0.52 }),
    black: new THREE.MeshStandardMaterial({ color: 0x101927, roughness: 0.55 }),
    yellow: new THREE.MeshStandardMaterial({ color: 0xf5ad20, roughness: 0.42 }),
    red: new THREE.MeshStandardMaterial({ color: 0xf04c38, roughness: 0.42 }),
    white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.34 })
  };

  const box = new THREE.BoxGeometry(1, 1, 1);
  const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 28);
  const sphere = new THREE.SphereGeometry(0.5, 28, 18);

  const mesh = (geometry, material, position, scale, parent = root) => {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(...position);
    if (scale) item.scale.set(...scale);
    item.castShadow = true;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  };

  const carton = (parent, x, y, z, s = 1) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(s);
    mesh(box, mat.cardboard, [0, 0, 0], [0.56, 0.42, 0.44], g);
    mesh(box, mat.cardboardLight, [0, 0.222, 0], [0.57, 0.02, 0.45], g);
    mesh(box, mat.tape, [0, 0.245, 0], [0.08, 0.024, 0.47], g);
    mesh(box, mat.tape, [0.225, 0.02, 0.228], [0.1, 0.22, 0.018], g);
    parent.add(g);
    return g;
  };

  const panelLines = (parent, xStart, xEnd, z, y = 0.05) => {
    const count = 13;
    for (let i = 0; i <= count; i += 1) {
      const x = xStart + ((xEnd - xStart) / count) * i;
      mesh(box, mat.blueDark, [x, y, z], [0.018, 0.88, 0.026], parent);
    }
  };

  const worker = (x, y, z, ry, carrying = false, inside = false) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    g.scale.setScalar(inside ? 0.86 : 0.92);

    mesh(cyl, mat.blue, [0, 0.82, 0], [0.22, 0.48, 0.22], g);
    mesh(sphere, mat.skin, [0, 1.42, 0], [0.19, 0.19, 0.19], g);
    mesh(sphere, mat.helmet, [0, 1.55, 0.01], [0.24, 0.09, 0.22], g);

    const armZ = carrying ? 0.18 : 0.08;
    const leftArm = mesh(cyl, mat.skin, [-0.24, 1.01, armZ], [0.045, 0.34, 0.045], g);
    leftArm.rotation.z = carrying ? -0.82 : -0.45;
    leftArm.rotation.x = carrying ? 0.86 : 0.24;
    const rightArm = mesh(cyl, mat.skin, [0.25, 1.01, armZ], [0.045, 0.34, 0.045], g);
    rightArm.rotation.z = carrying ? 0.82 : 0.45;
    rightArm.rotation.x = carrying ? 0.86 : 0.24;

    const leftLeg = mesh(cyl, mat.pants, [-0.1, 0.32, 0], [0.055, 0.4, 0.055], g);
    leftLeg.rotation.z = 0.18;
    const rightLeg = mesh(cyl, mat.pants, [0.13, 0.32, 0], [0.055, 0.4, 0.055], g);
    rightLeg.rotation.z = -0.18;

    root.add(g);
    return g;
  };

  const ground = mesh(new THREE.CircleGeometry(5.8, 80), mat.shadow, [0.55, -0.04, 0.35], [1.18, 1, 0.42]);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  const container = new THREE.Group();
  container.position.set(0.85, 1.02, -0.1);
  container.rotation.y = -0.16;
  root.add(container);

  mesh(box, mat.blue, [1.35, 0.05, 0.98], [4.9, 1.15, 0.08], container);
  mesh(box, mat.blue2, [1.35, 1.22, 0], [4.9, 0.08, 1.08], container);
  mesh(box, mat.blueDark, [1.35, -1.04, 0], [4.9, 0.1, 1.12], container);
  mesh(box, mat.interior, [-1.05, 0.05, -0.04], [1.22, 1.03, 0.96], container);
  mesh(box, mat.floor, [-1.05, -0.76, -0.04], [1.24, 0.1, 0.98], container);
  mesh(box, mat.blueDark, [3.95, -0.2, 0], [0.28, 0.83, 1.14], container);

  panelLines(container, -0.7, 3.62, 1.045, 0.06);
  panelLines(container, -0.7, 3.62, -1.045, 0.06);
  for (let i = 0; i < 12; i += 1) {
    mesh(box, mat.blueDark, [-0.7 + i * 0.36, 1.29, 0.02], [0.045, 0.025, 0.9], container);
  }

  const leftDoor = mesh(box, mat.blue2, [-2.1, 0.05, 0.78], [0.85, 1.08, 0.08], container);
  leftDoor.rotation.y = -0.9;
  const rightDoor = mesh(box, mat.blue2, [-2.05, 0.05, -0.82], [0.85, 1.08, 0.08], container);
  rightDoor.rotation.y = 0.82;
  [-0.25, 0.1, 0.45].forEach((yy) => {
    mesh(box, mat.blueDark, [-2.1, yy, 0.8], [0.72, 0.025, 0.09], container).rotation.y = -0.9;
    mesh(box, mat.blueDark, [-2.05, yy, -0.82], [0.72, 0.025, 0.09], container).rotation.y = 0.82;
  });

  const cab = mesh(box, mat.blue2, [4.55, -0.18, 0.05], [0.72, 0.82, 0.98], container);
  cab.rotation.y = -0.02;
  mesh(box, mat.dark, [4.12, 0.05, 0.55], [0.09, 0.34, 0.28], container);

  [[2.56, -0.98, 0.9], [3.18, -0.98, 0.9], [2.56, -0.98, -0.9], [3.18, -0.98, -0.9], [-0.88, -0.98, 0.9], [-0.88, -0.98, -0.9]].forEach(([x, y, z]) => {
    const wheel = mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.16, 32), mat.black, [x, y, z], null, container);
    wheel.rotation.x = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.17, 24), mat.gray, [x, y, z], null, container).rotation.x = Math.PI / 2;
  });

  [[-0.92, -0.4, -0.22], [-0.34, -0.4, -0.22], [0.24, -0.4, -0.22], [-0.63, 0.02, -0.22], [-0.05, 0.02, -0.22], [0.53, 0.02, -0.22], [-0.34, 0.44, -0.22], [0.24, 0.44, -0.22]].forEach(([x, y, z]) => {
    carton(container, x, y, z, 0.82);
  });

  const pallet = new THREE.Group();
  pallet.position.set(-3.0, 0.18, 0.98);
  pallet.rotation.y = -0.04;
  root.add(pallet);
  mesh(box, mat.pallet, [0, 0, 0], [1.45, 0.12, 0.84], pallet);
  [-0.48, 0, 0.48].forEach((x) => mesh(box, mat.pallet, [x, -0.13, 0], [0.16, 0.16, 0.88], pallet));
  [[-0.46, 0.36, -0.18], [0.12, 0.36, -0.18], [0.7, 0.36, -0.18], [-0.18, 0.79, -0.18], [0.4, 0.79, -0.18], [0.08, 1.22, -0.18]].forEach(([x, y, z]) => carton(pallet, x, y, z, 0.9));

  const jack = new THREE.Group();
  jack.position.set(-4.0, 0.13, 1.02);
  jack.rotation.y = -0.05;
  root.add(jack);
  mesh(box, mat.yellow, [0.34, 0, 0], [0.66, 0.1, 0.16], jack);
  const handle = mesh(box, mat.dark, [-0.2, 0.42, 0], [0.07, 0.84, 0.07], jack);
  handle.rotation.z = -0.16;
  [-0.16, 0.16].forEach((z) => {
    const w = mesh(new THREE.TorusGeometry(0.13, 0.035, 10, 24), mat.black, [-0.3, -0.08, z], null, jack);
    w.rotation.x = Math.PI / 2;
  });

  const workerOutside = worker(-1.35, 0.02, 0.98, -0.52, true, false);
  const workerInside = worker(-0.52, 0.2, 0.02, -0.24, false, true);
  const movingBox = carton(root, -1.26, 1.0, 0.82, 0.72);

  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(260, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  new ResizeObserver(resize).observe(canvas.parentElement);
  resize();

  const animate = () => {
    const elapsed = clock.getElapsedTime();
    const phase = (Math.sin(elapsed * 1.55) + 1) / 2;
    const arc = Math.sin(phase * Math.PI);

    movingBox.position.x = -1.36 + phase * 0.92;
    movingBox.position.y = 0.92 + arc * 0.34;
    movingBox.position.z = 0.86 - phase * 0.78;
    movingBox.rotation.y = -0.18 + phase * 0.38;
    movingBox.rotation.z = -0.08 + arc * 0.16;

    workerOutside.position.y = Math.sin(elapsed * 2.8) * 0.025;
    workerInside.rotation.y = -0.24 + Math.sin(elapsed * 1.55) * 0.04;
    root.rotation.y = Math.sin(elapsed * 0.28) * 0.018;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
})();