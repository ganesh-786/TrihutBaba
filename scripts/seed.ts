/**
 * Seed script — populates a fresh Supabase Postgres with sample agriculture
 * products and categories so the storefront has content immediately.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/seed.ts
 */
import "dotenv/config";
import { db } from "../lib/db/client";
import { categories, products, productImages } from "../lib/db/schema";
import { slugify } from "../lib/utils";

async function main() {
  console.log("Seeding categories...");
  const cats = await db
    .insert(categories)
    .values([
      {
        slug: "seeds-grains",
        nameEn: "Seeds & Grains",
        nameNe: "बीउ र अन्न",
        descriptionEn: "Quality seeds for every season",
        descriptionNe: "हरेक मौसमको लागि गुणस्तरीय बीउ",
        sort: 1,
      },
      {
        slug: "fertilizers",
        nameEn: "Fertilizers",
        nameNe: "मलहरू",
        descriptionEn: "Organic and chemical fertilizers",
        descriptionNe: "जैविक र रासायनिक मल",
        sort: 2,
      },
      {
        slug: "hand-tools",
        nameEn: "Hand Tools",
        nameNe: "हातका औजार",
        descriptionEn: "Sickles, hoes, spades and more",
        descriptionNe: "हँसिया, कोदालो, फलाम्जस्ता औजार",
        sort: 3,
      },
      {
        slug: "machinery",
        nameEn: "Machinery",
        nameNe: "मेसिनरी",
        descriptionEn: "Tractors, pumps, threshers",
        descriptionNe: "ट्र्याक्टर, पम्प, थ्रेसर",
        sort: 4,
      },
      {
        slug: "pesticides",
        nameEn: "Pesticides",
        nameNe: "विषादी",
        descriptionEn: "Crop protection chemicals",
        descriptionNe: "बाली संरक्षण रसायन",
        sort: 5,
      },
      {
        slug: "irrigation",
        nameEn: "Irrigation",
        nameNe: "सिँचाइ",
        descriptionEn: "Drip pipes, sprinklers, water pumps",
        descriptionNe: "ड्रिप पाइप, स्प्रिंकलर, पानी पम्प",
        sort: 6,
      },
    ])
    .returning();

  const byName = (n: string) => cats.find((c) => c.nameEn === n)!.id;

  console.log("Seeding products...");
  const seedProducts = [
    {
      nameEn: "Hybrid Paddy Seed (5kg)",
      nameNe: "हाइब्रिड धानको बीउ (५ केजी)",
      shortEn: "High-yield hybrid paddy variety, suited for all regions of Nepal.",
      shortNe: "नेपालका सबै क्षेत्रका लागि उपयुक्त उच्च उत्पादन हाइब्रिड धान।",
      descEn:
        "Premium hybrid paddy seed engineered for high yield and disease resistance. Tested across Nepal's terai and hill regions. Each 5kg bag covers approximately 0.5 ropani.",
      descNe:
        "उच्च उत्पादन र रोग प्रतिरोधका लागि बनाइएको प्रिमियम हाइब्रिड धानको बीउ। नेपालका तराई र पहाडी क्षेत्रमा परीक्षण गरिएको। एक थैलाले ०.५ रोपनी क्षेत्र छोप्छ।",
      price: 850,
      compareAt: 950,
      stock: 120,
      sku: "SEED-PAD-5K",
      category: "Seeds & Grains",
      brand: "AgroNepal",
      featured: true,
      keywords: ["paddy", "rice seed", "hybrid", "धान", "बीउ", "Nepal agriculture"],
    },
    {
      nameEn: "Maize Seed Premium (2kg)",
      nameNe: "मकैको बीउ प्रिमियम (२ केजी)",
      shortEn: "Drought-tolerant maize variety with strong cob formation.",
      shortNe: "सुख्खा सहन सक्ने मजबुत मकै बीउ।",
      descEn: "Suitable for hill and terai regions; matures in 110-115 days.",
      descNe: "तराई र पहाडी क्षेत्रका लागि उपयुक्त; ११०-११५ दिनमा पाक्ने।",
      price: 380,
      stock: 200,
      sku: "SEED-MAZ-2K",
      category: "Seeds & Grains",
      featured: true,
      keywords: ["maize", "corn", "मकै", "seed"],
    },
    {
      nameEn: "Urea Fertilizer (50kg)",
      nameNe: "यूरिया मल (५० केजी)",
      shortEn: "High-nitrogen fertilizer for vigorous plant growth.",
      shortNe: "बलियो बिरुवा बढाउन उच्च नाइट्रोजनयुक्त मल।",
      descEn: "Standard 46% N urea fertilizer in 50kg bag.",
      descNe: "मानक ४६% नाइट्रोजनयुक्त यूरिया मल, ५० केजीको बोरामा।",
      price: 1850,
      stock: 80,
      sku: "FERT-URE-50K",
      category: "Fertilizers",
      featured: true,
      keywords: ["urea", "nitrogen", "मल", "fertilizer"],
    },
    {
      nameEn: "Organic Vermicompost (25kg)",
      nameNe: "जैविक भर्मीकम्पोस्ट (२५ केजी)",
      shortEn: "100% organic, made from earthworm-processed agricultural waste.",
      shortNe: "१००% जैविक, गँडेलाद्वारा प्रशोधित।",
      descEn:
        "Rich in N-P-K, micronutrients, and beneficial microbes. Improves soil structure and plant immunity.",
      descNe:
        "एन-पी-के, सूक्ष्म पोषक र फाइदाजनक सूक्ष्मजीवले भरपूर। माटोको संरचना र बिरुवाको प्रतिरक्षा सुधार्छ।",
      price: 950,
      stock: 60,
      sku: "FERT-VRM-25K",
      category: "Fertilizers",
      keywords: ["organic", "compost", "vermicompost", "जैविक मल"],
    },
    {
      nameEn: "Steel Sickle (Hasiya)",
      nameNe: "इस्पात हँसिया",
      shortEn: "Forged carbon-steel sickle with hardwood handle.",
      shortNe: "काठको बिँडसहितको कार्बन-स्टील हँसिया।",
      descEn:
        "Traditional Nepali sickle, forged from high-carbon steel for sharpness and durability.",
      descNe: "नेपाली परम्परागत हँसिया, टिकाउ र धारिलो।",
      price: 425,
      stock: 150,
      sku: "TOOL-SCK-01",
      category: "Hand Tools",
      featured: true,
      keywords: ["sickle", "हँसिया", "harvest tool"],
    },
    {
      nameEn: "Heavy Duty Spade (Belcha)",
      nameNe: "ठूलो बेल्चा",
      shortEn: "Wide-blade spade for digging, leveling, and earthworks.",
      shortNe: "खन्ने, सम्म पार्ने काम गर्न ठूलो ब्लेडको बेल्चा।",
      descEn: "Solid steel head with reinforced wooden shaft, 1.4m long.",
      descNe: "ठोस इस्पातको टाउको, १.४ मि. लामो काठको बिँड।",
      price: 1250,
      stock: 45,
      sku: "TOOL-SPD-01",
      category: "Hand Tools",
      keywords: ["spade", "बेल्चा", "shovel"],
    },
    {
      nameEn: "Knapsack Sprayer 16L",
      nameNe: "नापस्याक स्प्रेयर १६ लि.",
      shortEn: "Manual back-pack sprayer for pesticides and foliar feeds.",
      shortNe: "विषादी र पात मलका लागि म्यानुअल पिठ्यू स्प्रेयर।",
      descEn:
        "Sturdy 16-litre tank, brass nozzle, padded straps. Spare seals and lance included.",
      descNe: "१६ लिटरको टंकी, पित्तलको नोजल, गद्दीयुक्त पट्टा।",
      price: 2950,
      compareAt: 3400,
      stock: 35,
      sku: "MACH-SPR-16",
      category: "Machinery",
      featured: true,
      brand: "FarmKing",
      keywords: ["sprayer", "knapsack", "pesticide", "स्प्रेयर"],
    },
    {
      nameEn: "Mini Power Tiller 7HP",
      nameNe: "मिनी पावर टिलर ७HP",
      shortEn: "Compact 7HP diesel tiller for small to medium plots.",
      shortNe: "साना र मध्यम खेतका लागि कम्प्याक्ट ७HP डिजेल टिलर।",
      descEn:
        "Multi-attachment compatible: rotavator, plow, and trailer tow-bar. 1-year warranty.",
      descNe: "रोटाभेटर, हलो र ट्रेलर टो-बारसँग सुसंगत। १ वर्ष वारेन्टी।",
      price: 145000,
      stock: 5,
      sku: "MACH-TIL-7HP",
      category: "Machinery",
      brand: "Trihutbaba",
      keywords: ["tiller", "tractor", "ट्र्याक्टर", "power tiller"],
    },
    {
      nameEn: "Drip Irrigation Kit (1 Ropani)",
      nameNe: "ड्रिप सिँचाइ किट (१ रोपनी)",
      shortEn: "Complete drip irrigation kit covering 1 ropani of land.",
      shortNe: "१ रोपनी जमिनलाई पुग्ने पूर्ण ड्रिप सिँचाइ किट।",
      descEn:
        "Includes filter, mainline, drip pipes, emitters, fittings and pressure regulator.",
      descNe: "फिल्टर, मेन पाइप, ड्रिप पाइप, इमिटर, फिटिङ्स र प्रेसर रेगुलेटर समावेश।",
      price: 12500,
      stock: 12,
      sku: "IRR-DRP-1R",
      category: "Irrigation",
      keywords: ["drip", "irrigation", "सिँचाइ", "water saving"],
    },
    {
      nameEn: "Solar Water Pump 1HP",
      nameNe: "सोलार पानी पम्प १HP",
      shortEn: "Off-grid 1HP solar pump kit with panels and controller.",
      shortNe: "अफ-ग्रिड १HP सोलार पम्प, प्यानल र कन्ट्रोलर सहित।",
      descEn: "DC submersible pump, two 330W panels, MPPT controller.",
      descNe: "DC सबमर्सिबल पम्प, दुई ३३०W प्यानल, MPPT कन्ट्रोलर।",
      price: 75000,
      stock: 8,
      sku: "IRR-SOL-1HP",
      category: "Irrigation",
      keywords: ["solar pump", "irrigation", "renewable", "Nepal"],
    },
  ];

  for (const p of seedProducts) {
    const slug = slugify(p.nameEn);
    const [created] = await db
      .insert(products)
      .values({
        slug,
        nameEn: p.nameEn,
        nameNe: p.nameNe,
        shortDescriptionEn: p.shortEn,
        shortDescriptionNe: p.shortNe,
        descriptionEn: p.descEn,
        descriptionNe: p.descNe,
        priceNpr: String(p.price),
        compareAtPrice: p.compareAt ? String(p.compareAt) : null,
        stockQty: p.stock,
        sku: p.sku,
        categoryId: byName(p.category),
        brand: p.brand ?? null,
        status: "active",
        featured: !!p.featured,
        keywords: p.keywords,
        seoTitleEn: `${p.nameEn} — Buy online in Nepal | Trihutbaba`,
        seoDescriptionEn: p.shortEn,
        seoTitleNe: `${p.nameNe} — नेपालमा अनलाइन किन्नुहोस् | त्रिहुतबाबा`,
        seoDescriptionNe: p.shortNe,
      })
      .returning();
    await db.insert(productImages).values({
      productId: created.id,
      url: "/placeholder-product.svg",
      altEn: p.nameEn,
      altNe: p.nameNe,
      sort: 0,
    });
  }

  console.log("Done. Inserted", cats.length, "categories and", seedProducts.length, "products.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
