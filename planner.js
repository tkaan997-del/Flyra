"use strict";

/**
 * @typedef {Object} TripInput
 * @property {string} destination
 * @property {number} days
 * @property {number} totalBudget
 * @property {"city" | "beach" | "nature" | "food" | "surprise"} tripType
 * @property {"EUR"} currency
 */

/**
 * @typedef {Object} BudgetBreakdown
 * @property {number} accommodation
 * @property {number} transport
 * @property {number} food
 * @property {number} activities
 * @property {number} buffer
 */

/**
 * @typedef {Object} DayPlan
 * @property {number} day
 * @property {string} morning
 * @property {string} afternoon
 * @property {string} evening
 * @property {number} estimatedCost
 */

/**
 * @typedef {Object} TripPlan
 * @property {TripInput} input
 * @property {BudgetBreakdown} splitPercent
 * @property {BudgetBreakdown} splitAmount
 * @property {number} dailyBudget
 * @property {"rot" | "gelb" | "gruen"} budgetStatus
 * @property {string} budgetStatusLabel
 * @property {string} budgetStatusHint
 * @property {number | null} recommendedDays
 * @property {DayPlan[]} itinerary
 * @property {{clientId?: string, updatedAt?: string} | undefined} [collabMeta]
 */

var CATEGORY_KEYS = ["accommodation", "transport", "food", "activities", "buffer"];

var CATEGORY_LABELS = {
  accommodation: "Unterkunft",
  transport: "Transport",
  food: "Essen",
  activities: "Aktivitäten",
  buffer: "Puffer"
};

var TRIP_TYPE_LABELS = {
  city: "City",
  beach: "Strand",
  nature: "Natur",
  food: "Food",
  surprise: "Überraschung"
};

var DESTINATION_TYPES = {
  paris: "city",
  london: "city",
  rome: "city",
  barcelona: "city",
  porto: "city",
  ibiza: "beach",
  maldives: "beach",
  mallorca: "beach",
  phuket: "beach",
  bali: "beach",
  zermatt: "nature",
  interlaken: "nature",
  banff: "nature",
  dolomites: "nature",
  iceland: "nature",
  tokyo: "food",
  bangkok: "food",
  naples: "food",
  istanbul: "food",
  osaka: "food"
};

var BASE_TRIP_TYPES = ["city", "beach", "nature", "food"];

var ACTIVITY_TEMPLATES_BY_TYPE = {
  city: {
    morning: [
      "Café-Frühstück und erstes Stadtviertel erkunden",
      "Historisches Viertel entdecken und lokale Architektur ansehen",
      "Museum am Vormittag mit kurzem Espresso-Stopp",
      "Stadtrundgang mit Fokus auf bekannte Plätze und Gassen",
      "Früher Marktbesuch und Fotostopp in der Altstadt",
      "Kunst- oder Designmuseum als ruhiger Tagesstart",
      "Stadtteilspaziergang mit Aussichtspunkt und kurzen Pausen",
      "Frühstück in einem zentralen Café und Innenstadt-Orientierung"
    ],
    afternoon: [
      "Hauptattraktion besuchen und Umgebung entspannt erkunden",
      "Altstadt entdecken mit kurzen Stopps in kleinen Läden",
      "Markthalle besuchen und regionale Snacks probieren",
      "Stadtpromenade entlanglaufen und Sehenswürdigkeiten abhaken",
      "Kulturprogramm mit Museum oder Ausstellung am Nachmittag",
      "Bekanntes Wahrzeichen ansehen und angrenzendes Viertel entdecken",
      "Lokales Restaurant und danach Innenstadt-Sightseeing",
      "Stadtpark oder Flusspromenade mit flexiblem Tempo erkunden"
    ],
    evening: [
      "Abendessen im Zentrum und später Aussichtspunkt bei Sonnenuntergang",
      "Restaurant mit regionaler Küche und Spaziergang durch die Altstadt",
      "Bar oder Kulturprogramm in einem lebendigen Viertel",
      "Kulinarischer Abend und entspannter Bummel durch beleuchtete Straßen",
      "Leichtes Abendprogramm mit Musik oder kleiner Veranstaltung",
      "Dinner in einer typischen Location und Tagesrückblick",
      "Sonnenuntergangsspot und danach lockerer Stadtspaziergang",
      "Abend in einer Bar mit optionalem Kultur- oder Konzertbesuch"
    ]
  },
  beach: {
    morning: [
      "Frühstück am Meer und ruhiger Strandspaziergang",
      "Entspannter Start am Strand mit kurzem Bad",
      "Strandspaziergang entlang der Küste mit Fotopausen",
      "Morgenkaffee mit Meerblick und leichter Strandrunde",
      "Früher Start am Wasser mit entspanntem Sonnenplatz",
      "Promenade erkunden und danach Zeit am Strand",
      "Ruhiger Morgen am Meer mit kurzer Dehn- und Entspannungsphase",
      "Frühstück nahe der Küste und lockerer Spaziergang im Sand"
    ],
    afternoon: [
      "Strandaktivitäten mit Schwimmen und längerer Erholungszeit",
      "Bootstour entlang der Küste mit Pausen an Buchten",
      "Küstenwanderung mit Blick auf Meer und Klippen",
      "Zeit am Strand mit optionalen Wassersport-Angeboten",
      "Promenade, Strandpause und kurzer Besuch eines Küstendorfs",
      "Leichte Aktivität am Wasser und danach Erholung im Schatten",
      "Küstentour mit Fotostopps und entspannter Badepause",
      "Strandnachmittag mit Snack-Stopp und Zeit zum Abschalten"
    ],
    evening: [
      "Sonnenuntergang am Meer und Seafood-Restaurant",
      "Abendessen mit Meerblick und später Strandbar",
      "Ruhiger Küstenspaziergang bei Abendlicht und lockeres Dinner",
      "Seafood-Abend mit Blick auf den Hafen",
      "Sonnenuntergang am Strand und entspannter Ausklang in einer Bar",
      "Restaurant am Wasser und Abendrunde entlang der Promenade",
      "Leichter Abend mit Meerblick und regionalen Spezialitäten",
      "Strandbar zum Ausklang und kurzer Spaziergang im Sand"
    ]
  },
  nature: {
    morning: [
      "Früher Start mit Wanderung durch die Umgebung",
      "Naturpark besuchen und ruhige Pfade erkunden",
      "Aussichtspunkt am Morgen mit kurzer Fotopause",
      "Leichte Wanderroute durch Wald- und Naturwege",
      "Morgenrunde entlang eines Naturpfads mit Aussicht",
      "Ruhiger Start im Grünen mit Fokus auf Landschaft und Panorama",
      "Naturspaziergang mit kleinen Stopps an Aussichtspunkten",
      "Frühstückspicknick und kurze Wanderung zum Tagesstart"
    ],
    afternoon: [
      "See oder Wasserfall erkunden und entspannte Pause einlegen",
      "Picknick im Grünen und Naturpfad am Nachmittag",
      "Längere Tour durch Landschaftsgebiet mit Fotostopps",
      "Naturgebiet erkunden und ruhige Plätze zum Entspannen finden",
      "Wasserfallroute mit leichtem Trail und Pausen",
      "Nachmittagsrunde durch Waldpfade und Aussichtspunkte",
      "Seenlandschaft entdecken und kurze Erholungspausen einplanen",
      "Leichte Outdoor-Aktivität und Fokus auf Naturerlebnis"
    ],
    evening: [
      "Sonnenuntergang an einem Aussichtspunkt und ruhiges Abendessen",
      "Spaziergang in der Natur bei Abendlicht und entspannter Ausklang",
      "Gemütliches Abendessen in ruhiger Lage nach der Outdoor-Tour",
      "Kurzer Naturspaziergang und frühe Erholung am Abend",
      "Panorama bei Sonnenuntergang und leichter Dinner-Stopp",
      "Ruhiger Abend mit regionalem Essen und Erholung",
      "Abendrunde mit Blick ins Tal und entspanntem Abschluss",
      "Leiser Ausklang nach einem naturreichen Tag"
    ]
  },
  food: {
    morning: [
      "Lokales Frühstück in einer bekannten Bäckerei",
      "Bäckerei entdecken und Spezialitäten zum Start probieren",
      "Marktbesuch am Morgen mit kleinen Tastings",
      "Frühstückstour durch Cafés mit regionalen Produkten",
      "Food-Market-Runde und erster Kaffee des Tages",
      "Lokales Frühstück und kurzer Besuch einer Markthalle",
      "Café-Frühstück mit Fokus auf typische Dessertspezialitäten",
      "Feinkostladen und Bäckerei als kulinarischer Start"
    ],
    afternoon: [
      "Street-Food-Tour durch verschiedene Stände",
      "Lokales Restaurant mit regionalem Mittagsmenü",
      "Food Market erkunden und mehrere kleine Gerichte testen",
      "Kulinarische Viertelrunde mit Snacks und Spezialitäten",
      "Markthalle und Street-Food-Stopp am Nachmittag",
      "Genuss-Route mit lokalen Klassikern und kurzer Pause",
      "Restaurantbesuch und anschließender Food-Market-Bummel",
      "Tasting-Nachmittag mit Fokus auf regionale Küche"
    ],
    evening: [
      "Dinner Experience in einem typischen Restaurant",
      "Weinbar mit passenden kleinen Gerichten",
      "Dessert-Café und später entspannter Spaziergang",
      "Kulinarischer Abend mit regionalem Mehrgang-Menü",
      "Dinner in einem bekannten Lokal und Weinverkostung",
      "Food-Spot am Abend und Dessert-Stopp zum Abschluss",
      "Restaurantabend mit Fokus auf lokale Spezialitäten",
      "Genussvoller Ausklang in Weinbar oder Dessert-Café"
    ]
  }
};

var PLACE_SUGGESTIONS_BY_TYPE = {
  city: {
    morning: [
      "historische Altstadt",
      "Aussichtspunkt",
      "Museum",
      "lokales Caféviertel",
      "Markthalle"
    ],
    afternoon: [
      "bekannte Sehenswürdigkeit",
      "Stadtviertel mit kleinen Läden",
      "Flusspromenade",
      "Kulturviertel",
      "zentraler Markt"
    ],
    evening: [
      "Restaurantviertel",
      "Sonnenuntergangsspot",
      "belebte Altstadt",
      "lokale Bargegend",
      "kleiner Kulturort"
    ]
  },
  beach: {
    morning: [
      "Strandpromenade",
      "ruhiger Küstenabschnitt",
      "Beach Café",
      "Frühstück mit Meerblick"
    ],
    afternoon: [
      "Strandbucht",
      "Bootssteg",
      "Küstenwanderung",
      "Beach Club"
    ],
    evening: [
      "Sonnenuntergangspunkt am Meer",
      "Seafood-Restaurant",
      "Strandbar",
      "Küstenpromenade"
    ]
  },
  nature: {
    morning: [
      "Naturpfad",
      "Aussichtspunkt",
      "Waldroute",
      "ruhiger Seezugang"
    ],
    afternoon: [
      "Wasserfall",
      "Nationalparkbereich",
      "Panoramaroute",
      "Picknickplatz im Grünen"
    ],
    evening: [
      "Panorama-Spot",
      "ruhige Berghütte",
      "Naturrestaurant",
      "Abendspaziergang im Grünen"
    ]
  },
  food: {
    morning: [
      "lokale Bäckerei",
      "Markthalle",
      "Frühstückscafé",
      "Feinkostladen"
    ],
    afternoon: [
      "Street-Food-Markt",
      "bekanntes Lokal",
      "kulinarisches Viertel",
      "Food Market"
    ],
    evening: [
      "Restaurant mit regionaler Küche",
      "Weinbar",
      "Dessert-Café",
      "bekannter Food-Spot"
    ]
  }
};

var DESTINATION_PLACE_SUGGESTIONS = {
  istanbul: {
    city: {
      morning: ["Hagia Sophia", "Topkapi-Palast", "Galata-Turm"],
      afternoon: ["Grand Bazaar", "Basilica Cistern", "Sultanahmet"],
      evening: ["Galataport", "Kadıköy", "Bosporus-Ufer"]
    },
    food: {
      morning: ["lokale Bäckerei in Karaköy", "Markthalle in Kadıköy"],
      afternoon: ["Grand Bazaar", "Street-Food-Stände in Eminönü"],
      evening: ["Meyhane in Beyoğlu", "Dessert-Café in Karaköy"]
    }
  },
  porto: {
    city: {
      morning: ["Ribeira", "Livraria Lello", "Clérigos-Turm"],
      afternoon: ["São Bento", "Rua das Flores", "Uferpromenade am Douro"],
      evening: ["Vila Nova de Gaia", "Miradouro da Vitória", "Altstadtgassen"]
    },
    food: {
      morning: ["Mercado do Bolhão", "lokales Café in der Altstadt"],
      afternoon: ["Food-Spots rund um Ribeira", "Marktstände im Zentrum"],
      evening: ["Restaurant am Douro", "Weinbar in Gaia"]
    }
  },
  paris: {
    city: {
      morning: ["Louvre", "Montmartre", "Jardin du Luxembourg"],
      afternoon: ["Notre-Dame", "Le Marais", "Seine-Ufer"],
      evening: ["Eiffelturm", "Saint-Germain", "Aussichtspunkt in Montmartre"]
    },
    food: {
      morning: ["Bäckerei im Marais", "Café in Saint-Germain"],
      afternoon: ["Marktstraße in Paris", "lokales Bistro"],
      evening: ["Brasserie", "Dessert-Café", "Weinbar"]
    }
  },
  ibiza: {
    beach: {
      morning: ["Playa d’en Bossa", "Cala Comte", "ruhige Strandpromenade"],
      afternoon: ["Küstenabschnitt bei Cala Bassa", "Bootssteg", "Beach Club"],
      evening: ["Sonnenuntergangspunkt an der Küste", "Restaurant am Meer", "Strandbar"]
    }
  },
  zermatt: {
    nature: {
      morning: ["Wanderweg mit Matterhorn-Blick", "Aussichtspunkt", "ruhiger Naturpfad"],
      afternoon: ["Panoramaroute", "Naturpfad oberhalb des Dorfes", "Picknickplatz im Grünen"],
      evening: ["Aussichtspunkt bei Sonnenuntergang", "ruhiges Bergrestaurant", "Abendspaziergang"]
    }
  }
};

var currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR"
});
var timeFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit"
});

