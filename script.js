const STORAGE_KEY = "servicecheck:draft:v1";

const initialState = {
  currentStep: 1,
  vehicle: { type: "", make: "", model: "", year: "", plate: "" },
  request: { categories: [], description: "" },
  urgency: { level: "" },
  appointment: { date: "", timeWindow: "", alternativeAllowed: true },
  contact: { name: "", email: "", phone: "", preferredChannel: "" },
  updatedAt: null,
};

const form = document.querySelector("#service-form");
const demoBanner = document.querySelector("#demo-banner");
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const successReturnButton = document.querySelector("#success-return-button");
const descriptionCount = document.querySelector("#description-count");
const stepNames = ["Fahrzeug", "Anliegen", "Dringlichkeit", "Termin", "Kontakt", "Übersicht"];
const successPanel = document.querySelector("#success-panel");
const vehicleModels = {
  Audi: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Anderes Modell"],
  BMW: ["1er", "2er", "3er", "4er", "5er", "X1", "X3", "X5", "Anderes Modell"],
  Ford: ["Fiesta", "Focus", "Kuga", "Puma", "Transit", "Tourneo", "Anderes Modell"],
  "Mercedes-Benz": ["A-Klasse", "B-Klasse", "C-Klasse", "E-Klasse", "GLA", "GLC", "Vito", "Sprinter", "Anderes Modell"],
  Opel: ["Astra", "Corsa", "Crossland", "Grandland", "Insignia", "Mokka", "Vivaro", "Anderes Modell"],
  "Škoda": ["Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Superb", "Anderes Modell"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y", "Anderes Modell"],
  Toyota: ["Aygo", "Corolla", "C-HR", "RAV4", "Yaris", "Proace", "Anderes Modell"],
  Volkswagen: ["Golf", "Passat", "Polo", "T-Cross", "T-Roc", "Tiguan", "Touran", "Transporter", "Anderes Modell"],
  Volvo: ["S60", "S90", "V40", "V60", "V90", "XC40", "XC60", "XC90", "Anderes Modell"],
  "Andere Marke": ["Anderes Modell"],
};

let state = loadState();
state.currentStep = 1;
applyIntegrationParams();
populateYearOptions();
restoreFields();
showStep(1, false);
form.elements.appointmentDate.min = new Date().toISOString().slice(0, 10);

if (sessionStorage.getItem("autowerk:demo-banner-dismissed") === "true") {
  demoBanner.hidden = true;
}
document.querySelector("#close-demo-banner")?.addEventListener("click", () => {
  demoBanner.hidden = true;
  sessionStorage.setItem("autowerk:demo-banner-dismissed", "true");
});

form.addEventListener("input", handleInput);
form.addEventListener("change", handleInput);
nextButton.addEventListener("click", handleNext);
backButton.addEventListener("click", handleBack);
document.querySelector("#summary-content").addEventListener("click", handleSummaryEdit);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(initialState);
    if (saved.request?.categories) {
      saved.request.categories = saved.request.categories.map((category) => ({
        "Reparatur & Defekt": "Defekt & Reparatur",
        "Diagnose & Warnleuchte": "Warnleuchte & Diagnose",
      })[category] || category);
    }
    return {
      ...structuredClone(initialState),
      ...saved,
      vehicle: { ...initialState.vehicle, ...saved.vehicle },
      request: { ...initialState.request, ...saved.request },
      urgency: { ...initialState.urgency, ...saved.urgency },
      appointment: { ...initialState.appointment, ...saved.appointment },
      contact: { ...initialState.contact, ...saved.contact },
    };
  } catch {
    return structuredClone(initialState);
  }
}

