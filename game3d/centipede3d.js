/*
 * CENTIPEDE EXPRESS — 3D 코어 물리 프로토타입 (v0.2)
 * 기획서 3.1 "한 몸, 여러 뇌" 조종 구조를 3D로 검증하는 그레이박스.
 *
 * 스택: Three.js(렌더) + cannon-es(3D 물리), vendor/libs.js 로컬 번들.
 *
 * 이 프로토타입에 있는 것 (코어 물리만):
 *  - ConeTwist 관절로 연결된 N개 마디(2~8), 마디별 독립 조작
 *  - 사람 뇌 2개(P1 WASD / P2 방향키) + 나머지는 봇 마디(협력 추종 AI)
 *  - 공용 액션: 점프 / 웅크리기(저자세 브레이크) / 그립(앵커)
 *  - 등 위에 물리로 얹혀 기울면 미끄러지는 화물
 *  - 방향 정렬 시 빨라지는 시너지 게이지
 *  - 3D 코스: 계단 → 낭떠러지 점프 → 좁은 외나무 다리 → 도착 깃발
 *  - 추락 시 즉시 재배송(리스폰) — 기획서 4.1 "짧은 실패, 빠른 재도전"
 */
'use strict';
const { THREE, CANNON, RoundedBoxGeometry } = LIBS;

// ------------------------------------------------------------------
// 튜닝 상수 — 숫자를 바꿔가며 "느낌"을 찾는 게 이 프로토타입의 핵심
// ------------------------------------------------------------------
const CFG = {
  seg: { w: 0.8, h: 0.55, l: 1.15, gap: 0.25, mass: 1 }, // 마디 크기(폭·높이·길이)
  // 이동은 속도 조향(velocity steering) 방식 — cannon-es 마찰이 정적 스프링처럼
  // 강해서 힘(applyForce) 기반 이동이 막히기 때문. 관절 장력은 그대로 유지됨.
  moveSpeed: 6.0,       // 사람 마디 목표 속도
  accel: 40,            // 목표 속도로 붙는 가속(지상)
  airControl: 0.35,     // 공중 조작 배율
  botFollow: 0.75,      // 봇 목표 속도 배율(사람 대비)
  jumpV: 7,             // 점프 순간 상승 속도
  maxSpeed: 9,          // 수평 속도 상한(물리 폭주 방지)
  gravity: -17,         // 게임 감각용 강한 중력
  baseDamping: 0.05,    // 평상시 수평 감쇠
  crouchDamping: 0.9,   // 웅크리기 중 감쇠(브레이크)
  synergyMin: 0.6,      // 정렬 0일 때 힘 배율
  synergyMax: 1.6,      // 정렬 1일 때 힘 배율
  joint: { swing: 1.1, twist: 0.6 }, // 관절 허용각(rad) — 꺾임/비틀림
  cargoPerSeg: 1.25,    // 화물량 = 마디 수 비례(기획 6장), 최소 cargoMin개
  cargoMin: 2,
  cargoSize: 0.55, cargoMass: 0.35,
  camOffset: new THREE.Vector3(0, 7.5, 11),
  botHopCd: 24,         // 봇 자동 점프 쿨다운(물리 스텝)
};
const STEP = 1 / 60;
const GROUP = { TERRAIN: 1, SEG: 2, CARGO: 4 };
const COLORS = {
  head: 0xffd166, body: 0x7bc47f, tail: 0x6a8bbf, cargo: 0xc98a4b,
  ground: 0x8fa8bd, step: 0xa5bccf, beam: 0xd9b38c, goal: 0xa8d3a0,
  sky: 0xdff0f7,
};

// ------------------------------------------------------------------
// Three.js 렌더 세팅 (로우폴리 + 파스텔 — 기획서 9장 아트 디렉션)
// ------------------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.sky);
scene.fog = new THREE.Fog(COLORS.sky, 40, 120);

const camera = new THREE.PerspectiveCamera(
  55, window.innerWidth / window.innerHeight, 0.1, 200);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('stage'), antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

scene.add(new THREE.HemisphereLight(0xffffff, 0x99aabb, 0.8));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(15, 30, -10);
sun.target.position.set(0, 0, -25);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -45; sun.shadow.camera.right = 45;
sun.shadow.camera.top = 45; sun.shadow.camera.bottom = -45;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 100;
sun.shadow.bias = -0.0005;
scene.add(sun, sun.target);

