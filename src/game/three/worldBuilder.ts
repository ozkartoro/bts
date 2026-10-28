import * as THREE from 'three';
import { WorldId } from '../../types/game';
import { WORLD_PORTALS, STAR_LIST } from '../constants';

export interface WorldInteractivePoint {
  id: string;
  name: string;
  position: THREE.Vector3;
  radius: number;
  type: 'portal' | 'item' | 'puzzle' | 'dialogue' | 'altar';
  data?: Record<string, unknown>;
  mesh?: THREE.Object3D;
}

export type WorldCollider =
  | { type: 'cylinder'; x: number; z: number; radius: number }
  | { type: 'box'; minX: number; maxX: number; minZ: number; maxZ: number };

export interface BuiltWorld {
  group: THREE.Group;
  spawnPoint: THREE.Vector3;
  cameraInitPos: THREE.Vector3;
  interactives: WorldInteractivePoint[];
  colliders: WorldCollider[];
  boundsRadius: number;
  animate: (time: number, dt: number) => void;
  dispose: () => void;
}

// Procedural texture for stone paving
function createCobblestoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#261545';
  ctx.fillRect(0, 0, 512, 512);

  // Concentric paving rings
  ctx.lineWidth = 4;
  for (let r = 40; r < 250; r += 40) {
    ctx.strokeStyle = '#432874';
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Radial stones
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2;
    ctx.strokeStyle = '#361e60';
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(angle) * 30, 256 + Math.sin(angle) * 30);
    ctx.lineTo(256 + Math.cos(angle) * 240, 256 + Math.sin(angle) * 240);
    ctx.stroke();
  }

  // Dots
  ctx.fillStyle = '#5c399b';
  for (let j = 0; j < 400; j++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillRect(x, y, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Procedural starlight nebula sky dome
export function createCosmicSky(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(140, 32, 24);
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep purple space gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#090414');
  grad.addColorStop(0.4, '#190a36');
  grad.addColorStop(0.7, '#2f125a');
  grad.addColorStop(1, '#0e051d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Purple and pink nebulas
  for (let n = 0; n < 8; n++) {
    const cx = Math.random() * 1024;
    const cy = 100 + Math.random() * 300;
    const rad = 100 + Math.random() * 150;
    const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rad);
    const col = n % 2 === 0 ? 'rgba(168, 85, 247, 0.28)' : 'rgba(236, 72, 153, 0.22)';
    radGrad.addColorStop(0, col);
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sparkling stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const sz = Math.random() < 0.9 ? 1.2 : 2.5;
    ctx.fillRect(x, y, sz, sz);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.BackSide
  });

  return new THREE.Mesh(geo, mat);
}

// 1. HUB WORLD: Plaza de las Siete Puertas
export function buildHubWorld(collectedStars: Record<number, boolean>): BuiltWorld {
  const group = new THREE.Group();
  const interactives: WorldInteractivePoint[] = [];
  const animatables: ((t: number, dt: number) => void)[] = [];

  // Sky
  group.add(createCosmicSky());

  // Island Base
  const islandGeo = new THREE.CylinderGeometry(18, 14, 4, 32);
  const islandMat = new THREE.MeshStandardMaterial({
    color: 0x1f103b,
    roughness: 0.85,
    metalness: 0.1
  });
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.position.y = -2;
  island.receiveShadow = true;
  group.add(island);

  // Surface Cobblestone Platform
  const surfaceGeo = new THREE.CircleGeometry(17.8, 32);
  const surfaceMat = new THREE.MeshStandardMaterial({
    map: createCobblestoneTexture(),
    roughness: 0.7,
    metalness: 0.15
  });
  const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = 0.02;
  surface.receiveShadow = true;
  group.add(surface);

  // Outer glowing runic rim
  const rimGeo = new THREE.TorusGeometry(17.8, 0.35, 12, 48);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x9333ea,
    emissive: 0x7e22ce,
    emissiveIntensity: 0.8,
    roughness: 0.3
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.08;
  group.add(rim);

  // Central Fountain
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(0, 0, 0);

  // Fountain lower basin
  const basinGeo = new THREE.CylinderGeometry(3.5, 3.2, 0.6, 24);
  const basinMat = new THREE.MeshStandardMaterial({
    color: 0x3b1d6b,
    roughness: 0.4,
    metalness: 0.3
  });
  const basin = new THREE.Mesh(basinGeo, basinMat);
  basin.position.y = 0.3;
  basin.castShadow = true;
  basin.receiveShadow = true;
  fountainGroup.add(basin);

  // Water surface
  const waterGeo = new THREE.CircleGeometry(3.3, 24);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x8b5cf6,
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.58;
  fountainGroup.add(water);

  // Fountain central pillar
  const pillarGeo = new THREE.CylinderGeometry(0.7, 0.9, 2.2, 16);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4c2882, roughness: 0.4, metalness: 0.2 });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = 1.3;
  pillar.castShadow = true;
  fountainGroup.add(pillar);

  // Levitating crystal emblem on top
  const crystalGeo = new THREE.OctahedronGeometry(0.85, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    emissive: 0xd946ef,
    emissiveIntensity: 1.0,
    roughness: 0.15,
    metalness: 0.8
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.y = 3.2;
  fountainGroup.add(crystal);

  // Orbiting mini stars around the crystal
  const orbitGroup = new THREE.Group();
  fountainGroup.add(orbitGroup);
  for (let i = 0; i < 7; i++) {
    const starMini = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.14),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    const angle = (i / 7) * Math.PI * 2;
    starMini.position.set(Math.cos(angle) * 1.6, 3.2, Math.sin(angle) * 1.6);
    orbitGroup.add(starMini);
  }

  animatables.push((t) => {
    crystal.rotation.y = t * 1.2;
    crystal.rotation.x = Math.sin(t * 0.8) * 0.2;
    crystal.position.y = 3.2 + Math.sin(t * 2) * 0.15;
    orbitGroup.rotation.y = -t * 0.9;
  });

  group.add(fountainGroup);

  // Fountain interaction
  interactives.push({
    id: 'fountain_inspect',
    name: 'Fuente del Universo Púrpura',
    position: new THREE.Vector3(0, 0, 2.2),
    radius: 3.5,
    type: 'dialogue',
    data: {
      title: 'Fuente del Universo Púrpura',
      text: 'El agua mística susurra con las voces de ARMY. Si recuperas las 7 estrellas perdidas, el portal hacia el Gran Concierto Estelar se abrirá en el firmamento.'
    }
  });

  // ARMY Lightstick interactive pedestal in the Plaza (BTS Trivia & Fanchant Minigame)
  const armyBeacon = new THREE.Group();
  armyBeacon.position.set(3.2, 0, 3.2);
  const abPed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.9, 0.8, 16),
    new THREE.MeshStandardMaterial({ color: 0x4c1d95, metalness: 0.6, roughness: 0.3 })
  );
  abPed.position.y = 0.4;
  abPed.castShadow = true;
  armyBeacon.add(abPed);

  // Levitating ARMY Bomb lightstick replica
  const abHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfdf4ff,
      emissive: 0xc084fc,
      emissiveIntensity: 1.2,
      roughness: 0.1
    })
  );
  abHead.name = 'portal_crest';
  abHead.userData = { isPortalOrStar: true };
  abHead.position.y = 1.4;
  const abHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.55, 12),
    new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.5 })
  );
  abHandle.position.y = 1.0;
  armyBeacon.add(abHead, abHandle);

  animatables.push((t) => {
    armyBeacon.position.y = Math.sin(t * 2) * 0.06;
    abHead.rotation.y = t * 1.6;
  });

  group.add(armyBeacon);

  interactives.push({
    id: 'army_fanchant_trivia',
    name: 'Rincón ARMY: Fanchant & Trivia BTS',
    position: new THREE.Vector3(3.2, 0, 3.2),
    radius: 3.2,
    type: 'puzzle',
    data: {
      puzzleType: 'army_fanchant_trivia'
    }
  });

  // 7 PORTALS
  WORLD_PORTALS.forEach((p) => {
    const portalGroup = new THREE.Group();
    const px = Math.cos(p.angle) * 13;
    const pz = Math.sin(p.angle) * 13;
    portalGroup.position.set(px, 0, pz);
    portalGroup.lookAt(0, 0, 0); // Face center

    // Pedestal base
    const pedGeo = new THREE.BoxGeometry(3.6, 0.4, 2.2);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x2e1952, roughness: 0.5 });
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.position.y = 0.2;
    ped.receiveShadow = true;
    portalGroup.add(ped);

    // Left & Right Arch Columns
    const colGeo = new THREE.CylinderGeometry(0.28, 0.35, 4.2, 12);
    const colMat = new THREE.MeshStandardMaterial({
      color: 0x3d226d,
      roughness: 0.3,
      metalness: 0.4
    });

    const leftCol = new THREE.Mesh(colGeo, colMat);
    leftCol.position.set(1.4, 2.3, 0);
    leftCol.castShadow = true;
    portalGroup.add(leftCol);

    const rightCol = new THREE.Mesh(colGeo, colMat);
    rightCol.position.set(-1.4, 2.3, 0);
    rightCol.castShadow = true;
    portalGroup.add(rightCol);

    // Arch Top
    const archGeo = new THREE.TorusGeometry(1.4, 0.28, 8, 20, Math.PI);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x4a2b82,
      roughness: 0.3,
      metalness: 0.4
    });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(0, 4.4, 0);
    portalGroup.add(arch);

    // Member emblem crest on top
    const crestGeo = new THREE.BoxGeometry(0.7, 0.5, 0.2);
    const crestMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.color),
      emissive: new THREE.Color(p.color),
      emissiveIntensity: 0.8
    });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.name = 'portal_crest';
    crest.userData = { isPortalOrStar: true };
    crest.position.set(0, 5.2, 0);
    portalGroup.add(crest);

    // Portal Glowing Energy Vortex
    const vortexGeo = new THREE.PlaneGeometry(2.3, 3.8);
    const vortexMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.color),
      emissive: new THREE.Color(p.color),
      emissiveIntensity: 1.6,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const vortex = new THREE.Mesh(vortexGeo, vortexMat);
    vortex.name = 'portal_vortex';
    vortex.userData = { isPortalOrStar: true };
    vortex.position.set(0, 2.4, 0);
    portalGroup.add(vortex);

    // Star status trophy inside/above portal
    const hasStar = collectedStars[p.starId];
    const starStatusMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35),
      new THREE.MeshStandardMaterial({
        color: hasStar ? 0xfef08a : 0x64748b,
        emissive: hasStar ? 0xfacc15 : 0x000000,
        emissiveIntensity: hasStar ? 1.0 : 0,
        roughness: 0.2
      })
    );
    starStatusMesh.name = hasStar ? 'collected_star' : 'uncollected_star';
    starStatusMesh.userData = { isPortalOrStar: hasStar };
    starStatusMesh.position.set(0, 2.6, 0.3);
    portalGroup.add(starStatusMesh);

    animatables.push((t) => {
      vortex.scale.x = 1 + Math.sin(t * 4 + p.angle) * 0.08;
      vortex.scale.y = 1 + Math.cos(t * 3 + p.angle) * 0.05;
      starStatusMesh.rotation.y = t * 2;
    });

    group.add(portalGroup);

    // Add interactive point for portal
    interactives.push({
      id: `portal_${p.id}`,
      name: `${p.name} (${p.member})`,
      position: new THREE.Vector3(px * 0.88, 0, pz * 0.88),
      radius: 2.8,
      type: 'portal',
      data: {
        worldId: p.id,
        member: p.member,
        starId: p.starId,
        title: p.worldTitle,
        theme: p.theme
      }
    });
  });

  // Cosmic trees & crystal lamps around the perimeter
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2 + 0.22;
    const tx = Math.cos(angle) * 16.2;
    const tz = Math.sin(angle) * 16.2;

    const treeGroup = new THREE.Group();
    treeGroup.position.set(tx, 0, tz);

    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.35, 2.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x311a54, roughness: 0.9 })
    );
    trunk.position.y = 1.2;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Crystal Foliage
    const foliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.95),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xa855f7 : 0xec4899,
        emissive: i % 2 === 0 ? 0x7e22ce : 0xbe185d,
        emissiveIntensity: 0.45,
        roughness: 0.3
      })
    );
    foliage.position.y = 2.8;
    foliage.castShadow = true;
    treeGroup.add(foliage);

    group.add(treeGroup);
  }

  // Grand Star Gate for Concert (unlocked when all 7 stars gathered)
  const allStarsGathered = STAR_LIST.every((s) => collectedStars[s.id]);
  const concertGateGroup = new THREE.Group();
  concertGateGroup.position.set(0, 0, -15.5);

  const cgPillarL = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 6, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x581c87, metalness: 0.5, roughness: 0.2 })
  );
  cgPillarL.position.set(-2.5, 3, 0);
  const cgPillarR = cgPillarL.clone();
  cgPillarR.position.set(2.5, 3, 0);
  concertGateGroup.add(cgPillarL, cgPillarR);

  const cgBeam = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.8, 0.8),
    new THREE.MeshStandardMaterial({
      color: allStarsGathered ? 0xfacc15 : 0x4c1d95,
      emissive: allStarsGathered ? 0xeab308 : 0x000000,
      emissiveIntensity: allStarsGathered ? 1.0 : 0
    })
  );
  cgBeam.position.set(0, 6.2, 0);
  concertGateGroup.add(cgBeam);

  // Glowing Star Icon
  const starCrown = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.0),
    new THREE.MeshStandardMaterial({
      color: allStarsGathered ? 0xfef08a : 0x475569,
      emissive: allStarsGathered ? 0xf59e0b : 0x000000,
      emissiveIntensity: allStarsGathered ? 1.2 : 0
    })
  );
  starCrown.position.set(0, 7.8, 0);
  concertGateGroup.add(starCrown);

  animatables.push((t) => {
    starCrown.rotation.y = t * 1.5;
  });

  group.add(concertGateGroup);

  interactives.push({
    id: 'portal_concert',
    name: 'Puerta del Gran Concierto Estelar',
    position: new THREE.Vector3(0, 0, -14.2),
    radius: 3.2,
    type: 'portal',
    data: {
      worldId: 'concert',
      unlocked: allStarsGathered,
      title: 'El Concierto de las Siete Estrellas'
    }
  });

  const colliders: WorldCollider[] = [
    { type: 'cylinder', x: 0, z: 0, radius: 3.5 }, // Central fountain basin
    { type: 'cylinder', x: 3.2, z: 3.2, radius: 0.95 }, // ARMY Lightstick beacon pedestal
    { type: 'box', minX: -3.0, maxX: -2.0, minZ: -16.0, maxZ: -15.0 }, // Concert gate left pillar
    { type: 'box', minX: 2.0, maxX: 3.0, minZ: -16.0, maxZ: -15.0 }   // Concert gate right pillar
  ];

  // Add 7 portals as solid obstacle colliders
  WORLD_PORTALS.forEach((p) => {
    const px = Math.cos(p.angle) * 13;
    const pz = Math.sin(p.angle) * 13;
    colliders.push({ type: 'cylinder', x: px, z: pz, radius: 1.6 });
  });

  // Add 14 perimeter trees as solid obstacles
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2 + 0.22;
    const tx = Math.cos(angle) * 16.2;
    const tz = Math.sin(angle) * 16.2;
    colliders.push({ type: 'cylinder', x: tx, z: tz, radius: 0.65 });
  }

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0, 7.5),
    cameraInitPos: new THREE.Vector3(0, 4.5, 12.5),
    interactives,
    colliders,
    boundsRadius: 17.2,
    animate: (time: number, dt: number) => {
      animatables.forEach((fn) => fn(time, dt));
    },
    dispose: () => {
      // Cleanup geometries and materials
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
    }
  };
}

