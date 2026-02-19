import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function NeuralBrain() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({
      canvas: mount.querySelector('canvas') || undefined,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Neural network nodes
    const nodeCount = 120;
    const nodes = [];
    const nodeGeometry = new THREE.SphereGeometry(0.04, 8, 8);

    const colors = [0x7c6aff, 0x00d4ff, 0xff4ddb, 0x00e68a];

    for (let i = 0; i < nodeCount; i++) {
      // Distribute on sphere surface
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const r = 1.8 + (Math.random() - 0.5) * 0.6;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: Math.random() * 0.5 + 0.4,
      });

      const mesh = new THREE.Mesh(nodeGeometry, mat);
      mesh.position.set(x, y, z);
      mesh.userData = {
        originalPos: new THREE.Vector3(x, y, z),
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.5 + Math.random() * 1.5,
      };
      scene.add(mesh);
      nodes.push(mesh);
    }

    // Neural connections
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x7c6aff,
      transparent: true,
      opacity: 0.12,
    });

    const maxConnections = 200;
    let connectionCount = 0;

    for (let i = 0; i < nodeCount && connectionCount < maxConnections; i++) {
      for (let j = i + 1; j < nodeCount && connectionCount < maxConnections; j++) {
        const dist = nodes[i].position.distanceTo(nodes[j].position);
        if (dist < 1.0) {
          const points = [nodes[i].position.clone(), nodes[j].position.clone()];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, connectionMaterial.clone());
          line.material.opacity = (1.0 - dist) * 0.18;
          scene.add(line);
          connectionCount++;
        }
      }
    }

    // Central glowing core
    const coreGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c6aff,
      transparent: true,
      opacity: 0.15,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Outer shell
    const shellGeometry = new THREE.SphereGeometry(2.1, 32, 32);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c6aff,
      transparent: true,
      opacity: 0.03,
      wireframe: true,
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    scene.add(shell);

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    mount.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate scene gently
      scene.rotation.y = elapsed * 0.08 + mouseX * 0.3;
      scene.rotation.x = mouseY * 0.15;

      // Pulse core
      const pulseFactor = 0.9 + Math.sin(elapsed * 2) * 0.1;
      core.scale.setScalar(pulseFactor);
      coreMaterial.opacity = 0.1 + Math.sin(elapsed * 2) * 0.08;

      // Animate nodes
      nodes.forEach((node) => {
        const { originalPos, pulseOffset, pulseSpeed } = node.userData;
        const pulse = Math.sin(elapsed * pulseSpeed + pulseOffset);
        node.position.copy(originalPos).multiplyScalar(1 + pulse * 0.02);
        node.material.opacity = 0.3 + (pulse + 1) * 0.25;
      });

      // Rotate shell slowly
      shell.rotation.y = elapsed * 0.03;
      shell.rotation.x = elapsed * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ cursor: 'none' }}
    />
  );
}
