/*
 * CENTIPEDE EXPRESS — 코어 물리 프로토타입 (v0.1)
 * 기획서 3.1 "한 몸, 여러 뇌" 검증용 그레이박스.
 *
 * 목표: 연결된 마디 지네를 여러 뇌(사람 + 봇)가 조종할 때
 *       "몸이 하나로 묶여 있다"는 긴장과 물리 코미디가 재밌는지 확인.
 *
 * 이 프로토타입에 있는 것 (코어 물리만):
 *  - 관절로 연결된 N개 마디, 마디별 독립 조작(힘 적용)
 *  - 사람 뇌 2개(P1 WASD / P2 방향키) + 나머지는 봇 마디(추종 AI)
 *  - 점프 / 그립(앵커) 공용 액션
 *  - 등 위에 얹혀 기울면 미끄러져 떨어지는 화물
 *  - 같은 방향으로 갈수록 빨라지는 시너지 게이지
 *  - 계단 / 낭떠러지 / 높은 단 지형
 *
 * 아직 없는 것: 배달 평가 루프, 특수 마디, 화물 6종, 네트워킹, 아트.
 */

const {
  Engine, Render, Runner, Bodies, Body, Composite,
  Constraint, Events, Vector, Query,
} = Matter;

// ------------------------------------------------------------------
// 튜닝 상수 (여기 숫자를 바꿔가며 "느낌"을 찾는 게 이 프로토타입의 핵심)
// ------------------------------------------------------------------
const CFG = {
  segW: 46, segH: 30, segChamfer: 12,
  segGap: 8,          // 마디 사이 관절 길이(작을수록 촘촘)
  jointStiffness: 0.85,
  jointDamping: 0.12,

  moveForce: 0.0032,  // 마디당 이동 힘(질량 비례)
  jumpV: 9,           // 점프 순간 속도
  maxSpeed: 14,       // 마디 속도 상한(물리 폭주 방지)

  botFollow: 0.55,    // 봇이 사람 입력 방향을 따라가는 힘 배율(사람 대비)
  botHopCd: 24,       // 봇 자동 점프 쿨다운(프레임)

  synergyMinBonus: 0.6, // 정렬 0일 때 힘 배율
  synergyMaxBonus: 1.6, // 정렬 1일 때 힘 배율

  cargoCount: 5,
  view: { w: 1000, h: 640 }, // 카메라 뷰 크기(월드 단위)
};

// ------------------------------------------------------------------
// 엔진 / 렌더 세팅
// ------------------------------------------------------------------
const canvas = document.getElementById('stage');
const engine = Engine.create();
engine.gravity.y = 1;
engine.positionIterations = 16;
engine.velocityIterations = 10;
engine.constraintIterations = 4;

const render = Render.create({
  canvas,
  engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: '#0e1726',
    hasBounds: true,
    showSleeping: false,
  },
});
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

window.addEventListener('resize', () => {
  render.options.width = window.innerWidth;
  render.options.height = window.innerHeight;
  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;
});

// ------------------------------------------------------------------
// 지형 (사이드뷰: y가 아래로 증가)
// 시작 바닥 → 계단 → 낭떠러지(구덩이) → 높은 단 → 도착 바닥
// ------------------------------------------------------------------
const terrain = [];
function makeGround() {
  terrain.length = 0;
  const g = (x, y, w, h) =>
    Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      friction: 0.9,
      render: { fillStyle: '#25324a' },
      label: 'terrain',
    });

  terrain.push(g(400, 620, 900, 80));      // 시작 바닥          top 580, x -50..850
  terrain.push(g(910, 600, 130, 60));      // 계단 1            top 570
  terrain.push(g(1040, 580, 130, 100));    // 계단 2            top 530, 우끝 1105
  // (1105 ~ 1210) 낭떠러지 ~105px — 협동 점프로 건너기
  terrain.push(g(1470, 560, 520, 60));     // 중간 단           top 530, x 1210..1730
  // (1730 ~ 1800) 얕은 단차
  terrain.push(g(2200, 600, 900, 80));     // 도착 바닥         top 560, x 1750..2650
  // 좌측 벽
  terrain.push(g(-70, 380, 40, 700));
  Composite.add(engine.world, terrain);

  // 도착 지점 표식
  goalX = 2350;
}
let goalX = 2350;

// ------------------------------------------------------------------
// 지네 (연결된 마디들)
// ------------------------------------------------------------------
let centipede = { segments: [], joints: [], selfCollide: true };
let segGroupOn, segGroupOff;

