(function () {
  const THEME_KEY = "webrank-theme";
  const LEGACY_THEME_KEY = "theme";
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const transitionStyles = document.createElement("style");
  transitionStyles.textContent = `
    body {
      opacity: 1;
      transition: opacity 180ms ease;
    }

    html.wr-page-loading body {
      opacity: 0;
    }

    html.wr-page-leaving body {
      opacity: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      body {
        transition: none;
      }
    }
  `;
  document.head.appendChild(transitionStyles);
  document.documentElement.classList.add("wr-page-loading");

  function getStoredTheme() {
    const theme = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY);
    return ["dark", "light", "system"].includes(theme) ? theme : "dark";
  }

  function getResolvedTheme(theme = getStoredTheme()) {
    return theme === "system" ? (mediaQuery.matches ? "dark" : "light") : theme;
  }

  function applyTheme(theme = getStoredTheme()) {
    const resolvedTheme = getResolvedTheme(theme);
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = theme;
    document.documentElement.classList.toggle("light-theme", resolvedTheme === "light");
    return resolvedTheme;
  }

  window.WebRankTheme = {
    apply: applyTheme,
    getPreference: getStoredTheme,
    setPreference(theme) {
      const preference = ["dark", "light", "system"].includes(theme) ? theme : "dark";
      localStorage.setItem(THEME_KEY, preference);
      localStorage.setItem(LEGACY_THEME_KEY, preference);
      return applyTheme(preference);
    }
  };

  applyTheme();

  function finishPageEnter() {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("wr-page-loading");
    });
  }

  function handlePageNavigation(event) {
    const link = event.currentTarget;
    const targetUrl = new URL(link.href, window.location.href);

    if (
      targetUrl.origin !== window.location.origin ||
      targetUrl.pathname === window.location.pathname ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    event.preventDefault();
    document.documentElement.classList.add("wr-page-leaving");
    window.setTimeout(() => {
      window.location.assign(targetUrl.href);
    }, 180);
  }

  function bindPageNavigation() {
    document.querySelectorAll("a[href]").forEach((link) => {
      const targetUrl = new URL(link.href, window.location.href);
      const isHtmlPage = targetUrl.pathname.toLowerCase().endsWith(".html");

      if (isHtmlPage && !link.dataset.pageTransitionBound) {
        link.dataset.pageTransitionBound = "true";
        link.addEventListener("click", handlePageNavigation);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      finishPageEnter();
      bindPageNavigation();
    }, { once: true });
  } else {
    finishPageEnter();
    bindPageNavigation();
  }

  window.addEventListener("pageshow", finishPageEnter);

  const handleSystemThemeChange = () => {
    if (getStoredTheme() === "system") applyTheme("system");
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleSystemThemeChange);
  } else {
    mediaQuery.addListener(handleSystemThemeChange);
  }
})();