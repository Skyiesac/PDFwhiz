import React, { useEffect, useRef, useState } from 'react';

const Particles = () => {
  const canvasRef = useRef(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    // Check theme on mount and when it changes
    const checkTheme = () => {
      const isDark = document.body.classList.contains('dark-theme');
      setIsDarkTheme(isDark);
    };

    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Run particles in both themes now
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to full viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.8;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = Math.random() * 0.6 - 0.3;
        this.opacity = Math.random() * 0.6 + 0.3;
        this.sparkleTimer = Math.random() * 60;
        
        // Different colors for dark vs light theme
        if (isDarkTheme) {
          this.color = `hsl(${Math.random() * 60 + 200}, 70%, 70%)`; // Bright blue for dark theme
          this.opacity = Math.random() * 0.6 + 0.3;
        } else {
          // Beautiful colors for the new light theme gradient
          const colors = [
            'hsl(250, 100.00%, 31.60%)',  // Light purple
            'hsl(260, 70%, 85%)',  // Very light purple
            'hsl(240, 60%, 90%)',  // Very light blue
            'hsl(270, 50%, 85%)',  // Light lavender
            '#ffffff'              // White sparkles
          ];
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.opacity = Math.random() * 0.4 + 0.2; // Moderate opacity for light theme
        }
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.sparkleTimer++;

        // Wrap around edges
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.save();
        
        // Main particle
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Sparkle effect
        if (this.sparkleTimer % 45 === 0) {
          ctx.globalAlpha = this.opacity * 1.5;
          if (isDarkTheme) {
            ctx.fillStyle = '#ffffff';
          } else {
            ctx.fillStyle = '#ffffff'; // White sparkles for light theme
          }
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Sparkle rays
          ctx.strokeStyle = isDarkTheme ? '#2979ff' : 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = this.opacity * 0.6;
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const x1 = this.x + Math.cos(angle) * this.size * 2;
            const y1 = this.y + Math.sin(angle) * this.size * 2;
            const x2 = this.x + Math.cos(angle) * this.size * 3;
            const y2 = this.y + Math.sin(angle) * this.size * 3;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
        
        ctx.restore();
      }
    }

    // Create particles
    const particles = [];
    const particleCount = Math.min(60, Math.floor(canvas.width * canvas.height / 20000));
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections between nearby particles
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha = isDarkTheme ? 
              (100 - distance) / 100 * 0.15 : 
              (100 - distance) / 100 * 0.08; // Moderate opacity for light theme
            ctx.strokeStyle = isDarkTheme ? '#2979ff' : 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDarkTheme]);

  // Render canvas in both themes now
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 1
      }}
    />
  );
};

export default Particles; 