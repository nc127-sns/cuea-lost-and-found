document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form.card");
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split("T")[0];

  // 1. Default date inputs to today and block future dates
  dateInputs.forEach((input) => {
    input.value = today;
    input.max = today;
  });

  // 2. Client-side Form Validation Function
  function validateForm(form) {
    const item = form.querySelector('[data-field="item"]').value.trim();
    const place = form.querySelector('[data-field="place"]').value.trim();
    const name = form.querySelector('[data-field="name"]').value.trim();
    const contact = form.querySelector('[data-field="contact"]').value.trim();

    if (item.length < 3) {
      return "Please enter a clearer item name (at least 3 characters).";
    }
    if (place.length < 2) {
      return "Please specify where the item was lost or found.";
    }
    if (name.length < 2) {
      return "Please enter your name.";
    }

    // Validate Kenyan phone numbers (07xx, 01xx, +254...) OR standard email
    const phonePattern = /^(?:\+254|0)\d{9}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanPhone = contact.replace(/\s+/g, "");

    if (!phonePattern.test(cleanPhone) && !emailPattern.test(contact)) {
      return "Enter a valid Kenyan phone number (e.g., 0712345678) or email address.";
    }

    return null;
  }

  // 3. Handle Form Submission
  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const errorMessage = validateForm(form);
      if (errorMessage) {
        showToast("⚠️ " + errorMessage, true);
        return;
      }

      const btn = form.querySelector(".btn");
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending report...";

      try {
        const formData = new FormData(form);

        await fetch(form.action, {
          method: "POST",
          mode: "no-cors",
          body: formData,
        });

        showToast("✅ Report sent! Updating the Notice Board...");
        form.reset();

        const dateField = form.querySelector('input[type="date"]');
        if (dateField) dateField.value = today;

        // Switch back to Notice Board tab and force iframe refresh
        document.getElementById("t1").checked = true;
        const iframe = document.querySelector(".board-frame");
        if (iframe) {
          const baseUrl = iframe.src.split("&refresh=")[0];
          setTimeout(() => {
            iframe.src = baseUrl + "&refresh=" + Date.now();
          }, 1500);
        }
      } catch (error) {
        showToast("❌ Network error. Check your internet connection.", true);
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  });

  // 4. Dynamic Notification Banner (DOM Manipulation)
  function showToast(message, isError = false) {
    let toast = document.getElementById("toast-msg");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast-msg";
      Object.assign(toast.style, {
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        color: "#ffffff",
        padding: "12px 20px",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "500",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
        zIndex: "9999",
        transition: "opacity 0.3s ease",
        textAlign: "center",
        maxWidth: "90vw",
      });
      document.body.appendChild(toast);
    }

    toast.style.backgroundColor = isError ? "#991b1b" : "#1f2937";
    toast.textContent = message;
    toast.style.opacity = "1";

    setTimeout(() => {
      toast.style.opacity = "0";
    }, 4500);
  }
});
