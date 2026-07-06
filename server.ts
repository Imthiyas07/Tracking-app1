import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not configured or has default value. AI features will fallback to helpful offline templates.");
}

// -----------------------------------------------------------------------------
// Core Static TripShield Datasets
// -----------------------------------------------------------------------------
const COUNTRIES_DB = [
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
      { id: "sz-jp-3", name: "US Embassy Tokyo", type: "Embassy", lat: 35.6712, lng: 139.7424, address: "1-10-5 Akasaka, Minato City, Tokyo", phone: "03-3224-5000" },
      { id: "sz-jp-4", name: "Tokyo General Hospital", type: "Hospital", lat: 35.7198, lng: 139.7121, address: "3-43-11 Minami-Otsuka, Toshima City, Tokyo", phone: "03-3941-3211" }
    ],
    safetyPhrases: [
      { english: "Please call the police", local: "警察を呼んでください", romaji: "Keisatsu o yonde kudasai" },
      { english: "Where is the nearest hospital?", local: "一番近い病院はどこですか？", romaji: "Ichiban chikai byouin wa doko desu ka?" },
      { english: "I am lost", local: "道に迷いました", romaji: "Michi ni mayoimashita" },
      { english: "I need a doctor who speaks English", local: "英語が話せる医者がいります", romaji: "Eigo ga hanaseru isha ga irimasu" }
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
      { id: "sz-fr-3", name: "US Embassy Paris", type: "Embassy", lat: 48.8681, lng: 2.3217, address: "2 Avenue Gabriel, 75008 Paris", phone: "01 43 12 22 22" },
      { id: "sz-fr-4", name: "Hôpital Lariboisière", type: "Hospital", lat: 48.8829, lng: 2.3529, address: "2 Rue Ambroise Paré, 75010 Paris", phone: "01 49 95 65 65" }
    ],
    safetyPhrases: [
      { english: "Please call the police", local: "Appelez la police, s'il vous plaît", romaji: "Ah-pelle-ay lah poh-leece sil voo play" },
      { english: "I need help", local: "J'ai besoin d'aide", romaji: "Zhay buh-zwan ded" },
      { english: "Where is the hospital?", local: "Où est l'hôpital?", romaji: "Oo ay loh-pee-tahl" },
      { english: "Go away!", local: "Laissez-moi tranquille!", romaji: "Lay-say mwah trahn-keel" }
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
      { english: "Where is the nearest hospital?", local: "Where is the nearest hospital?", romaji: "Where is the nearest hospital?" },
      { english: "Leave me alone", local: "Leave me alone", romaji: "Leave me alone" }
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
      { english: "No, thank you (Very useful for touts)", local: "لا، شكراً", romaji: "La, shukran" },
      { english: "Help me", local: "ساعدني", romaji: "Sa-ed-ni" }
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
      { id: "sz-mx-1", name: "Hospital ABC Observatory", type: "Hospital", lat: 19.3989, lng: -99.2012, address: "Sur 136 No. 116, Las Americas, CDMX", phone: "55 5230 8000" },
      { id: "sz-mx-2", name: "Secretaría de Seguridad Ciudadana", type: "Police", lat: 19.4239, lng: -99.1624, address: "Liverpool 136, Juarez, CDMX", phone: "55 5242 5100" },
      { id: "sz-mx-3", name: "US Embassy Mexico City", type: "Embassy", lat: 19.4299, lng: -99.1685, address: "Paseo de la Reforma 305, Cuauhtemoc, CDMX", phone: "55 5080 2000" }
    ],
    safetyPhrases: [
      { english: "Call the police, please", local: "Llame a la policía, por favor", romaji: "Yah-meh ah lah poh-lee-see-ah por fah-vor" },
      { english: "Where is the emergency room?", local: "¿Dónde está la sala de emergencias?", romaji: "Don-deh ess-tah lah sah-lah deh eh-mer-hen-see-ahs" },
      { english: "Help me", local: "Ayúdeme", romaji: "Ah-yoo-deh-meh" },
      { english: "No interest, thanks", local: "No me interesa, gracias", romaji: "No meh een-teh-reh-sah grah-syas" }
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
      "CD/Mixtape pushers demanding forceful 'donations' in Times Square",
      "Unregulated rideshare drivers posing as legitimate airport shuttle services"
    ],
    safeZones: [
      { id: "sz-us-1", name: "NYU Langone Health Emergency Room", type: "Hospital", lat: 40.7423, lng: -73.9739, address: "550 1st Ave, New York, NY", phone: "+1 212-263-5555" },
      { id: "sz-us-2", name: "NYPD Midtown South Precinct", type: "Police", lat: 40.7516, lng: -73.9879, address: "357 W 35th St, New York, NY", phone: "+1 212-239-9811" },
      { id: "sz-us-3", name: "British Consulate General NY", type: "Embassy", lat: 40.7538, lng: -73.9681, address: "845 Third Ave, New York, NY", phone: "+1 212-745-0200" }
    ],
    safetyPhrases: [
      { english: "Please call 911", local: "Please call 911", romaji: "Please call nine-one-one" },
      { english: "I am feeling unsafe", local: "I am feeling unsafe", romaji: "I am feeling unsafe" },
      { english: "Where is the nearest subway station?", local: "Where is the nearest subway station?", romaji: "Where is the nearest subway station?" },
      { english: "Stay away from me", local: "Stay away from me", romaji: "Stay away from me" }
    ]
  }
];

