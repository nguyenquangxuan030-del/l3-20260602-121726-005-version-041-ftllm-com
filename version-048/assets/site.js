(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
        script.onload = callback;
        script.onerror = callback;
        document.head.appendChild(script);
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player-shell]");
        if (!shell) {
            return;
        }

        var video = shell.querySelector("video");
        var overlay = shell.querySelector("[data-player-overlay]");
        var source = video ? video.getAttribute("data-src") : "";
        var started = false;

        function play() {
            if (!video || !source || started) {
                if (video) {
                    video.play().catch(function () {});
                }
                return;
            }

            started = true;

            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else {
                    video.src = source;
                    video.play().catch(function () {});
                }
            });

            if (overlay) {
                overlay.classList.add("hidden");
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("hidden");
                }
            });
        }
    }

    function initSearch() {
        var form = document.querySelector("[data-search-form]");
        var results = document.querySelector("[data-search-results]");

        if (!form || !results || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        var keywordInput = form.querySelector("[name='keyword']");
        var regionSelect = form.querySelector("[name='region']");
        var typeSelect = form.querySelector("[name='type']");
        var yearSelect = form.querySelector("[name='year']");

        function card(movie) {
            return [
                "<article class=\"movie-card\">",
                "    <a class=\"card-link\" href=\"./movie/" + movie.id + ".html\">",
                "        <div class=\"poster-wrap\">",
                "            <img src=\"./" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "            <span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>",
                "            <span class=\"poster-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + "</span>",
                "        </div>",
                "        <div class=\"card-body\">",
                "            <h3>" + escapeHtml(movie.title) + "</h3>",
                "            <p>" + escapeHtml(movie.oneLine || "") + "</p>",
                "        </div>",
                "    </a>",
                "</article>"
            ].join("");
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function runSearch() {
            var keyword = (keywordInput.value || "").trim().toLowerCase();
            var region = regionSelect.value;
            var type = typeSelect.value;
            var year = yearSelect.value;

            var filtered = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                var text = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.genreRaw,
                    movie.tags,
                    movie.oneLine
                ].join(" ").toLowerCase();

                if (keyword && text.indexOf(keyword) === -1) {
                    return false;
                }

                if (region && movie.region !== region) {
                    return false;
                }

                if (type && movie.type !== type) {
                    return false;
                }

                if (year && String(movie.year) !== year) {
                    return false;
                }

                return true;
            }).slice(0, 120);

            results.innerHTML = filtered.map(card).join("");

            var counter = document.querySelector("[data-result-count]");
            if (counter) {
                counter.textContent = "已显示 " + filtered.length + " 条结果";
            }
        }

        form.addEventListener("input", runSearch);
        form.addEventListener("change", runSearch);
        runSearch();
    }

    initHero();
    initPlayer();
    initSearch();
})();
