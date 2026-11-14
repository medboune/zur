// Central site constants and content for Zuronix.
// Keep copy here so the team can edit text without touching components.

export const SITE = {
  name: "Zuronix",
  legalName: "Zuronix",
  tagline: "Data Center, Semiconductor & Industrial Equipment Supplier",
  description:
    "Zuronix supplies data center hardware, semiconductor equipment and industrial machinery — GPUs, servers, networking, wafer test, CNC, robotics and power equipment — from available inventory or sourced to your part number. US supplier based in Vancouver, Washington.",
  phone: "+1 360 822 0923",
  phoneHref: "+13608220923",
  smsHref: "+13608220923",
  // Business hours shown in the footer, contact page, and FAQ.
  hours: "Mon–Fri 7am–7pm · Sat 9am–6pm (Pacific Time)",
  email: "info@zuronix.com",
  address: {
    street: "4400 NE 77th Ave",
    city: "Vancouver",
    state: "WA",
    zip: "98662-6829",
    country: "USA",
  },
} as const;

export const SITE_ADDRESS_ONE_LINE = `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.state} ${SITE.address.zip}`;

export type SectorKey = "SEMICONDUCTOR" | "DATACENTER" | "INDUSTRIAL";

export interface SectorContent {
  key: SectorKey;
  slug: string;
  name: string;
  shortName: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  image: string;
  imageAlt: string;
  intro: string[];
  types: { name: string; examples: string }[];
  /** Catalog shortcuts shown on the homepage and sector page. */
  supply: { label: string; href: string }[];
}

