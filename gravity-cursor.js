document.addEventListener("DOMContentLoaded", function() {
  var body = document.querySelector("body");
  var currentlyOrbiting = null;
  var orbitTransforms = {x: 0,y: 0};
  var pullDistance = 0;
  var cursorSize = 25;

  // Add cursor element
  var cursor = document.createElement("span");
  cursor.classList.add("gravity-cursor");
  body.appendChild(cursor);

  // Get elements with gravity.
  var getGravitationals = function() {
    return Array.from(document.querySelectorAll('.has-gravity')).map(el => {
      var bounding = el.getBoundingClientRect();
      return {
        node: el,
        bounding: el.getBoundingClientRect(),
        pullBounding: {
          top: bounding.top - pullDistance - cursorSize,
          bottom: bounding.bottom + pullDistance,
          left: bounding.left - pullDistance - cursorSize,
          right: bounding.right + pullDistance
        }
      }
    })
  }
  
  // Get all elements with gravity
  var gravitationals = getGravitationals();
  
  // When the window is scrolled updated gravitationals
  document.addEventListener("scroll", function() {
    gravitationals = getGravitationals();
  });

  // Keep track of if we have checked the cursor position yet.
  var gravityActivated = false;

  // Listen for mouse moves
  var lastMove = 0;
  document.addEventListener("mousemove", function(event) {
    if (Date.now() - lastMove < 10) {
      return;
    }

    lastMove = Date.now();

    if (!gravityActivated) {
      body.classList.add('gravity-activated');
      gravityActivated = true;
    }

    var cursorX = event.clientX - (cursor.offsetWidth / 2);
    var cursorY = event.clientY - (cursor.offsetHeight / 2);
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    var hasOrbit = false;
    var transformRules;

    // Check if we are in the gravitational pull of any elements
    for (var i = 0; i < gravitationals.length; i++) {
      var pullBounding = gravitationals[i].pullBounding;
      if (pullBounding.top <= cursorY && pullBounding.bottom >= cursorY && pullBounding.left <= cursorX && pullBounding.right >= cursorX) {
        currentlyOrbiting = gravitationals[i].node;

        // Calculate transforms
        var width = gravitationals[i].bounding.width + (2*pullDistance);
        var height = gravitationals[i].bounding.height + (2*pullDistance);
        var center = {x: pullBounding.right - (width/2), y: pullBounding.bottom - (height/2 + cursorSize/2)};

        if (!currentlyOrbiting.style.transform || currentlyOrbiting.classList.contains('been-awhile')) {
          perfectOrbitTransforms = {
            x: ((cursorX-center.x)/width)*2,
            y: ((cursorY-center.y)/height)*10 // Have more of an effect in the y direciton
          }
          if (currentlyOrbiting.style.transform) {
            // Lets bias the current ones to create smooth movements
            orbitTransforms = {
              x: (orbitTransforms.x * 9 + perfectOrbitTransforms.x * 1) / 10,
              y: (orbitTransforms.y * 9 + perfectOrbitTransforms.y * 1) / 10
            }
          } else {
            orbitTransforms = perfectOrbitTransforms;
          }

          transformRules = `translate(${orbitTransforms.x}%, ${orbitTransforms.y}%) scale(1.07)`;
        }

        hasOrbit = true;
      }
    }

    // Adjust classes as needed.
    if (!hasOrbit && currentlyOrbiting != null) {
      currentlyOrbiting.classList.remove('currently-orbitting');
      currentlyOrbiting.classList.remove('been-awhile');
      currentlyOrbiting.style.transform = '';
      currentlyOrbiting.blur();
      currentlyOrbiting = null;
    }

    if (hasOrbit && !body.classList.contains('orbitting')) {
      body.classList.add('orbitting');
    }

    if (!hasOrbit && body.classList.contains('orbitting')) {
      body.classList.remove('orbitting');
    }

    if (currentlyOrbiting != null && !currentlyOrbiting.classList.contains('currently-orbitting')) {
      currentlyOrbiting.classList.add('currently-orbitting');
      var timeout = setTimeout(function() {
        if (currentlyOrbiting != null) {
          currentlyOrbiting.classList.add('been-awhile');
        }
      }, 300);
      currentlyOrbiting.addEventListener('mouseleave', function() {
        clearTimeout(timeout);
      });
    }

    if (currentlyOrbiting != null) {
      currentlyOrbiting.style.transform = transformRules;
      currentlyOrbiting.focus();
    }
  });
  
  // Signal loaded
  body.classList.add("gravity-loaded");
});