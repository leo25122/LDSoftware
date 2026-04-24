document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('hub-canvas-container')) {
    initHubCanvas();
    init3DCarousel();
  } else if (document.getElementById('canvas-container')) {
    initThreeJSTunnel();
    init3DCarousel();
  }
});

// A sleek, interactive corporate starfield with beautiful glowing orbs
function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function initHubCanvas() {
  const container = document.getElementById('hub-canvas-container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 40;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BufferGeometry();
  const count = 2000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  const colorLightBlue = new THREE.Color(0x00BFFF); // Deep sky blue
  const colorWhite = new THREE.Color(0xffffff);

  for(let i=0; i<count*3; i+=3) {
    // Generate points in a 3D spherical volume for a deeper 3D effect
    const r = 80 * Math.cbrt(Math.random()); // Uniform distribution inside sphere
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i] = r * Math.sin(phi) * Math.cos(theta);
    positions[i+1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i+2] = r * Math.cos(phi);
    
    // Mix of light blue and white
    const c = Math.random() > 0.4 ? colorLightBlue : colorWhite;
    colors[i] = c.r;
    colors[i+1] = c.g;
    colors[i+2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Interactive glowing particles
  const material = new THREE.PointsMaterial({
    size: 1.2, // Larger size because the texture has soft glowing edges
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    map: createCircleTexture(),
    depthWrite: false, // Prevents black square artifacts
    blending: THREE.AdditiveBlending
  });

  const mesh = new THREE.Points(geometry, material);
  scene.add(mesh);

  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
    targetRotationY = mouseX * 1.5;
    targetRotationX = mouseY * 1.5;
  });

  const clock = new THREE.Clock();
  let baseRotationY = 0;
  let baseRotationX = 0;

  function animate() {
    requestAnimationFrame(animate);
    
    // Constant slow rotation + mouse target rotation
    baseRotationY += 0.0015;
    baseRotationX += 0.0008;
    
    mesh.rotation.y += (baseRotationY + targetRotationY - mesh.rotation.y) * 0.05;
    mesh.rotation.x += (baseRotationX + targetRotationX - mesh.rotation.x) * 0.05;
    
    // Subtle parallax
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Keep the tunnel effect for details pages but make it much slower and cleaner
function initThreeJSTunnel() {
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.0015);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 6000; // Increased from 2000 for a denser but still clean look
  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i+=3) {
    const z = (Math.random() - 0.5) * 2000;
    const radius = 10 + Math.random() * 40;
    const theta = Math.random() * 2 * Math.PI;
    posArray[i] = radius * Math.cos(theta);     
    posArray[i+1] = radius * Math.sin(theta);   
    posArray[i+2] = z;                          
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const material = new THREE.PointsMaterial({
    size: 0.8, // Slightly larger to show the glowing texture
    color: 0x00BFFF, // Light blue color
    transparent: true,
    opacity: 0.3, // Lower opacity to keep text highly readable
    map: createCircleTexture(), // Use the same beautiful glowing orbs
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particlesMesh = new THREE.Points(particlesGeometry, material);
  scene.add(particlesMesh);

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth/2) * 0.0005;
    mouseY = (e.clientY - window.innerHeight/2) * 0.0005;
  });

  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smoother, professional camera movement
    camera.rotation.y += 0.02 * (mouseX - camera.rotation.y);
    camera.rotation.x += 0.02 * (mouseY - camera.rotation.x);

    particlesMesh.rotation.z = elapsedTime * 0.02; // slower rotation

    const scrollOffset = scrollY * -0.3; 
    camera.position.z = 5 + scrollOffset - (elapsedTime * 2);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function init3DCarousel() {
  const carousel = document.querySelector('.carousel-3d');
  if (!carousel) return;

  const panels = document.querySelectorAll('.panel-3d');
  const panelCount = panels.length;
  if (panelCount === 0) return;

  // Calculate radius dynamically based on screen width
  const isMobile = window.innerWidth <= 768;
  const panelWidth = isMobile ? 300 : 540;
  const padding = isMobile ? 60 : 120;
  const radius = Math.round((panelWidth / 2) / Math.tan(Math.PI / panelCount)) + padding;
  const theta = 360 / panelCount;

  panels.forEach((panel, i) => {
    const angle = theta * i;
    // We rotate Y and translate Z to push it outward to form a cylinder
    panel.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
  });

  let currentRotation = 0;
  window.carouselTargetRotation = 0;
  window.carouselTheta = theta;

  document.addEventListener('wheel', (e) => {
    window.carouselTargetRotation += e.deltaY * 0.2;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      window.carouselTargetRotation -= window.carouselTheta;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      window.carouselTargetRotation += window.carouselTheta;
    }
  });

  // Touch Swipe Support for Mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 40;
    if (touchEndX < touchStartX - swipeThreshold) {
      window.carouselTargetRotation -= window.carouselTheta; // Swipe left
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      window.carouselTargetRotation += window.carouselTheta; // Swipe right
    }
  }, {passive: true});

  window.rotateCarousel = function(direction) {
    window.carouselTargetRotation += direction * window.carouselTheta;
  };

  function animateCarousel() {
    currentRotation += (window.carouselTargetRotation - currentRotation) * 0.05; // smooth inertia
    carousel.style.transform = `rotateY(${currentRotation}deg)`;
    requestAnimationFrame(animateCarousel);
  }
  
  animateCarousel();
}

function initCardHoverGlow() {
  document.querySelectorAll('.pro-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}