export const SECTORS: SectorContent[] = [
  {
    key: "SEMICONDUCTOR",
    slug: "semiconductor-equipment",
    name: "Semiconductor equipment",
    shortName: "Semiconductor",
    title: "Semiconductor equipment",
    metaTitle: "Semiconductor Equipment Supplier — Probers, ATE, Dicing & Bonding | Zuronix",
    metaDescription:
      "Zuronix supplies used and refurbished semiconductor equipment: wafer probers, ATE and final test, dicing and grinding, die attach and wire bonding, inspection, metrology and spare parts.",
    image: "/images/sector-semiconductor.jpg",
    imageAlt: "Probe needles testing a silicon wafer in semiconductor manufacturing",
    intro: [
      "Semiconductor tools carry long lead times and thin margins for error. A one-character difference in a model number, a missing option code, or an untested axis can make a tool unusable for your line — so we work the details before you commit.",
      "Tell us the tool, the configuration and your timeline. We verify specifications and availability, state the condition and exactly what was tested, and quote it as one offer from Zuronix: the tool, its documentation and the shipping.",
      "Decommissioning a line or closing a site? Send your tool list in confidence. We review it with you and agree how we take each tool to market.",
    ],
    types: [
      { name: "Wafer test & ATE", examples: "Advantest, Teradyne, LTX-Credence" },
      { name: "Probers & handlers", examples: "Accretech, Electroglas, Rasco, Cimetrix" },
      { name: "Dicing & grinding", examples: "DISCO, ADT, K&S" },
      { name: "Die attach & packaging", examples: "Besi Datacon, K&S, ASM Amicra" },
      { name: "Inspection & metrology", examples: "KLA, Hitachi, Camtek, Nova" },
      { name: "Spare parts", examples: "RF generators, MFCs, ESCs, robots, controllers" },
    ],
    supply: [
      { label: "Wafer probers", href: "/equipment?cat=prober" },
      { label: "ATE & final test", href: "/equipment?cat=ATE" },
      { label: "Dicing & grinding", href: "/equipment?cat=dicing" },
      { label: "Die attach & wire bonding", href: "/equipment?cat=bond%7Cdie" },
      { label: "Metrology & inspection", href: "/equipment?cat=metrology" },
    ],
  },
  {
    key: "DATACENTER",
    slug: "data-center-hardware",
    name: "Data center hardware",
    shortName: "Data center",
    title: "Data center hardware",
    metaTitle: "Data Center Hardware Supplier — GPUs, Servers, Networking & Memory | Zuronix",
    metaDescription:
      "Zuronix supplies data center hardware: NVIDIA GPUs and AI servers, Dell, HPE and Supermicro servers, InfiniBand and Ethernet networking, server memory and storage — new, refurbished and tested.",
    image: "/images/sector-datacenter.jpg",
    imageAlt: "Server racks in a modern data center aisle",
    intro: [
      "Data center hardware decisions come down to exact configurations: CPU stepping, memory population, drive type, firmware, and port counts. We treat configuration as the product, not an afterthought.",
      "Tell us the models, configurations and quantity. We verify what was tested and how, then quote the whole package from Zuronix — hardware, test evidence and freight.",
      "Decommissioning a cluster or a full site? Send us the asset list. We review it with you, agree what can be resold, and keep your serial numbers and data obligations private.",
    ],
    types: [
      { name: "AI accelerators & GPU servers", examples: "NVIDIA H100, A100, L40S; Dell XE, Supermicro HGX" },
      { name: "Rack & tower servers", examples: "Dell PowerEdge, HPE ProLiant, Supermicro" },
      { name: "Storage arrays & shelves", examples: "NetApp, Pure Storage, Dell EMC" },
      { name: "Networking & switching", examples: "NVIDIA/Mellanox InfiniBand, Cisco, Juniper, Arista" },
      { name: "Enterprise components", examples: "CPUs, memory, SSDs/HDDs, PSUs, NICs" },
      { name: "Racks & power", examples: "Racks, PDUs, UPS modules" },
    ],
    supply: [
      { label: "AI accelerators & GPUs", href: "/equipment?cat=GPU" },
      { label: "GPU & rack servers", href: "/equipment?cat=servers" },
      { label: "InfiniBand & Ethernet networking", href: "/equipment?cat=networking" },
      { label: "Server memory", href: "/equipment?cat=memory" },
    ],
  },
  {
    key: "INDUSTRIAL",
    slug: "industrial-machinery",
    name: "Industrial machinery",
    shortName: "Industrial",
    title: "Industrial machinery",
    metaTitle: "Industrial Machinery Supplier — CNC, Robots, Lasers & Power Equipment | Zuronix",
    metaDescription:
      "Zuronix supplies used and refurbished industrial machinery: CNC machining centers and lathes, industrial and collaborative robots, laser cutting, generators, transformers and compressors.",
    image: "/images/sector-industrial.jpg",
    imageAlt: "CNC milling machine spindle machining a metal part",
    intro: [
      "A machine that fits one plant can be wrong for another. Travels, spindle taper, control version, voltage, and tooling all decide whether a used machine is a bargain or a project. We check these before you spend.",
      "Send us the machine, the work it has to do and your floor constraints. We verify condition and history, tell you what was tested and what wasn't, and quote one clear offer with freight options.",
      "Idle machines, auxiliaries and whole plant lines: send the list once. We review it with you and agree how we take it to market — nothing is published without your approval.",
    ],
    types: [
      { name: "Machining centers & lathes", examples: "Haas, Mazak, Okuma, Doosan" },
      { name: "EDM & grinding", examples: "Makino, Sodick, Okamoto" },
      { name: "Inspection & metrology", examples: "Zeiss, Mitutoyo, Keyence, Faro" },
      { name: "Robotics", examples: "FANUC, Universal Robots, ABB, KUKA" },
      { name: "Laser & fabrication", examples: "TRUMPF, Amada, Bystronic" },
      { name: "Controls & automation", examples: "Fanuc, Siemens, Allen-Bradley PLCs and drives" },
      { name: "Power & plant support", examples: "Generators, transformers, compressors, chillers" },
    ],
    supply: [
      { label: "CNC machining centers & lathes", href: "/equipment?cat=CNC" },
      { label: "Industrial & collaborative robots", href: "/equipment?cat=robots" },
      { label: "Laser cutting", href: "/equipment?cat=laser" },
      { label: "Generators & transformers", href: "/equipment?cat=power" },
    ],
  },
];

