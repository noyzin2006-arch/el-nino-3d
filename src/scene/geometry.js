/* 3D 几何：海盆剖体、表面暖色带、温跃层、风、沃克环流、上升流、雨带。
   渲染资源创建一次；update 只改 buffer / 位置 / 透明度。模型单位，非实测。 */
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { sampleThermocline, sampleSurfaceWarmth, samplePhysics } from '../core/physics.js';

const BASIN = {
  xMin: -6,
  xMax: 6,
  zMin: -2.2,
  zMax: 2.2,
  yBottom: -2.3,
  ySurface: 0,
  frontZ: 2.21,
};

function makeColor(THREE, hex) {
  return new THREE.Color(hex);
}

/** 暖色带：cold → mid → warm 三段平滑（带 S 形偏置，保证冷暖两端可分辨）。 */
function warmthColor(THREE, colors, t, out) {
  let x = Math.min(1, Math.max(0, t));
  x = x * x * (3 - 2 * x);
  if (x < 0.5) out.lerpColors(colors.cold, colors.mid, x * 2);
  else out.lerpColors(colors.mid, colors.warm, (x - 0.5) * 2);
  return out;
}

function makeDashedLine(THREE, points, color, width, dashSize, gapSize) {
  const geometry = new LineGeometry();
  geometry.setPositions(points.flat());
  const material = new LineMaterial({
    color,
    linewidth: width,
    dashed: true,
    dashSize,
    gapSize,
    transparent: true,
    depthWrite: false,
  });
  const line = new Line2(geometry, material);
  line.renderOrder = 5;
  line.computeLineDistances();
  return line;
}