// ------------------------------------------------------------------
// cannon-es 물리 세팅
// ------------------------------------------------------------------
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, CFG.gravity, 0) });
world.broadphase = new CANNON.SAPBroadphase(world);
world.solver.iterations = 20;
world.defaultContactMaterial.friction = 0.5;
world.defaultContactMaterial.restitution = 0.01;

const matSeg = new CANNON.Material('seg');
const matGround = new CANNON.Material('ground');
const matCargo = new CANNON.Material('cargo');
// 마디-지면 마찰은 0: cannon-es 마찰 상한은 스텝당 임펄스처럼 작용해
// 물리값보다 수십 배 강하다(0.02조차 이동을 통째로 흡수함을 실측).
// 정지는 무입력 시 0으로 조향(능동 브레이크)으로 처리.
world.addContactMaterial(new CANNON.ContactMaterial(matSeg, matGround,
  { friction: 0.0, restitution: 0.0 }));
world.addContactMaterial(new CANNON.ContactMaterial(matCargo, matSeg,
  { friction: 1.2, restitution: 0.0 }));
world.addContactMaterial(new CANNON.ContactMaterial(matCargo, matGround,
  { friction: 0.6, restitution: 0.05 }));

// ------------------------------------------------------------------
// 지형 — 시작 → 계단 → 높은 단 → 낭떠러지(점프) → 외나무 다리 → 도착
// 코스는 -z 방향으로 진행. 옆·아래로 떨어지면 추락(리스폰).
// ------------------------------------------------------------------
const GOAL_Z = -47;
function addStaticBox(cx, cy, cz, sx, sy, sz, color) {
  const body = new CANNON.Body({
    type: CANNON.Body.STATIC, material: matGround,
    shape: new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2)),
    collisionFilterGroup: GROUP.TERRAIN,
  });
  body.position.set(cx, cy, cz);
  world.addBody(body);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    new THREE.MeshLambertMaterial({ color }));
  mesh.position.set(cx, cy, cz);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
  return body;
}

function buildCourse() {
  addStaticBox(0, -0.5, -2, 12, 1, 24, COLORS.ground);   // 시작 (top 0, z +10..-14)
  addStaticBox(0, 0.0, -15, 12, 1, 2, COLORS.step);      // 계단1 (top 0.5)
  addStaticBox(0, 0.5, -17, 12, 1, 2, COLORS.step);      // 계단2 (top 1.0)
  addStaticBox(0, 0.5, -24, 12, 2, 12, COLORS.ground);   // 높은 단 (top 1.5, z -18..-30)
  // (z -30 ~ -33) 낭떠러지 — 달리며 점프로 건너기
  addStaticBox(0, 1.0, -38.5, 1.8, 1, 11, COLORS.beam);  // 외나무 다리 (top 1.5, 폭 1.8)
  addStaticBox(0, 0.1, -51, 14, 2.2, 14, COLORS.goal);   // 도착 (top 1.2, z -44..-58)

  // 도착 깃발
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 3),
    new THREE.MeshLambertMaterial({ color: 0x666f7a }));
  pole.position.set(0, 1.2 + 1.5, GOAL_Z - 1);
  pole.castShadow = true;
  const flag = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.1, 4),
    new THREE.MeshLambertMaterial({ color: 0xe05a5a }));
  flag.rotation.z = -Math.PI / 2;
  flag.position.set(0.6, 1.2 + 2.6, GOAL_Z - 1);
  scene.add(pole, flag);
}

// ------------------------------------------------------------------
// 지네 — 관절(ConeTwist)로 연결된 마디들. 머리가 -z(진행 방향) 선두.
// ------------------------------------------------------------------
const segGeom = new RoundedBoxGeometry(CFG.seg.w, CFG.seg.h, CFG.seg.l, 3, 0.16);
const legGeom = new THREE.CylinderGeometry(0.09, 0.07, 0.32); // 짧고 통통하게(기획 9장)
legGeom.translate(0, -0.16, 0); // 피벗을 고관절(위쪽 끝)로
// 머리 장식은 지오메트리/재질을 공유해 리셋마다 새로 만들지 않는다(누수 방지)
const eyeGeom = new THREE.SphereGeometry(0.14, 12, 12);
const pupilGeom = new THREE.SphereGeometry(0.07, 8, 8);
const antGeom = new THREE.CylinderGeometry(0.025, 0.02, 0.55);
const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
const blackMat = new THREE.MeshLambertMaterial({ color: 0x1c2530 });