function buildCentipede(n) {
  // 기존 제거
  centipede.segments.forEach((s) => Composite.remove(engine.world, s));
  centipede.joints.forEach((j) => Composite.remove(engine.world, j));
  centipede.segments = [];
  centipede.joints = [];

  segGroupOff = Body.nextGroup(true);  // 음수: 같은 그룹끼리 충돌 안 함
  segGroupOn = Body.nextGroup(false);  // 양수: 항상 충돌
  const group = centipede.selfCollide ? segGroupOn : segGroupOff;

  const startX = 200, startY = 540;
  const step = CFG.segW + CFG.segGap;

  // 머리(i=0)를 오른쪽 끝(진행 방향 선두)에, 꼬리를 왼쪽에 배치
  for (let i = 0; i < n; i++) {
    const isHead = i === 0;
    const isTail = i === n - 1;
    const s = Bodies.rectangle(
      startX + (n - 1 - i) * step, startY, CFG.segW, CFG.segH,
      {
        chamfer: { radius: CFG.segChamfer },
        friction: 0.85,
        frictionAir: 0.02,
        density: 0.0016,
        restitution: 0.02,
        collisionFilter: { group },
        label: isHead ? 'head' : isTail ? 'tail' : 'body',
        render: {
          fillStyle: isHead ? '#ffd166' : isTail ? '#6a8bbf' : '#7bc47f',
          strokeStyle: '#0e1726',
          lineWidth: 2,
        },
      },
    );
    s._hopcd = 0;
    centipede.segments.push(s);
  }

  // 관절: 마디 i(오른쪽)의 왼끝 ↔ 마디 i+1(왼쪽)의 오른끝
  for (let i = 0; i < n - 1; i++) {
    const a = centipede.segments[i];
    const b = centipede.segments[i + 1];
    const j = Constraint.create({
      bodyA: a, pointA: { x: -CFG.segW * 0.5, y: 0 },
      bodyB: b, pointB: { x: CFG.segW * 0.5, y: 0 },
      length: CFG.segGap,
      stiffness: CFG.jointStiffness,
      damping: CFG.jointDamping,
      render: { strokeStyle: '#3a4a66', lineWidth: 3 },
    });
    centipede.joints.push(j);
  }

  Composite.add(engine.world, centipede.segments);
  Composite.add(engine.world, centipede.joints);
}

function setSelfCollide(on) {
  centipede.selfCollide = on;
  const group = on ? segGroupOn : segGroupOff;
  centipede.segments.forEach((s) => (s.collisionFilter.group = group));
}

// ------------------------------------------------------------------
// 화물 (등 위에 얹히는 상자 — 기울면 미끄러져 떨어짐)
// ------------------------------------------------------------------
let cargo = [];
function spawnCargo() {
  cargo.forEach((c) => Composite.remove(engine.world, c));
  cargo = [];
  const seg = centipede.segments;
  if (!seg.length) return;
  const size = CFG.segH * 0.8;
  const mid = Math.floor(seg.length / 2);
  for (let i = 0; i < CFG.cargoCount; i++) {
    const host = seg[Math.min(seg.length - 1, mid - 2 + i)];
    const box = Bodies.rectangle(
      host.position.x, host.position.y - CFG.segH, size, size,
      {
        friction: 0.9, frictionAir: 0.01, density: 0.0008, restitution: 0.05,
        label: 'cargo',
        render: { fillStyle: '#c98a4b', strokeStyle: '#0e1726', lineWidth: 2 },
      },
    );
    cargo.push(box);
  }
  Composite.add(engine.world, cargo);
}

// ------------------------------------------------------------------
// 입력
// ------------------------------------------------------------------
const keys = {
  p1: { left: false, right: false, jump: false, grip: false },
  p2: { left: false, right: false, jump: false, grip: false },
};
const state = {
  n: 4,
  p1: 0,          // P1이 조종하는 마디 인덱스
  p2: 3,          // P2가 조종하는 마디 인덱스
  p2on: false,    // P2 활성화 여부
  autopilot: false, // 전원 봇(자동 주행) 토글
  grip: { p1: { active: false, jumpLatch: false }, p2: { active: false, jumpLatch: false } },
};

function clampIdx(i) {
  return Math.max(0, Math.min(centipede.segments.length - 1, i));
}

