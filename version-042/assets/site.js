(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
        showSlide(slideIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchInput = document.getElementById('pageSearch');
  var filterGrid = document.querySelector('[data-filter-grid]');
  var clearButton = document.querySelector('[data-clear-search]');

  function filterCards(value) {
    if (!filterGrid) {
      return;
    }
    var query = String(value || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-search]'));
    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search').toLowerCase();
      card.classList.toggle('hidden-by-search', query && haystack.indexOf(query) === -1);
    });
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      searchInput.value = initial;
      filterCards(initial);
    }
    searchInput.addEventListener('input', function () {
      filterCards(searchInput.value);
    });
  }

  if (clearButton && searchInput) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      filterCards('');
      searchInput.focus();
    });
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.play-overlay');
    var source = player.getAttribute('data-source');
    var hls = null;
    var loaded = false;

    function loadSource() {
      if (loaded || !video || !source) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      loadSource();
      var result = video.play();
      player.classList.add('playing');
      video.setAttribute('controls', 'controls');
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          player.classList.remove('playing');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('playing');
        video.setAttribute('controls', 'controls');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
