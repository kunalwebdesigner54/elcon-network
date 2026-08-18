import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';

extend({ UnrealBloomPass });

const SwarmLogic = () => {
  const meshRef = useRef();
  const count = 20000;
  const speedMult = 1;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);
  const color = pColor; // Alias for user code compatibility
  
  const positions = useMemo(() => {
     const pos = [];
     for(let i=0; i<count; i++) pos.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
     return pos;
  }, []);

  // Material & Geom
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), []);

  const PARAMS = useMemo(() => ({"speed":0.1,"chaos":24,"coreSize":17.24}), []);
  const addControl = (id, l, min, max, val) => {
      return PARAMS[id] !== undefined ? PARAMS[id] : val;
  };
  const setInfo = () => {};
  const annotate = () => {};

  const scrollRef = useRef(0);
  const scrollTimeRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const realTime = state.clock.getElapsedTime() * speedMult;
    
    // Lerp scroll position for smooth momentum
    scrollTimeRef.current = THREE.MathUtils.lerp(scrollTimeRef.current, scrollRef.current * 0.005, 0.08);
    const scrollTime = scrollTimeRef.current;

    if(material.uniforms && material.uniforms.uTime) {
         material.uniforms.uTime.value = realTime;
    }

    for (let i = 0; i < count; i++) {
        // USER CODE START
        const speed = addControl("speed", "Integration Velocity", 0.1, 2.0, 0.4);
        const chaos = addControl("chaos", "API Noise", 0.0, 50.0, 20.0);
        const coreSize = addControl("coreSize", "CRM Core Radius", 1.0, 30.0, 10.0);
        
        if (i === 0) {
            setInfo("Dopa Architecture", "Omnichannel data converging into central CRM");
            annotate("hub", new THREE.Vector3(0, 0, 0), "Dopa Core Engine");
        }
        
        // 1. Calculate progression towards the core (0.0 = outer edge, 1.0 = core)
        const norm = i / count;
        // Use scrollTime instead of realTime so it sweeps in/out on scroll
        const progress = (norm + scrollTime * speed * 0.5) % 1.0; 
        // Accelerate the pull as it gets closer to the center
        const easeProgress = Math.pow(progress, 1.5); 
        
        // 2. Spherical distribution (Fibonacci sphere for even 3D volume)
        const goldenRatio = (1.0 + Math.sqrt(5.0)) / 2.0;
        const theta = 2.0 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1.0 - 2.0 * norm);
        
        // 3. Radius logic: from distance 150 down to coreSize
        const currentRadius = coreSize + (150.0 * (1.0 - easeProgress));
        
        // 4. Noise/Chaos: High on the outside APIs, completely 0 at the stable core
        const instability = Math.pow(1.0 - progress, 2.0); 
        // Use realTime for continuous ambient wobble even when not scrolling
        const wobbleX = Math.sin(realTime * 2.0 + norm * 100.0) * chaos * instability;
        const wobbleY = Math.cos(realTime * 1.5 + norm * 200.0) * chaos * instability;
        const wobbleZ = Math.sin(realTime * 3.0 - norm * 300.0) * chaos * instability;
        
        // 5. Position assembly
        const sinPhi = Math.sin(phi);
        const x = (currentRadius * sinPhi * Math.cos(theta)) + wobbleX;
        const y = (currentRadius * sinPhi * Math.sin(theta)) + wobbleY;
        const z = (currentRadius * Math.cos(phi)) + wobbleZ;
        
        target.set(x, y, z);
        
        // 6. Color mapping: Outer = Cool Data Blue (~0.55), Core = High-Energy Purple/Neon (~0.8)
        const hue = 0.55 + (0.25 * progress);
        const saturation = 0.8 + (0.2 * progress);
        
        // Core emits a pulse when data arrives (use realTime for continuous pulsing)
        const corePulse = (progress > 0.95) ? Math.sin(realTime * 10.0) * 0.3 : 0.0;
        const lightness = 0.2 + (0.6 * progress) + corePulse;
        
        color.setHSL(hue, saturation, Math.max(0.0, Math.min(1.0, lightness)));
        // USER CODE END

        positions[i].lerp(target, 0.1);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, pColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
};

const ParticleSwarm = () => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 60 }}>
        <fog attach="fog" args={['#000000', 0.01]} />
        <SwarmLogic />
        <OrbitControls autoRotate={true} enableZoom={false} enablePan={false} />
        <Effects disableGamma>
            <unrealBloomPass threshold={0} strength={1.8} radius={0.4} />
        </Effects>
      </Canvas>
    </div>
  );
};

export default ParticleSwarm;