// -----------------------------------------------------------------------------
// REST API Endpoints
// -----------------------------------------------------------------------------

// 1. Fetch all countries basic information (for selector)
app.get("/api/countries", (req, res) => {
  const list = COUNTRIES_DB.map((c) => ({
    id: c.id,
    name: c.name,
    capital: c.capital,
    police: c.police,
    ambulance: c.ambulance,
    fire: c.fire,
    general: c.general,
    language: c.language,
    localHelpPhrase: c.localHelpPhrase,
    dangerLevel: c.dangerLevel,
  }));
  res.json(list);
});

// 2. Fetch comprehensive data of a single country (including offline map markers, safezones, phrases)
app.get("/api/countries/:id", (req, res) => {
  const country = COUNTRIES_DB.find((c) => c.id === req.params.id.toLowerCase());
  if (!country) {
    return res.status(404).json({ error: "Country not supported in offline database yet." });
  }
  res.json(country);
});

// 3. Smart SOS distress translation and instructions (Calling Gemini API)
app.post("/api/sos/broadcast", async (req, res) => {
  const { countryId, distressMessage, lat, lng, contactCount } = req.body;
  const country = COUNTRIES_DB.find((c) => c.id === countryId);

  if (!country) {
    return res.status(404).json({ error: "Selected country not found." });
  }

  const userMessage = distressMessage || "Emergency: I need assistance immediately.";

  // If Gemini API is not initialized/configured, use simple local rule-based translation fallback
  if (!ai) {
    console.log("No Gemini API key, using local fallback translation engine");
    const fallbackTranslation = `[LOCAL ENGINE] Target Language: ${country.language}\n"${userMessage}" translated roughly to local tongue:\n"${country.localHelpPhrase}"`;
    return res.json({
      success: true,
      translatedMessage: fallbackTranslation,
      safetySteps: [
        "Find a safe, well-lit visual shield or indoor public zone immediately.",
        `Contact official local emergency services directly by dialing ${country.police} (Police) or ${country.ambulance} (Medical).`,
        `Your active GPS coordinates (${lat || "Unknown"}, ${lng || "Unknown"}) have been copied locally to clipboard.`
      ],
      phonetics: "Sah-ed-ni / Tasukete kudasai",
      simulatedSmsCount: contactCount || 2,
    });
  }

  try {
    const prompt = `You are the backend AI for TripShield, an emergency SOS companion.
The traveler is in ${country.name} (Local language: ${country.language}) at GPS coordinates (${lat || "Unknown Lat"}, ${lng || "Unknown Lng"}).
They sent an SOS distress message: "${userMessage}".

Perform the following tasks:
1. Translate their distress message accurately into ${country.language}. Ensure it sounds urgent, respectful, and extremely clear to a local bystander or first responder.
2. Formulate 3 immediate, high-priority safety instructions for the traveler based on their scenario. Make them short, punchy (maximum 15 words each), and highly actionable.
3. Provide a phonetic guide for the 2 most crucial phrases they might need to shout out loud (e.g. "I need a doctor" or "Fire") in ${country.language}.

Respond with a raw JSON object containing these exact keys:
{
  "translatedMessage": "translated string",
  "safetySteps": ["step 1", "step 2", "step 3"],
  "phonetics": "pronounced phonetics of crucial local phrase"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["translatedMessage", "safetySteps", "phonetics"],
          properties: {
            translatedMessage: { type: Type.STRING },
            safetySteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            phonetics: { type: Type.STRING },
          },
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      translatedMessage: data.translatedMessage,
      safetySteps: data.safetySteps,
      phonetics: data.phonetics,
      simulatedSmsCount: contactCount || 2,
    });
  } catch (error: any) {
    console.error("Gemini SOS translation error:", error);
    res.status(500).json({ error: "Failed to generate emergency translation from server." });
  }
});

// 4. Smart Advisor: Custom safety advice and translations (Calling Gemini API)
app.post("/api/safety/advisor", async (req, res) => {
  const { countryName, city, query } = req.body;

  if (!ai) {
    return res.json({
      fallback: true,
      text: `### TripShield Offline Advisor for ${city || countryName}
As you are currently offline or Gemini API is not fully configured, here are critical universal safety directives:
1. Always keep local police hotlines saved.
2. Do not show large amounts of cash in busy areas.
3. Keep emergency safe zones (embassies, general hospitals) bookmarked.
4. Download local maps on Google Maps or Mapbox for offline visual navigation.`,
    });
  }

  try {
    const prompt = `You are TripShield's Lead Travel Safety Advisor, a server-side AI that helps travelers anticipate risk.
The traveler is inquiring about safety conditions in: ${city || "general area"}, ${countryName}.
Their specific worry or query is: "${query || "What are the core safety risks and local tips here?"}".

Respond with a visually gorgeous and highly structured Markdown document containing:
- **Location Safety Score**: Provide a subjective risk score (Very Safe, Low Risk, Medium Risk, High Risk) with a 1-sentence justification.
- **Top 3 Local Scams**: Detail specific tricks (e.g., taxi scams, street tricks) unique to this location and how to spot them.
- **Dangerous Zones**: Highlight specific neighborhoods or situations travelers should strictly avoid in ${city || countryName}.
- **Tactical Safety Checklist**: Provide 4 tailored, actionable travel prep checklist items for this specific destination.
- **Essential Local Emergency Phrases**: Provide 2 emergency local-script phrases with their phonetics.

Make the response concise, realistic, helpful, and formatted beautifully in Markdown with bold titles, bullets, and short paragraphs. Avoid generic fluff. Do not use complex HTML tags.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini advisor error:", error);
    res.status(500).json({ error: "Safety advisor is temporarily offline. Please check your credentials." });
  }
});