let segs = [];          // { body, mesh, baseColor, legs[], hopCd, crouch }
let joints = [];

function makeSegmentMesh(kind) {
  const color = kind === 'head' ? COLORS.head :
    kind === 'tail' ? COLORS.tail : COLORS.body;
  const mesh = new THREE.Mesh(segGeom,
    new THREE.MeshLambertMaterial({ color }));
  mesh.castShadow = true;

  // 다리 3쌍 — 이동 속도에 맞춰 파닥거리는 코스메틱
  const legs = [];
  for (let p = 0; p < 3; p++) {
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(legGeom, mesh.material);
      leg.castShadow = true;
      const hip = new THREE.Group();
      hip.position.set(side * CFG.seg.w * 0.5, -0.1, -0.33 + p * 0.33);
      hip.rotation.z = side * 0.85; // 바깥쪽으로 벌어진 기본 자세
      hip.add(leg);
      mesh.add(hip);
      legs.push({ hip, side, phase: p * Math.PI * 0.66 + (side > 0 ? Math.PI : 0) });
    }
  }

  if (kind === 'head') {
    // 큰 눈 + 더듬이 (기획서 9장: 징그럽지 않게, 동글동글·큰 눈)
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeom, whiteMat);
      eye.position.set(side * 0.2, 0.14, -CFG.seg.l / 2 + 0.05);
      const pupil = new THREE.Mesh(pupilGeom, blackMat);
      pupil.position.set(side * 0.2, 0.14, -CFG.seg.l / 2 - 0.06);
      mesh.add(eye, pupil);
      const ant = new THREE.Mesh(antGeom, blackMat);
      ant.position.set(side * 0.16, 0.42, -CFG.seg.l / 2 + 0.1);
      ant.rotation.x = -0.6; ant.rotation.z = side * -0.35;
      mesh.add(ant);
    }
  }
  return { mesh, legs, color };
}

function buildCentipede(n) {
  for (const j of joints) world.removeConstraint(j);
  for (const s of segs) {
    world.removeBody(s.body);
    scene.remove(s.mesh);
    s.mesh.material.dispose();
  }
  segs = []; joints = [];

  const pitch = CFG.seg.l + CFG.seg.gap;
  for (let i = 0; i < n; i++) {
    const kind = i === 0 ? 'head' : i === n - 1 ? 'tail' : 'body';
    const body = new CANNON.Body({
      mass: CFG.seg.mass, material: matSeg,
      shape: new CANNON.Box(new CANNON.Vec3(
        CFG.seg.w / 2, CFG.seg.h / 2, CFG.seg.l / 2)),
      collisionFilterGroup: GROUP.SEG,
      linearDamping: CFG.baseDamping,
      angularDamping: 0.3,
    });
    body.position.set(0, 1.0, -2 + i * pitch); // 머리가 가장 앞(-z)
    world.addBody(body);

    const { mesh, legs, color } = makeSegmentMesh(kind);
    scene.add(mesh);
    segs.push({ body, mesh, legs, baseColor: color, hopCd: 0, crouch: false });
  }

  // 관절: 앞 마디 뒤끝 ↔ 뒷 마디 앞끝. 꺾임/비틀림 제한으로 지네다운 유연함.
  const half = CFG.seg.l / 2 + CFG.seg.gap / 2;
  for (let i = 0; i < n - 1; i++) {
    const j = new CANNON.ConeTwistConstraint(segs[i].body, segs[i + 1].body, {
      pivotA: new CANNON.Vec3(0, 0, half),
      pivotB: new CANNON.Vec3(0, 0, -half),
      axisA: new CANNON.Vec3(0, 0, 1),
      axisB: new CANNON.Vec3(0, 0, 1),
      angle: CFG.joint.swing,
      twistAngle: CFG.joint.twist,
      collideConnected: false,
    });
    world.addConstraint(j);
    joints.push(j);
  }
  applySelfCollide();
}

function applySelfCollide() {
  const mask = GROUP.TERRAIN | GROUP.CARGO | (state.selfCollide ? GROUP.SEG : 0);
  for (const s of segs) s.body.collisionFilterMask = mask;
}

