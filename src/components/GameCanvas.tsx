import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GameSettings } from '../types';
import { HEROES } from './CharacterSelectModal';
import { audioEngine } from '../utils/audio';
import { getKeyDisplayLabel } from '../utils/storage';
import { Pause, Play, Settings, Home, Heart, Swords, RotateCcw, Shield, Music, Skull, Trophy } from 'lucide-react';

interface GameCanvasProps {
  settings: GameSettings;
  selectedHeroId: 'blade' | 'ninja' | 'mage';
  onOpenOptions: () => void;
  onReturnToMenu: () => void;
}

const GROUND_TEXTURE_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1783489874/ground_d1kjrx_u7acvh.png';
const PLAYER_TEXTURE_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1782713483/player_zolbhw.png';
const ITEM_TEXTURE_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1782713526/potion_rjbae3.png';
const ENEMY_TEXTURE_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1782713524/enemy_hzgces.png';
const BOSS_TEXTURE_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1782713525/boss_dmspxv.png';

// Row Indices for Spritesheet (4 rows total)
// Row 0 (Top): Idle (ยืนนิ่งๆ)
// Row 1: Walk (เดิน)
// Row 2: Attack (โจมตี) - Key P
// Row 3 (Bottom): Dance (เต้นสร้าง Skill) - Key O
enum AnimState {
  IDLE = 0,
  WALK = 1,
  ATTACK = 2,
  DANCE = 3,
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  settings,
  selectedHeroId,
  onOpenOptions,
  onReturnToMenu,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isEndingScreenOpen, setIsEndingScreenOpen] = useState(false);
  const [playerHpState, setPlayerHpState] = useState(5);
  const [bossHpState, setBossHpState] = useState<number | null>(null);
  const [isBossSpawnedState, setIsBossSpawnedState] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [killCount, setKillCount] = useState(0);
  const [activeActionLabel, setActiveActionLabel] = useState<string | null>(null);

  const hero = HEROES.find((h) => h.id === selectedHeroId) || HEROES[0];
  const isTh = settings.gameplay.language === 'th';
  const bindings = settings.keybindings;
  const touch = settings.touch;

  // Touch controls ref
  const touchJoystickRef = useRef<{ active: boolean; dx: number; dy: number; touchId: number | null }>({
    active: false,
    dx: 0,
    dy: 0,
    touchId: null,
  });

  const touchActionsRef = useRef<{
    attack: boolean;
    dance: boolean;
    dash: boolean;
  }>({
    attack: false,
    dance: false,
    dash: false,
  });

  const restartTriggerRef = useRef<() => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- 1. THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a12);
    scene.fog = new THREE.FogExp2(0x070a12, 0.02);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- 2. LIGHTING SETUP ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
    dirLight.position.set(20, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    const shadowD = 30;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    scene.add(dirLight);

    // Colored point lights for atmosphere
    const goldPointLight = new THREE.PointLight(0xd4af37, 2, 25);
    goldPointLight.position.set(0, 4, 0);
    scene.add(goldPointLight);

    // --- 3. GROUND PLANE 50x50 WITH TILING GROUND TEXTURE ---
    const textureLoader = new THREE.TextureLoader();

    const groundTexture = textureLoader.load(GROUND_TEXTURE_URL);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10); // Small tile repeat across 50x50

    const groundGeo = new THREE.PlaneGeometry(50, 50, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.7,
      metalness: 0.2,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Ground Boundary Grid / Accent Border
    const gridHelper = new THREE.GridHelper(50, 50, 0xd4af37, 0x223344);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Arena Corner Decorative Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.6, 0.8, 6, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.8 });
    const crystalGeo = new THREE.OctahedronGeometry(0.8);
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0xd4af37, emissiveIntensity: 0.6 });

    const cornerCoords = [
      [-24, -24], [24, -24], [-24, 24], [24, 24]
    ];
    cornerCoords.forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, 3, pz);
      pillar.castShadow = true;
      scene.add(pillar);

      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(px, 6.8, pz);
      scene.add(crystal);
    });

    // --- 4. 2D BILLBOARD CHARACTER WITH SPRITESHEET (PLAYER.PNG) ---
    const playerTexture = textureLoader.load(PLAYER_TEXTURE_URL);
    playerTexture.wrapS = THREE.ClampToEdgeWrapping;
    playerTexture.wrapT = THREE.ClampToEdgeWrapping;
    playerTexture.repeat.set(0.25, 0.25);

    const playerGeo = new THREE.PlaneGeometry(3.2, 3.2);
    const playerMat = new THREE.MeshStandardMaterial({
      map: playerTexture,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
      roughness: 0.5,
    });
    const playerMesh = new THREE.Mesh(playerGeo, playerMat);
    playerMesh.castShadow = true;
    playerMesh.position.set(0, 1.6, 0);
    scene.add(playerMesh);

    // Blob Shadow beneath Character
    const shadowGeo = new THREE.PlaneGeometry(2.0, 2.0);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    scene.add(shadowMesh);

    // --- 5. ITEMS (POTIONS) SYSTEM ---
    const itemTexture = textureLoader.load(ITEM_TEXTURE_URL);
    const itemGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const itemsList: Array<{
      id: number;
      mesh: THREE.Mesh;
      x: number;
      z: number;
      bobOffset: number;
    }> = [];

    let nextItemId = 1;

    const spawnItem = (x?: number, z?: number) => {
      const posX = x ?? (Math.random() * 36 - 18);
      const posZ = z ?? (Math.random() * 36 - 18);

      const mat = new THREE.MeshStandardMaterial({
        map: itemTexture,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide,
        emissive: 0x22c55e,
        emissiveIntensity: 0.3,
      });

      const mesh = new THREE.Mesh(itemGeo, mat);
      mesh.position.set(posX, 1.0, posZ);
      scene.add(mesh);

      itemsList.push({
        id: nextItemId++,
        mesh,
        x: posX,
        z: posZ,
        bobOffset: Math.random() * Math.PI * 2,
      });
    };

    // Spawn 4 initial potions
    for (let i = 0; i < 4; i++) {
      spawnItem();
    }

    // --- 6. ENEMIES SYSTEM (ENEMY.PNG) ---
    // Enemy Spritesheet: 256x256px per frame, 4 frames per row, 2 rows
    // Row 0 (top): Idle (ยืน)
    // Row 1 (bottom): Walk (เดิน)
    // Default facing left (scale.x > 0 faces Left)
    const enemyTextureBase = textureLoader.load(ENEMY_TEXTURE_URL);

    interface EnemyEntity {
      id: number;
      mesh: THREE.Mesh;
      mat: THREE.MeshStandardMaterial;
      tex: THREE.Texture;
      x: number;
      z: number;
      hitCount: number; // 0 = normal, 1 = hit once (knocked back), 2 = dying/dead
      state: 'idle' | 'walk' | 'knockback' | 'dying';
      vx: number;
      vz: number;
      attackCooldown: number;
      flashTimer: number;
      dieTimer: number;
      frameTimer: number;
      currentFrame: number;
      facingRight: boolean;
    }

    const enemiesList: EnemyEntity[] = [];
    let nextEnemyId = 1;

    const spawnEnemy = (x?: number, z?: number) => {
      // Clone texture so each enemy can independently set UV offsets
      const tex = enemyTextureBase.clone();
      tex.needsUpdate = true;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(0.25, 0.5); // 4 cols, 2 rows

      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide,
        roughness: 0.4,
      });

      const enemyGeo = new THREE.PlaneGeometry(2.8, 2.8);
      const mesh = new THREE.Mesh(enemyGeo, mat);
      mesh.castShadow = true;

      const posX = x ?? (Math.random() < 0.5 ? -20 - Math.random() * 4 : 20 + Math.random() * 4);
      const posZ = z ?? (Math.random() * 36 - 18);

      mesh.position.set(posX, 1.4, posZ);
      scene.add(mesh);

      enemiesList.push({
        id: nextEnemyId++,
        mesh,
        mat,
        tex,
        x: posX,
        z: posZ,
        hitCount: 0,
        state: 'walk',
        vx: 0,
        vz: 0,
        attackCooldown: 1.0,
        flashTimer: 0,
        dieTimer: 0,
        frameTimer: 0,
        currentFrame: 0,
        facingRight: false,
      });
    };

    // Spawn 4 initial enemies
    for (let i = 0; i < 4; i++) {
      spawnEnemy();
    }

    let enemySpawnTimer = 1.5;

    // --- 7. BOSS ENCOUNTER SYSTEM (BOSS.PNG) ---
    // Boss Spritesheet: 256x256px per frame, 4 frames x 2 rows
    // Row 0 (top): Idle / Hover, Row 1 (bottom): Attack / Fly
    const bossTexture = textureLoader.load(BOSS_TEXTURE_URL);
    bossTexture.wrapS = THREE.ClampToEdgeWrapping;
    bossTexture.wrapT = THREE.ClampToEdgeWrapping;
    bossTexture.repeat.set(0.25, 0.5);

    const bossMat = new THREE.MeshStandardMaterial({
      map: bossTexture,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
      roughness: 0.3,
      emissive: 0x581c87,
      emissiveIntensity: 0.25,
    });

    const bossGeo = new THREE.PlaneGeometry(5.2, 5.2);
    const bossMesh = new THREE.Mesh(bossGeo, bossMat);
    bossMesh.castShadow = true;
    bossMesh.position.set(0, 3.5, -12);
    bossMesh.visible = false;
    scene.add(bossMesh);

    const bossState = {
      x: 0,
      y: 3.5,
      z: -12,
      hp: 15,
      maxHp: 15,
      spawned: false,
      isDead: false,
      phase: 'idle' as 'idle' | 'short_dash' | 'far_dash' | 'telegraph' | 'shoot',
      phaseTimer: 1.5,
      flashTimer: 0,
      currentFrame: 0,
      frameTimer: 0,
      facingRight: false,
      targetX: 0,
      targetZ: -12,
    };

    // --- 8. FIREBALLS SYSTEM ---
    interface FireballEntity {
      mesh: THREE.Mesh;
      targetIndicator: THREE.Mesh;
      startX: number;
      startY: number;
      startZ: number;
      targetX: number;
      targetZ: number;
      progress: number;
      flightTime: number;
    }

    const fireballsList: FireballEntity[] = [];

    const spawnFireball = (fromX: number, fromY: number, fromZ: number, toX: number, toZ: number) => {
      const ballGeo = new THREE.SphereGeometry(0.55, 12, 12);
      const ballMat = new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xff2200,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });
      const ballMesh = new THREE.Mesh(ballGeo, ballMat);
      ballMesh.position.set(fromX, fromY, fromZ);
      scene.add(ballMesh);

      const ringGeo = new THREE.RingGeometry(0.7, 1.4, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(toX, 0.04, toZ);
      scene.add(ringMesh);

      fireballsList.push({
        mesh: ballMesh,
        targetIndicator: ringMesh,
        startX: fromX,
        startY: fromY,
        startZ: fromZ,
        targetX: toX,
        targetZ: toZ,
        progress: 0,
        flightTime: 1.3,
      });
    };

    // --- 9. WARP PORTAL SYSTEM ---
    const portalGeo = new THREE.RingGeometry(0.6, 2.4, 32);
    const portalMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    portalMesh.rotation.x = -Math.PI / 2;
    portalMesh.position.set(0, 0.05, 0);
    portalMesh.visible = false;
    scene.add(portalMesh);

    let portalActive = false;

    // --- 10. PARTICLES ENGINE IN 3D ---
    const particlesData: Array<{
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
    }> = [];

    const particleGeo = new THREE.SphereGeometry(0.12, 6, 6);

    const spawn3DParticles = (pos: THREE.Vector3, colorHex: number, count = 15) => {
      const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true });
      for (let i = 0; i < count; i++) {
        const pMesh = new THREE.Mesh(particleGeo, mat);
        pMesh.position.copy(pos);
        scene.add(pMesh);

        particlesData.push({
          mesh: pMesh,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 6 + 2,
          vz: (Math.random() - 0.5) * 8,
          life: 0,
          maxLife: 25 + Math.random() * 20,
        });
      }
    };

    // --- 8. PLAYER GAME LOGIC STATE ---
    const playerState = {
      x: 0,
      z: 0,
      facingRight: true,
      animState: AnimState.IDLE,
      currentFrame: 0,
      frameTimer: 0,
      actionLockTimer: 0,
      speed: 12,
      hp: 5, // Player has 5 HP (5 hits to Game Over)
      maxHp: 5,
      invulnerableTimer: 0,
      combo: 0,
      kills: 0,
    };

    // Global reset function for Game Over restart
    restartTriggerRef.current = () => {
      playerState.x = 0;
      playerState.z = 0;
      playerState.hp = 5;
      playerState.invulnerableTimer = 0;
      playerState.combo = 0;
      playerState.kills = 0;
      setPlayerHpState(5);
      setComboCount(0);
      setKillCount(0);
      setIsGameOver(false);
      setIsEndingScreenOpen(false);
      setIsPaused(false);

      // Reset Boss State
      bossState.spawned = false;
      bossState.isDead = false;
      bossState.hp = 15;
      bossMesh.visible = false;
      setIsBossSpawnedState(false);
      setBossHpState(null);

      // Clear fireballs
      fireballsList.forEach((fb) => {
        scene.remove(fb.mesh);
        scene.remove(fb.targetIndicator);
        fb.mesh.geometry.dispose();
        fb.targetIndicator.geometry.dispose();
      });
      fireballsList.length = 0;

      // Clear Portal
      portalActive = false;
      portalMesh.visible = false;

      // Reset enemies
      enemiesList.forEach((e) => {
        scene.remove(e.mesh);
        e.mat.dispose();
      });
      enemiesList.length = 0;
      for (let i = 0; i < 4; i++) {
        spawnEnemy();
      }

      // Reset items
      itemsList.forEach((it) => scene.remove(it.mesh));
      itemsList.length = 0;
      for (let i = 0; i < 4; i++) {
        spawnItem();
      }
    };

    // Keyboard Key Map
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.code] = true;

      // Pause toggle
      if (e.code === bindings.pause) {
        setIsPaused((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- 9. SPRITE SHEET ANIMATION HELPER ---
    const updateSpriteUV = (state: AnimState, frame: number, facingRight: boolean) => {
      const rowIndex = state;
      const colIndex = frame % 4;

      const u = colIndex * 0.25;
      const v = 1.0 - (rowIndex + 1) * 0.25;

      playerTexture.offset.set(u, v);
      playerMesh.scale.x = facingRight ? 3.2 : -3.2;
    };

    let clock = new THREE.Clock();
    let animId: number;

    // --- 10. MAIN GAME LOOP ---
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.08);

      if (!isPaused && !isGameOver) {
        // Player Invulnerability countdown
        if (playerState.invulnerableTimer > 0) {
          playerState.invulnerableTimer -= dt;
          playerMat.color.setHex(Math.floor(Date.now() / 80) % 2 === 0 ? 0xff4444 : 0xffffff);
        } else {
          playerMat.color.setHex(0xffffff);
        }

        // --- A. INPUT & 8-DIRECTION MOVEMENT ---
        let moveX = 0;
        let moveZ = 0;

        if (keysPressed[bindings.moveLeft] || keysPressed['KeyA'] || keysPressed['ArrowLeft'] || touchJoystickRef.current.dx < -0.2) {
          moveX -= 1;
        }
        if (keysPressed[bindings.moveRight] || keysPressed['KeyD'] || keysPressed['ArrowRight'] || touchJoystickRef.current.dx > 0.2) {
          moveX += 1;
        }
        if (keysPressed[bindings.moveUp] || keysPressed['KeyW'] || keysPressed['ArrowUp'] || touchJoystickRef.current.dy < -0.2) {
          moveZ -= 1;
        }
        if (keysPressed[bindings.moveDown] || keysPressed['KeyS'] || keysPressed['ArrowDown'] || touchJoystickRef.current.dy > 0.2) {
          moveZ += 1;
        }

        const len = Math.hypot(moveX, moveZ);

        const attackKey = keysPressed[bindings.attack] || keysPressed['KeyP'] || touchActionsRef.current.attack;
        const danceKey = keysPressed['KeyO'] || keysPressed[bindings.skill1] || touchActionsRef.current.dance;

        touchActionsRef.current.attack = false;
        touchActionsRef.current.dance = false;

        // Lock timer countdown
        if (playerState.actionLockTimer > 0) {
          playerState.actionLockTimer -= dt;
        } else {
          // Trigger Key P Attack (Row 3, index 2)
          if (attackKey) {
            playerState.animState = AnimState.ATTACK;
            playerState.currentFrame = 0;
            playerState.actionLockTimer = 0.45;
            keysPressed['KeyP'] = false;
            keysPressed[bindings.attack] = false;

            setActiveActionLabel(isTh ? 'ต่อย/โจมตี! (P)' : 'ATTACK! (P)');
            setTimeout(() => setActiveActionLabel(null), 1200);

            audioEngine.playAttack(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted);

            // --- ATTACK LOGIC AGAINST ENEMIES & BOSS ---
            let hitAnyEnemy = false;

            // Check Boss Hit
            if (bossState.spawned && !bossState.isDead) {
              const distToBoss = Math.hypot(playerState.x - bossState.x, playerState.z - bossState.z);
              if (distToBoss < 4.5) {
                hitAnyEnemy = true;
                bossState.hp -= 1;
                bossState.flashTimer = 0.35;
                setBossHpState(bossState.hp);

                playerState.combo += 1;
                setComboCount(playerState.combo);

                spawn3DParticles(bossMesh.position.clone(), 0xa855f7, 25);
                spawn3DParticles(bossMesh.position.clone(), 0xd4af37, 20);
                audioEngine.playHit(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted);

                if (bossState.hp <= 0) {
                  // BOSS DEFEATED!
                  bossState.isDead = true;
                  bossMesh.visible = false;

                  // Spawn Warp Portal at Boss Position
                  portalMesh.position.set(bossState.x, 0.05, bossState.z);
                  portalMesh.visible = true;
                  portalActive = true;

                  setActiveActionLabel(isTh ? '🏆 ปราบ BOSS สำเร็จ! เดินเข้าประตู Warp' : '🏆 BOSS DEFEATED! ENTER WARP PORTAL');
                  spawn3DParticles(portalMesh.position, 0x38bdf8, 50);
                  spawn3DParticles(portalMesh.position, 0xd4af37, 40);
                  audioEngine.playSkill(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted);
                }
              }
            }

            enemiesList.forEach((enemy) => {
              if (enemy.state === 'dying') return;

              const dist = Math.hypot(playerState.x - enemy.x, playerState.z - enemy.z);
              if (dist < 3.2) {
                hitAnyEnemy = true;
                enemy.hitCount += 1;
                playerState.combo += 1;
                setComboCount(playerState.combo);

                const dirX = enemy.x - playerState.x || (playerState.facingRight ? 1 : -1);
                const dirZ = enemy.z - playerState.z || 0.1;
                const dirLen = Math.hypot(dirX, dirZ) || 1;

                if (enemy.hitCount === 1) {
                  // HIT 1: Knockback away in direction of attack, flash red/white
                  enemy.state = 'knockback';
                  enemy.vx = (dirX / dirLen) * 18;
                  enemy.vz = (dirZ / dirLen) * 18;
                  enemy.flashTimer = 0.35;
                  enemy.mat.color.setHex(0xffffff);

                  spawn3DParticles(enemy.mesh.position.clone().add(new THREE.Vector3(0, 0.8, 0)), 0xe11d48, 18);
                  audioEngine.playHit(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted);
                } else if (enemy.hitCount >= 2) {
                  // HIT 2: Knocked far out or flashes white rapidly and disappears / dies
                  enemy.state = 'dying';
                  enemy.vx = (dirX / dirLen) * 35;
                  enemy.vz = (dirZ / dirLen) * 35;
                  enemy.dieTimer = 0.4;
                  enemy.mat.color.setHex(0xffffff);

                  playerState.kills += 1;
                  setKillCount(playerState.kills);

                  spawn3DParticles(enemy.mesh.position.clone().add(new THREE.Vector3(0, 0.8, 0)), 0xd4af37, 30);
                  spawn3DParticles(enemy.mesh.position.clone().add(new THREE.Vector3(0, 0.8, 0)), 0xe11d48, 20);
                  audioEngine.playHit(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted);

                  // Respawn replacement enemy after 2 seconds
                  setTimeout(() => {
                    spawnEnemy();
                  }, 2000);
                }
              }
            });

            if (!hitAnyEnemy) {
              spawn3DParticles(playerMesh.position.clone().add(new THREE.Vector3(playerState.facingRight ? 1.5 : -1.5, 0, 0)), 0xd4af37, 8);
            }
          }
          // Trigger Key O Dance/Skill (Row 4, index 3)
          else if (danceKey) {
            playerState.animState = AnimState.DANCE;
            playerState.currentFrame = 0;
            playerState.actionLockTimer = 0.65;
            keysPressed['KeyO'] = false;
            keysPressed[bindings.skill1] = false;

            setActiveActionLabel(isTh ? 'เต้นสร้าง Skill! (O)' : 'DANCE SKILL! (O)');
            setTimeout(() => setActiveActionLabel(null), 1200);

            audioEngine.playSkill(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted);

            // Heal player + 1 HP on Dance if under maxHp
            if (playerState.hp < playerState.maxHp) {
              playerState.hp = Math.min(playerState.maxHp, playerState.hp + 1);
              setPlayerHpState(playerState.hp);
            }

            spawn3DParticles(playerMesh.position.clone().add(new THREE.Vector3(0, 0.5, 0)), 0x38bdf8, 30);
            spawn3DParticles(playerMesh.position.clone().add(new THREE.Vector3(0, 0.5, 0)), 0xd4af37, 20);
          }
          // Movement (Row 2, index 1)
          else if (len > 0) {
            playerState.animState = AnimState.WALK;
            const normX = moveX / len;
            const normZ = moveZ / len;

            playerState.x += normX * playerState.speed * dt;
            playerState.z += normZ * playerState.speed * dt;

            if (moveX < 0) playerState.facingRight = false;
            if (moveX > 0) playerState.facingRight = true;
          }
          // Idle (Row 1, index 0)
          else {
            playerState.animState = AnimState.IDLE;
          }
        }

        // Keep character inside 50x50 ground plane (-23.5 to 23.5)
        playerState.x = THREE.MathUtils.clamp(playerState.x, -23.5, 23.5);
        playerState.z = THREE.MathUtils.clamp(playerState.z, -23.5, 23.5);

        // Update 3D position
        playerMesh.position.x = playerState.x;
        playerMesh.position.z = playerState.z;
        shadowMesh.position.x = playerState.x;
        shadowMesh.position.z = playerState.z;

        // --- B. SPRITE SHEET FRAME CYCLING ---
        playerState.frameTimer += dt;
        const frameSpeed = playerState.animState === AnimState.ATTACK ? 0.08 : 0.12;

        if (playerState.frameTimer >= frameSpeed) {
          playerState.frameTimer = 0;
          playerState.currentFrame = (playerState.currentFrame + 1) % 4;
        }

        updateSpriteUV(playerState.animState, playerState.currentFrame, playerState.facingRight);
        playerMesh.quaternion.copy(camera.quaternion);

        // --- C. CAMERA FOLLOW LOGIC ---
        const targetCamPos = new THREE.Vector3(playerState.x, 8.5, playerState.z + 13.5);
        camera.position.lerp(targetCamPos, 0.1);
        camera.lookAt(playerState.x, 1.2, playerState.z);

        goldPointLight.position.set(playerState.x, 3.5, playerState.z);

        // --- D. ITEMS (POTIONS) COLLECTION & BOBBING ---
        for (let i = itemsList.length - 1; i >= 0; i--) {
          const item = itemsList[i];
          // Float/bob animation
          item.mesh.position.y = 1.0 + Math.sin(clock.getElapsedTime() * 3 + item.bobOffset) * 0.25;
          item.mesh.rotation.y += dt * 1.5;
          item.mesh.quaternion.copy(camera.quaternion);

          // Check collection
          const dist = Math.hypot(playerState.x - item.x, playerState.z - item.z);
          if (dist < 1.5) {
            // Player collects potion -> restores +1 HP (5 max)
            if (playerState.hp < playerState.maxHp) {
              playerState.hp = Math.min(playerState.maxHp, playerState.hp + 1);
              setPlayerHpState(playerState.hp);
            }

            audioEngine.playSkill(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted);
            spawn3DParticles(item.mesh.position, 0x22c55e, 25);
            spawn3DParticles(item.mesh.position, 0xd4af37, 15);

            setActiveActionLabel(isTh ? 'เก็บ Potion เติมพลัง +1 HP!' : 'COLLECTED POTION +1 HP!');
            setTimeout(() => setActiveActionLabel(null), 1200);

            // Remove collected item
            scene.remove(item.mesh);
            itemsList.splice(i, 1);

            // Spawn replacement potion elsewhere after 3 seconds
            setTimeout(() => spawnItem(), 3000);
          }
        }

        // Maintain at least 3 items on map
        if (itemsList.length < 3) {
          spawnItem();
        }

        // --- E. ENEMIES AI, ATTACK, AND SPRITE ANIMATION ---
        for (let i = enemiesList.length - 1; i >= 0; i--) {
          const enemy = enemiesList[i];

          // Face towards player (Default enemy faces Left)
          const isPlayerToRight = playerState.x > enemy.x;
          // Scale.x: negative flips horizontally to face Right
          enemy.mesh.scale.x = isPlayerToRight ? -2.8 : 2.8;

          // Billboard to camera
          enemy.mesh.quaternion.copy(camera.quaternion);

          // Handle dying / flash
          if (enemy.state === 'dying') {
            enemy.dieTimer -= dt;
            enemy.x += enemy.vx * dt;
            enemy.z += enemy.vz * dt;
            enemy.vx *= 0.9;
            enemy.vz *= 0.9;

            // Rapid flash white
            const flashWhite = Math.floor(Date.now() / 50) % 2 === 0;
            enemy.mat.color.setHex(flashWhite ? 0xffffff : 0xe11d48);

            if (enemy.dieTimer <= 0) {
              scene.remove(enemy.mesh);
              enemy.mat.dispose();
              enemiesList.splice(i, 1);
              continue;
            }
          } else if (enemy.state === 'knockback') {
            // Apply knockback velocity friction
            enemy.x += enemy.vx * dt;
            enemy.z += enemy.vz * dt;
            enemy.vx *= 0.82;
            enemy.vz *= 0.82;

            if (enemy.flashTimer > 0) {
              enemy.flashTimer -= dt;
            } else {
              enemy.mat.color.setHex(0xffffff);
              if (Math.hypot(enemy.vx, enemy.vz) < 0.5) {
                enemy.state = 'walk';
              }
            }
          } else {
            // Normal Walk / Attack AI
            const dx = playerState.x - enemy.x;
            const dz = playerState.z - enemy.z;
            const dist = Math.hypot(dx, dz);

            if (dist > 1.4) {
              // Move towards player
              enemy.state = 'walk';
              const speed = 4.5;
              enemy.x += (dx / dist) * speed * dt;
              enemy.z += (dz / dist) * speed * dt;
            } else {
              // Attack distance
              enemy.state = 'idle';
              if (enemy.attackCooldown <= 0) {
                enemy.attackCooldown = 1.6;
                enemy.flashTimer = 0.3;
                enemy.mat.color.setHex(0xff0000); // Flashes red on attack!

                // Deal 1 damage to player if player not invulnerable
                if (playerState.invulnerableTimer <= 0) {
                  playerState.hp -= 1;
                  setPlayerHpState(playerState.hp);
                  playerState.invulnerableTimer = 1.2;

                  audioEngine.playHit(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted);
                  spawn3DParticles(playerMesh.position.clone().add(new THREE.Vector3(0, 1, 0)), 0xe11d48, 20);

                  // Trigger Game Over if HP <= 0
                  if (playerState.hp <= 0) {
                    setIsGameOver(true);
                  }
                }
              }
            }

            if (enemy.attackCooldown > 0) {
              enemy.attackCooldown -= dt;
            }

            if (enemy.flashTimer > 0) {
              enemy.flashTimer -= dt;
            } else {
              enemy.mat.color.setHex(0xffffff);
            }
          }

          // Keep enemy in boundaries
          enemy.x = THREE.MathUtils.clamp(enemy.x, -24, 24);
          enemy.z = THREE.MathUtils.clamp(enemy.z, -24, 24);

          enemy.mesh.position.x = enemy.x;
          enemy.mesh.position.z = enemy.z;

          // Enemy Spritesheet UV Update (Row 0 = Idle, Row 1 = Walk)
          enemy.frameTimer += dt;
          if (enemy.frameTimer >= 0.12) {
            enemy.frameTimer = 0;
            enemy.currentFrame = (enemy.currentFrame + 1) % 4;
          }

          const enemyRow = enemy.state === 'walk' ? 1 : 0;
          const u = enemy.currentFrame * 0.25;
          const v = 1.0 - (enemyRow + 1) * 0.5;
          enemy.tex.offset.set(u, v);
        }

        // --- CONTINUOUS ENEMY SPAWNER (EVERY 1-3 SECONDS) ---
        enemySpawnTimer -= dt;
        if (enemySpawnTimer <= 0) {
          enemySpawnTimer = Math.random() * 2.0 + 1.0;
          if (enemiesList.length < 12) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 26 + Math.random() * 4;
            spawnEnemy(Math.cos(angle) * dist, Math.sin(angle) * dist);
          }
        }

        // --- BOSS SPAWN TRIGGER (KILLS >= 10) ---
        if (playerState.kills >= 10 && !bossState.spawned && !bossState.isDead) {
          bossState.spawned = true;
          bossMesh.visible = true;
          setIsBossSpawnedState(true);
          setBossHpState(bossState.hp);
          setActiveActionLabel(isTh ? '⚠️ บอสจอมปีศาจปรากฏตัวแล้ว!' : '⚠️ DEMON LORD BOSS HAS APPEARED!');
          spawn3DParticles(bossMesh.position, 0xa855f7, 40);
          spawn3DParticles(bossMesh.position, 0xe11d48, 30);
          audioEngine.playSkill(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted);
        }

        // --- BOSS AI & BEHAVIORS ---
        if (bossState.spawned && !bossState.isDead) {
          const isPlayerToRight = playerState.x > bossState.x;
          bossState.facingRight = isPlayerToRight;
          bossMesh.scale.x = isPlayerToRight ? -5.2 : 5.2;
          bossMesh.quaternion.copy(camera.quaternion);

          if (bossState.flashTimer > 0) {
            bossState.flashTimer -= dt;
            bossMat.color.setHex(0xff0000);
          } else {
            bossMat.color.setHex(0xffffff);
          }

          // Frame animation for Boss (Row 0: Hover, Row 1: Fly/Attack)
          bossState.frameTimer += dt;
          if (bossState.frameTimer >= 0.12) {
            bossState.frameTimer = 0;
            bossState.currentFrame = (bossState.currentFrame + 1) % 4;
          }

          const bossRow = bossState.phase === 'telegraph' || bossState.phase === 'shoot' ? 1 : 0;
          const bu = bossState.currentFrame * 0.25;
          const bv = 1.0 - (bossRow + 1) * 0.5;
          bossTexture.offset.set(bu, bv);

          // State Machine
          bossState.phaseTimer -= dt;

          if (bossState.phase === 'idle') {
            // Hover smoothly up & down
            bossState.y = 3.5 + Math.sin(clock.getElapsedTime() * 4) * 0.5;
            bossMesh.scale.set(isPlayerToRight ? -5.2 : 5.2, 5.2, 5.2);

            if (bossState.phaseTimer <= 0) {
              bossState.phase = 'short_dash';
              bossState.phaseTimer = 0.8;
              bossState.targetX = playerState.x + (Math.random() - 0.5) * 6;
              bossState.targetZ = playerState.z + (Math.random() - 0.5) * 6;
            }
          } else if (bossState.phase === 'short_dash') {
            // Short dash towards target
            bossState.x += (bossState.targetX - bossState.x) * 4.0 * dt;
            bossState.z += (bossState.targetZ - bossState.z) * 4.0 * dt;

            if (bossState.phaseTimer <= 0) {
              bossState.phase = 'far_dash';
              bossState.phaseTimer = 1.0;
              bossState.targetX = (Math.random() - 0.5) * 32;
              bossState.targetZ = (Math.random() - 0.5) * 32;
            }
          } else if (bossState.phase === 'far_dash') {
            // Far dash across map
            bossState.x += (bossState.targetX - bossState.x) * 6.0 * dt;
            bossState.z += (bossState.targetZ - bossState.z) * 6.0 * dt;

            if (bossState.phaseTimer <= 0) {
              bossState.phase = 'telegraph';
              bossState.phaseTimer = 1.4; // 1.4s pulsing warning before firing!
            }
          } else if (bossState.phase === 'telegraph') {
            // Expansion & Shrinking pulse step (ขยายย่อเป็น step บอก)
            const pulse = 1.0 + Math.abs(Math.sin(clock.getElapsedTime() * 16)) * 0.35;
            bossMesh.scale.set((isPlayerToRight ? -5.2 : 5.2) * pulse, 5.2 * pulse, 5.2);

            spawn3DParticles(bossMesh.position.clone(), 0xff4500, 2);

            if (bossState.phaseTimer <= 0) {
              bossState.phase = 'shoot';
              bossState.phaseTimer = 0.8;

              // Shoot 4 Fireballs up into sky towards Player!
              audioEngine.playAttack(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted);
              for (let f = 0; f < 4; f++) {
                const offsetX = (Math.random() - 0.5) * 7;
                const offsetZ = (Math.random() - 0.5) * 7;
                spawnFireball(
                  bossState.x,
                  bossState.y + 2,
                  bossState.z,
                  playerState.x + offsetX,
                  playerState.z + offsetZ
                );
              }
            }
          } else if (bossState.phase === 'shoot') {
            bossMesh.scale.set(isPlayerToRight ? -5.2 : 5.2, 5.2, 5.2);
            if (bossState.phaseTimer <= 0) {
              bossState.phase = 'idle';
              bossState.phaseTimer = 1.8;
            }
          }

          // Keep Boss inside map
          bossState.x = THREE.MathUtils.clamp(bossState.x, -22, 22);
          bossState.z = THREE.MathUtils.clamp(bossState.z, -22, 22);

          bossMesh.position.set(bossState.x, bossState.y, bossState.z);
        }

        // --- FIREBALLS UPDATE LOOP ---
        for (let i = fireballsList.length - 1; i >= 0; i--) {
          const fb = fireballsList[i];
          fb.progress += dt / fb.flightTime;

          // Pulse target indicator
          const ringPulse = 1.0 + Math.sin(clock.getElapsedTime() * 14) * 0.2;
          fb.targetIndicator.scale.set(ringPulse, ringPulse, ringPulse);

          if (fb.progress >= 1.0) {
            // Impact!
            spawn3DParticles(new THREE.Vector3(fb.targetX, 0.5, fb.targetZ), 0xff4500, 25);
            audioEngine.playHit(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted);

            const dist = Math.hypot(playerState.x - fb.targetX, playerState.z - fb.targetZ);
            if (dist < 1.8 && playerState.invulnerableTimer <= 0) {
              playerState.hp -= 1;
              setPlayerHpState(playerState.hp);
              playerState.invulnerableTimer = 1.2;
              spawn3DParticles(playerMesh.position, 0xe11d48, 20);

              if (playerState.hp <= 0) {
                setIsGameOver(true);
              }
            }

            scene.remove(fb.mesh);
            scene.remove(fb.targetIndicator);
            fb.mesh.geometry.dispose();
            fb.targetIndicator.geometry.dispose();
            fireballsList.splice(i, 1);
          } else {
            // Trajectory arc up into sky then drop down
            const t = fb.progress;
            const cx = fb.startX + (fb.targetX - fb.startX) * t;
            const cz = fb.startZ + (fb.targetZ - fb.startZ) * t;
            const cy = fb.startY + (0.5 - fb.startY) * t + Math.sin(t * Math.PI) * 11.0;

            fb.mesh.position.set(cx, cy, cz);
          }
        }

        // --- WARP PORTAL UPDATE LOOP ---
        if (portalActive) {
          portalMesh.rotation.z += dt * 2.5;
          const portalDist = Math.hypot(playerState.x - portalMesh.position.x, playerState.z - portalMesh.position.z);
          if (portalDist < 2.2) {
            setIsEndingScreenOpen(true);
          }
        }

        // --- F. UPDATE 3D PARTICLES ---
        for (let i = particlesData.length - 1; i >= 0; i--) {
          const p = particlesData[i];
          p.life += 1;
          p.mesh.position.x += p.vx * dt;
          p.mesh.position.y += p.vy * dt;
          p.mesh.position.z += p.vz * dt;
          p.vy -= 12 * dt;

          if (p.life >= p.maxLife || p.mesh.position.y < 0) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            particlesData.splice(i, 1);
          }
        }
      }

      // Render Three.js Scene
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animId);

      renderer.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      playerGeo.dispose();
      playerMat.dispose();
      itemGeo.dispose();
    };
  }, [bindings, isPaused, isGameOver, settings, hero, isTh]);

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden select-none bg-[#070a12]">
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair w-full h-full" />

      {/* Top HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between pointer-events-none">
        {/* Player Status Card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0a0a0f]/90 border border-[#d4af37]/30 backdrop-blur-md shadow-2xl pointer-events-auto">
          <div className="text-2xl p-2 rounded-xl bg-[#141414] border border-[#d4af37]/40 text-[#d4af37]">
            {hero.avatarIcon}
          </div>

          <div className="space-y-1.5 min-w-[150px] sm:min-w-[200px]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-serif-title font-bold text-[#f0f0f0] tracking-wide">
                {isTh ? hero.nameTh : hero.nameEn}
              </span>
              {comboCount > 1 && (
                <span className="text-xs font-mono font-bold text-[#d4af37] animate-bounce gold-glow px-2 py-0.5 rounded-full bg-[#111111]">
                  {comboCount} HITS!
                </span>
              )}
            </div>

            {/* 5-Heart Health Bar */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((idx) => (
                <Heart
                  key={idx}
                  className={`w-5 h-5 transition-all duration-300 ${
                    idx <= playerHpState
                      ? 'fill-rose-500 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-100'
                      : 'fill-slate-800 text-slate-700 scale-90 opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Trigger Banner & Boss HP Bar */}
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          {isBossSpawnedState && bossHpState !== null && (
            <div className="px-5 py-2 rounded-2xl bg-[#0a0a0f]/95 border-2 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.4)] backdrop-blur-md flex flex-col items-center gap-1 min-w-[240px] sm:min-w-[320px]">
              <div className="flex justify-between items-center w-full text-xs font-mono">
                <span className="font-bold text-purple-400 tracking-wider flex items-center gap-1.5">
                  <Skull className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  {isTh ? 'บอสจอมปีศาจ DEMON LORD' : 'DEMON LORD BOSS'}
                </span>
                <span className="text-[#d4af37] font-bold">{Math.max(0, bossHpState)} / 15 HP</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#1a102a] border border-purple-600/40 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-rose-500 transition-all duration-300 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                  style={{ width: `${Math.max(0, (bossHpState / 15) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {activeActionLabel && (
            <div className="pointer-events-none px-6 py-2.5 rounded-xl bg-[#0a0a0f]/90 border border-[#d4af37] gold-glow-lg text-[#d4af37] font-serif-title font-bold text-sm tracking-widest animate-bounce uppercase">
              {activeActionLabel}
            </div>
          )}
        </div>

        {/* Control Hints & Kills Counter */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0c0c0c]/90 border border-[#d4af37]/40 text-xs font-mono text-[#d4af37] backdrop-blur-md shadow-md">
            <Skull className="w-4 h-4 text-rose-400" />
            <span className="font-bold">{isTh ? 'กำจัด:' : 'KILLS:'} {killCount}</span>
          </div>

          <button
            onClick={() => {
              audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
              setIsPaused(true);
            }}
            className="p-3 rounded-xl bg-[#111111]/90 hover:bg-[#1a1a1a] border border-[#d4af37]/40 text-[#d4af37] transition-all shadow-xl cursor-pointer active:scale-95 gold-glow"
            title={isTh ? 'หยุดเกม (ESC)' : 'Pause Game (ESC)'}
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* On-Screen Controls Hint Bar at Bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-6 py-2 rounded-full bg-[#0a0a0f]/85 border border-[#d4af37]/30 backdrop-blur-md hidden sm:flex items-center gap-4 text-xs font-mono text-[#aaaaaa]">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#d4af37] border border-[#333333]">WASD / ↑↓←→</kbd>{' '}
          {isTh ? 'เดิน 8 ทิศทาง' : '8-Direction Walk'}
        </span>
        <span className="text-[#444444]">|</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#d4af37] border border-[#333333]">P</kbd>{' '}
          {isTh ? 'ต่อย/โจมตี' : 'Attack'}
        </span>
        <span className="text-[#444444]">|</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#d4af37] border border-[#333333]">O</kbd>{' '}
          {isTh ? 'เต้นสร้าง Skill' : 'Dance Skill'}
        </span>
      </div>

      {/* Virtual Touch Screen Controls Overlay for Mobile / Touch */}
      {touch.enabled && !isPaused && !isGameOver && (
        <div
          className="absolute inset-0 pointer-events-none z-10 flex justify-between items-end p-6"
          style={{ opacity: touch.opacity }}
        >
          {/* Virtual Joystick (Left) */}
          <div
            className="pointer-events-auto relative rounded-full border-2 border-[#d4af37]/50 bg-[#111111]/60 flex items-center justify-center touch-none select-none shadow-2xl"
            style={{
              width: `${110 * touch.joystickScale}px`,
              height: `${110 * touch.joystickScale}px`,
            }}
            onTouchStart={(e) => {
              const touchObj = e.changedTouches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              const dx = (touchObj.clientX - cx) / (rect.width / 2);
              const dy = (touchObj.clientY - cy) / (rect.height / 2);
              touchJoystickRef.current = { active: true, dx, dy, touchId: touchObj.identifier };
            }}
            onTouchMove={(e) => {
              if (!touchJoystickRef.current.active) return;
              for (let i = 0; i < e.changedTouches.length; i++) {
                const touchObj = e.changedTouches[i];
                if (touchObj.identifier === touchJoystickRef.current.touchId) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const cx = rect.left + rect.width / 2;
                  const cy = rect.top + rect.height / 2;
                  const dx = (touchObj.clientX - cx) / (rect.width / 2);
                  const dy = (touchObj.clientY - cy) / (rect.height / 2);
                  touchJoystickRef.current.dx = Math.max(-1, Math.min(1, dx));
                  touchJoystickRef.current.dy = Math.max(-1, Math.min(1, dy));
                }
              }
            }}
            onTouchEnd={() => {
              touchJoystickRef.current = { active: false, dx: 0, dy: 0, touchId: null };
            }}
          >
            <div className="w-12 h-12 rounded-full bg-[#d4af37] gold-glow" />
          </div>

          {/* Virtual Action Buttons (Right) */}
          <div className="pointer-events-auto flex items-end gap-3">
            <button
              onTouchStart={() => (touchActionsRef.current.attack = true)}
              className="rounded-full bg-[#111111]/80 active:bg-[#d4af37] border border-[#d4af37] text-[#d4af37] active:text-[#050505] font-bold font-mono text-xs flex flex-col items-center justify-center shadow-2xl cursor-pointer"
              style={{
                width: `${60 * touch.buttonScale}px`,
                height: `${60 * touch.buttonScale}px`,
              }}
            >
              <Swords className="w-5 h-5 mb-0.5" />
              <span>ATK (P)</span>
            </button>

            <button
              onTouchStart={() => (touchActionsRef.current.dance = true)}
              className="rounded-full bg-[#111111]/80 active:bg-[#f3e5ab] border border-[#f3e5ab] text-[#f3e5ab] active:text-[#050505] font-bold font-mono text-xs flex flex-col items-center justify-center shadow-2xl cursor-pointer"
              style={{
                width: `${60 * touch.buttonScale}px`,
                height: `${60 * touch.buttonScale}px`,
              }}
            >
              <Music className="w-5 h-5 mb-0.5" />
              <span>DANCE (O)</span>
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL OVERLAY */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#030303]/90 backdrop-blur-lg animate-fade-in select-none">
          <div className="w-full max-w-md p-8 rounded-3xl bg-[#0c0c0c] border-2 border-rose-600/60 shadow-[0_0_50px_rgba(225,29,72,0.4)] space-y-6 text-center">
            <div className="space-y-2">
              <div className="inline-flex p-3 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-500 mb-2">
                <Skull className="w-10 h-10 animate-pulse" />
              </div>
              <h2 className="text-3xl font-serif-title font-extrabold text-rose-500 tracking-wider">
                {isTh ? 'จบเกม - อวสาน! (GAME OVER)' : 'GAME OVER'}
              </h2>
              <p className="text-xs text-[#aaaaaa]">
                {isTh ? 'พลังชีวิตหมด! ศัตรูเข้าโจมตีจนพ่ายแพ้' : 'Your health reached 0! You were defeated in battle.'}
              </p>
            </div>

            {/* Score & Kills Summary */}
            <div className="p-4 rounded-2xl bg-[#050505] border border-[#222222] grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-[#888888] block">{isTh ? 'ศัตรูที่กำจัด' : 'Enemies Defeated'}</span>
                <span className="text-xl font-mono font-bold text-[#d4af37]">{killCount}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#888888] block">{isTh ? 'คอมโบสูงสุด' : 'Max Combo'}</span>
                <span className="text-xl font-mono font-bold text-[#d4af37]">{comboCount}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
                  restartTriggerRef.current();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isTh ? 'เล่นใหม่อีกครั้ง (TRY AGAIN)' : 'TRY AGAIN'}</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
                  onReturnToMenu();
                }}
                className="w-full py-3 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] text-[#f0f0f0] font-semibold text-xs border border-[#333333] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#d4af37]" />
                <span>{isTh ? 'กลับหน้าเมนูหลัก (MAIN MENU)' : 'MAIN MENU'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu Modal Overlay */}
      {isPaused && !isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#030303]/85 backdrop-blur-md animate-fade-in select-none">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0c0c0c] border border-[#d4af37]/40 shadow-2xl space-y-6 text-center">
            <div className="space-y-1">
              <h2 className="text-xl font-serif-title font-bold text-[#f0f0f0] tracking-wide">
                {isTh ? 'หยุดเกมชั่วคราว (GAME PAUSED)' : 'GAME PAUSED'}
              </h2>
              <p className="text-xs text-[#888888]">
                {isTh ? 'ปรับเปลี่ยนการตั้งค่าหรือกลับสู่เมนูหลัก' : 'Modify settings or return to main menu'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
                  setIsPaused(false);
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] hover:opacity-90 text-[#050505] font-bold text-xs uppercase tracking-wider transition-all gold-glow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-[#050505]" />
                <span>{isTh ? 'เล่นเกมต่อ (RESUME GAME)' : 'RESUME GAME'}</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
                  onOpenOptions();
                }}
                className="w-full py-3 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] text-[#f0f0f0] font-semibold text-xs border border-[#333333] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-[#d4af37]" />
                <span>{isTh ? 'ปรับแต่งปุ่มบังคับ & ตัวเลือก (OPTIONS)' : 'OPTIONS & CONTROLS'}</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
                  onReturnToMenu();
                }}
                className="w-full py-3 rounded-xl bg-[#1a0a0a] hover:bg-[#2a1010] text-rose-300 font-semibold text-xs border border-rose-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>{isTh ? 'กลับหน้าเมนูหลัก (MAIN MENU)' : 'MAIN MENU'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* VICTORY ENDING MODAL OVERLAY */}
      {isEndingScreenOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#030303]/90 backdrop-blur-xl animate-fade-in select-none">
          <div className="w-full max-w-lg p-8 rounded-3xl bg-[#0c0c0c] border-2 border-[#d4af37] shadow-[0_0_80px_rgba(212,175,55,0.5)] space-y-6 text-center">
            <div className="space-y-3">
              <div className="inline-flex p-4 rounded-full bg-[#1c1809] border-2 border-[#d4af37] text-[#d4af37] mb-2 gold-glow">
                <Trophy className="w-12 h-12 animate-bounce" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif-title font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] tracking-wider uppercase">
                {isTh ? 'พิชิตชัยชนะ - ENDING' : 'VICTORY - ENDING'}
              </h2>
              <p className="text-xs sm:text-sm text-[#cccccc] max-w-md mx-auto leading-relaxed">
                {isTh
                  ? 'คุณสามารถปราบ Boss จอมปีศาจลงได้สำเร็จ และข้ามประตู Warp Portal เข้าสู่ดินแดนแห่งความสงบสุข!'
                  : 'You defeated the Demon Lord Boss and stepped into the Warp Portal, restoring peace to the realm!'}
              </p>
            </div>

            {/* Battle Stats Summary */}
            <div className="p-5 rounded-2xl bg-[#050505] border border-[#d4af37]/40 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-[#888888] block uppercase tracking-wider">{isTh ? 'ศัตรูที่กำจัด' : 'Enemies Slain'}</span>
                <span className="text-2xl font-mono font-bold text-[#d4af37]">{killCount}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#888888] block uppercase tracking-wider">{isTh ? 'คอมโบสูงสุด' : 'Max Combo'}</span>
                <span className="text-2xl font-mono font-bold text-[#d4af37]">{comboCount}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
                  restartTriggerRef.current();
                }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] hover:opacity-90 text-[#050505] font-extrabold text-xs uppercase tracking-widest transition-all gold-glow flex items-center justify-center gap-2 cursor-pointer shadow-xl"
              >
                <RotateCcw className="w-4 h-4 text-[#050505]" />
                <span>{isTh ? 'เล่นเกมใหม่อีกครั้ง (PLAY AGAIN)' : 'PLAY AGAIN'}</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
                  onReturnToMenu();
                }}
                className="w-full py-3.5 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] text-[#f0f0f0] font-semibold text-xs border border-[#333333] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#d4af37]" />
                <span>{isTh ? 'กลับหน้าเมนูหลัก (MAIN MENU)' : 'MAIN MENU'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

