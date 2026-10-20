// Seeds the read-only `destinations` collection.
// Run from frontend/:  pnpm run seed:destinations
// Safe to re-run: existing destinations are updated, and their saveCount is never reset.
//
// Every feature listed for a destination has a researched detail and the URL it came
// from (checked Oct 2026). A feature is only listed when a source supports it.

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// Must match AccessibilityFeature in src/types/firestore.ts
const FEATURES = [
  'step-free-transport',
  'accessible-stays',
  'wheelchair-attractions',
  'accessible-toilets',
  'quiet-spaces',
]

const DEFAULT_NOTE =
  'Details researched from the linked sources in Oct 2026. Confirm with providers before travelling.'

// Sources (reused below)
const SRC = {
  melbourneAttractions:
    'https://whatson.melbourne.vic.gov.au/article/melbournes-wheelchair-friendly-attractions',
  melbourneVisitorHub:
    'https://whatson.melbourne.vic.gov.au/documents/Melbourne_Visitor_Hub_Accessibility_Guide.pdf',
  sydneyCity:
    'https://news.cityofsydney.nsw.gov.au/articles/disability-inclusive-things-to-do-in-sydney',
  sydneyAirport:
    'https://www.sydneyairport.com.au/community-hub/newquietroombringscalmbeforeflights',
  singaporeLta:
    'https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/a_better_public_transport_experience/an_inclusive_public_transport_system.html',
  changiCalmRoom:
    'https://www.futuretravelexperience.com/2025/10/changi-airport-launches-first-sensory-space-to-support-neurodivergent-travellers/',
  kualaLumpur: 'https://wheelchairtravel.org/kuala-lumpur/public-transportation',
  japanGov: 'https://gov-online.go.jp/eng/publicity/book/hlj/html/202103/202103_05_en.html',
  japanHotels:
    'https://www.accessible-japan.com/government-increasing-number-of-accessible-hotel-rooms-in-japan/',
  tfl: 'https://tfl.gov.uk/info-for/media/press-releases/2024/august/tfl-confirms-the-next-12-tube-stations-to-be-prioritised-for-step-free-access',
  londonGuide:
    'https://mandarinoriental.com/el-gr/mo-magazine/destinations/a-step-free-guide-to-accessible-london',
  tmb: 'https://www.tmb.cat/en/accessibilitat-i-mobilitat-reduida',
  translink:
    'https://www.translink.ca/-/media/translink/documents/rider-guide/transit-accessibility/access-transit/accessible-transit-in-metro-van-brochure.pdf',
  yvr: 'https://news.yvr.ca/accessible-travel-at-yvr-making-spirits-bright-for-everyone/',
  aucklandTrains:
    'https://at.govt.nz/bus-train-ferry/accessible-travel/train-accessibility-information',
  bvg: 'https://www.bvg.de/en/service-and-support/barrier-free-travel',
  copenhagen:
    'https://www.visitcopenhagen.com/copenhagen/planning/accessible-copenhagen/accessible-transportation',
  bali: 'https://bali.com/bali/travel-guide/wheelchair-accessible-travelling/',
}