// 2. WORLD 1 (RM): La Biblioteca Encantada
export function buildLibraryWorld(): BuiltWorld {
  const group = new THREE.Group();
  const interactives: WorldInteractivePoint[] = [];
  const animatables: ((t: number, dt: number) => void)[] = [];

  group.add(createCosmicSky());

  // Floor
  const floorGeo = new THREE.BoxGeometry(32, 0.5, 32);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1528, roughness: 0.6 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.25;
  floor.receiveShadow = true;
  group.add(floor);

  // Blue carpet runner
  const carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 28),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.9 })
  );
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.y = 0.02;
  group.add(carpet);

  // Perimeter Bookcases
  const bookcaseGeo = new THREE.BoxGeometry(4, 7, 1.2);
  const bookcaseMat = new THREE.MeshStandardMaterial({ color: 0x3f1f14, roughness: 0.8 });

  const bookcasePositions = [
    [-11, 3.5, -11], [-6, 3.5, -13], [6, 3.5, -13], [11, 3.5, -11],
    [-13, 3.5, -4], [-13, 3.5, 4], [13, 3.5, -4], [13, 3.5, 4],
    [-10, 3.5, 11], [10, 3.5, 11]
  ];

  bookcasePositions.forEach((pos, idx) => {
    const bc = new THREE.Mesh(bookcaseGeo, bookcaseMat);
    bc.position.set(pos[0], pos[1], pos[2]);
    bc.castShadow = true;
    bc.receiveShadow = true;
    group.add(bc);

    // Book rows
    for (let r = 0; r < 4; r++) {
      const row = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.45, 0.8),
        new THREE.MeshStandardMaterial({
          color: (idx + r) % 3 === 0 ? 0x3b82f6 : (idx + r) % 3 === 1 ? 0x9333ea : 0xd97706,
          roughness: 0.7
        })
      );
      row.position.set(pos[0], 1.2 + r * 1.5, pos[2] + 0.15);
      group.add(row);
    }
  });

  // Floating magic books bobbing in air
  const bookGeo = new THREE.BoxGeometry(0.8, 0.15, 0.6);
  const bookMat = new THREE.MeshStandardMaterial({
    color: 0x60a5fa,
    emissive: 0x2563eb,
    emissiveIntensity: 0.6
  });

  const floatingBooksPos = [
    [-5, 2.5, -4],
    [5, 3.0, -3],
    [-4, 2.0, 4],
    [6, 2.2, 5],
    [0, 3.2, -6]
  ];

  floatingBooksPos.forEach((bPos, idx) => {
    const book = new THREE.Mesh(bookGeo, bookMat);
    book.position.set(bPos[0], bPos[1], bPos[2]);
    book.castShadow = true;
    group.add(book);

    animatables.push((t) => {
      book.position.y = bPos[1] + Math.sin(t * 2 + idx) * 0.25;
      book.rotation.y = t * 0.6 + idx;
    });

    interactives.push({
      id: `rm_book_${idx + 1}`,
      name: `Tomo Encantado #${idx + 1}`,
      position: new THREE.Vector3(bPos[0], 0, bPos[2]),
      radius: 2.2,
      type: 'item',
      data: {
        index: idx + 1,
        title: `Libro de Sabiduría ${idx + 1}`
      }
    });
  });

  // Central Altar of Knowledge (Puzzle Station)
  const altarGroup = new THREE.Group();
  altarGroup.position.set(0, 0, -8);

  const altarPed = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.8, 1, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.5, roughness: 0.3 })
  );
  altarPed.position.y = 0.5;
  altarPed.castShadow = true;
  altarGroup.add(altarPed);

  // 4 Elemental Rune Pillars around altar
  const runeColors = [0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899];
  for (let p = 0; p < 4; p++) {
    const rAngle = (p / 4) * Math.PI * 2;
    const rx = Math.cos(rAngle) * 3.5;
    const rz = Math.sin(rAngle) * 3.5;

    const rPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, 2.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x312e81, metalness: 0.3, roughness: 0.5 })
    );
    rPillar.position.set(rx, 1.2, rz);

    const runeOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 12),
      new THREE.MeshStandardMaterial({
        color: runeColors[p],
        emissive: runeColors[p],
        emissiveIntensity: 0.9
      })
    );
    runeOrb.position.set(rx, 2.7, rz);

    altarGroup.add(rPillar, runeOrb);
  }

  // Giant glowing Star of Knowledge at top of altar
  const starKnowledge = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.7),
    new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      emissive: 0x3b82f6,
      emissiveIntensity: 1.0
    })
  );
  starKnowledge.name = 'collected_star';
  starKnowledge.userData = { isPortalOrStar: true };
  starKnowledge.position.y = 2.4;
  altarGroup.add(starKnowledge);

  animatables.push((t) => {
    starKnowledge.rotation.y = t * 1.5;
    starKnowledge.position.y = 2.4 + Math.sin(t * 2) * 0.15;
  });

  group.add(altarGroup);

  interactives.push({
    id: 'rm_altar',
    name: 'Altar del Conocimiento (RM)',
    position: new THREE.Vector3(0, 0, -8),
    radius: 3.5,
    type: 'puzzle',
    data: {
      puzzleType: 'rm_symbols'
    }
  });

  // Return Portal to Central Hub
  interactives.push({
    id: 'portal_back_hub',
    name: 'Portal de Regreso a la Plaza',
    position: new THREE.Vector3(0, 0, 11),
    radius: 2.8,
    type: 'portal',
    data: { worldId: 'hub' }
  });

  const returnPortal = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.25, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x6d28d9, emissiveIntensity: 0.8 })
  );
  returnPortal.position.set(0, 2, 11);
  group.add(returnPortal);

  const colliders: WorldCollider[] = [
    { type: 'cylinder', x: 0, z: -8, radius: 2.6 }, // Central Altar of Knowledge
    { type: 'cylinder', x: 0, z: 11, radius: 1.6 }  // Return Portal
  ];

  bookcasePositions.forEach((pos) => {
    colliders.push({
      type: 'box',
      minX: pos[0] - 2.1,
      maxX: pos[0] + 2.1,
      minZ: pos[2] - 0.7,
      maxZ: pos[2] + 0.7
    });
  });

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0, 8),
    cameraInitPos: new THREE.Vector3(0, 4, 13),
    interactives,
    colliders,
    boundsRadius: 15,
    animate: (time, dt) => animatables.forEach((fn) => fn(time, dt)),
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
    }
  };
}

