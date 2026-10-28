import * as THREE from 'three';
import { CharacterCustomization } from '../../types/game';

export interface CharacterRig {
  root: THREE.Group;
  head: THREE.Group;
  hairGroup: THREE.Group;
  torso: THREE.Mesh;
  backpack: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  hairMesh: THREE.Mesh;
  shirtMaterial: THREE.MeshStandardMaterial;
  hairMaterial: THREE.MeshStandardMaterial;
  backpackMaterial: THREE.MeshStandardMaterial;
  pantsMaterial: THREE.MeshStandardMaterial;
  skinMaterial: THREE.MeshStandardMaterial;
  updateAnimation: (state: 'idle' | 'walk' | 'run' | 'jump' | 'dance' | 'celebrate', time: number, dt: number) => void;
  applyCustomization: (custom: CharacterCustomization) => void;
}

// Helper to create a canvas texture for the shirt with ARMY/BTS logo
function createShirtTexture(color: string, logo: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);

  // Gradient shading
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Logo text in center
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 8;
  ctx.fillText(logo, 128, 120);

  // Small heart or 7 below
  ctx.font = '28px sans-serif';
  ctx.fillText('💜', 128, 175);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createMari(custom: CharacterCustomization): CharacterRig {
  const root = new THREE.Group();
  root.name = 'Mari_Root';

  // Inner body container to handle local bobbing/dance without touching world position
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'Mari_BodyGroup';
  root.add(bodyGroup);

  // Base Materials
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: custom.skinTone,
    roughness: 0.6,
    metalness: 0.05
  });

  const shirtTexture = createShirtTexture(custom.shirtColor, custom.shirtLogo);
  const shirtMaterial = new THREE.MeshStandardMaterial({
    map: shirtTexture,
    roughness: 0.8,
    metalness: 0.05
  });

  const pantsMaterial = new THREE.MeshStandardMaterial({
    color: custom.pantsColor,
    roughness: 0.85,
    metalness: 0.02
  });

  const hairMaterial = new THREE.MeshStandardMaterial({
    color: custom.hairColor,
    roughness: 0.5,
    metalness: 0.1
  });

  const backpackMaterial = new THREE.MeshStandardMaterial({
    color: custom.backpackColor,
    roughness: 0.65,
    metalness: 0.15
  });

  const shoesMaterial = new THREE.MeshStandardMaterial({
    color: custom.shoesColor,
    roughness: 0.35,
    metalness: 0.1
  });

  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x1f1724 });
  const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const purpleAccentMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    roughness: 0.3,
    metalness: 0.4
  });

  // 1. TORSO (Centered around Y = 0.8)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.75, 0);

  const torsoGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.55, 16);
  const torso = new THREE.Mesh(torsoGeo, shirtMaterial);
  torso.castShadow = true;
  torso.receiveShadow = true;
  torsoGroup.add(torso);

  // Backpack on back of torso
  const backpackGeo = new THREE.BoxGeometry(0.32, 0.4, 0.18);
  const backpack = new THREE.Mesh(backpackGeo, backpackMaterial);
  backpack.position.set(0, 0.02, -0.19);
  backpack.castShadow = true;
  torsoGroup.add(backpack);

  // Cute miniature ARMY Bomb pin on backpack
  const pinHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, emissive: 0x8b5cf6, emissiveIntensity: 0.4 })
  );
  pinHead.position.set(0.08, 0.08, -0.29);
  torsoGroup.add(pinHead);

  bodyGroup.add(torsoGroup);

  // 2. HEAD (Around Y = 1.25)
  const head = new THREE.Group();
  head.position.set(0, 1.2, 0);

  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.09, 0.15, 12),
    skinMaterial
  );
  neck.position.set(0, -0.12, 0);
  head.add(neck);

  // Head sphere
  const headGeo = new THREE.SphereGeometry(0.26, 24, 20);
  headGeo.scale(1, 1.1, 1);
  const headMesh = new THREE.Mesh(headGeo, skinMaterial);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Eyes (Expressive large stylized anime-style eyes)
  const leftEyeGroup = new THREE.Group();
  leftEyeGroup.position.set(0.09, 0.02, 0.23);

  const eyeWhiteL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), eyeWhiteMaterial);
  eyeWhiteL.scale.set(0.6, 1, 0.25);
  const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), eyeMaterial);
  pupilL.position.set(0, 0, 0.025);
  pupilL.scale.set(0.5, 0.9, 0.2);
  const sparkleL = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), eyeWhiteMaterial);
  sparkleL.position.set(0.015, 0.02, 0.04);
  leftEyeGroup.add(eyeWhiteL, pupilL, sparkleL);
  head.add(leftEyeGroup);

  const rightEyeGroup = leftEyeGroup.clone();
  rightEyeGroup.position.set(-0.09, 0.02, 0.23);
  head.add(rightEyeGroup);

  // Cheerful blush
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.5 });
  const blushL = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), blushMat);
  blushL.position.set(0.14, -0.06, 0.23);
  blushL.rotation.y = 0.3;
  const blushR = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), blushMat);
  blushR.position.set(-0.14, -0.06, 0.23);
  blushR.rotation.y = -0.3;
  head.add(blushL, blushR);

  // Hair Group
  const hairGroup = new THREE.Group();
  // Hair helmet base
  const hairBaseGeo = new THREE.SphereGeometry(0.29, 20, 18);
  const hairMesh = new THREE.Mesh(hairBaseGeo, hairMaterial);
  hairMesh.position.set(0, 0.05, -0.03);
  hairMesh.scale.set(1.02, 1.05, 1.05);
  hairGroup.add(hairMesh);

  // Bangs
  const bangs = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.12, 0.08),
    hairMaterial
  );
  bangs.position.set(0, 0.16, 0.23);
  bangs.rotation.x = -0.2;
  hairGroup.add(bangs);

  // Ponytail attachment
  const ponytail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.16, 0.45, 12),
    hairMaterial
  );
  ponytail.position.set(0, -0.05, -0.32);
  ponytail.rotation.x = 0.55;
  hairGroup.add(ponytail);

  // Purple hair ribbon / clip
  const ribbon = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.03, 8, 16),
    purpleAccentMaterial
  );
  ribbon.position.set(0, 0.1, -0.28);
  ribbon.rotation.x = 0.5;
  hairGroup.add(ribbon);

  head.add(hairGroup);
  bodyGroup.add(head);

  // 3. ARMS
  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(0.32, 0.95, 0);

  const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), shirtMaterial);
  const leftLimb = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.45, 12), skinMaterial);
  leftLimb.position.set(0, -0.22, 0);
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), skinMaterial);
  leftHand.position.set(0, -0.46, 0);
  leftArm.add(leftShoulder, leftLimb, leftHand);
  bodyGroup.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(-0.32, 0.95, 0);

  const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), shirtMaterial);
  const rightLimb = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.45, 12), skinMaterial);
  rightLimb.position.set(0, -0.22, 0);
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), skinMaterial);
  rightHand.position.set(0, -0.46, 0);
  rightArm.add(rightShoulder, rightLimb, rightHand);
  bodyGroup.add(rightArm);

  // 4. LEGS
  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(0.12, 0.5, 0);

  const leftPants = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 12), pantsMaterial);
  leftPants.position.set(0, -0.2, 0);
  leftPants.castShadow = true;

  // Sneaker
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.24), shoesMaterial);
  leftShoe.position.set(0, -0.45, 0.04);
  leftShoe.castShadow = true;
  // Purple sole accent
  const leftSole = new THREE.Mesh(new THREE.BoxGeometry(0.142, 0.03, 0.242), purpleAccentMaterial);
  leftSole.position.set(0, -0.49, 0.04);

  leftLeg.add(leftPants, leftShoe, leftSole);
  bodyGroup.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(-0.12, 0.5, 0);

  const rightPants = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 12), pantsMaterial);
  rightPants.position.set(0, -0.2, 0);
  rightPants.castShadow = true;

  // Sneaker
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.24), shoesMaterial);
  rightShoe.position.set(0, -0.45, 0.04);
  rightShoe.castShadow = true;
  const rightSole = new THREE.Mesh(new THREE.BoxGeometry(0.142, 0.03, 0.242), purpleAccentMaterial);
  rightSole.position.set(0, -0.49, 0.04);

  rightLeg.add(rightPants, rightShoe, rightSole);
  bodyGroup.add(rightLeg);

  // Contact shadow under character
  const shadowGeo = new THREE.CircleGeometry(0.45, 16);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x070314,
    transparent: true,
    opacity: 0.45,
    depthWrite: false
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.01;
  root.add(shadowMesh);

  // Animation Update function
  const updateAnimation = (state: 'idle' | 'walk' | 'run' | 'jump' | 'dance' | 'celebrate', time: number, _dt: number) => {
    switch (state) {
      case 'idle': {
        const breathe = Math.sin(time * 2.5) * 0.02;
        torsoGroup.position.y = 0.75 + breathe;
        head.position.y = 1.2 + breathe * 1.2;
        head.rotation.y = Math.sin(time * 0.8) * 0.08;
        head.rotation.z = Math.sin(time * 1.2) * 0.03;

        leftArm.rotation.x = Math.sin(time * 2) * 0.06;
        leftArm.rotation.z = 0.15 + breathe;
        rightArm.rotation.x = -Math.sin(time * 2) * 0.06;
        rightArm.rotation.z = -0.15 - breathe;

        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        bodyGroup.position.y = 0;
        break;
      }
      case 'walk': {
        const speed = 8.5;
        const swing = Math.sin(time * speed);
        const bob = Math.abs(Math.sin(time * speed)) * 0.06;

        bodyGroup.position.y = bob;
        torsoGroup.rotation.y = swing * 0.08;
        head.rotation.y = -swing * 0.04;

        leftLeg.rotation.x = swing * 0.55;
        rightLeg.rotation.x = -swing * 0.55;

        leftArm.rotation.x = -swing * 0.55;
        leftArm.rotation.z = 0.18;
        rightArm.rotation.x = swing * 0.55;
        rightArm.rotation.z = -0.18;
        break;
      }
      case 'run': {
        const speed = 14;
        const swing = Math.sin(time * speed);
        const bob = Math.abs(Math.sin(time * speed)) * 0.12;

        bodyGroup.position.y = bob;
        torsoGroup.rotation.x = 0.15;
        torsoGroup.rotation.y = swing * 0.12;
        head.rotation.x = -0.1;

        leftLeg.rotation.x = swing * 0.95;
        rightLeg.rotation.x = -swing * 0.95;

        leftArm.rotation.x = -swing * 0.9;
        leftArm.rotation.z = 0.3;
        rightArm.rotation.x = swing * 0.9;
        rightArm.rotation.z = -0.3;
        break;
      }
      case 'jump': {
        bodyGroup.position.y = 0;
        torsoGroup.rotation.x = -0.05;
        leftLeg.rotation.x = -0.4;
        rightLeg.rotation.x = -0.3;
        leftArm.rotation.x = -1.8;
        rightArm.rotation.x = -1.8;
        leftArm.rotation.z = 0.4;
        rightArm.rotation.z = -0.4;
        head.rotation.x = 0.2;
        break;
      }
      case 'dance': {
        const danceSpeed = 9.0;
        const hipSway = Math.sin(time * danceSpeed) * 0.22;
        const armSway = Math.cos(time * danceSpeed) * 0.7;

        bodyGroup.position.y = Math.abs(Math.sin(time * danceSpeed)) * 0.1;
        torsoGroup.rotation.z = hipSway;
        torsoGroup.rotation.y = Math.sin(time * 4) * 0.3;

        leftArm.rotation.x = Math.sin(time * 6) * 0.8;
        leftArm.rotation.z = 0.8 + armSway * 0.4;
        rightArm.rotation.x = -Math.sin(time * 6) * 0.8;
        rightArm.rotation.z = -0.8 - armSway * 0.4;

        leftLeg.rotation.x = Math.sin(time * danceSpeed) * 0.3;
        rightLeg.rotation.x = -Math.sin(time * danceSpeed) * 0.3;
        break;
      }
      case 'celebrate': {
        const jumpH = Math.abs(Math.sin(time * 7)) * 0.35;
        bodyGroup.position.y = jumpH;

        leftArm.rotation.x = -2.4 + Math.sin(time * 8) * 0.2;
        rightArm.rotation.x = -2.4 - Math.sin(time * 8) * 0.2;
        leftArm.rotation.z = 0.6;
        rightArm.rotation.z = -0.6;

        head.rotation.x = -0.3;
        head.rotation.y = Math.sin(time * 5) * 0.15;
        break;
      }
    }
  };

  const applyCustomization = (c: CharacterCustomization) => {
    skinMaterial.color.set(c.skinTone);
    hairMaterial.color.set(c.hairColor);
    pantsMaterial.color.set(c.pantsColor);
    backpackMaterial.color.set(c.backpackColor);
    shoesMaterial.color.set(c.shoesColor);

    // Refresh shirt texture
    const newTex = createShirtTexture(c.shirtColor, c.shirtLogo);
    shirtMaterial.map = newTex;
    shirtMaterial.needsUpdate = true;
  };

  return {
    root,
    head,
    hairGroup,
    torso,
    backpack,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    hairMesh,
    shirtMaterial,
    hairMaterial,
    backpackMaterial,
    pantsMaterial,
    skinMaterial,
    updateAnimation,
    applyCustomization
  };
}

export const createAlejandra = createMari;