function handleInput(event) {
  const { name, value } = event.target;
  if (!name) return;

  if (name === "vehicleType") state.vehicle.type = value;
  if (name === "vehicleMake") {
    state.vehicle.make = value;
    state.vehicle.model = "";
    populateModelOptions(value);
  }
  if (name === "vehicleModel") state.vehicle.model = value;
  if (name === "year") state.vehicle.year = value;
  if (name === "plate") state.vehicle.plate = value.toUpperCase();
  if (name === "requestCategory") {
    state.request.categories = [...form.querySelectorAll('[name="requestCategory"]:checked')].map((field) => field.value);
  }
  if (name === "requestDescription") {
    state.request.description = value.slice(0, 500);
    event.target.value = state.request.description;
    descriptionCount.textContent = state.request.description.length;
  }
  if (name === "urgencyLevel") {
    state.urgency.level = value;
    document.querySelector("#safety-notice").hidden = value !== "Sicherheitskritisch oder unsicher";
  }
  if (name === "appointmentDate") state.appointment.date = value;
  if (name === "timeWindow") state.appointment.timeWindow = value;
  if (name === "alternativeAllowed") state.appointment.alternativeAllowed = event.target.checked;
  if (name === "contactName") state.contact.name = value;
  if (name === "contactEmail") state.contact.email = value;
  if (name === "contactPhone") state.contact.phone = value;
  if (name === "preferredChannel") state.contact.preferredChannel = value;

  clearFieldError(name);
  if ((name === "contactEmail" || name === "contactPhone") && value.trim()) clearFieldError("contactMethod");
  saveState();
}