// 3. WORLD 2 (Jin): El Reino de los Sabores
export function buildCookingWorld(): BuiltWorld {
  const group = new THREE.Group();
  const interactives: WorldInteractivePoint[] = [];
  const animatables: ((t: number, dt: number) => void)[] = [];

  group.add(createCosmicSky());

  // Checkerboard kitchen floor
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(32, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0xfdf2f8, roughness: 0.4 })
  );
  floor.position.y = -0.25;
  floor.receiveShadow = true;
  group.add(floor);

  // Pink castle walls & marble kitchen counters
  const counterMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.3 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xbe185d, roughness: 0.7 });

  const counter1 = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 2), counterMat);
  counter1.position.set(-6, 0.6, -6);
  counter1.castShadow = true;
  const counter2 = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 2), counterMat);
  counter2.position.set(6, 0.6, -6);
  counter2.castShadow = true;
  group.add(counter1, counter2);

  // Big Golden Magic Pot in center
  const potGeo = new THREE.CylinderGeometry(1.6, 1.2, 1.6, 18);
  const potMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.set(0, 0.8, -2);
  pot.castShadow = true;
  group.add(pot);

  // Bubbling magical soup
  const soup = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 18),
    new THREE.MeshBasicMaterial({ color: 0xf43f5e })
  );
  soup.rotation.x = -Math.PI / 2;
  soup.position.set(0, 1.5, -2);
  group.add(soup);

  // Ingredient stations
  const ingredients = [
    { id: 'jin_strawberry', name: 'Fresas Mágicas', col: 0xef4444, pos: [-7, 1.4, -6] },
    { id: 'jin_spices', name: 'Especias Dulces', col: 0xf59e0b, pos: [-4, 1.4, -6] },
    { id: 'jin_rice', name: 'Arroz Dorado', col: 0xfef08a, pos: [4, 1.4, -6] },
    { id: 'jin_cream', name: 'Crema Estelar', col: 0xffffff, pos: [7, 1.4, -6] }
  ];

  ingredients.forEach((ing) => {
    const bowl = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshStandardMaterial({ color: ing.col, emissive: ing.col, emissiveIntensity: 0.4 })
    );
    bowl.position.set(ing.pos[0], ing.pos[1], ing.pos[2]);
    group.add(bowl);

    interactives.push({
      id: ing.id,
      name: ing.name,
      position: new THREE.Vector3(ing.pos[0], 0, ing.pos[2]),
      radius: 2.2,
      type: 'item',
      data: { ingredient: ing.name }
    });
  });

  // Cooking station puzzle
  interactives.push({
    id: 'jin_cooking_station',
    name: 'Estación de Cocina de Jin',
    position: new THREE.Vector3(0, 0, -2),
    radius: 3.2,
    type: 'puzzle',
    data: { puzzleType: 'jin_cooking' }
  });

  // Return Portal
  interactives.push({
    id: 'portal_back_hub',
    name: 'Portal a la Plaza',
    position: new THREE.Vector3(0, 0, 10),
    radius: 2.8,
    type: 'portal',
    data: { worldId: 'hub' }
  });

  const returnPortal = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.25, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xdb2777, emissiveIntensity: 0.8 })
  );
  returnPortal.position.set(0, 2, 10);
  group.add(returnPortal);

  const colliders: WorldCollider[] = [
    { type: 'box', minX: -10.2, maxX: -1.8, minZ: -7.2, maxZ: -4.8 }, // Counter 1
    { type: 'box', minX: 1.8, maxX: 10.2, minZ: -7.2, maxZ: -4.8 },   // Counter 2
    { type: 'cylinder', x: 0, z: -2, radius: 1.7 },                   // Magic cauldron
    { type: 'cylinder', x: 0, z: 10, radius: 1.6 }                    // Return portal
  ];

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0, 7),
    cameraInitPos: new THREE.Vector3(0, 4, 12),
    interactives,
    colliders,
    boundsRadius: 15,
    animate: (time, dt) => animatables.forEach((fn) => fn(time, dt)),
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
    }
  };
}

