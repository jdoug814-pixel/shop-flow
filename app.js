// ==========================================================================
// BODY SHOP MANAGEMENT SUITE (BSMS) - APPLICATION LOGIC
// ==========================================================================

// --- Shop Config & Constant Values ---
const SHOP_LABOR_RATE = 65.00; // Dollars per hour (default fallback)
const STANDARD_MATERIAL_RATE = 45.00; // Paint materials rate per labor hour (default fallback)

// Standard collision panels list for Step 3 selector
const COLLISION_PANELS = [
  { key: "bumper_f", label: "Front Bumper Cover", defaultRefinish: 2.5, defaultRi: 1.4, defaultReplaceLabor: 2.2 },
  { key: "bumper_r", label: "Rear Bumper Cover", defaultRefinish: 2.5, defaultRi: 1.4, defaultReplaceLabor: 2.2 },
  { key: "hood", label: "Hood Panel", defaultRefinish: 3.0, defaultRi: 0.8, defaultReplaceLabor: 1.5 },
  { key: "fender_l", label: "L Front Fender", defaultRefinish: 2.2, defaultRi: 1.0, defaultReplaceLabor: 1.6 },
  { key: "fender_r", label: "R Front Fender", defaultRefinish: 2.2, defaultRi: 1.0, defaultReplaceLabor: 1.6 },
  { key: "door_lf", label: "L Front Door", defaultRefinish: 2.5, defaultRi: 1.8, defaultReplaceLabor: 3.5 },
  { key: "door_rf", label: "R Front Door", defaultRefinish: 2.5, defaultRi: 1.8, defaultReplaceLabor: 3.5 },
  { key: "door_lr", label: "L Rear Door", defaultRefinish: 2.5, defaultRi: 1.8, defaultReplaceLabor: 3.2 },
  { key: "door_rr", label: "R Rear Door", defaultRefinish: 2.5, defaultRi: 1.8, defaultReplaceLabor: 3.2 },
  { key: "quarter_l", label: "L Rear Quarter", defaultRefinish: 3.2, defaultRi: 1.5, defaultReplaceLabor: 9.5 },
  { key: "quarter_r", label: "R Rear Quarter", defaultRefinish: 3.2, defaultRi: 1.5, defaultReplaceLabor: 9.5 },
  { key: "roof", label: "Roof Panel", defaultRefinish: 4.2, defaultRi: 2.5, defaultReplaceLabor: 10.5 },
  { key: "trunk", label: "Trunk Lid / Hatch", defaultRefinish: 2.5, defaultRi: 1.5, defaultReplaceLabor: 2.5 },
  { key: "misc", label: "Other / Misc Repair", defaultRefinish: 1.0, defaultRi: 0.5, defaultReplaceLabor: 1.0 }
];

// Paint volumes needed per panel (in liquid ounces) for Paint Mixing tab
const PANEL_VOLUMES = {
  bumper: 12,
  hood: 18,
  fender: 10,
  door: 12,
  roof: 22,
  trunk: 12,
  quarter: 14,
  mirror: 4,
  tailgate: 12
};

// Panel labels for Paint Mixing tab
const PANEL_LABELS = {
  bumper: "Bumper Cover",
  hood: "Hood Panel",
  fender: "Fender",
  door: "Door",
  roof: "Roof Panel",
  trunk: "Trunk Lid / Hatch",
  quarter: "Quarter Panel",
  mirror: "Mirror / Trim Piece",
  tailgate: "Tailgate"
};

// Material Prices (per Ounce) for Paint Mixing tab
const MATERIAL_PRICES = {
  paint: 3.20,      // Basecoat or Single Stage
  clearcoat: 2.50,  // Clearcoat
  hardener: 4.20,   // Activator / Hardener
  reducer: 1.10,    // Reducer / Thinner
  primer: 1.50      // Primer Surfacer
};

// System Mix Ratio definitions for Paint Mixing tab
const SYSTEM_RATIOS = {
  "base-clear": {
    label: "Basecoat + Clearcoat (Standard 2-Stage)",
    ratios: [
      { id: "bc-1-1", label: "Basecoat 1:1 with Reducer | Clear 4:1:1", base: { ratio: [1, 1], parts: ["paint", "reducer"] }, clear: { ratio: [4, 1, 1], parts: ["clearcoat", "hardener", "reducer"] } },
      { id: "bc-2-1", label: "Basecoat 2:1 with Reducer | Clear 4:1", base: { ratio: [2, 1], parts: ["paint", "reducer"] }, clear: { ratio: [4, 1], parts: ["clearcoat", "hardener"] } }
    ]
  },
  "single-stage": {
    label: "Single Stage Urethane",
    ratios: [
      { id: "ss-8-1-1", label: "Single Stage 8:1:1 (Paint:Hardener:Reducer)", ss: { ratio: [8, 1, 1], parts: ["paint", "hardener", "reducer"] } },
      { id: "ss-4-1", label: "Single Stage 4:1 (Paint:Hardener)", ss: { ratio: [4, 1], parts: ["paint", "hardener"] } }
    ]
  },
  "tri-coat": {
    label: "Tri-Coat / Pearl (3-Stage)",
    ratios: [
      { id: "tc-1-1", label: "Basecoat 1:1 | Midcoat 1:1 | Clear 4:1:1", ground: { ratio: [1, 1], parts: ["paint", "reducer"] }, mid: { ratio: [1, 1], parts: ["paint", "reducer"] }, clear: { ratio: [4, 1, 1], parts: ["clearcoat", "hardener", "reducer"] } }
    ]
  },
  "primer-surfacer": {
    label: "High-Build Primer Surfacer",
    ratios: [
      { id: "pr-4-1", label: "Primer 4:1 (Primer:Hardener)", primer: { ratio: [4, 1], parts: ["primer", "hardener"] } },
      { id: "pr-4-1-1", label: "Primer 4:1:1 (Primer:Hardener:Reducer)", primer: { ratio: [4, 1, 1], parts: ["primer", "hardener", "reducer"] } }
    ]
  }
};

// Manufacturer Paint Color Code locations guide
const COLOR_CODE_LOCATIONS = {
  ford: "Driver door jamb (under the lock striker, labeled 'EXT PNT' or 'PAINT').",
  lincoln: "Driver door jamb (under the lock striker, labeled 'EXT PNT' or 'PAINT').",
  gm: "Glove compartment (on SPID label), or inside the driver door jamb, or spare tire cover.",
  chevrolet: "Glove compartment (on SPID label), or inside the driver door jamb, or spare tire cover.",
  gmc: "Glove compartment (on SPID label), or inside the driver door jamb, or spare tire cover.",
  cadillac: "Glove compartment (on SPID label), or inside the driver door jamb, or spare tire cover.",
  buick: "Glove compartment (on SPID label), or inside the driver door jamb, or spare tire cover.",
  toyota: "Driver's side door jamb (labeled 'C/TR: ...').",
  lexus: "Driver's side door jamb (labeled 'C/TR: ...').",
  scion: "Driver's side door jamb (labeled 'C/TR: ...').",
  honda: "Driver's side door jamb (center pillar or edge of the door).",
  acura: "Driver's side door jamb (center pillar or edge of the door).",
  nissan: "Inside the engine compartment (firewall), or driver's door jamb.",
  infiniti: "Inside the engine compartment (firewall), or driver's door jamb.",
  subaru: "Under the hood on the passenger strut tower, or driver's door jamb.",
  mazda: "Driver's side door jamb / pillar.",
  hyundai: "Driver's side door pillar / jamb.",
  kia: "Driver's side door pillar / jamb.",
  mitsubishi: "Driver's side door jamb, or firewall in the engine compartment.",
  chrysler: "Driver's side door jamb.",
  dodge: "Driver's side door jamb.",
  jeep: "Driver's side door jamb, or under the hood on firewall.",
  ram: "Driver's side door jamb.",
  bmw: "Under the hood on the strut tower or fender, or driver door jamb.",
  mercedes: "Driver's side door jamb, or under the hood on the radiator support.",
  audi: "In the trunk compartment (spare tire wheel well floor, under carpet on build label).",
  volkswagen: "In the trunk compartment (spare tire wheel well floor, under carpet on build label).",
  volvo: "Right side center pillar (open passenger rear door), or under the hood.",
  porsche: "Spare tire well, or driver's side door jamb."
};

// Mock Parts Catalog for major manufacturers
const MOCK_PARTS_CATALOG = {
  ford: {
    bumper_f: [
      { name: "OEM Ford Front Bumper Cover (Primed)", cost: 410.00, type: "OEM" },
      { name: "Aftermarket CAPA Front Bumper Cover", cost: 215.00, type: "Aftermarket" },
      { name: "LKQ Recycled Front Bumper Assembly", cost: 180.00, type: "Recycled" },
      { name: "OEM Ford Lower Grille & Trim", cost: 95.00, type: "OEM" },
      { name: "OEM Ford Left Fog Lamp Assembly", cost: 85.00, type: "OEM" }
    ],
    bumper_r: [
      { name: "OEM Ford Rear Bumper Cover", cost: 395.00, type: "OEM" },
      { name: "Aftermarket CAPA Rear Bumper Cover", cost: 205.00, type: "Aftermarket" },
      { name: "LKQ Recycled Rear Bumper Assembly", cost: 160.00, type: "Recycled" }
    ],
    hood: [
      { name: "OEM Ford Aluminum Hood Panel", cost: 580.00, type: "OEM" },
      { name: "Aftermarket CAPA Aluminum Hood", cost: 320.00, type: "Aftermarket" },
      { name: "LKQ Recycled Hood Panel", cost: 250.00, type: "Recycled" }
    ],
    fender_l: [
      { name: "OEM Ford Front Left Fender", cost: 260.00, type: "OEM" },
      { name: "Aftermarket CAPA Left Fender", cost: 135.00, type: "Aftermarket" }
    ],
    fender_r: [
      { name: "OEM Ford Front Right Fender", cost: 260.00, type: "OEM" },
      { name: "Aftermarket CAPA Right Fender", cost: 135.00, type: "Aftermarket" }
    ]
  },
  toyota: {
    bumper_f: [
      { name: "OEM Toyota Front Bumper Cover", cost: 340.00, type: "OEM" },
      { name: "Aftermarket CAPA Front Bumper Cover", cost: 175.00, type: "Aftermarket" },
      { name: "LKQ Recycled Front Bumper Cover", cost: 130.00, type: "Recycled" },
      { name: "OEM Toyota Front Grille (Upper)", cost: 120.00, type: "OEM" }
    ],
    bumper_r: [
      { name: "OEM Toyota Rear Bumper Cover", cost: 320.00, type: "OEM" },
      { name: "Aftermarket CAPA Rear Bumper Cover", cost: 165.00, type: "Aftermarket" }
    ],
    hood: [
      { name: "OEM Toyota Steel Hood Panel", cost: 460.00, type: "OEM" },
      { name: "Aftermarket CAPA Steel Hood", cost: 240.00, type: "Aftermarket" },
      { name: "LKQ Recycled Hood Panel", cost: 190.00, type: "Recycled" }
    ]
  },
  honda: {
    bumper_f: [
      { name: "OEM Honda Front Bumper Cover", cost: 325.00, type: "OEM" },
      { name: "Aftermarket CAPA Front Bumper Cover", cost: 165.00, type: "Aftermarket" },
      { name: "LKQ Recycled Front Bumper Cover", cost: 120.00, type: "Recycled" }
    ],
    bumper_r: [
      { name: "OEM Honda Rear Bumper Cover", cost: 310.00, type: "OEM" },
      { name: "Aftermarket CAPA Rear Bumper Cover", cost: 155.00, type: "Aftermarket" }
    ],
    hood: [
      { name: "OEM Honda Steel Hood Panel", cost: 440.00, type: "OEM" },
      { name: "Aftermarket CAPA Steel Hood", cost: 220.00, type: "Aftermarket" },
      { name: "LKQ Recycled Hood Panel", cost: 180.00, type: "Recycled" }
    ]
  },
  generic: {
    bumper_f: [
      { name: "OEM Front Bumper Cover", cost: 380.00, type: "OEM" },
      { name: "Aftermarket CAPA Bumper Cover", cost: 195.00, type: "Aftermarket" },
      { name: "LKQ Recycled Bumper Cover", cost: 150.00, type: "Recycled" }
    ],
    bumper_r: [
      { name: "OEM Rear Bumper Cover", cost: 360.00, type: "OEM" },
      { name: "Aftermarket CAPA Bumper Cover", cost: 185.00, type: "Aftermarket" },
      { name: "LKQ Recycled Bumper Cover", cost: 140.00, type: "Recycled" }
    ],
    hood: [
      { name: "OEM Steel Hood Panel", cost: 520.00, type: "OEM" },
      { name: "Aftermarket CAPA Hood Panel", cost: 280.00, type: "Aftermarket" },
      { name: "LKQ Recycled Hood Panel", cost: 220.00, type: "Recycled" }
    ],
    fender_l: [
      { name: "OEM Front Fender (Left)", cost: 240.00, type: "OEM" },
      { name: "Aftermarket CAPA Fender (Left)", cost: 125.00, type: "Aftermarket" },
      { name: "LKQ Recycled Fender (Left)", cost: 95.00, type: "Recycled" }
    ],
    fender_r: [
      { name: "OEM Front Fender (Right)", cost: 240.00, type: "OEM" },
      { name: "Aftermarket CAPA Fender (Right)", cost: 125.00, type: "Aftermarket" },
      { name: "LKQ Recycled Fender (Right)", cost: 95.00, type: "Recycled" }
    ],
    door_lf: [
      { name: "OEM Front Door Shell (Left)", cost: 680.00, type: "OEM" },
      { name: "LKQ Recycled Door Assembly (Left)", cost: 450.00, type: "Recycled" }
    ],
    door_rf: [
      { name: "OEM Front Door Shell (Right)", cost: 680.00, type: "OEM" },
      { name: "LKQ Recycled Door Assembly (Right)", cost: 450.00, type: "Recycled" }
    ],
    door_lr: [
      { name: "OEM Rear Door Shell (Left)", cost: 620.00, type: "OEM" },
      { name: "LKQ Recycled Door Assembly (Left)", cost: 420.00, type: "Recycled" }
    ],
    door_rr: [
      { name: "OEM Rear Door Shell (Right)", cost: 620.00, type: "OEM" },
      { name: "LKQ Recycled Door Assembly (Right)", cost: 420.00, type: "Recycled" }
    ],
    quarter_l: [
      { name: "OEM Rear Quarter Panel (Left)", cost: 850.00, type: "OEM" },
      { name: "LKQ Recycled Quarter Panel Section (Left)", cost: 450.00, type: "Recycled" }
    ],
    quarter_r: [
      { name: "OEM Rear Quarter Panel (Right)", cost: 850.00, type: "OEM" },
      { name: "LKQ Recycled Quarter Panel Section (Right)", cost: 450.00, type: "Recycled" }
    ],
    roof: [
      { name: "OEM Roof Panel Skin", cost: 950.00, type: "OEM" }
    ],
    trunk: [
      { name: "OEM Trunk Lid / Deck Lid", cost: 480.00, type: "OEM" },
      { name: "Aftermarket CAPA Deck Lid", cost: 260.00, type: "Aftermarket" },
      { name: "LKQ Recycled Trunk Lid Assembly", cost: 200.00, type: "Recycled" }
    ]
  }
};

// Kanban Workflow Stages
const WORKFLOW_STAGES = {
  intake: { title: "Intake / Estimate", class: "pill-muted" },
  bodywork: { title: "Body Work & Prep", class: "pill-yellow" },
  paint: { title: "Paint", class: "pill-blue" },
  detail: { title: "Clean Up", class: "pill-cyan" },
  pickup: { title: "Ready for Pickup", class: "pill-green" }
};

// --- Application State ---
let state = {
  jobs: [],
  inventory: [],
  clients: [],
  paintCalc: {
    selectedPanels: [],
    systemType: "base-clear",
    ratioId: "bc-1-1",
    calculatedVolume: 0,
    calculatedCost: 0,
    breakdown: {}
  }
};

// --- Wizard Check-In State ---
let currentWizardStep = 1;
let tempSelectedPanels = {}; // Tracks panel details for current editing form
let tempPhotos = []; // Tracks Base64 photo URLs for current editing form
let tempFlatItems = []; // Tracks wholesale flat-rate repair items for current editing form
let selectedWholesaleInvoiceJobs = []; // Tracks checked job IDs in the wholesale billing panel