var MIN_DAILY_BUDGET = 25;
var LOW_BUDGET_WARNING_MESSAGE = "Dein Budget ist für diese Reisedauer voraussichtlich zu niedrig.";
var SHARE_LINK_COPIED_MESSAGE = "✓ Link kopiert – du kannst den Plan jetzt teilen.";
var SHARE_LINK_MANUAL_COPY_MESSAGE = "Link konnte nicht automatisch kopiert werden. Bitte manuell kopieren:";
var SHARE_FEEDBACK_TIMEOUT_MS = 4200;
var PDF_EXPORT_START_MESSAGE = "PDF wird erstellt ...";
var PDF_EXPORT_SUCCESS_MESSAGE = "PDF wurde heruntergeladen.";
var PDF_EXPORT_UNAVAILABLE_MESSAGE = "PDF-Export ist aktuell nicht verfügbar. Bitte lade die Seite neu.";
var PDF_EXPORT_ERROR_MESSAGE = "PDF konnte nicht erstellt werden. Bitte versuche es erneut.";
var PDF_EXPORT_NO_PLAN_MESSAGE = "Bitte generiere zuerst einen Reiseplan.";
var COLLAB_REMOTE_UPDATE_MESSAGE = "Plan wurde von einem anderen Gerät aktualisiert";
var COLLAB_STATUS_RESTORE_DELAY_MS = 2800;
var SHARE_ROUTE_PATH = "/plan";
var SAVED_PLAN_STORAGE_KEY = "flyra_saved_plan";
var COLLAB_TIME_PLACEHOLDER = "—";
var COLLAB_STATUS_MESSAGES = {
  "local-saved": "Plan lokal gespeichert",
  syncing: "Änderungen werden synchronisiert ...",
  synced: "Plan live synchronisiert",
  inactive: "Live-Sync aktuell nicht aktiv",
  "remote-update": COLLAB_REMOTE_UPDATE_MESSAGE
};
var SLOT_ICONS = {
  morning: "☕",
  afternoon: "📍",
  evening: "🍽"
};
var PLACE_LINK_HINT_TERMS = [
  "museum",
  "palast",
  "park",
  "bazaar",
  "bazar",
  "markt",
  "restaurant",
  "bar",
  "cafe",
  "café",
  "ufer",
  "promenade",
  "turm",
  "kirche",
  "kathedrale",
  "bäckerei",
  "baeckerei",
  "brasserie",
  "viertel",
  "garten",
  "garden",
  "hafen",
  "beach club",
  "food market",
  "nationalpark",
  "wasserfall"
];
var PLACE_LINK_STOPWORDS = {
  am: true,
  an: true,
  auf: true,
  aus: true,
  bei: true,
  der: true,
  die: true,
  das: true,
  den: true,
  des: true,
  dem: true,
  ein: true,
  eine: true,
  einem: true,
  einer: true,
  fuer: true,
  für: true,
  im: true,
  in: true,
  mit: true,
  nach: true,
  und: true,
  von: true,
  vom: true,
  zum: true,
  zur: true,
  start: true,
  morgen: true,
  nachmittag: true,
  abend: true,
  morgenidee: true,
  tagesende: true,
  tagesstart: true,
  abendprogramm: true,
  morgenprogramm: true
};
var plannerInitializationDone = false;
var currentPlan = null;
var currentTripId = null;
var SUPABASE_URL = typeof window !== "undefined" ? String(window.FLYRA_SUPABASE_URL || "").trim() : "";
var SUPABASE_ANON_KEY = typeof window !== "undefined" ? String(window.FLYRA_SUPABASE_ANON_KEY || "").trim() : "";
var supabaseClient = null;
var COLLAB_CLIENT_ID = "flyra-client-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);

function toCents(amount) {
  return Math.round(amount * 100);
}

function fromCents(cents) {
  return Number((cents / 100).toFixed(2));
}

function clearElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

/**
 * @param {string | null | undefined} state
 * @returns {"local-saved" | "syncing" | "synced" | "inactive" | "remote-update"}
 */
function normalizeCollabStatusState(state) {
  var normalized = String(state || "").trim().toLowerCase();
  if (
    normalized === "local-saved" ||
    normalized === "syncing" ||
    normalized === "synced" ||
    normalized === "inactive" ||
    normalized === "remote-update"
  ) {
    return /** @type {"local-saved" | "syncing" | "synced" | "inactive" | "remote-update"} */ (normalized);
  }

  return "inactive";
}

/**
 * @param {Date | string | number | null | undefined} value
 * @returns {Date | null}
 */
function parseDateLike(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }

  var parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    return null;
  }

  return parsed;
}

/**
 * @param {Date | string | number | null | undefined} value
 * @returns {string}
 */
function formatCollabTimestamp(value) {
  var parsed = parseDateLike(value);
  if (!parsed) {
    return COLLAB_TIME_PLACEHOLDER;
  }

  return timeFormatter.format(parsed);
}

/**
 * @param {"local-saved" | "syncing" | "synced" | "inactive" | "remote-update"} state
 * @param {string | null | undefined} customMessage
 * @returns {string}
 */
function getCollabStatusText(state, customMessage) {
  var custom = String(customMessage || "").trim();
  if (custom) {
    return custom;
  }

  return COLLAB_STATUS_MESSAGES[state] || COLLAB_STATUS_MESSAGES.inactive;
}

/**
 * @param {Date | string | number | null | undefined} lastSavedAt
 * @returns {string}
 */
function getCollabStatusTimeText(lastSavedAt) {
  return "Zuletzt gespeichert: " + formatCollabTimestamp(lastSavedAt);
}

/**
 * @param {HTMLElement} rootEl
 * @param {"local-saved" | "syncing" | "synced" | "inactive" | "remote-update"} state
 * @param {Date | string | number | null | undefined} lastSavedAt
 * @param {string | null | undefined} customMessage
 */
function applyCollabStatusBarState(rootEl, state, lastSavedAt, customMessage) {
  if (!rootEl) {
    return;
  }

  var statusBar = rootEl.querySelector("[data-collab-status-bar]");
  if (!statusBar) {
    return;
  }

  statusBar.classList.remove(
    "collab-status-bar--local-saved",
    "collab-status-bar--syncing",
    "collab-status-bar--synced",
    "collab-status-bar--inactive",
    "collab-status-bar--remote-update"
  );
  statusBar.classList.add("collab-status-bar--" + state);

  var textEl = statusBar.querySelector("[data-collab-status-text]");
  if (textEl) {
    textEl.textContent = getCollabStatusText(state, customMessage);
  }

  var timeEl = statusBar.querySelector("[data-collab-status-time]");
  if (timeEl) {
    timeEl.textContent = getCollabStatusTimeText(lastSavedAt);
  }
}

/**
 * @param {"local-saved" | "syncing" | "synced" | "inactive" | "remote-update"} state
 * @param {Date | string | number | null | undefined} lastSavedAt
 * @param {string | null | undefined} customMessage
 * @returns {HTMLDivElement}
 */
function createCollabStatusBar(state, lastSavedAt, customMessage) {
  var wrapper = document.createElement("div");
  wrapper.className = "collab-status-bar collab-status-bar--" + state;
  wrapper.setAttribute("data-collab-status-bar", "true");
  wrapper.setAttribute("aria-live", "polite");

  var dot = document.createElement("span");
  dot.className = "collab-status-dot";
  dot.setAttribute("aria-hidden", "true");
  wrapper.appendChild(dot);

  var content = document.createElement("div");
  content.className = "collab-status-content";

  var textEl = document.createElement("p");
  textEl.className = "collab-status-text";
  textEl.setAttribute("data-collab-status-text", "true");
  textEl.textContent = getCollabStatusText(state, customMessage);
  content.appendChild(textEl);

  var timeEl = document.createElement("p");
  timeEl.className = "collab-status-time";
  timeEl.setAttribute("data-collab-status-time", "true");
  timeEl.textContent = getCollabStatusTimeText(lastSavedAt);
  content.appendChild(timeEl);

  wrapper.appendChild(content);
  return wrapper;
}

/**
 * @param {TripPlan | null | undefined} plan
 * @returns {Date | null}
 */
function getPlanCollabUpdatedAt(plan) {
  if (!plan || !plan.collabMeta || typeof plan.collabMeta !== "object") {
    return null;
  }

  return parseDateLike(plan.collabMeta.updatedAt);
}

function getBudgetStatus(dailyBudget) {
  if (dailyBudget < MIN_DAILY_BUDGET) {
    return "rot";
  }

  if (dailyBudget < 100) {
    return "gelb";
  }

  return "gruen";
}

function getBudgetStatusLabel(status) {
  if (status === "gelb") {
    return "knapp";
  }

  if (status === "gruen") {
    return "gut geeignet";
  }

  return "kritisch";
}

function getBudgetStatusHint(status) {
  if (status === "rot") {
    return LOW_BUDGET_WARNING_MESSAGE;
  }

  if (status === "gelb") {
    return "Dein Budget ist eher knapp. Plane vor Ort bewusst.";
  }

  if (status === "gruen") {
    return "Dein Budget wirkt für diese Reisedauer gut geeignet.";
  }

  return "";
}

function getRecommendedDays(totalBudget) {
  return Math.max(1, Math.floor(totalBudget / MIN_DAILY_BUDGET));
}

