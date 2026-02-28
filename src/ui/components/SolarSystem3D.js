import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

export class SolarSystem3D {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05070a);

    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 15;
    this.camera.position.y = 10;
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.planets = [];
    this._initScene();

    this._resizeHandler = () => this.onResize();
    window.addEventListener('resize', this._resizeHandler);

    // Ensure initial size is correct after parent is in DOM
    setTimeout(() => this.onResize(), 100);
  }

  _initScene() {
    // Sun
    const sunGeom = new THREE.SphereGeometry(2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc33 });
    this.sun = new THREE.Mesh(sunGeom, sunMat);
    this.scene.add(this.sun);

    // Sun Glow
    const sunGlowGeom = new THREE.SphereGeometry(2.1, 32, 32);
    const sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    const sunGlow = new THREE.Mesh(sunGlowGeom, sunGlowMat);
    this.sun.add(sunGlow);

    // Light
    const pointLight = new THREE.PointLight(0xffffff, 2, 100);
    this.scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    // Planets
    const planetData = [
      { radius: 0.4, dist: 4, speed: 0.02, color: 0xaaaaaa, name: 'Mercury' },
      { radius: 0.7, dist: 6, speed: 0.015, color: 0xffcc88, name: 'Venus' },
      { radius: 0.8, dist: 8, speed: 0.01, color: 0x4488ff, name: 'Earth' },
      { radius: 0.6, dist: 10, speed: 0.008, color: 0xff5522, name: 'Mars' },
      { radius: 1.5, dist: 14, speed: 0.005, color: 0xffddaa, name: 'Jupiter' },
      { radius: 1.2, dist: 18, speed: 0.003, color: 0xeeddaa, name: 'Saturn' },
    ];

    planetData.forEach(data => {
      const group = new THREE.Group();
      this.scene.add(group);

      const geom = new THREE.SphereGeometry(data.radius, 32, 32);
      const mat = new THREE.MeshStandardMaterial({ color: data.color });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.x = data.dist;
      group.add(mesh);

      // Orbit line
      const orbitCurve = new THREE.EllipseCurve(0, 0, data.dist, data.dist);
      const points = orbitCurve.getPoints(100);
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitMat = new THREE.LineBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.5 });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      this.scene.add(orbitLine);

      this.planets.push({ group, mesh, data });
    });

    // Particle Stars Background
    const starsGeom = new THREE.BufferGeometry();
    const starsCount = 2000;
    const posArray = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 200;
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
    const starField = new THREE.Points(starsGeom, starsMat);
    this.scene.add(starField);
  }

  render() {
    const time = Date.now() * 0.001;
    this.planets.forEach(p => {
      p.group.rotation.y += p.data.speed;
      p.mesh.rotation.y += 0.02;
    });

    this.sun.rotation.y += 0.005;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.container) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    if (this.width === 0 || this.height === 0) {
      // Try to get size from parent if container is still 0
      const rect = this.container.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
    }

    if (this.width > 0 && this.height > 0) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }
  }

  show() {
    this.renderer.domElement.style.display = 'block';
  }

  hide() {
    this.renderer.domElement.style.display = 'none';
  }

  destroy() {
    window.removeEventListener('resize', this._resizeHandler);
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
