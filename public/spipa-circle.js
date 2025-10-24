/**
 * @author Alex Andrix <alex@alexandrix.com>
 * @since 2018-12-02
 * Modified to remove lodash dependency
 */

var App = {};
App.setup = function() {
  var canvas = document.createElement('canvas');
  this.filename = "spipa";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'none';
  this.canvas = canvas;
  document.getElementsByTagName('body')[0].appendChild(canvas);
  this.ctx = this.canvas.getContext('2d');
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.dataToImageRatio = 1;
  this.ctx.imageSmoothingEnabled = false;
  this.ctx.webkitImageSmoothingEnabled = false;
  this.ctx.msImageSmoothingEnabled = false;
  this.xC = this.width / 2;
  this.yC = this.height / 2;
  
  this.stepCount = 0;
  this.particles = [];
  this.lifespan = 1000;
  this.popPerBirth = 1;
  this.maxPop = 300;
  this.birthFreq = 2;

  // Build grid
  this.gridSize = 8;// Motion coords
  this.gridSteps = Math.floor(1000 / this.gridSize);
  this.grid = [];
  var i = 0;
  for (var xx = -500; xx < 500; xx += this.gridSize) {
    for (var yy = -500; yy < 500; yy += this.gridSize) {
      // Radial field, triangular function of r with max around r0
      var r = Math.sqrt(xx*xx+yy*yy),
          r0 = 100,
          field;
      
      if (r < r0) field = 255 / r0 * r;
      else if (r > r0) field = 255 - Math.min(255, (r - r0)/2);
      
      this.grid.push({
        x: xx,
        y: yy,
        busyAge: 0,
        spotIndex: i,
        isEdge: (xx == -500 ? 'left' : 
                 (xx == (-500 + this.gridSize * (this.gridSteps-1)) ? 'right' : 
                  (yy == -500 ? 'top' : 
                   (yy == (-500 + this.gridSize *(this.gridSteps-1)) ? 'bottom' : 
                    false
                   )
                  )
                 )
                ),
        field: field
      });
      i++;
    }
  }
  this.gridMaxIndex = i;
  
  // Counters for UI
  this.drawnInLastFrame = 0;
  this.deathCount = 0;
  
  this.initDraw();
};

App.evolve = function() {
  this.stepCount++;
  
  // Increment all grid ages
  this.grid.forEach(function(e) {
    if (e.busyAge > 0) e.busyAge++;
  });
  
  if (this.stepCount % this.birthFreq == 0 && (this.particles.length + this.popPerBirth) < this.maxPop) {
    this.birth();
  }
  App.move();
  App.draw();
};

App.birth = function() {
  var x, y;
  var gridSpotIndex = Math.floor(Math.random() * this.gridMaxIndex),
      gridSpot = this.grid[gridSpotIndex],
      x = gridSpot.x, y = gridSpot.y;
  
  var particle = {
    hue: 200,
    sat: 95,
    lum: 20 + Math.floor(40*Math.random()),
    x: x, y: y,
    xLast: x, yLast: y,
    xSpeed: 0, ySpeed: 0,
    age: 0,
    ageSinceStuck: 0,
    attractor: {
      oldIndex: gridSpotIndex,
      gridSpotIndex: gridSpotIndex,
    },
    name: 'seed-' + Math.ceil(10000000 * Math.random())
  };
  this.particles.push(particle);
};

App.kill = function(particleName) {
  // Replace lodash _.reject with native filter
  this.particles = this.particles.filter(function(seed) {
    return seed.name !== particleName;
  });
};

