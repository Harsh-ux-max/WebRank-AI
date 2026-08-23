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
