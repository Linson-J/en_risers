/* ==========================================================================
   ENRISERS WEBSITE CONCEPT INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Global State
  const state = {
    isDark: false,
    activeForm: 'student', // 'student' | 'mentor'
  };

  /* ==========================================================================
     1. THEME TOGGLE (LIGHT / DARK MODE)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const body = document.body;
  const iconMoon = themeToggleBtn.querySelector('.icon-moon');
  const iconSun = themeToggleBtn.querySelector('.icon-sun');

  // Check saved theme
  const savedTheme = localStorage.getItem('enrisers-theme');
  if (savedTheme === 'dark') {
    enableDarkMode();
  } else {
    enableLightMode();
  }

  themeToggleBtn.addEventListener('click', () => {
    state.isDark = !state.isDark;
    if (state.isDark) {
      enableDarkMode();
    } else {
      enableLightMode();
    }
  });

  function enableDarkMode() {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    state.isDark = true;
    iconMoon.style.display = 'none';
    iconSun.style.display = 'block';
    localStorage.setItem('enrisers-theme', 'dark');
  }

  function enableLightMode() {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    state.isDark = false;
    iconSun.style.display = 'none';
    iconMoon.style.display = 'block';
    localStorage.setItem('enrisers-theme', 'light');
  }


  /* ==========================================================================
     2. NAVIGATION STICKY & SCROLL PROGRESS
     ========================================================================== */
  const header = document.getElementById('main-header');
  const scrollProgressBar = document.getElementById('scroll-progress');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    // Update scroll progress bar
    scrollProgressBar.style.width = scrollPercent + '%';

    // Sticky Header Shrink
    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Link Highlight
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });


  /* ==========================================================================
     3. MOBILE DRAWER MENU
     ========================================================================== */
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerLinks = document.querySelectorAll('.mobile-nav-link');

  mobileMenuToggle.addEventListener('click', () => {
    const isOpen = mobileDrawer.classList.toggle('open');
    mobileMenuToggle.classList.toggle('active');
    
    // Accessibility update
    mobileMenuToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close drawer when clicking a link
  mobileDrawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
      mobileMenuToggle.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close drawer if resized to desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      mobileDrawer.classList.remove('open');
      mobileMenuToggle.classList.remove('active');
    }
  });


  /* ==========================================================================
     4. HERO PARTICLE CANVAS SYSTEM
     ========================================================================== */
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  let particlesArray = [];
  const numberOfParticles = 70;
  const mouse = {
    x: null,
    y: null,
    radius: 120
  };

  // Adjust canvas size
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Mouse move handler
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle Blueprint
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 1 - 0.5;
      this.speedY = Math.random() * 1 - 0.5;
      this.color = '';
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Bounce off walls
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

      // Mouse interactive force (Push away/repulsion)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius; // Closer = stronger force
          const directionX = forceDirectionX * force * 1.5;
          const directionY = forceDirectionY * force * 1.5;
          
          this.x += directionX;
          this.y += directionY;
        }
      }
    }

    draw() {
      // Choose particle color based on theme
      const particleColor = body.classList.contains('dark-mode') 
        ? 'rgba(242, 101, 34, 0.4)' 
        : 'rgba(15, 41, 66, 0.15)';
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Create particle pool
  function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }
  initParticles();

  // Draw lines connecting nearby particles
  function connectParticles() {
    const maxDistance = 140;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a + 1; b < particlesArray.length; b++) {
        const dx = particlesArray[a].x - particlesArray[b].x;
        const dy = particlesArray[a].y - particlesArray[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          // Line opacity gets higher the closer particles are
          const opacity = (1 - (distance / maxDistance)) * 0.15;
          const strokeColor = body.classList.contains('dark-mode')
            ? `rgba(242, 101, 34, ${opacity})`
            : `rgba(15, 41, 66, ${opacity})`;
            
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Core Animation Loop
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();


  /* ==========================================================================
     5. SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-fade, .reveal-slide-up');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
      }
    });
  }, {
    threshold: 0.12, // Trigger when 12% is visible
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });


  /* ==========================================================================
     6. IMPACT STATS COUNT-UP COUNTERS
     ========================================================================== */
  const statsSection = document.getElementById('impact');
  const counters = document.querySelectorAll('.counter-value');
  let hasCountersRun = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasCountersRun) {
        startCounters();
        hasCountersRun = true;
      }
    });
  }, { threshold: 0.5 });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  function startCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000; // 2 seconds animation
      const frameRate = 60;
      const totalFrames = (duration / 1000) * frameRate;
      let frame = 0;

      const countInterval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        // Ease out quadratic progress
        const easeProgress = 1 - Math.pow(1 - progress, 2);
        const currentValue = Math.floor(easeProgress * target);

        counter.innerText = currentValue;

        if (frame >= totalFrames) {
          counter.innerText = target;
          clearInterval(countInterval);
        }
      }, 1000 / frameRate);
    });
  }


  /* ==========================================================================
     7. JOURNEY TIMELINE VERTICAL SCROLL TRACKING
     ========================================================================== */
  const timelineSection = document.getElementById('timeline');
  const timelineProgressBar = document.getElementById('timeline-progress-bar');
  const timelineItems = document.querySelectorAll('.timeline-item');

  window.addEventListener('scroll', () => {
    if (!timelineSection) return;

    const sectionRect = timelineSection.getBoundingClientRect();
    const sectionHeight = timelineSection.clientHeight;
    
    // Calculate how far down the timeline container the viewport scroll is
    const startPoint = window.innerHeight * 0.7; // Start progress bar fill a bit early
    const currentProgress = (startPoint - sectionRect.top) / (sectionHeight - window.innerHeight + startPoint);
    const clampedProgress = Math.max(0, Math.min(1, currentProgress));

    // Update vertical line height
    if (timelineProgressBar) {
      timelineProgressBar.style.height = (clampedProgress * 100) + '%';
    }

    // Activate timeline block entries as they hit scroll threshold
    timelineItems.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      if (itemRect.top < window.innerHeight * 0.75) {
        item.classList.add('active-timeline');
      } else {
        item.classList.remove('active-timeline');
      }
    });
  });


  /* ==========================================================================
     8. TESTIMONIAL CAROUSEL SLIDER (CLEANED UP)
     ========================================================================== */
  // Carousel removed in favor of Our Team core coordinators flat grid.


  /* ==========================================================================
     9. REGISTRATION FORM CONTROLS & BACKEND VALIDATION
     ========================================================================== */
  const studentForm = document.getElementById('student-form');
  const successBox = document.getElementById('form-success-box');
  const btnSuccessClose = document.getElementById('btn-success-close');

  // Regex validation rules
  const validators = {
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    phone: (val) => /^[0-9]{10}$/.test(val),
    text: (val) => val.trim().length > 0,
    select: (val) => val !== null && val !== ""
  };

  // Setup real-time input listeners
  const allFormInputs = document.querySelectorAll('.signup-form input, .signup-form select');

  allFormInputs.forEach(input => {
    // Validate on input typing & blur events
    input.addEventListener('input', () => validateField(input));
    input.addEventListener('blur', () => validateField(input));
    
    // Select dropdown reset label color hack
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => validateField(input));
    }
  });

  function validateField(input) {
    const value = input.value;
    const parent = input.closest('.input-group');
    let isValid = true;

    if (!parent) return true;

    // Check specific validation type
    if (input.type === 'email') {
      isValid = validators.email(value);
    } else if (input.type === 'tel') {
      isValid = validators.phone(value);
    } else if (input.tagName === 'SELECT') {
      isValid = validators.select(value);
    } else {
      isValid = validators.text(value);
    }

    if (isValid) {
      parent.classList.remove('input-error');
      parent.classList.add('input-success');
    } else {
      parent.classList.remove('input-success');
      parent.classList.add('input-error');
    }

    return isValid;
  }

  // Handle Student Form Submit
  if (studentForm) {
    studentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit(studentForm, 'student');
    });
  }

  function handleSubmit(form, type) {
    const inputs = form.querySelectorAll('input, select');
    let isFormValid = true;

    // Sweep-validate all inputs in active form
    inputs.forEach(input => {
      const isFieldValid = validateField(input);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      // Shake the active form container as feedback
      form.classList.add('shake-active');
      setTimeout(() => form.classList.remove('shake-active'), 500);
      return;
    }

    // Form is Valid -> Trigger real network submission to Python Backend
    const submitBtn = form.querySelector('.btn-submit-form');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Assemble payload
    let payload = {
      type: type,
      name: form.querySelector('#student-name').value.trim(),
      email: form.querySelector('#student-email').value.trim(),
      phone: form.querySelector('#student-phone').value.trim(),
      program: form.querySelector('#student-program').value
    };

    // Call Flask API endpoint
    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(result => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      if (result.success) {
        // Clear values of inputs
        inputs.forEach(input => {
          input.value = '';
          const parent = input.closest('.input-group');
          if (parent) {
            parent.classList.remove('input-success', 'input-error');
          }
        });

        // Swap Form to Success View
        form.style.display = 'none';
        successBox.style.display = 'flex';
      } else {
        alert("Error submitting: " + (result.error || "Please try again later."));
      }
    })
    .catch(error => {
      console.error('Error submitting form:', error);
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      alert("Submission error. Please ensure the Python Backend is running at http://localhost:8800.");
    });
  }

  // Reset form after success message
  if (btnSuccessClose) {
    btnSuccessClose.addEventListener('click', () => {
      successBox.style.display = 'none';
      studentForm.style.display = 'flex';
    });
  }


  /* ==========================================================================
     10. NEWSLETTER FORM HANDLER (DEPRECATED - REPLACED BY WHATSAPP JOIN)
     ========================================================================== */

  /* ==========================================================================
     11. POPUP ADVERTISEMENT MODAL MECHANISMS
     ========================================================================== */
  const eventPopupModal = document.getElementById('event-popup-modal');
  const btnClosePopup = document.getElementById('btn-close-popup');
  const btnPopupCta = document.getElementById('btn-popup-cta');

  if (eventPopupModal) {
    // Show modal automatically 1.2 seconds after load
    setTimeout(() => {
      // Check if user already dismissed it this session (optional helper)
      if (!sessionStorage.getItem('enrisers-ad-dismissed')) {
        eventPopupModal.classList.add('open');
      }
    }, 1200);

    // Close on X button click
    if (btnClosePopup) {
      btnClosePopup.addEventListener('click', () => {
        closeModal();
      });
    }

    // Close modal when clicking the external registration link
    if (btnPopupCta) {
      btnPopupCta.addEventListener('click', () => {
        closeModal();
      });
    }

    // Close when clicking backdrop outside the modal container
    eventPopupModal.addEventListener('click', (e) => {
      if (e.target === eventPopupModal) {
        closeModal();
      }
    });

    function closeModal() {
      eventPopupModal.classList.remove('open');
      sessionStorage.setItem('enrisers-ad-dismissed', 'true');
    }
  }
});