// 4. WORLD 3 (SUGA): El Estudio de las Melodías
export function buildStudioWorld(): BuiltWorld {
  const group = new THREE.Group();
  const interactives: WorldInteractivePoint[] = [];
  const animatables: ((t: number, dt: number) => void)[] = [];

  group.add(createCosmicSky());

  // Dark acoustic wood studio floor
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(32, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 })
  );
  floor.position.y = -0.25;
  floor.receiveShadow = true;
  group.add(floor);

  // Equalizer visualizer bars that dance to the rhythm
  const eqBars: THREE.Mesh[] = [];
  for (let i = 0; i < 16; i++) {
    const x = -10 + (i / 15) * 20;
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1, 0.5),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.6
      })
    );
    bar.position.set(x, 0.5, -12);
    group.add(bar);
    eqBars.push(bar);
  }

  animatables.push((t) => {
    eqBars.forEach((bar, idx) => {
      const h = 1.0 + Math.sin(t * 8 + idx * 0.7) * 2.2 + Math.cos(t * 4 + idx * 0.3) * 1.2;
      bar.scale.y = Math.max(0.2, h);
      bar.position.y = (bar.scale.y * 1) / 2;
    });
  });

  // Synthesizer Grand Desk
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(8, 1.2, 3),
    new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4 })
  );
  desk.position.set(0, 0.6, -4);
  group.add(desk);

  // 4 Giant Glowing Sequencer Pads on the desk (Simon Melody game)
  const padColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b];
  for (let p = 0; p < 4; p++) {
    const px = -2.7 + p * 1.8;
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.2, 1.2),
      new THREE.MeshStandardMaterial({
        color: padColors[p],
        emissive: padColors[p],
        emissiveIntensity: 0.7
      })
    );
    pad.position.set(px, 1.25, -4);
    group.add(pad);
  }

  // Floating musical treble clefs
  const noteGeo = new THREE.TorusGeometry(0.5, 0.1, 8, 16);
  const noteMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xeab308,
    emissiveIntensity: 0.8
  });

  const notePositions = [
    [-6, 2.5, 0],
    [6, 2.8, -1],
    [-4, 2.2, 4]
  ];

  notePositions.forEach((nPos, idx) => {
    const note = new THREE.Mesh(noteGeo, noteMat);
    note.position.set(nPos[0], nPos[1], nPos[2]);
    group.add(note);

    animatables.push((t) => {
      note.rotation.y = t * 1.5;
      note.position.y = nPos[1] + Math.sin(t * 2 + idx) * 0.2;
    });

    interactives.push({
      id: `suga_note_${idx + 1}`,
      name: `Nota Resonante #${idx + 1}`,
      position: new THREE.Vector3(nPos[0], 0, nPos[2]),
      radius: 2.2,
      type: 'item',
      data: { noteIndex: idx + 1 }
    });
  });

  // Melodic puzzle interactive
  interactives.push({
    id: 'suga_melody_puzzle',
    name: 'Sintetizador Min PD (SUGA)',
    position: new THREE.Vector3(0, 0, -4),
    radius: 3.5,
    type: 'puzzle',
    data: { puzzleType: 'suga_synth' }
  });

  // Return portal
  interactives.push({
    id: 'portal_back_hub',
    name: 'Portal a la Plaza',
    position: new THREE.Vector3(0, 0, 10),
    radius: 2.8,
    type: 'portal',
    data: { worldId: 'hub' }
  });

  const returnPortal = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.25, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.8 })
  );
  returnPortal.position.set(0, 2, 10);
  group.add(returnPortal);

  const colliders: WorldCollider[] = [
    { type: 'box', minX: -4.2, maxX: 4.2, minZ: -5.6, maxZ: -2.4 },   // Synthesizer desk
    { type: 'box', minX: -8.2, maxX: -5.8, minZ: -7.2, maxZ: -4.8 }, // Speaker L
    { type: 'box', minX: 5.8, maxX: 8.2, minZ: -7.2, maxZ: -4.8 },   // Speaker R
    { type: 'cylinder', x: 0, z: 10, radius: 1.6 }                    // Return portal
  ];

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0, 6),
    cameraInitPos: new THREE.Vector3(0, 4, 11),
    interactives,
    colliders,
    boundsRadius: 15,
    animate: (time, dt) => animatables.forEach((fn) => fn(time, dt)),
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
    }
  };
}

