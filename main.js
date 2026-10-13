const en = {
  brand: "Thunderbolt", brandFull: "Thunderbolt Innovation and AI Consulting",
  navServices: "Services", navProjects: "Projects", navProcess: "Process",
  projectsTitle: "Projects", pr1Tag: "Education",
  pr1Text: "Entry check-in for schools in Mexico: students tap their ID card and their guardian instantly gets a WhatsApp alert. Includes real-time attendance for school leadership, alerts for frequent tardiness and the official SEP school calendar.", navContact: "Contact",
  heroTitle: "We bring your business into the age of <em>Artificial Intelligence</em>",
  heroText: "We build, maintain and supercharge AI-powered apps so you can focus on growing.",
  heroCta: "Book a free consultation",
  servicesTitle: "Our services",
  s1Title: "App development", s1Text: "We design and build web and mobile apps with built-in AI, from prototype to production.",
  s2Title: "App maintenance", s2Text: "Monitoring, updates, bug fixes and continuous improvements so your app always runs.",
  s3Title: "Personal AI Workspace", s3Text: "We set up assistants, automations and AI tools tailored to you to multiply your productivity.",
  processTitle: "How we work",
  p1Title: "Discovery", p1Text: "We understand your goals and where AI creates the most value.",
  p2Title: "Build", p2Text: "We ship fast, in short cycles, with visible results.",
  p3Title: "Support", p3Text: "We stay with you after launch to maintain and improve.",
  ctaTitle: "Ready to get started?", ctaText: "Tell us your idea and we'll reply within 24 hours.",
  ctaBtn: "Contact us", rights: "All rights reserved.",
  formTitle: "Tell us about your project", fName: "Name *", fEmail: "Email *", fCompany: "Company (optional)",
  fStage: "Your situation *", fPick: "Select…", fStageCompany: "I have an established company", fStageIdea: "I have a new project or idea",
  fService: "Service of interest *", fOther: "Other / not sure", fBudget: "Approximate budget (USD)",
  fDetails: "Describe your company or project *", fCancel: "Cancel", fSend: "Send"
};
// Spanish lives in the HTML; snapshot it so we can switch back.
const els = document.querySelectorAll("[data-i18n]");
const es = {};
els.forEach(el => es[el.dataset.i18n] = el.innerHTML);

// Country comes from Cloudflare (functions/_middleware.js). Timezone is the fallback
// for local previews: a US visitor with a non-US clock would get Spanish there.
const isUS = tz => /^(America\/(New_York|Detroit|Kentucky\/|Indiana\/|Chicago|Menominee|North_Dakota\/|Denver|Boise|Phoenix|Los_Angeles|Anchorage|Juneau|Sitka|Metlakatla|Yakutat|Nome|Adak)|Pacific\/Honolulu)/.test(tz);
console.assert(isUS("America/New_York") && isUS("America/Indiana/Indianapolis") && isUS("Pacific/Honolulu"));
console.assert(!isUS("America/Mexico_City") && !isUS("Europe/Madrid") && !isUS("America/Bogota"));

function setLang(lang) {
  const dict = lang === "en" ? en : es;
  els.forEach(el => el.innerHTML = dict[el.dataset.i18n]);
  document.documentElement.lang = lang;
  document.title = dict.brandFull;
  document.getElementById("lang-toggle").textContent = lang === "en" ? "ES" : "EN";
}

let saved = null;
try { saved = localStorage.getItem("lang"); } catch {}
const country = document.documentElement.dataset.country;
let lang = saved || ((country ? country === "US" : isUS(Intl.DateTimeFormat().resolvedOptions().timeZone)) ? "en" : "es");
setLang(lang);

document.getElementById("lang-toggle").onclick = () => {
  lang = lang === "en" ? "es" : "en";
  setLang(lang);
  try { localStorage.setItem("lang", lang); } catch {}
};
document.getElementById("year").textContent = new Date().getFullYear();

// --- Contact form ---
// ponytail: no backend, the form composes an email in the visitor's mail client (mailto).
// Ceiling: visitors without a mail client can't send. Upgrade: POST to a form service
// (Formspree, Netlify Forms) and re-validate everything server-side there.
const TO = "hugozepeda6@gmail.com";
const dialog = document.getElementById("contact-dialog");
const form = document.getElementById("contact-form");
document.getElementById("open-form").onclick = () => dialog.showModal();
document.getElementById("close-form").onclick = () => dialog.close();

// Defense in depth: HTML attributes can be bypassed via devtools, so re-check in JS.
// Strips control chars (blocks header injection) and markup/script characters.
const clean = (v, max) => String(v).replace(/[\u0000-\u0009\u000B-\u001F\u007F<>`{}\\]/g, "").trim().slice(0, max);
const ALLOWED = { stage: ["company", "idea"], service: ["build", "maintain", "workspace", "other"], budget: ["", "lt5k", "5-20k", "20-50k", "gt50k"] };
const line = (v, max) => clean(v, max).replace(/\n/g, " "); // single-line fields: no newlines at all
console.assert(line("<script>x</script>\r\nBcc: a@b.c", 100) === "scriptx/script Bcc: a@b.c");

form.onsubmit = e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const d = Object.fromEntries(new FormData(form));
  for (const k in ALLOWED) if (!ALLOWED[k].includes(d[k])) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return;
  const label = k => { const o = form.elements[k].selectedOptions[0]; return o && o.value ? o.textContent : "-"; };
  const name = line(d.name, 80);
  const body = [
    `${lang === "en" ? "Name" : "Nombre"}: ${name}`,
    `Email: ${line(d.email, 120)}`,
    `${lang === "en" ? "Company" : "Empresa"}: ${line(d.company, 100) || "-"}`,
    `${lang === "en" ? "Situation" : "Situación"}: ${label("stage")}`,
    `${lang === "en" ? "Service" : "Servicio"}: ${label("service")}`,
    `${lang === "en" ? "Budget" : "Presupuesto"}: ${label("budget")}`,
    "",
    clean(d.details, 1000),
  ].join("\n");
  const subject = `${lang === "en" ? "New project" : "Nuevo proyecto"} - ${name}`;
  location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  form.reset();
  dialog.close();
};