// ------------------------------------------------------------------
// 화물 — 마디 등 위에 물리로 얹힘
// ------------------------------------------------------------------
let cargos = []; // { body, mesh }
const cargoGeom = new RoundedBoxGeometry(
  CFG.cargoSize, CFG.cargoSize, CFG.cargoSize, 2, 0.06);
const cargoMat = new THREE.MeshLambertMaterial({ color: COLORS.cargo });

function spawnCargo() {
  for (const c of cargos) { world.removeBody(c.body); scene.remove(c.mesh); }
  cargos = [];
  if (!segs.length) return;
  // 화물량은 인원수(지네 길이)에 비례 자동 조정 — 기획 6장
  const count = Math.max(CFG.cargoMin, Math.round(segs.length * CFG.cargoPerSeg));
  const stackCount = {}; // 같은 마디에 여러 개면 위로 쌓기
  for (let i = 0; i < count; i++) {
    const hi = count > 1
      ? Math.round((i * (segs.length - 1)) / (count - 1)) : 0;
    const host = segs[hi];
    const stack = stackCount[hi] || 0;
    stackCount[hi] = stack + 1;
    const body = new CANNON.Body({
      mass: CFG.cargoMass, material: matCargo,
      shape: new CANNON.Box(new CANNON.Vec3(
        CFG.cargoSize / 2, CFG.cargoSize / 2, CFG.cargoSize / 2)),
      collisionFilterGroup: GROUP.CARGO,
      linearDamping: 0.01,
    });
    body.position.set(
      host.body.position.x,
      host.body.position.y + CFG.seg.h / 2 + CFG.cargoSize / 2 + 0.15 +
        stack * (CFG.cargoSize + 0.1),
      host.body.position.z);
    world.addBody(body);
    const mesh = new THREE.Mesh(cargoGeom, cargoMat);
    mesh.castShadow = true;
    scene.add(mesh);
    cargos.push({ body, mesh });
  }
}

function cargoOnBack() {
  let n = 0;
  for (const c of cargos) {
    const p = c.body.position;
    const ok = segs.some((s) => {
      const q = s.body.position;
      const dx = p.x - q.x, dz = p.z - q.z;
      return dx * dx + dz * dz < 1.3 * 1.3 && p.y > q.y + 0.2;
    });
    if (ok) n++;
  }
  return n;
}

// ------------------------------------------------------------------
// 입력 — P1: WASD·Space·ShiftL·Q / P2: 방향키·Enter·ShiftR·마침표(.)
// ------------------------------------------------------------------
const keys = {
  p1: { f: 0, b: 0, l: 0, r: 0, jump: false, grip: false, crouch: false },
  p2: { f: 0, b: 0, l: 0, r: 0, jump: false, grip: false, crouch: false },
};
const state = {
  n: 4, p1: 0, p2: 3, p2on: false,
  autopilot: false, selfCollide: true, delivered: false,
  // grip은 '얼렸던 바로 그 body'를 기억해, 마디 전환/P2 OFF/자동주행 등
  // 라우팅이 바뀌어도 반드시 해제되도록 한다.
  grip: {
    p1: { body: null, mesh: null, jumpLatch: false },
    p2: { body: null, mesh: null, jumpLatch: false },
  },
};
const clampIdx = (i) => Math.max(0, Math.min(segs.length - 1, i));

const KEYMAP = {
  KeyW: ['p1', 'f'], KeyS: ['p1', 'b'], KeyA: ['p1', 'l'], KeyD: ['p1', 'r'],
  Space: ['p1', 'jump'], ShiftLeft: ['p1', 'grip'], KeyQ: ['p1', 'crouch'],
  ArrowUp: ['p2', 'f'], ArrowDown: ['p2', 'b'],
  ArrowLeft: ['p2', 'l'], ArrowRight: ['p2', 'r'],
  Enter: ['p2', 'jump'], ShiftRight: ['p2', 'grip'], Period: ['p2', 'crouch'],
};

