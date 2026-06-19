(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
      menuButton.addEventListener('click', function () {
        mainNav.classList.toggle('is-open');
      });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          window.clearInterval(timer);
          showSlide(dotIndex);
          start();
        });
      });

      start();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchInput = document.getElementById('searchInput');
    if (searchInput && query) {
      searchInput.value = query;
    }

    document.querySelectorAll('[data-filter-area]').forEach(function (area) {
      var input = area.querySelector('[data-filter-input]');
      var typeSelect = area.querySelector('[data-filter-type]');
      var scope = area.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

      function applyFilter() {
        var term = input ? input.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var cardType = card.getAttribute('data-type') || '';
          var matchedTerm = !term || text.indexOf(term) !== -1;
          var matchedType = !type || cardType === type;
          card.classList.toggle('is-hidden', !(matchedTerm && matchedType));
        });
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', applyFilter);
      }
      if (query && input) {
        applyFilter();
      }
    });
  });
})();
