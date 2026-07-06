import { Country, Contact } from "./types";

export const DEFAULT_COUNTRIES: Country[] = [
  {
    id: "jp",
    name: "Japan",
    capital: "Tokyo",
    police: "110",
    ambulance: "119",
    fire: "119",
    general: "119",
    language: "Japanese",
    localHelpPhrase: "助けてください！ (Tasukete kudasai! - Help me!)",
    dangerLevel: "Low",
    scams: [
      "Overcharging in Roppongi/Kabukicho nightlife bars",
      "Fake taxi/touting outside major hubs at late night"
    ],
    safeZones: [
      { id: "sz-jp-1", name: "St. Luke's International Hospital", type: "Hospital", lat: 35.6681, lng: 139.7749, address: "9-1 Akashicho, Chuo City, Tokyo", phone: "03-3541-5151" },
      { id: "sz-jp-2", name: "Tokyo Metropolitan Police Dept", type: "Police", lat: 35.6769, lng: 139.7523, address: "2-1-1 Kasumigaseki, Chiyoda City, Tokyo", phone: "03-3581-4321" },
      { id: "sz-jp-3", name: "US Embassy Tokyo", type: "Embassy", lat: 35.6712, lng: 139.7424, address: "1-10-5 Akasaka, Minato City, Tokyo", phone: "03-3224-5000" }
    ],
    safetyPhrases: [
      { english: "Please call the police", local: "警察を呼んでください", romaji: "Keisatsu o yonde kudasai" },
      { english: "Where is the nearest hospital?", local: "一番近い病院はどこですか？", romaji: "Ichiban chikai byouin wa doko desu ka?" },
      { english: "I am lost", local: "道に迷いました", romaji: "Michi ni mayoimashita" }
    ]
  },
  {
    id: "fr",
    name: "France",
    capital: "Paris",
    police: "17",
    ambulance: "15",
    fire: "18",
    general: "112",
    language: "French",
    localHelpPhrase: "Aidez-moi, s'il vous plaît! (Help me, please!)",
    dangerLevel: "Medium",
    scams: [
      "Gold ring trick near Seine river",
      "Petition signature distractions near Eiffel Tower",
      "Pickpocket networks on Metro Line 1 & 9"
    ],
    safeZones: [
      { id: "sz-fr-1", name: "Hôpital Européen Georges-Pompidou", type: "Hospital", lat: 48.8394, lng: 2.2741, address: "20 Rue Leblanc, 75015 Paris", phone: "01 56 09 20 00" },
      { id: "sz-fr-2", name: "Police Headquarters (Préfecture)", type: "Police", lat: 48.8548, lng: 2.3458, address: "4 Boulevard du Palais, 75001 Paris", phone: "01 53 71 53 71" },
      { id: "sz-fr-3", name: "US Embassy Paris", type: "Embassy", lat: 48.8681, lng: 2.3217, address: "2 Avenue Gabriel, 75008 Paris", phone: "01 43 12 22 22" }
    ],
    safetyPhrases: [
      { english: "Please call the police", local: "Appelez la police, s'il vous plaît", romaji: "Ah-pelle-ay lah poh-leece" },
      { english: "I need help", local: "J'ai besoin d'aide", romaji: "Zhay buh-zwan ded" },
      { english: "Where is the hospital?", local: "Où est l'hôpital?", romaji: "Oo ay loh-pee-tahl" }
    ]
  },
  {
    id: "in",
    name: "India",
    capital: "New Delhi",
    police: "112",
    ambulance: "112",
    fire: "112",
    general: "112",
    language: "English",
    localHelpPhrase: "Help me! (English is widely spoken across India)",
    dangerLevel: "Medium",
    scams: [
      "Fake tourism offices suggesting road closures",
      "Overcharging auto-rickshaws without meter",
      "Sim card resellers offering invalid tourists cards"
    ],
    safeZones: [
      { id: "sz-in-1", name: "All India Institute of Medical Sciences (AIIMS)", type: "Hospital", lat: 28.5672, lng: 77.2100, address: "Ansari Nagar, New Delhi", phone: "011-26588500" },
      { id: "sz-in-2", name: "Connaught Place Police Station", type: "Police", lat: 28.6304, lng: 77.2177, address: "Connaught Place, New Delhi", phone: "011-23340050" },
      { id: "sz-in-3", name: "US Embassy New Delhi", type: "Embassy", lat: 28.5912, lng: 77.1895, address: "Shantipath, Chanakyapuri, New Delhi", phone: "011-24198000" }
    ],
    safetyPhrases: [
      { english: "Please call the police", local: "Please call the police", romaji: "Please call the police" },
      { english: "I need help", local: "I need help", romaji: "I need help" },
      { english: "Where is the nearest hospital?", local: "Where is the nearest hospital?", romaji: "Where is the nearest hospital?" }
    ]
  },
  {
    id: "eg",
    name: "Egypt",
    capital: "Cairo",
    police: "122",
    ambulance: "123",
    fire: "180",
    general: "122",
    language: "Arabic",
    localHelpPhrase: "ساعدوني! (Sa'edouni! - Help me!)",
    dangerLevel: "Medium",
    scams: [
      "Camel ride price extortion after mounting at Pyramids",
      "Forced gifts (perfumes, papyrus) followed by aggressive payment demands",
      "Unofficial guides pretending monuments are closed"
    ],
    safeZones: [
      { id: "sz-eg-1", name: "As-Salam International Hospital", type: "Hospital", lat: 29.9875, lng: 31.2321, address: "Corniche El Nile, Maadi, Cairo", phone: "19885" },
      { id: "sz-eg-2", name: "Tourist Police Office - Giza", type: "Police", lat: 29.9812, lng: 31.1345, address: "Pyramids Plateau Entrance, Giza", phone: "02-33831066" },
      { id: "sz-eg-3", name: "US Embassy Cairo", type: "Embassy", lat: 30.0411, lng: 31.2341, address: "5 Tawfik Diab Street, Garden City, Cairo", phone: "02-27973300" }
    ],
    safetyPhrases: [
      { english: "Please call the police", local: "اتصل بالشرطة من فضلك", romaji: "Ettesel bel shorta men fadlak" },
      { english: "I need to go to a hospital", local: "أريد الذهاب إلى المستشفى", romaji: "Areed el thahab ila el mostashfa" },
      { english: "No, thank you", local: "لا، شكراً", romaji: "La, shukran" }
    ]
  },
  {
    id: "mx",
    name: "Mexico",
    capital: "Mexico City",
    police: "911",
    ambulance: "911",
    fire: "911",
    general: "911",
    language: "Spanish",
    localHelpPhrase: "¡Ayuda, por favor! (Help, please!)",
    dangerLevel: "High",
    scams: [
      "Express kidnappings in unregistered street-hailed taxis",
      "Spiked drinks at nightclubs in tourist corridors",
      "Scam police officers demanding cash fines on-the-spot"
    ],
    safeZones: [
      { id: "sz-mx-1", name: "Hospital ABC Observatory", type: "Hospital", lat: 19.3989, lng: -99.2012, address: "Sur 136 No. 116, CDMX", phone: "55 5230 8000" },
      { id: "sz-mx-2", name: "Secretaría de Seguridad Ciudadana", type: "Police", lat: 19.4239, lng: -99.1624, address: "Liverpool 136, Juarez, CDMX", phone: "55 5242 5100" },
      { id: "sz-mx-3", name: "US Embassy Mexico City", type: "Embassy", lat: 19.4299, lng: -99.1685, address: "Paseo de la Reforma 305, CDMX", phone: "55 5080 2000" }
    ],
    safetyPhrases: [
      { english: "Call the police, please", local: "Llame a la policía, por favor", romaji: "Llame a la policia, por favor" },
      { english: "Where is the emergency room?", local: "¿Dónde está la sala de emergencias?", romaji: "Donde esta la sala de emergencias" },
      { english: "Help me", local: "Ayúdeme", romaji: "Ayudeme" }
    ]
  },
  {
    id: "us",
    name: "United States",
    capital: "Washington D.C.",
    police: "911",
    ambulance: "911",
    fire: "911",
    general: "911",
    language: "English",
    localHelpPhrase: "Help me!",
    dangerLevel: "Medium",
    scams: [
      "Pedicab overcharging scams in Central Park, NY",
      "CD/Mixtape pushers demanding forceful donations in Times Square"
    ],
    safeZones: [
      { id: "sz-us-1", name: "NYU Langone Health Emergency Room", type: "Hospital", lat: 40.7423, lng: -73.9739, address: "550 1st Ave, New York, NY", phone: "+1 212-263-5555" },
      { id: "sz-us-2", name: "NYPD Midtown South Precinct", type: "Police", lat: 40.7516, lng: -73.9879, address: "357 W 35th St, New York, NY", phone: "+1 212-239-9811" }
    ],
    safetyPhrases: [
      { english: "Please call 911", local: "Please call 911", romaji: "Please call nine-one-one" },
      { english: "I am feeling unsafe", local: "I am feeling unsafe", romaji: "I am feeling unsafe" }
    ]
  }
];

export const DEFAULT_CONTACTS: Contact[] = [
  { id: "c1", name: "Sarah Jenkins (Emergency Guardian)", relation: "Spouse", phone: "+1 (555) 019-2834", isSmsTarget: true },
  { id: "c2", name: "Robert Chen", relation: "Father", phone: "+1 (555) 048-1292", isSmsTarget: true },
  { id: "c3", name: "Global Travel Assist Hotline", relation: "Agency", phone: "+1 (800) 555-SAFE", isSmsTarget: false }
];

export const GENERAL_SAFETY_TIPS = [
  { title: "Shield Your Location", desc: "Never post live location tags on social media. Share coordinates exclusively with trusted emergency guardians." },
  { title: "Offline Navigation", desc: "Before leaving your hotel lobby, download local offline maps of your walking routes. Uncached maps are primary failure points." },
  { title: "Atmosphere Awareness", desc: "If you feel a localized tension shift, enter a secure hotel lobby or reputable bank instantly. Do not wait for validation." },
  { title: "Separate Cash Pools", desc: "Keep a primary small-denomination cash bundle in a front pocket for quick payments, and hide main cards/passports in an inner security pouch." }
];
