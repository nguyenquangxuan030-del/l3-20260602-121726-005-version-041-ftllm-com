(function() {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });

        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    if (slides.length) {
        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                showSlide(index);
            });
        });

        window.setInterval(function() {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var sortControls = Array.prototype.slice.call(document.querySelectorAll("[data-sort-control]"));
    var cardContainers = Array.prototype.slice.call(document.querySelectorAll("[data-card-container]"));
    var resultNotes = Array.prototype.slice.call(document.querySelectorAll("[data-result-note]"));

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function getCards() {
        return Array.prototype.slice.call(document.querySelectorAll(".searchable-card, .movie-card, .ranking-item"));
    }

    function applyFilters() {
        var keyword = normalize(searchInputs.map(function(input) {
            return input.value;
        }).join(" "));
        var cards = getCards();
        var shown = 0;

        cards.forEach(function(card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" "));
            var matched = !keyword || text.indexOf(keyword) !== -1;

            card.classList.toggle("hide", !matched);

            if (matched) {
                shown += 1;
            }
        });

        resultNotes.forEach(function(note) {
            note.textContent = "当前显示 " + shown + " 条";
        });
    }

    function sortCards(select) {
        var value = select.value;

        cardContainers.forEach(function(container) {
            var cards = Array.prototype.slice.call(container.children);

            cards.sort(function(a, b) {
                var yearA = Number(a.getAttribute("data-year") || 0);
                var yearB = Number(b.getAttribute("data-year") || 0);
                var scoreA = Number(a.getAttribute("data-score") || 0);
                var scoreB = Number(b.getAttribute("data-score") || 0);
                var heatA = Number(a.getAttribute("data-heat") || 0);
                var heatB = Number(b.getAttribute("data-heat") || 0);

                if (value === "score") {
                    return scoreB - scoreA || heatB - heatA || yearB - yearA;
                }

                if (value === "heat") {
                    return heatB - heatA || scoreB - scoreA || yearB - yearA;
                }

                return yearB - yearA || scoreB - scoreA || heatB - heatA;
            });

            cards.forEach(function(card) {
                container.appendChild(card);
            });
        });
    }

    searchInputs.forEach(function(input) {
        input.addEventListener("input", applyFilters);
    });

    sortControls.forEach(function(select) {
        select.addEventListener("change", function() {
            sortCards(select);
            applyFilters();
        });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && searchInputs.length) {
        searchInputs[0].value = query;
        applyFilters();
    } else if (resultNotes.length) {
        applyFilters();
    }

    function startVideo(player) {
        var video = player.querySelector("video");
        var cover = player.querySelector(".video-cover");
        var button = player.querySelector(".play-button");
        var status = player.querySelector(".player-status");
        var source = player.getAttribute("data-source");

        if (!video || !source) {
            return;
        }

        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        if (cover) {
            cover.style.display = "none";
        }

        if (button) {
            button.style.display = "none";
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (player._hlsInstance) {
                player._hlsInstance.destroy();
            }

            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            player._hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                video.play().then(function() {
                    setStatus("正在播放");
                }).catch(function() {
                    setStatus("已载入，点击视频继续播放");
                });
            });

            hls.on(window.Hls.Events.ERROR, function(event, data) {
                if (data && data.fatal) {
                    setStatus("播放暂时不可用，请稍后重试");
                }
            });
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().then(function() {
                setStatus("正在播放");
            }).catch(function() {
                setStatus("已载入，点击视频继续播放");
            });
            return;
        }

        video.src = source;
        video.play().then(function() {
            setStatus("正在播放");
        }).catch(function() {
            setStatus("当前浏览器需要支持 HLS 播放");
        });
    }

    Array.prototype.slice.call(document.querySelectorAll(".player-wrap")).forEach(function(player) {
        var cover = player.querySelector(".video-cover");
        var button = player.querySelector(".play-button");

        if (cover) {
            cover.addEventListener("click", function() {
                startVideo(player);
            });
        }

        if (button) {
            button.addEventListener("click", function(event) {
                event.stopPropagation();
                startVideo(player);
            });
        }
    });
})();