window.addEventListener('keydown', (e) => {
  switch (e.code) {
    // P1 (WASD)
    case 'KeyA': keys.p1.left = true; break;
    case 'KeyD': keys.p1.right = true; break;
    case 'KeyW': case 'Space': keys.p1.jump = true; break;
    case 'KeyS': keys.p1.grip = true; break;
    // P2 (방향키)
    case 'ArrowLeft': keys.p2.left = true; e.preventDefault(); break;
    case 'ArrowRight': keys.p2.right = true; e.preventDefault(); break;
    case 'ArrowUp': keys.p2.jump = true; e.preventDefault(); break;
    case 'ArrowDown': keys.p2.grip = true; e.preventDefault(); break;
    // P1 뇌 배치: 숫자 1~8
    case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4':
    case 'Digit5': case 'Digit6': case 'Digit7': case 'Digit8':
      state.p1 = clampIdx(parseInt(e.code.slice(5), 10) - 1); break;
    // P2 토글 / 이동
    case 'KeyP': state.p2on = !state.p2on; break;
    case 'BracketLeft': state.p2 = clampIdx(state.p2 - 1); break;
    case 'BracketRight': state.p2 = clampIdx(state.p2 + 1); break;
    // 마디 수 조절 (2 vs 8 스케일 체감)
    case 'Equal': case 'NumpadAdd':
      state.n = Math.min(8, state.n + 1); reset(); break;
    case 'Minus': case 'NumpadSubtract':
      state.n = Math.max(2, state.n - 1); reset(); break;
    // 기타
    case 'KeyR': reset(); break;
    case 'KeyC': spawnCargo(); break;
    case 'KeyB': state.autopilot = !state.autopilot; break;
    case 'KeyX': setSelfCollide(!centipede.selfCollide); break;
    case 'KeyH': toggleHelp(); break;
  }
});
window.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyA': keys.p1.left = false; break;
    case 'KeyD': keys.p1.right = false; break;
    case 'KeyW': case 'Space': keys.p1.jump = false; break;
    case 'KeyS': keys.p1.grip = false; break;
    case 'ArrowLeft': keys.p2.left = false; break;
    case 'ArrowRight': keys.p2.right = false; break;
    case 'ArrowUp': keys.p2.jump = false; break;
    case 'ArrowDown': keys.p2.grip = false; break;
  }
});

// ------------------------------------------------------------------
// 물리 헬퍼
// ------------------------------------------------------------------
function grounded(s) {
  const from = { x: s.position.x, y: s.position.y };
  const to = { x: s.position.x, y: s.position.y + CFG.segH * 0.5 + 6 };
  return Query.ray(terrain.concat(centipede.segments.filter((o) => o !== s)),
    from, to, 4).length > 0;
}

function clampSpeed(s) {
  const sp = Vector.magnitude(s.velocity);
  if (sp > CFG.maxSpeed) {
    Body.setVelocity(s, Vector.mult(Vector.normalise(s.velocity), CFG.maxSpeed));
  }
}

function computeSynergy() {
  const seg = centipede.segments;
  let total = 0, net = 0;
  seg.forEach((s) => { total += Math.abs(s.velocity.x); net += s.velocity.x; });
  if (total < 0.6) return 0;
  return Math.min(1, Math.abs(net) / total);
}

function applyHuman(s, k, tag, synergy) {
  const g = state.grip[tag];
  // 그립(앵커): 누르는 동안 마디를 고정 → 브레이크/앵커 역할
  if (k.grip && !g.active) { Body.setStatic(s, true); g.active = true; }
  if (!k.grip && g.active) { Body.setStatic(s, false); g.active = false; }
  if (s.isStatic) return;

  const dir = (k.right ? 1 : 0) - (k.left ? 1 : 0);
  if (dir !== 0) {
    const bonus = CFG.synergyMinBonus +
      (CFG.synergyMaxBonus - CFG.synergyMinBonus) * synergy;
    const f = CFG.moveForce * s.mass * bonus * dir;
    Body.applyForce(s, s.position, { x: f, y: 0 });
  }
  if (k.jump && grounded(s) && !g.jumpLatch) {
    Body.setVelocity(s, { x: s.velocity.x, y: -CFG.jumpV });
    g.jumpLatch = true;
  }
  if (!k.jump) g.jumpLatch = false;
}