window.addEventListener('keydown', (e) => {
  // OS 키 반복은 무시 — 토글(P/B/X/H)·리셋(R/+/-)이 연타되는 것을 방지
  if (e.repeat) {
    if (KEYMAP[e.code]) e.preventDefault();
    return;
  }
  const m = KEYMAP[e.code];
  if (m) {
    keys[m[0]][m[1]] = typeof keys[m[0]][m[1]] === 'number' ? 1 : true;
    e.preventDefault();
    return;
  }
  switch (e.code) {
    case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4':
    case 'Digit5': case 'Digit6': case 'Digit7': case 'Digit8':
      state.p1 = clampIdx(parseInt(e.code.slice(5), 10) - 1); break;
    case 'KeyP': state.p2on = !state.p2on; break;
    case 'BracketLeft': state.p2 = clampIdx(state.p2 - 1); break;
    case 'BracketRight': state.p2 = clampIdx(state.p2 + 1); break;
    case 'Equal': case 'NumpadAdd':
      state.n = Math.min(8, state.n + 1); reset(); break;
    case 'Minus': case 'NumpadSubtract':
      state.n = Math.max(2, state.n - 1); reset(); break;
    case 'KeyR': reset(); break;
    case 'KeyC': spawnCargo(); break;
    case 'KeyB': state.autopilot = !state.autopilot; break;
    case 'KeyX': state.selfCollide = !state.selfCollide; applySelfCollide(); break;
    case 'KeyH': toggleHelp(); break;
  }
});
window.addEventListener('keyup', (e) => {
  const m = KEYMAP[e.code];
  if (m) {
    keys[m[0]][m[1]] = typeof keys[m[0]][m[1]] === 'number' ? 0 : false;
    e.preventDefault();
  }
});

// ------------------------------------------------------------------
// 물리 헬퍼
// ------------------------------------------------------------------
const groundedSet = new Set();
function refreshGrounded() {
  groundedSet.clear();
  for (const c of world.contacts) {
    // 접촉 노멀은 bi→bj. 위에서 누르는 쪽이 "지지받는" 몸.
    if (c.ni.y > 0.6) groundedSet.add(c.bj.id);
    if (c.ni.y < -0.6) groundedSet.add(c.bi.id);
  }
}
const grounded = (body) => groundedSet.has(body.id);

function inputDir(input) {
  const x = input.r - input.l, z = input.b - input.f; // 전진 = -z
  const len = Math.hypot(x, z);
  return len > 0 ? { x: x / len, z: z / len } : { x: 0, z: 0 };
}

function computeSynergy() {
  let sx = 0, sz = 0, total = 0;
  for (const s of segs) {
    if (s.body.type !== CANNON.Body.DYNAMIC) continue; // 앵커 마디는 제외
    const v = s.body.velocity;
    sx += v.x; sz += v.z;
    total += Math.hypot(v.x, v.z);
  }
  if (total < 1) return 0;
  return Math.min(1, Math.hypot(sx, sz) / total);
}

const rayResult = new CANNON.RaycastResult();
function rayTerrain(from, to) {
  rayResult.reset();
  world.raycastClosest(from, to,
    { collisionFilterMask: GROUP.TERRAIN }, rayResult);
  return rayResult.hasHit;
}

function synergyBonus(synergy) {
  return CFG.synergyMin + (CFG.synergyMax - CFG.synergyMin) * synergy;
}

// 속도 조향: 수평 속도를 목표치로 스텝당 accel 만큼만 끌어당김.
// 관절이 이후에 속도를 재분배하므로 "서로 당기는 몸" 긴장은 유지된다.
function steer(body, tx, tz, accel) {
  const a = accel * (grounded(body) ? 1 : CFG.airControl) * STEP;
  const v = body.velocity;
  v.x += Math.max(-a, Math.min(a, tx - v.x));
  v.z += Math.max(-a, Math.min(a, tz - v.z));
}

function applyCrouch(s, on) {
  if (on === s.crouch) return;
  s.crouch = on;
  s.body.linearDamping = on ? CFG.crouchDamping : CFG.baseDamping;
  s.mesh.scale.y = on ? 0.55 : 1;
}

