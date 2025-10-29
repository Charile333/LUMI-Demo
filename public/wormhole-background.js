// Wormhole Background - 金色虫洞效果
// Based on CodePen by Antoine Wodniack (MIT License)
// Modified for LUMI with golden color scheme

(function() {
  // Easing functions (替代 easing-utils)
  const easingFunctions = {
    linear: (t) => t,
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10)
  };

  class WormholeBackground {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.render = {};
      this.discs = [];
      this.dots = [];
      this.startDisc = {};
      this.isAnimating = true;
      this.animationId = null;
    }

    /**
     * 初始化
     */
    init() {
      // 创建canvas
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'wormhole-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '1';
      this.canvas.style.pointerEvents = 'none';
      document.body.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d');

      // 初始化尺寸
      this.setSizes();

      // 绑定事件
      this.bindEvents();

      // 开始动画
      this.tick();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
      window.addEventListener('resize', () => this.onResize());
    }

    /**
     * 窗口调整处理
     */
    onResize() {
      this.setSizes();
    }

    /**
     * 设置尺寸
     */
    setSizes() {
      this.setCanvasSize();
      this.setGraphics();
    }

    /**
     * 设置canvas尺寸
     */
    setCanvasSize() {
      const rect = this.canvas.getBoundingClientRect();

      this.render = {
        width: rect.width,
        hWidth: rect.width * 0.5,
        height: rect.height,
        hHeight: rect.height * 0.5,
        dpi: window.devicePixelRatio || 1
      };

      this.canvas.width = this.render.width * this.render.dpi;
      this.canvas.height = this.render.height * this.render.dpi;
    }

    /**
     * 设置图形
     */
    setGraphics() {
      this.setDiscs();
      this.setDots();
    }

    /**
     * 设置圆盘
     */
    setDiscs() {
      this.discs = [];

      this.startDisc = {
        x: this.render.width * 0.5,
        y: this.render.height * 0,
        w: this.render.width * 1,
        h: this.render.height * 1
      };

      const totalDiscs = 150;

      for (let i = 0; i < totalDiscs; i++) {
        const p = i / totalDiscs;
        const disc = this.tweenDisc({ p });
        this.discs.push(disc);
      }
    }

    /**
     * 设置点
     */
    setDots() {
      this.dots = [];

      const totalDots = 20000;

      for (let i = 0; i < totalDots; i++) {
        const disc = this.discs[Math.floor(this.discs.length * Math.random())];
        
        // 金色色调 - 黄色到琥珀色范围
        const r = 200 + Math.random() * 55; // 200-255
        const g = 150 + Math.random() * 50; // 150-200
        const b = Math.random() * 50;       // 0-50
        
        const dot = {
          d: disc,
          a: 0,
          c: `rgb(${r}, ${g}, ${b})`,
          p: Math.random(),
          o: Math.random()
        };

        this.dots.push(dot);
      }
    }

    /**
     * 补间圆盘
     */
    tweenDisc(disc) {
      const { startDisc } = this;

      const scaleX = this.tweenValue(1, 0, disc.p, 'easeOutCubic');
      const scaleY = this.tweenValue(1, 0, disc.p, 'easeOutExpo');

      disc.sx = scaleX;
      disc.sy = scaleY;

      disc.w = startDisc.w * scaleX;
      disc.h = startDisc.h * scaleY;

      disc.x = startDisc.x;
      disc.y = startDisc.y + disc.p * startDisc.h * 1;

      return disc;
    }

    /**
     * 补间值
     */
    tweenValue(start, end, p, ease = 'linear') {
      const delta = end - start;
      const easeFn = easingFunctions[ease] || easingFunctions.linear;
      return start + delta * easeFn(p);
    }

    /**
     * 绘制圆盘
     */
    drawDiscs() {
      const { ctx } = this;

      // 金色描边
      ctx.strokeStyle = 'rgba(218, 165, 32, 0.15)'; // 金色，半透明
      ctx.lineWidth = 1;

      this.discs.forEach((disc) => {
        ctx.beginPath();
        ctx.globalAlpha = disc.a;

        ctx.ellipse(
          disc.x,
          disc.y + disc.h,
          disc.w,
          disc.h,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.closePath();
      });
    }

    /**
     * 绘制点
     */
    drawDots() {
      const { ctx } = this;

      this.dots.forEach((dot) => {
        const { d, a, p, c, o } = dot;
        
        const _p = d.sx * d.sy;
        ctx.fillStyle = c;

        const newA = a + (Math.PI * 2 * p);
        const x = d.x + Math.cos(newA) * d.w;
        const y = d.y + Math.sin(newA) * d.h;

        ctx.globalAlpha = d.a * o;

        ctx.beginPath();
        ctx.arc(x, y + d.h, 1 + _p * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      });
    }

    /**
     * 移动圆盘
     */
    moveDiscs() {
      this.discs.forEach((disc) => {
        disc.p = (disc.p + 0.0003) % 1;
        
        this.tweenDisc(disc);
        
        const p = disc.sx * disc.sy;

        let a = 1;
        if (p < 0.01) {
          a = Math.pow(Math.min(p / 0.01, 1), 3);
        } else if (p > 0.2) {
          a = 1 - Math.min((p - 0.2) / 0.8, 1);
        }
        
        disc.a = a;
      });
    }

    /**
     * 移动点
     */
    moveDots() {
      this.dots.forEach((dot) => {
        const v = this.tweenValue(0, 0.001, 1 - dot.d.sx * dot.d.sy, 'easeInExpo');
        dot.p = (dot.p + v) % 1;
      });
    }

    /**
     * 动画循环
     */
    tick() {
      if (!this.isAnimating) return;

      const { ctx } = this;

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.save();
      ctx.scale(this.render.dpi, this.render.dpi);

      // 移动
      this.moveDiscs();
      this.moveDots();

      // 绘制
      this.drawDiscs();
      this.drawDots();

      ctx.restore();

      this.animationId = requestAnimationFrame(() => this.tick());
    }

    /**
     * 停止动画
     */
    stop() {
      this.isAnimating = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }

    /**
     * 销毁
     */
    destroy() {
      this.stop();
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  // 页面可见性检测
  function handleVisibilityChange(wormhole) {
    if (document.hidden) {
      wormhole.stop();
    } else {
      wormhole.isAnimating = true;
      wormhole.tick();
    }
  }

  // 启动（仅在landing页面）
  function checkAndInit() {
    const landingElement = document.querySelector('[data-page="landing"]');
    if (landingElement) {
      setTimeout(function() {
        const wormhole = new WormholeBackground();
        wormhole.init();
        
        document.addEventListener('visibilitychange', () => handleVisibilityChange(wormhole));
        
        // 存储实例以便后续使用
        window.wormholeBackground = wormhole;
      }, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInit);
  } else {
    checkAndInit();
  }
})();