// 5. WORLD 4 (j-hope): La Ciudad del Baile
export function buildDanceWorld(): BuiltWorld {
  const group = new THREE.Group();
  const interactives: WorldInteractivePoint[] = [];
  const animatables: ((t: number, dt: number) => void)[] = [];

  group.add(createCosmicSky());

  // City dance stage floor
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(32, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3 })
  );
  floor.position.y = -0.25;
  group.add(floor);

  // Dynamic dance floor grid tiles in center
  const danceTiles: THREE.Mesh[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const tile = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 1.8),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.4,
          roughness: 0.2
        })
      );
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(-2.7 + c * 1.8, 0.03, -4.5 + r * 1.8);
      group.add(tile);
      danceTiles.push(tile);
    }
  }

  animatables.push((t) => {
    danceTiles.forEach((tile, idx) => {
      const pulse = (Math.sin(t * 6 + idx * 0.8) + 1) * 0.5;
      const mat = tile.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.2 + pulse * 0.8;
    });
  });

  // DJ Towers and neon speaker stacks
  const speakerL = new THREE.Mesh(
    new THREE.BoxGeometry(2, 6, 2),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 })
  );
  speakerL.position.set(-7, 3, -6);
  const speakerR = speakerL.clone();
  speakerR.position.set(7, 3, -6);
  group.add(speakerL, speakerR);

  // Dance battle station
  interactives.push({
    id: 'jhope_dance_puzzle',
    name: 'Pista de Baile Hope World',
    position: new THREE.Vector3(0, 0, -2),
    radius: 3.5,
    type: 'puzzle',
    data: { puzzleType: 'jhope_dance' }
  });

  // Return portal
  interactives.push({
    id: 'portal_back_hub',
    name: 'Portal a la Plaza',
    position: new THREE.Vector3(0, 0, 10),
    radius: 2.8,
    type: 'portal',
    data: { worldId: 'hub' }
  });

  const returnPortal = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.25, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x059669, emissiveIntensity: 0.8 })
  );
  returnPortal.position.set(0, 2, 10);
  group.add(returnPortal);

  const colliders: WorldCollider[] = [
    { type: 'box', minX: -8.2, maxX: -5.8, minZ: -7.2, maxZ: -4.8 }, // Speaker L
    { type: 'box', minX: 5.8, maxX: 8.2, minZ: -7.2, maxZ: -4.8 },   // Speaker R
    { type: 'cylinder', x: 0, z: 10, radius: 1.6 }                    // Return portal
  ];

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0, 6),
    cameraInitPos: new THREE.Vector3(0, 4, 11),
    interactives,
    colliders,
    boundsRadius: 15,
    animate: (time, dt) => animatables.forEach((fn) => fn(time, dt)),
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
    }
  };
}

