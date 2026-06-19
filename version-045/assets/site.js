(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");
  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", () => {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dots button"));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(() => showSlide(activeSlide + 1), 5200);
  }

  const searchInput = document.querySelector("[data-page-search]");
  const searchableItems = Array.from(document.querySelectorAll("[data-search]"));
  const resultCount = document.querySelector(".result-count");

  function applySearch(value) {
    const query = String(value || "").trim().toLowerCase();
    let visible = 0;
    searchableItems.forEach((item) => {
      const haystack = item.getAttribute("data-search") || "";
      const matched = !query || haystack.includes(query);
      item.classList.toggle("hidden-by-search", !matched);
      if (matched) visible += 1;
    });
    if (resultCount) {
      resultCount.textContent = `${visible} 部影片`;
    }
  }

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    searchInput.value = initial;
    applySearch(initial);
    searchInput.addEventListener("input", () => applySearch(searchInput.value));
  }

  window.initPlayer = function initPlayer(sourceUrl) {
    const video = document.querySelector("#movie-video");
    const cover = document.querySelector(".player-cover");
    const playButtons = Array.from(document.querySelectorAll("[data-play-button]"));
    if (!video || !sourceUrl) return;

    let ready = false;

    function attachSource() {
      if (ready) return;
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function playVideo() {
      attachSource();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    }

    playButtons.forEach((button) => {
      button.addEventListener("click", playVideo);
    });
    if (cover) {
      cover.addEventListener("click", playVideo);
    }
    video.addEventListener("play", () => {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
  };
})();
