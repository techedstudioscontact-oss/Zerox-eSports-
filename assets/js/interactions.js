/* ============================================
   ZEROX ESPORTS - INTERACTIONS & EFFECTS
   Parallax, Tilt, Scroll Reveals, Counters
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ============================================
    // PARALLAX SCROLLING
    // ============================================

    const parallaxLayers = document.querySelectorAll('.parallax-layer');

    if (parallaxLayers.length > 0) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            parallaxLayers.forEach(layer => {
                const speed = layer.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                layer.style.transform = `translateY(${yPos}px)`;
            });
        }, { passive: true });
    }

    // ============================================
    // STATS COUNTER ANIMATION
    // ============================================

    const statsNumbers = document.querySelectorAll('.stats-number');

    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (target - start) * easeOutQuart);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(update);
    }

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                entry.target.dataset.counted = 'true';
            }
        });
    }, { threshold: 0.5 });

    statsNumbers.forEach(num => statsObserver.observe(num));

    // ============================================
    // COUNTDOWN TIMER
    // ============================================

    const countdownElements = {
        days: document.querySelector('.countdown-days'),
        hours: document.querySelector('.countdown-hours'),
        minutes: document.querySelector('.countdown-minutes'),
        seconds: document.querySelector('.countdown-seconds')
    };

    if (countdownElements.days) {
        // Set tournament date: October 12, 2026
        const tournamentDate = new Date('2026-10-12T00:00:00+05:30').getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = tournamentDate - now;

            if (distance < 0) {
                countdownElements.days.textContent = '00';
                countdownElements.hours.textContent = '00';
                countdownElements.minutes.textContent = '00';
                countdownElements.seconds.textContent = '00';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownElements.days.textContent = String(days).padStart(2, '0');
            countdownElements.hours.textContent = String(hours).padStart(2, '0');
            countdownElements.minutes.textContent = String(minutes).padStart(2, '0');
            countdownElements.seconds.textContent = String(seconds).padStart(2, '0');
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // ============================================
    // CARD TILT EFFECT
    // ============================================

    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.setProperty('--tilt-x', `${rotateX}deg`);
            card.style.setProperty('--tilt-y', `${rotateY}deg`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
        });
    });

    // ============================================
    // RIPPLE EFFECT
    // ============================================

    const rippleButtons = document.querySelectorAll('.btn-ripple');

    rippleButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // ============================================
    // GLASSMORPHISM HEADER ON SCROLL
    // ============================================

    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('glass');
        } else {
            header.classList.remove('glass');
        }

        // Show/hide on scroll
        if (currentScroll > lastScroll && currentScroll > 500) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // ============================================
    // MODAL SYSTEM
    // ============================================

    window.openEnhancedModal = function (content) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="closeEnhancedModal()">&times;</button>
                ${content}
            </div>
        `;
        document.body.appendChild(backdrop);

        setTimeout(() => backdrop.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    };

    window.closeEnhancedModal = function () {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.classList.remove('active');
            setTimeout(() => {
                backdrop.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    };

    // ============================================
    // ACTIVE SECTION DETECTION (for navigation)
    // ============================================

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3
    });

    sections.forEach(section => sectionObserver.observe(section));

    // ============================================
    // PWA: REGISTER SERVICE WORKER
    // ============================================

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(err => {
                    console.log('SW registration failed:', err);
                });
        });
    }

    // ============================================
    // PWA: INSTALL PROMPT
    // ============================================

    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Show install button
        const installBtn = document.getElementById('installApp');
        if (installBtn) {
            installBtn.style.display = 'block';

            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response: ${outcome}`);
                    deferredPrompt = null;
                    installBtn.style.display = 'none';
                }
            });
        }
    });

});

// ============================================
// SMOOTH SCROLL WITH EASING
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});