// 6. WORLD 5 (Jimin): El Jardín de las Estrellas
export function buildGardenWorld(): BuiltWorld {
  const group = new THREE.Group();
  const interactives: WorldInteractivePoint[] = [];
  const animatables: ((t: number, dt: number) => void)[] = [];

  group.add(createCosmicSky());

  // Mystical floating island garden
  const island = new THREE.Mesh(
    new THREE.CylinderGeometry(16, 12, 3, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e1533, roughness: 0.8 })
  );
  island.position.y = -1.5;
  group.add(island);

  const surface = new THREE.Mesh(
    new THREE.CircleGeometry(15.8, 24),
    new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.7 })
  );
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = 0.02;
  group.add(surface);

  // Stepping stone platforms
  const stepsPos = [
    [-3, 0.4, 0],
    [-1, 0.8, -3],
    [2, 1.2, -5],
    [0, 1.6, -8]
  ];

  stepsPos.forEach((sp, idx) => {
    const step = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 0.4, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfb7185,
        emissive: 0xe11d48,
        emissiveIntensity: 0.4,
        roughness: 0.3
      })
    );
    step.position.set(sp[0], sp[1], sp[2]);
    step.castShadow = true;
    group.add(step);

    animatables.push((t) => {
      step.position.y = sp[1] + Math.sin(t * 2 + idx) * 0.12;
    });
  });

  // Constellation Prism Altar on the highest step
  interactives.push({
    id: 'jimin_garden_puzzle',
    name: 'Altar de Serendipity (Jimin)',
    position: new THREE.Vector3(0, 1.6, -8),
    radius: 3.2,
    type: 'puzzle',
    data: { puzzleType: 'jimin_garden' }
  });

  // Glowing flowers
  for (let f = 0; f < 12; f++) {
    const fAngle = (f / 12) * Math.PI * 2;
    const fx = Math.cos(fAngle) * 9;
    const fz = Math.sin(fAngle) * 9;

    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.7
      })
    );
    flower.position.set(fx, 0.4, fz);
    group.add(flower);
  }

  // Return portal
  interactives.push({
    id: 'portal_back_hub',
    name: 'Portal a la Plaza',
    position: new THREE.Vector3(0, 0, 10),
    radius: 2.8,
    type: 'portal',
    data: { worldId: 'hub' }
  });

  const returnPortal = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.25, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0xfb7185, emissive: 0xe11d48, emissiveIntensity: 0.8 })
  );
  returnPortal.position.set(0, 2, 10);
  group.add(returnPortal);

  const colliders: WorldCollider[] = [
    { type: 'cylinder', x: 0, z: -8, radius: 2.2 }, // Serendipity Altar
    { type: 'cylinder', x: 0, z: 10, radius: 1.6 }  // Return portal
  ];

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0, 6),
    cameraInitPos: new THREE.Vector3(0, 4, 11),
    interactives,
    colliders,
    boundsRadius: 15,
    animate: (time, dt) => animatables.forEach((fn) => fn(time, dt)),
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
    }
  };
}

