(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
            button.textContent = open ? "×" : "☰";
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
                slide.setAttribute("aria-hidden", slideIndex === current ? "false" : "true");
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
                dot.setAttribute("aria-label", "切换到第" + (dotIndex + 1) + "屏");
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupRails() {
        Array.prototype.slice.call(document.querySelectorAll("[data-rail]")).forEach(function (wrap) {
            var rail = wrap.querySelector("[data-rail-track]");
            var left = wrap.querySelector("[data-rail-left]");
            var right = wrap.querySelector("[data-rail-right]");
            if (!rail) {
                return;
            }
            function move(direction) {
                var delta = direction === "left" ? -420 : 420;
                rail.scrollTo({ left: rail.scrollLeft + delta, behavior: "smooth" });
            }
            if (left) {
                left.addEventListener("click", function () {
                    move("left");
                });
            }
            if (right) {
                right.addEventListener("click", function () {
                    move("right");
                });
            }
        });
    }

    function setupFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]")).forEach(function (panel) {
            var root = panel.closest("[data-filter-root]") || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
            var input = panel.querySelector("[data-filter-input]");
            var region = panel.querySelector("[data-filter-region]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            var empty = root.querySelector("[data-filter-empty]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";

            if (input && query && root.hasAttribute("data-search-page")) {
                input.value = query;
            }

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var term = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var search = normalize(card.dataset.search + " " + card.dataset.title);
                    var cardRegion = normalize(card.dataset.region);
                    var cardType = normalize(card.dataset.type);
                    var cardYear = normalize(card.dataset.year);
                    var match = true;

                    if (term && search.indexOf(term) === -1) {
                        match = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        match = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        match = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        match = false;
                    }

                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initMoviePlayer(sourceUrl) {
        var shell = document.querySelector("[data-player-shell]");
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        var message = document.querySelector("[data-player-message]");
        var reload = document.querySelector("[data-player-reload]");
        var hlsInstance = null;
        var attached = false;

        if (!shell || !video || !sourceUrl) {
            return;
        }

        function showMessage() {
            if (message) {
                message.classList.add("is-visible");
            }
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage();
                    }
                });
                return;
            }
            showMessage();
        }

        function startPlayback() {
            attachSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        attachSource();

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("error", showMessage);
        if (reload) {
            reload.addEventListener("click", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
                attached = false;
                if (message) {
                    message.classList.remove("is-visible");
                }
                startPlayback();
            });
        }
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupRails();
        setupFilters();
    });

    window.initMoviePlayer = initMoviePlayer;
})();
