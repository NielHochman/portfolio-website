document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initParticleCanvas();
  initTypewriter();
  initParallax();
  initScrollReveal();
  initFilters();
  initGameModal();
  initMobileMenu();
  initNavbar();
});

// ---------------------------------------------------------------------------
// 1. Particle Canvas
// ---------------------------------------------------------------------------
function initParticleCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const parent = canvas.parentElement;
  const colors = ['#7b2ff7', '#00d4ff', '#4ecdc4'];
  let particles = [];
  let animId;

  const resize = () => {
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
  };
  resize();

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 1.6;
      this.speedY = (Math.random() - 0.5) * 1.6;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x <= 0 || this.x >= canvas.width) this.speedX *= -1;
      if (this.y <= 0 || this.y >= canvas.height) this.speedY *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  const createParticles = () => {
    const count = window.innerWidth < 768 ? 80 : 120;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  };
  createParticles();

  const connectParticles = () => {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = particles[a].color;
          ctx.globalAlpha = (1 - dist / 120) * 0.3;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    connectParticles();
    animId = requestAnimationFrame(animate);
  };
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
}

// ---------------------------------------------------------------------------
// 2. Typewriter
// ---------------------------------------------------------------------------
function initTypewriter() {
  const subtitle = document.querySelector('.hero-subtitle');
  if (!subtitle) return;

  const text = subtitle.getAttribute('data-text');
  if (!text) return;

  subtitle.innerHTML = '<span class="typewriter-text"></span><span class="cursor-blink"></span>';
  const span = subtitle.querySelector('.typewriter-text');
  let i = 0;

  const type = () => {
    if (i < text.length) {
      span.textContent += text.charAt(i);
      i++;
      setTimeout(type, 70);
    }
  };

  setTimeout(type, 1500);
}

// ---------------------------------------------------------------------------
// 3. Parallax
// ---------------------------------------------------------------------------
function initParallax() {
  const shapes = document.querySelectorAll('.hero-shape');
  if (!shapes.length) return;

  window.addEventListener('mousemove', (e) => {
    const offsetX = (e.clientX - window.innerWidth / 2);
    const offsetY = (e.clientY - window.innerHeight / 2);

    shapes.forEach(shape => {
      const speed = parseFloat(shape.getAttribute('data-speed')) || 1;
      const x = offsetX * speed * 0.02;
      const y = offsetY * speed * 0.02;
      shape.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
}

// ---------------------------------------------------------------------------
// 4. Scroll Reveal
// ---------------------------------------------------------------------------
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));
}

// ---------------------------------------------------------------------------
// 6. Filters
// ---------------------------------------------------------------------------
function initFilters() {
  const pillContainers = document.querySelectorAll('.filter-pills');
  if (!pillContainers.length) return;

  pillContainers.forEach(container => {
    const pills = container.querySelectorAll('.filter-pill');
    const grid = container.nextElementSibling;
    if (!grid) return;
    const items = grid.querySelectorAll('[data-category]');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.getAttribute('data-filter');

        items.forEach(item => {
          const category = item.getAttribute('data-category') || '';
          const match = filter === 'all' || category.includes(filter);

          if (match) {
            item.style.display = '';
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            });
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  });
}

// ---------------------------------------------------------------------------
// 7. Game Modal
// ---------------------------------------------------------------------------
function initGameModal() {
  const modal = document.getElementById('gameModal');
  const iframe = document.getElementById('gameIframe');
  const closeBtn = modal ? modal.querySelector('.modal-close') : null;
  if (!modal || !iframe) return;

  const content = modal.querySelector('.game-modal-content');

  const openModal = (url, isPortrait) => {
    iframe.src = url;
    if (content) content.classList.toggle('portrait', isPortrait);
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    iframe.src = '';
    if (content) content.classList.remove('portrait');
  };

  document.querySelectorAll('[data-demo-url]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.getAttribute('data-demo-url');
      const isPortrait = btn.hasAttribute('data-portrait');
      if (url) openModal(url, isPortrait);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// ---------------------------------------------------------------------------
// 8. Custom Cursor
// ---------------------------------------------------------------------------
function initCursor() {
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  const moveFollower = () => {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    requestAnimationFrame(moveFollower);
  };
  moveFollower();

  const hoverTargets = document.querySelectorAll('a, button, .project-card, .game-card');

  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '12px';
      cursor.style.height = '12px';
      follower.style.width = '48px';
      follower.style.height = '48px';
      follower.style.borderColor = 'var(--accent-color, #00d4ff)';
    });

    el.addEventListener('mouseleave', () => {
      cursor.style.width = '';
      cursor.style.height = '';
      follower.style.width = '';
      follower.style.height = '';
      follower.style.borderColor = '';
    });
  });
}

// ---------------------------------------------------------------------------
// 9. Mobile Menu
// ---------------------------------------------------------------------------
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const overlay = document.getElementById('mobileNav');
  if (!toggle || !overlay) return;

  const close = () => {
    toggle.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isActive = overlay.classList.contains('active');
    if (isActive) {
      close();
    } else {
      toggle.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  overlay.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', close);
  });
}

// ---------------------------------------------------------------------------
// 10. Navbar
// ---------------------------------------------------------------------------
function initNavbar() {
  const header = document.getElementById('navbar');
  if (!header) return;

  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // Scrolled class
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active section tracking
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}
