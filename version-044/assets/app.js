(function () {
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      var opened = nav.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('[data-spotlight-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-panel]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-target]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(parseInt(dot.getAttribute('data-slide-target'), 10));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cardList = document.querySelector('[data-card-list]');
  var emptyState = document.querySelector('[data-empty-state]');

  function applyFilter() {
    if (!cardList) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var yearValue = yearSelect ? parseInt(yearSelect.value || '0', 10) : 0;
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-category') || '',
        card.getAttribute('data-region') || ''
      ].join(' ').toLowerCase();
      var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedYear = !yearValue || cardYear >= yearValue;
      var matched = matchedKeyword && matchedYear;

      card.classList.toggle('is-filtered-out', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery) {
      filterInput.value = initialQuery;
    }
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilter);
  }

  applyFilter();

  var playButton = document.querySelector('.play-start[data-stream]');
  var video = document.getElementById('moviePlayer');
  var hlsInstance = null;
  var prepared = false;

  function startVideo() {
    if (!playButton || !video) {
      return;
    }

    var stream = playButton.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    playButton.classList.add('is-hidden');

    if (!prepared) {
      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
            video.src = stream;
            video.play().catch(function () {});
          }
        });
      } else {
        video.src = stream;
        video.play().catch(function () {});
      }
    } else {
      video.play().catch(function () {});
    }
  }

  if (playButton && video) {
    playButton.addEventListener('click', startVideo);
  }
})();
