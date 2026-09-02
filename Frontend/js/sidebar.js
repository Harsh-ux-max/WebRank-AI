(function () {
  const pageAliases = {
    "dashboard.html": "dashboard.html",
    "analyze.html": "analyze.html",
    "results.html": "results.html",
    "compare.html": "compare.html",
    "saved-reports.html": "saved-reports.html",
    "profile.html": "profile.html",
    "settings.html": "settings.html",
    "admin.html": "admin.html"
  };

  function logout(event) {
    event?.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    window.location.href = "login.html";
  }

  function init() {
    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) {
      return;
    }

    document.body.classList.add("wr-sidebar-page");

    let overlay = document.querySelector(".wr-sidebar-overlay, #sidebarOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "wr-sidebar-overlay";
      overlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(overlay);
    }

    let toggle = document.querySelector(".wr-mobile-menu-toggle, #mobileMenuBtn");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = "wr-mobile-menu-toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-label", "Open navigation");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = "<span></span><span></span><span></span>";
      document.body.appendChild(toggle);
    }

    const setMenuState = (isOpen) => {
      sidebar.classList.toggle("open", isOpen);
      overlay.classList.toggle("active", isOpen);
      document.body.classList.toggle("wr-nav-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    };

    if (!toggle.dataset.sidebarBound) {
      toggle.dataset.sidebarBound = "true";
      toggle.addEventListener("click", () => setMenuState(!sidebar.classList.contains("open")));
      overlay.addEventListener("click", () => setMenuState(false));
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setMenuState(false);
      });
    }

    const currentPage = window.location.pathname.split("/").pop().toLowerCase();
    const activePage = pageAliases[currentPage] || currentPage;

    document.querySelectorAll(".sidebar a").forEach((link) => {
      const href = (link.getAttribute("href") || "").split("?")[0].toLowerCase();
      const isLogout = link.textContent.trim().toLowerCase() === "logout";
      if (isLogout) {
        link.addEventListener("click", logout);
        return;
      }
      if (href === activePage) {
        link.classList.add("active");
      } else if (href && href !== "#") {
        link.classList.remove("active");
      }

      if (!link.dataset.sidebarCloseBound) {
        link.dataset.sidebarCloseBound = "true";
        link.addEventListener("click", () => setMenuState(false));
      }
    });

    window.logout = window.logout || logout;
  }

  window.WebRankSidebar = { init, logout };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