function formatDestinationForDisplay(destination) {
  return destination
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * @param {string | null | undefined} destination
 * @returns {string}
 */
function normalizeDestinationKey(destination) {
  var value = String(destination || "").trim().toLowerCase();
  if (typeof value.normalize === "function") {
    value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  return value.replace(/\s+/g, " ").trim();
}

/**
 * @param {string | null | undefined} destination
 * @returns {"city" | "beach" | "nature" | "food" | null}
 */
function getSuggestedTripType(destination) {
  var key = normalizeDestinationKey(destination);
  if (!key) {
    return null;
  }
  return DESTINATION_TYPES[key] || null;
}

/**
 * @param {string} value
 * @returns {number}
 */
function hashString(value) {
  var normalized = String(value || "");
  var hash = 0;

  for (var index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
  }

  return hash;
}

/**
 * @param {string | null | undefined} tripType
 * @returns {"city" | "beach" | "nature" | "food" | "surprise"}
 */
function normalizeTripType(tripType) {
  var value = String(tripType || "").trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(TRIP_TYPE_LABELS, value)) {
    return /** @type {"city" | "beach" | "nature" | "food" | "surprise"} */ (value);
  }
  return "city";
}

/**
 * @param {string} tripType
 * @returns {string}
 */
function getTripTypeLabel(tripType) {
  var normalized = normalizeTripType(tripType);
  return TRIP_TYPE_LABELS[normalized] || TRIP_TYPE_LABELS.city;
}

/**
 * @returns {Storage | null}
 */
function getBrowserLocalStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

/**
 * @param {TripPlan} plan
 * @param {string | null | undefined} tripId
 * @returns {any}
 */
function serializePlanForLocalStorage(plan, tripId) {
  if (!plan || !plan.input || !Array.isArray(plan.itinerary)) {
    return null;
  }

  return {
    destination: plan.input.destination,
    days: plan.input.days,
    budget: plan.input.totalBudget,
    travelType: getTripTypeLabel(plan.input.tripType),
    tripType: normalizeTripType(plan.input.tripType),
    tripId: tripId && isUuid(tripId) ? String(tripId) : null,
    dailyPlan: plan.itinerary.map(function (day) {
      return {
        morning: String(day.morning || ""),
        afternoon: String(day.afternoon || ""),
        evening: String(day.evening || "")
      };
    }),
    plan: plan.itinerary.map(function (day) {
      return {
        morning: String(day.morning || ""),
        afternoon: String(day.afternoon || ""),
        evening: String(day.evening || "")
      };
    }),
    savedAt: new Date().toISOString()
  };
}

/**
 * @param {TripPlan} plan
 * @param {string | null | undefined} tripId
 */
function savePlanToLocalStorage(plan, tripId) {
  var storage = getBrowserLocalStorage();
  if (!storage) {
    return;
  }

  var payload = serializePlanForLocalStorage(plan, tripId);
  if (!payload) {
    return;
  }

  try {
    storage.setItem(SAVED_PLAN_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("[Flyra LocalSave] Speichern in localStorage fehlgeschlagen.", error);
  }
}

function clearSavedPlanFromLocalStorage() {
  var storage = getBrowserLocalStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(SAVED_PLAN_STORAGE_KEY);
  } catch (error) {
    console.warn("[Flyra LocalSave] Löschen aus localStorage fehlgeschlagen.", error);
  }
}

/**
 * @param {any[]} source
 * @returns {{morning: string, afternoon: string, evening: string}[]}
 */
function sanitizeSavedDailyPlan(source) {
  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map(function (entry) {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      return {
        morning: String(entry.morning || ""),
        afternoon: String(entry.afternoon || ""),
        evening: String(entry.evening || "")
      };
    })
    .filter(Boolean);
}

/**
 * @returns {{destination: string, days: number, budget: number, tripType: "city" | "beach" | "nature" | "food" | "surprise", travelType: string, tripId: string | null, dailyPlan: {morning: string, afternoon: string, evening: string}[]} | null}
 */
function loadSavedPlanFromLocalStorage() {
  var storage = getBrowserLocalStorage();
  if (!storage) {
    return null;
  }

  var raw = null;
  try {
    raw = storage.getItem(SAVED_PLAN_STORAGE_KEY);
  } catch (error) {
    console.warn("[Flyra LocalSave] Lesen aus localStorage fehlgeschlagen.", error);
    return null;
  }

  if (!raw) {
    return null;
  }

  var parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return null;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  var destination = String(parsed.destination || "").trim();
  var days = Number(parsed.days);
  var budget = Number(parsed.budget);
  var tripType = normalizeTripType(parsed.tripType || parsed.travelType || "city");
  var travelType = getTripTypeLabel(tripType);
  var tripId = parsed.tripId && isUuid(parsed.tripId) ? String(parsed.tripId) : null;
  var dailyPlan = sanitizeSavedDailyPlan(parsed.dailyPlan || parsed.plan || []);

  if (
    !destination ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > 30 ||
    !Number.isFinite(budget) ||
    budget <= 0
  ) {
    return null;
  }

  return {
    destination: destination,
    days: days,
    budget: Number(budget.toFixed(2)),
    tripType: tripType,
    travelType: travelType,
    tripId: tripId,
    dailyPlan: dailyPlan
  };
}

/**
 * @param {TripPlan} plan
 * @param {{dailyPlan: {morning: string, afternoon: string, evening: string}[]}} savedPlan
 */
function applySavedPlanEdits(plan, savedPlan) {
  if (!plan || !Array.isArray(plan.itinerary) || !savedPlan || !Array.isArray(savedPlan.dailyPlan)) {
    return;
  }

  var maxDays = Math.min(plan.itinerary.length, savedPlan.dailyPlan.length);
  for (var dayIndex = 0; dayIndex < maxDays; dayIndex += 1) {
    var savedDay = savedPlan.dailyPlan[dayIndex];
    var targetDay = plan.itinerary[dayIndex];
    if (!savedDay || !targetDay) {
      continue;
    }

    targetDay.morning = String(savedDay.morning || "");
    targetDay.afternoon = String(savedDay.afternoon || "");
    targetDay.evening = String(savedDay.evening || "");
  }
}

/**
 * @param {TripPlan} plan
 * @param {{destination: string, days: number, budget: number, tripType: string, tripId: string | null}} savedPlan
 * @param {string | null | undefined} tripId
 * @returns {boolean}
 */
function doesSavedPlanMatch(plan, savedPlan, tripId) {
  if (!plan || !plan.input || !savedPlan) {
    return false;
  }

  if (tripId && savedPlan.tripId) {
    return String(tripId) === String(savedPlan.tripId);
  }

  return (
    normalizeDestinationKey(plan.input.destination) === normalizeDestinationKey(savedPlan.destination) &&
    Number(plan.input.days) === Number(savedPlan.days) &&
    toCents(Number(plan.input.totalBudget)) === toCents(Number(savedPlan.budget)) &&
    normalizeTripType(plan.input.tripType) === normalizeTripType(savedPlan.tripType)
  );
}

/**
 * @param {{destination: string, days: number, budget: number, tripType: "city" | "beach" | "nature" | "food" | "surprise"}} savedPlan
 * @returns {TripInput}
 */
function mapSavedPlanToInput(savedPlan) {
  return {
    destination: savedPlan.destination,
    days: savedPlan.days,
    totalBudget: savedPlan.budget,
    tripType: normalizeTripType(savedPlan.tripType),
    currency: "EUR"
  };
}

/**
 * @returns {any}
 */
function getSupabaseClient() {
  if (
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY ||
    typeof window === "undefined" ||
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseClient;
}

/**
 * @param {string | null | undefined} value
 * @returns {boolean}
 */
function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

/**
 * @param {TripInput} input
 * @returns {boolean}
 */
function isValidTripInput(input) {
  return Boolean(
    input &&
    typeof input.destination === "string" &&
    input.destination.trim().length > 0 &&
    Number.isInteger(input.days) &&
    input.days >= 1 &&
    input.days <= 30 &&
    Number.isFinite(input.totalBudget) &&
    input.totalBudget > 0
  );
}

/**
 * @param {TripInput} input
 * @returns {TripInput}
 */
function sanitizeTripInput(input) {
  return {
    destination: String(input.destination || "").trim(),
    days: Number(input.days),
    totalBudget: Number(Number(input.totalBudget || 0).toFixed(2)),
    tripType: normalizeTripType(input.tripType),
    currency: "EUR"
  };
}

/**
 * @param {TripPlan} plan
 * @param {string | null | undefined} clientId
 * @returns {TripPlan}
 */
function toPersistedPlanData(plan, clientId) {
  var snapshot = JSON.parse(JSON.stringify(plan));
  snapshot.collabMeta = {
    clientId: String(clientId || "").trim(),
    updatedAt: new Date().toISOString()
  };
  return snapshot;
}

/**
 * @param {any} planData
 * @returns {string}
 */
function getCollabEditorClientId(planData) {
  if (!planData || typeof planData !== "object" || !planData.collabMeta || typeof planData.collabMeta !== "object") {
    return "";
  }

  return String(planData.collabMeta.clientId || "").trim();
}

/**
 * @param {TripPlan} plan
 * @param {string | null | undefined} editorClientId
 * @returns {Promise<string | null>}
 */
function saveTripToSupabase(plan, editorClientId) {
  var client = getSupabaseClient();
  if (!client || !plan || !plan.input) {
    return Promise.resolve(null);
  }

  var payload = {
    destination: plan.input.destination,
    days: plan.input.days,
    budget: plan.input.totalBudget,
    trip_type: normalizeTripType(plan.input.tripType),
    plan_data: toPersistedPlanData(plan, editorClientId)
  };

  return client
    .from("trips")
    .insert(payload)
    .select("id")
    .single()
    .then(function (response) {
      if (response.error || !response.data || !response.data.id) {
        if (response.error) {
          console.error("[Flyra Supabase] Speichern fehlgeschlagen.", response.error);
        }
        return null;
      }

      return String(response.data.id);
    })
    .catch(function (error) {
      console.error("[Flyra Supabase] Speichern fehlgeschlagen.", error);
      return null;
    });
}

/**
 * @param {string} tripId
 * @param {TripPlan} plan
 * @param {string | null | undefined} editorClientId
 * @returns {Promise<boolean>}
 */
function updateTripPlanInSupabase(tripId, plan, editorClientId) {
  var client = getSupabaseClient();
  if (!client || !isUuid(tripId) || !plan || !plan.input) {
    return Promise.resolve(false);
  }

  return client
    .from("trips")
    .update({
      plan_data: toPersistedPlanData(plan, editorClientId)
    })
    .eq("id", tripId)
    .select("id")
    .maybeSingle()
    .then(function (response) {
      if (response.error || !response.data || !response.data.id) {
        if (response.error) {
          console.error("[Flyra Supabase] Update fehlgeschlagen.", response.error);
        }
        return false;
      }

      return true;
    })
    .catch(function (error) {
      console.error("[Flyra Supabase] Update fehlgeschlagen.", error);
      return false;
    });
}

/**
 * @param {string} tripId
 * @returns {Promise<{id: string, plan: TripPlan} | null>}
 */
function loadTripFromSupabase(tripId) {
  var client = getSupabaseClient();
  if (!client || !isUuid(tripId)) {
    return Promise.resolve(null);
  }

  return client
    .from("trips")
    .select("id,destination,days,budget,trip_type,plan_data")
    .eq("id", tripId)
    .maybeSingle()
    .then(function (response) {
      if (response.error || !response.data) {
        if (response.error) {
          console.error("[Flyra Supabase] Laden fehlgeschlagen.", response.error);
        }
        return null;
      }

      var row = response.data;
      var storedPlan = row.plan_data && typeof row.plan_data === "object" ? row.plan_data : null;
      var input = sanitizeTripInput({
        destination: row.destination || (storedPlan && storedPlan.input ? storedPlan.input.destination : ""),
        days: row.days || (storedPlan && storedPlan.input ? storedPlan.input.days : 0),
        totalBudget: row.budget || (storedPlan && storedPlan.input ? storedPlan.input.totalBudget : 0),
        tripType: row.trip_type || (storedPlan && storedPlan.input ? storedPlan.input.tripType : "city"),
        currency: "EUR"
      });

      if (!isValidTripInput(input)) {
        return null;
      }

      var plan = storedPlan;
      if (
        !plan ||
        !Array.isArray(plan.itinerary) ||
        !plan.splitPercent ||
        !plan.splitAmount ||
        typeof plan.dailyBudget !== "number"
      ) {
        plan = buildTripPlan(input);
      } else {
        plan.input = input;
      }

      return {
        id: String(row.id),
        plan: plan
      };
    })
    .catch(function (error) {
      console.error("[Flyra Supabase] Laden fehlgeschlagen.", error);
      return null;
    });
}

/**
 * @param {TripInput} input
 * @param {number} dayIndex
 * @returns {"city" | "beach" | "nature" | "food"}
 */
function getTemplateTypeForDay(input, dayIndex) {
  var normalizedType = normalizeTripType(input.tripType);
  if (normalizedType !== "surprise") {
    return /** @type {"city" | "beach" | "nature" | "food"} */ (normalizedType);
  }

  var destinationSeed = hashString(String(input.destination || "").trim().toLowerCase());
  var surpriseIndex = (destinationSeed + dayIndex) % BASE_TRIP_TYPES.length;
  return BASE_TRIP_TYPES[surpriseIndex];
}

/**
 * @param {string} destination
 * @returns {string}
 */
function normalizeDestinationForFilename(destination) {
  var value = String(destination || "").trim().toLowerCase();

  if (typeof value.normalize === "function") {
    value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  value = value
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return value || "reiseplan";
}

/**
 * @param {TripInput} input
 * @returns {string}
 */
function buildPdfFilename(input) {
  return "flyra-reiseplan-" + normalizeDestinationForFilename(input.destination) + ".pdf";
}

/**
 * @param {HTMLElement | null | undefined} feedbackEl
 * @param {string} message
 * @param {"info" | "success" | "error"} tone
 */
function renderExportFeedback(feedbackEl, message, tone) {
  if (!feedbackEl) {
    return;
  }

  feedbackEl.classList.remove(
    "is-hidden",
    "share-feedback--success",
    "share-feedback--error",
    "export-feedback--info"
  );
  feedbackEl.textContent = message;

  if (tone === "success") {
    feedbackEl.classList.add("share-feedback--success");
    return;
  }

  if (tone === "error") {
    feedbackEl.classList.add("share-feedback--error");
    return;
  }

  feedbackEl.classList.add("export-feedback--info");
}

/**
 * @returns {any}
 */
function getJsPdfConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.jspdf && typeof window.jspdf.jsPDF === "function") {
    return window.jspdf.jsPDF;
  }

  if (typeof window.jsPDF === "function") {
    return window.jsPDF;
  }

  return null;
}

/**
 * @param {TripPlan} plan
 * @param {HTMLElement | null | undefined} feedbackEl
 * @param {HTMLButtonElement | null | undefined} triggerButton
 * @returns {Promise<void>}
 */
function exportPlanAsPdf(plan, feedbackEl, triggerButton) {
  if (!plan || !plan.input) {
    renderExportFeedback(feedbackEl, PDF_EXPORT_NO_PLAN_MESSAGE, "error");
    return Promise.resolve();
  }

  if (triggerButton) {
    triggerButton.disabled = true;
  }
  renderExportFeedback(feedbackEl, PDF_EXPORT_START_MESSAGE, "info");

  var JsPdfConstructor = getJsPdfConstructor();
  if (!JsPdfConstructor) {
    renderExportFeedback(feedbackEl, PDF_EXPORT_UNAVAILABLE_MESSAGE, "error");
    if (triggerButton) {
      triggerButton.disabled = false;
    }
    return Promise.resolve();
  }

  return Promise.resolve()
    .then(function () {
      var doc = new JsPdfConstructor({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      var pageWidth = doc.internal.pageSize.getWidth();
      var pageHeight = doc.internal.pageSize.getHeight();
      var marginLeft = 14;
      var marginRight = 14;
      var topMargin = 14;
      var bottomMargin = 14;
      var contentWidth = pageWidth - marginLeft - marginRight;
      var y = topMargin;
      var colorAccent = [24, 95, 90];
      var colorMuted = [90, 108, 112];
      var colorText = [28, 43, 46];
      var colorBorder = [209, 221, 223];
      var colorSoft = [241, 247, 246];
      var colorCard = [249, 252, 251];

      function ensureSpace(heightNeeded) {
        if (y + heightNeeded > pageHeight - bottomMargin) {
          doc.addPage();
          y = topMargin;
        }
      }

      function splitLines(text, width, fontSize, style) {
        doc.setFont("helvetica", style || "normal");
        doc.setFontSize(fontSize);
        return doc.splitTextToSize(String(text), width);
      }

      function writeSectionTitle(title) {
        ensureSpace(12);
        if (y > topMargin + 2) {
          doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
          doc.setLineWidth(0.4);
          doc.line(marginLeft, y, marginLeft + contentWidth, y);
          y += 4;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
        doc.text(title, marginLeft, y);
        y += 3;
        doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
        doc.setLineWidth(0.2);
        doc.line(marginLeft, y, marginLeft + contentWidth, y);
        y += 4;
      }

      function getInfoCardHeight(value, width) {
        var valueLines = splitLines(value, width - 8, 11.5, "bold");
        return 5 + 4.2 + valueLines.length * 4.8 + 4.5;
      }

      function drawInfoCard(x, yPos, width, height, label, value) {
        var valueLines = splitLines(value, width - 8, 11.5, "bold");
        doc.setFillColor(colorCard[0], colorCard[1], colorCard[2]);
        doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
        doc.roundedRect(x, yPos, width, height, 1.8, 1.8, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.6);
        doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
        doc.text(label, x + 4, yPos + 5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11.5);
        doc.setTextColor(colorText[0], colorText[1], colorText[2]);
        doc.text(valueLines, x + 4, yPos + 10.2);
      }

      function drawStatusCard(x, yPos, width, statusValue, statusHint) {
        var statusLines = splitLines(statusValue, width - 8, 11.8, "bold");
        var hintLines = splitLines(statusHint, width - 8, 9.7, "normal");
        var cardHeight = 5 + 4.2 + statusLines.length * 4.8 + 1.2 + hintLines.length * 4.2 + 4.5;

        ensureSpace(cardHeight + 2);
        doc.setFillColor(colorCard[0], colorCard[1], colorCard[2]);
        doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
        doc.roundedRect(x, yPos, width, cardHeight, 1.8, 1.8, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.6);
        doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
        doc.text("Budgetstatus", x + 4, yPos + 5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11.8);
        doc.setTextColor(colorText[0], colorText[1], colorText[2]);
        doc.text(statusLines, x + 4, yPos + 10.2);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.7);
        doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
        doc.text(hintLines, x + 4, yPos + 10.2 + statusLines.length * 4.8 + 1.2);

        return cardHeight;
      }

      function drawBudgetTable() {
        var tableX = marginLeft;
        var tableY = y;
        var tableWidth = contentWidth;
        var headerHeight = 7.6;
        var rowHeight = 7.2;
        var tableHeight = headerHeight + CATEGORY_KEYS.length * rowHeight;
        var colSplit1 = tableX + tableWidth * 0.56;
        var colSplit2 = tableX + tableWidth * 0.76;

        ensureSpace(tableHeight + 2);
        tableY = y;

        doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
        doc.setLineWidth(0.25);
        doc.roundedRect(tableX, tableY, tableWidth, tableHeight, 1.6, 1.6, "S");

        doc.setFillColor(colorSoft[0], colorSoft[1], colorSoft[2]);
        doc.rect(tableX, tableY, tableWidth, headerHeight, "F");

        doc.line(colSplit1, tableY, colSplit1, tableY + tableHeight);
        doc.line(colSplit2, tableY, colSplit2, tableY + tableHeight);
        for (var rowIndex = 1; rowIndex <= CATEGORY_KEYS.length; rowIndex += 1) {
          var rowLineY = tableY + headerHeight + rowIndex * rowHeight;
          doc.line(tableX, rowLineY, tableX + tableWidth, rowLineY);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
        doc.text("Kategorie", tableX + 3, tableY + 5.2);
        doc.text("Anteil", colSplit2 - 2.2, tableY + 5.2, { align: "right" });
        doc.text("Betrag", tableX + tableWidth - 3, tableY + 5.2, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(colorText[0], colorText[1], colorText[2]);

        CATEGORY_KEYS.forEach(function (key, index) {
          var rowTextY = tableY + headerHeight + index * rowHeight + 4.8;
          doc.text(CATEGORY_LABELS[key], tableX + 3, rowTextY);
          doc.text(String(plan.splitPercent[key]) + "%", colSplit2 - 2.2, rowTextY, { align: "right" });
          doc.text(formatCurrency(plan.splitAmount[key]), tableX + tableWidth - 3, rowTextY, { align: "right" });
        });

        y = tableY + tableHeight + 5;
      }

      function drawDayBlock(dayPlan) {
        var cardX = marginLeft;
        var cardY = y;
        var cardWidth = contentWidth;
        var innerPadding = 4.5;
        var slotLabelWidth = 23;
        var slotValueWidth = cardWidth - innerPadding * 2 - slotLabelWidth;
        var slotLineHeight = 4.2;
        var slotGap = 1.2;
        var titleHeight = 5.8;
        var costHeight = 6.8;

        var morningLines = splitLines(dayPlan.morning, slotValueWidth, 9.8, "normal");
        var afternoonLines = splitLines(dayPlan.afternoon, slotValueWidth, 9.8, "normal");
        var eveningLines = splitLines(dayPlan.evening, slotValueWidth, 9.8, "normal");

        var morningHeight = Math.max(1, morningLines.length) * slotLineHeight + slotGap;
        var afternoonHeight = Math.max(1, afternoonLines.length) * slotLineHeight + slotGap;
        var eveningHeight = Math.max(1, eveningLines.length) * slotLineHeight + slotGap;
        var cardHeight = innerPadding + titleHeight + 1.4 + morningHeight + afternoonHeight + eveningHeight + 1.8 + costHeight + innerPadding;

        ensureSpace(cardHeight + 3);
        cardY = y;

        doc.setFillColor(252, 253, 253);
        doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 1.8, 1.8, "FD");

        var cursorY = cardY + innerPadding + 4.2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11.3);
        doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
        doc.text("Tag " + dayPlan.day, cardX + innerPadding, cursorY);
        cursorY += 2.2;

        doc.setDrawColor(222, 232, 233);
        doc.setLineWidth(0.2);
        doc.line(cardX + innerPadding, cursorY, cardX + cardWidth - innerPadding, cursorY);
        cursorY += 3.4;

        function drawSlot(label, lines) {
          var slotStartY = cursorY;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.8);
          doc.setTextColor(colorText[0], colorText[1], colorText[2]);
          doc.text(label + ":", cardX + innerPadding, slotStartY);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.8);
          doc.setTextColor(colorText[0], colorText[1], colorText[2]);
          doc.text(lines, cardX + innerPadding + slotLabelWidth, slotStartY);

          cursorY += Math.max(1, lines.length) * slotLineHeight + slotGap;
        }

        drawSlot("Morgen", morningLines);
        drawSlot("Nachmittag", afternoonLines);
        drawSlot("Abend", eveningLines);

        var costY = cardY + cardHeight - innerPadding - costHeight;
        doc.setFillColor(colorSoft[0], colorSoft[1], colorSoft[2]);
        doc.setDrawColor(204, 219, 216);
        doc.roundedRect(cardX + innerPadding, costY, cardWidth - innerPadding * 2, costHeight, 1.2, 1.2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.8);
        doc.setTextColor(colorText[0], colorText[1], colorText[2]);
        doc.text("Geplante Ausgaben", cardX + innerPadding + 2.4, costY + 4.4);
        doc.text(formatCurrency(dayPlan.estimatedCost), cardX + cardWidth - innerPadding - 2.4, costY + 4.4, { align: "right" });

        y = cardY + cardHeight + 3.2;
      }

      var formattedDestination = formatDestinationForDisplay(plan.input.destination);

      var heroHeight = 31;
      ensureSpace(heroHeight + 4);
      doc.setFillColor(colorSoft[0], colorSoft[1], colorSoft[2]);
      doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
      doc.roundedRect(marginLeft, y, contentWidth, heroHeight, 2.2, 2.2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
      doc.text("Flyra Reiseplan", marginLeft + 6, y + 10.8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.8);
      doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
      var heroMeta = "Reiseziel: " + formattedDestination + "  •  Reisetyp: " + getTripTypeLabel(plan.input.tripType) + "  •  Reisedauer: " + plan.input.days + " Tage  •  Gesamtbudget: " + formatCurrency(plan.input.totalBudget);
      var heroLines = splitLines(heroMeta, contentWidth - 12, 10.8, "normal");
      doc.text(heroLines, marginLeft + 6, y + 17.4);
      y += heroHeight + 6;

      writeSectionTitle("Überblick");
      var gap = 4;
      var columnWidth = (contentWidth - gap) / 2;
      var rowOneHeight = Math.max(
        getInfoCardHeight(formattedDestination, columnWidth),
        getInfoCardHeight(getTripTypeLabel(plan.input.tripType), columnWidth)
      );
      ensureSpace(rowOneHeight + 2);
      drawInfoCard(marginLeft, y, columnWidth, rowOneHeight, "Reiseziel", formattedDestination);
      drawInfoCard(marginLeft + columnWidth + gap, y, columnWidth, rowOneHeight, "Reisetyp", getTripTypeLabel(plan.input.tripType));
      y += rowOneHeight + 3;

      var rowTwoHeight = Math.max(
        getInfoCardHeight(String(plan.input.days) + " Tage", columnWidth),
        getInfoCardHeight(formatCurrency(plan.input.totalBudget), columnWidth)
      );
      ensureSpace(rowTwoHeight + 2);
      drawInfoCard(marginLeft, y, columnWidth, rowTwoHeight, "Reisedauer", String(plan.input.days) + " Tage");
      drawInfoCard(marginLeft + columnWidth + gap, y, columnWidth, rowTwoHeight, "Gesamtbudget", formatCurrency(plan.input.totalBudget));
      y += rowTwoHeight + 3;

      var rowThreeHeight = getInfoCardHeight(formatCurrency(plan.dailyBudget), contentWidth);
      ensureSpace(rowThreeHeight + 2);
      drawInfoCard(marginLeft, y, contentWidth, rowThreeHeight, "Tagesbudget", formatCurrency(plan.dailyBudget));
      y += rowThreeHeight + 3;

      var statusText = plan.budgetStatusLabel;
      var statusHintText = plan.budgetStatusHint;
      if (plan.budgetStatus === "rot" && plan.recommendedDays !== null) {
        statusHintText += " Mit deinem aktuellen Budget wären eher " + plan.recommendedDays + " " + (plan.recommendedDays === 1 ? "Tag" : "Tage") + " realistischer.";
      }
      var statusHeight = drawStatusCard(marginLeft, y, contentWidth, statusText, statusHintText);
      y += statusHeight + 5;

      writeSectionTitle("Budgetaufteilung");
      drawBudgetTable();

      writeSectionTitle("Tagesplan");
      plan.itinerary.forEach(function (dayPlan) {
        drawDayBlock(dayPlan);
      });

      doc.save(buildPdfFilename(plan.input));
      console.log("PDF export started");
    })
    .then(function () {
      renderExportFeedback(feedbackEl, PDF_EXPORT_SUCCESS_MESSAGE, "success");
      if (typeof window !== "undefined" && typeof window.setTimeout === "function") {
        window.setTimeout(function hideExportSuccess() {
          if (feedbackEl) {
            feedbackEl.classList.add("is-hidden");
            feedbackEl.classList.remove(
              "share-feedback--success",
              "share-feedback--error",
              "export-feedback--info"
            );
          }
        }, 3200);
      }
    })
    .catch(function (error) {
      console.error("[Flyra PDF] Export fehlgeschlagen.", error);
      renderExportFeedback(feedbackEl, PDF_EXPORT_ERROR_MESSAGE, "error");
    })
    .then(function () {
      if (triggerButton) {
        triggerButton.disabled = false;
      }
    });
}

/**
 * @param {TripInput} input
 * @param {string | null | undefined} tripId
 * @returns {string}
 */
function buildShareQuery(input, tripId) {
  if (tripId && isUuid(tripId)) {
    return "?trip=" + encodeURIComponent(String(tripId));
  }

  var params = new URLSearchParams();
  params.set("destination", input.destination);
  params.set("days", String(input.days));
  params.set("budget", String(input.totalBudget));
  params.set("travelType", normalizeTripType(input.tripType));
  return "?" + params.toString();
}

/**
 * @param {TripInput} input
 * @param {string | null | undefined} tripId
 * @returns {string}
 */
function buildShareUrl(input, tripId) {
  var query = buildShareQuery(input, tripId);

  if (typeof window === "undefined" || !window.location) {
    return SHARE_ROUTE_PATH + query;
  }

  if (window.location.origin && window.location.origin !== "null") {
    var resolvedUrl = new URL(SHARE_ROUTE_PATH, window.location.origin);
    resolvedUrl.search = query;
    resolvedUrl.hash = "";
    return resolvedUrl.toString();
  }

  return SHARE_ROUTE_PATH + query;
}

/**
 * @param {TripInput} input
 */
function syncShareQueryInAddressBar(input) {
  if (
    typeof window === "undefined" ||
    !window.history ||
    typeof window.history.replaceState !== "function"
  ) {
    return;
  }

  window.history.replaceState(null, "", window.location.pathname + buildShareQuery(input));
}

/**
 * @param {string} tripId
 */
function syncTripQueryInAddressBar(tripId) {
  if (
    !tripId ||
    !isUuid(tripId) ||
    typeof window === "undefined" ||
    !window.history ||
    typeof window.history.replaceState !== "function"
  ) {
    return;
  }

  window.history.replaceState(null, "", window.location.pathname + "?trip=" + encodeURIComponent(tripId));
}

/**
 * @returns {string | null}
 */
function getTripIdFromUrl() {
  if (typeof window === "undefined" || !window.location) {
    return null;
  }

  var tripId = new URLSearchParams(window.location.search).get("trip");
  if (!tripId || !isUuid(tripId)) {
    return null;
  }

  return tripId;
}

/**
 * @param {string} text
 * @returns {Promise<void>}
 */
function copyWithExecCommand(text) {
  return new Promise(function (resolve, reject) {
    if (
      typeof document === "undefined" ||
      !document.body ||
      typeof document.execCommand !== "function"
    ) {
      reject(new Error("Clipboard ist nicht verfügbar."));
      return;
    }

    var helperInput = document.createElement("textarea");
    helperInput.value = text;
    helperInput.setAttribute("readonly", "");
    helperInput.style.position = "fixed";
    helperInput.style.opacity = "0";
    helperInput.style.left = "-9999px";

    document.body.appendChild(helperInput);
    helperInput.select();
    helperInput.setSelectionRange(0, helperInput.value.length);

    try {
      var copied = document.execCommand("copy");
      if (!copied) {
        reject(new Error("Kopieren fehlgeschlagen."));
        return;
      }
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      document.body.removeChild(helperInput);
    }
  });
}

/**
 * @param {string} text
 * @returns {Promise<void>}
 */
function copyToClipboard(text) {
  var canUseModernClipboard =
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function";

  if (canUseModernClipboard) {
    return navigator.clipboard
      .writeText(text)
      .then(function () {
        console.info("[Flyra Share] Modernes Clipboard genutzt.");
      })
      .catch(function (modernError) {
        console.warn("[Flyra Share] Modernes Clipboard fehlgeschlagen, versuche Fallback.", modernError);
        return copyWithExecCommand(text)
          .then(function () {
            console.info("[Flyra Share] Fallback via execCommand genutzt.");
          })
          .catch(function (fallbackError) {
            console.error("[Flyra Share] Clipboard und Fallback fehlgeschlagen.", fallbackError);
            throw fallbackError;
          });
      });
  }

  return copyWithExecCommand(text)
    .then(function () {
      console.info("[Flyra Share] Fallback via execCommand genutzt.");
    })
    .catch(function (fallbackError) {
      console.error("[Flyra Share] Clipboard und Fallback fehlgeschlagen.", fallbackError);
      throw fallbackError;
    });
}

/**
 * @returns {TripInput | null}
 */
function getShareInputFromUrl() {
  if (typeof window === "undefined" || !window.location) {
    return null;
  }

  var params = new URLSearchParams(window.location.search);
  var destinationParam = params.get("destination");
  var daysParam = params.get("days");
  var budgetParam = params.get("budget");
  var travelTypeParam = params.get("travelType");
  var typeParam = params.get("type");
  console.log("Restore values:", destinationParam, daysParam, budgetParam, travelTypeParam || typeParam);

  var hasAllRequiredParams =
    destinationParam !== null &&
    daysParam !== null &&
    budgetParam !== null;

  if (!hasAllRequiredParams) {
    return null;
  }

  var destination = String(destinationParam || "").trim();
  var daysValue = String(daysParam || "").trim();
  var budgetValue = String(budgetParam || "").trim().replace(",", ".");

  var days = Number(daysValue);
  var totalBudget = Number(budgetValue);

  var isValidInput =
    destination.length > 0 &&
    Number.isInteger(days) &&
    days >= 1 &&
    days <= 30 &&
    Number.isFinite(totalBudget) &&
    totalBudget > 0;

  if (!isValidInput) {
    return null;
  }

  return {
    destination: destination,
    days: days,
    totalBudget: Number(totalBudget.toFixed(2)),
    tripType: normalizeTripType(travelTypeParam || typeParam || getSuggestedTripType(destination) || "city"),
    currency: "EUR"
  };
}

/**
 * @param {HTMLFormElement} formEl
 * @returns {TripInput | null}
 */
function applyShareParamsToForm(formEl) {
  var shareInput = getShareInputFromUrl();
  if (!shareInput) {
    return null;
  }

  var destinationInput = formEl.querySelector('[name="destination"]');
  var daysInput = formEl.querySelector('[name="days"]');
  var budgetInput = formEl.querySelector('[name="budget"]');
  var typeInput = formEl.querySelector('[name="type"]');

  if (destinationInput) {
    destinationInput.value = shareInput.destination;
  }

  if (daysInput) {
    daysInput.value = String(shareInput.days);
  }

  if (budgetInput) {
    budgetInput.value = String(shareInput.totalBudget);
  }

  if (typeInput) {
    typeInput.value = normalizeTripType(shareInput.tripType);
  }

  return shareInput;
}

/**
 * Validiert die Formulardaten und gibt entweder TripInput oder Fehlerliste zurück.
 * @param {HTMLFormElement} formEl
 * @returns {TripInput | string[]}
 */
function parseAndValidateInput(formEl) {
  var formData = new FormData(formEl);
  var destination = String(formData.get("destination") || "").trim();
  var daysValue = String(formData.get("days") || "").trim();
  var budgetValue = String(formData.get("budget") || "").trim().replace(",", ".");
  var tripTypeValue = String(formData.get("type") || "city").trim().toLowerCase();
  var errors = [];

  if (!destination) {
    errors.push("Bitte gib ein Reiseziel ein.");
  }

  var days = Number(daysValue);
  if (!Number.isInteger(days)) {
    errors.push("Die Reisedauer muss eine ganze Zahl sein.");
  } else if (days < 1 || days > 30) {
    errors.push("Die Reisedauer muss zwischen 1 und 30 Tagen liegen.");
  }

  var totalBudget = Number(budgetValue);
  if (!Number.isFinite(totalBudget)) {
    errors.push("Bitte gib ein gültiges Budget ein.");
  } else if (totalBudget <= 0) {
    errors.push("Das Budget muss größer als 0 EUR sein.");
  }

  if (!Object.prototype.hasOwnProperty.call(TRIP_TYPE_LABELS, tripTypeValue)) {
    errors.push("Bitte wähle einen gültigen Reisetyp.");
  }

  if (errors.length > 0) {
    return errors;
  }

  return {
    destination: destination,
    days: days,
    totalBudget: Number(totalBudget.toFixed(2)),
    tripType: normalizeTripType(tripTypeValue),
    currency: "EUR"
  };
}

/**
 * @param {number} totalBudget
 * @returns {BudgetBreakdown}
 */
function selectBudgetTier(totalBudget) {
  if (totalBudget <= 900) {
    return {
      accommodation: 35,
      transport: 20,
      food: 25,
      activities: 10,
      buffer: 10
    };
  }

  if (totalBudget <= 2500) {
    return {
      accommodation: 40,
      transport: 20,
      food: 20,
      activities: 15,
      buffer: 5
    };
  }

  return {
    accommodation: 45,
    transport: 20,
    food: 15,
    activities: 15,
    buffer: 5
  };
}

/**
 * @param {number} totalBudget
 * @param {BudgetBreakdown} splitPercent
 * @returns {BudgetBreakdown}
 */
function computeSplitAmounts(totalBudget, splitPercent) {
  var totalCents = toCents(totalBudget);
  var splitCents = {
    accommodation: 0,
    transport: 0,
    food: 0,
    activities: 0,
    buffer: 0
  };
  var usedCents = 0;

  CATEGORY_KEYS.forEach(function (key) {
    splitCents[key] = Math.round((totalCents * splitPercent[key]) / 100);
    usedCents += splitCents[key];
  });

  splitCents.buffer += totalCents - usedCents;

  return {
    accommodation: fromCents(splitCents.accommodation),
    transport: fromCents(splitCents.transport),
    food: fromCents(splitCents.food),
    activities: fromCents(splitCents.activities),
    buffer: fromCents(splitCents.buffer)
  };
}

function pickTemplate(slot, templateSet, destinationSeed, dayIndex) {
  var templates = templateSet[slot];
  var index = (destinationSeed + dayIndex) % templates.length;
  return templates[index];
}

/**
 * @param {"morning" | "afternoon" | "evening"} slot
 * @returns {number}
 */
function getSlotOffset(slot) {
  if (slot === "morning") {
    return 0;
  }
  if (slot === "afternoon") {
    return 1;
  }
  return 2;
}

/**
 * @param {string} text
 * @returns {string}
 */
function trimSentence(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/g, "");
}

/**
 * @param {string} text
 * @returns {string}
 */
function normalizePhraseKey(text) {
  var value = String(text || "").toLowerCase();
  if (typeof value.normalize === "function") {
    value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  return value.replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * @param {string} activityText
 * @param {string} placeSuggestion
 * @returns {boolean}
 */
function hasPlaceOverlap(activityText, placeSuggestion) {
  var activityKey = normalizePhraseKey(activityText);
  var placeKey = normalizePhraseKey(placeSuggestion);
  if (!activityKey || !placeKey || placeKey.length < 4) {
    return false;
  }

  return activityKey.indexOf(placeKey) !== -1;
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {string} destination
 * @param {"morning" | "afternoon" | "evening"} slot
 * @returns {string[]}
 */
function getKnownPlaceNamesForSlot(destination, slot) {
  var destinationKey = normalizeDestinationKey(destination);
  if (!destinationKey) {
    return [];
  }

  var destinationData = DESTINATION_PLACE_SUGGESTIONS[destinationKey];
  if (!destinationData || typeof destinationData !== "object") {
    return [];
  }

  var collected = [];
  Object.keys(destinationData).forEach(function (typeKey) {
    var placeSet = destinationData[typeKey];
    if (!placeSet || typeof placeSet !== "object" || !Array.isArray(placeSet[slot])) {
      return;
    }

    placeSet[slot].forEach(function (placeName) {
      var normalized = String(placeName || "").trim();
      if (normalized) {
        collected.push(normalized);
      }
    });
  });

  var unique = Array.from(new Set(collected));
  unique.sort(function (a, b) {
    return b.length - a.length;
  });
  return unique;
}

/**
 * @param {string} candidate
 * @returns {boolean}
 */
function shouldKeepHeuristicPlaceCandidate(candidate) {
  var phrase = String(candidate || "").trim();
  if (!phrase) {
    return false;
  }

  var normalized = normalizePhraseKey(phrase);
  if (!normalized) {
    return false;
  }

  var words = normalized.split(" ").filter(Boolean);
  var hasHintTerm = PLACE_LINK_HINT_TERMS.some(function (term) {
    return normalized.indexOf(term) !== -1;
  });

  if (words.length === 1) {
    if (PLACE_LINK_STOPWORDS[words[0]]) {
      return false;
    }

    if (hasHintTerm) {
      return true;
    }

    return phrase.length >= 6;
  }

  var capitalizedWords = phrase
    .split(/\s+/)
    .filter(function (word) {
      return /^[A-ZÄÖÜ]/.test(word);
    }).length;

  if (hasHintTerm) {
    return true;
  }

  return capitalizedWords >= 2;
}

/**
 * @param {string} text
 * @returns {string[]}
 */
function extractHeuristicPlaceNames(text) {
  var rawText = String(text || "");
  if (!rawText.trim()) {
    return [];
  }

  var candidates = [];
  var titleSequencePattern = /\b([A-ZÄÖÜ][A-Za-zÀ-ÖØ-öø-ÿ0-9'’\-]*(?:\s+(?:[A-ZÄÖÜ][A-Za-zÀ-ÖØ-öø-ÿ0-9'’\-]*|de|da|do|dos|das|del|di|du|la|le|el|von|van|der|den|des|am|im|in|an|auf|bei|zum|zur)){0,4})\b/g;
  var sequenceMatch = titleSequencePattern.exec(rawText);

  while (sequenceMatch) {
    candidates.push(String(sequenceMatch[1] || "").trim());
    sequenceMatch = titleSequencePattern.exec(rawText);
  }

  var landmarkPhrasePattern = /\b(?:im|in|am|an|bei|nahe|rund um|umfeld von|wie)\s+(?:dem|den|der|die|das|des|einem|einer|einen)?\s*([A-ZÄÖÜ][^,.;:()]{1,56})/gi;
  var landmarkMatch = landmarkPhrasePattern.exec(rawText);

  while (landmarkMatch) {
    candidates.push(String(landmarkMatch[1] || "").trim());
    landmarkMatch = landmarkPhrasePattern.exec(rawText);
  }

  var filtered = candidates.filter(shouldKeepHeuristicPlaceCandidate);
  var unique = Array.from(new Set(filtered));
  unique.sort(function (a, b) {
    return b.length - a.length;
  });
  return unique;
}

/**
 * @param {string[]} knownNames
 * @param {string[]} heuristicNames
 * @returns {string[]}
 */
function mergePlaceNameCandidates(knownNames, heuristicNames) {
  var index = Object.create(null);
  var merged = [];

  function addName(name) {
    var normalized = normalizePhraseKey(name);
    if (!normalized || index[normalized]) {
      return;
    }
    index[normalized] = true;
    merged.push(name);
  }

  knownNames.forEach(addName);
  heuristicNames.forEach(addName);
  merged.sort(function (a, b) {
    return b.length - a.length;
  });
  return merged;
}

/**
 * @param {string} placeName
 * @param {string} destination
 * @returns {string}
 */
function createGoogleMapsLink(placeName, destination) {
  var destinationLabel = formatDestinationForDisplay(destination);
  var query = String(placeName || "").trim() + " " + destinationLabel;
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query.trim());
}

/**
 * @param {string} text
 * @param {string} destination
 * @param {"morning" | "afternoon" | "evening" | undefined} slot
 * @returns {string}
 */
function wrapPlacesWithLinks(text, destination, slot) {
  var rawText = String(text || "");
  var knownPlaceNames = [];

  if (slot === "morning" || slot === "afternoon" || slot === "evening") {
    knownPlaceNames = getKnownPlaceNamesForSlot(destination, slot);
  } else {
    knownPlaceNames = mergePlaceNameCandidates(
      getKnownPlaceNamesForSlot(destination, "morning"),
      mergePlaceNameCandidates(
        getKnownPlaceNamesForSlot(destination, "afternoon"),
        getKnownPlaceNamesForSlot(destination, "evening")
      )
    );
  }

  var heuristicPlaceNames = extractHeuristicPlaceNames(rawText);
  var placeNames = mergePlaceNameCandidates(knownPlaceNames, heuristicPlaceNames);
  if (!rawText || placeNames.length === 0) {
    return escapeHtml(rawText);
  }

  var pattern = placeNames.map(escapeRegExp).join("|");
  var matcher = new RegExp(pattern, "gi");
  var result = "";
  var lastIndex = 0;
  var match = matcher.exec(rawText);

  while (match) {
    var start = match.index;
    var end = start + match[0].length;
    var matchedPlace = match[0];

    result += escapeHtml(rawText.slice(lastIndex, start));
    result +=
      '<a class="slot-place-link place-link" href="' + escapeHtml(createGoogleMapsLink(matchedPlace, destination)) +
      '" target="_blank" rel="noopener noreferrer">' + escapeHtml(matchedPlace) + "</a>";

    lastIndex = end;
    match = matcher.exec(rawText);
  }

  result += escapeHtml(rawText.slice(lastIndex));
  return result;
}

/**
 * @param {string} placeName
 * @param {string} destination
 * @returns {string}
 */
function buildMapsSearchUrl(placeName, destination) {
  return createGoogleMapsLink(placeName, destination);
}

/**
 * @param {string} text
 * @param {string} destination
 * @param {"morning" | "afternoon" | "evening"} slot
 * @returns {string}
 */
function renderSlotTextWithPlaceLinks(text, destination, slot) {
  return wrapPlacesWithLinks(text, destination, slot);
}

/**
 * @param {string} destinationKey
 * @param {"city" | "beach" | "nature" | "food"} templateType
 * @returns {{morning: string[], afternoon: string[], evening: string[]} | null}
 */
function getDestinationPlaceSetForType(destinationKey, templateType) {
  if (!destinationKey) {
    return null;
  }

  var destinationData = DESTINATION_PLACE_SUGGESTIONS[destinationKey];
  if (!destinationData || typeof destinationData !== "object") {
    return null;
  }

  var placeSet = destinationData[templateType];
  if (
    !placeSet ||
    !Array.isArray(placeSet.morning) ||
    !Array.isArray(placeSet.afternoon) ||
    !Array.isArray(placeSet.evening)
  ) {
    return null;
  }

  return placeSet;
}

/**
 * @param {TripInput} input
 * @returns {boolean}
 */
function hasKnownDestinationPlaceSupport(input) {
  var destinationKey = normalizeDestinationKey(input && input.destination);
  if (!destinationKey) {
    return false;
  }

  var normalizedType = normalizeTripType(input && input.tripType);
  if (normalizedType === "surprise") {
    return BASE_TRIP_TYPES.some(function (baseType) {
      return Boolean(getDestinationPlaceSetForType(destinationKey, baseType));
    });
  }

  return Boolean(getDestinationPlaceSetForType(destinationKey, normalizedType));
}

/**
 * @param {"city" | "beach" | "nature" | "food"} templateType
 * @param {"morning" | "afternoon" | "evening"} slot
 * @param {number} destinationSeed
 * @param {number} dayIndex
 * @param {string} destinationKey
 * @returns {{place: string, isDestinationSpecific: boolean}}
 */
function pickPlaceSuggestion(templateType, slot, destinationSeed, dayIndex, destinationKey) {
  var destinationPlaceSet = getDestinationPlaceSetForType(destinationKey, templateType);
  var byType = destinationPlaceSet || PLACE_SUGGESTIONS_BY_TYPE[templateType] || PLACE_SUGGESTIONS_BY_TYPE.city;
  var suggestions = byType[slot] || byType.morning;
  var slotOffset = getSlotOffset(slot);
  var index = (destinationSeed + dayIndex * 5 + slotOffset) % suggestions.length;
  return {
    place: suggestions[index],
    isDestinationSpecific: Boolean(destinationPlaceSet)
  };
}

/**
 * @param {string} activityText
 * @param {"morning" | "afternoon" | "evening"} slot
 * @param {string} destination
 * @param {string} placeSuggestion
 * @param {number} destinationSeed
 * @param {number} dayIndex
 * @param {boolean} isDestinationSpecific
 * @returns {string}
 */
function composeItineraryText(activityText, slot, destination, placeSuggestion, destinationSeed, dayIndex, isDestinationSpecific) {
  var activity = trimSentence(activityText);
  var place = trimSentence(placeSuggestion);
  var formattedDestination = formatDestinationForDisplay(destination);
  var variant = (destinationSeed + dayIndex * 7 + getSlotOffset(slot)) % 4;
  var shouldUsePlace = !hasPlaceOverlap(activity, place);

  if (shouldUsePlace && isDestinationSpecific) {
    if (slot === "morning") {
      if (variant === 0) {
        return "Früher Start mit " + activity + " im Viertel rund um " + place + ".";
      }
      if (variant === 1) {
        return "Für den Morgen passt " + activity + ", zum Beispiel bei " + place + ".";
      }
      if (variant === 2) {
        return "Morgenidee: " + activity + " mit Stopp bei " + place + ".";
      }
      return activity + " mit Ortsfokus auf " + place + " in " + formattedDestination + ".";
    }

    if (slot === "afternoon") {
      if (variant === 0) {
        return "Am Nachmittag bietet sich " + activity + " an, etwa rund um " + place + ".";
      }
      if (variant === 1) {
        return activity + " mit einem Abstecher nach " + place + ".";
      }
      if (variant === 2) {
        return "Im Bereich " + place + " und anschließend " + activity + ".";
      }
      return "Für den Nachmittag passt " + activity + ", zum Beispiel nahe " + place + ".";
    }

    if (variant === 0) {
      return "Am Abend passt " + activity + ", etwa im Umfeld von " + place + ".";
    }
    if (variant === 1) {
      return activity + " mit Ausklang rund um " + place + ".";
    }
    if (variant === 2) {
      return "Zum Tagesende eignet sich " + place + " für " + activity + ".";
    }
    return "Abendprogramm nahe " + place + ": " + activity + ".";
  }

  if (slot === "morning") {
    if (!shouldUsePlace) {
      if (variant === 0) {
        return activity + " in " + formattedDestination + ".";
      }
      if (variant === 1) {
        return "Am Morgen: " + activity + ".";
      }
      if (variant === 2) {
        return "Für den Morgen passt " + activity + ".";
      }
      return "Morgenprogramm: " + activity + ".";
    }

    if (variant === 0) {
      return activity + " im Bereich " + place + " in " + formattedDestination + ".";
    }
    if (variant === 1) {
      return "Start in den Tag: " + activity + ", besonders rund um " + place + ".";
    }
    if (variant === 2) {
      return "Für den Morgen passt " + activity + " mit Fokus auf " + place + ".";
    }
    return activity + " als entspannter Tagesstart nahe " + place + ".";
  }

  if (slot === "afternoon") {
    if (!shouldUsePlace) {
      if (variant === 0) {
        return "Am Nachmittag bietet sich " + activity + " an.";
      }
      if (variant === 1) {
        return activity + " als entspannte Einheit am Nachmittag.";
      }
      if (variant === 2) {
        return "Für den Nachmittag eignet sich " + activity + ".";
      }
      return "Nachmittags: " + activity + ".";
    }

    if (variant === 0) {
      return "Am Nachmittag bietet sich " + activity + " rund um " + place + " an.";
    }
    if (variant === 1) {
      return activity + " mit Zeit für " + place + ".";
    }
    if (variant === 2) {
      return "Für den Nachmittag eignet sich " + activity + " im Umfeld von " + place + ".";
    }
    return "Nachmittags: " + activity + ", ideal im Bereich " + place + ".";
  }

  if (!shouldUsePlace) {
    if (variant === 0) {
      return "Am Abend passt " + activity + ".";
    }
    if (variant === 1) {
      return "Abendprogramm: " + activity + ".";
    }
    if (variant === 2) {
      return "Zum Tagesende empfiehlt sich " + activity + ".";
    }
    return "Für den Abend eignet sich " + activity + ".";
  }

  if (variant === 0) {
    return "Am Abend passt " + activity + " rund um " + place + ".";
  }
  if (variant === 1) {
    return "Zum Abend passt " + activity + " im Umfeld von " + place + ".";
  }
  if (variant === 2) {
    return "Zum Tagesende empfiehlt sich " + activity + " nahe " + place + ".";
  }
  return "Abends eignet sich " + place + " besonders gut für " + activity + ".";
}

/**
 * @param {TripInput} input
 * @param {number} dailyBudget
 * @returns {DayPlan[]}
 */
function buildItinerary(input, dailyBudget) {
  var destinationSeed = hashString(input.destination.toLowerCase());
  var destinationKey = normalizeDestinationKey(input.destination);
  var budgetPerDay = Number(dailyBudget.toFixed(2));
  var itinerary = [];

  for (var dayIndex = 0; dayIndex < input.days; dayIndex += 1) {
    var templateType = getTemplateTypeForDay(input, dayIndex);
    var templateSet = ACTIVITY_TEMPLATES_BY_TYPE[templateType] || ACTIVITY_TEMPLATES_BY_TYPE.city;
    var morningActivity = pickTemplate("morning", templateSet, destinationSeed, dayIndex);
    var afternoonActivity = pickTemplate("afternoon", templateSet, destinationSeed, dayIndex);
    var eveningActivity = pickTemplate("evening", templateSet, destinationSeed, dayIndex);
    var morningPlace = pickPlaceSuggestion(templateType, "morning", destinationSeed, dayIndex, destinationKey);
    var afternoonPlace = pickPlaceSuggestion(templateType, "afternoon", destinationSeed, dayIndex, destinationKey);
    var eveningPlace = pickPlaceSuggestion(templateType, "evening", destinationSeed, dayIndex, destinationKey);

    itinerary.push({
      day: dayIndex + 1,
      morning: composeItineraryText(morningActivity, "morning", input.destination, morningPlace.place, destinationSeed, dayIndex, morningPlace.isDestinationSpecific),
      afternoon: composeItineraryText(afternoonActivity, "afternoon", input.destination, afternoonPlace.place, destinationSeed, dayIndex, afternoonPlace.isDestinationSpecific),
      evening: composeItineraryText(eveningActivity, "evening", input.destination, eveningPlace.place, destinationSeed, dayIndex, eveningPlace.isDestinationSpecific),
      estimatedCost: budgetPerDay
    });
  }

  return itinerary;
}

/**
 * @param {string[]} errors
 * @param {HTMLElement} rootEl
 */
function renderErrors(errors, rootEl) {
  clearElement(rootEl);

  if (!errors || errors.length === 0) {
    rootEl.classList.add("is-hidden");
    return;
  }

  rootEl.classList.remove("is-hidden");

  var list = document.createElement("ul");
  list.className = "error-list";

  errors.forEach(function (error) {
    var item = document.createElement("li");
    item.textContent = error;
    list.appendChild(item);
  });

  rootEl.appendChild(list);
}

function hideResult(rootEl, resetButton) {
  clearElement(rootEl);
  rootEl.classList.add("is-hidden");

  if (resetButton) {
    resetButton.classList.add("is-hidden");
  }
}

/**
 * @param {TripPlan} plan
 * @param {HTMLElement} rootEl
 * @param {HTMLFormElement | undefined} formEl
 * @param {{
 *   onItineraryFieldInput?: ((dayIndex: number, slot: "morning" | "afternoon" | "evening", value: string, flushNow: boolean) => void),
 *   collabIndicatorText?: string,
 *   collabStatusState?: "local-saved" | "syncing" | "synced" | "inactive" | "remote-update",
 *   collabStatusMessage?: string,
 *   collabLastSavedAt?: Date | string | number | null
 * } | undefined} options
 */
function renderPlan(plan, rootEl, formEl, options) {
  var normalizedOptions = options || {};
  var onItineraryFieldInput =
    typeof normalizedOptions.onItineraryFieldInput === "function"
      ? normalizedOptions.onItineraryFieldInput
      : null;
  var collabStatusState = normalizeCollabStatusState(normalizedOptions.collabStatusState || "inactive");
  var collabStatusMessage = String(normalizedOptions.collabStatusMessage || "").trim();
  var collabIndicatorText = String(normalizedOptions.collabIndicatorText || "").trim();
  if (!collabStatusMessage && collabIndicatorText) {
    collabStatusMessage = collabIndicatorText;
    collabStatusState = "remote-update";
  }
  var collabLastSavedAt = normalizedOptions.collabLastSavedAt || null;

  clearElement(rootEl);
  rootEl.classList.remove("is-hidden");
  var formattedDestination = formatDestinationForDisplay(plan.input.destination);

  var summarySection = document.createElement("section");
  summarySection.className = "result-section result-section--summary";

  var summarySectionTitle = document.createElement("h3");
  summarySectionTitle.className = "section-title";
  summarySectionTitle.textContent = "Zusammenfassung";
  summarySection.appendChild(summarySectionTitle);

  var heading = document.createElement("h2");
  heading.className = "result-title";
  heading.textContent = "Dein Reiseplan für " + formattedDestination;
  summarySection.appendChild(heading);

  var summaryLead = document.createElement("p");
  summaryLead.className = "lead result-lead";
  summaryLead.textContent = "Hier ist dein Plan für " + plan.input.days + " Tage inklusive Budgetaufteilung.";
  summarySection.appendChild(summaryLead);

  var summaryGrid = document.createElement("div");
  summaryGrid.className = "summary-grid";

  summaryGrid.appendChild(createSummaryChip("Reiseziel", formattedDestination));
  summaryGrid.appendChild(createSummaryChip("Reisetyp", getTripTypeLabel(plan.input.tripType)));
  summaryGrid.appendChild(createSummaryChip("Reisedauer", String(plan.input.days) + " Tage"));
  summaryGrid.appendChild(createSummaryChip("Gesamtbudget", formatCurrency(plan.input.totalBudget)));

  summarySection.appendChild(summaryGrid);
  rootEl.appendChild(summarySection);

  var shareSection = document.createElement("section");
  shareSection.className = "result-section result-section--share";

  var shareHeading = document.createElement("h3");
  shareHeading.className = "section-title";
  shareHeading.textContent = "Plan teilen";
  shareSection.appendChild(shareHeading);

  var shareActions = document.createElement("div");
  shareActions.className = "share-actions";

  var shareButton = document.createElement("button");
  shareButton.type = "button";
  shareButton.className = "btn-secondary share-button";
  shareButton.textContent = "Plan teilen";
  shareActions.appendChild(shareButton);

  var pdfButton = document.createElement("button");
  pdfButton.type = "button";
  pdfButton.className = "btn-secondary pdf-button";
  pdfButton.textContent = "Plan als PDF exportieren";
  shareActions.appendChild(pdfButton);

  shareSection.appendChild(shareActions);

  var shareFeedback = document.createElement("p");
  shareFeedback.className = "share-feedback is-hidden";
  shareFeedback.setAttribute("aria-live", "polite");
  shareSection.appendChild(shareFeedback);
  var shareFeedbackTimeout = null;

  var exportFeedback = document.createElement("p");
  exportFeedback.className = "share-feedback export-feedback is-hidden";
  exportFeedback.setAttribute("aria-live", "polite");
  shareSection.appendChild(exportFeedback);

  var manualShare = document.createElement("div");
  manualShare.className = "share-manual is-hidden";

  var manualShareMessage = document.createElement("p");
  manualShareMessage.className = "share-manual-message";
  manualShareMessage.textContent = SHARE_LINK_MANUAL_COPY_MESSAGE;
  manualShare.appendChild(manualShareMessage);

  var manualShareInput = document.createElement("input");
  manualShareInput.type = "text";
  manualShareInput.readOnly = true;
  manualShareInput.className = "share-manual-link";
  manualShareInput.setAttribute("aria-label", "Share-Link");
  manualShareInput.addEventListener("focus", function handleManualShareFocus() {
    manualShareInput.select();
  });
  manualShareInput.addEventListener("click", function handleManualShareClick() {
    manualShareInput.select();
  });
  manualShare.appendChild(manualShareInput);

  shareSection.appendChild(manualShare);

  shareButton.addEventListener("click", function handleShareClick() {
    var shareInput = plan.input;

    if (formEl) {
      var parsedFormInput = parseAndValidateInput(formEl);
      if (!Array.isArray(parsedFormInput)) {
        shareInput = parsedFormInput;
      }
    }

    var shareUrl = buildShareUrl(shareInput, currentTripId);
    console.log("Share URL:", shareUrl);

    shareFeedback.classList.add("is-hidden");
    shareFeedback.classList.remove("share-feedback--error", "share-feedback--success");
    manualShare.classList.add("is-hidden");
    manualShareInput.value = "";
    if (shareFeedbackTimeout !== null) {
      clearTimeout(shareFeedbackTimeout);
      shareFeedbackTimeout = null;
    }

    copyToClipboard(shareUrl)
      .then(function () {
        shareFeedback.classList.remove("is-hidden", "share-feedback--error");
        shareFeedback.classList.add("share-feedback--success");
        shareFeedback.textContent = SHARE_LINK_COPIED_MESSAGE;
        if (typeof window !== "undefined" && typeof window.setTimeout === "function") {
          shareFeedbackTimeout = window.setTimeout(function hideShareFeedback() {
            shareFeedback.classList.add("is-hidden");
            shareFeedback.classList.remove("share-feedback--success");
            shareFeedbackTimeout = null;
          }, SHARE_FEEDBACK_TIMEOUT_MS);
        }
      })
      .catch(function () {
        shareFeedback.classList.add("is-hidden");
        shareFeedback.classList.remove("share-feedback--success");
        manualShareInput.value = shareUrl;
        manualShare.classList.remove("is-hidden");
      });
  });

  pdfButton.addEventListener("click", function handlePdfExportClick() {
    exportPlanAsPdf(currentPlan, exportFeedback, pdfButton);
  });

  rootEl.appendChild(shareSection);

  var dailySection = document.createElement("section");
  dailySection.className = "result-section result-section--daily";

  var dailySectionTitle = document.createElement("h3");
  dailySectionTitle.className = "section-title";
  dailySectionTitle.textContent = "Tagesbudget";
  dailySection.appendChild(dailySectionTitle);

  var dailyBudget = document.createElement("p");
  dailyBudget.className = "daily-budget";

  var dailyBudgetLabel = document.createElement("span");
  dailyBudgetLabel.className = "daily-budget-label";
  dailyBudgetLabel.textContent = "Empfohlenes Tagesbudget";

  var dailyBudgetValue = document.createElement("span");
  dailyBudgetValue.className = "daily-budget-value";
  dailyBudgetValue.textContent = formatCurrency(plan.dailyBudget);

  dailyBudget.appendChild(dailyBudgetLabel);
  dailyBudget.appendChild(dailyBudgetValue);
  dailySection.appendChild(dailyBudget);
  rootEl.appendChild(dailySection);

  var statusSection = document.createElement("section");
  statusSection.className = "result-section result-section--status";

  var statusSectionTitle = document.createElement("h3");
  statusSectionTitle.className = "section-title";
  statusSectionTitle.textContent = "Budgetstatus";
  statusSection.appendChild(statusSectionTitle);

  var budgetStatus = document.createElement("div");
  budgetStatus.className = "budget-status budget-status--" + plan.budgetStatus;

  var budgetStatusLine = document.createElement("p");
  budgetStatusLine.className = "budget-status-line";

  var budgetStatusDot = document.createElement("span");
  budgetStatusDot.className = "budget-status-dot";
  budgetStatusDot.setAttribute("aria-hidden", "true");

  var budgetStatusText = document.createElement("span");
  budgetStatusText.className = "budget-status-text";
  budgetStatusText.textContent = "Budgetstatus: " + plan.budgetStatusLabel;

  budgetStatusLine.appendChild(budgetStatusDot);
  budgetStatusLine.appendChild(budgetStatusText);
  budgetStatus.appendChild(budgetStatusLine);

  var budgetHint = document.createElement("p");
  budgetHint.className = "budget-status-hint";
  budgetHint.textContent = plan.budgetStatusHint;
  budgetStatus.appendChild(budgetHint);

  if (plan.budgetStatus === "rot" && plan.recommendedDays !== null) {
    var budgetRecommendation = document.createElement("p");
    budgetRecommendation.className = "budget-status-recommendation";
    budgetRecommendation.textContent = "Mit deinem aktuellen Budget wären eher " + plan.recommendedDays + " " + (plan.recommendedDays === 1 ? "Tag" : "Tage") + " realistischer.";
    budgetStatus.appendChild(budgetRecommendation);
  }

  statusSection.appendChild(budgetStatus);
  rootEl.appendChild(statusSection);

  var budgetSection = document.createElement("section");
  budgetSection.className = "result-section result-section--budget";

  var budgetHeading = document.createElement("h3");
  budgetHeading.className = "section-title";
  budgetHeading.textContent = "Budgetaufteilung";
  budgetSection.appendChild(budgetHeading);

  var budgetTableWrap = document.createElement("div");
  budgetTableWrap.className = "budget-table-wrap";
  budgetTableWrap.appendChild(createBudgetTable(plan.splitPercent, plan.splitAmount));
  budgetSection.appendChild(budgetTableWrap);
  rootEl.appendChild(budgetSection);

  var itinerarySection = document.createElement("section");
  itinerarySection.className = "result-section result-section--itinerary";

  var itineraryHeading = document.createElement("h3");
  itineraryHeading.className = "section-title";
  itineraryHeading.textContent = "Tagesplan";
  itinerarySection.appendChild(itineraryHeading);

  var itineraryLead = document.createElement("p");
  itineraryLead.className = "itinerary-lead";
  itineraryLead.textContent = "Dein Ablauf pro Tag mit klaren Slots für Morgen, Nachmittag und Abend.";
  itinerarySection.appendChild(itineraryLead);

  if (hasKnownDestinationPlaceSupport(plan.input)) {
    var itineraryNote = document.createElement("p");
    itineraryNote.className = "itinerary-lead";
    itineraryNote.textContent = "Flyra nutzt für dieses Ziel passendere Ortsvorschläge.";
    itinerarySection.appendChild(itineraryNote);
  }

  itinerarySection.appendChild(createCollabStatusBar(collabStatusState, collabLastSavedAt, collabStatusMessage));

  var itineraryGrid = document.createElement("div");
  itineraryGrid.className = "itinerary-grid";

  plan.itinerary.forEach(function (dayPlan, itineraryIndex) {
    var card = document.createElement("article");
    card.className = "day-card";

    var dayTitle = document.createElement("h4");
    dayTitle.className = "day-title";
    dayTitle.textContent = "Tag " + dayPlan.day;
    card.appendChild(dayTitle);

    var dayContent = document.createElement("div");
    dayContent.className = "day-card-content";

    var slotList = document.createElement("ul");
    slotList.className = "day-slot-list";
    slotList.appendChild(createSlot({
      slot: "morning",
      label: "Morgen",
      value: dayPlan.morning,
      destination: plan.input.destination,
      editable: Boolean(onItineraryFieldInput),
      onInput: onItineraryFieldInput
        ? function handleMorningInput(nextValue, flushNow) {
            onItineraryFieldInput(itineraryIndex, "morning", nextValue, flushNow);
          }
        : null
    }));
    slotList.appendChild(createSlot({
      slot: "afternoon",
      label: "Nachmittag",
      value: dayPlan.afternoon,
      destination: plan.input.destination,
      editable: Boolean(onItineraryFieldInput),
      onInput: onItineraryFieldInput
        ? function handleAfternoonInput(nextValue, flushNow) {
            onItineraryFieldInput(itineraryIndex, "afternoon", nextValue, flushNow);
          }
        : null
    }));
    slotList.appendChild(createSlot({
      slot: "evening",
      label: "Abend",
      value: dayPlan.evening,
      destination: plan.input.destination,
      editable: Boolean(onItineraryFieldInput),
      onInput: onItineraryFieldInput
        ? function handleEveningInput(nextValue, flushNow) {
            onItineraryFieldInput(itineraryIndex, "evening", nextValue, flushNow);
          }
        : null
    }));
    dayContent.appendChild(slotList);
    card.appendChild(dayContent);

    var dayCost = document.createElement("p");
    dayCost.className = "day-cost";

    var dayCostLabel = document.createElement("span");
    dayCostLabel.className = "day-cost-label";
    dayCostLabel.textContent = "Geplante Ausgaben";

    var dayCostValue = document.createElement("span");
    dayCostValue.className = "day-cost-value";
    dayCostValue.textContent = formatCurrency(dayPlan.estimatedCost);

    dayCost.appendChild(dayCostLabel);
    dayCost.appendChild(dayCostValue);
    card.appendChild(dayCost);

    itineraryGrid.appendChild(card);
  });

  itinerarySection.appendChild(itineraryGrid);
  rootEl.appendChild(itinerarySection);
}

/**
 * @param {{slot: "morning" | "afternoon" | "evening", label: string, value: string, destination: string, editable?: boolean, onInput?: ((value: string, flushNow: boolean) => void) | null}} options
 * @returns {HTMLLIElement}
 */
function createSlot(options) {
  var slot = options.slot;
  var label = options.label;
  var value = options.value;
  var destination = options.destination;
  var editable = Boolean(options.editable);
  var onInput = typeof options.onInput === "function" ? options.onInput : null;
  var item = document.createElement("li");
  item.className = "day-slot";

  var labelEl = document.createElement("span");
  labelEl.className = "slot-label";
  labelEl.textContent = (SLOT_ICONS[slot] || "") + " " + label + ":";

  var valueWrap = document.createElement("div");
  valueWrap.className = "slot-value-wrap";

  var previewEl = document.createElement("p");
  previewEl.className = "slot-text slot-text-rich";
  previewEl.innerHTML = wrapPlacesWithLinks(value, destination, slot);
  valueWrap.appendChild(previewEl);

  if (editable) {
    var valueEl = document.createElement("textarea");
    valueEl.className = "slot-text slot-input";
    valueEl.rows = 2;
    valueEl.value = String(value || "");
    valueEl.readOnly = !editable;
    valueEl.setAttribute("aria-label", label);
    valueWrap.appendChild(valueEl);

    if (onInput) {
      valueEl.addEventListener("input", function handleInput() {
        previewEl.innerHTML = wrapPlacesWithLinks(valueEl.value, destination, slot);
        onInput(valueEl.value, false);
      });

      valueEl.addEventListener("blur", function handleBlur() {
        previewEl.innerHTML = wrapPlacesWithLinks(valueEl.value, destination, slot);
        onInput(valueEl.value, true);
      });
    }
  }

  item.appendChild(labelEl);
  item.appendChild(valueWrap);
  return item;
}
function createSummaryChip(label, value) {
  var chip = document.createElement("div");
  chip.className = "summary-chip";

  var labelEl = document.createElement("span");
  labelEl.className = "chip-label";
  labelEl.textContent = label;

  var valueEl = document.createElement("span");
  valueEl.className = "chip-value";
  valueEl.textContent = value;

  chip.appendChild(labelEl);
  chip.appendChild(valueEl);

  return chip;
}

function createBudgetTable(splitPercent, splitAmount) {
  var table = document.createElement("table");
  table.className = "budget-table";

  var headerRow = document.createElement("tr");
  ["Kategorie", "Anteil", "Betrag"].forEach(function (title) {
    var th = document.createElement("th");
    th.scope = "col";
    th.textContent = title;
    headerRow.appendChild(th);
  });

  var thead = document.createElement("thead");
  thead.appendChild(headerRow);
  table.appendChild(thead);

  var body = document.createElement("tbody");
  CATEGORY_KEYS.forEach(function (key) {
    var row = document.createElement("tr");

    var categoryCell = document.createElement("td");
    categoryCell.textContent = CATEGORY_LABELS[key];

    var percentCell = document.createElement("td");
    percentCell.textContent = String(splitPercent[key]) + "%";

    var amountCell = document.createElement("td");
    amountCell.textContent = formatCurrency(splitAmount[key]);

    row.appendChild(categoryCell);
    row.appendChild(percentCell);
    row.appendChild(amountCell);
    body.appendChild(row);
  });

  table.appendChild(body);
  return table;
}

/**
 * @param {TripInput} input
 * @returns {TripPlan}
 */
function buildTripPlan(input) {
  var splitPercent = selectBudgetTier(input.totalBudget);
  var splitAmount = computeSplitAmounts(input.totalBudget, splitPercent);
  var dailyBudget = Number((input.totalBudget / input.days).toFixed(2));
  var budgetStatus = getBudgetStatus(dailyBudget);
  var budgetStatusLabel = getBudgetStatusLabel(budgetStatus);
  var budgetStatusHint = getBudgetStatusHint(budgetStatus);
  var recommendedDays = budgetStatus === "rot" ? getRecommendedDays(input.totalBudget) : null;
  var itinerary = buildItinerary(input, dailyBudget);

  return {
    input: input,
    splitPercent: splitPercent,
    splitAmount: splitAmount,
    dailyBudget: dailyBudget,
    budgetStatus: budgetStatus,
    budgetStatusLabel: budgetStatusLabel,
    budgetStatusHint: budgetStatusHint,
    recommendedDays: recommendedDays,
    itinerary: itinerary
  };
}

function initializePlanner() {
  if (plannerInitializationDone) {
    return;
  }

  console.log("Planner init started");
  if (typeof window !== "undefined" && window.location) {
    console.log("URL search:", window.location.search);
  } else {
    console.log("URL search:", "");
  }

  var formEl = document.getElementById("trip-form");
  var errorBox = document.getElementById("error-box");
  var resultBox = document.getElementById("result-box");
  var resetButton = document.getElementById("reset-plan");
  var destinationInput = formEl ? formEl.querySelector("#destination") : null;
  var tripTypeInput = formEl ? formEl.querySelector("#trip-type") : null;
  var destinationTypeHint = document.getElementById("destination-type-hint");

  if (!formEl || !errorBox || !resultBox) {
    return;
  }

  plannerInitializationDone = true;
  var latestSaveRequest = 0;
  var realtimeChannel = null;
  var realtimeChannelTripId = "";
  var pendingPlanUpdateTimer = null;
  var startupSavedPlan = loadSavedPlanFromLocalStorage();
  var startupSavedPlanConsumed = false;
  var latestPlanUpdateRequest = 0;
  var collabStatusResetTimer = null;
  var collabStatusState = "inactive";
  var collabStatusMessage = "";
  var collabLastSavedAt = null;

  function clearCollabStatusResetTimer() {
    if (collabStatusResetTimer !== null) {
      clearTimeout(collabStatusResetTimer);
      collabStatusResetTimer = null;
    }
  }

  function isLiveSyncAvailable() {
    return Boolean(getSupabaseClient());
  }

  /**
   * @param {"local-saved" | "syncing" | "synced" | "inactive" | "remote-update"} state
   * @param {string | null | undefined} customMessage
   * @param {Date | string | number | boolean | null | undefined} savedAt
   */
  function setCollabStatus(state, customMessage, savedAt) {
    collabStatusState = normalizeCollabStatusState(state);
    collabStatusMessage = String(customMessage || "").trim();

    if (savedAt === true) {
      collabLastSavedAt = new Date();
    } else if (savedAt) {
      var parsedTime = parseDateLike(savedAt);
      if (parsedTime) {
        collabLastSavedAt = parsedTime;
      }
    }

    applyCollabStatusBarState(resultBox, collabStatusState, collabLastSavedAt, collabStatusMessage);
  }

  function setCollabStatusForCurrentEnvironment() {
    if (!isLiveSyncAvailable()) {
      setCollabStatus("inactive");
      return;
    }

    if (currentTripId && isUuid(currentTripId)) {
      setCollabStatus("synced");
      return;
    }

    setCollabStatus("local-saved");
  }

  function scheduleCollabStatusRestore() {
    clearCollabStatusResetTimer();
    collabStatusResetTimer = setTimeout(function restoreCollabStatus() {
      collabStatusResetTimer = null;
      setCollabStatusForCurrentEnvironment();
    }, COLLAB_STATUS_RESTORE_DELAY_MS);
  }

  function clearPendingPlanUpdateTimer() {
    if (pendingPlanUpdateTimer !== null) {
      clearTimeout(pendingPlanUpdateTimer);
      pendingPlanUpdateTimer = null;
    }
  }

  /**
   * @param {TripPlan} plan
   * @param {string | null | undefined} tripId
   */
  function savePlanSnapshotLocally(plan, tripId) {
    savePlanToLocalStorage(plan, tripId);
  }

  /**
   * @param {TripPlan} plan
   * @param {string | null | undefined} tripId
   * @param {boolean} allowOverlay
   */
  function tryApplyStartupSavedPlan(plan, tripId, allowOverlay) {
    if (!allowOverlay || startupSavedPlanConsumed || !startupSavedPlan) {
      return;
    }

    if (!doesSavedPlanMatch(plan, startupSavedPlan, tripId)) {
      return;
    }

    applySavedPlanEdits(plan, startupSavedPlan);
    startupSavedPlanConsumed = true;
  }

  function teardownTripRealtimeSubscription() {
    if (!realtimeChannel) {
      realtimeChannelTripId = "";
      return;
    }

    var client = getSupabaseClient();
    if (client && typeof client.removeChannel === "function") {
      client.removeChannel(realtimeChannel);
    }

    realtimeChannel = null;
    realtimeChannelTripId = "";
  }

  function updateDestinationTypeSuggestion(autoSetType) {
    if (!destinationInput || !destinationTypeHint) {
      return;
    }

    var suggestedType = getSuggestedTripType(destinationInput.value);
    if (!suggestedType) {
      destinationTypeHint.classList.add("is-hidden");
      destinationTypeHint.textContent = "";
      return;
    }

    if (autoSetType && tripTypeInput) {
      tripTypeInput.value = suggestedType;
    }

    destinationTypeHint.textContent = "Flyra empfiehlt für dieses Ziel den Reisetyp: " + getTripTypeLabel(suggestedType);
    destinationTypeHint.classList.remove("is-hidden");
  }

  function setFormValuesFromInput(input) {
    if (!formEl || !input) {
      return;
    }

    var destinationField = formEl.querySelector('[name="destination"]');
    var daysField = formEl.querySelector('[name="days"]');
    var budgetField = formEl.querySelector('[name="budget"]');
    var typeField = formEl.querySelector('[name="type"]');

    if (destinationField) {
      destinationField.value = input.destination;
    }
    if (daysField) {
      daysField.value = String(input.days);
    }
    if (budgetField) {
      budgetField.value = String(input.totalBudget);
    }
    if (typeField) {
      typeField.value = normalizeTripType(input.tripType);
    }
  }

  function persistCurrentPlanUpdate() {
    if (!currentTripId || !isUuid(currentTripId) || !currentPlan || !currentPlan.input) {
      return Promise.resolve(false);
    }

    if (!isLiveSyncAvailable()) {
      setCollabStatus("inactive");
      return Promise.resolve(false);
    }

    var tripIdForUpdate = currentTripId;
    var planSnapshot = currentPlan;
    latestPlanUpdateRequest += 1;
    var updateRequestId = latestPlanUpdateRequest;
    setCollabStatus("syncing");

    return updateTripPlanInSupabase(tripIdForUpdate, planSnapshot, COLLAB_CLIENT_ID).then(function (wasSaved) {
      if (updateRequestId !== latestPlanUpdateRequest) {
        return wasSaved;
      }

      if (wasSaved) {
        setCollabStatus("synced", "", true);
        return true;
      }

      if (!isLiveSyncAvailable()) {
        setCollabStatus("inactive");
        return false;
      }

      setCollabStatus("local-saved");
      return false;
    });
  }

  function scheduleCurrentPlanUpdate(flushNow) {
    if (!currentTripId || !isUuid(currentTripId) || !currentPlan) {
      return;
    }

    clearPendingPlanUpdateTimer();
    pendingPlanUpdateTimer = setTimeout(function handlePlanUpdateTimeout() {
      pendingPlanUpdateTimer = null;
      persistCurrentPlanUpdate();
    }, flushNow ? 0 : 600);
  }

  function handleItineraryFieldInput(dayIndex, slot, value, flushNow) {
    if (!currentPlan || !Array.isArray(currentPlan.itinerary)) {
      return;
    }

    if (dayIndex < 0 || dayIndex >= currentPlan.itinerary.length) {
      return;
    }

    if (slot !== "morning" && slot !== "afternoon" && slot !== "evening") {
      return;
    }

    var dayPlan = currentPlan.itinerary[dayIndex];
    if (!dayPlan) {
      return;
    }

    var normalizedValue = String(value || "").trim();
    if (String(dayPlan[slot] || "") === normalizedValue) {
      return;
    }

    clearCollabStatusResetTimer();
    setCollabStatus("syncing");
    dayPlan[slot] = normalizedValue;
    savePlanSnapshotLocally(currentPlan, currentTripId);
    setCollabStatus("local-saved", "", true);
    if (!isLiveSyncAvailable()) {
      scheduleCollabStatusRestore();
      return;
    }

    scheduleCurrentPlanUpdate(flushNow);
  }

  function ensureTripRealtimeSubscription(tripId) {
    if (!tripId || !isUuid(tripId)) {
      teardownTripRealtimeSubscription();
      return;
    }

    if (realtimeChannel && realtimeChannelTripId === tripId) {
      return;
    }

    teardownTripRealtimeSubscription();
    var client = getSupabaseClient();
    if (!client || typeof client.channel !== "function") {
      setCollabStatus("inactive");
      return;
    }

    realtimeChannelTripId = tripId;
    realtimeChannel = client
      .channel("trip-" + tripId)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "trips", filter: "id=eq." + tripId },
        function handleTripRealtimeUpdate(payload) {
          var sourceClientId = getCollabEditorClientId(payload && payload.new ? payload.new.plan_data : null);
          if (sourceClientId && sourceClientId === COLLAB_CLIENT_ID) {
            return;
          }

          reloadPlanFromServer(true);
        }
      )
      .subscribe();
  }

  function applyLoadedTrip(loadedTrip, showUpdatedIndicator, allowStartupOverlay) {
    if (!loadedTrip || !loadedTrip.plan || !loadedTrip.plan.input) {
      renderMissingTrip();
      return false;
    }

    var sanitizedInput = sanitizeTripInput(loadedTrip.plan.input);
    if (!isValidTripInput(sanitizedInput)) {
      renderMissingTrip();
      return false;
    }

    loadedTrip.plan.input = sanitizedInput;
    currentPlan = loadedTrip.plan;
    currentTripId = loadedTrip.id;
    var loadedPlanUpdatedAt = getPlanCollabUpdatedAt(loadedTrip.plan);
    if (loadedPlanUpdatedAt) {
      collabLastSavedAt = loadedPlanUpdatedAt;
    }
    tryApplyStartupSavedPlan(currentPlan, currentTripId, Boolean(allowStartupOverlay));
    setFormValuesFromInput(sanitizedInput);
    updateDestinationTypeSuggestion(false);
    renderErrors([], errorBox);
    renderPlan(loadedTrip.plan, resultBox, formEl, {
      onItineraryFieldInput: handleItineraryFieldInput,
      collabStatusState: collabStatusState,
      collabStatusMessage: collabStatusMessage,
      collabLastSavedAt: collabLastSavedAt
    });
    if (resetButton) {
      resetButton.classList.remove("is-hidden");
    }

    ensureTripRealtimeSubscription(currentTripId);
    savePlanSnapshotLocally(currentPlan, currentTripId);

    if (showUpdatedIndicator) {
      setCollabStatus("remote-update", COLLAB_REMOTE_UPDATE_MESSAGE, loadedPlanUpdatedAt || true);
      scheduleCollabStatusRestore();
    } else if (!isLiveSyncAvailable()) {
      setCollabStatus("inactive", "", loadedPlanUpdatedAt || false);
    } else {
      setCollabStatus("synced", "", loadedPlanUpdatedAt || false);
    }

    return true;
  }

  function reloadPlanFromServer(showUpdatedIndicator, allowStartupOverlay) {
    if (!currentTripId || !isUuid(currentTripId)) {
      return Promise.resolve();
    }

    var tripIdForLoad = currentTripId;
    return loadTripFromSupabase(tripIdForLoad).then(function (loadedTrip) {
      applyLoadedTrip(loadedTrip, showUpdatedIndicator, allowStartupOverlay);
    });
  }

  function renderMissingTrip() {
    clearPendingPlanUpdateTimer();
    clearCollabStatusResetTimer();
    teardownTripRealtimeSubscription();
    currentPlan = null;
    currentTripId = null;
    collabLastSavedAt = null;
    collabStatusState = "inactive";
    collabStatusMessage = "";
    renderErrors(["Reiseplan nicht gefunden"], errorBox);
    hideResult(resultBox, resetButton);
  }

  function generatePlanFromInput(input, shouldSyncQuery, allowStartupOverlay) {
    clearPendingPlanUpdateTimer();
    clearCollabStatusResetTimer();
    teardownTripRealtimeSubscription();
    var builtPlan = buildTripPlan(input);
    tryApplyStartupSavedPlan(builtPlan, null, Boolean(allowStartupOverlay));
    currentPlan = builtPlan;
    currentTripId = null;
    if (!collabLastSavedAt) {
      collabLastSavedAt = new Date();
    }
    setCollabStatusForCurrentEnvironment();
    renderErrors([], errorBox);
    if (shouldSyncQuery) {
      syncShareQueryInAddressBar(input);
    }
    renderPlan(builtPlan, resultBox, formEl, {
      onItineraryFieldInput: handleItineraryFieldInput,
      collabStatusState: collabStatusState,
      collabStatusMessage: collabStatusMessage,
      collabLastSavedAt: collabLastSavedAt
    });
    if (resetButton) {
      resetButton.classList.remove("is-hidden");
    }
    savePlanSnapshotLocally(currentPlan, currentTripId);
    setCollabStatus("local-saved", "", true);
    var liveSyncAvailable = isLiveSyncAvailable();
    if (!liveSyncAvailable) {
      scheduleCollabStatusRestore();
    }

    if (
      shouldSyncQuery &&
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 768px)").matches
    ) {
      window.setTimeout(function scrollToResult() {
        resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 140);
    }

    if (!liveSyncAvailable) {
      return;
    }

    latestSaveRequest += 1;
    var saveRequestId = latestSaveRequest;
    setCollabStatus("syncing");

    saveTripToSupabase(builtPlan, COLLAB_CLIENT_ID).then(function (savedTripId) {
      if (saveRequestId !== latestSaveRequest) {
        return;
      }
      if (savedTripId) {
        currentTripId = savedTripId;
        syncTripQueryInAddressBar(savedTripId);
        ensureTripRealtimeSubscription(savedTripId);
        persistCurrentPlanUpdate();
        savePlanSnapshotLocally(currentPlan, currentTripId);
        return;
      }

      if (!isLiveSyncAvailable()) {
        setCollabStatus("inactive");
      } else {
        setCollabStatus("local-saved");
      }
    });
  }

  function generatePlanFromForm() {
    var parsed = parseAndValidateInput(formEl);

    if (Array.isArray(parsed)) {
      clearPendingPlanUpdateTimer();
      clearCollabStatusResetTimer();
      teardownTripRealtimeSubscription();
      currentPlan = null;
      currentTripId = null;
      collabStatusState = "inactive";
      collabStatusMessage = "";
      collabLastSavedAt = null;
      renderErrors(parsed, errorBox);
      hideResult(resultBox, resetButton);
      return;
    }

    generatePlanFromInput(parsed, true, false);
  }

  formEl.addEventListener("submit", function handleSubmit(event) {
    event.preventDefault();
    generatePlanFromForm();
  });

  if (destinationInput) {
    destinationInput.addEventListener("input", function handleDestinationInput() {
      updateDestinationTypeSuggestion(true);
    });
    destinationInput.addEventListener("change", function handleDestinationChange() {
      updateDestinationTypeSuggestion(true);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", function handleReset() {
      clearPendingPlanUpdateTimer();
      clearCollabStatusResetTimer();
      teardownTripRealtimeSubscription();
      currentPlan = null;
      currentTripId = null;
      startupSavedPlan = null;
      startupSavedPlanConsumed = false;
      collabStatusState = "inactive";
      collabStatusMessage = "";
      collabLastSavedAt = null;
      formEl.reset();
      updateDestinationTypeSuggestion(false);
      renderErrors([], errorBox);
      hideResult(resultBox, resetButton);
      clearSavedPlanFromLocalStorage();
      if (
        typeof window !== "undefined" &&
        window.history &&
        typeof window.history.replaceState === "function"
      ) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      var destinationInput = formEl.querySelector("#destination");
      if (destinationInput) {
        destinationInput.focus();
      }
    });
  }

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", teardownTripRealtimeSubscription);
  }

  var tripIdFromUrl = getTripIdFromUrl();
  if (tripIdFromUrl) {
    currentTripId = tripIdFromUrl;
    reloadPlanFromServer(false, true);
    return;
  }

  var sharedInput = applyShareParamsToForm(formEl);
  updateDestinationTypeSuggestion(false);
  if (sharedInput) {
    console.log("Auto restore executed");
    setTimeout(function () {
      generatePlanFromInput(sharedInput, false, true);
    }, 0);
    return;
  }

  if (startupSavedPlan) {
    var savedInput = mapSavedPlanToInput(startupSavedPlan);
    setFormValuesFromInput(savedInput);
    updateDestinationTypeSuggestion(false);
    generatePlanFromInput(savedInput, false, true);
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePlanner, { once: true });
  }

  initializePlanner();

  if (
    !plannerInitializationDone &&
    typeof window !== "undefined" &&
    typeof window.setTimeout === "function"
  ) {
    window.setTimeout(initializePlanner, 0);
  }

  if (
    !plannerInitializationDone &&
    typeof window !== "undefined" &&
    typeof window.requestAnimationFrame === "function"
  ) {
    window.requestAnimationFrame(function handlePlannerFrame() {
      initializePlanner();
    });
  }

  if (typeof window !== "undefined") {
    window.addEventListener("pageshow", function handlePlannerPageShow() {
      if (!plannerInitializationDone) {
        initializePlanner();
      }
    });
  }

  if (!plannerInitializationDone && document.readyState === "complete") {
    initializePlanner();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseAndValidateInput: parseAndValidateInput,
    selectBudgetTier: selectBudgetTier,
    computeSplitAmounts: computeSplitAmounts,
    getBudgetStatus: getBudgetStatus,
    getBudgetStatusLabel: getBudgetStatusLabel,
    getBudgetStatusHint: getBudgetStatusHint,
    getRecommendedDays: getRecommendedDays,
    normalizeDestinationKey: normalizeDestinationKey,
    getSuggestedTripType: getSuggestedTripType,
    getTripIdFromUrl: getTripIdFromUrl,
    loadSavedPlanFromLocalStorage: loadSavedPlanFromLocalStorage,
    savePlanToLocalStorage: savePlanToLocalStorage,
    clearSavedPlanFromLocalStorage: clearSavedPlanFromLocalStorage,
    saveTripToSupabase: saveTripToSupabase,
    updateTripPlanInSupabase: updateTripPlanInSupabase,
    loadTripFromSupabase: loadTripFromSupabase,
    buildShareQuery: buildShareQuery,
    buildShareUrl: buildShareUrl,
    buildPdfFilename: buildPdfFilename,
    exportPlanAsPdf: exportPlanAsPdf,
    getShareInputFromUrl: getShareInputFromUrl,
    applyShareParamsToForm: applyShareParamsToForm,
    buildItinerary: buildItinerary,
    renderPlan: renderPlan,
    renderErrors: renderErrors,
    buildTripPlan: buildTripPlan
  };
}