// ---- 그립(앵커) — 기획서 꼬리 역할: 지형을 붙잡아 브레이크/낭떠러지 지탱 ----
// KINEMATIC을 쓰는 이유: type만 STATIC으로 바꾸면 mass가 1로 남아 솔버가
// 관절 임펄스를 velocity에 계속 누적(유령 속도)하고 해제 순간 무명령 발사가
// 난다. KINEMATIC은 invMassSolve=0이라 원천 차단되고 지형 접촉도 유지된다.
function gripAcquire(g, s) {
  s.body.type = CANNON.Body.KINEMATIC;
  s.body.velocity.setZero();
  s.body.angularVelocity.setZero();
  s.mesh.material.emissive = new THREE.Color(0x28417a);
  g.body = s.body; g.mesh = s.mesh;
}
function gripRelease(g) {
  if (!g.body) return;
  g.body.type = CANNON.Body.DYNAMIC;
  g.body.velocity.setZero();
  g.body.angularVelocity.setZero();
  g.body.wakeUp();
  g.mesh.material.emissive = new THREE.Color(0x000000);
  g.body = null; g.mesh = null;
}
function updateGrips() {
  for (const tag of ['p1', 'p2']) {
    const g = state.grip[tag];
    const enabled = !state.autopilot && (tag === 'p1' || state.p2on);
    const target = enabled
      ? segs[clampIdx(tag === 'p1' ? state.p1 : state.p2)] : null;
    const want = enabled && keys[tag].grip;
    // 해제: 키를 놓았거나 조종 마디/라우팅이 바뀌면 '얼렸던 body' 기준으로 즉시
    if (g.body && (!want || !target || target.body !== g.body)) gripRelease(g);
    // 획득: 접지 중일 때만(공중 호버 방지 — 기획 3.1 "지형 붙잡기")
    if (want && !g.body && target &&
        target.body.type === CANNON.Body.DYNAMIC && grounded(target.body)) {
      gripAcquire(g, target);
    }
  }
}

function applyHuman(s, input, tag, synergy) {
  const g = state.grip[tag];
  applyCrouch(s, input.crouch && s.body.type === CANNON.Body.DYNAMIC);
  if (s.body.type !== CANNON.Body.DYNAMIC) return;

  const dir = inputDir(input);
  if ((dir.x || dir.z) && !input.crouch) {
    const spd = CFG.moveSpeed * synergyBonus(synergy);
    steer(s.body, dir.x * spd, dir.z * spd, CFG.accel);
  } else if (grounded(s.body)) {
    // 무입력·웅크리기: 능동 브레이크 (마찰이 거의 없으므로)
    steer(s.body, 0, 0, CFG.accel * (input.crouch ? 1.2 : 0.7));
  }
  if (input.jump && grounded(s.body) && !input.crouch && !g.jumpLatch) {
    s.body.velocity.y = CFG.jumpV;
    g.jumpLatch = true;
  }
  if (!input.jump) g.jumpLatch = false;
}

// 봇이 참고할 방향: 자동주행이면 깃발까지, 아니면 가까운 사람의 입력
function botDir(i) {
  if (state.autopilot) {
    const head = segs[0].body.position;
    if (state.delivered || head.z < GOAL_Z) return { x: 0, z: 0 };
    const dx = 0 - head.x, dz = GOAL_Z - 2 - head.z;
    const len = Math.hypot(dx, dz);
    return len > 0.5 ? { x: dx / len, z: dz / len } : { x: 0, z: 0 };
  }
  const useP2 = state.p2on &&
    Math.abs(i - state.p2) < Math.abs(i - state.p1);
  return inputDir(useP2 ? keys.p2 : keys.p1);
}

