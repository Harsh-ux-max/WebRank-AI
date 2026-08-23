/* =========================================================
   WebRank AI - API Configuration
   File: Frontend/js/api.js
   ========================================================= */

/* =========================
   API BASE URL
========================= */

const configuredApiUrl =
    window.API_BASE_URL ||
    document.documentElement.dataset.apiBaseUrl;

const localFrontendPorts = ["5500", "4173", "5173"];
const isLocalFrontendServer =
    ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
    localFrontendPorts.includes(window.location.port);

const API_BASE_URL =
    configuredApiUrl ||
    (isLocalFrontendServer || window.location.protocol === "file:"
        ? "http://localhost:5000"
        : "");


/* =========================
   API FETCH HELPER
========================= */

async function apiFetch(path, options = {}) {

    try {

        const token = localStorage.getItem("token");

        /* ---------------------------------
           Prepare request options
        --------------------------------- */

        const requestOptions = {
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.body && !(options.body instanceof FormData)
                    ? { "Content-Type": "application/json" }
                    : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers || {})
            }
        };


        /* ---------------------------------
           Send request
        --------------------------------- */

        const response = await fetch(
            `${API_BASE_URL}${path}`,
            requestOptions
        );


        /* ---------------------------------
           Check Authorization Header
        --------------------------------- */

        const hasAuthorization =
            new Headers(requestOptions.headers)
                .has("Authorization");


        /* =========================
           401 Unauthorized
        ========================= */

        if ((response.status === 401 || response.status === 403) && hasAuthorization) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userEmail");

            if (!window.location.pathname.toLowerCase().endsWith("login.html")) {

                window.location.href = "login.html";
            }

            return response;
        }


        /* =========================
           429 Rate Limited
        ========================= */

        if (response.status === 429) {

            throw new Error(
                "Too many requests. Please wait a few minutes and try again."
            );
        }


        /* =========================
           500+ Server Error
        ========================= */

        if (response.status >= 500) {

            throw new Error(
                `Server error (HTTP ${response.status}). Please try again later.`
            );
        }


        /* =========================
           Other HTTP Errors
        ========================= */

        if (!response.ok) {

            let message = "Request failed.";

            try {

                const clonedResponse =
                    response.clone();

                const data =
                    await clonedResponse.json();

                if (data.message) {

                    message = data.message;

                } else if (data.error) {

                    message = data.error;
                }

            } catch (error) {

                console.warn(
                    "Server returned a non-JSON error response."
                );
            }

            throw new Error(`${message} (HTTP ${response.status})`);
        }


        /* =========================
           SUCCESS
        ========================= */

        return response;

    } catch (error) {

        console.error(
            "API Request Error:",
            error
        );


        /* =========================
           NETWORK ERROR
        ========================= */

        if (
            error instanceof TypeError ||
            error.message === "Failed to fetch"
        ) {

            throw new Error(
                "Unable to reach the server. Please check your connection and try again."
            );
        }


        /* =========================
           OTHER ERROR
        ========================= */

        throw error;
    }
}