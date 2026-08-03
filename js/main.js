(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  var backToTop = document.getElementById("backToTop");
  var yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Titre du hero : effet machine à écrire au chargement de la page.
     Découpe chaque ligne en spans par lettre (en conservant la mise en
     couleur dorée de .gold-text) et anime leur opacité en cascade rapide. */
  var heroTitle = document.getElementById("heroTitle");
  if (heroTitle) {
    var lines = heroTitle.querySelectorAll(".hero-title-line");
    var charIndex = 0;

    function appendChar(line, ch, isGold) {
      var span = document.createElement("span");
      span.className = "char-reveal" + (isGold ? " char-gold" : "");
      span.style.setProperty("--char-index", charIndex);
      span.textContent = ch;
      line.appendChild(span);
      charIndex++;
    }

    function walkNode(line, node, isGold) {
      if (node.nodeType === 3) {
        node.textContent.split("").forEach(function (ch) {
          appendChar(line, ch, isGold);
        });
      } else if (node.nodeType === 1) {
        var gold = isGold || node.classList.contains("gold-text");
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          walkNode(line, child, gold);
        });
      }
    }

    lines.forEach(function (line, lineIndex) {
      var originalNodes = Array.prototype.slice.call(line.childNodes);
      line.textContent = "";
      if (lineIndex > 0) charIndex += 3; // petite pause entre les deux lignes
      originalNodes.forEach(function (node) { walkNode(line, node, false); });
    });

    var cursor = document.createElement("span");
    cursor.className = "typing-cursor";
    lines[lines.length - 1].appendChild(cursor);

    var CHAR_STEP_MS = 32;
    var totalTypingMs = charIndex * CHAR_STEP_MS;

    requestAnimationFrame(function () {
      heroTitle.classList.add("is-typing");
    });
    setTimeout(function () { cursor.classList.add("cursor-active"); }, totalTypingMs + 100);
    setTimeout(function () {
      cursor.classList.remove("cursor-active");
      cursor.classList.add("cursor-fade");
    }, totalTypingMs + 1500);
  }

  /* Header state on scroll + back-to-top visibility */
  function onScroll() {
    var scrolled = window.scrollY > 60;
    header.classList.toggle("is-scrolled", scrolled);
    backToTop.classList.toggle("is-visible", window.scrollY > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* Back to top */
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Titres de section : découpage en mots pour une révélation en cascade
     au scroll (chaque mot fade-in avec un léger décalage). Texte brut
     uniquement (pas de balises imbriquées) sur ces titres. */
  var wordTitles = document.querySelectorAll("[data-reveal-words]");
  wordTitles.forEach(function (title) {
    var words = title.textContent.split(" ").filter(function (w) { return w.length; });
    title.textContent = "";
    words.forEach(function (word, i) {
      var span = document.createElement("span");
      span.className = "word-reveal";
      span.style.setProperty("--word-index", i);
      span.textContent = word;
      title.appendChild(span);
      if (i < words.length - 1) title.appendChild(document.createTextNode(" "));
    });
  });

  if ("IntersectionObserver" in window && wordTitles.length) {
    var wordObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("words-revealed");
            wordObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4, rootMargin: "0px 0px -40px 0px" }
    );
    wordTitles.forEach(function (title) { wordObserver.observe(title); });
  } else {
    wordTitles.forEach(function (title) { title.classList.add("words-revealed"); });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll("[data-reveal]");

  function markRevealDone(el) {
    el.classList.add("reveal-done");
  }

  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.classList.add("is-visible");
            el.addEventListener("animationend", function handler() {
              markRevealDone(el);
              el.removeEventListener("animationend", handler);
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
      markRevealDone(el);
    });
  }

  /* Liquid metal ripple effect on click */
  document.querySelectorAll("[data-ripple]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 1.4;
      var x = (e.clientX !== undefined ? e.clientX - rect.left : rect.width / 2) - size / 2;
      var y = (e.clientY !== undefined ? e.clientY - rect.top : rect.height / 2) - size / 2;

      var ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";

      btn.appendChild(ripple);
      ripple.addEventListener("animationend", function () {
        ripple.remove();
      });
    });
  });
})();