// 7. WORLD 6 (V): La Galería de los Sueños
export function buildGalleryWorld(): BuiltWorld {
  const group = new THREE.Group();
  const interactives: WorldInteractivePoint[] = [];
  const animatables: ((t: number, dt: number) => void)[] = [];

  group.add(createCosmicSky());

  // Polished museum floor
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(32, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x1f1438, roughness: 0.2, metalness: 0.4 })
  );
  floor.position.y = -0.25;
  group.add(floor);

  // Classical museum columns
  const colMat = new THREE.MeshStandardMaterial({ color: 0x4c2882, roughness: 0.3 });
  for (let c = -1; c <= 1; c += 2) {
    for (let d = -2; d <= 2; d += 2) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 7, 16), colMat);
      col.position.set(c * 6, 3.5, d * 4);
      group.add(col);
    }
  }

  // Floating picture frames
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
  const paintingsPos = [
    [-6, 2.8, -2],
    [6, 2.8, -2],
    [-4, 2.8, 3],
    [4, 2.8, 3]
  ];

  paintingsPos.forEach((pPos, idx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 0.15), frameMat);
    frame.position.set(pPos[0], pPos[1], pPos[2]);
    group.add(frame);

    const canvas = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 2.3),
      new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x8b5cf6 : 0xec4899,
        emissive: idx % 2 === 0 ? 0x7c3aed : 0xbe185d,
        emissiveIntensity: 0.4
      })
    );
    canvas.position.set(pPos[0], pPos[1], pPos[2] + 0.1);
    group.add(canvas);

    interactives.push({
      id: `v_art_piece_${idx + 1}`,
      name: `Lienzo Impresionista #${idx + 1}`,
      position: new THREE.Vector3(pPos[0], 0, pPos[2]),
      radius: 2.2,
      type: 'item',
      data: { artIndex: idx + 1 }
    });
  });

  // Central Grand Easel (Art Puzzle)
  interactives.push({
    id: 'v_gallery_puzzle',
    name: 'Caballete de Ensueño (V)',
    position: new THREE.Vector3(0, 0, -6),
    radius: 3.5,
    type: 'puzzle',
    data: { puzzleType: 'v_art' }
  });

  // Return portal
  interactives.push({
    id: 'portal_back_hub',
    name: 'Portal a la Plaza',
    position: new THREE.Vector3(0, 0, 10),
    radius: 2.8,
    type: 'portal',
    data: { worldId: 'hub' }
  });

  const returnPortal = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.25, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0x7c3aed, emissiveIntensity: 0.8 })
  );
  returnPortal.position.set(0, 2, 10);
  group.add(returnPortal);

  const colliders: WorldCollider[] = [
    { type: 'cylinder', x: 0, z: -6, radius: 1.8 }, // Central Easel
    { type: 'cylinder', x: 0, z: 10, radius: 1.6 }  // Return portal
  ];

  // 6 Classical Museum Columns
  for (let c = -1; c <= 1; c += 2) {
    for (let d = -2; d <= 2; d += 2) {
      colliders.push({ type: 'cylinder', x: c * 6, z: d * 4, radius: 0.65 });
    }
  }

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0, 6),
    cameraInitPos: new THREE.Vector3(0, 4, 11),
    interactives,
    colliders,
    boundsRadius: 15,
    animate: (time, dt) => animatables.forEach((fn) => fn(time, dt)),
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
    }
  };
}

// 8. WORLD 7 (Jung Kook): La Arena de los Campeones
export function buildArenaWorld(): BuiltWorld {
  const group = new THREE.Group();
  const interactives: WorldInteractivePoint[] = [];
  const animatables: ((t: number, dt: number) => void)[] = [];

  group.add(createCosmicSky());

  // Golden stadium colosseum floor
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(32, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.5 })
  );
  floor.position.y = -0.25;
  group.add(floor);

  // Red and gold athletic hurdle bars to jump over
  const hurdleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3, 12);
  const hurdleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.5 });
  const hurdle1 = new THREE.Mesh(hurdleGeo, hurdleMat);
  hurdle1.rotation.z = Math.PI / 2;
  hurdle1.position.set(0, 0.5, 2);
  group.add(hurdle1);

  // Targets to aim and throw at
  const targetGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16);
  const targetMat = new THREE.MeshStandardMaterial({
    color: 0xf87171,
    emissive: 0xdc2626,
    emissiveIntensity: 0.6
  });

  const targetsPos = [
    [-5, 2, -6],
    [0, 2.5, -9],
    [5, 2, -6]
  ];

  targetsPos.forEach((tPos, idx) => {
    const target = new THREE.Mesh(targetGeo, targetMat);
    target.rotation.x = Math.PI / 2;
    target.position.set(tPos[0], tPos[1], tPos[2]);
    group.add(target);

    animatables.push((t) => {
      target.rotation.z = t * 2 + idx;
    });

    interactives.push({
      id: `jk_target_${idx + 1}`,
      name: `Diana de Campeón #${idx + 1}`,
      position: new THREE.Vector3(tPos[0], 0, tPos[2]),
      radius: 2.2,
      type: 'item',
      data: { targetIndex: idx + 1 }
    });
  });

  // Champions Podium and Cup
  interactives.push({
    id: 'jungkook_arena_puzzle',
    name: 'Podio de los Campeones (Jung Kook)',
    position: new THREE.Vector3(0, 0, -5),
    radius: 3.5,
    type: 'puzzle',
    data: { puzzleType: 'jk_arena' }
  });

  // Return portal
  interactives.push({
    id: 'portal_back_hub',
    name: 'Portal a la Plaza',
    position: new THREE.Vector3(0, 0, 10),
    radius: 2.8,
    type: 'portal',
    data: { worldId: 'hub' }
  });

  const returnPortal = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.25, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0xf87171, emissive: 0xdc2626, emissiveIntensity: 0.8 })
  );
  returnPortal.position.set(0, 2, 10);
  group.add(returnPortal);

  const colliders: WorldCollider[] = [
    { type: 'box', minX: -1.7, maxX: 1.7, minZ: 1.8, maxZ: 2.2 }, // Hurdle
    { type: 'cylinder', x: 0, z: -5, radius: 1.8 },               // Podium
    { type: 'cylinder', x: -5, z: -6, radius: 0.9 },              // Target L
    { type: 'cylinder', x: 0, z: -9, radius: 0.9 },               // Target C
    { type: 'cylinder', x: 5, z: -6, radius: 0.9 },               // Target R
    { type: 'cylinder', x: 0, z: 10, radius: 1.6 }                // Return portal
  ];

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0, 6),
    cameraInitPos: new THREE.Vector3(0, 4, 11),
    interactives,
    colliders,
    boundsRadius: 15,
    animate: (time, dt) => animatables.forEach((fn) => fn(time, dt)),
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
    }
  };
}

