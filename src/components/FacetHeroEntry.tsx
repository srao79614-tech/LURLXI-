import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { playClickSound } from '../utils/soundEffects';
import { UserSession, CategoryType } from '../types';

interface FacetHeroEntryProps {
  onStartLurlxi?: () => void;
  onDirectSignIn?: () => void;
  onLoginSuccess?: (session: UserSession) => void;
  selectedCategory?: CategoryType;
  defaultEmail?: string;
}

export const FacetHeroEntry: React.FC<FacetHeroEntryProps> = ({
  onStartLurlxi,
  onDirectSignIn,
  onLoginSuccess,
  selectedCategory = 'trading',
  defaultEmail,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDefinitionsOpen, setIsDefinitionsOpen] = useState(false);
  const [isShattered, setIsShattered] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Camera: perspective fov 30°, 1 world unit = 1 CSS px at z=0
    const fov = 30;
    const cameraZ = (height / 2) / Math.tan((fov * Math.PI / 180) / 2);
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 10000);
    camera.position.set(0, 0, cameraZ);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050507);

    // Renderer: ACES filmic, DPR capped at 2
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Environment: PMREM RoomEnvironment, environmentIntensity .42
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.42;

    // Soft white-blue key light top-left
    const keyLight = new THREE.DirectionalLight(0xd8e8ff, 1.8);
    keyLight.position.set(-width * 0.45, height * 0.45, 500);
    scene.add(keyLight);

    const fillLight = new THREE.AmbientLight(0x181c26, 0.7);
    scene.add(fillLight);

    // Layout Scale
    const isPhone = width < 768;
    const marginX = isPhone ? 16 : width * 0.055;
    const marginY = isPhone ? 16 : height * 0.085;
    const blockWidth = width - 2 * marginX;
    const blockHeight = height - 2 * marginY;
    const navHeight = blockHeight * 0.108;
    const gap = 14;
    const panelHeight = blockHeight - navHeight - gap;
    const globalScale = blockWidth / 1730;

    // Dynamic 2D Canvas Text Texture (DPR >= 1.5)
    const dpr = Math.max(window.devicePixelRatio, 1.5);
    const textCanvas = document.createElement('canvas');
    textCanvas.width = blockWidth * dpr;
    textCanvas.height = panelHeight * dpr;
    const textCtx = textCanvas.getContext('2d');
    if (textCtx) {
      textCtx.scale(dpr, dpr);
      const S = globalScale;
      const w = blockWidth;
      const h = panelHeight;

      // Eyebrow "REAL-TIME MATERIAL STUDIO" at 13.5% height
      textCtx.font = `600 ${Math.max(11 * S, 10)}px 'Inter', sans-serif`;
      textCtx.fillStyle = 'rgba(255, 255, 255, 0.38)';
      textCtx.letterSpacing = '0.2em';
      textCtx.fillText('REAL-TIME MATERIAL STUDIO', 45 * S, h * 0.135);

      // Headline "Designed / in glass."
      const headlineSize = Math.min(w * 0.078, h * 0.20);
      textCtx.font = `500 ${headlineSize}px 'Inter', sans-serif`;
      textCtx.letterSpacing = '-0.045em';
      const grad = textCtx.createLinearGradient(45 * S, h * 0.22, 45 * S, h * 0.45);
      grad.addColorStop(0, '#dcdce0');
      grad.addColorStop(1, '#bdbdc3');
      textCtx.fillStyle = grad;
      textCtx.fillText('Designed', 45 * S, h * 0.28);
      textCtx.fillText('in glass.', 45 * S, h * 0.28 + headlineSize * 0.97);

      // Subtitle (2-line)
      textCtx.font = `400 ${Math.max(16 * S, 13)}px 'Inter', sans-serif`;
      textCtx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      textCtx.letterSpacing = '-0.01em';
      textCtx.fillText('Author dispersion, transmission, and refraction in the browser.', 45 * S, h * 0.58);
      textCtx.fillText('Live previews, real materials.', 45 * S, h * 0.58 + 24 * S);

      // "Open studio" Light Pill Button (116x40S)
      const pillW = 116 * S;
      const pillH = 40 * S;
      const pillX = 45 * S;
      const pillY = h * 0.70;
      textCtx.fillStyle = '#ffffff';
      textCtx.beginPath();
      if (typeof (textCtx as any).roundRect === 'function') {
        (textCtx as any).roundRect(pillX, pillY, pillW, pillH, 6 * S);
      } else {
        textCtx.rect(pillX, pillY, pillW, pillH);
      }
      textCtx.fill();

      textCtx.font = `600 ${Math.max(13 * S, 11)}px 'Inter', sans-serif`;
      textCtx.fillStyle = '#050507';
      textCtx.fillText('Open studio', pillX + 16 * S, pillY + 25 * S);

      // "Read paper →" Link
      textCtx.font = `500 ${Math.max(14 * S, 12)}px 'Inter', sans-serif`;
      textCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      textCtx.fillText('Read paper →', pillX + pillW + 28 * S, pillY + 25 * S);

      // Footer: "© Facet Lab" bottom-left, "KHR_materials_dispersion" bottom-right
      textCtx.font = `400 ${Math.max(11 * S, 9)}px 'Inter', sans-serif`;
      textCtx.fillStyle = 'rgba(255, 255, 255, 0.34)';
      textCtx.fillText('© Facet Lab', 45 * S, h - 30 * S);
      const khrText = 'KHR_materials_dispersion';
      const khrWidth = textCtx.measureText(khrText).width;
      textCtx.fillText(khrText, w - 45 * S - khrWidth, h - 30 * S);
    }

    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.colorSpace = THREE.SRGBColorSpace;

    // Glass Material Generator
    function createGlassMaterial() {
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x17171b,
        roughness: 0.36,
        clearcoat: 0.7,
        clearcoatRoughness: 0.12,
        specularIntensity: 0.7,
        iridescence: 0.55,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [250, 650],
        envMapIntensity: 1.0,
      });

      mat.userData.glowUniforms = {
        uPointerWorld: { value: new THREE.Vector3(0, 0, 0) },
        uGlowIntensity: { value: 0.0 },
        uScale: { value: globalScale },
      };

      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uPointerWorld = mat.userData.glowUniforms.uPointerWorld;
        shader.uniforms.uGlowIntensity = mat.userData.glowUniforms.uGlowIntensity;
        shader.uniforms.uScale = mat.userData.glowUniforms.uScale;

        shader.vertexShader = `
          varying vec3 vWorldPosition;
          ${shader.vertexShader}
        `.replace(
          `#include <worldpos_vertex>`,
          `#include <worldpos_vertex>
           vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
        );

        shader.fragmentShader = `
          varying vec3 vWorldPosition;
          uniform vec3 uPointerWorld;
          uniform float uGlowIntensity;
          uniform float uScale;
          ${shader.fragmentShader}
        `.replace(
          `#include <dithering_fragment>`,
          `#include <dithering_fragment>
           float d = length(vWorldPosition.xy - uPointerWorld.xy);
           float glow = exp(-1.6 * pow(d / (300.0 * max(uScale, 0.3)), 2.0)) * uGlowIntensity;
           gl_FragColor.rgb += vec3(0.42, 0.37, 0.62) * 0.16 * glow;`
        );
      };

      return mat;
    }

    const pieces: THREE.Mesh[] = [];
    const S = globalScale;
    const cornerRadius = 20 * S;
    const depth = 13 * S;
    const bevelSize = 2.6 * S;

    // Nav Slab
    const navShape = new THREE.Shape();
    navShape.moveTo(cornerRadius, 0);
    navShape.lineTo(blockWidth - cornerRadius, 0);
    navShape.quadraticCurveTo(blockWidth, 0, blockWidth, cornerRadius);
    navShape.lineTo(blockWidth, navHeight - cornerRadius);
    navShape.quadraticCurveTo(blockWidth, navHeight, blockWidth - cornerRadius, navHeight);
    navShape.lineTo(cornerRadius, navHeight);
    navShape.quadraticCurveTo(0, navHeight, 0, navHeight - cornerRadius);
    navShape.lineTo(0, cornerRadius);
    navShape.quadraticCurveTo(0, 0, cornerRadius, 0);

    const navGeo = new THREE.ExtrudeGeometry(navShape, {
      depth,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize,
      bevelThickness: bevelSize,
    });
    const navMat = createGlassMaterial();
    const navPiece = new THREE.Mesh(navGeo, navMat);
    navPiece.position.set(-blockWidth / 2, height / 2 - (height - blockHeight) / 2 - navHeight, 0);
    navPiece.userData = {
      basePos: navPiece.position.clone(),
      curLift: 0,
      curTipX: 0,
      curTipY: 0,
      isNav: true,
      shatterVel: new THREE.Vector3(0, 0, 0),
      shatterRot: new THREE.Vector3(0, 0, 0),
    };
    scene.add(navPiece);
    pieces.push(navPiece);

    // 5 Shard Polygons (A, B, C, D, E)
    const pw = blockWidth;
    const ph = panelHeight;
    const tAB = [0.22, 0];
    const tBC = [0.515, 0];
    const tCE = [0.84, 0];
    const bAD = [0.34, 1];
    const bDE = [0.865, 1];
    const J0 = [0.385, 0.72];
    const J1 = [0.48, 0.62];
    const J2 = [0.716, 0.49];

    const cellsNorm = [
      { id: 'A', pts: [[0, 0], tAB, J0, bAD, [0, 1]] },
      { id: 'B', pts: [tAB, tBC, J1, J0] },
      { id: 'C', pts: [tBC, tCE, J2, J1] },
      { id: 'D', pts: [J0, J1, J2, bDE, bAD] },
      { id: 'E', pts: [tCE, [1, 0], [1, 1], bDE, J2] },
    ];

    cellsNorm.forEach((cell, idx) => {
      const shape = new THREE.Shape();
      const pixelPts = cell.pts.map(([nx, ny]) => [nx * pw, (1 - ny) * ph]);
      shape.moveTo(pixelPts[0][0], pixelPts[0][1]);
      for (let i = 1; i < pixelPts.length; i++) {
        shape.lineTo(pixelPts[i][0], pixelPts[i][1]);
      }
      shape.closePath();

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize,
        bevelThickness: bevelSize,
      });

      const mat = createGlassMaterial();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(-pw / 2, -height / 2 + (height - blockHeight) / 2, 0);

      // Text Shape Overlay
      const textShapeGeo = new THREE.ShapeGeometry(shape);
      const uvAttr = textShapeGeo.attributes.uv;
      const posAttr = textShapeGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        uvAttr.setXY(i, posAttr.getX(i) / pw, posAttr.getY(i) / ph);
      }
      const textMesh = new THREE.Mesh(
        textShapeGeo,
        new THREE.MeshBasicMaterial({ map: textTexture, transparent: true, depthWrite: false })
      );
      textMesh.position.z = depth + bevelSize + 0.5 * S;
      mesh.add(textMesh);

      mesh.userData = {
        id: cell.id,
        basePos: mesh.position.clone(),
        curLift: 0,
        curTipX: 0,
        curTipY: 0,
        index: idx,
        shatterVel: new THREE.Vector3(
          (Math.random() - 0.5) * 450 * S,
          -Math.random() * 550 * S - 200 * S,
          Math.random() * 380 * S + 420 * S
        ),
        shatterRot: new THREE.Vector3(
          (Math.random() - 0.5) * 3.6,
          (Math.random() - 0.5) * 3.6,
          (Math.random() - 0.5) * 3.6
        ),
      };

      scene.add(mesh);
      pieces.push(mesh);
    });

    // Pointer & Tilt State
    const pointer = { x: 0, y: 0, worldX: 0, worldY: 0 };
    const tilt = { targetRotX: 0, targetRotY: 0, curRotX: 0, curRotY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      tilt.targetRotY = (pointer.x * 7 - 1.2) * (Math.PI / 180);
      tilt.targetRotX = (-pointer.y * 5.5 + 0.8) * (Math.PI / 180);
      pointer.worldX = e.clientX - window.innerWidth / 2;
      pointer.worldY = -(e.clientY - window.innerHeight / 2);
    };

    const handleMouseLeave = () => {
      tilt.targetRotX = 0;
      tilt.targetRotY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const f = 30;
      const cZ = (height / 2) / Math.tan((f * Math.PI / 180) / 2);
      camera.aspect = width / height;
      camera.position.z = cZ;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Render Loop
    let animId: number;
    let shattered = false;
    let shatterTime = 0;
    const raycaster = new THREE.Raycaster();
    let lastT = performance.now();

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastT) / 1000, 0.05);
      lastT = currentTime;

      tilt.curRotX += (tilt.targetRotX - tilt.curRotX) * 0.1;
      tilt.curRotY += (tilt.targetRotY - tilt.curRotY) * 0.1;

      raycaster.setFromCamera(new THREE.Vector2(pointer.x, pointer.y), camera);
      const intersects = raycaster.intersectObjects(pieces, true);
      const hoveredPiece = intersects.length > 0 ? (intersects[0].object.parent?.userData.basePos ? intersects[0].object.parent : intersects[0].object) : null;

      pieces.forEach((p) => {
        const isHovered = hoveredPiece === p;

        if (!shattered) {
          const targetLift = isHovered ? (p.userData.isNav ? 32 * S : 50 * S) : 0;
          p.userData.curLift += (targetLift - p.userData.curLift) * 0.25;

          const targetTipX = isHovered ? -pointer.y * 0.18 : 0;
          const targetTipY = isHovered ? pointer.x * 0.18 : 0;
          p.userData.curTipX += (targetTipX - p.userData.curTipX) * 0.2;
          p.userData.curTipY += (targetTipY - p.userData.curTipY) * 0.2;

          p.position.x = p.userData.basePos.x;
          p.position.y = p.userData.basePos.y;
          p.position.z = p.userData.basePos.z + p.userData.curLift;

          p.rotation.x = tilt.curRotX + p.userData.curTipX;
          p.rotation.y = tilt.curRotY + p.userData.curTipY;

          if (p.material && (p.material as any).userData?.glowUniforms) {
            const uniforms = (p.material as any).userData.glowUniforms;
            uniforms.uPointerWorld.value.set(pointer.worldX, pointer.worldY, 0);
            const cur = uniforms.uGlowIntensity.value;
            uniforms.uGlowIntensity.value += ((isHovered ? 1.0 : 0.0) - cur) * 0.15;
            (p.material as THREE.MeshPhysicalMaterial).iridescence = isHovered ? 1.0 : 0.55;
            (p.material as THREE.MeshPhysicalMaterial).envMapIntensity = isHovered ? 1.9 : 1.0;
          }
        } else {
          const elapsed = (currentTime - shatterTime) / 1000;
          const stagger = (p.userData.index || 0) * 0.025;
          const t = Math.max(0, elapsed - stagger);
          const ease = Math.pow(t / 0.72, 3);

          p.position.x = p.userData.basePos.x + p.userData.shatterVel.x * ease;
          p.position.y = p.userData.basePos.y + p.userData.shatterVel.y * ease - 400 * Math.pow(ease, 2);
          p.position.z = p.userData.basePos.z + p.userData.shatterVel.z * ease;

          p.rotation.x += p.userData.shatterRot.x * delta * 2;
          p.rotation.y += p.userData.shatterRot.y * delta * 2;
          p.rotation.z += p.userData.shatterRot.z * delta * 2;
        }
      });

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Shatter handler exposed
    const triggerShatterAnim = () => {
      if (shattered) return;
      shattered = true;
      setIsShattered(true);
      shatterTime = performance.now();

      // Show definitions after 0.28s
      setTimeout(() => {
        setIsDefinitionsOpen(true);
      }, 280);

      // Call startLurlxi after 0.72s shatter completes
      setTimeout(() => {
        if (onStartLurlxi) onStartLurlxi();
      }, 720);
    };

    (canvas as any).__triggerShatter = triggerShatterAnim;
    (window as any).startLURLXI = triggerShatterAnim;

    return () => {
      cancelAnimationFrame(animId);
      delete (window as any).startLURLXI;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [onStartLurlxi]);

  const handleShatterClick = () => {
    playClickSound();
    if (typeof (window as any).startLURLXI === 'function') {
      (window as any).startLURLXI();
    } else if (canvasRef.current && (canvasRef.current as any).__triggerShatter) {
      (canvasRef.current as any).__triggerShatter();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen z-50 bg-[#050507] overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Top Glass Nav Bar */}
      <div className="absolute top-4 sm:top-[6%] left-4 sm:left-[5.5%] right-4 sm:right-[5.5%] h-14 sm:h-[10.8%] flex items-center justify-between px-4 sm:px-6 pointer-events-auto z-20 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-400 to-amber-200 border border-white/40 shadow-sm flex items-center justify-center text-[10px] text-black font-bold">
            ◆
          </div>
          <span className="font-['Inter'] font-bold text-sm sm:text-base tracking-wider text-white">Facet</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono hidden sm:inline">
            Live 3D Studio
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs text-white/70 font-medium">
          <span className="hover:text-white cursor-pointer transition-colors">Studio</span>
          <span>·</span>
          <span className="hover:text-white cursor-pointer transition-colors">Materials</span>
          <span>·</span>
          <span className="hover:text-white cursor-pointer transition-colors">Codex</span>
          <span>·</span>
          <span className="hover:text-white cursor-pointer transition-colors">VIP Core</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShatterClick}
            className="text-xs font-semibold text-white hover:text-amber-300 transition-all cursor-pointer px-4 py-2 rounded-lg border border-amber-500/40 hover:border-amber-400 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 shadow-md flex items-center gap-1.5"
          >
            <span>Sign in</span>
            <span className="text-[10px] text-amber-300 font-mono hidden sm:inline">(Step 1 OTP)</span>
          </button>
        </div>
      </div>

      {/* Main Glass Typography & Headline Overlay */}
      <div className="absolute top-[22%] sm:top-[26%] left-6 sm:left-[8%] max-w-xl pointer-events-auto z-20 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-[11px] font-semibold tracking-widest uppercase text-white/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Real-Time Material Studio & Codex
        </div>
        <h1 className="font-['Inter'] text-4xl sm:text-6xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#dcdce0] to-[#9999a3] leading-[1.08]">
          Designed <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">in glass.</span>
        </h1>
        <p className="text-sm sm:text-base text-white/70 max-w-md leading-relaxed">
          Author dispersion, transmission, and autonomous quantitative intelligence in the browser. Live previews, real materials, readymade performance.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleShatterClick}
            className="px-6 py-3 rounded-xl bg-white hover:bg-amber-400 text-[#050507] font-bold text-xs sm:text-sm tracking-tight transition-all duration-200 shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_10px_35px_rgba(245,158,11,0.4)] cursor-pointer flex items-center gap-2"
          >
            <span>Open studio</span>
            <span className="text-xs opacity-70 font-mono">→</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDefinitionsOpen((prev) => !prev)}
            className="text-xs font-medium text-white/80 hover:text-white hover:underline cursor-pointer px-3 py-2 transition-all"
          >
            Read paper →
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 left-6 sm:left-[8%] right-6 sm:right-[8%] flex items-center justify-between text-[11px] text-white/40 pointer-events-none z-20 font-mono">
        <span>© Facet Lab • LURL Autonomous Platform</span>
        <span>KHR_materials_dispersion • 100% Online Ready</span>
      </div>

      {/* Definitions View Overlay */}
      {isDefinitionsOpen && (
        <div className="absolute inset-0 z-40 bg-[#050507]/90 backdrop-blur-xl flex items-center justify-start px-8 sm:px-16 transition-opacity duration-300">
          <div className="max-w-xl text-white space-y-4">
            <h2 className="font-['Inter'] font-semibold text-2xl tracking-tight text-white mb-6">
              Real-time glass, in five terms.
            </h2>
            <div className="text-xs sm:text-sm text-white/60 leading-relaxed space-y-3">
              <p>
                <strong className="text-white">Iridescence</strong> — Structural color generated by microscopic thin-film optical interference, shifting spectral hue dynamically across view angles.
              </p>
              <p>
                <strong className="text-white">Index of refraction</strong> — The fundamental ratio governing how light decelerates and bends as it transitions across dielectric phase boundaries.
              </p>
              <p>
                <strong className="text-white">Dispersion</strong> — Spectral separation of polychromatic light into discrete constituent wavelengths, producing authentic optical chromatic aberration.
              </p>
              <p>
                <strong className="text-white">Transmission</strong> — Specular propagation of electromagnetic flux through dense absorbing volumetric media without diffuse scattering.
              </p>
              <p>
                <strong className="text-white">Roughness</strong> — Microfacet geometric orientation variance determining specular highlight spread and clearcoat reflection clarity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDefinitionsOpen(false)}
              className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
