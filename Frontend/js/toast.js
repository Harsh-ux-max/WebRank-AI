(() => {
    try {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) return;

        const user = JSON.parse(savedUser);

        if (user && Object.prototype.hasOwnProperty.call(user, "password")) {
            delete user.password;
            localStorage.setItem("user", JSON.stringify(user));
        }
    } catch {
        localStorage.removeItem("user");
    }
})();

function showToast(message, type = "success") {
    const container = getToastContainer();
    const toast = document.createElement("div");
    const close = document.createElement("button");

    toast.className = `wr-toast wr-toast-${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = String(message || "");

    close.type = "button";
    close.className = "wr-toast-close";
    close.setAttribute("aria-label", "Close notification");
    close.textContent = "x";
    close.addEventListener("click", () => toast.remove());

    toast.appendChild(close);
    container.appendChild(toast);

    window.setTimeout(() => toast.remove(), 3500);
}

function getToastContainer() {
    let container = document.getElementById("wr-toast-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "wr-toast-container";
        container.setAttribute("aria-live", "polite");
        document.body.appendChild(container);
    }

    return container;
}

if (!window.__webRankAlertReplaced) {
    window.__webRankAlertReplaced = true;
    window.alert = (message) => showToast(message, "info");
}
