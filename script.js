document.addEventListener('DOMContentLoaded', function() {
    // Initialize custom cursor
    initCursor();
    
    // Initialize scroll animations
    initScrollAnimation();
    
    // Initialize navigation and mobile menu
    initNavigation();
    
    // Initialize portfolio filtering
    initPortfolioFilter();
    
    // Initialize skill bar animations
    initSkillBars();
    
    // Initialize scroll reveal animations
    initScrollReveal();
});

// Custom cursor functionality
function initCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    document.addEventListener('mousemove', function(e) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        // Add a small delay to the follower for better effect
        setTimeout(function() {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }, 100);
    });
    
    // Hovering effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .portfolio-item, .filter-btn');
    
    interactiveElements.forEach(function(el) {
        el.addEventListener('mouseenter', function() {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.8)';
        });
        
        el.addEventListener('mouseleave', function() {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
}

// Scroll animation
function initScrollAnimation() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Animate hero elements when page loads
    setTimeout(function() {
        document.querySelector('.hero-content').style.opacity = '1';
        document.querySelector('.hero-content').style.transform = 'translateY(0)';
    }, 300);
}

// Navigation and mobile menu
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    // Handle navigation links click
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hide mobile menu if open
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            }
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 100,
                behavior: 'smooth'
            });
            
            // Update active class
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Handle scroll to update active nav link
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(function(section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.classList.toggle('active');
    });
}

// Portfolio filtering
function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            portfolioItems.forEach(function(item) {
                const categories = item.getAttribute('data-category').split(' ');
                
                // Show or hide based on filter
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    item.style.display = 'block';
                    setTimeout(function() {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 200);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(function() {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Skill bars animation
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observerOptions = {
        threshold: 0.3
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const widthValue = entry.target.style.width;
                entry.target.style.width = '0';
                
                setTimeout(function() {
                    entry.target.style.width = widthValue;
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    skillBars.forEach(function(bar) {
        observer.observe(bar);
    });
}

// Scroll reveal animations
function initScrollReveal() {
    const sections = document.querySelectorAll('section');
    const aboutContent = document.querySelector('.about-content');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const contactItems = document.querySelectorAll('.contact-item');
    
    // Add scroll-reveal class to elements we want to animate
    aboutContent.classList.add('scroll-reveal');
    portfolioItems.forEach(item => item.classList.add('scroll-reveal'));
    contactItems.forEach(item => item.classList.add('scroll-reveal'));
    
    const observerOptions = {
        threshold: 0.2
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's a section with multiple elements, animate children
                if (entry.target.classList.contains('about') || 
                    entry.target.classList.contains('work') || 
                    entry.target.classList.contains('contact')) {
                    
                    const elements = entry.target.querySelectorAll('.scroll-reveal');
                    
                    elements.forEach(function(el, index) {
                        setTimeout(function() {
                            el.classList.add('active');
                        }, 200 * index);
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections and scroll-reveal elements
    sections.forEach(function(section) {
        observer.observe(section);
    });
    
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach(function(element) {
        observer.observe(element);
    });
}

// Add Disney-inspired magical floating shapes animation
function addFloatingShapes() {
    const animationContainer = document.querySelector('.animation-container');
    
    for (let i = 0; i < 5; i++) {
        const shape = document.createElement('div');
        shape.classList.add('floating-shape');
        shape.style.width = Math.random() * 70 + 30 + 'px';
        shape.style.height = shape.style.width;
        shape.style.top = Math.random() * 80 + 10 + '%';
        shape.style.left = Math.random() * 80 + 10 + '%';
        shape.style.animationDelay = Math.random() * 5 + 's';
        shape.style.animationDuration = Math.random() * 10 + 10 + 's';
        
        // Different shapes have different colors
        if (i % 3 === 0) {
            shape.style.backgroundColor = 'var(--disney-purple)';
        } else if (i % 3 === 1) {
            shape.style.backgroundColor = 'var(--disney-blue)';
        } else {
            shape.style.backgroundColor = 'var(--disney-gold)';
        }
        
        animationContainer.appendChild(shape);
    }
}