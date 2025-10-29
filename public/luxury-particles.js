// Luxury Particles - 超高级感粒子网格动态背景
// 黑金色主题，多层次、3D深度感

(function() {
  var canvas, ctx;
  var width, height;
  var particles = [];
  var flowParticles = []; // 流动粒子
  var stars = []; // 星光粒子
  var waves = []; // 光波
  var particleCount = 100; // 主粒子数量
  var flowParticleCount = 30; // 流动粒子数量
  var starCount = 80; // 星光数量
  var connectionDistance = 180;
  var mouse = { x: null, y: null, radius: 200 };
  var isAnimating = true;
  var lastFrameTime = 0;
  var frameInterval = 1000 / 60; // 60 FPS
  var time = 0;

  // 主粒子类 - 3D效果
  function Particle() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.z = Math.random() * 500 + 100; // 深度
    this.size = Math.random() * 2.5 + 1;
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.speedY = (Math.random() - 0.5) * 0.6;
    this.speedZ = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.6 + 0.3;
    this.hue = Math.random() * 25 + 35; // 金色范围
    this.pulseSpeed = Math.random() * 0.02 + 0.01;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  Particle.prototype.update = function() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.z += this.speedZ;

    // 3D边界检测
    if (this.x > width || this.x < 0) this.speedX = -this.speedX;
    if (this.y > height || this.y < 0) this.speedY = -this.speedY;
    if (this.z > 600 || this.z < 100) this.speedZ = -this.speedZ;

    // 脉动效果
    this.pulsePhase += this.pulseSpeed;

    // 鼠标互动 - 更强的排斥力
    if (mouse.x != null && mouse.y != null) {
      var dx = mouse.x - this.x;
      var dy = mouse.y - this.y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouse.radius) {
        var force = (mouse.radius - distance) / mouse.radius;
        var angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * force * 3;
        this.y -= Math.sin(angle) * force * 3;
      }
    }
  };

  Particle.prototype.draw = function() {
    // 3D透视效果
    var scale = 300 / (300 + this.z);
    var displaySize = this.size * scale;
    var displayOpacity = this.opacity * scale * (1 + Math.sin(this.pulsePhase) * 0.3);

    // 金色光点渐变
    var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, displaySize * 3);
    gradient.addColorStop(0, `hsla(${this.hue}, 100%, 75%, ${displayOpacity})`);
    gradient.addColorStop(0.3, `hsla(${this.hue}, 100%, 65%, ${displayOpacity * 0.7})`);
    gradient.addColorStop(0.6, `hsla(${this.hue}, 100%, 55%, ${displayOpacity * 0.4})`);
    gradient.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, displaySize * 3, 0, Math.PI * 2);
    ctx.fill();
  };

  // 流动粒子类 - 更快速的光点
  function FlowParticle() {
    this.reset();
  }

  FlowParticle.prototype.reset = function() {
    this.x = Math.random() * width;
    this.y = -10;
    this.speedY = Math.random() * 2 + 1;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 1.5 + 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.hue = Math.random() * 20 + 40;
    this.trail = [];
    this.trailLength = 15;
  };

  FlowParticle.prototype.update = function() {
    // 添加轨迹点
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > this.trailLength) {
      this.trail.pop();
    }

    this.x += this.speedX;
    this.y += this.speedY;

    // 重置到顶部
    if (this.y > height + 10) {
      this.reset();
    }
  };

  FlowParticle.prototype.draw = function() {
    // 绘制拖尾
    for (var i = 0; i < this.trail.length; i++) {
      var trailOpacity = this.opacity * (1 - i / this.trail.length);
      var trailSize = this.size * (1 - i / this.trail.length * 0.5);
      
      var gradient = ctx.createRadialGradient(
        this.trail[i].x, this.trail[i].y, 0,
        this.trail[i].x, this.trail[i].y, trailSize * 2
      );
      gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${trailOpacity})`);
      gradient.addColorStop(1, `hsla(${this.hue}, 100%, 60%, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, trailSize * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // 星光粒子 - 闪烁效果
  function Star() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 1.5 + 0.3;
    this.opacity = Math.random();
    this.twinkleSpeed = Math.random() * 0.03 + 0.01;
    this.phase = Math.random() * Math.PI * 2;
    this.hue = Math.random() * 30 + 35;
  }

  Star.prototype.update = function() {
    this.phase += this.twinkleSpeed;
    this.opacity = (Math.sin(this.phase) + 1) / 2;
  };

  Star.prototype.draw = function() {
    var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
    gradient.addColorStop(0, `hsla(${this.hue}, 100%, 80%, ${this.opacity * 0.8})`);
    gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 70%, ${this.opacity * 0.4})`);
    gradient.addColorStop(1, `hsla(${this.hue}, 100%, 60%, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    ctx.fill();

    // 十字星芒
    if (this.opacity > 0.7) {
      ctx.strokeStyle = `hsla(${this.hue}, 100%, 80%, ${this.opacity * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 4, this.y);
      ctx.lineTo(this.x + this.size * 4, this.y);
      ctx.moveTo(this.x, this.y - this.size * 4);
      ctx.lineTo(this.x, this.y + this.size * 4);
      ctx.stroke();
    }
  };

  // 光波类
  function Wave() {
    this.x = width / 2;
    this.y = height / 2;
    this.radius = 0;
    this.maxRadius = Math.max(width, height);
    this.speed = Math.random() * 0.5 + 0.3;
    this.opacity = Math.random() * 0.3 + 0.2;
    this.hue = Math.random() * 20 + 40;
  }

  Wave.prototype.update = function() {
    this.radius += this.speed;
    this.opacity *= 0.99;
    
    if (this.radius > this.maxRadius || this.opacity < 0.01) {
      this.radius = 0;
      this.opacity = Math.random() * 0.3 + 0.2;
      // 随机位置
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }
  };

  Wave.prototype.draw = function() {
    ctx.strokeStyle = `hsla(${this.hue}, 100%, 60%, ${this.opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  };

  // 绘制连接线 - 增强版
  function connectParticles() {
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          // 3D深度影响透明度
          var avgZ = (particles[i].z + particles[j].z) / 2;
          var depthScale = 300 / (300 + avgZ);
          var opacity = (1 - distance / connectionDistance) * 0.4 * depthScale;
          
          // 渐变连接线
          var gradient = ctx.createLinearGradient(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          );
          gradient.addColorStop(0, `hsla(${particles[i].hue}, 100%, 65%, ${opacity})`);
          gradient.addColorStop(0.5, `hsla(${(particles[i].hue + particles[j].hue) / 2}, 100%, 70%, ${opacity * 1.2})`);
          gradient.addColorStop(1, `hsla(${particles[j].hue}, 100%, 65%, ${opacity})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  // 绘制背景渐变 - 更丰富的层次
  function drawBackground() {
    // 基础黑色背景
    var bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#000000');
    bgGradient.addColorStop(0.3, '#0d0d0d');
    bgGradient.addColorStop(0.6, '#0a0a0a');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 动态中央金色光晕
    var glowIntensity = Math.sin(time * 0.001) * 0.02 + 0.03;
    var centerGlow = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) * 0.6
    );
    centerGlow.addColorStop(0, `hsla(45, 100%, 50%, ${glowIntensity})`);
    centerGlow.addColorStop(0.3, `hsla(45, 100%, 50%, ${glowIntensity * 0.5})`);
    centerGlow.addColorStop(0.6, `hsla(45, 100%, 50%, ${glowIntensity * 0.2})`);
    centerGlow.addColorStop(1, 'hsla(45, 100%, 50%, 0)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);

    // 微妙的噪点纹理
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (var i = 0; i < 80; i++) {
      var x = Math.random() * width;
      var y = Math.random() * height;
      ctx.fillRect(x, y, 1, 1);
    }

    // 顶部金色渐变
    var topGradient = ctx.createLinearGradient(0, 0, 0, height * 0.3);
    topGradient.addColorStop(0, 'hsla(45, 100%, 50%, 0.01)');
    topGradient.addColorStop(1, 'hsla(45, 100%, 50%, 0)');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, width, height * 0.3);
  }

  // 动画循环
  function animate(currentTime) {
    if (!isAnimating) return;
    
    requestAnimationFrame(animate);
    
    // 帧率限制
    var deltaTime = currentTime - lastFrameTime;
    if (deltaTime < frameInterval) {
      return;
    }
    lastFrameTime = currentTime - (deltaTime % frameInterval);
    time = currentTime;

    // 绘制背景
    drawBackground();

    // 绘制光波（最底层）
    for (var i = 0; i < waves.length; i++) {
      waves[i].update();
      waves[i].draw();
    }

    // 绘制星光
    for (var i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }

    // 绘制主粒子
    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // 绘制连接线
    connectParticles();

    // 绘制流动粒子（最上层）
    for (var i = 0; i < flowParticles.length; i++) {
      flowParticles[i].update();
      flowParticles[i].draw();
    }

    // 鼠标光晕效果
    if (mouse.x != null && mouse.y != null) {
      var mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
      mouseGlow.addColorStop(0, 'hsla(45, 100%, 60%, 0.05)');
      mouseGlow.addColorStop(0.5, 'hsla(45, 100%, 55%, 0.02)');
      mouseGlow.addColorStop(1, 'hsla(45, 100%, 50%, 0)');
      ctx.fillStyle = mouseGlow;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // 初始化
  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'luxury-particles-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');
    resize();

    // 创建粒子
    for (var i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // 创建流动粒子
    for (var i = 0; i < flowParticleCount; i++) {
      flowParticles.push(new FlowParticle());
    }

    // 创建星光
    for (var i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    // 创建光波
    for (var i = 0; i < 3; i++) {
      waves.push(new Wave());
    }

    // 事件监听
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function(event) {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    window.addEventListener('mouseout', function() {
      mouse.x = null;
      mouse.y = null;
    });

    lastFrameTime = performance.now();
    requestAnimationFrame(animate);
  }

  // 调整画布大小
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  // 页面可见性检测
  function handleVisibilityChange() {
    if (document.hidden) {
      isAnimating = false;
    } else {
      isAnimating = true;
      lastFrameTime = performance.now();
      requestAnimationFrame(animate);
    }
  }

  // 启动（仅在landing页面）
  function checkAndInit() {
    const landingElement = document.querySelector('[data-page="landing"]');
    if (landingElement) {
      setTimeout(function() {
        init();
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInit);
  } else {
    checkAndInit();
  }
})();