// --- Mock Defaults ---
const DEFAULT_INVENTORY = [
  { id: "inv-1", name: "3M Masking Tape 2-Inch", category: "Allied Materials", stock: 18, minLevel: 6, price: 5.95 },
  { id: "inv-2", name: "Evercoat Rage Gold Filler 1 Gal", category: "Fillers", stock: 3, minLevel: 2, price: 62.50 },
  { id: "inv-3", name: "80 Grit Sandpaper DA Disc (50 Box)", category: "Abrasives", stock: 2, minLevel: 3, price: 34.00 },
  { id: "inv-4", name: "180 Grit Sandpaper DA Disc (50 Box)", category: "Abrasives", stock: 4, minLevel: 3, price: 34.00 },
  { id: "inv-5", name: "320 Grit Sandpaper DA Disc (50 Box)", category: "Abrasives", stock: 1, minLevel: 2, price: 34.00 },
  { id: "inv-6", name: "800 Grit Wet Sandpaper (50 Box)", category: "Abrasives", stock: 5, minLevel: 2, price: 39.50 },
  { id: "inv-7", name: "Paint Mixing Cups 32oz (Pack of 50)", category: "Allied Materials", stock: 12, minLevel: 5, price: 28.00 },
  { id: "inv-8", name: "Premium High Gloss Clearcoat (1 Gal)", category: "Paint Liquids", stock: 4, minLevel: 2, price: 185.00 },
  { id: "inv-9", name: "Urethane Medium Activator/Hardener (1 Qt)", category: "Paint Liquids", stock: 3, minLevel: 2, price: 52.00 },
  { id: "inv-10", name: "Standard Urethane Reducer (1 Gal)", category: "Paint Liquids", stock: 2, minLevel: 2, price: 38.00 },
  { id: "inv-11", name: "Epoxy Primer Gray (1 Gal)", category: "Paint Liquids", stock: 2, minLevel: 1, price: 110.00 }
];

const DEFAULT_JOBS = [
  {
    id: "RO-1001",
    customer: { name: "Marcus Aurelius", phone: "555-2399", email: "marcus@rome.org" },
    vehicle: { year: 2021, make: "Honda", model: "Civic", color: "NH-731P (Crystal Black Pearl)", vin: "1HGCG2F87LA02931", plate: "SPQR-1" },
    stage: "paint",
    priority: "medium",
    billingType: "insurance",
    clientType: "retail",
    insurance: { company: "State Farm", deductible: 500 },
    rates: { bodyRate: 65, paintRate: 65, materialRate: 45 },
    panels: [
      { key: "fender_l", label: "L Front Fender", refinishHours: 3.0, bodyHours: 2.0, riHours: 1.0, substrate: "steel", replacePart: false, partName: "", partCost: 0, riSelected: true },
      { key: "bumper_f", label: "Front Bumper Cover", refinishHours: 3.5, bodyHours: 1.0, riHours: 1.5, substrate: "plastic", replacePart: true, partName: "Bumper Bracket Kit", partCost: 80.0, riSelected: true },
      { key: "hood", label: "Hood Panel", refinishHours: 2.0, bodyHours: 0.0, riHours: 0.0, substrate: "steel", replacePart: false, partName: "", partCost: 0, riSelected: false }
    ],
    laborHours: 14,
    partsCost: 80.00,
    paintMaterialSurcharge: 382.50, // 8.5 refinish hrs * 45
    notes: "Left fender dent and front bumper scrape. Repair fender, blend hood and driver door.",
    createdAt: "2026-06-10T10:15:00Z",
    targetDate: "2026-06-20",
    photos: [],
    history: [
      { stage: "intake", timestamp: "2026-06-10T10:15:00Z" },
      { stage: "bodywork", timestamp: "2026-06-12T09:00:00Z" },
      { stage: "paint", timestamp: "2026-06-14T14:20:00Z" }
    ]
  },
  {
    id: "RO-1002",
    customer: { name: "Sarah Connor", phone: "555-8822", email: "sconnor@resistance.net" },
    vehicle: { year: 2018, make: "Chevrolet", model: "Suburban", color: "WA-9654 (Gloss Black)", vin: "1GNFK2E09JA19827", plate: "NO-FATE" },
    stage: "bodywork",
    priority: "high",
    billingType: "customer",
    clientType: "retail",
    insurance: { company: "", deductible: 0 },
    rates: { bodyRate: 65, paintRate: 65, materialRate: 45 },
    panels: [
      { key: "hood", label: "Hood Panel", refinishHours: 4.0, bodyHours: 3.0, riHours: 1.5, substrate: "steel", replacePart: true, partName: "OEM Hood", partCost: 650.0, riSelected: true },
      { key: "bumper_f", label: "Front Bumper Cover", refinishHours: 3.5, bodyHours: 2.5, riHours: 1.5, substrate: "plastic", replacePart: true, partName: "Bumper Assembly & Grille", partCost: 800.0, riSelected: true }
    ],
    laborHours: 16.0,
    partsCost: 1450.00,
    paintMaterialSurcharge: 337.50, // 7.5 refinish hrs * 45
    notes: "Front collision. Replace hood, radiator core support, front bumper assembly, grille. Paint hood and blend fenders.",
    createdAt: "2026-06-12T11:45:00Z",
    targetDate: "2026-06-25",
    photos: [],
    history: [
      { stage: "intake", timestamp: "2026-06-12T11:45:00Z" },
      { stage: "bodywork", timestamp: "2026-06-14T09:00:00Z" }
    ]
  },
  {
    id: "RO-1003",
    customer: { name: "Gary Miller", phone: "555-0122", email: "billing@autonationford.com" },
    vehicle: { year: 2019, make: "Ford", model: "Mustang", color: "G1 (Shadow Black)", vin: "1FA6P8CF9K510822", plate: "MILL-1" },
    stage: "pickup",
    priority: "low",
    billingType: "customer",
    clientType: "wholesale",
    wholesaleCompany: "AutoNation Ford",
    flatItems: [
      { description: "Front Bumper Repair", cost: 250 },
      { description: "Headlight Restoration", cost: 80 }
    ],
    laborHours: 0,
    partsCost: 0,
    paintMaterialSurcharge: 0,
    notes: "Flat rate repair for AutoNation Ford dealer lot. Front bumper repair and headlights buff.",
    createdAt: "2026-06-08T09:00:00Z",
    targetDate: "2026-06-18",
    photos: [],
    history: [
      { stage: "intake", timestamp: "2026-06-08T09:00:00Z" },
      { stage: "bodywork", timestamp: "2026-06-09T08:00:00Z" },
      { stage: "paint", timestamp: "2026-06-11T10:00:00Z" },
      { stage: "pickup", timestamp: "2026-06-14T15:30:00Z" }
    ]
  }
];

// Load state from localStorage or use defaults
function loadData() {
  const savedJobs = localStorage.getItem("bsms_jobs");
  const savedInventory = localStorage.getItem("bsms_inventory");
  const savedClients = localStorage.getItem("bsms_clients");
  
  if (savedJobs) {
    state.jobs = JSON.parse(savedJobs);
    
    // Schema migration for old jobs to ensure backward compatibility
    state.jobs.forEach(job => {
      if (!job.targetDate) {
        if (job.id === "RO-1001") job.targetDate = "2026-06-20";
        if (job.id === "RO-1002") job.targetDate = "2026-06-25";
        if (job.id === "RO-1003") job.targetDate = "2026-06-18";
      }
      
      if (!job.rates) {
        job.rates = { bodyRate: 65.0, paintRate: 65.0, materialRate: 45.0 };
      }

      if (!job.clientType) {
        job.clientType = job.wholesaleCompany ? "wholesale" : "retail";
      }

      if (!job.photos) {
        job.photos = [];
      }

      if (!job.flatItems) {
        job.flatItems = [];
      }
      
      if (job.clientType === "retail" && !job.panels) {
        if (job.laborHours > 0 || job.partsCost > 0 || job.paintMaterialSurcharge > 0) {
          const refHrs = job.paintMaterialSurcharge / job.rates.materialRate;
          const refLab = Math.min(refHrs || 0, job.laborHours);
          const bodyLab = Math.max(0, job.laborHours - refLab);
          
          job.panels = [{
            key: "misc",
            label: "Other / Misc Repair",
            refinishHours: refLab,
            bodyHours: bodyLab,
            riHours: 0,
            substrate: "steel",
            replacePart: job.partsCost > 0,
            partName: "Parts Surcharge",
            partCost: job.partsCost,
            riSelected: false
          }];
        } else {
          job.panels = [];
        }
      }
      
      // Migrate legacy workflow stages to new 5-column layout
      const validStages = ["intake", "bodywork", "paint", "detail", "pickup", "completed"];
      if (!validStages.includes(job.stage)) {
        if (job.stage === "teardown" || job.stage === "bodywork") {
          job.stage = "bodywork";
        } else if (job.stage === "paint" || job.stage === "assembly") {
          job.stage = "paint";
        } else if (job.stage === "detail") {
          job.stage = "detail";
        } else if (job.stage === "pickup") {
          job.stage = "pickup";
        } else {
          job.stage = "intake";
        }
      }
      
      // Clean up legacy variables
      delete job.pdrLines;
      delete job.pdrTotal;
    });
  } else {
    state.jobs = [...DEFAULT_JOBS];
    localStorage.setItem("bsms_jobs", JSON.stringify(state.jobs));
  }
  
  if (savedInventory) {
    state.inventory = JSON.parse(savedInventory);
  } else {
    state.inventory = [...DEFAULT_INVENTORY];
    localStorage.setItem("bsms_inventory", JSON.stringify(state.inventory));
  }

  if (savedClients) {
    state.clients = JSON.parse(savedClients);
    // Ensure all clients have a type (retail or wholesale)
    state.clients.forEach(c => {
      if (!c.type) {
        c.type = (c.contactName || c.name.toLowerCase().includes("service") || c.name.toLowerCase().includes("car") || c.name.toLowerCase().includes("ford") || c.name.toLowerCase().includes("enterprise")) ? "wholesale" : "retail";
      }
    });
  } else {
    state.clients = [
      { id: "cli-1", name: "AutoNation Ford", type: "wholesale", contactName: "Gary Miller", phone: "555-0122", email: "billing@autonationford.com" },
      { id: "cli-2", name: "CarMax Service", type: "wholesale", contactName: "Sarah Jenkins", phone: "555-0145", email: "invoices@carmax.com" },
      { id: "cli-3", name: "Enterprise Rent-A-Car", type: "wholesale", contactName: "Robert Vance", phone: "555-0188", email: "fleet@enterprise.com" },
      { id: "cli-4", name: "Marcus Aurelius", type: "retail", phone: "555-2399", email: "marcus@rome.org" },
      { id: "cli-5", name: "Julius Caesar", type: "retail", phone: "555-1000", email: "caesar@senate.gov" },
      { id: "cli-6", name: "Cleopatra Philopator", type: "retail", phone: "555-2700", email: "cleo@alexandria.eg" }
    ];
    localStorage.setItem("bsms_clients", JSON.stringify(state.clients));
  }
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  renderApp();
  initPaintCalculatorSelectors();
  updateTopNavStats();

  const wholesaleInput = document.getElementById("wholesale-company");
  if (wholesaleInput) {
    wholesaleInput.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      if (!val) return;

      const matchedClient = state.clients.find(c => c.name.toLowerCase() === val.toLowerCase());
      if (matchedClient) {
        const nameInput = document.getElementById("cust-name");
        const phoneInput = document.getElementById("cust-phone");
        const emailInput = document.getElementById("cust-email");

        if (nameInput) nameInput.value = matchedClient.contactName || "";
        if (phoneInput) phoneInput.value = matchedClient.phone || "";
        if (emailInput) emailInput.value = matchedClient.email || "";

        showToast(`Loaded pre-configured client: ${matchedClient.name}`, "info");
      }
    });
  }
});

// Save state to localStorage
function saveState() {
  localStorage.setItem("bsms_jobs", JSON.stringify(state.jobs));
  localStorage.setItem("bsms_inventory", JSON.stringify(state.inventory));
  localStorage.setItem("bsms_clients", JSON.stringify(state.clients || []));
  updateTopNavStats();
}

// --- Navigation Controller ---
function switchView(viewId) {
  document.querySelectorAll(".content-view").forEach(view => {
    view.classList.remove("active");
  });
  
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) targetView.classList.add("active");
  
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });
  
  const targetNavItem = document.getElementById(`nav-${viewId}`);
  if (targetNavItem) targetNavItem.classList.add("active");
  
  const titleMap = {
    kanban: "Vehicle Flow Board",
    clients: "Clients Manager",
    estimates: "Retail Estimates",
    inventory: "Inventory Manager"
  };
  document.getElementById("view-title").innerText = titleMap[viewId] || "Body Shop Suite";
  
  renderApp();
}

// --- Render Controller ---
function renderApp() {
  renderKanban();
  renderClientsList();
  renderEstimatesList();
  renderInventoryList();
}

