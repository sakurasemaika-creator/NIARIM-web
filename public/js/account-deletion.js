(() => {
  "use strict";

  const signIn = document.getElementById("delete-sign-in");
  const googleButton = document.getElementById("delete-google");
  const confirm = document.getElementById("delete-confirm");
  const email = document.getElementById("delete-email");
  const understood = document.getElementById("delete-understood");
  const submit = document.getElementById("delete-submit");
  const status = document.getElementById("delete-status");
  const retry = document.getElementById("delete-retry");
  const receiptKey = "niarim.account-deletion";
  let nonce;
  let token;

  function message(key) {
    const name = `accountDeletion.${key}`;
    status.dataset.i18n = name;
    status.textContent = window.NIARIM_I18N.translate(
      document.documentElement.lang,
      name,
    );
  }

  async function post(action, data, credential) {
    const response = await fetch(`/api/account-deletion/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(credential ? { Authorization: `Bearer ${credential}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok && !(action === "status" && response.status === 404))
      throw new Error("account deletion request failed");
    return response.json();
  }

  function rememberReceipt(receipt) {
    try {
      if (receipt) window.sessionStorage.setItem(receiptKey, receipt);
      else window.sessionStorage.removeItem(receiptKey);
    } catch {
      // Closing this tab does not stop a queued deletion.
    }
  }

  async function track(receipt) {
    token = undefined;
    confirm.hidden = true;
    signIn.hidden = true;
    rememberReceipt(receipt);
    message("pending");
    try {
      const result = await post("status", { receipt });
      if (result.state === "complete") {
        rememberReceipt("");
        message("complete");
        return;
      }
      if (result.state === "unknown") {
        rememberReceipt("");
        restart("error");
        return;
      }
    } catch {
      // The request remains queued even if the status check cannot connect.
    }
    window.setTimeout(() => track(receipt), 10000);
  }

  function restart(key) {
    token = undefined;
    signIn.hidden = true;
    confirm.hidden = true;
    retry.hidden = false;
    message(key);
  }

  async function selectAccount(response) {
    if (!response?.credential) return restart("error");
    try {
      const result = await post("verify", { nonce }, response.credential);
      if (result.state === "no-account") return restart("noAccount");
      if (result.state === "pending" && result.receipt)
        return track(result.receipt);
      if (result.state !== "ready" || !result.email) return restart("error");
      token = response.credential;
      email.textContent = result.email;
      understood.checked = false;
      submit.disabled = true;
      signIn.hidden = true;
      confirm.hidden = false;
      retry.hidden = false;
      message("verified");
      understood.focus();
    } catch {
      restart("error");
    }
  }

  async function initialize() {
    let saved;
    try {
      saved = window.sessionStorage.getItem(receiptKey);
    } catch {}
    if (saved && /^[a-f0-9]{64}$/.test(saved)) return track(saved);
    message("loading");
    try {
      const response = await fetch("/api/account-deletion/challenge", {
        cache: "no-store",
      });
      if (!response.ok) return restart("error");
      const config = await response.json();
      nonce = config.nonce;
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onerror = () => restart("error");
      script.onload = () => {
        try {
          window.google.accounts.id.initialize({
            client_id: config.clientId,
            nonce,
            auto_select: false,
            callback: selectAccount,
          });
          window.google.accounts.id.renderButton(googleButton, {
            type: "standard",
            theme: "outline",
            text: "signin_with",
            locale: document.documentElement.lang,
          });
          delete status.dataset.i18n;
          status.textContent = "";
        } catch {
          restart("error");
        }
      };
      document.head.append(script);
    } catch {
      restart("error");
    }
  }

  understood.addEventListener("change", () => {
    submit.disabled = !understood.checked;
  });
  retry.addEventListener("click", () => {
    window.location.reload();
  });
  confirm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!token || !understood.checked || submit.disabled) return;
    submit.disabled = true;
    understood.disabled = true;
    retry.hidden = true;
    try {
      const result = await post("submit", { nonce, confirm: true }, token);
      if (result.state === "pending" && result.receipt)
        return track(result.receipt);
      restart(result.state === "no-account" ? "noAccount" : "error");
    } catch {
      restart("error");
    }
  });
  window.addEventListener("DOMContentLoaded", initialize, { once: true });
})();