App.move = function() {
  for (var i = 0; i < this.particles.length; i++) {
    var p = this.particles[i];
    
    p.xLast = p.x; p.yLast = p.y;
    
    var index = p.attractor.gridSpotIndex,
        gridSpot = this.grid[index];
    
    if (Math.random() < 0.5) {
      if (!gridSpot.isEdge) {
        var topIndex = index - 1,
            bottomIndex = index + 1,
            leftIndex = index - this.gridSteps,
            rightIndex = index + this.gridSteps,
            topSpot = this.grid[topIndex],
            bottomSpot = this.grid[bottomIndex],
            leftSpot = this.grid[leftIndex],
            rightSpot = this.grid[rightIndex];
        
        // Replace lodash _.maxBy with native reduce
        var chaos = 30;
        var spots = [topSpot, bottomSpot, leftSpot, rightSpot];
        var maxFieldSpot = spots.reduce(function(max, e) {
          var value = e.field + chaos * Math.random();
          var maxValue = max.field + chaos * Math.random();
          return value > maxValue ? e : max;
        });
        
        var potentialNewGridSpot = maxFieldSpot;
        if (potentialNewGridSpot.busyAge == 0 || potentialNewGridSpot.busyAge > 15) {
          p.ageSinceStuck = 0;
          p.attractor.oldIndex = index;
          p.attractor.gridSpotIndex = potentialNewGridSpot.spotIndex;
          gridSpot = potentialNewGridSpot;
          gridSpot.busyAge = 1;
        } else p.ageSinceStuck++;
        
      } else p.ageSinceStuck++;
      
      if (p.ageSinceStuck == 10) this.kill(p.name);
    }
    
    var k = 8, visc = 0.4;
    var dx = p.x - gridSpot.x,
        dy = p.y - gridSpot.y,
        dist = Math.sqrt(dx*dx + dy*dy);
    
    var xAcc = -k * dx,
        yAcc = -k * dy;
    
    p.xSpeed += xAcc; p.ySpeed += yAcc;
    
    p.xSpeed *= visc; p.ySpeed *= visc;
    
    p.speed = Math.sqrt(p.xSpeed * p.xSpeed + p.ySpeed * p.ySpeed);
    p.dist = dist;
    
    p.x += 0.1 * p.xSpeed; p.y += 0.1 * p.ySpeed;
    
    p.age++;
    
    if (p.age > this.lifespan) {
      this.kill(p.name);
      this.deathCount++;
    }
  }
};

App.initDraw = function() {
  this.ctx.beginPath();
  this.ctx.rect(0, 0, this.width, this.height);
  this.ctx.fillStyle = 'black';
  this.ctx.fill();
  this.ctx.closePath();
};

App.draw = function() {
  this.drawnInLastFrame = 0;
  if (!this.particles.length) return false;
  
  this.ctx.beginPath();
  this.ctx.rect(0, 0, this.width, this.height);
  this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  this.ctx.fill();
  this.ctx.closePath();
  
  for (var i = 0; i < this.particles.length; i++) {
    var p = this.particles[i];
    
    var h, s, l, a;
    
    h = p.hue + this.stepCount/30;
    s = p.sat;
    l = p.lum;
    a = 1;
    
    var last = this.dataXYtoCanvasXY(p.xLast, p.yLast),
        now = this.dataXYtoCanvasXY(p.x, p.y);
    var attracSpot = this.grid[p.attractor.gridSpotIndex],
        attracXY = this.dataXYtoCanvasXY(attracSpot.x, attracSpot.y);
    var oldAttracSpot = this.grid[p.attractor.oldIndex],
        oldAttracXY = this.dataXYtoCanvasXY(oldAttracSpot.x, oldAttracSpot.y);
    
    this.ctx.beginPath();
    
    this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
    this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
    
    this.ctx.moveTo(last.x, last.y);
    this.ctx.lineTo(now.x, now.y);
    
    this.ctx.lineWidth = 1.5 * this.dataToImageRatio;
    this.ctx.stroke();
    this.ctx.closePath();
    
    this.ctx.beginPath();
    this.ctx.lineWidth = 1.5 * this.dataToImageRatio;
    this.ctx.moveTo(oldAttracXY.x, oldAttracXY.y);
    this.ctx.lineTo(attracXY.x, attracXY.y);
    this.ctx.arc(attracXY.x, attracXY.y, 1.5 * this.dataToImageRatio, 0, 2 * Math.PI, false);
    
    this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
    this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
    this.ctx.stroke();
    this.ctx.fill();
    
    this.ctx.closePath();
    
    this.drawnInLastFrame++;
  }
};

App.dataXYtoCanvasXY = function(x, y) {
  var zoom = 1.6;
  var xx = this.xC + x * zoom * this.dataToImageRatio,
      yy = this.yC + y * zoom * this.dataToImageRatio;
  
  return {x: xx, y: yy};
};

// Handle window resize
window.addEventListener('resize', function() {
  if (App.canvas) {
    App.canvas.width = window.innerWidth;
    App.canvas.height = window.innerHeight;
    App.width = App.canvas.width;
    App.height = App.canvas.height;
    App.xC = App.width / 2;
    App.yC = App.height / 2;
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    App.setup();
    App.draw();
    
    var frame = function() {
      App.evolve();
      requestAnimationFrame(frame);
    };
    frame();
  });
} else {
  // DOM is already ready
  App.setup();
  App.draw();
  
  var frame = function() {
    App.evolve();
    requestAnimationFrame(frame);
  };
  frame();
}
