(function () {
  function loadGoogleScript() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Unable to load Google Sign-In."));
      document.head.appendChild(script);
    });
  }

  async function startGoogleLogin() {
    if (!window.GOOGLE_CLIENT_ID) {
      showToast("Google login is not configured yet.", "warning");
      return;
    }

    try {
      await loadGoogleScript();
      google.accounts.id.initialize({
        client_id: window.GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const response = await apiFetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential })
            });
            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.removeItem("user");
            showToast("Signed in with Google", "success");
            window.location.href = "dashboard.html";
          } catch (error) {
            showToast(error.message || "Unable to sign in with Google.", "error");
          }
        }
      });

      google.accounts.id.prompt();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  window.startGoogleLogin = startGoogleLogin;
})();