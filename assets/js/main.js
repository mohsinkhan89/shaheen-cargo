const header = document.querySelector("#siteHeader");
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-menu a");
const scrollLinks = document.querySelectorAll("a[href^='#']");
const revealItems = document.querySelectorAll(".reveal");
const trackingForm = document.querySelector(".tracking-card");
const trackingInput = document.querySelector("#trackingNumber");
const trackingMessage = document.querySelector(".tracking-card__message");
const newsletter = document.querySelector(".newsletter");
const trackingModal = document.querySelector("#trackingModal");
const trackingModalQuery = document.querySelector(".tracking-modal__query");
const trackingModalShipmentNumbers = document.querySelectorAll("[data-shipment-index]");
const trackingModalCloseButtons = document.querySelectorAll("[data-modal-close]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastFocusedElement = null;

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

toggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

const getHeaderOffset = () => (header ? header.offsetHeight + 12 : 0);

const getAnchorTarget = (link) => {
  const href = link.getAttribute("href");

  if (!href || href === "#") return null;

  try {
    return document.querySelector(href);
  } catch {
    return null;
  }
};

const setActiveNav = (hash) => {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === hash);
  });
};

const navTargets = Array.from(navLinks)
  .map((link) => {
    const target = getAnchorTarget(link);
    return target ? { link, target, hash: link.getAttribute("href") } : null;
  })
  .filter(Boolean);

scrollLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = getAnchorTarget(link);

    if (!target) return;

    event.preventDefault();
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");

    if (link.closest(".nav-menu")) {
      setActiveNav(link.getAttribute("href"));
    }

    const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({ top: Math.max(top, 0), behavior: prefersReducedMotion ? "auto" : "smooth" });
    window.history.replaceState(null, "", link.getAttribute("href"));
  });
});

const setActiveNavOnScroll = () => {
  if (!navTargets.length) return;

  const checkpoint = window.scrollY + getHeaderOffset() + 90;
  let activeHash = navTargets[0].hash;

  navTargets.forEach(({ target, hash }) => {
    if (target.offsetTop <= checkpoint) {
      activeHash = hash;
    }
  });

  const pageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
  if (pageBottom) {
    const contactTarget = navTargets.find((item) => item.hash === "#contact");
    if (contactTarget) activeHash = contactTarget.hash;
  }

  setActiveNav(activeHash);
};

setActiveNavOnScroll();
window.addEventListener("scroll", setActiveNavOnScroll, { passive: true });
window.addEventListener("resize", setActiveNavOnScroll);

revealItems.forEach((item) => {
  const delay = item.dataset.delay || 0;
  item.style.setProperty("--delay", `${delay}ms`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const getTrackingNumbers = (value) => {
  const numericMatch = value.match(/\d+/);

  if (!numericMatch) {
    return [value, `${value}-A`, `${value}-B`];
  }

  const base = Number(numericMatch[0]);
  const width = numericMatch[0].length;

  return [0, 1, 2].map((offset) => String(base + offset).padStart(width, "0"));
};

const updateTrackingModal = (value) => {
  const numbers = getTrackingNumbers(value);

  trackingModalQuery.textContent = `CN ${numbers.join(", ")}`;
  trackingModalShipmentNumbers.forEach((item) => {
    item.textContent = numbers[Number(item.dataset.shipmentIndex)] || numbers[0];
  });
};

const openTrackingModal = (value) => {
  if (!trackingModal) return;

  lastFocusedElement = document.activeElement;
  updateTrackingModal(value);
  trackingModal.classList.add("is-open");
  trackingModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("tracking-modal-open");

  const closeButton = trackingModal.querySelector(".tracking-modal__close");
  if (closeButton) closeButton.focus();
};

const closeTrackingModal = () => {
  if (!trackingModal || !trackingModal.classList.contains("is-open")) return;

  trackingModal.classList.remove("is-open");
  trackingModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("tracking-modal-open");

  if (lastFocusedElement) lastFocusedElement.focus();
};

trackingModalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeTrackingModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeTrackingModal();
});

trackingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = trackingInput.value.trim();

  if (!value) {
    trackingMessage.textContent = "Please enter your consignment number.";
    trackingInput.focus();
    return;
  }

  trackingMessage.textContent = "";
  trackingForm.classList.add("is-submitted");
  window.setTimeout(() => trackingForm.classList.remove("is-submitted"), 650);
  openTrackingModal(value);
});

newsletter.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = newsletter.querySelector("input");
  input.value = "";
  input.placeholder = "Subscribed successfully";
});

const mapPins = document.querySelectorAll(".map-pin");
mapPins.forEach((pin) => {
  pin.addEventListener("click", (event) => {
    event.stopPropagation();
    mapPins.forEach((item) => {
      if (item !== pin) item.classList.remove("is-active");
    });
    pin.classList.toggle("is-active");
  });
});

document.addEventListener("click", () => {
  mapPins.forEach((pin) => pin.classList.remove("is-active"));
});