// 9. FINAL WORLD: El Concierto de las Siete Estrellas
export function buildConcertWorld(): BuiltWorld {
  const group = new THREE.Group();
  const interactives: WorldInteractivePoint[] = [];
  const animatables: ((t: number, dt: number) => void)[] = [];

  group.add(createCosmicSky());

  // Epic stadium stage
  const stage = new THREE.Mesh(
    new THREE.CylinderGeometry(14, 16, 2, 32),
    new THREE.MeshStandardMaterial({ color: 0x180b33, roughness: 0.3, metalness: 0.5 })
  );
  stage.position.y = -1;
  stage.receiveShadow = true;
  group.add(stage);

  // Purple glowing stage runway
  const runway = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.1, 16),
    new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.5
    })
  );
  runway.position.set(0, 0.05, 0);
  group.add(runway);

  // Sea of purple lightsticks (ARMY Bombs in the crowd)
  const armyBombsCount = 180;
  const armyBombGeo = new THREE.SphereGeometry(0.12, 6, 6);
  const armyBombMat = new THREE.MeshBasicMaterial({ color: 0xd8b4fe });
  const bombGroup = new THREE.Group();

  for (let b = 0; b < armyBombsCount; b++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 16.5 + Math.random() * 12;
    const bomb = new THREE.Mesh(armyBombGeo, armyBombMat);
    bomb.position.set(
      Math.cos(angle) * dist,
      -1 + Math.random() * 3,
      Math.sin(angle) * dist
    );
    bombGroup.add(bomb);
  }
  group.add(bombGroup);

  animatables.push((t) => {
    bombGroup.children.forEach((bomb, i) => {
      bomb.position.y += Math.sin(t * 4 + i) * 0.008;
    });
  });

  // 7 Star Pillars in semicircle behind main stage
  for (let p = 0; p < 7; p++) {
    const angle = Math.PI * 0.7 + (p / 6) * Math.PI * 0.6;
    const px = Math.cos(angle) * 8;
    const pz = Math.sin(angle) * 8;

    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.6, 5, 12),
      new THREE.MeshStandardMaterial({
        color: 0x3b1d6b,
        roughness: 0.3,
        metalness: 0.6
      })
    );
    pillar.position.set(px, 2.5, pz);
    group.add(pillar);

    // Glowing Star on pillar
    const star = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(STAR_LIST[p].color),
        emissive: new THREE.Color(STAR_LIST[p].color),
        emissiveIntensity: 1.2
      })
    );
    star.name = 'collected_star';
    star.userData = { isPortalOrStar: true };
    star.position.set(px, 5.5, pz);
    group.add(star);

    animatables.push((t) => {
      star.rotation.y = t * 2 + p;
    });
  }

  // Central Altar for placing stars and starting the show
  interactives.push({
    id: 'concert_altar',
    name: 'Pedestal Cósmico del Concierto',
    position: new THREE.Vector3(0, 0, -4),
    radius: 3.5,
    type: 'altar',
    data: { isConcert: true }
  });

  // Return to Plaza
  interactives.push({
    id: 'portal_back_hub',
    name: 'Portal a la Plaza Central',
    position: new THREE.Vector3(0, 0, 9),
    radius: 2.8,
    type: 'portal',
    data: { worldId: 'hub' }
  });

  const colliders: WorldCollider[] = [
    { type: 'cylinder', x: 0, z: -4, radius: 2.0 }, // Central Concert Altar
    { type: 'cylinder', x: 0, z: 9, radius: 1.6 }   // Return portal
  ];

  for (let p = 0; p < 7; p++) {
    const angle = Math.PI * 0.7 + (p / 6) * Math.PI * 0.6;
    colliders.push({
      type: 'cylinder',
      x: Math.cos(angle) * 8,
      z: Math.sin(angle) * 8,
      radius: 0.75
    });
  }

  return {
    group,
    spawnPoint: new THREE.Vector3(0, 0, 5),
    cameraInitPos: new THREE.Vector3(0, 4, 11),
    interactives,
    colliders,
    boundsRadius: 15,
    animate: (time, dt) => animatables.forEach((fn) => fn(time, dt)),
    dispose: () => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
    }
  };
}

export function loadWorld(worldId: WorldId, collectedStars: Record<number, boolean>): BuiltWorld {
  switch (worldId) {
    case 'hub':
      return buildHubWorld(collectedStars);
    case 'rm':
      return buildLibraryWorld();
    case 'jin':
      return buildCookingWorld();
    case 'suga':
      return buildStudioWorld();
    case 'jhope':
      return buildDanceWorld();
    case 'jimin':
      return buildGardenWorld();
    case 'v':
      return buildGalleryWorld();
    case 'jungkook':
      return buildArenaWorld();
    case 'concert':
      return buildConcertWorld();
    default:
      return buildHubWorld(collectedStars);
  }
}
