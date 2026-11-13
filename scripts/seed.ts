// Seed demo equipment listings for the preview environment.
// Every record is marked isSample=true; set SHOW_SAMPLE_LISTINGS=false
// (or unpublish rows) before launch and replace with real, approved assets.
// Run with: bun run scripts/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

type Spec = { label: string; value: string };

interface Item {
  slug: string;
  reference: string;
  manufacturer: string;
  model: string;
  partNumber?: string;
  sector: string;
  category: string;
  description: string;
  conditionKey: string;
  conditionNote: string;
  quantity: number;
  location: string;
  lastVerifiedAt: Date;
  priceType: string;
  price?: string;
  currency?: string;
  includesShipping?: boolean;
  testSummary?: string;
  specs: Spec[];
  image: string;
  imageCaption: string;
}

const items: Item[] = [
  {
    slug: "disco-dfd6361-dicing-saw",
    reference: "EQ-0001",
    manufacturer: "DISCO",
    model: "DFD6361",
    partNumber: "DFD6361-FS",
    sector: "SEMICONDUCTOR",
    category: "Dicing & grinding",
    description:
      "Fully automatic dicing saw for 6/8-inch wafers, two-chuck table configuration for continuous cut/load overlap. Removed from a production line during a tool consolidation and stored in a controlled warehouse. Full alignment and cut-quality report available to qualified buyers.",
    conditionKey: "USED_TESTED",
    conditionNote: "Condition per the owner's maintenance report, shared with us Oct 2026.",
    quantity: 1,
    location: "Hillsboro, OR, USA",
    lastVerifiedAt: new Date("2026-11-05T09:00:00-08:00"),
    priceType: "QUOTE",
    testSummary:
      "Powered on at the owner's site; spindle run and chuck motion verified by their maintenance team. Cut-quality test can be arranged before purchase.",
    specs: [
      { label: "Wafer size", value: "6 in / 8 in" },
      { label: "Spindle", value: "Air-bearing spindle, up to 60,000 rpm" },
      { label: "Chuck tables", value: "2 (cut / load overlap)" },
      { label: "Blade", value: "2-inch dicing blade" },
      { label: "Control", value: "DISCO factory control, English UI" },
      { label: "Power", value: "200 V 3-phase 50/60 Hz" },
    ],
    image: "/images/sample-dicing.jpg",
    imageCaption: "Representative photo of this tool type — not the actual asset.",
  },
  {
    slug: "accretech-uf3000-wafer-prober",
    reference: "EQ-0002",
    manufacturer: "Accretech",
    model: "UF3000",
    sector: "SEMICONDUCTOR",
    category: "Wafer test & probing",
    description:
      "300 mm fully automatic wafer prober with thermal chuck. Deinstalled by the original owner with cleanroom-standard procedures. Compatible with common ATE platforms; integration details and test history available on request.",
    conditionKey: "USED_TESTED",
    conditionNote: "Condition per the owner's deinstall checklist, Oct 2026.",
    quantity: 1,
    location: "Austin, TX, USA",
    lastVerifiedAt: new Date("2026-10-28T09:00:00-05:00"),
    priceType: "QUOTE",
    testSummary:
      "System self-test passed at deinstallation; prober card interface inspected. Thermal chuck performance verified to spec.",
    specs: [
      { label: "Wafer size", value: "300 mm" },
      { label: "Chuck", value: "Thermal chuck, -10 to 150 °C" },
      { label: "Alignment", value: "Automatic, off-axis microscope" },
      { label: "ATE interface", value: "Advantest / Teradyne interfaces available" },
      { label: "Footprint", value: "Glovebox-compatible, cleanroom ready" },
    ],
    image: "/images/sample-prober.jpg",
    imageCaption: "Representative photo of this tool type — not the actual asset.",
  },
  {
    slug: "besi-datacon-2200-evo-die-bonder",
    reference: "EQ-0003",
    manufacturer: "Besi",
    model: "Datacon 2200 EVO",
    sector: "SEMICONDUCTOR",
    category: "Assembly & packaging",
    description:
      "High-accuracy die bonder for advanced packaging applications, removed from an R&D line. Stored in ESD-safe packaging since removal. Sold as a complete system with standard feeders; options list available on request.",
    conditionKey: "USED_UNTESTED",
    conditionNote: "Owner reports the tool was operational at removal; not powered on since.",
    quantity: 1,
    location: "Chandler, AZ, USA",
    lastVerifiedAt: new Date("2026-10-20T09:00:00-07:00"),
    priceType: "QUOTE",
    testSummary: undefined,
    specs: [
      { label: "Placement accuracy", value: "±3.5 µm at 3σ" },
      { label: "Die size range", value: "0.25 × 0.25 mm to 50 × 50 mm" },
      { label: "Bond heads", value: "Configurable, 2 installed" },
      { label: "Substrates", value: "Strip and wafer handling" },
      { label: "Utilities", value: "CDA, vacuum, 200–240 V" },
    ],
    image: "/images/sample-diebonder.jpg",
    imageCaption: "Representative photo of this tool type — not the actual asset.",
  },
  {
    slug: "dell-poweredge-r740xd-12-units",
    reference: "EQ-0004",
    manufacturer: "Dell",
    model: "PowerEdge R740xd",
    partNumber: "R740XD-2U-24D",
    sector: "DATACENTER",
    category: "Rack servers",
    description:
      "Twelve identical R740xd nodes pulled from a single cluster decommission. Consistent configuration across all units; drives removed and destroyed by the owner. Per-unit testing completed before palletizing.",
    conditionKey: "USED_TESTED",
    conditionNote: "Tested by the equipment owner; results shared with us Nov 2026.",
    quantity: 12,
    location: "Quincy, WA, USA",
    lastVerifiedAt: new Date("2026-11-02T09:00:00-08:00"),
    priceType: "UNIT",
    price: "4850",
    currency: "USD",
    includesShipping: false,
    testSummary:
      "Each unit powered on, POST verified, iDRAC9 reachable and firmware inventoried. Memory and CPU verified against the config list. Drives not included.",
    specs: [
      { label: "CPU", value: "2 × Intel Xeon Gold 6248R (24C, 3.0 GHz)" },
      { label: "Memory", value: "384 GB DDR4-2933 (12 × 32 GB)" },
      { label: "Drive bays", value: "24 × 2.5-in SFF (drives removed)" },
      { label: "Power", value: "2 × 1100 W Titanium PSU" },
      { label: "Management", value: "iDRAC9 Enterprise" },
      { label: "Rails", value: "Included, ready-to-rack" },
    ],
    image: "/images/sample-server.jpg",
    imageCaption: "Representative photo — the lot is packed and palletized at the owner's site.",
  },
  {
    slug: "juniper-qfx5100-48s-6-units",
    reference: "EQ-0005",
    manufacturer: "Juniper",
    model: "QFX5100-48S",
    partNumber: "QFX5100-48S-6QSFP",
    sector: "DATACENTER",
    category: "Networking",
    description:
      "Six data center top-of-rack switches from a network refresh. Same EOS version across all units, factory-reset, with a clean config. Powers supplies and fans tested. Sold as one lot.",
    conditionKey: "USED_TESTED",
    conditionNote: "Tested by the owner's network team, Oct 2026.",
    quantity: 6,
    location: "Santa Clara, CA, USA",
    lastVerifiedAt: new Date("2026-10-24T09:00:00-07:00"),
    priceType: "LOT",
    price: "14500",
    currency: "USD",
    includesShipping: false,
    testSummary:
      "Each switch boots to the factory image, all 48 SFP+ ports link-tested in pairs, QSFP+ ports verified with loopback. PSUs redundant-tested.",
    specs: [
      { label: "Ports", value: "48 × 10G SFP+ / 4 × 40G QSFP+" },
      { label: "Throughput", value: "1.44 Tbps / 1.08 Bpps" },
      { label: "Latency", value: "~2 µs" },
      { label: "Software", value: "Junos 20.4R3, factory reset" },
      { label: "Power", value: "2 × 650 W AC PSU" },
    ],
    image: "/images/sample-switch.jpg",
    imageCaption: "Representative photo — not the actual lot.",
  },
  {
    slug: "haas-vf-2ss-2018",
    reference: "EQ-0006",
    manufacturer: "Haas",
    model: "VF-2SS",
    sector: "INDUSTRIAL",
    category: "CNC machining centers",
    description:
      "2018 VF-2SS vertical machining center with side-mount tool changer and high-speed spindle. Under power and inspectable under load in the owner's shop. Full service history from a single-owner facility.",
    conditionKey: "USED_TESTED",
    conditionNote: "Run-off test witnessed by our team, Oct 2026.",
    quantity: 1,
    location: "Portland, OR, USA",
    lastVerifiedAt: new Date("2026-11-07T09:00:00-08:00"),
    priceType: "QUOTE",
    testSummary:
      "Run-off under power: spindle run-out and axis backlash within Haas spec, tool changer cycled 50×, way covers and coolant system inspected. Service log available.",
    specs: [
      { label: "Travels X/Y/Z", value: "30 × 16 × 20 in" },
      { label: "Spindle", value: "12,000 rpm, CT40, direct drive" },
      { label: "Tool changer", value: "24+1 side-mount" },
      { label: "Table", value: "36 × 14 in, 1,200 lb capacity" },
      { label: "Control", value: "Haas NGC, 4th-axis ready" },
      { label: "Year", value: "2018" },
    ],
    image: "/images/sample-vmc.jpg",
    imageCaption: "Representative photo — not the actual machine.",
  },
  {
    slug: "mazak-qt-250-2015",
    reference: "EQ-0007",
    manufacturer: "Mazak",
    model: "QT-250",
    sector: "INDUSTRIAL",
    category: "CNC lathes",
    description:
      "2015 Mazak QT-250 turning center sold as-is from a facility closure. Spindle rotates under power; the machine has not been inspected or run off. Inspections can be arranged on site before an offer is accepted.",
    conditionKey: "AS_IS",
    conditionNote: "Sold as-is, where-is; no inspection performed yet.",
    quantity: 1,
    location: "Sacramento, CA, USA",
    lastVerifiedAt: new Date("2026-10-15T09:00:00-07:00"),
    priceType: "QUOTE",
    testSummary: "Power-on only: spindle and turret rotate. No accuracy or run-off test performed.",
    specs: [
      { label: "Swing", value: "20.8 in over bed" },
      { label: "Max turning length", value: "27.6 in" },
      { label: "Spindle bore", value: "3.5 in" },
      { label: "Turret", value: "12-station" },
      { label: "Control", value: "Mazatrol Smooth" },
      { label: "Year", value: "2015" },
    ],
    image: "/images/sample-lathe.jpg",
    imageCaption: "Representative photo — not the actual machine.",
  },
  {
    slug: "york-yvaa200-air-cooled-chiller",
    reference: "EQ-0008",
    manufacturer: "York (JCI)",
    model: "YVAA200",
    sector: "INDUSTRIAL",
    category: "Cooling & plant support",
    description:
      "200-ton air-cooled screw chiller, 2019, in service until September 2026. Refrigerant circuit pressure-tested at decommission; run-under-load witnessed by the owner's contractor. Rigging and freight quotes available on request.",
    conditionKey: "USED_TESTED",
    conditionNote: "Run-under-load witnessed by the owner's mechanical contractor, Sep 2026.",
    quantity: 1,
    location: "Boise, ID, USA",
    lastVerifiedAt: new Date("2026-10-30T09:00:00-06:00"),
    priceType: "QUOTE",
    testSummary:
      "Run under load for 2 hours at decommission: oil pressure, suction and discharge pressures within York operating envelope. Service records available.",
    specs: [
      { label: "Capacity", value: "200 tons nominal" },
      { label: "Compressor", value: "2 × screw compressors, R-134a" },
      { label: "Leaving water temp", value: "Down to 40 °F" },
      { label: "Voltage", value: "460 V 3-phase 60 Hz" },
      { label: "Year", value: "2019" },
    ],
    image: "/images/sample-chiller.jpg",
    imageCaption: "Representative photo — not the actual unit.",
  },
];

async function main() {
  for (const item of items) {
    const searchKey = norm(
      [item.manufacturer, item.model, item.partNumber, item.category].filter(Boolean).join(" ")
    );
    const { image, imageCaption, specs, ...rest } = item;
    await prisma.equipment.upsert({
      where: { slug: item.slug },
      update: {
        ...rest,
        specs: JSON.stringify(specs),
        image,
        imageCaption,
        searchKey,
        isPublished: true,
        isSample: true,
      },
      create: {
        ...rest,
        specs: JSON.stringify(specs),
        image,
        imageCaption,
        searchKey,
        isPublished: true,
        isSample: true,
      },
    });
    console.log(`seeded ${item.reference} — ${item.manufacturer} ${item.model}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