// 5. Active Situation Scam/Risk Analyzer (Calling Gemini API)
app.post("/api/safety/analyze-situation", async (req, res) => {
  const { situation, countryName } = req.body;

  if (!ai) {
    return res.json({
      fallback: true,
      riskLevel: "Medium",
      guidance: [
        "Politely disengage from the situation immediately.",
        "Move into the nearest crowded public spot (cafe, hotel lobby, bank).",
        "Open your active map to locate the nearest police station or embassy.",
      ],
      escalateMessage: "I need to go. Please stop.",
    });
  }

  try {
    const prompt = `You are the Active Security Guard module for TripShield. A traveler is currently facing an active, potentially suspicious, or risky situation in ${countryName || "their current location"}.
Situation details: "${situation}"

Analyze this situation and output a JSON response containing:
1. "riskLevel": One word ('Low', 'Medium', 'High', 'Emergency')
2. "analysis": A 2-sentence summary explaining exactly what trick, scam, or danger is occurring here.
3. "escapeInstructions": An array of 3 rapid, immediate, step-by-step physical actions the traveler should take to protect themselves or escape.
4. "localPhraseToDeescalate": A powerful, simple phrase they can say in the local language to firmly shut down the perpetrator or request help, including its English translation and romaji/phonetic.

Respond with RAW JSON structure matching these exact keys:
{
  "riskLevel": "Low | Medium | High | Emergency",
  "analysis": "summary",
  "escapeInstructions": ["step 1", "step 2", "step 3"],
  "localPhraseToDeescalate": "phrase (phonetic) - meaning"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["riskLevel", "analysis", "escapeInstructions", "localPhraseToDeescalate"],
          properties: {
            riskLevel: { type: Type.STRING },
            analysis: { type: Type.STRING },
            escapeInstructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            localPhraseToDeescalate: { type: Type.STRING },
          },
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error) {
    console.error("Situation analyzer error:", error);
    res.status(500).json({ error: "Active analyzer failed. Please stay alert and head to a public zone." });
  }
});

// -----------------------------------------------------------------------------
// Vite Dev Server / Production Serving Setup
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite's asset-serving middlewares
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static files from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TripShield REST API & UI Webserver running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
