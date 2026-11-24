/** Loads the plans display face (Dela Gothic One + Readex Pro) once, only on screens that show plan wordmarks. */
export function loadPaywallFont() {
  if (typeof document === "undefined" || document.getElementById("ceyo-paywall-font")) return;
  const l = document.createElement("link");
  l.id = "ceyo-paywall-font";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Readex+Pro:wght@400;500;600&display=swap";
  document.head.appendChild(l);
}
