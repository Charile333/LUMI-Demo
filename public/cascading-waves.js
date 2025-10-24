// Cascading Waves Animation
// Adapted for standalone use without external dependencies

(function() {
  // SimplexNoise implementation (embedded)
  var SimplexNoise = function() {
    var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    var F3 = 1.0 / 3.0;
    var G3 = 1.0 / 6.0;
    var grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
                 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
                 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    var p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    var perm = new Array(512);
    var gradP = new Array(512);
    
    this.seed = function(seed) {
      if(seed > 0 && seed < 1) {
        seed *= 65536;
      }
      seed = Math.floor(seed);
      if(seed < 256) {
        seed |= seed << 8;
      }
      for(var i = 0; i < 256; i++) {
        var v;
        if (i & 1) {
          v = p[i] ^ (seed & 255);
        } else {
          v = p[i] ^ ((seed>>8) & 255);
        }
        perm[i] = perm[i + 256] = v;
        gradP[i] = gradP[i + 256] = grad3[v % 12];
      }
    };
    
    this.seed(0);
    
    var dot = function(g, x, y) {
      return g[0]*x + g[1]*y;
    };
    
    this.noise2D = function(xin, yin) {
      var n0, n1, n2;
      var s = (xin+yin)*F2;
      var i = Math.floor(xin+s);
      var j = Math.floor(yin+s);
      var t = (i+j)*G2;
      var x0 = xin-i+t;
      var y0 = yin-j+t;
      var i1, j1;
      if(x0>y0) {i1=1; j1=0;}
      else {i1=0; j1=1;}
      var x1 = x0 - i1 + G2;
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1 + 2 * G2;
      var y2 = y0 - 1 + 2 * G2;
      i &= 255;
      j &= 255;
      var gi0 = gradP[i+perm[j]];
      var gi1 = gradP[i+i1+perm[j+j1]];
      var gi2 = gradP[i+1+perm[j+1]];
      var t0 = 0.5 - x0*x0-y0*y0;
      if(t0<0) {
        n0 = 0;
      } else {
        t0 *= t0;
        n0 = t0 * t0 * dot(gi0, x0, y0);
      }
      var t1 = 0.5 - x1*x1-y1*y1;
      if(t1<0) {
        n1 = 0;
      } else {
        t1 *= t1;
        n1 = t1 * t1 * dot(gi1, x1, y1);
      }
      var t2 = 0.5 - x2*x2-y2*y2;
      if(t2<0) {
        n2 = 0;
      } else {
        t2 *= t2;
        n2 = t2 * t2 * dot(gi2, x2, y2);
      }
      return 70 * (n0 + n1 + n2);
    };
    
    this.noise3D = function(xin, yin, zin) {
      var n0, n1, n2, n3;
      var s = (xin+yin+zin)*F3;
      var i = Math.floor(xin+s);
      var j = Math.floor(yin+s);
      var k = Math.floor(zin+s);
      var t = (i+j+k)*G3;
      var x0 = xin-i+t;
      var y0 = yin-j+t;
      var z0 = zin-k+t;
      var i1, j1, k1;
      var i2, j2, k2;
      if(x0>=y0) {
        if(y0>=z0) {i1=1; j1=0; k1=0; i2=1; j2=1; k2=0;}
        else if(x0>=z0) {i1=1; j1=0; k1=0; i2=1; j2=0; k2=1;}
        else {i1=0; j1=0; k1=1; i2=1; j2=0; k2=1;}
      } else {
        if(y0<z0) {i1=0; j1=0; k1=1; i2=0; j2=1; k2=1;}
        else if(x0<z0) {i1=0; j1=1; k1=0; i2=0; j2=1; k2=1;}
        else {i1=0; j1=1; k1=0; i2=1; j2=1; k2=0;}
      }
      var x1 = x0 - i1 + G3;
      var y1 = y0 - j1 + G3;
      var z1 = z0 - k1 + G3;
      var x2 = x0 - i2 + 2*G3;
      var y2 = y0 - j2 + 2*G3;
      var z2 = z0 - k2 + 2*G3;
      var x3 = x0 - 1 + 3*G3;
      var y3 = y0 - 1 + 3*G3;
      var z3 = z0 - 1 + 3*G3;
      i &= 255;
      j &= 255;
      k &= 255;
      var gi0 = gradP[i+  perm[j+  perm[k  ]]];
      var gi1 = gradP[i+i1+perm[j+j1+perm[k+k1]]];
      var gi2 = gradP[i+i2+perm[j+j2+perm[k+k2]]];
      var gi3 = gradP[i+ 1+perm[j+ 1+perm[k+ 1]]];
      var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
      if(t0<0) {
        n0 = 0;
      } else {
        t0 *= t0;
        n0 = t0 * t0 * (gi0[0]*x0 + gi0[1]*y0 + gi0[2]*z0);
      }
      var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
      if(t1<0) {
        n1 = 0;
      } else {
        t1 *= t1;
        n1 = t1 * t1 * (gi1[0]*x1 + gi1[1]*y1 + gi1[2]*z1);
      }
      var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
      if(t2<0) {
        n2 = 0;
      } else {
        t2 *= t2;
        n2 = t2 * t2 * (gi2[0]*x2 + gi2[1]*y2 + gi2[2]*z2);
      }
      var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
      if(t3<0) {
        n3 = 0;
      } else {
        t3 *= t3;
        n3 = t3 * t3 * (gi3[0]*x3 + gi3[1]*y3 + gi3[2]*z3);
      }
      return 32 * (n0 + n1 + n2 + n3);
    };
  };

  // Canvas setup
  var canvas, ctx;
  var width, height, width_half, height_half;
  var noise = new SimplexNoise();
  var TAU = Math.PI * 2;
  var ZERO = 0, THIRD = 1/3, TWO_THIRDS = 2/3, ONE = 1;

  // Helper functions
  function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }

  function cos(angle) {
    return Math.cos(angle);
  }

  function floor(n) {
    return Math.floor(n);
  }

  function hsl(h, s, l, a) {
    a = a !== undefined ? a : 1;
    return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
  }

  function background(color) {
    ctx.fillStyle = color;
    ctx.fillRect(-width_half, -height_half, width, height);
  }

  function beginPath() {
    ctx.beginPath();
  }

  function moveTo(x, y) {
    ctx.moveTo(x, y);
  }

  function lineTo(x, y) {
    ctx.lineTo(x, y);
  }

  function stroke(color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 1;
    ctx.stroke();
  }

  function compositeOperation(op) {
    ctx.globalCompositeOperation = op;
  }

  var compOper = {
    lighter: 'lighter'
  };

  // Animation function
  function draw(e) {
    // 先清除画布，防止白光累积
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000000';
    ctx.fillRect(-width_half, -height_half, width, height);
    
    let xCount = 40;
    let yCount = 60;
    let iXCount = 1 / (xCount - 1);
    let iYCount = 1 / (yCount - 1);
    let time = e * 0.0003;  // 减慢速度 (原来是 0.001)
    let timeStep = 0.003;   // 减慢波动 (原来是 0.01)
    let grad = ctx.createLinearGradient(-width, 0, width, height);
    let t = time % 1;
    let tSide = floor(time % 2) === 0;
    let hueA = tSide ? 340 : 210;
    let hueB = !tSide ? 340 : 210;
    // 恢复原始鲜艳颜色
    let colorA = hsl(hueA, 100, 50);
    let colorB = hsl(hueB, 100, 50);
    grad.addColorStop(map(t, 0, 1, THIRD, ZERO), colorA);
    grad.addColorStop(map(t, 0, 1, TWO_THIRDS, THIRD), colorB);
    grad.addColorStop(map(t, 0, 1, ONE, TWO_THIRDS), colorA);
    // 降低亮度
    ctx.globalAlpha = map(cos(time), -1, 1, 0.05, 0.12);  // 降低透明度范围 (原来是 0.15, 0.3)
    background(grad);
    ctx.globalAlpha = 1;
    beginPath();
    for (let j = 0; j < yCount; j++) {
      let tj = j * iYCount;
      let c = cos(tj * TAU + time) * 0.1;
      for (let i = 0; i < xCount; i++) {
        let t = i * iXCount;
        let n = noise.noise3D(t, time, c);
        let y = n * height_half;
        let x = t * (width + 20) - width_half - 10;
        (i ? lineTo : moveTo)(x, y);
      }
      time += timeStep;
    }
    // 增加模糊效果，降低线条亮度
    compositeOperation(compOper.lighter);
    ctx.filter = 'blur(15px)';  // 增加模糊 (原来是 10px)
    stroke(grad, 5);
    ctx.filter = 'none';
    stroke(hsl(0, 0, 100, 0.4), 2);  // 降低线条亮度 (原来是 0.8)
  }

  // Initialize
  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'cascading-waves-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');
    resize();
    
    window.addEventListener('resize', resize);
    animate();
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    width_half = width / 2;
    height_half = height / 2;
    canvas.width = width;
    canvas.height = height;
    // Reset transform and translate to center
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(width_half, height_half);
  }

  function animate() {
    draw(performance.now());
    requestAnimationFrame(animate);
  }

  // Start when DOM is ready - but only on landing page
  function checkAndInit() {
    // 检查是否在landing页面
    const landingElement = document.querySelector('[data-page="landing"]');
    if (landingElement) {
      init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInit);
  } else {
    checkAndInit();
  }
})();

