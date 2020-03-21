document.addEventListener("DOMContentLoaded", function() {
  var body = document.querySelector("body");

  var current = -1;
  var prev = -1;

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
    // Limit number of updates.
    if (Date.now() - lastMove < 10) return;
    lastMove = Date.now();

    // Mark our first update
    if (!gravityActivated) {
      body.classList.add('gravity-activated');
      gravityActivated = true;
    }

    // Position the cursor
    var cursorX = event.clientX - (cursor.offsetWidth / 2);
    var cursorY = event.clientY - (cursor.offsetHeight / 2);
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    // Keep track of whether we are in orbit
    var isInOrbit = false;

    // Check if we should be orbitting any elements
    for (var i = 0; i < gravitationals.length; i++) {
      var pullBounding = gravitationals[i].pullBounding;
      if (pullBounding.top <= cursorY && pullBounding.bottom >= cursorY && pullBounding.left <= cursorX && pullBounding.right >= cursorX) {
        // In orbit
        isInOrbit = true;

        // New current, keep track of the prev as well
        if (i !== current) {
          prev = current;
          current = i;
          setTimeout(function() {
            element.classList.add('been-awhile');
          }, 300);
        }

        var element = gravitationals[current].node;

        // If we are transforming, and we haven't been here for a while just wait.
        if (element.style.transform && !element.classList.contains('been-awhile')) {
          break;
        }

        // Calculate transforms
        var width = gravitationals[i].bounding.width + (2*pullDistance);
        var height = gravitationals[i].bounding.height + (2*pullDistance);
        var center = {x: pullBounding.right - (width/2), y: pullBounding.bottom - (height/2 + cursorSize/2)};

        perfectOrbitTransforms = {
          x: ((cursorX-center.x)/width)*3,
          y: (cursorY-center.y)/height*7
        }

        if (element.style.transform) {
          // Lets bias the current ones to create smooth movements
          orbitTransforms = {
            x: (orbitTransforms.x * 9 + perfectOrbitTransforms.x * 1) / 10,
            y: (orbitTransforms.y * 9 + perfectOrbitTransforms.y * 1) / 10
          }
        } else {
          orbitTransforms = perfectOrbitTransforms;
        }

        element.style.transform = `translate(${orbitTransforms.x}%, ${orbitTransforms.y}%) scale(1.07)`;

        if (!element.classList.contains('currently-orbitting')) {
          element.classList.add('currently-orbitting');
        }

        // Don't bother looking anymore
        break;
      }
    }

    if (!isInOrbit && current !== -1) {
      prev = current;
      current = -1;
    }
    
    // Remove things from previously orbitted element.
    if (prev !== -1) {
      var prevElement = gravitationals[prev].node;
      if (prevElement != null && (prevElement.classList.contains('currently-orbitting') || prevElement.classList.contains('been-awhile'))) {
        prevElement.classList.remove('currently-orbitting');
        prevElement.classList.remove('been-awhile');
        prevElement.style.transform = '';
      }
    }

    if (isInOrbit && !body.classList.contains('orbitting')) {
      body.classList.add('orbitting');
    }

    if (!isInOrbit && body.classList.contains('orbitting')) {
      body.classList.remove('orbitting');
    }
  });
  
  // Signal loaded
  body.classList.add("gravity-loaded");
});