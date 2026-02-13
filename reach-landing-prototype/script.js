/**
 * Reach Landing Page - Crystalline Flow
 * Interactive JavaScript for the prototype
 */

document.addEventListener('DOMContentLoaded', function() {
    // ==========================================================================
    // Navigation Scroll Effect
    // ==========================================================================
    const nav = document.getElementById('nav');
    let lastScrollY = 0;

    function handleScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ==========================================================================
    // Mobile Navigation Toggle
    // ==========================================================================
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('open');
            mobileToggle.classList.toggle('active');
        });

        // Close mobile nav when clicking a link
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('open');
                mobileToggle.classList.remove('active');
            });
        });
    }

    // ==========================================================================
    // Intersection Observer for Animations
    // ==========================================================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .metric, .testimonial-card');

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`;
        animationObserver.observe(el);
    });

    // ==========================================================================
    // Metrics Counter Animation
    // ==========================================================================
    const metricValues = document.querySelectorAll('.metric-value');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;

                // Only animate if it has a data-count attribute
                if (el.dataset.count) {
                    animateCounter(el, parseInt(el.dataset.count), text);
                }

                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    metricValues.forEach(el => counterObserver.observe(el));

    function animateCounter(element, target, originalText) {
        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;
        let current = 0;

        const suffix = originalText.replace(/[\d,]+/, '');

        const interval = setInterval(() => {
            current += target / steps;
            if (current >= target) {
                element.textContent = originalText;
                clearInterval(interval);
            } else {
                element.textContent = Math.floor(current).toLocaleString() + suffix;
            }
        }, stepDuration);
    }

    // ==========================================================================
    // Smooth Scroll for Anchor Links
    // ==========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const navHeight = nav.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================================================
    // Button Hover Effects
    // ==========================================================================
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });

        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // ==========================================================================
    // Floating Icons Parallax Effect
    // ==========================================================================
    const floatingIcons = document.querySelectorAll('.floating-icon');

    if (floatingIcons.length > 0 && window.innerWidth > 768) {
        document.addEventListener('mousemove', function(e) {
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 20;

            floatingIcons.forEach((icon, index) => {
                const speed = 1 + (index * 0.2);
                icon.style.transform = `translate(
                    calc(var(--x) + ${mouseX * speed}px),
                    calc(var(--y) + ${mouseY * speed}px)
                )`;
            });
        });
    }

    // ==========================================================================
    // Product Preview Parallax
    // ==========================================================================
    const productPreview = document.querySelector('.product-preview');

    if (productPreview && window.innerWidth > 768) {
        window.addEventListener('scroll', function() {
            const rect = productPreview.getBoundingClientRect();
            const scrollPercent = rect.top / window.innerHeight;

            if (scrollPercent > -1 && scrollPercent < 1) {
                productPreview.style.transform = `translateY(${scrollPercent * 20}px)`;
            }
        }, { passive: true });
    }

    // ==========================================================================
    // Console Message
    // ==========================================================================
    console.log('%c Reach Landing Page Prototype ',
        'background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%); color: white; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: bold;');
    console.log('Designed by Jony | Crystalline Flow Concept');
});
