import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

interface Props {
  health?: number; // 0..1 (average stats / 100)
  pulseKey?: number; // change to trigger a pulse
  interactive?: boolean;
  zoom?: number; // camera distance offset
  autoRotate?: boolean;
}

const TEX = {
  day: "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
  night: "https://threejs.org/examples/textures/planets/earth_lights_2048.png",
  clouds: "https://threejs.org/examples/textures/planets/earth_clouds_1024.png",
  specular: "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg",
};

function EarthMesh({ health = 0.6, pulseKey = 0 }: { health?: number; pulseKey?: number }) {
  const [dayMap, nightMap, cloudMap, specMap] = useLoader(THREE.TextureLoader, [
    TEX.day,
    TEX.night,
    TEX.clouds,
    TEX.specular,
  ]);

  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmoRef = useRef<THREE.Mesh>(null);
  const shockRef = useRef<THREE.Mesh>(null);
  const fireRef = useRef<THREE.Mesh>(null);
  const smoothH = useRef(health);
  const lastPulse = useRef(pulseKey);
  const shockT = useRef(-1);

  // Custom shader for day/night blend
  const earthMat = useMemo(() => {
    const uniforms = {
      dayMap: { value: dayMap },
      nightMap: { value: nightMap },
      specMap: { value: specMap },
      sunDir: { value: new THREE.Vector3(1, 0.2, 0.6).normalize() },
      atmoColor: { value: new THREE.Color("#4fb6ff") },
      greenBoost: { value: 1 },
      exposure: { value: 1 },
    };
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayMap;
        uniform sampler2D nightMap;
        uniform sampler2D specMap;
        uniform vec3 sunDir;
        uniform vec3 atmoColor;
        uniform float greenBoost;
        uniform float exposure;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vec3 n = normalize(vNormal);
          float lambert = dot(n, normalize(sunDir));
          float dayAmt = smoothstep(-0.1, 0.25, lambert);
          vec3 day = texture2D(dayMap, vUv).rgb;
          vec3 night = texture2D(nightMap, vUv).rgb * 1.4;
          // healthy planets look greener/bluer; degraded ones dry out
          day = mix(day * vec3(1.12, 0.92, 0.72), day * vec3(0.88, 1.12, 1.06), greenBoost);
          vec3 col = mix(night, day, dayAmt) * exposure;
          // subtle rim atmosphere
          float rim = pow(1.0 - max(dot(n, vec3(0.0,0.0,1.0)), 0.0), 2.4);
          col += atmoColor * rim * 0.35;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, [dayMap, nightMap, specMap]);

  const atmoMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        uniforms: {
          glowColor: { value: new THREE.Color("#5ec8ff") },
          intensity: { value: 1.0 },
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          uniform vec3 glowColor;
          uniform float intensity;
          void main() {
            float rim = pow(0.72 - dot(vNormal, vec3(0.0,0.0,1.0)), 3.0);
            gl_FragColor = vec4(glowColor, 1.0) * rim * intensity;
          }
        `,
      }),
    [],
  );

  const shockMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#7be7ff"),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.04;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.055;
    if (fireRef.current) fireRef.current.rotation.y = earthRef.current?.rotation.y ?? 0;

    // Smoothly ease toward the target health so year changes animate
    const target = Math.max(0, Math.min(1, health));
    smoothH.current += (target - smoothH.current) * Math.min(1, delta * 1.6);
    const h = smoothH.current;
    const severity = 1 - h;

    // Tint atmosphere based on health
    const good = new THREE.Color("#5ec8ff");
    const warm = new THREE.Color("#ffa347");
    const bad = new THREE.Color("#ff3b1f");
    const c =
      severity < 0.5
        ? good.clone().lerp(warm, severity * 2)
        : warm.clone().lerp(bad, (severity - 0.5) * 2);
    (atmoMat.uniforms.glowColor.value as THREE.Color).copy(c);
    if (atmoMat.uniforms.intensity) {
      atmoMat.uniforms.intensity.value = 0.85 + severity * 0.9;
    }
    (earthMat.uniforms.atmoColor.value as THREE.Color).copy(c);
    if (earthMat.uniforms.greenBoost) {
      earthMat.uniforms.greenBoost.value = h;
    }
    if (earthMat.uniforms.exposure) {
      earthMat.uniforms.exposure.value = 0.75 + h * 0.45;
    }

    // Clouds darken into smoke as the planet degrades
    if (cloudsRef.current) {
      const m = cloudsRef.current.material as THREE.MeshPhongMaterial;
      m.color.copy(new THREE.Color("#ffffff").lerp(new THREE.Color("#4a4038"), severity));
      m.opacity = 0.5 + severity * 0.35;
    }
    // Wildfire glow layer
    if (fireRef.current) {
      const m = fireRef.current.material as THREE.MeshBasicMaterial;
      const flicker = 0.85 + Math.sin(state.clock.elapsedTime * 4.5) * 0.15;
      m.opacity = Math.max(0, severity - 0.25) * 1.1 * flicker;
    }

    // sun orbits slowly
    const t = state.clock.elapsedTime * 0.05;
    (earthMat.uniforms.sunDir.value as THREE.Vector3)
      .set(Math.cos(t), 0.25, Math.sin(t))
      .normalize();

    // trigger pulse
    if (pulseKey !== lastPulse.current) {
      lastPulse.current = pulseKey;
      shockT.current = 0;
    }
    if (shockT.current >= 0 && shockRef.current) {
      shockT.current += delta;
      const p = Math.min(shockT.current / 1.4, 1);
      const s = 1 + p * 1.6;
      shockRef.current.scale.setScalar(s);
      shockMat.opacity = (1 - p) * 0.7;
      if (p >= 1) {
        shockT.current = -1;
        shockMat.opacity = 0;
      }
    }
  });

  return (
    <group>
      {/* Earth core */}
      <mesh ref={earthRef} material={earthMat}>
        <sphereGeometry args={[1, 96, 96]} />
      </mesh>
      {/* Wildfire / ember glow */}
      <mesh ref={fireRef}>
        <sphereGeometry args={[1.004, 64, 64]} />
        <meshBasicMaterial
          map={nightMap}
          color="#ff5a1f"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.012, 64, 64]} />
        <meshPhongMaterial map={cloudMap} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh ref={atmoRef} material={atmoMat} scale={1.18}>
        <sphereGeometry args={[1, 48, 48]} />
      </mesh>
      {/* Shockwave ring */}
      <mesh ref={shockRef} material={shockMat} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.25, 1.32, 96]} />
      </mesh>
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.01;
  });
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial size={0.02} color="#8bd8ff" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export default function Earth3D({
  health = 0.6,
  pulseKey = 0,
  interactive = true,
  zoom = 0,
  autoRotate = true,
}: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 3.2 + zoom], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 2, 3]} intensity={1.2} color="#fff6e6" />
      <Suspense fallback={null}>
        <EarthMesh health={health} pulseKey={pulseKey} />
        <Particles />
        <Stars radius={80} depth={40} count={4000} factor={3.5} saturation={0} fade speed={0.6} />
      </Suspense>
      {interactive && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.35}
          autoRotate={autoRotate}
          autoRotateSpeed={0.35}
        />
      )}
    </Canvas>
  );
}
