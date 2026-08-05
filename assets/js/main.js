const header = document.querySelector("#siteHeader");
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-menu a");
const revealItems = document.querySelectorAll(".reveal");
const trackingForm = document.querySelector(".tracking-card");
const trackingInput = document.querySelector("#trackingNumber");
const trackingMessage = document.querySelector(".tracking-card__message");
const newsletter = document.querySelector(".newsletter");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

toggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  });
});

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

trackingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = trackingInput.value.trim();

  if (!value) {
    trackingMessage.textContent = "Please enter your consignment number.";
    trackingInput.focus();
    return;
  }

  trackingMessage.textContent = `Tracking request received for ${value}.`;
  trackingForm.classList.add("is-submitted");
  window.setTimeout(() => trackingForm.classList.remove("is-submitted"), 650);
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
