const en = {
  brand: "Thunderbolt AI", brandFull: "Thunderbolt Innovation and AI Consulting",
  navHome: "Home", navServices: "Services", navProjects: "Projects", navProcess: "Process",
  projectsTitle: "Projects", pr1Tag: "Education",
  pr1Text: "Entry check-in for schools in Mexico: students tap their ID card and their guardian instantly gets a WhatsApp alert. Includes real-time attendance for school leadership, alerts for frequent tardiness and the official SEP school calendar.", navContact: "Contact",
  heroTitle: "We bring your business into the age of <em>Artificial Intelligence</em>",
  heroText: "AI is making software more affordable. We build apps as personalized as your business needs, at a fair price.",
  heroCta: "Book a free consultation",
  servicesTitle: "Our services",
  servicesLead: "AI is driving down the cost of software. <strong>Don't pay for overpriced software: pay a fair price for software built for you</strong>, as personalized as you want.",
  s1Title: "Web & mobile apps", s1Text: 'Hosted, ready-to-use web and mobile apps, like <a href="https://aulapuntual.mx" target="_blank" rel="noopener noreferrer">AulaPuntual</a>. We handle the whole lifecycle:',
  s1List: "<span>Design</span><span>Development</span><span>Hosting</span><span>Maintenance</span><span>Continuous improvement</span>",
  s1Note: "Each service is priced separately; we define it together in the initial interview.",
  s2Title: "AI agent apps", s2Text: "Agentic AI: agents and subagents that reason, use tools and complete whole tasks for you.",
  s2Note: "Not every system needs agents. Agents and subagents are expensive to run, so we evaluate each case carefully to make sure the investment is worth it.",
  s3Title: "Personal AI Workspace", s3Text: "We set up assistants, automations and AI tools tailored to you to multiply your productivity.",
  processTitle: "How we work",
  p1Title: "Discovery", p1Text: "We understand your goals and where AI creates the most value.",
  p2Title: "Build", p2Text: "We ship fast, in short cycles, with visible results.",
  p3Title: "Support", p3Text: "We stay with you after launch to maintain and improve.",
  ctaTitle: "Ready to get started?", ctaText: "Tell us your idea and we'll reply within 24 hours.",
  ctaBtn: "Tell us about you", rights: "All rights reserved.",
  formTitle: "Tell us about your project", fName: "Name *", fEmail: "Email *", fCompany: "Company (optional)",
  fStage: "Your situation *", fPick: "Select…", fStageCompany: "I have an established company", fStageIdea: "I have a new project or idea",
  fService: "Service of interest *", fOther: "Other / not sure", fBudget: "Approximate budget", fCurrency: "Currency", fMXN: "MXN (pesos)", fUSD: "USD (dollars)",
  fPeriod: "Frequency", fWeek: "Weekly", fMonth: "Monthly", fProject: "Per project", fYear: "Yearly",
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

// Highlight the menu link of the section on screen (last one whose top passed a third of the viewport).
const navLinks = document.querySelectorAll("nav a");
const spy = () => {
  let cur = null;
  navLinks.forEach(a => { if (document.querySelector(a.hash).getBoundingClientRect().top < innerHeight / 3) cur = a; });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) cur = navLinks[navLinks.length - 1]; // short last section never reaches the line
  navLinks.forEach(a => a === cur ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current"));
};
addEventListener("scroll", spy, { passive: true });
spy();

// --- Contact form ---
// ponytail: no backend, the form composes an email in the visitor's mail client (mailto).
// Ceiling: visitors without a mail client can't send. Upgrade: POST to a form service
// (Formspree, Netlify Forms) and re-validate everything server-side there.
const TO = "hugozepeda6@gmail.com";
const dialog = document.getElementById("contact-dialog");
const form = document.getElementById("contact-form");
document.getElementById("open-form").onclick = () => dialog.showModal();
dialog.querySelectorAll(".close").forEach(b => b.onclick = () => dialog.close());

// Defense in depth: HTML attributes can be bypassed via devtools, so re-check in JS.
// Strips control chars (blocks header injection) and markup/script characters.
const clean = (v, max) => String(v).replace(/[\u0000-\u0009\u000B-\u001F\u007F<>`{}\\]/g, "").trim().slice(0, max);
const ALLOWED = { stage: ["company", "idea"], service: ["apps", "agents", "workspace", "other"], budget: ["", "lt1k", "1-2k", "2-5k", "5-10k", "10-20k", "20-50k", "50-100k", "gt100k"],
  currency: ["MXN", "USD"], period: ["", "week", "month", "project", "year"] };
const line = (v, max) => clean(v, max).replace(/\n/g, " "); // single-line fields: no newlines at all
console.assert(line("<script>x</script>\r\nBcc: a@b.c", 100) === "scriptx/script Bcc: a@b.c");

// A budget amount means nothing without its frequency.
form.elements.budget.onchange = () => form.elements.period.required = !!form.elements.budget.value;

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
    `${lang === "en" ? "Budget" : "Presupuesto"}: ${d.budget ? `${label("budget")} ${d.currency} (${label("period")})` : "-"}`,
    "",
    clean(d.details, 1000),
  ].join("\n");
  const subject = `${lang === "en" ? "New project" : "Nuevo proyecto"} - ${name}`;
  location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  form.reset();
  form.elements.period.required = false;
  dialog.close();
};

// Faint drifting network in the background for depth. Reduced-motion users get one still frame.
// ponytail: O(n²) link check, fine for the ~100 points this spawns even on large screens.
const cv = document.getElementById("net"), cx = cv.getContext("2d");
const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
fit();
addEventListener("resize", fit);
const pts = Array.from({ length: Math.min(100, Math.round(innerWidth * innerHeight / 15000)) }, () =>
  ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * .8, vy: (Math.random() - .5) * .8 }));
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const frame = () => {
  cx.clearRect(0, 0, cv.width, cv.height);
  pts.forEach((p, i) => {
    if (!still) { p.x += p.vx; p.y += p.vy; }
    if (p.x < 0 || p.x > cv.width) p.vx *= -1;
    if (p.y < 0 || p.y > cv.height) p.vy *= -1;
    for (let j = i + 1; j < pts.length; j++) {
      const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 150) { cx.strokeStyle = `rgba(124,92,255,${(1 - d / 150) * .32})`; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); cx.stroke(); }
    }
    cx.fillStyle = "rgba(34,211,238,.6)";
    cx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
  });
  if (!still) requestAnimationFrame(frame);
};
frame();