function applyBot(s, i, synergy) {
  if (s.body.type !== CANNON.Body.DYNAMIC) return;
  applyCrouch(s, false);
  const dir = botDir(i);
  const moving = dir.x !== 0 || dir.z !== 0;
  if (moving) {
    const spd = CFG.moveSpeed * CFG.botFollow * synergyBonus(synergy);
    let tx = dir.x * spd, tz = dir.z * spd;
    // 대열 유지: 앞 이웃 쪽으로 약한 보정(외나무 다리에서 낙오 방지).
    // 세게 당기면 줄다리기가 되므로 상한을 둔다.
    const nb = segs[i - 1] || segs[i + 1];
    if (nb) {
      const cap = 1.5;
      tx += Math.max(-cap, Math.min(cap,
        (nb.body.position.x - s.body.position.x) * 1.2));
      tz += Math.max(-cap, Math.min(cap,
        (nb.body.position.z - s.body.position.z) * 1.2));
    }
    steer(s.body, tx, tz, CFG.accel * CFG.botFollow);
  } else if (grounded(s.body)) {
    steer(s.body, 0, 0, CFG.accel * 0.7);
  }

  // 자동 점프: 정면이 막혔거나(계단·벽), 앞이 낭떠러지거나, 이웃이 확 높을 때
  if (s.hopCd > 0) s.hopCd--;
  if (!grounded(s.body) || s.hopCd > 0) return;
  const p = s.body.position;
  let wantJump = false;
  if (moving) {
    wantJump = rayTerrain(
      new CANNON.Vec3(p.x, p.y + 0.1, p.z),
      new CANNON.Vec3(p.x + dir.x * 1.4, p.y + 0.1, p.z + dir.z * 1.4));
    if (!wantJump) {
      // 전방 지면 없음 = 틈새 → 도약
      const ax = p.x + dir.x * 1.7, az = p.z + dir.z * 1.7;
      wantJump = !rayTerrain(
        new CANNON.Vec3(ax, p.y + 0.5, az),
        new CANNON.Vec3(ax, p.y - 2.4, az));
    }
  }
  const nb = segs[i - 1];
  if (!wantJump && nb && nb.body.position.y > p.y + 0.8) wantJump = true;
  if (wantJump) {
    s.body.velocity.y = CFG.jumpV * 0.95;
    s.hopCd = CFG.botHopCd;
  }
}

function clampSpeed(body) {
  const v = body.velocity;
  const h = Math.hypot(v.x, v.z);
  if (h > CFG.maxSpeed) {
    const k = CFG.maxSpeed / h;
    v.x *= k; v.z *= k;
  }
}

// ------------------------------------------------------------------
// 게임 루프 — 고정 스텝 물리 + 조작 적용
// ------------------------------------------------------------------
let synergyNow = 0;
let stepCount = 0;
function physicsStep() {
  stepCount++;
  updateGrips();
  synergyNow = computeSynergy();
  segs.forEach((s, i) => {
    const isP1 = i === state.p1 && !state.autopilot;
    const isP2 = state.p2on && i === state.p2 && !state.autopilot;
    if (isP1) applyHuman(s, keys.p1, 'p1', synergyNow);
    else if (isP2) applyHuman(s, keys.p2, 'p2', synergyNow);
    else applyBot(s, i, synergyNow);
  });
  for (const s of segs) clampSpeed(s.body);
  world.step(STEP);
  refreshGrounded();

  // 도착 판정
  if (!state.delivered && segs[0] && segs[0].body.position.z < GOAL_Z) {
    state.delivered = true;
    toast(`🎉 배달 도착! 화물 ${cargoOnBack()}/${cargos.length} 유지`, 6000);
  }
  // 추락 판정 → 즉시 재배송 (기획서 4.1)
  if (segs.some((s) => s.body.position.y < -10)) {
    toast('💥 추락! 재배송 출발', 2500);
    reset();
  }
}

// ------------------------------------------------------------------
// 라벨 스프라이트 (P1/P2 표시)
// ------------------------------------------------------------------
function makeLabel(text, color) {
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 64;
  const ctx = cv.getContext('2d');
  ctx.font = 'bold 42px system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, 64, 32);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(cv), depthTest: false }));
  sprite.scale.set(1.1, 0.55, 1);
  scene.add(sprite);
  return sprite;
}
const labelP1 = makeLabel('P1', '#c8871a');
const labelP2 = makeLabel('P2', '#2a7ab8');