function saveState() {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function restoreFields() {
  if (state.vehicle.type) {
    const radio = form.elements.vehicleType?.value === state.vehicle.type
      ? form.elements.vehicleType
      : document.querySelector(`[name="vehicleType"][value="${CSS.escape(state.vehicle.type)}"]`);
    if (radio) radio.checked = true;
  }

  form.elements.vehicleMake.value = state.vehicle.make || "";
  populateModelOptions(state.vehicle.make, state.vehicle.model);
  form.elements.year.value = state.vehicle.year || "";
  form.elements.plate.value = state.vehicle.plate || "";
  form.elements.requestDescription.value = state.request.description || "";
  descriptionCount.textContent = state.request.description?.length || 0;
  state.request.categories.forEach((category) => {
    const field = document.querySelector(`[name="requestCategory"][value="${CSS.escape(category)}"]`);
    if (field) field.checked = true;
  });
  if (state.urgency.level) {
    const field = document.querySelector(`[name="urgencyLevel"][value="${CSS.escape(state.urgency.level)}"]`);
    if (field) field.checked = true;
    document.querySelector("#safety-notice").hidden = state.urgency.level !== "Sicherheitskritisch oder unsicher";
  }
  form.elements.appointmentDate.value = state.appointment.date || "";
  form.elements.alternativeAllowed.checked = state.appointment.alternativeAllowed !== false;
  if (state.appointment.timeWindow) {
    const field = document.querySelector(`[name="timeWindow"][value="${CSS.escape(state.appointment.timeWindow)}"]`);
    if (field) field.checked = true;
  }
  form.elements.contactName.value = state.contact.name || "";
  form.elements.contactEmail.value = state.contact.email || "";
  form.elements.contactPhone.value = state.contact.phone || "";
  if (state.contact.preferredChannel) {
    const field = document.querySelector(`[name="preferredChannel"][value="${CSS.escape(state.contact.preferredChannel)}"]`);
    if (field) field.checked = true;
  }
}

function validateVehicle() {
  let valid = true;
  const selectedType = form.querySelector('[name="vehicleType"]:checked');
  const make = form.elements.vehicleMake;
  const model = form.elements.vehicleModel;
  const year = form.elements.year;
  const plate = form.elements.plate;
  const currentYear = new Date().getFullYear() + 1;

  if (!selectedType) {
    showError("vehicleType");
    valid = false;
  }

  if (!make.value) {
    showError("vehicleMake");
    make.setAttribute("aria-invalid", "true");
    if (valid) make.focus();
    valid = false;
  }
  if (!model.value) {
    showError("vehicleModel");
    model.setAttribute("aria-invalid", "true");
    if (valid) model.focus();
    valid = false;
  }
  if (!year.value || Number(year.value) < 1950 || Number(year.value) > currentYear) {
    showError("year");
    year.setAttribute("aria-invalid", "true");
    if (valid) year.focus();
    valid = false;
  }
  if (plate.value.trim().length < 3) {
    showError("plate");
    plate.setAttribute("aria-invalid", "true");
    if (valid) plate.focus();
    valid = false;
  }

  return valid;
}

function handleNext() {
  if (state.currentStep === 1 && !validateVehicle()) return;
  if (state.currentStep === 2 && !validateRequest()) return;
  if (state.currentStep === 3 && !validateUrgency()) return;
  if (state.currentStep === 4 && !validateAppointment()) return;
  if (state.currentStep === 5 && !validateContact()) return;
  if (state.currentStep === 6) {
    finishRequest();
    return;
  }

  saveState();
  showStep(state.currentStep + 1);
}

function handleBack() {
  if (state.currentStep <= 1) return;
  showStep(state.currentStep - 1);
}

function validateRequest() {
  let valid = true;
  const categories = form.querySelectorAll('[name="requestCategory"]:checked');
  const description = form.elements.requestDescription;

  if (!categories.length) {
    showError("requestCategory");
    valid = false;
  }
  if (description.value.trim().length < 10) {
    showError("requestDescription");
    description.setAttribute("aria-invalid", "true");
    if (valid) description.focus();
    valid = false;
  }
  return valid;
}

function validateUrgency() {
  const selected = form.querySelector('[name="urgencyLevel"]:checked');
  if (selected) return true;
  showError("urgencyLevel");
  return false;
}

function validateAppointment() {
  let valid = true;
  const date = form.elements.appointmentDate;
  const selectedTime = form.querySelector('[name="timeWindow"]:checked');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const chosenDate = date.value ? new Date(`${date.value}T00:00:00`) : null;

  if (!chosenDate || chosenDate < today) {
    showError("appointmentDate");
    date.setAttribute("aria-invalid", "true");
    valid = false;
  }
  if (!selectedTime) {
    showError("timeWindow");
    valid = false;
  }
  return valid;
}

function validateContact() {
  let valid = true;
  const name = form.elements.contactName;
  const email = form.elements.contactEmail;
  const phone = form.elements.contactPhone;
  const channel = form.querySelector('[name="preferredChannel"]:checked');
  const emailValid = !email.value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
  const phoneValid = !phone.value || /^[+\d][\d\s()/-]{5,}$/.test(phone.value);

  if (name.value.trim().length < 2) {
    showError("contactName");
    name.setAttribute("aria-invalid", "true");
    valid = false;
  }
  if (!email.value.trim() && !phone.value.trim()) {
    showError("contactMethod");
    valid = false;
  }
  if (!emailValid) {
    showError("contactEmail");
    email.setAttribute("aria-invalid", "true");
    valid = false;
  }
  if (!phoneValid) {
    showError("contactPhone");
    phone.setAttribute("aria-invalid", "true");
    valid = false;
  }
  if (!channel) {
    showError("preferredChannel");
    valid = false;
  } else if (channel.value === "E-Mail" && !email.value.trim()) {
    showError("contactEmail");
    email.setAttribute("aria-invalid", "true");
    valid = false;
  } else if (channel.value === "SMS" && !phone.value.trim()) {
    showError("contactPhone");
    phone.setAttribute("aria-invalid", "true");
    valid = false;
  }
  return valid;
}

function finishRequest() {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replaceAll("-", "");
  const reference = `SC-${datePart}-${String(now.getTime()).slice(-4)}`;
  const confirmationTarget = state.contact.preferredChannel === "SMS" ? state.contact.phone : state.contact.email;
  document.querySelector("#success-reference").textContent = reference;
  document.querySelector("#success-channel").textContent = `${state.contact.preferredChannel} an ${confirmationTarget}`;
  document.querySelector("#success-message").textContent = `Du bekommst jetzt eine Bestätigung per ${state.contact.preferredChannel} und die Werkstatt hat deine Anfrage erhalten.`;
  document.querySelector('[data-step="6"]').classList.add("is-complete");
  successPanel.hidden = false;
  successPanel.focus();
  nextButton.hidden = true;
  backButton.hidden = true;
  successReturnButton.hidden = false;
}

function showStep(step, focusHeading = true) {
  document.querySelector('[data-step="6"]').classList.remove("is-complete");
  document.querySelectorAll(".form-step").forEach((section) => {
    section.hidden = Number(section.dataset.step) !== step;
  });
  state.currentStep = step;
  document.querySelector("#step-counter").textContent = `${String(step).padStart(2, "0")} / 06`;
  document.querySelector("#step-name").textContent = stepNames[step - 1];
  document.querySelector("#progress-bar").style.width = `${(step / 6) * 100}%`;
  document.querySelectorAll("[data-overview-step]").forEach((item) => {
    item.classList.toggle("is-active", Number(item.dataset.overviewStep) === step);
  });
  backButton.hidden = step === 1;
  nextButton.hidden = false;
  successReturnButton.hidden = true;
  nextButton.disabled = false;
  nextButton.innerHTML = step === 6 ? `Anfrage abschließen <span>→</span>` : `Weiter <span>→</span>`;
  successPanel.hidden = true;
  if (step === 6) renderSummary();
  if (focusHeading) document.querySelector(`[data-step="${step}"] h2`).focus();
}

function renderSummary() {
  const date = state.appointment.date
    ? new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${state.appointment.date}T00:00:00`))
    : "–";
  const cards = [
    { step: 1, number: "01", title: "Fahrzeug", lead: `${state.vehicle.type} · ${state.vehicle.make} ${state.vehicle.model}`, detail: `Baujahr ${state.vehicle.year} · ${state.vehicle.plate}` },
    { step: 2, number: "02", title: "Anliegen", lead: state.request.categories.join(", "), detail: state.request.description },
    { step: 3, number: "03", title: "Dringlichkeit", lead: state.urgency.level, detail: "Eigene Einschätzung – keine Diagnose" },
    { step: 4, number: "04", title: "Terminwunsch", lead: date, detail: `${state.appointment.timeWindow} · Alternativtermin ${state.appointment.alternativeAllowed ? "möglich" : "nicht erwünscht"}` },
    { step: 5, number: "05", title: "Kontakt", lead: state.contact.name, detail: [state.contact.email, state.contact.phone, `Bevorzugt: ${state.contact.preferredChannel}`].filter(Boolean).join("\n") },
  ];

  document.querySelector("#summary-content").innerHTML = cards.map((card) => `
    <article class="summary-card">
      <header><span>${card.number} / ${escapeHtml(card.title)}</span><button type="button" data-edit-step="${card.step}">Ändern</button></header>
      <strong>${escapeHtml(card.lead)}</strong><p>${escapeHtml(card.detail)}</p>
    </article>
  `).join("");
}

function handleSummaryEdit(event) {
  const button = event.target.closest("[data-edit-step]");
  if (button) showStep(Number(button.dataset.editStep));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[character]);
}

function populateModelOptions(make, selectedModel = "") {
  const modelSelect = form.elements.vehicleModel;
  const models = vehicleModels[make] || [];
  modelSelect.innerHTML = `<option value="">${make ? "Bitte auswählen" : "Zuerst Hersteller wählen"}</option>${models
    .map((model) => `<option value="${escapeHtml(model)}">${escapeHtml(model)}</option>`)
    .join("")}`;
  modelSelect.disabled = !make;
  modelSelect.value = selectedModel;
}

function populateYearOptions() {
  const yearSelect = form.elements.year;
  const newestYear = new Date().getFullYear() + 1;
  const options = [];
  for (let year = newestYear; year >= 1950; year -= 1) options.push(`<option value="${year}">${year}</option>`);
  yearSelect.innerHTML = `<option value="">Bitte auswählen</option>${options.join("")}`;
}

function applyIntegrationParams() {
  const params = new URLSearchParams(window.location.search);
  const categoryMap = {
    inspektion: "Inspektion & Wartung",
    reifen: "Reifen & Räder",
    reparatur: "Defekt & Reparatur",
    diagnose: "Warnleuchte & Diagnose",
    hu: "Hauptuntersuchung",
    sonstiges: "Sonstiges",
  };
  const requestedCategory = categoryMap[params.get("anliegen")?.toLowerCase()];
  if (requestedCategory && !state.request.categories.includes(requestedCategory)) {
    state.request.categories.push(requestedCategory);
  }

  const fallbackUrl = "https://gzrnvjnfn6-max.github.io/autowerk-portfolio-demo/";
  let returnUrl = fallbackUrl;
  try {
    const candidate = new URL(params.get("return") || fallbackUrl, window.location.href);
    if (["http:", "https:"].includes(candidate.protocol)) returnUrl = candidate.href;
  } catch {
    returnUrl = fallbackUrl;
  }
  document.querySelector("#autowerk-link").href = returnUrl;
  successReturnButton.href = returnUrl;
}

function showError(name) {
  const error = document.querySelector(`#${name}-error`);
  if (error) error.hidden = false;
}

function clearFieldError(name) {
  const error = document.querySelector(`#${name}-error`);
  if (error) error.hidden = true;
  const field = form.elements[name];
  if (field instanceof HTMLElement) field.removeAttribute("aria-invalid");
}