export function createOceanSystem(THREE, theme, initialResolution = { w: 800, h: 600 }) {
  const group = new THREE.Group();
  const disposables = [];
  const track = (obj) => {
    disposables.push(obj);
    return obj;
  };

  const colors = {
    cold: makeColor(THREE, theme.oceanCold),
    mid: makeColor(THREE, theme.oceanMid),
    warm: makeColor(THREE, theme.oceanWarm),
    deep: makeColor(THREE, theme.deepSea),
    thermocline: makeColor(THREE, theme.thermocline),
    wind: makeColor(THREE, theme.wind),
    rain: makeColor(THREE, theme.rain),
    accent: makeColor(THREE, theme.accent),
  };

  /* ---- 海盆：底 + 后壁 + 两侧壁（不透明深海色，合并为 1 次绘制） ---- */
  const wallGeoms = [];
  const mkPlane = (w, h) => new THREE.PlaneGeometry(w, h);
  // 底面
  {
    const g = mkPlane(BASIN.xMax - BASIN.xMin, BASIN.zMax - BASIN.zMin);
    g.rotateX(-Math.PI / 2);
    g.translate(0, BASIN.yBottom, 0);
    wallGeoms.push(g);
  }
  // 后壁 z=zMin
  {
    const g = mkPlane(BASIN.xMax - BASIN.xMin, -BASIN.yBottom);
    g.translate(0, BASIN.yBottom / 2, BASIN.zMin);
    wallGeoms.push(g);
  }
  // 左右壁
  for (const x of [BASIN.xMin, BASIN.xMax]) {
    const g = mkPlane(BASIN.zMax - BASIN.zMin, -BASIN.yBottom);
    g.rotateY(Math.PI / 2);
    g.translate(x, BASIN.yBottom / 2, 0);
    wallGeoms.push(g);
  }
  const wallGeometry = track(
    BufferGeometryUtils.mergeGeometries(wallGeoms.map((g) => g.toNonIndexed())),
  );
  const wallMaterial = track(
    new THREE.MeshBasicMaterial({ color: colors.deep, transparent: true, opacity: 0.92 }),
  );
  const walls = new THREE.Mesh(wallGeometry, wallMaterial);
  walls.renderOrder = 0;
  group.add(walls);

  /* ---- 前切面（温跃层感知的双色剖面，depthWrite=false） ---- */
  const FRONT_SEG_X = 96;
  const FRONT_SEG_Y = 24;
  const frontGeometry = track(new THREE.PlaneGeometry(12, 2.3, FRONT_SEG_X, FRONT_SEG_Y));
  frontGeometry.translate(0, BASIN.yBottom / 2, BASIN.frontZ);
  const frontColors = new Float32Array(frontGeometry.attributes.position.count * 3);
  frontGeometry.setAttribute('color', new THREE.BufferAttribute(frontColors, 3));
  const frontMaterial = track(
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    }),
  );
  const frontFace = new THREE.Mesh(frontGeometry, frontMaterial);
  frontFace.renderOrder = 2;
  group.add(frontFace);

  /* ---- 海面：128×32 顶点色平面 ---- */
  const surfaceGeometry = track(new THREE.PlaneGeometry(12, 4.4, 128, 32));
  surfaceGeometry.rotateX(-Math.PI / 2);
  surfaceGeometry.translate(0, 0.04, 0);
  const surfColors = new Float32Array(surfaceGeometry.attributes.position.count * 3);
  surfaceGeometry.setAttribute('color', new THREE.BufferAttribute(surfColors, 3));
  const surfaceMaterial = track(
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    }),
  );
  const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
  surface.renderOrder = 3;
  group.add(surface);

  /* ---- 温跃层 3D 曲面（半透明黄色层） ---- */
  const THERMO_SEG_X = 48;
  const THERMO_SEG_Z = 10;
  const thermoGrid = track(
    new THREE.PlaneGeometry(12, 4.4, THERMO_SEG_X, THERMO_SEG_Z),
  );
  thermoGrid.rotateX(-Math.PI / 2);
  const thermoSheetMaterial = track(
    new THREE.MeshBasicMaterial({
      color: colors.thermocline,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  const thermoSheet = new THREE.Mesh(thermoGrid, thermoSheetMaterial);
  thermoSheet.renderOrder = 1;
  group.add(thermoSheet);

  /* ---- 温跃层前缘黄色实线 ---- */
  const thermoLineGeometry = track(new THREE.BufferGeometry());
  const thermoLinePositions = new Float32Array(97 * 3);
  thermoLineGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(thermoLinePositions, 3),
  );
  const thermoLineMaterial = track(
    new THREE.LineBasicMaterial({ color: colors.thermocline, transparent: true, opacity: 0.95 }),
  );
  const thermoLine = new THREE.Line(thermoLineGeometry, thermoLineMaterial);
  thermoLine.renderOrder = 4;
  group.add(thermoLine);

  /* ---- 信风箭头：12 个向西 ArrowHelper ---- */
  const windArrows = [];
  const windZRows = [-0.8, 0, 0.8, 1.6];
  const windXCols = [-3.5, 0, 3.5];
  for (const z of windZRows) {
    for (const x of windXCols) {
      const helper = new THREE.ArrowHelper(
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(x, 0.65, z),
        1.4,
        colors.wind,
        0.34,
        0.2,
      );
      helper.line.material.transparent = true;
      helper.line.material.depthWrite = false;
      helper.cone.material.transparent = true;
      helper.cone.material.depthWrite = false;
      helper.renderOrder = 5;
      track(helper.line.geometry);
      track(helper.line.material);
      track(helper.cone.geometry);
      track(helper.cone.material);
      group.add(helper);
      windArrows.push(helper);
    }
  }

  /* ---- 沃克环流：z=-1.6 平面四条点线 + 方向锥 ---- */
  const walkerMaterial = track(
    new LineMaterial({
      color: colors.wind,
      linewidth: 2,
      dashed: true,
      dashSize: 0.28,
      gapSize: 0.2,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    }),
  );
  const walkerLines = [];
  const WZ = -1.6;
  const walkerPaths = [
    [ [-4.6, 0.65, WZ], [-4.6, 3.3, WZ] ],   // 西端上升
    [ [-4.6, 3.3, WZ], [4.6, 3.3, WZ] ],     // 高空东回流
    [ [4.6, 3.3, WZ], [4.6, 0.65, WZ] ],     // 东端下沉
  ];
  for (const pts of walkerPaths) {
    const g = track(new LineGeometry());
    g.setPositions(pts.flat());
    const line = new Line2(g, walkerMaterial);
    line.computeLineDistances();
    line.renderOrder = 5;
    walkerLines.push(line);
    group.add(line);
  }
  // 方向锥：高空 +X、底部 -X
  const coneGeometry = track(new THREE.ConeGeometry(0.14, 0.4, 8));
  const coneMaterial = track(
    new THREE.MeshBasicMaterial({ color: colors.wind, transparent: true, depthWrite: false }),
  );
  const topCone = new THREE.Mesh(coneGeometry, coneMaterial);
  topCone.position.set(0.6, 3.3, WZ);
  topCone.rotation.z = -Math.PI / 2;
  topCone.renderOrder = 5;
  const bottomCone = new THREE.Mesh(coneGeometry, coneMaterial);
  bottomCone.position.set(-0.6, 0.65, WZ);
  bottomCone.rotation.z = Math.PI / 2;
  bottomCone.renderOrder = 5;
  group.add(topCone, bottomCone);

  /* ---- 东部上升流：蓝色虚线向上 ---- */
  const upwellingMaterial = track(
    new LineMaterial({
      color: colors.rain,
      linewidth: 3,
      dashed: true,
      dashSize: 0.16,
      gapSize: 0.12,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    }),
  );
  const upwellingLines = [];
  for (const z of [0.2, 1.4]) {
    const g = track(new LineGeometry());
    g.setPositions([5.25, -1.2, z, 5.25, -0.08, z]);
    const line = new Line2(g, upwellingMaterial);
    line.computeLineDistances();
    line.renderOrder = 5;
    upwellingLines.push(line);
    group.add(line);
  }

  /* ---- 雨带与对流 ---- */
  const rainGroup = new THREE.Group();
  // 云：扁平二十面体
  const cloudGeometry = track(new THREE.IcosahedronGeometry(0.55, 0));
  const cloudMaterial = track(
    new THREE.MeshBasicMaterial({ color: colors.wind, transparent: true, opacity: 0.5 }),
  );
  const cloud1 = new THREE.Mesh(cloudGeometry, cloudMaterial);
  cloud1.scale.set(1.6, 0.55, 1);
  cloud1.position.set(0, 1.75, 0);
  const cloud2 = new THREE.Mesh(cloudGeometry, cloudMaterial);
  cloud2.scale.set(1.1, 0.45, 0.8);
  cloud2.position.set(0.7, 1.55, 0.2);
  rainGroup.add(cloud1, cloud2);

  const rainMaterial = track(
    new LineMaterial({
      color: colors.rain,
      linewidth: 2,
      dashed: true,
      dashSize: 0.12,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    }),
  );
  const rainLines = [];
  for (let i = 0; i < 5; i++) {
    const dx = -0.7 + i * 0.35;
    const g = track(new LineGeometry());
    g.setPositions([dx, 1.25, (i % 2) * 0.4 - 0.2, dx, 0.1, (i % 2) * 0.4 - 0.2]);
    const line = new Line2(g, rainMaterial);
    line.computeLineDistances();
    line.renderOrder = 5;
    rainLines.push(line);
    rainGroup.add(line);
  }
  rainGroup.renderOrder = 5;
  group.add(rainGroup);

  /* ---- 影响导向虚线（impact=1 亮起） ---- */
  const arcPoints = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    arcPoints.push([-5.4 + 10.8 * t, 3.9 + Math.sin(t * Math.PI) * 0.5, 0]);
  }
  const arcGeometry = track(new LineGeometry());
  arcGeometry.setPositions(arcPoints.flat());
  const arcMaterial = track(
    new LineMaterial({
      color: colors.accent,
      linewidth: 2,
      dashed: true,
      dashSize: 0.3,
      gapSize: 0.18,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  const impactArc = new Line2(arcGeometry, arcMaterial);
  impactArc.computeLineDistances();
  impactArc.renderOrder = 6;
  group.add(impactArc);

  /* ---- 动态更新 ---- */
  let lastOcean = -1;
  const tmpColor = new THREE.Color();
  const deepColor = colors.deep.clone().multiplyScalar(0.55);

  function updateSectionColors(ocean) {
    // 前切面
    const pos = frontGeometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const u = (x - BASIN.xMin) / (BASIN.xMax - BASIN.xMin);
      const d = sampleThermocline(u, ocean);
      if (y > -d) {
        warmthColor(THREE, colors, sampleSurfaceWarmth(u, ocean), tmpColor);
      } else {
        tmpColor.copy(deepColor);
      }
      frontColors[i * 3] = tmpColor.r;
      frontColors[i * 3 + 1] = tmpColor.g;
      frontColors[i * 3 + 2] = tmpColor.b;
    }
    frontGeometry.attributes.color.needsUpdate = true;

    // 海面
    const spos = surfaceGeometry.attributes.position;
    for (let i = 0; i < spos.count; i++) {
      const u = (spos.getX(i) - BASIN.xMin) / (BASIN.xMax - BASIN.xMin);
      warmthColor(THREE, colors, sampleSurfaceWarmth(u, ocean), tmpColor);
      surfColors[i * 3] = tmpColor.r;
      surfColors[i * 3 + 1] = tmpColor.g;
      surfColors[i * 3 + 2] = tmpColor.b;
    }
    surfaceGeometry.attributes.color.needsUpdate = true;

    // 温跃层曲面和前缘线
    const tpos = thermoGrid.attributes.position;
    for (let i = 0; i < tpos.count; i++) {
      const u = (tpos.getX(i) - BASIN.xMin) / (BASIN.xMax - BASIN.xMin);
      tpos.setY(i, -sampleThermocline(u, ocean));
    }
    tpos.needsUpdate = true;
    thermoGrid.computeVertexNormals();

    for (let i = 0; i <= 96; i++) {
      const u = i / 96;
      thermoLinePositions[i * 3] = BASIN.xMin + 12 * u;
      thermoLinePositions[i * 3 + 1] = -sampleThermocline(u, ocean);
      thermoLinePositions[i * 3 + 2] = BASIN.frontZ + 0.02;
    }
    thermoLineGeometry.attributes.position.needsUpdate = true;
  }

  updateSectionColors(0);

  function update(ocean, impact, elapsed) {
    const p = samplePhysics(ocean, impact);

    if (Math.abs(ocean - lastOcean) > 0.0005) {
      updateSectionColors(ocean);
      lastOcean = ocean;
    }

    // 信风：长度/透明度联动
    const windLen = 1.4 * (0.35 + 0.65 * p.tradeStrength);
    const windOpacity = 0.25 + 0.75 * p.tradeStrength;
    for (const helper of windArrows) {
      helper.setLength(windLen, 0.34, 0.2);
      helper.line.material.opacity = windOpacity;
      helper.cone.material.opacity = windOpacity;
    }

    // 沃克环流
    walkerMaterial.opacity = 0.15 + 0.75 * p.walkerStrength;
    coneMaterial.opacity = 0.15 + 0.75 * p.walkerStrength;
    walkerMaterial.dashOffset = -elapsed * 0.6;

    // 上升流
    upwellingMaterial.opacity = 0.15 + 0.8 * p.upwellingStrength;
    upwellingMaterial.dashOffset = -elapsed * 0.8;

    // 雨带
    rainGroup.position.x = p.rainX;
    rainMaterial.dashOffset = -elapsed * 1.2;
    const rainOpacity = 0.55 + 0.45 * ocean;
    rainMaterial.opacity = rainOpacity;
    cloudMaterial.opacity = 0.3 + 0.35 * ocean;

    // 影响导向
    arcMaterial.opacity = 0.85 * p.impactOpacity;
    if (p.impactOpacity > 0) arcMaterial.dashOffset = -elapsed * 0.5;
  }

  function setResolution(w, h) {
    walkerMaterial.resolution.set(w, h);
    upwellingMaterial.resolution.set(w, h);
    rainMaterial.resolution.set(w, h);
    arcMaterial.resolution.set(w, h);
  }
  setResolution(initialResolution.w, initialResolution.h);

  function dispose() {
    for (const d of disposables) {
      if (d && typeof d.dispose === 'function') d.dispose();
    }
  }

  return { group, update, setResolution, dispose };
}
