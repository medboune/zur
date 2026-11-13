// Central site constants and content for Zuronix.
// Keep copy here so the team can edit text without touching components.

export const SITE = {
  name: "Zuronix",
  legalName: "Zuronix",
  tagline: "Industrial Equipment Sourcing & Surplus Sales",
  description:
    "Zuronix sources semiconductor, data center, and industrial equipment for buyers, and helps companies sell surplus equipment and assets. Based in Vancouver, Washington.",
  phone: "+1 360 822 0923",
  phoneHref: "+13608220923",
  email: "info@zuronix.com",
  address: {
    street: "4400 NE 77th Ave # 331",
    city: "Vancouver",
    state: "WA",
    zip: "98662-6829",
    country: "USA",
  },
  registration: "Registered in Washington State, USA",
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
}

export const SECTORS: SectorContent[] = [
  {
    key: "SEMICONDUCTOR",
    slug: "semiconductor-equipment",
    name: "Semiconductor equipment",
    shortName: "Semiconductor",
    title: "Semiconductor equipment",
    metaTitle: "Used Semiconductor Equipment Sourcing & Sales | Zuronix",
    metaDescription:
      "Sourcing and surplus sales for semiconductor manufacturing equipment: wafer test and ATE, probers, dicing and grinding, die attach, packaging, inspection, metrology, and spare parts.",
    image: "/images/sector-semiconductor.jpg",
    imageAlt: "Probe needles testing a silicon wafer in semiconductor manufacturing",
    intro: [
      "Semiconductor tools carry long lead times and thin margins for error. A one-character difference in a model number, a missing option code, or an untested axis can make a tool unusable for your line. We work the details before you commit.",
      "Send us the tool, the configuration you need, and your timeline. We confirm specifications and availability with the asset owner, state the condition and what was tested, and put everything into one offer you can act on.",
      "If you are decommissioning a line or closing a site, we can review your tool list confidentially and agree with you what can be marketed, and how.",
    ],
    types: [
      { name: "Wafer test & ATE", examples: "Advantest, Teradyne, LTX-Credence" },
      { name: "Probers & handlers", examples: "Accretech, Electroglas, Rasco, Cimetrix" },
      { name: "Dicing & grinding", examples: "DISCO, ADT, K&S" },
      { name: "Die attach & packaging", examples: "Besi Datacon, K&S, ASM Amicra" },
      { name: "Inspection & metrology", examples: "KLA, Hitachi, Camtek, Nova" },
      { name: "Spare parts", examples: "RF generators, MFCs, ESCs, robots, controllers" },
    ],
  },
  {
    key: "DATACENTER",
    slug: "data-center-hardware",
    name: "Data center hardware",
    shortName: "Data center",
    title: "Data center hardware",
    metaTitle: "Refurbished Servers, Storage & Networking Sourcing | Zuronix",
    metaDescription:
      "Sourcing and surplus sales for data center hardware: Dell, HPE and Supermicro servers, NetApp and Pure storage, Cisco, Juniper and Arista networking, plus enterprise components in volume.",
    image: "/images/sector-datacenter.jpg",
    imageAlt: "Server racks in a modern data center aisle",
    intro: [
      "Data center hardware decisions come down to exact configurations: CPU stepping, memory population, drive type, firmware, and port counts. We treat configuration as the product, not an afterthought.",
      "Tell us the models and configurations you need, and the quantity. We confirm what was tested, how it was tested, and where the equipment is located — then quote you the whole package, including freight options when required.",
      "Decommissioning a cluster or a full site? Send us the asset list. We review it with you, agree what can be sold, and keep your serial numbers and customer data obligations private.",
    ],
    types: [
      { name: "Rack & tower servers", examples: "Dell PowerEdge, HPE ProLiant, Supermicro" },
      { name: "Storage arrays & shelves", examples: "NetApp, Pure Storage, Dell EMC" },
      { name: "Networking & switching", examples: "Cisco, Juniper, Arista, Mellanox" },
      { name: "Enterprise components", examples: "CPUs, memory, SSDs/HDDs, PSUs, NICs" },
      { name: "Racks & power", examples: "Racks, PDUs, UPS modules" },
    ],
  },
  {
    key: "INDUSTRIAL",
    slug: "industrial-machinery",
    name: "Industrial machinery",
    shortName: "Industrial",
    title: "Industrial machinery",
    metaTitle: "Used Industrial Machinery & Plant Equipment Sourcing | Zuronix",
    metaDescription:
      "Sourcing and surplus sales for industrial machinery: CNC machining centers and lathes, EDM, CMMs and vision inspection, PLCs and drives, chillers, compressors, and plant support equipment.",
    image: "/images/sector-industrial.jpg",
    imageAlt: "CNC milling machine spindle machining a metal part",
    intro: [
      "A machine that fits one plant can be wrong for another. Travels, spindle taper, control version, voltage, and tooling all decide whether a used machine is a bargain or a project. We check these before you spend.",
      "Send us the machine, the work you need it to do, and your floor constraints. We confirm condition and history with the owner, tell you what was tested and what wasn't, and deliver one clear offer.",
      "Surplus machines, auxiliaries, and whole plant lines: send the list once. We review it with you and agree what can be marketed — nothing is published without your approval.",
    ],
    types: [
      { name: "Machining centers & lathes", examples: "Haas, Mazak, Okuma, Doosan" },
      { name: "EDM & grinding", examples: "Makino, Sodick, Okamoto" },
      { name: "Inspection & metrology", examples: "Zeiss, Mitutoyo, Keyence, Faro" },
      { name: "Controls & automation", examples: "Fanuc, Siemens, Allen-Bradley PLCs and drives" },
      { name: "Cooling & plant support", examples: "Chillers, compressors, generators, material handling" },
    ],
  },
];

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
  SURPLUS_SINGLE: "Surplus — single item",
  SURPLUS_LIST: "Surplus — list",
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
