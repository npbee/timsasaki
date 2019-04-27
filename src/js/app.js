(function() {
  var header = document.getElementById("header");

  /**
   * Returns true if reduced motion is preferred
   */
  var reduceMotion = (function() {
    if (
      "matchMedia" in window &&
      window.matchMedia("(prefers-reduced-motion)").matches
    ) {
      return true;
    }
    return false;
  })();

  /**
   * Applies the `shadow` class to the header when scrolling
   */
  function headerShadow() {
    var lastScrollY = 0;
    var ticking = false;
    var hasScrolled = window.scrollY > 0;

    var update = function() {
      ticking = false;

      if (lastScrollY > 0) {
        if (hasScrolled === false) {
          hasScrolled = true;
          header.classList.add("shadow");
        }
      } else {
        hasScrolled = false;
        header.classList.remove("shadow");
      }
    };

    var requestTick = function() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    var onScroll = function() {
      lastScrollY = window.scrollY;
      requestTick();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function getDestinationOffset(destination) {
    var documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    var windowHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.getElementsByTagName("body")[0].clientHeight;
    var destinationOffset =
      typeof destination === "number" ? destination : destination.offsetTop;
    return Math.round(
      documentHeight - destinationOffset < windowHeight
        ? documentHeight - windowHeight
        : destinationOffset
    );
  }

  /**
   * Smooth scroll to anchors
   */
  function scrollIt(destination, callback) {
    var duration = 300;
    var easing = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    var start = window.pageYOffset;
    var startTime =
      "now" in window.performance ? performance.now() : Date.now();
    var destinationOffsetToScroll = getDestinationOffset(destination);

    if ("requestAnimationFrame" in window === false) {
      window.scroll(0, destinationOffsetToScroll);
      if (callback) callback();
      return;
    }

    function scroll() {
      var now = "now" in window.performance ? performance.now() : Date.now();
      var time = Math.min(1, (now - startTime) / duration);
      var timeFunction = easing(time);
      window.scroll(
        0,
        Math.ceil(timeFunction * (destinationOffsetToScroll - start) + start)
      );

      if (window.pageYOffset === destinationOffsetToScroll) {
        if (callback) {
          callback();
        }
        return;
      }

      requestAnimationFrame(scroll);
    }
    scroll();
  }

  function setHistory(anchor) {
    if (!history.pushState) return;

    history.pushState({ anchor: anchor }, document.title, "#" + anchor);
  }

  function scrollUntilReached(target, attempts) {
    attempts = attempts || 0;

    if (attempts >= 3) return;

    scrollIt(target, function() {
      var destinationOffsetToScroll = getDestinationOffset(target);
      var diff = Math.abs(window.pageYOffset - destinationOffsetToScroll);

      if (diff >= 10) {
        setTimeout(function() {
          scrollUntilReached(target, attempts + 1);
        }, 300);
      }
    });
  }

  /**
   * Listens for click on the nav elements and smooth-scrolls to the anchor
   * elements
   */
  function nav() {
    var nav = document.getElementById("nav");

    nav.addEventListener("click", function(event) {
      if (event.target.nodeName === "A" && !reduceMotion) {
        event.preventDefault();
        var clickTarget = event.target;
        var href = clickTarget.getAttribute("href").slice(1);
        var target = document.getElementById(href);
        scrollUntilReached(target);
        setHistory(href);
      }
    });

    window.addEventListener("popstate", function(event) {
      if (history.state == null) return;
      if (!history.state.anchor) return;
      var target = document.getElementById(history.state.anchor);

      if (target) {
        event.preventDefault();
        scrollIt(target);
      }
    });
  }

  nav();
  headerShadow();

  document.addEventListener("DOMContentLoaded", function() {
    var hash = window.location.hash;

    if (hash) {
      setTimeout(function() {
        scrollUntilReached(document.getElementById(hash.slice(1)));
      }, 300);
    }
  });
})();
