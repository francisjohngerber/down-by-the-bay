/* Down by the Bay — interactions + Tweaks panel
   Renders only the Tweaks panel into #tweaks-root; the page itself is plain HTML.
   Tweaks drive CSS variables / data-theme and wire up all booking links. */

const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "vibe": "earthy",
  "accent": "#e8825a",
  "headingFont": "DM Serif Display",
  "round": 18,
  "airbnbUrl": "https://www.airbnb.co.uk/rooms/1609917134261717125",
  "bookingUrl": "https://www.booking.com/Share-DUzOWx",
  "whatsapp": "27632539677",
  "email": "welcometojbay@gmail.com",
  "instagram": "downbythebay.jbay",
  "mapUrl": "https://maps.google.com/?q=Corner+Melkhout+St+%26+Kabeljauws+Rd+Jeffreys+Bay+South+Africa"
}/*EDITMODE-END*/;

// shared config, kept current so DOM handlers read live values
const cfg = { ...TWEAK_DEFAULTS };

const FONT_STACKS = {
  "DM Serif Display": "'DM Serif Display', Georgia, serif",
  "Spectral": "'Spectral', Georgia, serif",
  "Fraunces": "'Fraunces', Georgia, serif",
  "DM Sans": "'DM Sans', system-ui, sans-serif",
};

function loadFont(name) {
  if (name === "DM Serif Display" || name === "DM Sans") return; // already loaded
  const id = "font-" + name.replace(/\s+/g, "-");
  if (document.getElementById(id)) return;
  const fam = name.replace(/\s+/g, "+");
  const l = document.createElement("link");
  l.id = id; l.rel = "stylesheet";
  l.href = `https://fonts.googleapis.com/css2?family=${fam}:ital,wght@0,400;0,500;1,400&display=swap`;
  document.head.appendChild(l);
}

function waLink(text) {
  return `https://wa.me/${(cfg.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

function applyLinks() {
  document.querySelectorAll("[data-link]").forEach((el) => {
    const k = el.getAttribute("data-link");
    switch (k) {
      case "airbnb": el.href = cfg.airbnbUrl; break;
      case "booking": el.href = cfg.bookingUrl; break;
      case "map": el.href = cfg.mapUrl; break;
      case "instagram": el.href = `https://instagram.com/${cfg.instagram.replace(/^@/, "")}`; break;
      case "whatsapp": el.href = waLink("Hi! I'd love to book a stay at Down by the Bay. Could you share availability?"); break;
      case "phone": el.href = "tel:+" + (cfg.whatsapp || "").replace(/\D/g, ""); break;
      case "email": el.href = "mailto:" + cfg.email + "?subject=" + encodeURIComponent("Booking enquiry — Down by the Bay"); break;
      case "whatsapp-text":
        el.href = waLink("Hi! I'd love to book a stay at Down by the Bay.");
        el.textContent = "WhatsApp · +" + cfg.whatsapp.replace(/\D/g, "").replace(/(\d{2})(\d{2})(\d{3})(\d+)/, "$1 $2 $3 $4");
        break;
      case "email-text":
        el.href = "mailto:" + cfg.email;
        el.textContent = cfg.email;
        break;
    }
  });
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // keep cfg in sync + apply visual tweaks
  useEffect(() => {
    Object.assign(cfg, t);
    const root = document.documentElement;
    document.body.setAttribute("data-theme", t.vibe);
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--font-head", FONT_STACKS[t.headingFont] || FONT_STACKS["DM Serif Display"]);
    root.style.setProperty("--radius", t.round + "px");
    root.style.setProperty("--radius-sm", Math.max(6, t.round - 6) + "px");
    loadFont(t.headingFont);
    applyLinks();
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Beach vibe" />
      <TweakSelect label="Palette" value={t.vibe}
        options={[
          { value: "cool-surf", label: "Cool surf" },
          { value: "bright-sunny", label: "Bright & sunny" },
          { value: "earthy", label: "Earthy & natural" },
          { value: "minimal", label: "Minimal & airy" },
        ]}
        onChange={(v) => setTweak("vibe", v)} />
      <TweakColor label="Accent" value={t.accent}
        options={["#e8825a", "#f0a93f", "#3aa6a0", "#5b8def", "#d96a8a"]}
        onChange={(v) => setTweak("accent", v)} />
      <TweakSection label="Type & shape" />
      <TweakSelect label="Heading font" value={t.headingFont}
        options={["DM Serif Display", "Spectral", "Fraunces", "DM Sans"]}
        onChange={(v) => setTweak("headingFont", v)} />
      <TweakSlider label="Corner round" value={t.round} min={0} max={28} unit="px"
        onChange={(v) => setTweak("round", v)} />

      <TweakSection label="Booking links" />
      <TweakText label="Airbnb URL" value={t.airbnbUrl} onChange={(v) => setTweak("airbnbUrl", v)} />
      <TweakText label="Booking.com URL" value={t.bookingUrl} onChange={(v) => setTweak("bookingUrl", v)} />
      <TweakText label="WhatsApp number" value={t.whatsapp} onChange={(v) => setTweak("whatsapp", v)} />
      <TweakText label="Email" value={t.email} onChange={(v) => setTweak("email", v)} />
      <TweakText label="Instagram handle" value={t.instagram} onChange={(v) => setTweak("instagram", v)} />
      <TweakText label="Map URL" value={t.mapUrl} onChange={(v) => setTweak("mapUrl", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);

/* ---------- Plain-DOM interactions (independent of React) ---------- */
(function () {
  // nav shadow on scroll
  const nav = document.getElementById("nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // reveal on scroll — content is visible by default; we only ADD a hidden
  // state when we can animate, and self-heal if IntersectionObserver never fires.
  const reveals = [...document.querySelectorAll(".reveal")];
  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches && "IntersectionObserver" in window) {
    reveals.forEach((el) => el.classList.add("pre"));
    const show = (el) => el.classList.remove("pre");
    let ioFired = false;
    const io = new IntersectionObserver((entries) => {
      ioFired = true;
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: "0px 0px -60px 0px" });
    reveals.forEach((el) => io.observe(el));
    // safety net: if IO isn't delivering callbacks in this environment, reveal everything
    setTimeout(() => { if (!ioFired) reveals.forEach(show); }, 700);
  }

  // enquiry form -> WhatsApp / email
  const form = document.getElementById("enquiry-form");
  const compose = () => {
    const d = new FormData(form);
    const lines = [
      "Hi! I'd like to enquire about Down by the Bay.",
      "",
      `Name: ${d.get("name") || "-"}`,
      `Dates: ${d.get("checkin") || "?"} → ${d.get("checkout") || "?"}`,
      `Guests: ${d.get("guests") || "-"}`,
      d.get("message") ? `Note: ${d.get("message")}` : "",
    ].filter(Boolean);
    return lines.join("\n");
  };
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      window.open(waLink(compose()), "_blank");
    });
    const emailBtn = document.getElementById("email-btn");
    emailBtn && emailBtn.addEventListener("click", () => {
      const subject = encodeURIComponent("Booking enquiry — Down by the Bay");
      window.location.href = `mailto:${cfg.email}?subject=${subject}&body=${encodeURIComponent(compose())}`;
    });
  }
})();
