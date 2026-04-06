// Smart Scroll Navbar Implementation with Enhanced Mobile Support
document.addEventListener('DOMContentLoaded', function() {
    let lastScrollTop = 0;
    let navbar = document.querySelector('.navbar');
    let scrollThreshold = 5; // Minimum scroll distance to trigger hide/show
    let isScrolling = false;

    // Throttle scroll events for better performance
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    function handleScroll() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Don't hide navbar if we're at the very top of the page
        if (scrollTop <= 0) {
            navbar.classList.remove('nav-hidden');
            lastScrollTop = scrollTop;
            return;
        }

        // Check if we've scrolled enough to trigger the effect
        if (Math.abs(lastScrollTop - scrollTop) <= scrollThreshold) {
            return;
        }

        // Scrolling down - hide navbar
        if (scrollTop > lastScrollTop && scrollTop > navbar.offsetHeight) {
            navbar.classList.add('nav-hidden');
        } 
        // Scrolling up - show navbar
        else if (scrollTop < lastScrollTop) {
            navbar.classList.remove('nav-hidden');
        }

        lastScrollTop = scrollTop;
    }

    // Use throttled scroll handler for better performance
    window.addEventListener('scroll', throttle(handleScroll, 10));

    // Handle mobile menu collapse when scrolling
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse) {
        window.addEventListener('scroll', function() {
            if (navbarCollapse.classList.contains('show')) {
                // Close mobile menu when scrolling
                $('.navbar-collapse').collapse('hide');
            }
        });
    }

    // Enhanced Mobile Menu Functionality
    const mobileHamburger = document.querySelector('.mobile-hamburger');
    const desktopToggler = document.querySelector('.navbar-toggler:not(.mobile-hamburger)');
    
    // Handle mobile hamburger clicks
    if (mobileHamburger) {
        mobileHamburger.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Add smooth animation class
            this.classList.add('animating');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                this.classList.remove('animating');
            }, 300);
            
            // Haptic feedback for mobile devices
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        });
    }

    // Quick Action Button Enhancements
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    
    quickActionBtns.forEach(btn => {
        // Add ripple effect on click
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Haptic feedback
            if ('vibrate' in navigator) {
                navigator.vibrate(30);
            }
        });
        
        // Add tooltip functionality for mobile
        btn.addEventListener('touchstart', function() {
            const tooltip = this.getAttribute('title');
            if (tooltip) {
                showMobileTooltip(this, tooltip);
            }
        });
    });

    // Mobile tooltip function
    function showMobileTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'mobile-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            white-space: nowrap;
            z-index: 1001;
            pointer-events: none;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        // Show tooltip
        setTimeout(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        }, 10);
        
        // Hide tooltip after 2 seconds
        setTimeout(() => {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        }, 2000);
    }

    // Smooth show/hide on page load
    window.addEventListener('load', function() {
        navbar.style.transition = 'transform 0.3s ease-in-out';
        
        // Add loaded class for animations
        document.body.classList.add('page-loaded');
    });

    // Handle orientation change on mobile
    window.addEventListener('orientationchange', function() {
        // Close mobile menu on orientation change
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            $('.navbar-collapse').collapse('hide');
        }
        
        // Recalculate navbar height after orientation change
        setTimeout(() => {
            const navbarHeight = navbar.offsetHeight;
            document.body.style.paddingTop = navbarHeight + 20 + 'px';
        }, 100);
    });

    // Handle window resize
    window.addEventListener('resize', throttle(function() {
        // Close mobile menu on desktop resize
        if (window.innerWidth >= 768 && navbarCollapse && navbarCollapse.classList.contains('show')) {
            $('.navbar-collapse').collapse('hide');
        }
    }, 250));

    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Close mobile menu with Escape key
        if (e.key === 'Escape' && navbarCollapse && navbarCollapse.classList.contains('show')) {
            $('.navbar-collapse').collapse('hide');
            
            // Focus back to hamburger button
            if (mobileHamburger) {
                mobileHamburger.focus();
            }
        }
    });

    // Add focus management for accessibility
    const focusableElements = navbar.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    
    navbar.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    });

    // Performance optimization: Intersection Observer for navbar visibility
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        navbar.style.visibility = 'visible';
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        observer.observe(document.body);
    }
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .page-loaded .navbar {
        animation: slideDown 0.5s ease-out;
    }
    
    @keyframes slideDown {
        from {
            transform: translateY(-100%);
        }
        to {
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);