// The key (e.g. 'melbourne-au') becomes the Firestore document ID.
const DESTINATIONS = {
  'melbourne-au': {
    name: 'Melbourne',
    region: 'Victoria',
    country: 'Australia',
    airportCode: 'MEL',
    airportName: 'Melbourne Airport',
    featureDetails: {
      'wheelchair-attractions': {
        text: 'Melbourne Museum has lifts, accessible toilets on all three levels and free wheelchairs (book ahead). NGV International has lift access to every floor.',
        sourceUrl: SRC.melbourneAttractions,
      },
      'accessible-toilets': {
        text: 'Adult Change Room with a ceiling hoist and shower at Melbourne Town Hall, next to the Visitor Hub (MLAK key from Security).',
        sourceUrl: SRC.melbourneVisitorHub,
      },
    },
    accessibilityNotes:
      'Only 29% of tram stops were level-access in March 2025 (Victorian Auditor-General), so plan tram trips around low-floor routes and level-access stops.',
  },
  'sydney-au': {
    name: 'Sydney',
    region: 'New South Wales',
    country: 'Australia',
    airportCode: 'SYD',
    airportName: 'Sydney Airport',
    featureDetails: {
      'wheelchair-attractions': {
        text: 'The Australian Museum offers full wheelchair and mobility-scooter access; the Australian National Maritime Museum has lift or ramp access to all exhibition spaces.',
        sourceUrl: SRC.sydneyCity,
      },
      'accessible-toilets': {
        text: 'Changing Places facilities at the Sydney Opera House (near the Box Office), the Australian Museum (level 2) and ICC Sydney (level 2).',
        sourceUrl: SRC.sydneyCity,
      },
      'quiet-spaces': {
        text: "Sydney Airport's T1 international terminal has a bookable, low-sensory Quiet Room developed with Autism Spectrum Australia.",
        sourceUrl: SRC.sydneyAirport,
      },
    },
  },
  'singapore-sg': {
    name: 'Singapore',
    region: 'City-state',
    country: 'Singapore',
    airportCode: 'SIN',
    airportName: 'Singapore Changi Airport',
    featureDetails: {
      'step-free-transport': {
        text: 'All public buses and trains are wheelchair accessible, and about 98% of bus stops are barrier-free.',
        sourceUrl: SRC.singaporeLta,
      },
      'quiet-spaces': {
        text: "Changi Airport's Calm Room (Terminal 2 departure transit area) is a 200 sqm space for neurodivergent travellers, including acoustically dampened private rooms.",
        sourceUrl: SRC.changiCalmRoom,
      },
    },
  },
  'kuala-lumpur-my': {
    name: 'Kuala Lumpur',
    region: 'Federal Territory of Kuala Lumpur',
    country: 'Malaysia',
    airportCode: 'KUL',
    airportName: 'Kuala Lumpur International Airport',
    featureDetails: {
      'step-free-transport': {
        text: 'All 48 stations on the Ampang and Kelana Jaya LRT lines have ramps and lifts, and the KLIA Ekspres airport train has level boarding at every station.',
        sourceUrl: SRC.kualaLumpur,
      },
    },
    accessibilityNotes:
      'The source does not cover MRT or monorail access; check station details before travelling.',
  },
  'tokyo-jp': {
    name: 'Tokyo',
    region: 'Tokyo Metropolis',
    country: 'Japan',
    airportCode: 'HND',
    airportName: 'Tokyo Haneda Airport',
    featureDetails: {
      'step-free-transport': {
        text: "91.8% of Japan's busier stations (3,000+ daily users) have lifts, slopes or other step-free routes (national figure, 2020).",
        sourceUrl: SRC.japanGov,
      },
      'accessible-toilets': {
        text: '88.5% of those busier stations have barrier-free toilets (national figure, 2020).',
        sourceUrl: SRC.japanGov,
      },
      'accessible-stays': {
        text: "Japan's Barrier-Free Law requires hotels with more than 50 rooms to have at least one accessible room; a 2018 revision proposed about 1% of rooms for new hotels.",
        sourceUrl: SRC.japanHotels,
      },
    },
    accessibilityNotes:
      'Station figures are national averages, not Tokyo-only. Confirm with providers before travelling.',
  },
  'london-gb': {
    name: 'London',
    region: 'England',
    country: 'United Kingdom',
    airportCode: 'LHR',
    airportName: 'London Heathrow Airport',
    featureDetails: {
      'step-free-transport': {
        text: 'More than a third of Underground stations are step-free (TfL, Aug 2024), with a target of half by 2030.',
        sourceUrl: SRC.tfl,
      },
      'wheelchair-attractions': {
        text: 'The V&A and Science Museum on curb-free Exhibition Road have step-free routes and lifts; the Science Museum has a Changing Places toilet.',
        sourceUrl: SRC.londonGuide,
      },
    },
    accessibilityNotes:
      'Most Tube stations still need stairs, so check TfL’s step-free map before planning a route.',
  },
  'barcelona-es': {
    name: 'Barcelona',
    region: 'Catalonia',
    country: 'Spain',
    airportCode: 'BCN',
    airportName: 'Barcelona–El Prat Airport',
    featureDetails: {
      'step-free-transport': {
        text: '153 of 165 metro stations (about 93%) are accessible, and every TMB bus has an access ramp.',
        sourceUrl: SRC.tmb,
      },
    },
  },
  'vancouver-ca': {
    name: 'Vancouver',
    region: 'British Columbia',
    country: 'Canada',
    airportCode: 'YVR',
    airportName: 'Vancouver International Airport',
    featureDetails: {
      'step-free-transport': {
        text: 'Every SkyTrain station has elevators between entrance and platform, and all TransLink buses have lifts or ramps.',
        sourceUrl: SRC.translink,
      },
      'accessible-toilets': {
        text: "YVR's International Terminal has an assisted change room with a height-adjustable bench, hoist and accessible toilet.",
        sourceUrl: SRC.yvr,
      },
      'quiet-spaces': {
        text: 'YVR has a Quiet Area at Gate D67 for travellers dealing with sensory overstimulation.',
        sourceUrl: SRC.yvr,
      },
    },
  },
  'auckland-nz': {
    name: 'Auckland',
    region: 'Auckland Region',
    country: 'New Zealand',
    airportCode: 'AKL',
    airportName: 'Auckland Airport',
    featureDetails: {
      'step-free-transport': {
        text: 'Electric trains have automatic boarding ramps at the central carriage doors; a few stations have steep ramps where you may need help.',
        sourceUrl: SRC.aucklandTrains,
      },
    },
    accessibilityNotes:
      'Auckland Airport supports the Sunflower lanyard for hidden disabilities; request one by email before you fly.',
  },
  'berlin-de': {
    name: 'Berlin',
    region: 'State of Berlin',
    country: 'Germany',
    airportCode: 'BER',
    airportName: 'Berlin Brandenburg Airport',
    featureDetails: {
      'step-free-transport': {
        text: '86% of U-Bahn stations are step-free, every BVG bus has been barrier-free since 2009, and all buses and trams carry ramps.',
        sourceUrl: SRC.bvg,
      },
    },
  },
  'copenhagen-dk': {
    name: 'Copenhagen',
    region: 'Capital Region of Denmark',
    country: 'Denmark',
    airportCode: 'CPH',
    airportName: 'Copenhagen Airport',
    featureDetails: {
      'step-free-transport': {
        text: 'Every metro station has a lift. City buses have a manual ramp at the middle door, but drivers cannot help you board.',
        sourceUrl: SRC.copenhagen,
      },
    },
  },
  'bali-id': {
    name: 'Bali',
    region: 'Bali Province',
    country: 'Indonesia',
    airportCode: 'DPS',
    airportName: 'I Gusti Ngurah Rai International Airport',
    featureDetails: {
      'accessible-stays': {
        text: 'Sanur and Nusa Dua are the most suitable areas for limited mobility, with wheelchair-friendly resorts such as The Laguna in Nusa Dua.',
        sourceUrl: SRC.bali,
      },
      'accessible-toilets': {
        text: 'The airport has accessible toilets, lifts and wheelchair assistance; arrange assistance with your airline in advance.',
        sourceUrl: SRC.bali,
      },
    },
    accessibilityNotes:
      'Bali has historically been hard to access (hilly terrain, temple stairs). Confirm each venue’s facilities before booking.',
  },
}

