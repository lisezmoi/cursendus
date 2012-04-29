(function(window){

  var DEFAULT_SETTINGS = {
    position: Vector.create(150, 290),
    positionRandom: Vector.create(0, 30),
    size: 45,
    sizeRandom: 30,
    speed: 10,
    speedRandom: 1,
    lifeSpan: 32,
    lifeSpanRandom: 9,
    angle: 90,
    angleRandom: 10,
    gravity: Vector.create( -.05, -1 ),
    startColour: [ 230, 20, 200, 1 ],
    startColourRandom: [ 0, 240, 70, .2 ],
    endColour: [ 35, 0, 95, 0 ],
    endColourRandom: [ 0, 0, 0, .2 ],
    sharpness: 15,
    sharpnessRandom: 30
  };


  window.mkParticles = function(canvas, fps, settings) {
    var context = canvas.getContext('2d'),
        particles = new cParticleSystem();

    context.globalCompositeOperation = "lighter"; //"source-over", "lighter", "darker", "xor"  are good

    settings = _.extend({}, DEFAULT_SETTINGS, settings);
    _.each(settings, function(value, key) {
      particles[key] = value;
    });

    particles.init();

    (function loop() {
      window.setTimeout(function(){
        window.requestAnimationFrame(loop);

        particles.update(1);
        context.clearRect(0, 0, canvas.width, canvas.height);
        particles.render(context);

      }, 1000 / fps);
    })();
  };
})(this);