// What a buyer can count on — used on the homepage, listings and FAQ.
// Every line here is a commitment the team must keep; edit with care.
export const BUYER_ASSURANCES = [
  {
    key: "seller",
    short: "One contract and invoice from a US company.",
    title: "You buy from Zuronix",
    body: "One quote, one contract, one invoice from a US company. Not a marketplace, not an introduction — we are the seller and stay accountable after delivery.",
  },
  {
    key: "verified",
    short: "Availability is re-checked and dated.",
    title: "Verified before we quote",
    body: "Model, configuration, condition and availability are checked before we price a unit. Every listing shows the date availability was last confirmed.",
  },
  {
    key: "documented",
    short: "Photos, serials and test results before you pay.",
    title: "See the actual unit",
    body: "Photos and serial numbers of the unit you are buying — and test results wherever a test applies — are shared before you pay.",
  },
  {
    key: "cover",
    short: "Warranty or DOA cover stated on every quote.",
    title: "Warranty terms in writing",
    body: "Every quote states the condition grade and the warranty or dead-on-arrival cover that applies, before you commit.",
  },
  {
    key: "logistics",
    short: "Freight and export paperwork arranged.",
    title: "Shipping and export handled",
    body: "Packing, crating and freight arranged door to door, with export paperwork and destination screening done for you.",
  },
  {
    key: "payment",
    short: "Bank wire to a US business account, details confirmed by phone.",
    title: "Safe payment",
    body: "Pay by bank wire to our US business account. We confirm payment details by phone and never change bank details by email.",
  },
] as const;

// Manufacturers whose equipment we supply (text only — no logos).
export const BRANDS = [
  "NVIDIA",
  "Dell",
  "HPE",
  "Supermicro",
  "Cisco",
  "Samsung",
  "Micron",
  "Intel",
  "Advantest",
  "Teradyne",
  "KLA",
  "DISCO",
  "Tokyo Electron",
  "Kulicke & Soffa",
  "FANUC",
  "Haas",
  "DMG MORI",
  "TRUMPF",
  "Universal Robots",
  "Caterpillar",
  "Atlas Copco",
];

export const BRAND_DISCLAIMER =
  "Brand names are trademarks of their owners. Zuronix is an independent supplier and is not affiliated with, or an authorized reseller of, these manufacturers unless stated on a listing.";

export function getSector(key: string): SectorContent | undefined {
  return SECTORS.find((s) => s.key === key);
}

export function getSectorBySlug(slug: string): SectorContent | undefined {
  return SECTORS.find((s) => s.slug === slug);
}

// Equipment condition vocabulary. `note` explains the claim's source.
export const CONDITIONS: Record<
  string,
  { label: string; tone: "positive" | "neutral" | "caution" }
> = {
  NEW: { label: "New / unused", tone: "positive" },
  USED_TESTED: { label: "Used — tested", tone: "positive" },
  USED_UNTESTED: { label: "Used — untested", tone: "neutral" },
  REFURBISHED: { label: "Refurbished", tone: "positive" },
  AS_IS: { label: "As-is, where-is", tone: "caution" },
  FOR_PARTS: { label: "For parts", tone: "caution" },
};

export function conditionLabel(key: string): string {
  return CONDITIONS[key]?.label ?? key;
}

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  SOURCING: "Sourcing request",
  SURPLUS_SINGLE: "Sell — single item",
  SURPLUS_LIST: "Sell — list",
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  IN_REVIEW: "In review",
  QUOTED: "Quoted",
  WON: "Won",
  CLOSED: "Closed",
};

export const REQUEST_STATUSES = ["NEW", "IN_REVIEW", "QUOTED", "WON", "CLOSED"];

// Demo listings are shown in this preview environment only.
// Set SHOW_SAMPLE_LISTINGS=false in .env to hide them for launch.
export function showSampleListings(): boolean {
  return process.env.SHOW_SAMPLE_LISTINGS !== "false";
}
