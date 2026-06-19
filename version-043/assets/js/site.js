(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-menu]");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dot", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function setupFilters() {
    selectAll("[data-filter-form]").forEach(function (form) {
      var target = form.getAttribute("data-filter-target") || "[data-movie-card]";
      var scopeSelector = form.getAttribute("data-filter-scope");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      var cards = selectAll(target, scope || document);

      function currentValue(name) {
        var input = form.querySelector("[name='" + name + "']");
        return input ? input.value.trim().toLowerCase() : "";
      }

      function apply() {
        var keyword = currentValue("q");
        var year = currentValue("year");
        var type = currentValue("type");
        var region = currentValue("region");
        var category = currentValue("category");

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();

          var matchKeyword = !keyword || haystack.indexOf(keyword) >= 0;
          var matchYear = !year || String(card.getAttribute("data-year")).toLowerCase() === year;
          var matchType = !type || String(card.getAttribute("data-type")).toLowerCase() === type;
          var matchRegion = !region || String(card.getAttribute("data-region")).toLowerCase().indexOf(region) >= 0;
          var matchCategory = !category || String(card.getAttribute("data-category")).toLowerCase() === category;

          card.classList.toggle("is-hidden", !(matchKeyword && matchYear && matchType && matchRegion && matchCategory));
        });
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });

      selectAll("input, select", form).forEach(function (field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      });

      var params = new URLSearchParams(window.location.search);
      if (params.get("q") && form.querySelector("[name='q']")) {
        form.querySelector("[name='q']").value = params.get("q");
      }

      apply();
    });
  }

  function setupPlayers() {
    selectAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      var button = box.querySelector(".play-button");
      var stream = video ? video.getAttribute("data-stream") : "";
      var ready = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function attach() {
        if (ready) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          ready = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          ready = true;
          return;
        }

        video.src = stream;
        ready = true;
      }

      function play(event) {
        if (event) {
          event.preventDefault();
        }

        attach();
        box.classList.add("playing");
        video.controls = true;

        var started = video.play();
        if (started && started.catch) {
          started.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
