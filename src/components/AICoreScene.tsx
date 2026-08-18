import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Orb() {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  useFrame((s, d) => {
    if (outer.current) {
      outer.current.rotation.y += d * 0.6;
      outer.current.rotation.x += d * 0.2;
    }
    if (inner.current) {
      inner.current.rotation.y -= d * 1.1;
      const p = 1 + Math.sin(s.clock.elapsedTime * 2) * 0.06;
      inner.current.scale.setScalar(p);
    }
    if (ring1.current) ring1.current.rotation.z += d * 0.5;
    if (ring2.current) ring2.current.rotation.x += d * 0.7;
  });
  return (
    <group>
      <mesh ref={outer}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#5ec8ff" wireframe transparent opacity={0.85} />
      </mesh>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshBasicMaterial color="#c58bff" wireframe transparent opacity={0.9} />
      </mesh>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.008, 8, 96]} />
        <meshBasicMaterial color="#7be7ff" transparent opacity={0.9} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[1.55, 0.006, 8, 96]} />
        <meshBasicMaterial color="#c58bff" transparent opacity={0.7} />
      </mesh>
      {/* core glow sphere */}
      <mesh scale={0.28}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export default function AICoreScene() {
  return (
    <Canvas camera={{ position: [0, 0, 3.6], fov: 42 }} gl={{ alpha: true, antialias: true }}>
      <Orb />
    </Canvas>
  );
}