// 봇이 참고할 "사람 입력 방향" — 가장 가까운 사람 마디를 협력 추종
function humanDir(i) {
  if (state.autopilot) { // 자동주행: 목표까지만 오른쪽으로 흐름
    const head = centipede.segments[0];
    return head && head.position.x < goalX ? 1 : 0;
  }
  const p1dir = (keys.p1.right ? 1 : 0) - (keys.p1.left ? 1 : 0);
  if (!state.p2on) return p1dir;
  const p2dir = (keys.p2.right ? 1 : 0) - (keys.p2.left ? 1 : 0);
  return Math.abs(i - state.p1) <= Math.abs(i - state.p2) ? p1dir : p2dir;
}

function applyBot(s, i, synergy) {
  if (s.isStatic) return;
  const dir = humanDir(i);
  if (dir !== 0) {
    const bonus = CFG.synergyMinBonus +
      (CFG.synergyMaxBonus - CFG.synergyMinBonus) * synergy;
    const f = CFG.moveForce * s.mass * CFG.botFollow * bonus * dir;
    Body.applyForce(s, s.position, { x: f, y: 0 });
  }
  // 자동 점프: 이웃이 확 높거나(계단), 진행 방향 정면이 막혔을 때(벽/단차)
  if (s._hopcd > 0) s._hopcd--;
  const neighbors = [centipede.segments[i - 1], centipede.segments[i + 1]];
  const higher = neighbors.some((nb) => nb && nb.position.y < s.position.y - CFG.segH * 1.2);
  let blocked = false;
  if (dir !== 0) {
    const fx = s.position.x + dir * (CFG.segW * 0.5 + 12);
    blocked = Query.ray(terrain, { x: s.position.x, y: s.position.y },
      { x: fx, y: s.position.y }, 6).length > 0;
  }
  if ((higher || blocked) && grounded(s) && s._hopcd === 0) {
    Body.setVelocity(s, { x: s.velocity.x, y: -CFG.jumpV * 0.95 });
    s._hopcd = CFG.botHopCd;
  }
}

// ------------------------------------------------------------------
// 메인 루프 훅
// ------------------------------------------------------------------
Events.on(engine, 'beforeUpdate', () => {
  const seg = centipede.segments;
  if (!seg.length) return;
  const synergy = computeSynergy();
  window._synergy = synergy;

  seg.forEach((s, i) => {
    const isP1 = i === state.p1 && !state.autopilot;
    const isP2 = state.p2on && i === state.p2 && !state.autopilot;
    if (isP1) applyHuman(s, keys.p1, 'p1', synergy);
    else if (isP2) applyHuman(s, keys.p2, 'p2', synergy);
    else applyBot(s, i, synergy);
  });
  seg.forEach(clampSpeed);
});

// 카메라: 조종 마디 중심으로 따라감
Events.on(render, 'beforeRender', () => {
  const seg = centipede.segments;
  if (!seg.length) return;
  const focus = seg[clampIdx(state.p1)];
  const { w, h } = CFG.view;
  Render.lookAt(render, {
    min: { x: focus.position.x - w / 2, y: focus.position.y - h / 2 },
    max: { x: focus.position.x + w / 2, y: focus.position.y + h / 2 },
  });
});

// ------------------------------------------------------------------
// HUD 오버레이 (마디 라벨, 눈, 시너지 게이지, 화물 상태)
// ------------------------------------------------------------------
Events.on(render, 'afterRender', () => {
  const ctx = render.context;
  const b = render.bounds;
  const sx = render.options.width / (b.max.x - b.min.x);
  const sy = render.options.height / (b.max.y - b.min.y);
  const toX = (x) => (x - b.min.x) * sx;
  const toY = (y) => (y - b.min.y) * sy;

  const seg = centipede.segments;

  // 도착 지점 깃발
  const gxs = toX(goalX);
  ctx.strokeStyle = '#7bc47f'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(gxs, toY(560)); ctx.lineTo(gxs, toY(440)); ctx.stroke();
  ctx.fillStyle = '#7bc47f';
  ctx.beginPath();
  ctx.moveTo(gxs, toY(440)); ctx.lineTo(gxs + 34, toY(452)); ctx.lineTo(gxs, toY(468));
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0e1726'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('GOAL', gxs + 15, toY(452) + 4);

  // 도착 알림
  if (seg[0] && seg[0].position.x > goalX) {
    ctx.fillStyle = '#7bc47f';
    ctx.font = '600 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🎉 배달 도착! 화물 ${cargoOnBack()}/${cargo.length} 유지`,
      render.options.width / 2, 70);
  }

  // 머리 눈
  if (seg[0]) {
    const hd = seg[0];
    ctx.fillStyle = '#0e1726';
    const ex = toX(hd.position.x + Math.cos(hd.angle) * 12);
    const ey = toY(hd.position.y + Math.sin(hd.angle) * 12);
    ctx.beginPath(); ctx.arc(ex, ey - 3 * sy, 3.2 * sx, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex, ey + 3 * sy, 3.2 * sx, 0, Math.PI * 2); ctx.fill();
  }

  // 마디 라벨
  ctx.textAlign = 'center';
  ctx.font = `${Math.round(13)}px system-ui, sans-serif`;
  seg.forEach((s, i) => {
    let tag = '', col = '#9fb3c8';
    if (!state.autopilot && i === state.p1) { tag = 'P1'; col = '#ffd166'; }
    else if (!state.autopilot && state.p2on && i === state.p2) { tag = 'P2'; col = '#6ad1ff'; }
    else { tag = 'bot'; col = '#7fa88a'; }
    if (s.isStatic) tag += '⚓';
    ctx.fillStyle = col;
    ctx.fillText(tag, toX(s.position.x), toY(s.position.y) - CFG.segH * sy);
  });

  drawHud(ctx);
});