// ------------------------------------------------------------------
// 렌더 루프
// ------------------------------------------------------------------
const camTarget = new THREE.Vector3();
let last = performance.now(), acc = 0;

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  acc += dt;
  let steps = 0;
  while (acc >= STEP && steps < 5) { physicsStep(); acc -= STEP; steps++; }
  // 프레임이 오래 밀렸으면 남은 시간 부채는 버린다 — 회복 시 5배속 폭주 방지
  if (acc >= STEP) acc = 0;

  const t = now / 1000;
  for (const s of segs) {
    s.mesh.position.copy(s.body.position);
    s.mesh.quaternion.copy(s.body.quaternion);
    // 다리 파닥거림 — 속도에 비례
    const v = s.body.velocity;
    const speed = Math.hypot(v.x, v.z);
    const amp = Math.min(1, speed / 3.5) * 0.55 + (grounded(s.body) ? 0 : 0.25);
    for (const leg of s.legs) {
      leg.hip.rotation.x = Math.sin(t * 11 + leg.phase) * amp;
    }
  }
  for (const c of cargos) {
    c.mesh.position.copy(c.body.position);
    c.mesh.quaternion.copy(c.body.quaternion);
  }

  // 라벨 위치
  const p1s = segs[clampIdx(state.p1)], p2s = segs[clampIdx(state.p2)];
  labelP1.visible = !state.autopilot && !!p1s;
  labelP2.visible = !state.autopilot && state.p2on && !!p2s;
  if (p1s) labelP1.position.set(
    p1s.body.position.x, p1s.body.position.y + 1.0, p1s.body.position.z);
  if (p2s) labelP2.position.set(
    p2s.body.position.x, p2s.body.position.y + 1.0, p2s.body.position.z);

  // 카메라: P1 마디 추종
  if (p1s) {
    camTarget.set(
      p1s.body.position.x + CFG.camOffset.x,
      p1s.body.position.y + CFG.camOffset.y,
      p1s.body.position.z + CFG.camOffset.z);
    camera.position.lerp(camTarget, 0.08);
    camera.lookAt(
      p1s.body.position.x, p1s.body.position.y + 0.8, p1s.body.position.z);
  }

  updateHud();
  renderer.render(scene, camera);
}

// ------------------------------------------------------------------
// HUD (DOM)
// ------------------------------------------------------------------
const hudSynergyBar = document.getElementById('synergy-bar');
const hudStatus = document.getElementById('status');
const toastEl = document.getElementById('toast');
let toastTimer = null;

function toast(msg, ms) {
  toastEl.textContent = msg;
  toastEl.style.opacity = '1';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.style.opacity = '0'; }, ms || 2500);
}

function updateHud() {
  hudSynergyBar.style.width = `${Math.round(synergyNow * 100)}%`;
  hudSynergyBar.style.background =
    synergyNow > 0.66 ? '#5da863' : synergyNow > 0.33 ? '#d9a531' : '#cf5f5f';
  hudStatus.textContent =
    `화물 ${cargoOnBack()}/${cargos.length} 유지 · 마디 ${segs.length}개 · ` +
    (state.autopilot ? '자동주행 ON(B)' : `P2 ${state.p2on ? 'ON' : 'OFF'}(P)`) +
    (state.selfCollide ? '' : ' · 자가충돌 OFF(X)');
}

function toggleHelp() {
  const el = document.getElementById('help');
  el.style.display = el.style.display === 'none' ? 'flex' : 'none';
}

// ------------------------------------------------------------------
// 리셋 / 부팅
// ------------------------------------------------------------------
function reset() {
  state.delivered = false;
  state.grip.p1 = { body: null, mesh: null, jumpLatch: false };
  state.grip.p2 = { body: null, mesh: null, jumpLatch: false };
  buildCentipede(state.n);
  state.p1 = clampIdx(state.p1);
  state.p2 = clampIdx(segs.length - 1);
  spawnCargo();
}

buildCourse();
reset();
camera.position.set(0, 8, 10);
requestAnimationFrame(animate);

// 디버그 훅 (자동 검증용)
window.__kick = (vz) => { for (const s of segs) s.body.velocity.z = vz; };
window.__dbg = () => ({
  n: segs.length,
  steps: stepCount,
  sleep: segs.map((s) => s.body.sleepState),
  autopilot: state.autopilot,
  headV: segs[0] ? {
    x: +segs[0].body.velocity.x.toFixed(2),
    y: +segs[0].body.velocity.y.toFixed(2),
    z: +segs[0].body.velocity.z.toFixed(2),
  } : null,
  synergy: synergyNow,
  delivered: state.delivered,
  cargoOnBack: cargoOnBack(),
  head: segs[0] ? {
    x: +segs[0].body.position.x.toFixed(2),
    y: +segs[0].body.position.y.toFixed(2),
    z: +segs[0].body.position.z.toFixed(2),
  } : null,
  positions: segs.map((s) => ({
    x: +s.body.position.x.toFixed(1),
    y: +s.body.position.y.toFixed(1),
    z: +s.body.position.z.toFixed(1),
  })),
  grounded: segs.map((s) => grounded(s.body)),
  statics: segs.map((s) => s.body.type !== CANNON.Body.DYNAMIC), // 앵커(KINEMATIC) 여부
});
