import React, { useEffect, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, SelectiveBloom } from '@react-three/postprocessing';
import {
  Physics,
  RigidBody,
  RapierRigidBody,
  CuboidCollider,
  CylinderCollider,
  CapsuleCollider
} from '@react-three/rapier';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { WorldId, CharacterCustomization } from '../../types/game';
import { createMari, CharacterRig } from './character';
import { loadWorld, BuiltWorld, WorldInteractivePoint, WorldCollider } from './worldBuilder';
import { sound } from '../../audio/soundEngine';

export interface BloomTweakProps {
  baseIntensity?: number;       // Base glow intensity (default 1.4)
  maxIntensity?: number;        // Max glow intensity when approaching portals (default 3.5)
  baseThreshold?: number;       // Base luminance threshold (default 0.22)
  minThreshold?: number;        // Min luminance threshold near portals (default 0.08)
  proximityDistance?: number;   // Distance at which portals begin brightening (default 9.0)
  luminanceSmoothing?: number;  // Smoothness (default 0.9)
  radius?: number;              // Spread radius (default 0.85)
}

export interface ColliderProps {
  type?: 'cuboid' | 'cylinder' | 'capsule' | 'ball';
  args?: any;
  position?: [number, number, number];
  rotation?: [number, number, number];
  friction?: number;
  restitution?: number;
}

/**
 * Universal Rapier Collider wrapper providing flexible shape resolution with zero-friction defaults
 */
export const Collider: React.FC<ColliderProps> = ({
  type = 'cuboid',
  args,
  position,
  rotation,
  friction = 0,
  restitution = 0
}) => {
  if (type === 'cylinder') {
    return <CylinderCollider args={args} position={position} rotation={rotation} friction={friction} restitution={restitution} />;
  }
  if (type === 'capsule') {
    return <CapsuleCollider args={args} position={position} rotation={rotation} friction={friction} restitution={restitution} />;
  }
  return <CuboidCollider args={args} position={position} rotation={rotation} friction={friction} restitution={restitution} />;
};

interface WorldRapierCollidersProps {
  colliders: WorldCollider[];
  boundsRadius: number;
}

/**
 * Static Rapier RigidBodies and Colliders for the Plaza and all worlds
 */
export const WorldRapierColliders: React.FC<WorldRapierCollidersProps> = ({
  colliders,
  boundsRadius
}) => {
  return (
    <>
      {/* Static objects in current active world (Fountain, Portals, Trees, Desks, Counters, Altars, etc.) */}
      {colliders.map((col, idx) => {
        if (col.type === 'cylinder') {
          return (
            <RigidBody key={`rapier_cyl_${idx}`} type="fixed" colliders={false} friction={0} restitution={0} position={[col.x, 2.5, col.z]}>
              <Collider type="cylinder" args={[2.5, col.radius]} friction={0} restitution={0} />
            </RigidBody>
          );
        }
        if (col.type === 'box') {
          const halfX = Math.max(0.1, Math.abs(col.maxX - col.minX) / 2);
          const halfZ = Math.max(0.1, Math.abs(col.maxZ - col.minZ) / 2);
          const midX = (col.minX + col.maxX) / 2;
          const midZ = (col.minZ + col.maxZ) / 2;
          return (
            <RigidBody key={`rapier_box_${idx}`} type="fixed" colliders={false} friction={0} restitution={0} position={[midX, 2.5, midZ]}>
              <Collider type="cuboid" args={[halfX, 2.5, halfZ]} friction={0} restitution={0} />
            </RigidBody>
          );
        }
        return null;
      })}

      {/* Perimeter boundary wall colliders encircling the Plaza / World so Mari cannot walk off into space */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const nextAngle = ((i + 1) / 16) * Math.PI * 2;
        const midAngle = (angle + nextAngle) / 2;
        const R = boundsRadius + 0.45;
        const segLen = 2 * R * Math.sin(Math.PI / 16) * 1.06;
        const x = Math.cos(midAngle) * R;
        const z = Math.sin(midAngle) * R;
        return (
          <RigidBody
            key={`rapier_bound_${i}`}
            type="fixed"
            colliders={false}
            friction={0}
            restitution={0}
            position={[x, 3, z]}
            rotation={[0, -midAngle + Math.PI / 2, 0]}
          >
            <Collider type="cuboid" args={[segLen / 2, 3, 0.45]} friction={0} restitution={0} />
          </RigidBody>
        );
      })}
    </>
  );
};