function drawHud(ctx) {
  const W = render.options.width;
  ctx.save();
  ctx.textAlign = 'left';

  // 시너지 게이지
  const syn = window._synergy || 0;
  const gx = 20, gy = 24, gw = 220, gh = 16;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(gx, gy, gw, gh);
  ctx.fillStyle = syn > 0.66 ? '#7bc47f' : syn > 0.33 ? '#ffd166' : '#e57373';
  ctx.fillRect(gx, gy, gw * syn, gh);
  ctx.fillStyle = '#dfe7f0';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`시너지(정렬) ${Math.round(syn * 100)}%`, gx, gy - 6);

  // 화물 상태
  const onBack = cargoOnBack();
  ctx.fillText(`화물 ${onBack}/${cargo.length} 유지  ·  마디 ${state.segLen}개  ·  ${state.autopilot ? '자동주행(B)' : 'P2 ' + (state.p2on ? 'ON' : 'OFF') + '(P)'}${centipede.selfCollide ? '  ·  자가충돌 ON(X)' : ''}`,
    gx, gy + gh + 18);

  // 하단 조작 힌트
  ctx.fillStyle = 'rgba(223,231,240,0.75)';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('P1: A/D 이동  W·Space 점프  S 그립   |   P2: ←/→  ↑  ↓ (P로 켜기)   |   1~8 P1마디  [ ] P2마디   +/- 길이   R 리셋   C 화물   B 자동   X 자가충돌   H 도움말',
    20, render.options.height - 16);
  ctx.restore();
}

function centipedeCenterX() {
  const seg = centipede.segments;
  if (!seg.length) return 0;
  return seg.reduce((a, s) => a + s.position.x, 0) / seg.length;
}

// 등 위에 실제로 얹혀 있는 화물 수: 몸통 x범위 안 + 마디 중심보다 위
function cargoOnBack() {
  const seg = centipede.segments;
  if (!seg.length) return 0;
  const xs = seg.map((s) => s.position.x);
  const minX = Math.min(...xs) - 30, maxX = Math.max(...xs) + 30;
  const avgY = seg.reduce((a, s) => a + s.position.y, 0) / seg.length;
  return cargo.filter((c) =>
    c.position.x > minX && c.position.x < maxX && c.position.y < avgY - 4).length;
}

// ------------------------------------------------------------------
// 도움말 패널
// ------------------------------------------------------------------
function toggleHelp() {
  const el = document.getElementById('help');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// ------------------------------------------------------------------
// 리셋 / 부팅
// ------------------------------------------------------------------
function reset() {
  buildCentipede(state.n);
  state.p1 = clampIdx(state.p1);
  state.p2 = clampIdx(centipede.segments.length - 1);
  state.grip.p1 = { active: false, jumpLatch: false };
  state.grip.p2 = { active: false, jumpLatch: false };
  state.segLen = state.n;
  spawnCargo();
}

// state.segLen HUD용
state.segLen = state.n;

makeGround();
reset();

// 디버그 훅 (자동 검증용)
window.__dbg = () => ({
  synergy: window._synergy,
  n: centipede.segments.length,
  centerX: centipedeCenterX(),
  spread: Math.max(...centipede.segments.map((s) => s.position.x)) -
          Math.min(...centipede.segments.map((s) => s.position.x)),
  positions: centipede.segments.map((s) => Math.round(s.position.x)),
  cargoOnBack: cargoOnBack(),
});