// --- Toast System ---
function showToast(message, type = "success") {
  const container = document.getElementById("toast-placement");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = "slideInRight 0.3s reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- Stats Counters ---
function updateTopNavStats() {
  const activeJobs = state.jobs.filter(j => j.stage !== "pickup").length;
  const paintJobs = state.jobs.filter(j => j.stage === "paint").length;
  const lowStock = state.inventory.filter(item => item.stock <= item.minLevel).length;
  
  document.getElementById("top-vehicles-count").innerText = activeJobs;
  document.getElementById("top-paint-count").innerText = paintJobs;
  document.getElementById("top-low-stock-count").innerText = lowStock;
  
  const dashboardActive = document.getElementById("dashboard-active-jobs");
  if (dashboardActive) dashboardActive.innerText = activeJobs;
  
  const dashboardPaint = document.getElementById("dashboard-paint-jobs");
  if (dashboardPaint) dashboardPaint.innerText = paintJobs;
  
  const dashboardLow = document.getElementById("dashboard-low-inventory");
  if (dashboardLow) dashboardLow.innerText = lowStock;
  
  const completedJobsCount = state.jobs.filter(j => j.stage === "pickup").length;
  const dashboardCompleted = document.getElementById("dashboard-completed-jobs");
  if (dashboardCompleted) dashboardCompleted.innerText = completedJobsCount;
}

// ==========================================================================
// VIEW RENDERING MODULES
// ==========================================================================

// --- Dashboard View ---
function renderDashboard() {
  const tbody = document.querySelector("#dashboard-jobs-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const activeJobs = state.jobs
    .filter(j => j.stage !== "pickup")
    .sort((a, b) => {
      const prioWeight = { high: 3, medium: 2, low: 1 };
      return prioWeight[b.priority] - prioWeight[a.priority];
    })
    .slice(0, 5);
    
  if (activeJobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No active repair orders in shop.</td></tr>`;
    return;
  }
  
  activeJobs.forEach(job => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight: 600;">${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}</td>
      <td>${job.customer.name || job.wholesaleCompany || "Unknown"}</td>
      <td><span class="status-pill ${WORKFLOW_STAGES[job.stage].class}">${WORKFLOW_STAGES[job.stage].title}</span></td>
      <td>${job.billingType === "insurance" ? job.insurance.company : "Customer Pay"}</td>
      <td>
        <button class="btn btn-sm" onclick="viewJobDetails('${job.id}')">View</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const alertContainer = document.getElementById("dashboard-inventory-alerts");
  if (!alertContainer) return;
  alertContainer.innerHTML = "";
  
  const lowStockItems = state.inventory.filter(item => item.stock <= item.minLevel);
  
  if (lowStockItems.length === 0) {
    alertContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 1rem;">
        All supplies fully stocked.
      </div>
    `;
    return;
  }
  
  lowStockItems.slice(0, 4).forEach(item => {
    const isOutOfStock = item.stock === 0;
    const progressPercent = Math.min((item.stock / item.minLevel) * 100, 100);
    const progressClass = isOutOfStock ? "low" : "warning";
    const statusText = isOutOfStock ? "Out of Stock!" : `Low Stock (${item.stock} left)`;
    
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
        <span style="font-weight: 500;">${item.name}</span>
        <span style="color: ${isOutOfStock ? 'var(--accent-rose)' : 'var(--accent-amber)'}; font-weight: 600;">${statusText}</span>
      </div>
      <div class="stock-bar-container">
        <div class="stock-bar ${progressClass}" style="width: ${progressPercent}%;"></div>
      </div>
    `;
    alertContainer.appendChild(div);
  });
}

// --- Kanban Board View ---
function renderKanban() {
  const container = document.getElementById("kanban-board-container");
  if (!container) return;
  container.innerHTML = "";
  
  Object.keys(WORKFLOW_STAGES).forEach(stageKey => {
    const stageInfo = WORKFLOW_STAGES[stageKey];
    const columnJobs = state.jobs.filter(j => j.stage === stageKey);
    
    const colDiv = document.createElement("div");
    colDiv.className = "kanban-column";
    colDiv.setAttribute("data-stage", stageKey);
    colDiv.ondragover = (e) => e.preventDefault();
    colDiv.ondrop = (e) => handleKanbanDrop(e, stageKey);
    
    colDiv.innerHTML = `
      <div class="kanban-column-header">
        <span class="column-title">
          <span style="width: 8px; height: 8px; border-radius: 50%; display: inline-block; background-color: var(--accent-indigo);"></span>
          ${stageInfo.title}
        </span>
        <span class="card-count">${columnJobs.length}</span>
      </div>
      <div class="kanban-cards-container" id="kanban-${stageKey}"></div>
    `;
    
    const cardsContainer = colDiv.querySelector(".kanban-cards-container");
    
    if (columnJobs.length === 0) {
      cardsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 1.5rem 0; border: 1px dashed rgba(255,255,255,0.03); border-radius: 6px;">Empty stage</div>`;
    } else {
      columnJobs.forEach(job => {
        const card = document.createElement("div");
        card.className = "kanban-card";
        card.draggable = true;
        card.ondragstart = (e) => {
          e.dataTransfer.setData("text/plain", job.id);
          card.style.opacity = "0.5";
        };
        card.ondragend = () => {
          card.style.opacity = "1";
        };
        
        let priorityPill = `<span class="card-priority priority-low">Low</span>`;
        if (job.priority === "high") {
          priorityPill = `<span class="card-priority priority-high">Rush</span>`;
        } else if (job.priority === "medium") {
          priorityPill = `<span class="card-priority priority-medium">Standard</span>`;
        }
        
        let coverImgHtml = "";
        if (job.photos && job.photos.length > 0) {
          coverImgHtml = `<img src="${job.photos[0]}" class="kanban-card-cover" alt="Cover Image" onclick="openPhotoLightbox('${job.photos[0]}')">`;
        }
        
        let nextStageBtn = "";
        if (job.stage === "pickup") {
          nextStageBtn = `
            <button class="card-action-btn" onclick="completeAndArchiveJob('${job.id}')" title="Deliver & Complete Job" style="color: var(--accent-emerald);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:14px; height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          `;
        } else {
          nextStageBtn = `
            <button class="card-action-btn" onclick="moveJobStage('${job.id}', 'next')" title="Advance Stage">
              <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          `;
        }
        
        const labelText = job.clientType === "wholesale" ? "Flat Rate" : `Labor: ${job.laborHours.toFixed(1)}h`;
        
        card.innerHTML = `
          ${coverImgHtml}
          <div style="padding: 1rem;">
            ${priorityPill}
            <div class="card-vehicle" style="margin-top:0.35rem;">${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}</div>
            <div class="card-customer">${job.customer.name || job.wholesaleCompany || "Unknown"}</div>
            <div class="card-meta">
              <span>${labelText}</span>
              <span>$${calculateTotalROCost(job).toFixed(2)}</span>
            </div>
            ${job.targetDate ? `<div style="font-size: 0.75rem; color: var(--accent-amber); font-weight: 600; margin-top: 0.25rem;">Target: ${new Date(job.targetDate + 'T00:00:00').toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}</div>` : ''}
            <div class="card-actions">
              <button class="card-action-btn" onclick="moveJobStage('${job.id}', 'prev')" title="Move Back">
                <svg viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button class="card-action-btn" onclick="viewJobDetails('${job.id}')" title="View Details">
                <svg viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
              <button class="card-action-btn" onclick="openEditJobModal('${job.id}')" title="Edit Order">
                <svg viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              ${nextStageBtn}
            </div>
          </div>
        `;
        cardsContainer.appendChild(card);
      });
    }
    
    container.appendChild(colDiv);
  });
}

function handleKanbanDrop(e, targetStage) {
  e.preventDefault();
  const jobId = e.dataTransfer.getData("text/plain");
  const job = state.jobs.find(j => j.id === jobId);
  
  if (job && job.stage !== targetStage) {
    updateJobStageStatus(job, targetStage);
    renderApp();
    showToast(`Moved ${job.vehicle.make} to ${WORKFLOW_STAGES[targetStage].title}`);
  }
}

function moveJobStage(jobId, direction) {
  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return;
  
  const stageKeys = Object.keys(WORKFLOW_STAGES);
  const currentIndex = stageKeys.indexOf(job.stage);
  
  let targetIndex = currentIndex;
  if (direction === "next" && currentIndex < stageKeys.length - 1) {
    targetIndex++;
  } else if (direction === "prev" && currentIndex > 0) {
    targetIndex--;
  }
  
  if (targetIndex !== currentIndex) {
    const targetStage = stageKeys[targetIndex];
    updateJobStageStatus(job, targetStage);
    renderApp();
    showToast(`Updated stage for ${job.vehicle.make} ${job.vehicle.model}`);
  }
}

function updateJobStageStatus(job, targetStage) {
  job.stage = targetStage;
  job.history.push({ stage: targetStage, timestamp: new Date().toISOString() });
  saveState();
}

// --- Jobs & Estimates List View ---
function renderJobsList(jobsToRender = state.jobs) {
  const tbody = document.getElementById("all-jobs-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  if (jobsToRender.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No repair orders match search criteria.</td></tr>`;
    return;
  }
  
  jobsToRender.forEach(job => {
    const grandTotal = calculateTotalROCost(job);
    const balanceText = job.stage === "pickup" ? "Paid" : "Pending Balance";
    const balanceClass = job.stage === "pickup" ? "pill-green" : "pill-yellow";
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-family: var(--font-display); font-weight: 700;">${job.id}</td>
      <td>
        <div style="font-weight: 600;">${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Code: ${job.vehicle.color || 'N/A'} | Plate: ${job.vehicle.plate || 'N/A'}</div>
        ${job.targetDate ? `<div style="font-size: 0.75rem; color: var(--accent-amber); font-weight: 600; margin-top: 2px;">Target: ${new Date(job.targetDate + 'T00:00:00').toLocaleDateString()}</div>` : ''}
      </td>
      <td>
        <div style="font-weight: 500;">${job.customer.name || job.wholesaleCompany || "Unknown"}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${job.customer.phone || (job.clientType === "wholesale" ? "Wholesale" : "No Phone")}</div>
      </td>
      <td><span class="status-pill ${WORKFLOW_STAGES[job.stage].class}">${WORKFLOW_STAGES[job.stage].title}</span></td>
      <td style="font-weight: 600; font-family: var(--font-display);">$${grandTotal.toFixed(2)}</td>
      <td><span class="status-pill ${balanceClass}">${balanceText}</span></td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm" onclick="viewJobDetails('${job.id}')">Details</button>
          <button class="btn btn-sm btn-primary" onclick="openEditJobModal('${job.id}')">Edit</button>
          <button class="btn btn-sm" style="color: var(--accent-rose); border-color: rgba(244,63,94,0.2);" onclick="deleteJob('${job.id}')">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterJobsList() {
  const query = document.getElementById("job-search-input").value.toLowerCase();
  const filtered = state.jobs.filter(job => {
    return (
      job.customer.name.toLowerCase().includes(query) ||
      job.vehicle.make.toLowerCase().includes(query) ||
      job.vehicle.model.toLowerCase().includes(query) ||
      job.id.toLowerCase().includes(query) ||
      (job.vehicle.vin && job.vehicle.vin.toLowerCase().includes(query))
    );
  });
  renderJobsList(filtered);
}

// --- Inventory Manager View ---
function renderInventoryList() {
  const tbody = document.getElementById("inventory-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  state.inventory.forEach(item => {
    const isLow = item.stock <= item.minLevel;
    const statusText = item.stock === 0 ? "Out of Stock" : (isLow ? "Low Stock" : "OK");
    const statusClass = item.stock === 0 ? "pill-red" : (isLow ? "pill-yellow" : "pill-green");
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight: 600;">${item.name}</td>
      <td>${item.category}</td>
      <td style="font-weight: 600;">${item.stock}</td>
      <td style="color: var(--text-muted);">${item.minLevel}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td><span class="status-pill ${statusClass}">${statusText}</span></td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm btn-primary" onclick="adjustInventoryQty('${item.id}', 1)">+1</button>
          <button class="btn btn-sm" onclick="adjustInventoryQty('${item.id}', -1)">-1</button>
          <button class="btn btn-sm" onclick="openEditInventoryModal('${item.id}')">Edit</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function adjustInventoryQty(itemId, amount) {
  const item = state.inventory.find(i => i.id === itemId);
  if (!item) return;
  
  item.stock = Math.max(0, item.stock + amount);
  saveState();
  renderApp();
  if (item.stock <= item.minLevel) {
    showToast(`Warning: ${item.name} is running low!`, "warning");
  }
}

// ==========================================================================
// COST CALCULATIONS (NEW PANEL ESTIMATING SCHEMA)
// ==========================================================================

function calculateTotalROCost(job) {
  if (job.clientType === "wholesale" && job.flatItems && job.flatItems.length > 0) {
    return job.flatItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  }
  
  const rates = job.rates || { bodyRate: 65.0, paintRate: 65.0, materialRate: 45.0 };
  
  if (job.panels && job.panels.length > 0) {
    let bodyLaborHrs = 0;
    let paintLaborHrs = 0;
    let riLaborHrs = 0;
    let partsCostSum = 0;
    
    job.panels.forEach(p => {
      bodyLaborHrs += p.bodyHours;
      paintLaborHrs += p.refinishHours;
      riLaborHrs += p.riHours;
      if (p.replacePart) {
        partsCostSum += p.partCost;
      }
    });
    
    const bodyLaborCost = (bodyLaborHrs + riLaborHrs) * rates.bodyRate;
    const paintLaborCost = paintLaborHrs * rates.paintRate;
    const pmCost = paintLaborHrs * rates.materialRate;
    return bodyLaborCost + paintLaborCost + pmCost + partsCostSum;
  }
  
  // Fallback for flat items or old data format
  if (job.flatItems && job.flatItems.length > 0) {
    return job.flatItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  }

  const laborCost = job.laborHours * rates.bodyRate;
  const pmCost = job.paintMaterialSurcharge > 0 
    ? job.paintMaterialSurcharge 
    : (job.laborHours * 0.5 * rates.materialRate);
    
  return laborCost + job.partsCost + pmCost;
}

// Recalculates costs live inside the Wizard, returning computed details
function recalcWizardCosts() {
  const clientType = document.getElementById("client-type").value;
  
  if (clientType === "wholesale") {
    const total = tempFlatItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    return {
      bodyHours: 0,
      paintHours: 0,
      riHours: 0,
      partsCost: 0,
      bodyLaborCost: 0,
      paintLaborCost: 0,
      materialCost: 0,
      grandTotal: total
    };
  }

  const bodyRate = parseFloat(document.getElementById("rate-body").value) || 65.0;
  const paintRate = parseFloat(document.getElementById("rate-paint").value) || 65.0;
  const materialRate = parseFloat(document.getElementById("rate-material").value) || 45.0;
  
  let totalBodyHours = 0;
  let totalPaintHours = 0;
  let totalRiHours = 0;
  let totalPartsCost = 0;
  
  // Capture current values from DOM editors to sync our tempSelectedPanels state
  const panelKeys = Object.keys(tempSelectedPanels);
  panelKeys.forEach(key => {
    const p = tempSelectedPanels[key];
    const refEl = document.getElementById(`panel-refinish-${key}`);
    const bodyEl = document.getElementById(`panel-body-${key}`);
    const riEl = document.getElementById(`panel-ri-${key}`);
    const subEl = document.querySelector(`input[name="panel-substrate-${key}"]:checked`);
    const replEl = document.getElementById(`panel-replace-${key}`);
    const pNameEl = document.getElementById(`panel-part-name-${key}`);
    const pCostEl = document.getElementById(`panel-part-cost-${key}`);
    
    if (refEl) p.refinishHours = parseFloat(refEl.value) || 0;
    if (bodyEl) p.bodyHours = parseFloat(bodyEl.value) || 0;
    if (riEl) p.riHours = parseFloat(riEl.value) || 0;
    if (subEl) p.substrate = subEl.value;
    if (replEl) p.replacePart = replEl.checked;
    if (pNameEl) p.partName = pNameEl.value;
    if (pCostEl) p.partCost = parseFloat(pCostEl.value) || 0;
    
    totalBodyHours += p.bodyHours;
    totalPaintHours += p.refinishHours;
    totalRiHours += p.riHours;
    
    if (p.replacePart) {
      totalPartsCost += p.partCost;
    }
  });
  
  const bodyLaborCost = (totalBodyHours + totalRiHours) * bodyRate;
  const paintLaborCost = totalPaintHours * paintRate;
  const materialCost = totalPaintHours * materialRate;
  const grandTotal = bodyLaborCost + paintLaborCost + materialCost + totalPartsCost;
  
  return {
    bodyHours: totalBodyHours,
    paintHours: totalPaintHours,
    riHours: totalRiHours,
    partsCost: totalPartsCost,
    bodyLaborCost,
    paintLaborCost,
    materialCost,
    grandTotal
  };
}

// ==========================================================================
// CUSTOM PAINT MIX RATIO CALCULATOR (Separate mix helper tab)
// ==========================================================================

function initPaintCalculatorSelectors() {
  const container = document.getElementById("paint-panel-selectors");
  if (!container) return;
  container.innerHTML = "";
  
  Object.keys(PANEL_VOLUMES).forEach(panelKey => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "panel-btn";
    btn.onclick = () => togglePanelSelection(panelKey);
    btn.id = `panel-select-${panelKey}`;
    
    btn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
      <span class="panel-btn-label">${PANEL_LABELS[panelKey]}</span>
      <span style="font-size: 0.7rem; color: var(--text-muted);">${PANEL_VOLUMES[panelKey]} oz</span>
    `;
    container.appendChild(btn);
  });

  populateRatioSelect();
  calculatePaintNeeded();
}

function togglePanelSelection(panelKey) {
  const idx = state.paintCalc.selectedPanels.indexOf(panelKey);
  const btn = document.getElementById(`panel-select-${panelKey}`);
  
  if (idx === -1) {
    state.paintCalc.selectedPanels.push(panelKey);
    if (btn) btn.classList.add("selected");
  } else {
    state.paintCalc.selectedPanels.splice(idx, 1);
    if (btn) btn.classList.remove("selected");
  }
  
  calculatePaintNeeded();
}

function populateRatioSelect() {
  const systemSelect = document.getElementById("paint-system-type");
  const ratioSelect = document.getElementById("paint-mixing-ratio");
  if (!systemSelect || !ratioSelect) return;
  
  const systemType = systemSelect.value;
  state.paintCalc.systemType = systemType;
  
  ratioSelect.innerHTML = "";
  
  const selectedConfig = SYSTEM_RATIOS[systemType];
  selectedConfig.ratios.forEach(ratio => {
    const opt = document.createElement("option");
    opt.value = ratio.id;
    opt.innerText = ratio.label;
    ratioSelect.appendChild(opt);
  });

  state.paintCalc.ratioId = ratioSelect.value;
}

// Listen to coating system selector change
if (document.getElementById("paint-system-type")) {
  document.getElementById("paint-system-type").addEventListener("change", () => {
    populateRatioSelect();
    calculatePaintNeeded();
  });
}

function calculatePaintNeeded() {
  const systemSelect = document.getElementById("paint-system-type")?.value;
  const ratioId = document.getElementById("paint-mixing-ratio")?.value;
  if (!systemSelect || !ratioId) return;
  
  let surfaceVolumeOz = 0;
  state.paintCalc.selectedPanels.forEach(panelKey => {
    surfaceVolumeOz += PANEL_VOLUMES[panelKey];
  });
  
  if (surfaceVolumeOz === 0) {
    document.getElementById("paint-result-total").innerText = "0.0 oz";
    document.getElementById("paint-result-cost").innerText = "$0.00";
    document.getElementById("mix-bar-visual").innerHTML = "";
    document.getElementById("mix-legend-labels").innerHTML = "";
    return;
  }
  
  let breakdown = {};
  let totalVolume = 0;
  let totalCost = 0;
  
  const systemConfig = SYSTEM_RATIOS[systemSelect];
  const ratioConfig = systemConfig.ratios.find(r => r.id === ratioId);
  
  if (systemSelect === "base-clear") {
    const baseRatio = ratioConfig.base.ratio;
    const baseParts = ratioConfig.base.parts;
    const baseSum = baseRatio.reduce((a, b) => a + b, 0);
    
    baseParts.forEach((part, index) => {
      const vol = (surfaceVolumeOz * baseRatio[index]) / baseSum;
      breakdown[part] = (breakdown[part] || 0) + vol;
    });
    
    const clearRatio = ratioConfig.clear.ratio;
    const clearParts = ratioConfig.clear.parts;
    const clearSum = clearRatio.reduce((a, b) => a + b, 0);
    
    clearParts.forEach((part, index) => {
      const vol = (surfaceVolumeOz * clearRatio[index]) / clearSum;
      breakdown[part] = (breakdown[part] || 0) + vol;
    });
    
  } else if (systemSelect === "single-stage") {
    const ssRatio = ratioConfig.ss.ratio;
    const ssParts = ratioConfig.ss.parts;
    const ssSum = ssRatio.reduce((a, b) => a + b, 0);
    
    ssParts.forEach((part, index) => {
      const vol = (surfaceVolumeOz * ssRatio[index]) / ssSum;
      breakdown[part] = (breakdown[part] || 0) + vol;
    });
    
  } else if (systemSelect === "tri-coat") {
    const groundRatio = ratioConfig.ground.ratio;
    const groundParts = ratioConfig.ground.parts;
    const groundSum = groundRatio.reduce((a, b) => a + b, 0);
    
    groundParts.forEach((part, index) => {
      const vol = (surfaceVolumeOz * groundRatio[index]) / groundSum;
      breakdown[part] = (breakdown[part] || 0) + vol;
    });
    
    const midRatio = ratioConfig.mid.ratio;
    const midParts = ratioConfig.mid.parts;
    const midSum = midRatio.reduce((a, b) => a + b, 0);
    
    midParts.forEach((part, index) => {
      const vol = (surfaceVolumeOz * midRatio[index]) / midSum;
      breakdown[part] = (breakdown[part] || 0) + vol;
    });
    
    const clearRatio = ratioConfig.clear.ratio;
    const clearParts = ratioConfig.clear.parts;
    const clearSum = clearRatio.reduce((a, b) => a + b, 0);
    
    clearParts.forEach((part, index) => {
      const vol = (surfaceVolumeOz * clearRatio[index]) / clearSum;
      breakdown[part] = (breakdown[part] || 0) + vol;
    });
    
  } else if (systemSelect === "primer-surfacer") {
    const primerRatio = ratioConfig.primer.ratio;
    const primerParts = ratioConfig.primer.parts;
    const primerSum = primerRatio.reduce((a, b) => a + b, 0);
    
    primerParts.forEach((part, index) => {
      const vol = (surfaceVolumeOz * primerRatio[index]) / primerSum;
      breakdown[part] = (breakdown[part] || 0) + vol;
    });
  }
  
  Object.keys(breakdown).forEach(part => {
    totalVolume += breakdown[part];
    totalCost += breakdown[part] * MATERIAL_PRICES[part];
  });
  
  state.paintCalc.calculatedVolume = totalVolume;
  state.paintCalc.calculatedCost = totalCost;
  state.paintCalc.breakdown = breakdown;
  
  document.getElementById("paint-result-total").innerText = `${totalVolume.toFixed(1)} oz`;
  document.getElementById("paint-result-cost").innerText = `$${totalCost.toFixed(2)}`;
  
  const mixBar = document.getElementById("mix-bar-visual");
  const mixLegend = document.getElementById("mix-legend-labels");
  if (!mixBar || !mixLegend) return;
  mixBar.innerHTML = "";
  mixLegend.innerHTML = "";
  
  const colorsMap = {
    paint: "var(--accent-indigo)",
    clearcoat: "var(--accent-cyan)",
    hardener: "var(--accent-rose)",
    reducer: "var(--accent-amber)",
    primer: "var(--text-muted)"
  };
  
  const labelsMap = {
    paint: "Paint Pigment",
    clearcoat: "Urethane Clearcoat",
    hardener: "Activator/Hardener",
    reducer: "Reducer/Thinner",
    primer: "High-Build Primer"
  };
  
  Object.keys(breakdown).forEach(part => {
    const vol = breakdown[part];
    const pct = (vol / totalVolume) * 100;
    
    const segment = document.createElement("div");
    segment.className = "mix-segment";
    segment.style.width = `${pct}%`;
    segment.style.backgroundColor = colorsMap[part];
    segment.title = `${labelsMap[part]}: ${vol.toFixed(1)} oz (${pct.toFixed(0)}%)`;
    mixBar.appendChild(segment);
    
    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";
    legendItem.innerHTML = `
      <span class="legend-color" style="background-color: ${colorsMap[part]};"></span>
      <span>${labelsMap[part]}: <strong>${vol.toFixed(1)} oz</strong></span>
    `;
    mixLegend.appendChild(legendItem);
  });
}

function populatePaintJobSelect() {
  const select = document.getElementById("paint-assign-job-select");
  if (!select) return;
  
  select.innerHTML = `<option value="">-- Assign Cost to Active Job --</option>`;
  
  state.jobs.filter(j => j.stage !== "pickup").forEach(job => {
    const opt = document.createElement("option");
    opt.value = job.id;
    opt.innerText = `${job.id} - ${job.vehicle.make} ${job.vehicle.model} (${job.customer.name})`;
    select.appendChild(opt);
  });
}

function assignPaintCostToJob() {
  const jobId = document.getElementById("paint-assign-job-select").value;
  if (!jobId) {
    showToast("Please select a job to assign this cost to.", "warning");
    return;
  }
  
  if (state.paintCalc.calculatedCost === 0) {
    showToast("Calculator is empty. Select panels to estimate first.", "warning");
    return;
  }
  
  const job = state.jobs.find(j => j.id === jobId);
  if (job) {
    job.paintMaterialSurcharge = parseFloat(state.paintCalc.calculatedCost);
    saveState();
    renderApp();
    showToast(`Assigned $${state.paintCalc.calculatedCost.toFixed(2)} materials charge to ${job.id}`);
  }
}

// ==========================================================================
// MODALS MANAGEMENT & 5-STEP WIZARD LOGIC
// ==========================================================================

function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

// Reset checklist & open check-in
function openNewJobModal() {
  document.getElementById("job-form").reset();
  document.getElementById("job-form-id").value = "";
  document.getElementById("job-target-date").value = "";
  document.getElementById("job-modal-title").innerText = "Check-in New Vehicle";
  document.getElementById("job-stage").value = "intake";
  
  // Set default shop rates
  document.getElementById("rate-body").value = "65.00";
  document.getElementById("rate-paint").value = "65.00";
  document.getElementById("rate-material").value = "45.00";
  
  tempSelectedPanels = {};
  tempPhotos = [];
  tempFlatItems = [];
  
  renderTempPhotos();
  
  goToStep(1);
  toggleInsuranceFields();
  updatePaintCodeHelper();
  updateWholesaleCompaniesDatalist();
  openModal("job-modal");
}

// Load specifications & edit Check-in Wizard
function openEditJobModal(jobId) {
  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return;
  
  document.getElementById("job-form-id").value = job.id;
  document.getElementById("job-modal-title").innerText = `Edit Repair Order ${job.id}`;
  
  document.getElementById("client-type").value = job.clientType || "retail";
  document.getElementById("wholesale-company").value = job.wholesaleCompany || "";
  toggleClientFields();
  
  document.getElementById("cust-name").value = job.customer.name || "";
  document.getElementById("cust-phone").value = job.customer.phone || "";
  document.getElementById("cust-email").value = job.customer.email || "";
  document.getElementById("job-priority").value = job.priority;
  
  document.getElementById("veh-year").value = job.vehicle.year;
  document.getElementById("veh-make").value = job.vehicle.make;
  document.getElementById("veh-model").value = job.vehicle.model;
  document.getElementById("veh-color").value = job.vehicle.color || "";
  document.getElementById("veh-vin").value = job.vehicle.vin || "";
  document.getElementById("veh-plate").value = job.vehicle.plate || "";
  
  const rates = job.rates || { bodyRate: 65.0, paintRate: 65.0, materialRate: 45.0 };
  document.getElementById("rate-body").value = rates.bodyRate;
  document.getElementById("rate-paint").value = rates.paintRate;
  document.getElementById("rate-material").value = rates.materialRate;
  
  document.getElementById("billing-type").value = job.billingType;
  document.getElementById("ins-company").value = job.insurance?.company || "";
  document.getElementById("ins-deductible").value = job.insurance?.deductible || 0;
  
  document.getElementById("job-stage").value = job.stage;
  document.getElementById("job-target-date").value = job.targetDate || "";
  document.getElementById("job-notes").value = job.notes || "";
  
  // Load panels list
  tempSelectedPanels = {};
  if (job.panels) {
    job.panels.forEach(p => {
      tempSelectedPanels[p.key] = { ...p };
    });
  }

  // Load photos & flat rate items
  tempPhotos = job.photos ? [...job.photos] : [];
  tempFlatItems = job.flatItems ? [...job.flatItems] : [];
  
  renderTempPhotos();
  
  goToStep(1);
  toggleInsuranceFields();
  updatePaintCodeHelper();
  updateWholesaleCompaniesDatalist();
  openModal("job-modal");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// Wizard Stepper controls
function goToStep(stepNum) {
  const clientType = document.getElementById("client-type").value;
  
  if (stepNum > currentWizardStep) {
    if (currentWizardStep === 1) {
      const name = document.getElementById("cust-name").value.trim();
      const phone = document.getElementById("cust-phone").value.trim();
      const cType = document.getElementById("client-type").value;
      const comp = document.getElementById("wholesale-company").value.trim();
      
      if (cType === "retail") {
        if (!name || !phone) {
          showToast("Please enter Customer Name and Phone Number.", "warning");
          return;
        }
      } else {
        if (!comp) {
          showToast("Please enter Wholesale Company Name.", "warning");
          return;
        }
      }
    } else if (currentWizardStep === 2) {
      const year = document.getElementById("veh-year").value;
      const make = document.getElementById("veh-make").value.trim();
      const model = document.getElementById("veh-model").value.trim();
      
      if (!year || !make || !model) {
        showToast("Please enter Vehicle Year, Make, and Model.", "warning");
        return;
      }
    } else if (currentWizardStep === 3) {
      if (clientType === "retail") {
        if (Object.keys(tempSelectedPanels).length === 0) {
          showToast("Notice: No panels are selected. Proceeding with standard values.", "info");
        }
      } else {
        if (tempFlatItems.length === 0) {
          showToast("Notice: No wholesale flat repairs added. Proceeding with standard values.", "info");
        }
      }
    }
  }
  
  currentWizardStep = stepNum;
  
  document.querySelectorAll(".wizard-step").forEach(step => {
    step.classList.remove("active");
  });
  const activeStepEl = document.getElementById(`wizard-step-${stepNum}`);
  if (activeStepEl) activeStepEl.classList.add("active");
  
  document.querySelectorAll(".step-node").forEach((node, idx) => {
    const nodeStep = idx + 1;
    node.className = "step-node";
    if (nodeStep === stepNum) {
      node.classList.add("active");
    } else if (nodeStep < stepNum) {
      node.classList.add("completed");
    }
  });
  
  document.querySelectorAll(".step-line").forEach((line, idx) => {
    const lineStep = idx + 1;
    line.className = "step-line";
    if (lineStep < stepNum) {
      line.classList.add("completed");
    }
  });
  
  if (stepNum === 3) {
    if (clientType === "retail") {
      document.getElementById("wizard-retail-repairs-container").style.display = "block";
      document.getElementById("wizard-wholesale-repairs-container").style.display = "none";
      renderWizardPanelsGrid();
      renderWizardPanelsEditor();
    } else {
      document.getElementById("wizard-retail-repairs-container").style.display = "none";
      document.getElementById("wizard-wholesale-repairs-container").style.display = "block";
      renderWizardFlatItemsEditor();
    }
  } else if (stepNum === 5) {
    renderWizardReviewBreakdown();
  }
  
  const prevBtn = document.getElementById("wizard-prev-btn");
  const nextBtn = document.getElementById("wizard-next-btn");
  
  if (stepNum === 1) {
    prevBtn.innerText = "Cancel";
  } else {
    prevBtn.innerText = "Back";
  }
  
  if (stepNum === 5) {
    nextBtn.innerText = "Save Repair Order";
    nextBtn.className = "btn btn-primary btn-save-pulse";
  } else {
    nextBtn.innerText = "Next";
    nextBtn.className = "btn btn-primary";
  }
}

function nextWizardStep() {
  if (currentWizardStep === 5) {
    saveJob();
  } else {
    goToStep(currentWizardStep + 1);
  }
}

function prevWizardStep() {
  if (currentWizardStep === 1) {
    closeModal("job-modal");
  } else {
    goToStep(currentWizardStep - 1);
  }
}

// Step 3 Selector logic
function renderWizardPanelsGrid() {
  const container = document.getElementById("wizard-panels-grid");
  if (!container) return;
  container.innerHTML = "";
  
  COLLISION_PANELS.forEach(panel => {
    const isSelected = !!tempSelectedPanels[panel.key];
    
    const card = document.createElement("div");
    card.className = `panel-card-select ${isSelected ? 'selected' : ''}`;
    card.onclick = () => toggleWizardPanel(panel.key);
    card.innerHTML = `
      <div class="panel-card-checkbox">
        ${isSelected ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
      </div>
      <div class="panel-card-label">${panel.label}</div>
    `;
    container.appendChild(card);
  });
}

function toggleWizardPanel(key) {
  if (tempSelectedPanels[key]) {
    delete tempSelectedPanels[key];
  } else {
    const panelConfig = COLLISION_PANELS.find(cp => cp.key === key);
    tempSelectedPanels[key] = {
      key: key,
      label: panelConfig.label,
      refinishHours: panelConfig.defaultRefinish,
      bodyHours: 0.0,
      riHours: panelConfig.defaultRi,
      substrate: "steel",
      replacePart: false,
      partName: "",
      partCost: 0.0,
      riSelected: true
    };
  }
  
  renderWizardPanelsGrid();
  renderWizardPanelsEditor();
  recalcWizardCosts();
}

function renderWizardPanelsEditor() {
  const container = document.getElementById("wizard-selected-panels-editor");
  const msg = document.getElementById("no-panels-selected-msg");
  if (!container) return;
  
  const editorHeaderHtml = `
    <div style="font-weight:600; font-size:0.9rem; border-bottom: 1px solid var(--border-color); padding-bottom:0.5rem; margin-bottom:1rem; color:var(--text-secondary); display:flex; justify-content:space-between; align-items:center;">
      <span>Active Panel Specifications</span>
      <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">Customize labor and parts below</span>
    </div>
  `;
  
  const selectedKeys = Object.keys(tempSelectedPanels);
  if (selectedKeys.length === 0) {
    if (msg) msg.style.display = "block";
    const editors = container.querySelectorAll(".panel-editor-row");
    editors.forEach(el => el.remove());
    return;
  }
  
  if (msg) msg.style.display = "none";
  
  let html = editorHeaderHtml;
  
  selectedKeys.forEach(key => {
    const p = tempSelectedPanels[key];
    
    html += `
      <div class="panel-editor-row" id="panel-editor-${key}">
        <div class="panel-editor-header">
          <strong>${p.label}</strong>
          <button type="button" class="panel-editor-remove-btn" onclick="toggleWizardPanel('${key}')">&times; Remove</button>
        </div>
        
        <div class="panel-editor-grid">
          <div class="form-group">
            <label>Paint/Refinish (hrs)</label>
            <input type="number" id="panel-refinish-${key}" min="0" step="0.1" value="${p.refinishHours}" oninput="updatePanelValue('${key}', 'refinishHours', this.value)">
          </div>
          <div class="form-group">
            <label>Body Repair Labor (hrs)</label>
            <input type="number" id="panel-body-${key}" min="0" step="0.1" value="${p.bodyHours}" oninput="updatePanelValue('${key}', 'bodyHours', this.value)" placeholder="Manual hours">
          </div>
          <div class="form-group">
            <label>R&I Labor (hrs)</label>
            <input type="number" id="panel-ri-${key}" min="0" step="0.1" value="${p.riHours}" oninput="updatePanelValue('${key}', 'riHours', this.value)" ${p.riSelected === false ? 'disabled style="opacity:0.5;"' : ''}>
          </div>
          
          <div class="form-group">
            <label>Substrate Material</label>
            <div class="substrate-btn-group">
              <label class="sub-btn ${p.substrate === 'steel' ? 'active' : ''}">
                <input type="radio" name="panel-substrate-${key}" value="steel" ${p.substrate === 'steel' ? 'checked' : ''} onchange="updatePanelValue('${key}', 'substrate', 'steel')"> Steel
              </label>
              <label class="sub-btn ${p.substrate === 'aluminum' ? 'active' : ''}">
                <input type="radio" name="panel-substrate-${key}" value="aluminum" ${p.substrate === 'aluminum' ? 'checked' : ''} onchange="updatePanelValue('${key}', 'substrate', 'aluminum')"> Alum
              </label>
              <label class="sub-btn ${p.substrate === 'plastic' ? 'active' : ''}">
                <input type="radio" name="panel-substrate-${key}" value="plastic" ${p.substrate === 'plastic' ? 'checked' : ''} onchange="updatePanelValue('${key}', 'substrate', 'plastic')"> Plastic
              </label>
            </div>
          </div>
          
          <div class="form-group full-width" style="display:flex; flex-direction:row; align-items:center; gap:1.25rem; margin-top:0.5rem; flex-wrap: wrap;">
            <label style="display:flex; align-items:center; gap:0.5rem; font-weight:normal; cursor:pointer;">
              <input type="checkbox" id="panel-ri-select-${key}" ${p.riSelected !== false ? 'checked' : ''} onchange="togglePanelRi('${key}', this.checked)"> Perform R&I
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-weight:normal; cursor:pointer;">
              <input type="checkbox" id="panel-replace-${key}" ${p.replacePart ? 'checked' : ''} onchange="togglePanelPartReplacement('${key}', this.checked)"> Replace Part
            </label>
            
            <div id="panel-part-fields-${key}" class="part-fields" style="display: ${p.replacePart ? 'flex' : 'none'}; gap: 0.5rem; flex-grow:1; align-items: center;">
              <input type="text" id="panel-part-name-${key}" placeholder="Part Description (e.g. Bumper cover)" value="${p.partName || ''}" oninput="updatePanelValue('${key}', 'partName', this.value)" style="flex-grow:2; min-height:36px; padding:0.4rem;">
              <input type="number" id="panel-part-cost-${key}" placeholder="Cost ($)" min="0" value="${p.partCost || ''}" oninput="updatePanelValue('${key}', 'partCost', this.value)" style="width:90px; min-height:36px; padding:0.4rem;">
              <button type="button" class="btn btn-sm btn-icon" onclick="openPartsLookupModal('${key}')" title="Look Up Price" style="background: rgba(99, 102, 241, 0.15); border: 1px solid var(--accent-indigo); color: var(--accent-indigo); height: 36px; padding: 0 0.75rem; border-radius:6px; font-size:0.8rem; cursor:pointer;">
                🔍 Look Up Price
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function updatePanelValue(key, field, val) {
  if (!tempSelectedPanels[key]) return;
  
  if (field === 'refinishHours' || field === 'bodyHours' || field === 'riHours') {
    tempSelectedPanels[key][field] = parseFloat(val) || 0;
  } else if (field === 'partCost') {
    tempSelectedPanels[key][field] = parseFloat(val) || 0;
  } else if (field === 'substrate') {
    tempSelectedPanels[key][field] = val;
    const editor = document.getElementById(`panel-editor-${key}`);
    if (editor) {
      editor.querySelectorAll(".sub-btn").forEach(btn => {
        const input = btn.querySelector("input");
        if (input && input.value === val) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }
  } else {
    tempSelectedPanels[key][field] = val;
  }
}

function togglePanelRi(key, checked) {
  if (!tempSelectedPanels[key]) return;
  tempSelectedPanels[key].riSelected = checked;
  
  const panelConfig = COLLISION_PANELS.find(cp => cp.key === key);
  if (panelConfig) {
    tempSelectedPanels[key].riHours = checked ? panelConfig.defaultRi : 0.0;
    const riInput = document.getElementById(`panel-ri-${key}`);
    if (riInput) {
      riInput.value = tempSelectedPanels[key].riHours.toFixed(1);
      if (checked) {
        riInput.removeAttribute("disabled");
        riInput.style.opacity = "1";
      } else {
        riInput.setAttribute("disabled", "true");
        riInput.style.opacity = "0.5";
      }
    }
  }
  recalcWizardCosts();
}

function togglePanelPartReplacement(key, checked) {
  if (!tempSelectedPanels[key]) return;
  tempSelectedPanels[key].replacePart = checked;
  
  const panelConfig = COLLISION_PANELS.find(cp => cp.key === key);
  if (panelConfig) {
    if (checked) {
      tempSelectedPanels[key].bodyHours = panelConfig.defaultReplaceLabor || 0.0;
    } else {
      tempSelectedPanels[key].bodyHours = 0.0;
    }
    const bodyHoursInput = document.getElementById(`panel-body-${key}`);
    if (bodyHoursInput) {
      bodyHoursInput.value = tempSelectedPanels[key].bodyHours.toFixed(1);
    }
  }
  
  const fields = document.getElementById(`panel-part-fields-${key}`);
  if (fields) {
    fields.style.display = checked ? "flex" : "none";
  }
  
  recalcWizardCosts();
}

// Step 5 Review screen builder
function renderWizardReviewBreakdown() {
  const container = document.getElementById("wizard-review-breakdown");
  if (!container) return;
  
  const clientType = document.getElementById("client-type").value;
  const costs = recalcWizardCosts();
  
  if (clientType === "wholesale") {
    let itemsHtml = "";
    if (tempFlatItems.length === 0) {
      itemsHtml = `
        <div style="text-align: center; color: var(--text-muted); padding: 1rem; border: 1px dashed var(--border-color); border-radius: 8px;">
          No flat rate items added yet.
        </div>
      `;
    } else {
      tempFlatItems.forEach((item, index) => {
        itemsHtml += `
          <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.5rem; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
            <div>
              <strong style="color: #fff;">${item.description}</strong>
            </div>
            <div style="font-weight: 600; font-family: var(--font-display); color: var(--accent-emerald);">
              $${item.cost.toFixed(2)}
            </div>
          </div>
        `;
      });
    }
    
    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <div style="font-weight: 600; font-family: var(--font-display); font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--accent-indigo);">Itemized Flat-Rate Repair Services</div>
        ${itemsHtml}
      </div>
      
      <div class="cost-summary-box" style="margin-top: 0;">
        <div class="cost-row total">
          <span>Total Flat Rate Invoiced:</span>
          <span>$${costs.grandTotal.toFixed(2)}</span>
        </div>
      </div>
    `;
    return;
  }

  // Otherwise, it's retail (pro-level hourly details)
  const bodyRate = parseFloat(document.getElementById("rate-body").value) || 65;
  const paintRate = parseFloat(document.getElementById("rate-paint").value) || 65;
  const materialRate = parseFloat(document.getElementById("rate-material").value) || 45;
  
  let panelsHtml = "";
  const selectedKeys = Object.keys(tempSelectedPanels);
  if (selectedKeys.length === 0) {
    panelsHtml = `
      <div style="text-align: center; color: var(--text-muted); padding: 1rem; border: 1px dashed var(--border-color); border-radius: 8px;">
        No repair panels selected. Old/custom totals will apply.
      </div>
    `;
  } else {
    selectedKeys.forEach(key => {
      const p = tempSelectedPanels[key];
      const partDesc = p.replacePart ? ` | Part: ${p.partName || "Replacement Part"} ($${p.partCost.toFixed(2)})` : "";
      const riLabelStr = p.riSelected !== false ? ` | R&I: ${p.riHours.toFixed(1)}h` : " | R&I: None";
      panelsHtml += `
        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.5rem; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
          <div>
            <strong style="color: #fff;">${p.label}</strong>
            <span style="color:var(--text-secondary); margin-left: 0.5rem; text-transform:capitalize;">(${p.substrate})</span>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">
              Paint: ${p.refinishHours.toFixed(1)}h | Body: ${p.bodyHours.toFixed(1)}h${riLabelStr}${partDesc}
            </div>
          </div>
          <div style="font-weight: 600; font-family: var(--font-display); color: var(--text-primary);">
            $${((p.refinishHours * paintRate) + ((p.bodyHours + p.riHours) * bodyRate) + (p.refinishHours * materialRate) + (p.replacePart ? p.partCost : 0)).toFixed(2)}
          </div>
        </div>
      `;
    });
  }
  
  const billingType = document.getElementById("billing-type").value;
  const deductible = parseFloat(document.getElementById("ins-deductible").value) || 0;
  
  let insHtml = "";
  if (billingType === "insurance") {
    insHtml = `
      <div style="display:flex; justify-content:space-between; color: var(--accent-cyan); font-weight:600; padding-top: 0.25rem; font-size:0.85rem;">
        <span>Insurance Portion:</span>
        <span>$${Math.max(0, costs.grandTotal - deductible).toFixed(2)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; color: var(--accent-amber); font-weight:600; font-size:0.85rem;">
        <span>Customer Deductible Due:</span>
        <span>$${deductible.toFixed(2)}</span>
      </div>
    `;
  }
  
  container.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <div style="font-weight: 600; font-family: var(--font-display); font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--accent-indigo);">Itemized Panel Details</div>
      ${panelsHtml}
    </div>
    
    <div class="cost-summary-box" style="margin-top: 0;">
      <div style="font-weight: 600; font-family: var(--font-display); font-size: 0.95rem; margin-bottom: 0.25rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Estimate Cost Summary</div>
      <div class="cost-row">
        <span>Body & R&I Labor (${(costs.bodyHours + costs.riHours).toFixed(1)} hrs @ $${bodyRate.toFixed(2)}/hr):</span>
        <span>$${costs.bodyLaborCost.toFixed(2)}</span>
      </div>
      <div class="cost-row">
        <span>Paint Labor (${costs.paintHours.toFixed(1)} hrs @ $${paintRate.toFixed(2)}/hr):</span>
        <span>$${costs.paintLaborCost.toFixed(2)}</span>
      </div>
      <div class="cost-row">
        <span>Paint & Materials (${costs.paintHours.toFixed(1)} hrs @ $${materialRate.toFixed(2)}/hr):</span>
        <span>$${costs.materialCost.toFixed(2)}</span>
      </div>
      <div class="cost-row">
        <span>Replacement Parts:</span>
        <span>$${costs.partsCost.toFixed(2)}</span>
      </div>
      <div class="cost-row total">
        <span>Estimated Grand Total:</span>
        <span>$${costs.grandTotal.toFixed(2)}</span>
      </div>
      ${insHtml}
    </div>
  `;
}

function toggleInsuranceFields() {
  const type = document.getElementById("billing-type").value;
  const insFields = document.querySelectorAll(".insurance-field");
  
  insFields.forEach(field => {
    if (type === "insurance") {
      field.style.display = "flex";
    } else {
      field.style.display = "none";
    }
  });
}

function saveJob() {
  const form = document.getElementById("job-form");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const formId = document.getElementById("job-form-id").value;
  const isEdit = formId !== "";
  
  let job;
  
  if (isEdit) {
    job = state.jobs.find(j => j.id === formId);
  } else {
    const nextRoNumber = state.jobs.length > 0 
      ? Math.max(...state.jobs.map(j => parseInt(j.id.replace("RO-", "")))) + 1 
      : 1001;
    job = {
      id: `RO-${nextRoNumber}`,
      createdAt: new Date().toISOString(),
      history: [{ stage: "intake", timestamp: new Date().toISOString() }]
    };
  }
  
  job.customer = {
    name: document.getElementById("cust-name").value,
    phone: document.getElementById("cust-phone").value,
    email: document.getElementById("cust-email").value
  };
  
  job.vehicle = {
    year: parseInt(document.getElementById("veh-year").value),
    make: document.getElementById("veh-make").value,
    model: document.getElementById("veh-model").value,
    color: document.getElementById("veh-color").value,
    vin: document.getElementById("veh-vin").value,
    plate: document.getElementById("veh-plate").value
  };
  
  job.priority = document.getElementById("job-priority").value;
  job.billingType = document.getElementById("billing-type").value;
  job.stage = document.getElementById("job-stage").value;
  job.targetDate = document.getElementById("job-target-date").value || "";
  
  job.clientType = document.getElementById("client-type").value;
  job.wholesaleCompany = job.clientType === "wholesale" ? document.getElementById("wholesale-company").value : "";
  
  // Save specific labor rates used for this RO
  job.rates = {
    bodyRate: parseFloat(document.getElementById("rate-body").value) || 65.0,
    paintRate: parseFloat(document.getElementById("rate-paint").value) || 65.0,
    materialRate: parseFloat(document.getElementById("rate-material").value) || 45.0
  };
  
  // Save photos
  job.photos = [...tempPhotos];
  
  if (job.clientType === "wholesale") {
    // Save flat rate items and clear panels
    job.flatItems = [...tempFlatItems];
    job.panels = [];
    job.laborHours = 0;
    job.partsCost = 0;
    job.paintMaterialSurcharge = 0;
  } else {
    // Save panels list and clear flat items
    job.panels = Object.values(tempSelectedPanels);
    job.flatItems = [];
    
    // Sum totals from panels list editor
    const costs = recalcWizardCosts();
    job.laborHours = costs.bodyHours + costs.riHours + costs.paintHours;
    job.partsCost = costs.partsCost;
    job.paintMaterialSurcharge = costs.materialCost;
  }
  
  if (job.billingType === "insurance") {
    job.insurance = {
      company: document.getElementById("ins-company").value,
      deductible: parseFloat(document.getElementById("ins-deductible").value) || 0
    };
  } else {
    job.insurance = { company: "", deductible: 0 };
  }
  
  job.notes = document.getElementById("job-notes").value;
  
  if (!isEdit) {
    state.jobs.push(job);
  }
  
  // Auto-save client to client directory
  if (!state.clients) state.clients = [];
  if (job.clientType === "wholesale" && job.wholesaleCompany) {
    const matchedClient = state.clients.find(c => c.name.toLowerCase() === job.wholesaleCompany.toLowerCase());
    if (!matchedClient) {
      const newClient = {
        id: "cli-" + Date.now(),
        name: job.wholesaleCompany,
        type: "wholesale",
        contactName: job.customer.name || "",
        phone: job.customer.phone || "",
        email: job.customer.email || ""
      };
      state.clients.push(newClient);
    }
  } else if (job.clientType === "retail" && job.customer.name) {
    const matchedClient = state.clients.find(c => c.name.toLowerCase() === job.customer.name.toLowerCase());
    if (!matchedClient) {
      const newClient = {
        id: "cli-" + Date.now(),
        name: job.customer.name,
        type: "retail",
        phone: job.customer.phone || "",
        email: job.customer.email || ""
      };
      state.clients.push(newClient);
    }
  }
  
  saveState();
  closeModal("job-modal");
  renderApp();
  showToast(isEdit ? `Repair order ${job.id} updated` : `Checked in ${job.vehicle.year} ${job.vehicle.make} successfully`);
}

function deleteJob(jobId) {
  if (confirm(`Are you sure you want to delete Repair Order ${jobId}?`)) {
    state.jobs = state.jobs.filter(j => j.id !== jobId);
    saveState();
    renderApp();
    showToast(`Deleted repair order ${jobId}`, "warning");
  }
}

// --- Job Detail / Invoicing Viewer (Invoice details print preview) ---
function viewJobDetails(jobId) {
  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return;
  
  const body = document.getElementById("detail-modal-body");
  const rates = job.rates || { bodyRate: 65.0, paintRate: 65.0, materialRate: 45.0 };
  
  let bodyLaborHrs = 0;
  let paintLaborHrs = 0;
  let riLaborHrs = 0;
  let partsCostSum = 0;
  
  if (job.panels && job.panels.length > 0) {
    job.panels.forEach(p => {
      bodyLaborHrs += p.bodyHours;
      paintLaborHrs += p.refinishHours;
      riLaborHrs += p.riHours;
      if (p.replacePart) {
        partsCostSum += p.partCost;
      }
    });
  } else {
    paintLaborHrs = job.paintMaterialSurcharge / (rates.materialRate || 45.0);
    bodyLaborHrs = Math.max(0, job.laborHours - paintLaborHrs);
    partsCostSum = job.partsCost;
  }
  
  const bodyLaborCost = (bodyLaborHrs + riLaborHrs) * rates.bodyRate;
  const paintLaborCost = paintLaborHrs * rates.paintRate;
  const pmCost = paintLaborHrs * rates.materialRate;
  const grandTotal = calculateTotalROCost(job);
  
  let timelineHtml = "";
  job.history.forEach(hist => {
    const date = new Date(hist.timestamp).toLocaleDateString();
    const time = new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timelineHtml += `
      <div style="display: flex; gap: 1rem; font-size: 0.85rem; padding: 0.25rem 0; border-left: 2px solid var(--accent-indigo); padding-left: 1rem; margin-left: 0.5rem; position: relative;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent-indigo); position: absolute; left: -5px; top: 8px;"></span>
        <span style="font-weight: 600; color: #fff; width: 120px;">${WORKFLOW_STAGES[hist.stage]?.title || hist.stage}</span>
        <span style="color: var(--text-secondary);">${date} - ${time}</span>
      </div>
    `;
  });

  // Render itemized panels sheet
  let panelsDetailsHtml = "";
  if (job.clientType === "wholesale") {
    let flatRows = "";
    (job.flatItems || []).forEach(item => {
      flatRows += `
        <tr>
          <td style="font-weight:600;" colspan="3">${item.description}</td>
          <td style="text-align:right; font-weight:600; padding-right:1.5rem;" colspan="2">$${(item.cost || 0).toFixed(2)}</td>
        </tr>
      `;
    });
    panelsDetailsHtml = `
      <h4 style="font-family: var(--font-display); border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-top: 1.5rem; margin-bottom: 1rem; color: var(--accent-indigo);">Flat-Rate Repair Items</h4>
      <table class="custom-table" style="font-size: 0.8rem; margin-bottom: 1.5rem;">
        <thead>
          <tr>
            <th colspan="3">Repair Description</th>
            <th style="text-align:right; padding-right: 1.5rem;" colspan="2">Cost</th>
          </tr>
        </thead>
        <tbody>
          ${flatRows || '<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">No flat rate items.</td></tr>'}
        </tbody>
      </table>
    `;
  } else if (job.panels && job.panels.length > 0) {
    let panelRows = "";
    job.panels.forEach(p => {
      const partStr = p.replacePart ? `<div>Replace: ${p.partName || "Part"} ($${p.partCost.toFixed(2)})</div>` : "None";
      panelRows += `
        <tr>
          <td style="font-weight:600;">${p.label}</td>
          <td style="text-transform: capitalize;">${p.substrate}</td>
          <td>Paint: ${p.refinishHours.toFixed(1)}h | Body: ${p.bodyHours.toFixed(1)}h | R&I: ${p.riHours.toFixed(1)}h</td>
          <td>${partStr}</td>
          <td style="text-align:right; font-weight:600;">
            $${((p.refinishHours * rates.paintRate) + ((p.bodyHours + p.riHours) * rates.bodyRate) + (p.refinishHours * rates.materialRate) + (p.replacePart ? p.partCost : 0)).toFixed(2)}
          </td>
        </tr>
      `;
    });
    panelsDetailsHtml = `
      <h4 style="font-family: var(--font-display); border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-top: 1.5rem; margin-bottom: 1rem; color: var(--accent-indigo);">Itemized Panel Repairs</h4>
      <table class="custom-table" style="font-size: 0.8rem; margin-bottom: 1.5rem;">
        <thead>
          <tr>
            <th>Panel Name</th>
            <th>Substrate</th>
            <th>Labor Hours</th>
            <th>Parts Details</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${panelRows}
        </tbody>
      </table>
    `;
  }

  // Gallery view
  let galleryHtml = "";
  if (job.photos && job.photos.length > 0) {
    galleryHtml = `
      <h4 style="font-family: var(--font-display); border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-top: 1.5rem; margin-bottom: 1rem; color: var(--accent-indigo);">Vehicle Photos</h4>
      <div class="vehicle-details-gallery" style="margin-bottom: 1.5rem;">
        ${job.photos.map(p => `
          <div class="gallery-thumb-item" onclick="openPhotoLightbox('${p}')">
            <img src="${p}" alt="Vehicle photo">
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Financial invoicing block
  let financialHtml = "";
  if (job.clientType === "wholesale") {
    let itemsSummaryHtml = "";
    (job.flatItems || []).forEach(item => {
      itemsSummaryHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.25rem 0;">
          <span style="color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 0.5rem;">${item.description}:</span>
          <span style="color: #fff; font-weight: 600; white-space: nowrap;">$${(item.cost || 0).toFixed(2)}</span>
        </div>
      `;
    });
    financialHtml = `
      <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; height: fit-content; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <h4 style="font-family: var(--font-display); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem; color: var(--accent-indigo); font-size: 1.1rem; font-weight: 700; letter-spacing: 0.5px;">Financial Invoice</h4>
        
        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 1rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-secondary); white-space: nowrap;">Billing Method:</span>
            <strong style="color: #fff; text-transform: uppercase; white-space: nowrap;">Wholesale Account</strong>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem;">
          ${itemsSummaryHtml || '<div style="color: var(--text-muted); font-style: italic;">No flat items logged</div>'}
          <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: #fff;">
            <span style="white-space: nowrap; padding-right: 0.5rem;">Grand Total:</span>
            <span style="color: var(--accent-emerald); font-size: 1.25rem; white-space: nowrap;">$${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  } else {
    financialHtml = `
      <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; height: fit-content; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <h4 style="font-family: var(--font-display); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem; color: var(--accent-indigo); font-size: 1.1rem; font-weight: 700; letter-spacing: 0.5px;">Financial Invoice</h4>
        
        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 1rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-secondary); white-space: nowrap;">Billing Method:</span>
            <strong style="color: #fff; text-transform: uppercase; white-space: nowrap;">${job.billingType}</strong>
          </div>
          ${job.billingType === "insurance" ? `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.1rem 0;">
            <span style="color: var(--text-secondary); white-space: nowrap;">Insurance Company:</span>
            <span style="color: #fff; font-weight: 500; white-space: nowrap;">${job.insurance.company || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.1rem 0;">
            <span style="color: var(--text-secondary); white-space: nowrap;">Customer Deductible:</span>
            <span style="color: #fff; font-weight: 600; white-space: nowrap;">$${job.insurance.deductible.toFixed(2)}</span>
          </div>
          ` : ''}
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-secondary); white-space: nowrap; padding-right: 0.5rem;">Body & R&I Labor (${(bodyLaborHrs + riLaborHrs).toFixed(1)}h @ $${rates.bodyRate}):</span>
            <span style="color: #fff; font-weight: 500; white-space: nowrap;">$${bodyLaborCost.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-secondary); white-space: nowrap; padding-right: 0.5rem;">Paint Labor (${paintLaborHrs.toFixed(1)}h @ $${rates.paintRate}):</span>
            <span style="color: #fff; font-weight: 500; white-space: nowrap;">$${paintLaborCost.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-secondary); white-space: nowrap; padding-right: 0.5rem;">Paint Materials (${paintLaborHrs.toFixed(1)}h @ $${rates.materialRate}):</span>
            <span style="color: #fff; font-weight: 500; white-space: nowrap;">$${pmCost.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-secondary); white-space: nowrap; padding-right: 0.5rem;">Replacement Parts:</span>
            <span style="color: #fff; font-weight: 500; white-space: nowrap;">$${partsCostSum.toFixed(2)}</span>
          </div>
          
          <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: #fff;">
            <span style="white-space: nowrap; padding-right: 0.5rem;">Grand Total:</span>
            <span style="color: var(--accent-emerald); font-size: 1.25rem; white-space: nowrap;">$${grandTotal.toFixed(2)}</span>
          </div>
          
          ${job.billingType === "insurance" ? `
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--accent-cyan); margin-top: 0.25rem;">
            <span style="white-space: nowrap; padding-right: 0.5rem;">Insurance Portion:</span>
            <span style="font-weight: 600; white-space: nowrap;">$${Math.max(0, grandTotal - job.insurance.deductible).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--accent-amber); margin-top: 0.1rem;">
             <span style="white-space: nowrap; padding-right: 0.5rem;">Customer Copay Due:</span>
            <span style="font-weight: 600; white-space: nowrap;">$${job.insurance.deductible.toFixed(2)}</span>
          </div>
          ` : `
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--accent-amber); margin-top: 0.25rem;">
            <span style="white-space: nowrap; padding-right: 0.5rem;">Customer Total Due:</span>
            <span style="font-weight: 600; white-space: nowrap;">$${grandTotal.toFixed(2)}</span>
          </div>
          `}
        </div>
      </div>
    `;
  }
  
  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 2rem;">
      <div>
        <h4 style="font-family: var(--font-display); border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-bottom: 1rem; color: var(--accent-indigo);">Vehicle & Customer Overview</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; font-size: 0.9rem; margin-bottom: 1.5rem;">
          <div>
            <div style="color: var(--text-muted);">Customer / Account:</div>
            <strong style="color: #fff; font-size: 1.05rem;">${job.customer.name || job.wholesaleCompany || "Unknown"}</strong>
            <div style="color: var(--text-secondary);">${job.customer.phone || (job.clientType === "wholesale" ? "Wholesale Client" : "No Phone")}</div>
            <div style="color: var(--text-secondary);">${job.customer.email || 'No email logged'}</div>
          </div>
          <div>
            <div style="color: var(--text-muted);">Vehicle Details:</div>
            <strong style="color: #fff; font-size: 1.05rem;">${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}</strong>
            <div>Plate: ${job.vehicle.plate || 'N/A'}</div>
            <div>Color Code: ${job.vehicle.color || 'N/A'}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">VIN: ${job.vehicle.vin || 'N/A'}</div>
            ${job.targetDate ? `<div style="margin-top: 0.5rem; font-weight: 600; color: var(--accent-amber);">Target Delivery: ${new Date(job.targetDate + 'T00:00:00').toLocaleDateString()}</div>` : ''}
          </div>
        </div>

        <h4 style="font-family: var(--font-display); border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-bottom: 1rem; color: var(--accent-indigo);">Damage / Repair Notes</h4>
        <p style="font-size: 0.9rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; white-space: pre-wrap;">${job.notes || 'No notes logged for this repair.'}</p>
        
        ${galleryHtml}
        ${panelsDetailsHtml}
        
        <h4 style="font-family: var(--font-display); border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-bottom: 1rem; color: var(--accent-indigo);">Workflow History Timeline</h4>
        <div style="display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1.5rem;">
          ${timelineHtml}
        </div>
      </div>

      <div>
        ${financialHtml}
      </div>
    </div>
  `;
  
  openModal("job-details-modal");
}

// --- Inventory Supply Modal ---
function openNewInventoryModal() {
  document.getElementById("inventory-form").reset();
  document.getElementById("inv-form-id").value = "";
  document.getElementById("inventory-modal-title").innerText = "Add Supply Item";
  openModal("inventory-modal");
}

function openEditInventoryModal(itemId) {
  const item = state.inventory.find(i => i.id === itemId);
  if (!item) return;
  
  document.getElementById("inv-form-id").value = item.id;
  document.getElementById("inventory-modal-title").innerText = `Edit Supply Item`;
  
  document.getElementById("inv-name").value = item.name;
  document.getElementById("inv-category").value = item.category;
  document.getElementById("inv-price").value = item.price;
  document.getElementById("inv-stock").value = item.stock;
  document.getElementById("inv-min").value = item.minLevel;
  
  openModal("inventory-modal");
}

function saveInventoryItem() {
  const form = document.getElementById("inventory-form");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const formId = document.getElementById("inv-form-id").value;
  const isEdit = formId !== "";
  
  let item;
  if (isEdit) {
    item = state.inventory.find(i => i.id === formId);
  } else {
    item = { id: `inv-${Date.now()}` };
  }
  
  item.name = document.getElementById("inv-name").value;
  item.category = document.getElementById("inv-category").value;
  item.price = parseFloat(document.getElementById("inv-price").value) || 0;
  item.stock = parseInt(document.getElementById("inv-stock").value) || 0;
  item.minLevel = parseInt(document.getElementById("inv-min").value) || 0;
  
  if (!isEdit) {
    state.inventory.push(item);
  }
  
  saveState();
  closeModal("inventory-modal");
  renderApp();
  showToast(isEdit ? `Updated stock specifications` : `Added ${item.name} to ledger`);
}

// --- Reorder List Print Generator ---
function generateReorderList() {
  const lowItems = state.inventory.filter(item => item.stock <= item.minLevel);
  const body = document.getElementById("reorder-modal-body");
  
  if (lowItems.length === 0) {
    body.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
        <h3>All Systems Full!</h3>
        <p>No inventory items are currently below safety reorder levels.</p>
      </div>
    `;
    openModal("reorder-list-modal");
    return;
  }
  
  let listHtml = `
    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">The following ${lowItems.length} items have fallen below their safety threshold and should be reordered immediately.</p>
    <table class="custom-table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th>Category</th>
          <th style="text-align: right;">In Stock</th>
          <th style="text-align: right;">Alert level</th>
          <th style="text-align: right;">Est Cost</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  let totalEstCost = 0;
  
  lowItems.forEach(item => {
    const orderQty = Math.max(1, (item.minLevel * 3) - item.stock);
    const cost = orderQty * item.price;
    totalEstCost += cost;
    
    listHtml += `
      <tr>
        <td style="font-weight: 600;">${item.name}</td>
        <td>${item.category}</td>
        <td style="text-align: right; color: var(--accent-rose); font-weight: 600;">${item.stock}</td>
        <td style="text-align: right;">${item.minLevel}</td>
        <td style="text-align: right; font-weight: 600;">$${cost.toFixed(2)} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">(order ${orderQty})</span></td>
      </tr>
    `;
  });
  
  listHtml += `
      </tbody>
    </table>
    <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem;">
      <span style="font-size: 1rem; font-weight: 600; color: var(--text-secondary);">Estimated Order Cost:</span>
      <span style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; color: var(--accent-emerald);">$${totalEstCost.toFixed(2)}</span>
    </div>
  `;
  
  body.innerHTML = listHtml;
  openModal("reorder-list-modal");
}

// ==========================================================================
// CLIENT TYPES, SUGGESTION AUTOCOMPLETE, & WHOLESALE LEDGERS
// ==========================================================================

function toggleClientFields() {
  const type = document.getElementById("client-type").value;
  const wholesaleField = document.querySelector(".wholesale-only-field");
  const custNameLabel = document.querySelector("label[for='cust-name']");
  const custPhoneLabel = document.querySelector("label[for='cust-phone']");
  const custNameInput = document.getElementById("cust-name");
  const custPhoneInput = document.getElementById("cust-phone");
  const wholesaleInput = document.getElementById("wholesale-company");
  
  if (wholesaleField) {
    wholesaleField.style.display = type === "wholesale" ? "flex" : "none";
  }
  
  if (type === "wholesale") {
    if (custNameLabel) custNameLabel.innerText = "Customer / Contact Name";
    if (custPhoneLabel) custPhoneLabel.innerText = "Phone Number";
    if (custNameInput) custNameInput.removeAttribute("required");
    if (custPhoneInput) custPhoneInput.removeAttribute("required");
    if (wholesaleInput) wholesaleInput.setAttribute("required", "true");
  } else {
    if (custNameLabel) custNameLabel.innerText = "Customer / Contact Name *";
    if (custPhoneLabel) custPhoneLabel.innerText = "Phone Number *";
    if (custNameInput) custNameInput.setAttribute("required", "true");
    if (custPhoneInput) custPhoneInput.setAttribute("required", "true");
    if (wholesaleInput) wholesaleInput.removeAttribute("required");
  }
}

function updateWholesaleCompaniesDatalist() {
  const datalist = document.getElementById("wholesale-companies-list");
  if (!datalist) return;
  
  const companies = new Set();
  
  // Add configured clients
  if (state.clients) {
    state.clients.forEach(c => {
      if (c.name) companies.add(c.name);
    });
  }
  
  // Add historic job wholesale companies
  state.jobs.forEach(j => {
    if (j.clientType === "wholesale" && j.wholesaleCompany) {
      companies.add(j.wholesaleCompany);
    }
  });
  
  datalist.innerHTML = "";
  companies.forEach(company => {
    const option = document.createElement("option");
    option.value = company;
    datalist.appendChild(option);
  });
}

function updatePaintCodeHelper() {
  const make = document.getElementById("veh-make").value.trim().toLowerCase();
  const card = document.getElementById("paint-helper-card");
  const text = document.getElementById("paint-helper-text");
  
  if (!card || !text) return;
  
  if (make && COLOR_CODE_LOCATIONS[make]) {
    card.style.display = "block";
    text.innerText = `${make.toUpperCase()}: ${COLOR_CODE_LOCATIONS[make]}`;
  } else if (make) {
    card.style.display = "block";
    text.innerText = "Check driver's side door jamb pillar, glove box, or under the hood.";
  } else {
    card.style.display = "none";
  }
}

// Live NHTSA VIN decoding API
async function decodeVIN() {
  const vinInput = document.getElementById("veh-vin");
  const vin = vinInput.value.trim().toUpperCase();
  
  if (vin.length !== 17) {
    showToast("Please enter a valid 17-digit VIN to decode.", "warning");
    return;
  }
  
  showToast("Contacting NHTSA database...", "info");
  
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    const results = data.Results;
    
    const getVal = (name) => {
      const match = results.find(r => r.Variable === name);
      return match ? match.Value : "";
    };
    
    const year = getVal("Model Year");
    const make = getVal("Make");
    const model = getVal("Model");
    const trim = getVal("Trim");
    
    if (make && model) {
      document.getElementById("veh-year").value = year;
      document.getElementById("veh-make").value = make;
      document.getElementById("veh-model").value = model + (trim ? ` ${trim}` : "");
      updatePaintCodeHelper();
      showToast(`Decoded successfully: ${year} ${make} ${model}`);
    } else {
      showToast("VIN decoded, but no vehicle details found. Please enter details manually.", "warning");
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to connect to VIN database. Please type details manually.", "warning");
  }
}

// Wholesale ledger account management
let selectedWholesaleAccount = "";

function renderWholesaleLedger() {
  const tbody = document.getElementById("wholesale-accounts-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const wholesaleJobs = state.jobs.filter(j => j.clientType === "wholesale" && j.stage !== "pickup");
  
  const accountsData = {};
  wholesaleJobs.forEach(job => {
    const comp = job.wholesaleCompany || "Unknown Wholesale";
    if (!accountsData[comp]) {
      accountsData[comp] = { count: 0, balance: 0, name: comp };
    }
    accountsData[comp].count++;
    accountsData[comp].balance += calculateTotalROCost(job);
  });
  
  const accountsList = Object.values(accountsData);
  
  const activeCountEl = document.getElementById("wholesale-active-accounts");
  if (activeCountEl) activeCountEl.innerText = accountsList.length;
  
  const totalBalance = accountsList.reduce((sum, a) => sum + a.balance, 0);
  const totalBalanceEl = document.getElementById("wholesale-total-outstanding");
  if (totalBalanceEl) totalBalanceEl.innerText = `$${totalBalance.toFixed(2)}`;
  
  if (accountsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No pending wholesale balances.</td></tr>`;
    document.getElementById("wholesale-jobs-tbody").innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No accounts.</td></tr>`;
    document.getElementById("generate-statement-btn").disabled = true;
    document.getElementById("selected-wholesale-account-title").innerText = "No Wholesale Accounts";
    return;
  }
  
  accountsList.forEach(account => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    if (selectedWholesaleAccount === account.name) {
      tr.style.background = "var(--accent-indigo-glow)";
      tr.style.borderLeft = "3px solid var(--accent-indigo)";
    }
    tr.onclick = () => selectWholesaleAccount(account.name);
    
    tr.innerHTML = `
      <td style="font-weight: 600;">${account.name}</td>
      <td>${account.count} open jobs</td>
      <td style="font-weight: 700; font-family: var(--font-display); text-align: right;">$${account.balance.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
  
  renderSelectedAccountJobs();
}

function selectWholesaleAccount(accountName) {
  selectedWholesaleAccount = accountName;
  renderWholesaleLedger();
}

function renderSelectedAccountJobs() {
  const tbody = document.getElementById("wholesale-jobs-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const btn = document.getElementById("generate-statement-btn");
  const title = document.getElementById("selected-wholesale-account-title");
  
  if (!selectedWholesaleAccount) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Select a wholesale account on the left to view pending invoices.</td></tr>`;
    if (btn) btn.disabled = true;
    if (title) title.innerText = "Select an Account";
    return;
  }
  
  if (title) title.innerText = selectedWholesaleAccount;
  if (btn) btn.disabled = false;
  
  const pendingJobs = state.jobs.filter(
    j => j.clientType === "wholesale" && 
    j.wholesaleCompany === selectedWholesaleAccount && 
    j.stage !== "pickup"
  );
  
  if (pendingJobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No open jobs for this account.</td></tr>`;
    if (btn) btn.disabled = true;
    return;
  }
  
  pendingJobs.forEach(job => {
    const total = calculateTotalROCost(job);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-family: var(--font-display); font-weight: 700;">${job.id}</td>
      <td>${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}</td>
      <td><span class="status-pill ${WORKFLOW_STAGES[job.stage].class}">${WORKFLOW_STAGES[job.stage].title}</span></td>
      <td style="font-weight: 600; font-family: var(--font-display); text-align: right;">$${total.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function openWholesaleStatement() {
  if (!selectedWholesaleAccount) return;
  
  let jobsToInvoice = [];
  if (selectedWholesaleInvoiceJobs.length > 0) {
    jobsToInvoice = state.jobs.filter(j => selectedWholesaleInvoiceJobs.includes(j.id));
  } else {
    // fallback to all outstanding/unpaid wholesale jobs for this account
    jobsToInvoice = state.jobs.filter(
      j => j.clientType === "wholesale" && 
      j.wholesaleCompany === selectedWholesaleAccount && 
      j.stage !== "pickup"
    );
  }
  
  if (jobsToInvoice.length === 0) {
    showToast("No jobs selected or outstanding to invoice.", "warning");
    return;
  }
  
  const body = document.getElementById("wholesale-statement-modal-body");
  if (!body) return;
  
  const dateStr = new Date().toLocaleDateString();
  const statementNum = `STMT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  let totalBalance = 0;
  let summaryRowsHtml = "";
  let detailsPagesHtml = "";
  
  jobsToInvoice.forEach((job, idx) => {
    const jobTotal = calculateTotalROCost(job);
    totalBalance += jobTotal;
    
    summaryRowsHtml += `
      <tr>
        <td style="font-weight: 700; font-family: var(--font-display);">${job.id}</td>
        <td>
          <div style="font-weight: 600;">${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Plate: ${job.vehicle.plate || "N/A"} | VIN: ${job.vehicle.vin || "N/A"}</div>
        </td>
        <td>${job.customer.name || "N/A"}</td>
        <td>${WORKFLOW_STAGES[job.stage]?.title || job.stage}</td>
        <td style="text-align: right; font-weight: 600; font-family: var(--font-display);">$${jobTotal.toFixed(2)}</td>
      </tr>
    `;
    
    let itemsRowsHtml = "";
    if (job.flatItems && job.flatItems.length > 0) {
      job.flatItems.forEach(item => {
        itemsRowsHtml += `
          <tr>
            <td>${item.description}</td>
            <td style="text-align: right; font-weight: 600; font-family: var(--font-display);">$${(item.cost || 0).toFixed(2)}</td>
          </tr>
        `;
      });
    } else if (job.panels && job.panels.length > 0) {
      const rates = job.rates || { bodyRate: 65, paintRate: 65, materialRate: 45 };
      job.panels.forEach(p => {
        const cost = (p.refinishHours * rates.paintRate) + ((p.bodyHours + p.riHours) * rates.bodyRate) + (p.refinishHours * rates.materialRate) + (p.replacePart ? p.partCost : 0);
        const desc = `${p.label} repair (${p.substrate}) - Body: ${p.bodyHours}h, Paint: ${p.refinishHours}h` + (p.replacePart ? ` + Part: ${p.partName}` : "");
        itemsRowsHtml += `
          <tr>
            <td>${desc}</td>
            <td style="text-align: right; font-weight: 600; font-family: var(--font-display);">$${cost.toFixed(2)}</td>
          </tr>
        `;
      });
    } else {
      itemsRowsHtml += `
        <tr>
          <td>General Body & Paint Repairs (${job.laborHours || 0} hrs labor)</td>
          <td style="text-align: right; font-weight: 600; font-family: var(--font-display);">$${jobTotal.toFixed(2)}</td>
        </tr>
      `;
    }
    
    detailsPagesHtml += `
      <div class="multi-vehicle-invoice-page" style="margin-top: 2rem; padding: 1.5rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem;">
          <div>
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Vehicle ${idx + 1} of ${jobsToInvoice.length}</span>
            <h3 style="font-family: var(--font-display); margin: 0.25rem 0 0 0; color: #fff;">${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}</h3>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Repair Order ID</span>
            <div style="font-family: var(--font-display); font-weight: 700; color: var(--accent-indigo); font-size: 1.1rem;">${job.id}</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
          <div>
            <div>Plate Number: <strong style="color: #fff;">${job.vehicle.plate || "N/A"}</strong></div>
            <div>Color Code: <strong style="color: #fff;">${job.vehicle.color || "N/A"}</strong></div>
          </div>
          <div>
            <div>VIN: <strong style="color: #fff;">${job.vehicle.vin || "N/A"}</strong></div>
            <div>Contact Person: <strong style="color: #fff;">${job.customer.name || "N/A"}</strong></div>
          </div>
        </div>

        <table class="custom-table" style="font-size: 0.8rem; margin-bottom: 1rem;">
          <thead>
            <tr>
              <th>Description of Service / Repair</th>
              <th style="text-align: right; width: 150px;">Flat Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
            <tr style="border-top: 1.5px solid var(--border-color); font-weight: 700; font-family: var(--font-display); font-size: 0.95rem; color: #fff;">
              <td style="text-align: right;">Vehicle Subtotal:</td>
              <td style="text-align: right; color: var(--accent-emerald); font-size: 1rem;">$${jobTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  });
  
  body.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <h2 style="font-family: var(--font-display); font-size: 1.75rem; margin-bottom: 0.5rem; color: #fff;">Consolidated Wholesale Statement</h2>
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); flex-wrap: wrap; gap: 1rem;">
        <div>
          <div>Statement Ref: <strong style="color:#fff;">${statementNum}</strong></div>
          <div>Statement Date: <strong>${dateStr}</strong></div>
          <div>Billed To: <strong style="color: #fff; font-size: 1.1rem;">${selectedWholesaleAccount}</strong></div>
        </div>
        <div style="text-align: right;">
          <div>Outstanding Jobs: <strong>${jobsToInvoice.length}</strong></div>
          <div style="font-size: 1.1rem; color: var(--accent-amber);">Total Invoice Amount: <strong>$${totalBalance.toFixed(2)}</strong></div>
        </div>
      </div>
    </div>
    
    <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 0.5rem; color: #fff;">Billing Summary (All Vehicles)</h3>
    <table class="custom-table" style="margin-bottom: 2rem;">
      <thead>
        <tr>
          <th>RO ID</th>
          <th>Vehicle Details</th>
          <th>Contact Person</th>
          <th>Repair Stage</th>
          <th style="text-align: right;">Balance</th>
        </tr>
      </thead>
      <tbody>
        ${summaryRowsHtml}
        <tr style="border-top: 2px solid var(--border-color); font-weight: 700; font-family: var(--font-display); font-size: 1.1rem; color: #fff;">
          <td colspan="4" style="text-align: right;">Total Due Statement Balance:</td>
          <td style="text-align: right; color: var(--accent-amber);">$${totalBalance.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-top: 3rem; margin-bottom: 0.5rem; color: #fff; page-break-before: always;">Detailed Itemizations By Vehicle</h3>
    ${detailsPagesHtml}
    
    <div style="margin-top: 3rem; text-align: center; border-top: 1px solid var(--border-color); padding-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted);">
      Thank you for your business! Please remit payment within net 30 days.
    </div>
  `;
  
  openModal("wholesale-statement-modal");
}

// ==========================================================================
// WHOLESALE CLIENT MANAGEMENT & SUB-VIEWS
// ==========================================================================

// ==========================================================================
// UNIFIED CLIENT MANAGEMENT & DIRECTORY
// ==========================================================================

let selectedClientId = "";

function toggleModalClientType() {
  const type = document.getElementById("client-type-input").value;
  const label = document.getElementById("client-name-label");
  const contactGroup = document.getElementById("client-contact-group");
  
  if (type === "wholesale") {
    if (label) label.innerText = "Company Name *";
    if (contactGroup) contactGroup.style.display = "flex";
  } else {
    if (label) label.innerText = "Customer Name *";
    if (contactGroup) contactGroup.style.display = "none";
  }
}

function openNewClientModal() {
  document.getElementById("client-form-id").value = "";
  document.getElementById("client-form").reset();
  document.getElementById("client-modal-title").innerText = "Add Client Profile";
  document.getElementById("client-type-input").value = "retail";
  toggleModalClientType();
  openModal("client-modal");
}

function openEditClientModal(clientId) {
  const client = state.clients.find(c => c.id === clientId);
  if (!client) return;
  
  document.getElementById("client-form-id").value = client.id;
  document.getElementById("client-type-input").value = client.type;
  toggleModalClientType();
  
  document.getElementById("client-name-input").value = client.name;
  document.getElementById("client-contact-input").value = client.contactName || "";
  document.getElementById("client-phone-input").value = client.phone || "";
  document.getElementById("client-email-input").value = client.email || "";
  
  document.getElementById("client-modal-title").innerText = "Edit Client Profile";
  openModal("client-modal");
}

function saveClient(event) {
  event.preventDefault();
  const formId = document.getElementById("client-form-id").value;
  const type = document.getElementById("client-type-input").value;
  const name = document.getElementById("client-name-input").value.trim();
  const contactName = document.getElementById("client-contact-input").value.trim();
  const phone = document.getElementById("client-phone-input").value.trim();
  const email = document.getElementById("client-email-input").value.trim();
  
  if (!name) {
    showToast("Name is required.", "warning");
    return;
  }
  
  const isDuplicate = state.clients.some(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== formId);
  if (isDuplicate) {
    showToast("A client with this name already exists.", "warning");
    return;
  }
  
  if (formId) {
    const client = state.clients.find(c => c.id === formId);
    if (client) {
      client.type = type;
      client.name = name;
      client.contactName = type === "wholesale" ? contactName : "";
      client.phone = phone;
      client.email = email;
      showToast("Client profile updated.");
    }
  } else {
    const newClient = {
      id: "cli-" + Date.now(),
      type,
      name,
      contactName: type === "wholesale" ? contactName : "",
      phone,
      email
    };
    state.clients.push(newClient);
    showToast("Client profile created.");
  }
  
  saveState();
  closeModal("client-modal");
  renderClientsList();
  if (selectedClientId) selectClient(selectedClientId);
  updateWholesaleCompaniesDatalist();
}

function deleteClient(clientId) {
  const client = state.clients.find(c => c.id === clientId);
  if (!client) return;
  
  if (confirm(`Are you sure you want to delete client "${client.name}"?`)) {
    state.clients = state.clients.filter(c => c.id !== clientId);
    if (selectedClientId === clientId) selectedClientId = "";
    saveState();
    renderClientsList();
    const container = document.getElementById("client-profile-container");
    if (container) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 300px; color: var(--text-muted); text-align: center;">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; opacity: 0.5;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <h3>Select a client from the directory to view details</h3>
        </div>
      `;
    }
    updateWholesaleCompaniesDatalist();
    showToast("Client deleted.");
  }
}

function renderClientsList() {
  const tbody = document.getElementById("clients-list-tbody");
  if (!tbody) return;
  
  const searchVal = document.getElementById("client-search-input").value.trim().toLowerCase();
  const typeFilter = document.getElementById("client-type-filter").value;
  
  if (!state.clients) state.clients = [];
  
  let filtered = state.clients;
  
  if (typeFilter !== "all") {
    filtered = filtered.filter(c => c.type === typeFilter);
  }
  
  if (searchVal) {
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(searchVal) || 
      (c.phone && c.phone.includes(searchVal)) ||
      (c.contactName && c.contactName.toLowerCase().includes(searchVal))
    );
  }
  
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No clients found.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = "";
  filtered.forEach(client => {
    const tr = document.createElement("tr");
    tr.id = `client-row-${client.id}`;
    if (client.id === selectedClientId) {
      tr.className = "active-row";
    }
    
    const typeLabel = client.type === "wholesale" 
      ? `<span class="status-pill pill-yellow" style="font-size:0.7rem; padding: 0.15rem 0.4rem;">Wholesale</span>`
      : `<span class="status-pill pill-green" style="font-size:0.7rem; padding: 0.15rem 0.4rem;">Retail</span>`;
      
    tr.innerHTML = `
      <td><strong style="color: #fff;">${client.name}</strong></td>
      <td>${typeLabel}</td>
      <td style="font-size: 0.8rem; color: var(--text-secondary);">${client.phone || "N/A"}</td>
    `;
    
    tr.onclick = () => selectClient(client.id);
    tbody.appendChild(tr);
  });
}

function selectClient(clientId) {
  selectedClientId = clientId;
  selectedWholesaleInvoiceJobs = []; // Reset selected invoice jobs on client change
  
  document.querySelectorAll("#clients-list-tbody tr").forEach(tr => {
    tr.classList.remove("active-row");
  });
  const activeRow = document.getElementById(`client-row-${clientId}`);
  if (activeRow) activeRow.classList.add("active-row");
  
  const profileContainer = document.getElementById("client-profile-container");
  if (!profileContainer) return;
  
  const client = state.clients.find(c => c.id === clientId);
  if (!client) return;
  
  let clientJobs = [];
  if (client.type === "wholesale") {
    clientJobs = state.jobs.filter(j => j.clientType === "wholesale" && j.wholesaleCompany === client.name);
  } else {
    clientJobs = state.jobs.filter(j => j.clientType === "retail" && (j.customer.name.toLowerCase() === client.name.toLowerCase() || j.customer.phone === client.phone));
  }
  
  let outstandingBalance = 0;
  let unpaidCount = 0;
  if (client.type === "wholesale") {
    const unpaidJobs = clientJobs.filter(j => j.stage !== "pickup");
    unpaidJobs.forEach(j => {
      outstandingBalance += calculateTotalROCost(j);
    });
    unpaidCount = unpaidJobs.length;
  }
  
  const isWholesale = client.type === "wholesale";
  let jobsRowsHtml = "";
  if (clientJobs.length === 0) {
    jobsRowsHtml = `<tr><td colspan="${isWholesale ? '6' : '5'}" style="text-align: center; color: var(--text-muted); padding: 1rem;">No job or estimate history.</td></tr>`;
  } else {
    clientJobs.forEach(job => {
      const total = calculateTotalROCost(job);
      const stagePill = `<span class="status-pill ${WORKFLOW_STAGES[job.stage]?.class || 'pill-muted'}">${WORKFLOW_STAGES[job.stage]?.title || job.stage}</span>`;
      const checkboxHtml = isWholesale
        ? `<td style="text-align: center;"><input type="checkbox" class="wholesale-job-checkbox" data-job-id="${job.id}" onchange="toggleWholesaleJobSelection('${job.id}', this.checked)"></td>`
        : '';
      jobsRowsHtml += `
        <tr>
          ${checkboxHtml}
          <td style="font-family: var(--font-display); font-weight:700;">${job.id}</td>
          <td>${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}</td>
          <td>${stagePill}</td>
          <td style="font-weight: 600;">$${total.toFixed(2)}</td>
          <td>
            <div style="display:flex; gap:0.4rem;">
              <button class="btn btn-sm btn-icon" onclick="viewJobDetails('${job.id}')" title="View Invoices / RO Details">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  }
  
  let wholesaleBillingSection = "";
  if (client.type === "wholesale") {
    wholesaleBillingSection = `
      <div style="margin-top: 1.5rem; background: rgba(251, 191, 36, 0.05); border: 1px solid rgba(251, 191, 36, 0.15); border-radius: 8px; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Outstanding Balance</div>
          <div style="font-size: 1.5rem; font-family: var(--font-display); font-weight: 800; color: var(--accent-amber); margin-top: 0.25rem;">$${outstandingBalance.toFixed(2)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem;">${unpaidCount} unpaid repair orders</div>
        </div>
        <button class="btn btn-emerald btn-sm" onclick="generateClientStatement('${client.name}')" ${unpaidCount === 0 ? "disabled" : ""}>Generate Billing Statement</button>
      </div>
    `;
  }
  
  const typeBadge = client.type === "wholesale" 
    ? `<span class="status-pill pill-yellow">Wholesale Account</span>` 
    : `<span class="status-pill pill-green">Retail Customer</span>`;
    
  const contactRow = client.type === "wholesale" && client.contactName
    ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Contact Person: <strong style="color: #fff;">${client.contactName}</strong></div>`
    : "";

  profileContainer.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:start; border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1.5rem;">
      <div>
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
          <h2 style="font-family: var(--font-display); font-size:1.5rem; margin:0; color:#fff;">${client.name}</h2>
          ${typeBadge}
        </div>
        ${contactRow}
        <div style="display:flex; gap:1.5rem; font-size:0.85rem; color:var(--text-secondary);">
          <div>Phone: <strong style="color: #fff;">${client.phone || "N/A"}</strong></div>
          <div>Email: <strong style="color: #fff;">${client.email || "N/A"}</strong></div>
        </div>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-sm" onclick="openEditClientModal('${client.id}')">Edit Profile</button>
        <button class="btn btn-sm btn-danger" onclick="deleteClient('${client.id}')" style="background:var(--accent-rose); border:none;">Delete</button>
      </div>
    </div>
    
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
      <h3 style="font-family: var(--font-display); font-size:1.1rem; margin:0; color:#fff;">Estimate & Job History</h3>
      <button class="btn btn-primary btn-sm" onclick="createJobForClient('${client.id}')">+ New RO / Estimate</button>
    </div>
    
    <div class="table-container" style="max-height: 250px; overflow-y: auto; flex-grow:1;">
      <table class="custom-table" style="font-size:0.8rem;">
        <thead>
          <tr>
            ${isWholesale ? '<th style="width: 40px; text-align: center;"><input type="checkbox" id="select-all-wholesale-jobs" onchange="toggleSelectAllWholesaleJobs(this.checked)"></th>' : ''}
            <th>RO ID</th>
            <th>Vehicle Details</th>
            <th>Stage</th>
            <th>Total Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${jobsRowsHtml}
        </tbody>
      </table>
    </div>
    
    ${wholesaleBillingSection}
  `;
  
  if (isWholesale) {
    updateWholesaleBillingButton();
  }
}

function createJobForClient(clientId) {
  const client = state.clients.find(c => c.id === clientId);
  if (!client) return;
  
  openNewJobModal();
  
  const typeSelect = document.getElementById("client-type");
  if (typeSelect) {
    typeSelect.value = client.type;
    toggleClientFields();
  }
  
  if (client.type === "wholesale") {
    const companyInput = document.getElementById("wholesale-company");
    if (companyInput) companyInput.value = client.name;
    const contactInput = document.getElementById("cust-name");
    if (contactInput) contactInput.value = client.contactName || "";
  } else {
    const contactInput = document.getElementById("cust-name");
    if (contactInput) contactInput.value = client.name;
  }
  
  const phoneInput = document.getElementById("cust-phone");
  if (phoneInput) phoneInput.value = client.phone || "";
  
  const emailInput = document.getElementById("cust-email");
  if (emailInput) emailInput.value = client.email || "";
}

function generateClientStatement(clientName) {
  selectedWholesaleAccount = clientName;
  openWholesaleStatement();
}


// ==========================================================================
// RETAIL ESTIMATES CONTROLLER
// ==========================================================================

function renderEstimatesList() {
  const tbody = document.getElementById("retail-estimates-tbody");
  if (!tbody) return;
  
  const retailJobs = state.jobs.filter(j => j.clientType === "retail");
  
  if (retailJobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No retail estimates found. Click "+ Create Retail Estimate" to start.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = "";
  retailJobs.forEach(job => {
    const total = calculateTotalROCost(job);
    const tr = document.createElement("tr");
    
    tr.innerHTML = `
      <td style="font-family: var(--font-display); font-weight:700;">${job.id}</td>
      <td>
        <strong style="color: #fff;">${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}</strong>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.1rem;">VIN: ${job.vehicle.vin || "N/A"}</div>
      </td>
      <td>${job.customer.name || "N/A"}</td>
      <td><span class="status-pill ${WORKFLOW_STAGES[job.stage].class}">${WORKFLOW_STAGES[job.stage].title}</span></td>
      <td style="font-weight: 600; font-family: var(--font-display); font-size: 0.95rem; color: var(--accent-emerald);">$${total.toFixed(2)}</td>
      <td>
        <div style="display:flex; gap:0.4rem;">
          <button class="btn btn-sm btn-icon" onclick="viewJobDetails('${job.id}')" title="View Invoices & RO Sheet">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn btn-sm btn-icon" onclick="openEditJobModal('${job.id}')" title="Edit Repair Order">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-sm btn-icon btn-danger" onclick="deleteJob('${job.id}')" title="Delete Job/Estimate" style="background:var(--accent-rose); border:none;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openNewRetailEstimateModal() {
  openNewJobModal();
  const clientTypeSelect = document.getElementById("client-type");
  if (clientTypeSelect) {
    clientTypeSelect.value = "retail";
    toggleClientFields();
  }
}


// ==========================================================================
// CAMERA VIN SCANNER CONTROLLER
// ==========================================================================

let scannerStream = null;

function startVinScanner() {
  openModal("scanner-modal");
  const video = document.getElementById("scanner-video");
  const status = document.getElementById("scanner-status");
  
  if (status) status.innerText = "Accessing camera...";
  
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      scannerStream = stream;
      if (video) {
        video.srcObject = stream;
        video.play();
      }
      if (status) status.innerText = "Align VIN Barcode inside frame";
      
      // Start testing frames with native BarcodeDetector if supported
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new BarcodeDetector({ formats: ['code_39', 'code_128', 'qr_code'] });
        
        function scanLoop() {
          if (!scannerStream) return; // Scanner closed
          
          barcodeDetector.detect(video)
            .then(barcodes => {
              if (barcodes.length > 0) {
                const vin = barcodes[0].rawValue.trim();
                // VIN must be exactly 17 characters in standard automotive specs
                if (vin.length === 17) {
                  handleDecodedVin(vin);
                  return;
                }
              }
              requestAnimationFrame(scanLoop);
            })
            .catch(err => {
              requestAnimationFrame(scanLoop);
            });
        }
        
        // Wait for video meta data to ensure it's rendering
        video.onloadedmetadata = () => {
          scanLoop();
        };
      }
    })
    .catch(err => {
      console.error("Camera access failed:", err);
      if (status) status.innerText = "Camera error: permission denied or not found.";
      showToast("Could not access camera feed.", "warning");
    });
}

function stopVinScanner() {
  if (scannerStream) {
    scannerStream.getTracks().forEach(track => track.stop());
    scannerStream = null;
  }
  const video = document.getElementById("scanner-video");
  if (video) video.srcObject = null;
  closeModal("scanner-modal");
}

function simulateVinScan() {
  // Mock standard decodable test VINs
  const testVins = [
    "1FA6P8CF9K510822",  // Ford Mustang
    "1GNSKTEC1HR129481", // Chevrolet Tahoe
    "5YFSF40P8EG092384"  // Toyota Corolla
  ];
  const randVin = testVins[Math.floor(Math.random() * testVins.length)];
  handleDecodedVin(randVin);
}

function handleDecodedVin(vin) {
  stopVinScanner();
  const vinInput = document.getElementById("veh-vin");
  if (vinInput) {
    vinInput.value = vin;
    showToast(`Successfully scanned VIN: ${vin}`);
    decodeVIN(); // Automatically run NHTSA decoder API
  }
}

// ==========================================================================
// PARTS LOOKUP CONTROLLERS
// ==========================================================================
let currentLookupPanelKey = "";

function openPartsLookupModal(key) {
  currentLookupPanelKey = key;
  const makeInput = document.getElementById("veh-make");
  const make = makeInput ? makeInput.value.toLowerCase().trim() : "generic";
  const panelConfig = COLLISION_PANELS.find(cp => cp.key === key);
  const panelName = panelConfig ? panelConfig.label : key;
  
  const vehicleDescSpan = document.getElementById("parts-lookup-vehicle-desc");
  const panelDescSpan = document.getElementById("parts-lookup-panel-desc");
  if (vehicleDescSpan) vehicleDescSpan.innerText = make.toUpperCase();
  if (panelDescSpan) panelDescSpan.innerText = panelName;
  
  const catalog = MOCK_PARTS_CATALOG[make] || MOCK_PARTS_CATALOG["generic"];
  const panelParts = catalog[key] || [];
  
  const resultsContainer = document.getElementById("parts-lookup-results");
  if (resultsContainer) {
    resultsContainer.innerHTML = "";
    if (panelParts.length === 0) {
      resultsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1rem;">No recommendations in catalog for this panel.</div>`;
    } else {
      panelParts.forEach(part => {
        const card = document.createElement("div");
        card.className = "catalog-item-card";
        card.innerHTML = `
          <div>
            <strong style="color: #fff;">${part.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem;">Type: ${part.type}</div>
          </div>
          <div class="parts-price-badge">$${part.cost.toFixed(2)}</div>
        `;
        card.onclick = () => selectPartFromLookup(part.name, part.cost);
        resultsContainer.appendChild(card);
      });
    }
  }
  
  const externalLinksContainer = document.getElementById("parts-lookup-external-links");
  if (externalLinksContainer) {
    const queryStr = encodeURIComponent(`${make} ${panelName} parts`);
    externalLinksContainer.innerHTML = `
      <a href="https://www.car-part.com" target="_blank" class="btn btn-sm btn-icon" style="background: rgba(99,102,241,0.1); border:1px solid var(--border-color); text-align:center; padding: 0.5rem; border-radius: 6px; font-size: 0.75rem; color:#fff; text-decoration:none; display:flex; align-items:center; justify-content:center;">Car-Part.com 🌐</a>
      <a href="https://www.rockauto.com" target="_blank" class="btn btn-sm btn-icon" style="background: rgba(99,102,241,0.1); border:1px solid var(--border-color); text-align:center; padding: 0.5rem; border-radius: 6px; font-size: 0.75rem; color:#fff; text-decoration:none; display:flex; align-items:center; justify-content:center;">RockAuto 🚗</a>
      <a href="https://www.google.com/search?q=${queryStr}" target="_blank" class="btn btn-sm btn-icon" style="background: rgba(99,102,241,0.1); border:1px solid var(--border-color); text-align:center; padding: 0.5rem; border-radius: 6px; font-size: 0.75rem; color:#fff; text-decoration:none; display:flex; align-items:center; justify-content:center;">Google Search 🔍</a>
    `;
  }
  
  openModal("parts-lookup-modal");
}

function selectPartFromLookup(name, cost) {
  if (!currentLookupPanelKey) return;
  const key = currentLookupPanelKey;
  if (tempSelectedPanels[key]) {
    tempSelectedPanels[key].partName = name;
    tempSelectedPanels[key].partCost = cost;
    
    const partNameInput = document.getElementById(`panel-part-name-${key}`);
    const partCostInput = document.getElementById(`panel-part-cost-${key}`);
    if (partNameInput) partNameInput.value = name;
    if (partCostInput) partCostInput.value = cost;
    
    recalcWizardCosts();
  }
  closeModal("parts-lookup-modal");
}

// ==========================================================================
// VEHICLE PHOTO COMPRESSOR & LIGHTBOX CONTROLLERS
// ==========================================================================
function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleVehiclePhotoUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  showToast("Compressing and processing photo uploads...", "info");
  for (let i = 0; i < files.length; i++) {
    try {
      const compressedBase64 = await compressPhoto(files[i]);
      tempPhotos.push(compressedBase64);
    } catch (err) {
      console.error("Failed to upload photo:", err);
      showToast("Error compressing vehicle photo.", "warning");
    }
  }
  renderTempPhotos();
  showToast("Photos successfully added.");
}

function renderTempPhotos() {
  const container = document.getElementById("vehicle-photos-preview");
  if (!container) return;
  container.innerHTML = "";
  
  tempPhotos.forEach((src, index) => {
    const item = document.createElement("div");
    item.className = "photo-preview-item";
    item.innerHTML = `
      <img src="${src}" alt="Vehicle Photo preview" onclick="openPhotoLightbox('${src}')">
      <button type="button" class="photo-preview-delete" onclick="removeTempPhoto(${index})">&times;</button>
    `;
    container.appendChild(item);
  });
}

function removeTempPhoto(index) {
  tempPhotos.splice(index, 1);
  renderTempPhotos();
}

function openPhotoLightbox(src) {
  const overlay = document.getElementById("lightbox-overlay");
  const img = document.getElementById("lightbox-image");
  if (overlay && img) {
    img.src = src;
    overlay.classList.add("active");
  }
}

// ==========================================================================
// WHOLESALE FLAT-RATE REPAIR CONTROLLERS
// ==========================================================================
function renderWizardFlatItemsEditor() {
  const tbody = document.getElementById("wholesale-flat-items-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  if (tempFlatItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No flat rate items added yet. Use quick add or manual form above.</td></tr>`;
    return;
  }
  
  tempFlatItems.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight: 600; color: #fff;">${item.description}</td>
      <td style="text-align: right; font-weight: 600; font-family: var(--font-display); padding-right: 1.5rem;">$${item.cost.toFixed(2)}</td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-sm btn-icon btn-danger" onclick="removeFlatItem(${index})" style="background: var(--accent-rose); border: none; padding: 0.25rem 0.5rem; min-height: auto;">&times;</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addWholesaleQuickItem(desc, cost) {
  tempFlatItems.push({ description: desc, cost: parseFloat(cost) || 0 });
  renderWizardFlatItemsEditor();
  recalcWizardCosts();
}

function addManualFlatItem() {
  const descInput = document.getElementById("flat-item-desc");
  const costInput = document.getElementById("flat-item-cost");
  if (!descInput || !costInput) return;
  
  const desc = descInput.value.trim();
  const cost = parseFloat(costInput.value) || 0;
  
  if (!desc) {
    showToast("Please enter a repair description", "warning");
    return;
  }
  
  tempFlatItems.push({ description: desc, cost: cost });
  descInput.value = "";
  costInput.value = "";
  renderWizardFlatItemsEditor();
  recalcWizardCosts();
}

function removeFlatItem(index) {
  tempFlatItems.splice(index, 1);
  renderWizardFlatItemsEditor();
  recalcWizardCosts();
}

// ==========================================================================
// COMPLETED ARCHIVE & SUB-VIEW CONTROLLERS
// ==========================================================================
function completeAndArchiveJob(jobId) {
  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return;
  
  job.stage = "completed";
  job.history.push({ stage: "completed", timestamp: new Date().toISOString() });
  saveData();
  renderApp();
  showToast(`Job ${job.id} marked as Completed and moved to Archive.`);
}

function toggleKanbanSubView(view) {
  const boardBtn = document.getElementById("btn-kanban-board");
  const archiveBtn = document.getElementById("btn-kanban-archive");
  const boardWrapper = document.getElementById("kanban-board-wrapper");
  const archiveWrapper = document.getElementById("kanban-archive-wrapper");
  
  if (view === 'archive') {
    if (boardBtn) boardBtn.classList.remove("active");
    if (archiveBtn) archiveBtn.classList.add("active");
    if (boardWrapper) boardWrapper.style.display = "none";
    if (archiveWrapper) archiveWrapper.style.display = "block";
    renderKanbanArchive();
  } else {
    if (boardBtn) boardBtn.classList.add("active");
    if (archiveBtn) archiveBtn.classList.remove("active");
    if (boardWrapper) boardWrapper.style.display = "block";
    if (archiveWrapper) archiveWrapper.style.display = "none";
    renderKanban();
  }
}

function renderKanbanArchive() {
  const tbody = document.getElementById("kanban-archive-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  const completedJobs = state.jobs.filter(j => j.stage === "completed");
  if (completedJobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No completed jobs in the archive.</td></tr>`;
    return;
  }
  
  completedJobs.forEach(job => {
    const total = calculateTotalROCost(job);
    const date = new Date(job.history.find(h => h.stage === "completed")?.timestamp || job.createdAt).toLocaleDateString();
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-family: var(--font-display); font-weight: 700;">${job.id}</td>
      <td>
        <strong style="color: #fff;">${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">VIN: ${job.vehicle.vin || 'N/A'}</div>
      </td>
      <td>${job.customer.name || job.wholesaleCompany || 'N/A'}</td>
      <td style="text-transform: capitalize;">${job.clientType}</td>
      <td>${date}</td>
      <td style="font-weight: 600; font-family: var(--font-display); color: var(--accent-emerald); font-size: 0.95rem;">$${total.toFixed(2)}</td>
      <td>
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn btn-sm btn-icon" onclick="viewJobDetails('${job.id}')" title="View Invoices & Details">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleWholesaleJobSelection(jobId, checked) {
  if (checked) {
    if (!selectedWholesaleInvoiceJobs.includes(jobId)) {
      selectedWholesaleInvoiceJobs.push(jobId);
    }
  } else {
    selectedWholesaleInvoiceJobs = selectedWholesaleInvoiceJobs.filter(id => id !== jobId);
  }
  updateWholesaleBillingButton();
}

function toggleSelectAllWholesaleJobs(checked) {
  const checkboxes = document.querySelectorAll('.wholesale-job-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = checked;
    const jobId = cb.getAttribute('data-job-id');
    toggleWholesaleJobSelection(jobId, checked);
  });
}

function updateWholesaleBillingButton() {
  const btn = document.querySelector("#client-profile-container button.btn-emerald");
  if (!btn) return;
  const count = selectedWholesaleInvoiceJobs.length;
  if (count > 0) {
    btn.innerText = `Generate Billing Statement (${count} selected)`;
    btn.removeAttribute("disabled");
  } else {
    btn.innerText = `Generate Billing Statement (All Outstanding)`;
    const client = state.clients.find(c => c.id === selectedClientId);
    if (client) {
      const clientJobs = state.jobs.filter(j => j.clientType === "wholesale" && j.wholesaleCompany === client.name);
      const unpaidCount = clientJobs.filter(j => j.stage !== "pickup").length;
      if (unpaidCount === 0) {
        btn.setAttribute("disabled", "true");
      } else {
        btn.removeAttribute("disabled");
      }
    }
  }
}