export interface GameCanvasProps {
  currentWorld: WorldId;
  collectedStars: Record<number, boolean>;
  customization: CharacterCustomization;
  isDancing: boolean;
  isCelebrating: boolean;
  virtualJoystick: { x: number; y: number } | null;
  virtualJump: boolean;
  virtualInteract: boolean;
  onClearVirtualJump: () => void;
  onClearVirtualInteract: () => void;
  onNearInteractive: (point: WorldInteractivePoint | null) => void;
  onTriggerInteraction: (point: WorldInteractivePoint) => void;
  onStepWalked: () => void;
  bloomConfig?: BloomTweakProps;
}

interface GameSceneProps extends GameCanvasProps {
  mouseYawRef: React.MutableRefObject<number>;
  onTargetsCollected: (targets: THREE.Object3D[], lights: THREE.Light[]) => void;
  onBloomDynamicChange: (intensity: number, threshold: number) => void;
}

const GameScene: React.FC<GameSceneProps> = ({
  currentWorld,
  collectedStars,
  customization,
  isDancing,
  isCelebrating,
  virtualJoystick,
  virtualJump,
  virtualInteract,
  onClearVirtualJump,
  onClearVirtualInteract,
  onNearInteractive,
  onTriggerInteraction,
  onStepWalked,
  bloomConfig,
  mouseYawRef,
  onTargetsCollected,
  onBloomDynamicChange
}) => {
  const { scene, camera, gl } = useThree();

  const characterRigRef = useRef<CharacterRig | null>(null);
  const playerBodyRef = useRef<RapierRigidBody | null>(null);
  const activeWorldRef = useRef<BuiltWorld | null>(null);
  const loadedWorldIdRef = useRef<WorldId>(currentWorld);
  const lightsRef = useRef<THREE.Light[]>([]);
  const proximityFactorRef = useRef<number>(0);
  const lastEmittedBloomRef = useRef<{ int: number; thresh: number }>({ int: 1.4, thresh: 0.22 });

  // State for active world colliders in Rapier
  const [activeColliders, setActiveColliders] = useState<WorldCollider[]>([]);
  const [activeBoundsRadius, setActiveBoundsRadius] = useState<number>(17.2);

  // Callbacks reference
  const callbacksRef = useRef({
    onNearInteractive,
    onTriggerInteraction,
    onClearVirtualJump,
    onClearVirtualInteract,
    onStepWalked,
    onTargetsCollected,
    onBloomDynamicChange
  });
  callbacksRef.current = {
    onNearInteractive,
    onTriggerInteraction,
    onClearVirtualJump,
    onClearVirtualInteract,
    onStepWalked,
    onTargetsCollected,
    onBloomDynamicChange
  };

  const dynamicPropsRef = useRef({
    currentWorld,
    collectedStars,
    customization,
    isDancing,
    isCelebrating,
    virtualJoystick,
    virtualJump,
    virtualInteract,
    bloomConfig
  });
  dynamicPropsRef.current = {
    currentWorld,
    collectedStars,
    customization,
    isDancing,
    isCelebrating,
    virtualJoystick,
    virtualJump,
    virtualInteract,
    bloomConfig
  };

  // Kinematics and physics state in refs
  const physicsRef = useRef({
    verticalVelocity: 0,
    isGrounded: true,
    stepTimer: 0,
    initialized: false,
    lastNearestPoint: null as WorldInteractivePoint | null,
    keys: {} as Record<string, boolean>
  });

  // Reusable vectors for zero GC
  const mathRef = useRef({
    targetCamPos: new THREE.Vector3(),
    camLookAt: new THREE.Vector3()
  });

  // Scan and collect portal meshes and collected star objects for Bloom targeting
  const scanPortalAndStarTargets = () => {
    const targets: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (
        obj.userData?.isPortalOrStar === true ||
        obj.name === 'portal_vortex' ||
        obj.name === 'portal_crest' ||
        obj.name === 'portal_return' ||
        obj.name === 'collected_star'
      ) {
        targets.push(obj);
      }
    });
    callbacksRef.current.onTargetsCollected(targets, lightsRef.current);
  };

  // Apply customization when prop changes
  useEffect(() => {
    if (characterRigRef.current) {
      characterRigRef.current.applyCustomization(customization);
    }
  }, [customization]);

  // Initial Scene Setup (Lighting, Environment, Mari Rig, Initial World)
  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;

    // Room Environment
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Studio 3-point Lights
    const hemiLight = new THREE.HemisphereLight(0xe9d5ff, 0x1e1533, 0.7);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xec4899, 0.8);
    rimLight.position.set(-15, 12, -15);
    scene.add(rimLight);

    lightsRef.current = [dirLight, rimLight, hemiLight];

    // Purple atmospheric fog
    scene.fog = new THREE.FogExp2(0x130a28, 0.015);

    // Create Mari Rig
    const rig = createMari(dynamicPropsRef.current.customization);
    characterRigRef.current = rig;
    scene.add(rig.root);

    // Load initial World
    const initialWorld = loadWorld(currentWorld, collectedStars);
    activeWorldRef.current = initialWorld;
    scene.add(initialWorld.group);

    setActiveColliders(initialWorld.colliders || []);
    setActiveBoundsRadius(initialWorld.boundsRadius || 17.2);

    // Spawn positions
    rig.root.position.copy(initialWorld.spawnPoint);
    camera.position.copy(initialWorld.cameraInitPos);

    if (playerBodyRef.current) {
      playerBodyRef.current.setTranslation(
        { x: initialWorld.spawnPoint.x, y: initialWorld.spawnPoint.y + 0.1, z: initialWorld.spawnPoint.z },
        true
      );
      playerBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    // Register initial portal & star meshes for bloom
    scanPortalAndStarTargets();

    // Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      physicsRef.current.keys[e.code] = true;
      if (e.key) {
        physicsRef.current.keys[e.key] = true;
        physicsRef.current.keys[e.key.toLowerCase()] = true;
      }
      if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
        if (physicsRef.current.lastNearestPoint) {
          sound.playClick();
          callbacksRef.current.onTriggerInteraction(physicsRef.current.lastNearestPoint);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      physicsRef.current.keys[e.code] = false;
      if (e.key) {
        physicsRef.current.keys[e.key] = false;
        physicsRef.current.keys[e.key.toLowerCase()] = false;
      }
    };

    const onBlur = () => {
      for (const k of Object.keys(physicsRef.current.keys)) {
        physicsRef.current.keys[k] = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);

      scene.remove(hemiLight, dirLight, rimLight);
      if (characterRigRef.current) {
        scene.remove(characterRigRef.current.root);
      }
      if (activeWorldRef.current) {
        scene.remove(activeWorldRef.current.group);
        activeWorldRef.current.dispose();
      }
    };
  }, []);

  // Frame Loop (Kinematics, Camera, Animation, Proximity & Dynamic Bloom Surge)
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const time = state.clock.getElapsedTime();

    const rig = characterRigRef.current;
    if (!rig) return;

    // Check if world switched
    if (dynamicPropsRef.current.currentWorld !== loadedWorldIdRef.current) {
      loadedWorldIdRef.current = dynamicPropsRef.current.currentWorld;
      if (activeWorldRef.current) {
        scene.remove(activeWorldRef.current.group);
        activeWorldRef.current.dispose();
      }
      const newWorld = loadWorld(loadedWorldIdRef.current, dynamicPropsRef.current.collectedStars);
      activeWorldRef.current = newWorld;
      scene.add(newWorld.group);

      setActiveColliders(newWorld.colliders || []);
      setActiveBoundsRadius(newWorld.boundsRadius || 16);

      // Reset player to spawn point in world and Rapier physics
      rig.root.position.copy(newWorld.spawnPoint);
      rig.root.rotation.set(0, 0, 0);

      if (playerBodyRef.current) {
        playerBodyRef.current.setTranslation(
          { x: newWorld.spawnPoint.x, y: newWorld.spawnPoint.y + 0.1, z: newWorld.spawnPoint.z },
          true
        );
        playerBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }

      physicsRef.current.verticalVelocity = 0;
      physicsRef.current.isGrounded = true;
      sound.playPortalTravel();

      // Rescan targets for Bloom in new world
      scanPortalAndStarTargets();
    }

    const currentActiveWorld = activeWorldRef.current;
    if (currentActiveWorld) {
      currentActiveWorld.animate(time, dt);
    }

    // Input collection
    let moveX = 0;
    let moveZ = 0;
    const keys = physicsRef.current.keys;

    if (keys['KeyW'] || keys['ArrowUp'] || keys['w'] || keys['W']) moveZ -= 1;
    if (keys['KeyS'] || keys['ArrowDown'] || keys['s'] || keys['S']) moveZ += 1;
    if (keys['KeyA'] || keys['ArrowLeft'] || keys['a'] || keys['A']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight'] || keys['d'] || keys['D']) moveX += 1;

    // Virtual mobile joystick
    if (dynamicPropsRef.current.virtualJoystick) {
      moveX += dynamicPropsRef.current.virtualJoystick.x;
      moveZ += dynamicPropsRef.current.virtualJoystick.y;
    }

    const isSprinting = !!keys['ShiftLeft'] || !!keys['ShiftRight'] || !!keys['Shift'];
    const wantsJump = !!keys['Space'] || !!keys[' '] || dynamicPropsRef.current.virtualJump;

    if (dynamicPropsRef.current.virtualInteract) {
      callbacksRef.current.onClearVirtualInteract();
      if (physicsRef.current.lastNearestPoint) {
        sound.playClick();
        callbacksRef.current.onTriggerInteraction(physicsRef.current.lastNearestPoint);
      }
    }

    const inputLen = Math.hypot(moveX, moveZ);
    const isMoving = inputLen > 0.04;

    const playerPos = rig.root.position;
    const playerBody = playerBodyRef.current;

    // First mount body sync to current active world spawn point
    if (!physicsRef.current.initialized && playerBody) {
      physicsRef.current.initialized = true;
      const spawn = activeWorldRef.current?.spawnPoint || new THREE.Vector3(0, 0, 7.5);
      playerBody.setTranslation({ x: spawn.x, y: Math.max(0.05, spawn.y), z: spawn.z }, true);
      playerBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
      playerPos.set(spawn.x, Math.max(0, spawn.y), spawn.z);
    }

    if (playerBody) {
      const trans = playerBody.translation();
      const linvel = playerBody.linvel();

      // Ground detection: close to ground and vertical velocity is stable
      const isGroundedNow = trans.y <= 0.22 && linvel.y >= -1.5 && linvel.y <= 0.9;
      physicsRef.current.isGrounded = isGroundedNow;

      let vy = linvel.y;
      if (wantsJump && isGroundedNow) {
        vy = 7.2;
        physicsRef.current.isGrounded = false;
        sound.playJump();
        callbacksRef.current.onClearVirtualJump();
      } else if (isGroundedNow && vy < 0) {
        // Prevent continuous gravity downward accumulation while on floor
        vy = 0;
      }

      if (isMoving && !dynamicPropsRef.current.isDancing && !dynamicPropsRef.current.isCelebrating) {
        const normX = moveX / Math.max(1, inputLen);
        const normZ = moveZ / Math.max(1, inputLen);

        const mouseYaw = mouseYawRef.current;
        const cosYaw = Math.cos(mouseYaw);
        const sinYaw = Math.sin(mouseYaw);
        const worldMoveX = normX * cosYaw - normZ * sinYaw;
        const worldMoveZ = normX * sinYaw + normZ * cosYaw;

        const moveSpeed = (isSprinting ? 7.2 : 4.6) * Math.min(1, inputLen);
        const targetVelX = worldMoveX * moveSpeed;
        const targetVelZ = worldMoveZ * moveSpeed;

        playerBody.setLinvel({ x: targetVelX, y: vy, z: targetVelZ }, true);

        // Smooth rotation
        const targetAngle = Math.atan2(worldMoveX, worldMoveZ);
        let diff = targetAngle - rig.root.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        rig.root.rotation.y += diff * Math.min(1, 14 * dt);

        // Footstep sound & stats
        physicsRef.current.stepTimer += dt;
        const stepInterval = isSprinting ? 0.26 : 0.40;
        if (physicsRef.current.stepTimer >= stepInterval && isGroundedNow) {
          physicsRef.current.stepTimer = 0;
          sound.playFootstep();
          callbacksRef.current.onStepWalked();
        }
      } else {
        // Crisp stop when no input is active
        playerBody.setLinvel({ x: 0, y: vy, z: 0 }, true);
      }

      // Sync character visual position with Rapier translation
      playerPos.x = trans.x;
      playerPos.z = trans.z;
      playerPos.y = Math.max(0, trans.y);
    } else {
      // Kinematic fallback
      if (wantsJump && physicsRef.current.isGrounded) {
        physicsRef.current.verticalVelocity = 6.8;
        physicsRef.current.isGrounded = false;
        sound.playJump();
        callbacksRef.current.onClearVirtualJump();
      }

      if (isMoving && !dynamicPropsRef.current.isDancing && !dynamicPropsRef.current.isCelebrating) {
        const normX = moveX / Math.max(1, inputLen);
        const normZ = moveZ / Math.max(1, inputLen);

        const mouseYaw = mouseYawRef.current;
        const cosYaw = Math.cos(mouseYaw);
        const sinYaw = Math.sin(mouseYaw);
        const worldMoveX = normX * cosYaw - normZ * sinYaw;
        const worldMoveZ = normX * sinYaw + normZ * cosYaw;

        const moveSpeed = (isSprinting ? 7.2 : 4.6) * Math.min(1, inputLen);
        playerPos.x += worldMoveX * moveSpeed * dt;
        playerPos.z += worldMoveZ * moveSpeed * dt;

        const targetAngle = Math.atan2(worldMoveX, worldMoveZ);
        let diff = targetAngle - rig.root.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        rig.root.rotation.y += diff * Math.min(1, 14 * dt);

        physicsRef.current.stepTimer += dt;
        const stepInterval = isSprinting ? 0.26 : 0.40;
        if (physicsRef.current.stepTimer >= stepInterval && physicsRef.current.isGrounded) {
          physicsRef.current.stepTimer = 0;
          sound.playFootstep();
          callbacksRef.current.onStepWalked();
        }
      }

      if (!physicsRef.current.isGrounded) {
        physicsRef.current.verticalVelocity -= 18.0 * dt;
        playerPos.y += physicsRef.current.verticalVelocity * dt;
        if (playerPos.y <= 0) {
          playerPos.y = 0;
          physicsRef.current.verticalVelocity = 0;
          physicsRef.current.isGrounded = true;
        }
      }
    }

    // Secondary continuous sliding collision safety net
    if (currentActiveWorld?.colliders && currentActiveWorld.colliders.length > 0) {
      const PLAYER_RADIUS = 0.45;
      let adjusted = false;
      for (let iter = 0; iter < 2; iter++) {
        for (const col of currentActiveWorld.colliders) {
          if (col.type === 'cylinder') {
            const dx = playerPos.x - col.x;
            const dz = playerPos.z - col.z;
            const dist = Math.hypot(dx, dz);
            const minDist = col.radius + PLAYER_RADIUS;
            if (dist < minDist) {
              adjusted = true;
              if (dist > 0.0001) {
                playerPos.x = col.x + (dx / dist) * minDist;
                playerPos.z = col.z + (dz / dist) * minDist;
              } else {
                playerPos.z += minDist;
              }
            }
          } else if (col.type === 'box') {
            const closestX = Math.max(col.minX, Math.min(playerPos.x, col.maxX));
            const closestZ = Math.max(col.minZ, Math.min(playerPos.z, col.maxZ));
            const dx = playerPos.x - closestX;
            const dz = playerPos.z - closestZ;
            const dist = Math.hypot(dx, dz);

            if (dist < PLAYER_RADIUS) {
              adjusted = true;
              if (dist > 0.0001) {
                const pushOut = PLAYER_RADIUS - dist;
                playerPos.x += (dx / dist) * pushOut;
                playerPos.z += (dz / dist) * pushOut;
              } else {
                const dLeft = Math.abs(playerPos.x - col.minX);
                const dRight = Math.abs(playerPos.x - col.maxX);
                const dBack = Math.abs(playerPos.z - col.minZ);
                const dFront = Math.abs(playerPos.z - col.maxZ);
                const minEdge = Math.min(dLeft, dRight, dBack, dFront);
                if (minEdge === dLeft) playerPos.x = col.minX - PLAYER_RADIUS;
                else if (minEdge === dRight) playerPos.x = col.maxX + PLAYER_RADIUS;
                else if (minEdge === dBack) playerPos.z = col.minZ - PLAYER_RADIUS;
                else playerPos.z = col.maxZ + PLAYER_RADIUS;
              }
            }
          }
        }
      }

      // Bounds safety clamp
      if (currentActiveWorld) {
        const distFromCenter = Math.hypot(playerPos.x, playerPos.z);
        if (distFromCenter > currentActiveWorld.boundsRadius) {
          adjusted = true;
          const clampRatio = currentActiveWorld.boundsRadius / distFromCenter;
          playerPos.x *= clampRatio;
          playerPos.z *= clampRatio;
        }
      }

      // Keep Rapier body synchronized with safety net adjustments
      if (adjusted && playerBody) {
        playerBody.setTranslation({ x: playerPos.x, y: playerPos.y, z: playerPos.z }, false);
      }
    }

    // Animation state
    let currentAnim: 'idle' | 'walk' | 'run' | 'jump' | 'dance' | 'celebrate' = 'idle';
    if (dynamicPropsRef.current.isDancing) {
      currentAnim = 'dance';
    } else if (dynamicPropsRef.current.isCelebrating) {
      currentAnim = 'celebrate';
    } else if (!physicsRef.current.isGrounded && playerPos.y > 0.22) {
      currentAnim = 'jump';
    } else if (isMoving) {
      currentAnim = isSprinting ? 'run' : 'walk';
    } else {
      currentAnim = 'idle';
    }

    // Update rig animation
    rig.updateAnimation(currentAnim, time, dt);

    // Third Person Camera Follow
    const camDist = 5.2;
    const camHeight = 3.2;
    const camAngle = mouseYawRef.current;

    const { targetCamPos, camLookAt } = mathRef.current;
    targetCamPos.set(
      playerPos.x + Math.sin(camAngle) * camDist,
      playerPos.y + camHeight,
      playerPos.z + Math.cos(camAngle) * camDist
    );

    camera.position.lerp(targetCamPos, Math.min(1, 8 * dt));
    camLookAt.set(playerPos.x, playerPos.y + 1.2, playerPos.z);
    camera.lookAt(camLookAt);

    // Proximity check for interactives and portals
    if (currentActiveWorld) {
      let nearest: WorldInteractivePoint | null = null;
      let minDistance = Infinity;
      let minPortalDist = Infinity;

      for (const pt of currentActiveWorld.interactives) {
        const d = playerPos.distanceTo(pt.position);
        if (d <= pt.radius && d < minDistance) {
          minDistance = d;
          nearest = pt;
        }
        if (pt.type === 'portal' && d < minPortalDist) {
          minPortalDist = d;
        }
      }

      if (nearest !== physicsRef.current.lastNearestPoint) {
        physicsRef.current.lastNearestPoint = nearest;
        callbacksRef.current.onNearInteractive(nearest);
      }

      // Proximity-based Bloom surge towards portals
      const cfg = dynamicPropsRef.current.bloomConfig;
      const maxProximityDist = cfg?.proximityDistance ?? 9.5;
      const minProximityDist = 1.8;
      const rawFactor = (maxProximityDist - minPortalDist) / (maxProximityDist - minProximityDist);
      const targetFactor = THREE.MathUtils.clamp(rawFactor, 0, 1);

      proximityFactorRef.current = THREE.MathUtils.damp(
        proximityFactorRef.current,
        targetFactor,
        5.0,
        dt
      );

      const factor = proximityFactorRef.current;
      const baseInt = cfg?.baseIntensity ?? 1.4;
      const maxInt = cfg?.maxIntensity ?? 3.5;
      const baseThresh = cfg?.baseThreshold ?? 0.22;
      const minThresh = cfg?.minThreshold ?? 0.08;

      const dynamicInt = Number(THREE.MathUtils.lerp(baseInt, maxInt, factor).toFixed(2));
      const dynamicThresh = Number(THREE.MathUtils.lerp(baseThresh, minThresh, factor).toFixed(2));

      if (
        Math.abs(dynamicInt - lastEmittedBloomRef.current.int) >= 0.08 ||
        Math.abs(dynamicThresh - lastEmittedBloomRef.current.thresh) >= 0.03
      ) {
        lastEmittedBloomRef.current = { int: dynamicInt, thresh: dynamicThresh };
        callbacksRef.current.onBloomDynamicChange(dynamicInt, dynamicThresh);
      }
    }
  });

  return (
    <Suspense fallback={null}>
      <Physics gravity={[0, -20, 0]}>
        {/* Dynamic Character RigidBody with Capsule Collider */}
        <RigidBody
          ref={playerBodyRef}
          colliders={false}
          type="dynamic"
          enabledRotations={[false, false, false]}
          linearDamping={0.5}
          friction={0}
          restitution={0}
          mass={60}
          position={[0, 0.05, 7.5]}
        >
          <Collider type="capsule" args={[0.42, 0.35]} position={[0, 0.77, 0]} friction={0} restitution={0} />
        </RigidBody>

        {/* Static Ground Floor */}
        <RigidBody type="fixed" colliders={false} friction={0} restitution={0}>
          <Collider type="cuboid" args={[35, 0.5, 35]} position={[0, -0.5, 0]} friction={0} restitution={0} />
        </RigidBody>

        {/* World Static Obstacles and Perimeter Boundaries */}
        <WorldRapierColliders colliders={activeColliders} boundsRadius={activeBoundsRadius} />
      </Physics>
    </Suspense>
  );
};