// 1. Check the data before touching the database
for (const [id, d] of Object.entries(DESTINATIONS)) {
  const problems = []
  const features = Object.keys(d.featureDetails)
  if (features.length === 0) problems.push('no features')
  for (const f of features) {
    if (!FEATURES.includes(f)) problems.push(`unknown feature "${f}"`)
    if (!d.featureDetails[f].text) problems.push(`"${f}" has no text`)
    if (!d.featureDetails[f].sourceUrl?.startsWith('https://'))
      problems.push(`"${f}" has no https source`)
  }
  if (!/^[A-Z]{3}$/.test(d.airportCode)) problems.push(`bad airport code "${d.airportCode}"`)
  if (problems.length > 0) {
    console.error(`${id}: ${problems.join('; ')}`)
    process.exit(1)
  }
}

// 2. Connect with the Admin SDK (same key the server uses)
const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64
if (!key) {
  console.error(
    'FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is not set. Run this from frontend/ via pnpm run seed:destinations'
  )
  process.exit(1)
}
initializeApp({ credential: cert(JSON.parse(Buffer.from(key, 'base64').toString('utf8'))) })
const db = getFirestore()

// 3. Write each destination: create if new, update if it already exists
let created = 0
let updated = 0
for (const [id, d] of Object.entries(DESTINATIONS)) {
  const ref = db.collection('destinations').doc(id)
  const snap = await ref.get()
  const fields = {
    name: d.name,
    region: d.region,
    country: d.country,
    airportCode: d.airportCode,
    airportName: d.airportName,
    // The feature list is derived from the details, so the two can never disagree
    accessibilityFeatures: FEATURES.filter((f) => f in d.featureDetails),
    featureDetails: d.featureDetails,
    accessibilityNotes: d.accessibilityNotes ?? DEFAULT_NOTE,
    updatedAt: FieldValue.serverTimestamp(),
    _schemaVersion: 2,
  }

  if (snap.exists) {
    await ref.update(fields) // saveCount and createdAt left untouched
    updated++
  } else {
    await ref.set({ ...fields, saveCount: 0, createdAt: FieldValue.serverTimestamp() })
    created++
  }
}

console.log(`Done: ${created} created, ${updated} updated`)