export const GameCanvas: React.FC<GameCanvasProps> = (props) => {
  const mouseYawRef = useRef<number>(0);
  const isMouseDownRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);
  const touchIdRef = useRef<number | null>(null);

  // Targets specifically collected for the Bloom effect (portals and stars)
  const [bloomTargets, setBloomTargets] = useState<THREE.Object3D[]>([]);
  const [lights, setLights] = useState<THREE.Light[]>([]);

  // Fine-tuned dynamic Bloom values (portal proximity surge)
  const [dynamicBloom, setDynamicBloom] = useState<{ intensity: number; threshold: number }>({
    intensity: props.bloomConfig?.baseIntensity ?? 1.4,
    threshold: props.bloomConfig?.baseThreshold ?? 0.22
  });

  const handleTargetsCollected = (targets: THREE.Object3D[], sceneLights: THREE.Light[]) => {
    setBloomTargets(targets);
    setLights(sceneLights);
  };

  const handleBloomDynamicChange = (intensity: number, threshold: number) => {
    setDynamicBloom({ intensity, threshold });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isMouseDownRef.current = true;
      lastMouseXRef.current = e.clientX;
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isMouseDownRef.current) {
      const deltaX = e.clientX - lastMouseXRef.current;
      lastMouseXRef.current = e.clientX;
      mouseYawRef.current -= deltaX * 0.005;
    }
  };

  const onMouseUp = () => {
    isMouseDownRef.current = false;
  };

  // Mobile Touch Controls for Camera Orbit (avoiding virtual joystick on bottom-left)
  const onTouchStart = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const isJoystickZone = t.clientX < window.innerWidth * 0.45 && t.clientY > window.innerHeight * 0.55;
      if (!isJoystickZone && touchIdRef.current === null) {
        touchIdRef.current = t.identifier;
        lastMouseXRef.current = t.clientX;
        break;
      }
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === touchIdRef.current) {
        const deltaX = t.clientX - lastMouseXRef.current;
        lastMouseXRef.current = t.clientX;
        mouseYawRef.current -= deltaX * 0.007;
        break;
      }
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        break;
      }
    }
  };

  const bloomRadius = props.bloomConfig?.radius ?? 0.85;
  const bloomSmoothing = props.bloomConfig?.luminanceSmoothing ?? 0.9;

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
    >
      <Canvas
        shadows
        camera={{
          fov: 52,
          near: 0.1,
          far: 300,
          position: [0, 4.5, 12.5]
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        <GameScene
          {...props}
          mouseYawRef={mouseYawRef}
          onTargetsCollected={handleTargetsCollected}
          onBloomDynamicChange={handleBloomDynamicChange}
        />

        {/* EffectComposer with Bloom effect specifically targeting portal meshes and collected star objects */}
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            intensity={dynamicBloom.intensity}
            luminanceThreshold={dynamicBloom.threshold}
            luminanceSmoothing={bloomSmoothing}
            mipmapBlur
            radius={bloomRadius}
          />
          {bloomTargets.length > 0 && lights.length > 0 && (
            <SelectiveBloom
              selection={bloomTargets}
              lights={lights}
              intensity={dynamicBloom.intensity * 1.25}
              luminanceThreshold={Math.max(0.04, dynamicBloom.threshold - 0.05)}
              luminanceSmoothing={bloomSmoothing}
              mipmapBlur
              radius={bloomRadius}
            />
          )}
        </EffectComposer>
      </Canvas>
    </div>
  );
};
