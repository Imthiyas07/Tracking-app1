package com.tripshield.service;

import com.tripshield.model.*;
import com.tripshield.api.GeminiApiClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

/**
 * TripShield Business Service Layer (Service.java)
 * Contains custom core security algorithms, static country profile registries,
 * and handles dispatching contextual logs to the Gemini intelligence engine.
 */
@Service
public class TripShieldService {

    private final GeminiApiClient geminiClient;
    private final List<Country> countriesRegistry;

    @Autowired
    public TripShieldService(GeminiApiClient geminiClient) {
        this.geminiClient = geminiClient;
        this.countriesRegistry = new ArrayList<>();
        initializeRegistry();
    }

    /**
     * Initializes the tactical local profile datasets.
     * Keeps local fallbacks for emergencies when internet connectivity is degraded.
     */
    private void initializeRegistry() {
        // --- 1. India Profile ---
        Country india = new Country();
        india.setId("in");
        india.setName("India");
        india.setPolice("112");
        india.setAmbulance("112");
        india.setFire("112");
        india.setGeneral("112");
        india.setLanguage("English");
        india.setLocalHelpPhrase("Help me! (English is widely spoken across India)");
        india.setDangerLevel("Medium");
        india.setScams(Arrays.asList(
            "Fake tourism offices suggesting road closures",
            "Unregulated pre-paid taxis charging extra",
            "Spiked drinks in popular nightlife streets"
        ));
        
        List<SafeZone> inZones = new ArrayList<>();
        inZones.add(new SafeZone("sz-in-1", "Fortis Escorts Hospital", "Hospital", 28.5606, 77.2731, "Okhla Road, New Delhi", "011-42776222"));
        inZones.add(new SafeZone("sz-in-2", "Max Super Speciality Hospital", "Hospital", 28.5284, 77.2115, "Saket, New Delhi", "011-26515050"));
        inZones.add(new SafeZone("sz-in-3", "US Embassy New Delhi", "Embassy", 28.5912, 77.1895, "Shantipath, Chanakyapuri, New Delhi", "011-24198000"));
        india.setSafeZones(inZones);

        List<SafetyPhrase> inPhrases = new ArrayList<>();
        inPhrases.add(new SafetyPhrase("Please call the police", "Please call the police", "Please call the police"));
        inPhrases.add(new SafetyPhrase("I need help", "I need help", "I need help"));
        inPhrases.add(new SafetyPhrase("Where is the nearest hospital?", "Where is the nearest hospital?", "Where is the nearest hospital?"));
        inPhrases.add(new SafetyPhrase("Leave me alone", "Leave me alone", "Leave me alone"));
        india.setSafetyPhrases(inPhrases);
        countriesRegistry.add(india);

        // --- 2. Japan Profile ---
        Country japan = new Country();
        japan.setId("jp");
        japan.setName("Japan");
        japan.setPolice("110");
        japan.setAmbulance("119");
        japan.setFire("119");
        japan.setGeneral("110");
        japan.setLanguage("Japanese");
        japan.setLocalHelpPhrase("助けて！ (Tasukete! - Help me!)");
        japan.setDangerLevel("Low");
        japan.setScams(Arrays.asList(
            "Tauting/Catch bar overcharging in Kabukicho",
            "Spiked drinks in Roppongi entertainment districts",
            "Simulated photo-taking scams at crossings"
        ));

        List<SafeZone> jpZones = new ArrayList<>();
        jpZones.add(new SafeZone("sz-jp-1", "St. Luke's International Hospital", "Hospital", 35.6675, 139.7744, "9-1 Akashicho, Chuo City, Tokyo", "03-3541-5151"));
        jpZones.add(new SafeZone("sz-jp-2", "Tokyo Metropolitan Hiroo Hospital", "Hospital", 35.6471, 139.7214, "2-34-10 Ebisu, Shibuya City, Tokyo", "03-3444-1181"));
        jpZones.add(new SafeZone("sz-jp-3", "US Embassy Tokyo", "Embassy", 35.6713, 139.7425, "1-10-5 Akasaka, Minato City, Tokyo", "03-3224-5000"));
        japan.setSafeZones(jpZones);

        List<SafetyPhrase> jpPhrases = new ArrayList<>();
        jpPhrases.add(new SafetyPhrase("Please call the police", "警察を呼んでください", "Keisatsu o yonde kudasai"));
        jpPhrases.add(new SafetyPhrase("I need help", "助けてください", "Tasukete kudasai"));
        jpPhrases.add(new SafetyPhrase("Where is the nearest hospital?", "一番近い病院はどこですか？", "Ichiban chikai byoin wa doko desuka?"));
        jpPhrases.add(new SafetyPhrase("Leave me alone", "放っておいてください", "Hottokeite kudasai"));
        japan.setSafetyPhrases(jpPhrases);
        countriesRegistry.add(japan);

        // --- 3. Thailand Profile ---
        Country thailand = new Country();
        thailand.setId("th");
        thailand.setName("Thailand");
        thailand.setPolice("191");
        thailand.setAmbulance("1669");
        thailand.setFire("199");
        thailand.setGeneral("1155");
        thailand.setLanguage("Thai");
        thailand.setLocalHelpPhrase("ช่วยด้วย! (Chuay duay! - Help me!)");
        thailand.setDangerLevel("Medium");
        thailand.setScams(Arrays.asList(
            "Grand Palace closed scam with tuk-tuk diversion",
            "Jet ski rental damage extortion on beaches",
            "Inflated gems purchase schemes"
        ));

        List<SafeZone> thZones = new ArrayList<>();
        thZones.add(new SafeZone("sz-th-1", "Bumrungrad International Hospital", "Hospital", 13.7461, 100.5529, "33 Sukhumvit Soi 3, Bangkok", "02-066-8888"));
        thZones.add(new SafeZone("sz-th-2", "Bangkok Hospital", "Hospital", 13.7494, 100.5834, "2 Soi Soonvijai 7, New Petchburi Rd, Bangkok", "02-310-3000"));
        thZones.add(new SafeZone("sz-th-3", "US Embassy Bangkok", "Embassy", 13.7335, 100.5435, "120-122 Wireless Road, Bangkok", "02-205-4000"));
        thailand.setSafeZones(thZones);

        List<SafetyPhrase> thPhrases = new ArrayList<>();
        thPhrases.add(new SafetyPhrase("Please call the police", "กรุณาเรียกตำรวจ", "Karuna riak tam-ruat"));
        thPhrases.add(new SafetyPhrase("I need help", "ฉันต้องการความช่วยเหลือ", "Chan tong-kan khwam chuay-luea"));
        thPhrases.add(new SafetyPhrase("Where is the nearest hospital?", "โรงพยาบาลที่ใกล้ที่สุดอยู่ที่ไหน?", "Rong-phaya-ban thee klai thee-sut yoo thee-nhai?"));
        thPhrases.add(new SafetyPhrase("Leave me alone", "อย่ามายุ่งกับฉัน", "Yha ma yung kab chan"));
        thailand.setSafetyPhrases(thPhrases);
        countriesRegistry.add(thailand);
    }

    public List<Country> getCountriesList() {
        return countriesRegistry;
    }

    public Country getCountryDetails(String id) {
        return countriesRegistry.stream()
                .filter(c -> c.getId().equalsIgnoreCase(id))
                .findFirst()
                .orElse(null);
    }

    /**
     * Dispatches custom SOS protocols to Gemini, yielding translations and immediate actions.
     */
    public SosResponse processSosBroadcast(SosRequest request) {
        Country country = getCountryDetails(request.getCountryId());
        if (country == null) {
            return null;
        }

        String distressText = request.getDistressMessage() != null ? request.getDistressMessage() : "Unknown immediate distress";
        
        // Formulate intelligence prompt for Gemini AI
        String aiPrompt = String.format(
            "The user is in a critical emergency situation in %s. Coordinates: Lat %f, Lng %f.\n" +
            "User Distress Message: '%s'.\n" +
            "The national language of this country is %s.\n" +
            "Translate the user's distress message clearly into the primary local script, followed by romanized phonetic pronunciation.\n" +
            "Provide exactly 3 immediate, bulletproof tactical instructions in English for survival / escape in this country.",
            country.getName(), request.getLat(), request.getLng(), distressText, country.getLanguage()
        );

        String aiResult = geminiClient.queryGeminiModel(aiPrompt);
        
        // Parse results with bullet points as fallbacks if Gemini formatting varies
        String localTranslation = "EMERGENCY: NEED HELP";
        String romajiTranslation = "Tasukete kudasai";
        List<String> actions = new ArrayList<>();

        try {
            // Simplified parsing logic representing typical production extraction
            if (aiResult != null && aiResult.contains("\n")) {
                String[] lines = aiResult.split("\n");
                for (String line : lines) {
                    if (line.toLowerCase().contains("translation:") || line.contains("Local:")) {
                        localTranslation = line.substring(line.indexOf(":") + 1).trim();
                    } else if (line.toLowerCase().contains("phonetic") || line.contains("Romaji:")) {
                        romajiTranslation = line.substring(line.indexOf(":") + 1).trim();
                    } else if (line.startsWith("-") || line.startsWith("*") || Character.isDigit(line.charAt(0))) {
                        actions.add(line.replaceAll("^[-*\\d.\\s]+", "").trim());
                    }
                }
            }
        } catch (Exception e) {
            // Fallback actions
            actions.add("Seek high-ground or enter the nearest secure building.");
            actions.add("Prepare identification, and secure local communication lines.");
            actions.add("Proceed to coordinates of nearest Safe Zone/Embassy.");
        }

        if (actions.isEmpty()) {
            actions.add("Stay hidden inside a secure compound until law enforcement arrives.");
            actions.add("Silence your mobile phone, dim display light, and keep emergency contacts open.");
            actions.add("Identify key exits and establish fallback routes to the safe zones.");
        }

        // Mock SMS simulated dispatch to contacts
        List<String> contactsSent = new ArrayList<>();
        int contactCount = request.getContactCount() > 0 ? request.getContactCount() : 3;
        for (int i = 1; i <= contactCount; i++) {
            contactsSent.add("Emergency Guardian #" + i + " (+1-555-019" + i + ")");
        }

        SosResponse response = new SosResponse();
        response.setEmergencyId("SOS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        response.setTimestamp(Instant.now().toString());
        response.setLocalTranslation(localTranslation);
        response.setPhoneticTranslation(romajiTranslation);
        response.setTacticalSteps(actions);
        response.setSmsSentTo(contactsSent);
        response.setStatus("TRANSMITTED_VIA_INTELLIGENT_GATEWAY");

        return response;
    }

    /**
     * Invokes Gemini model to deliver regional tactical threat prevention advices.
     */
    public AdvisorResponse generateSafetyAdvice(AdvisorRequest request) {
        String aiPrompt = String.format(
            "Act as an Elite Security Advisor. Provide a precise security summary for travelers in %s, specifically the city %s.\n" +
            "Include local danger threats, common transit/financial scams, and specific de-escalation protocols for general tourists.\n" +
            "The traveler is asking: '%s'. Output the response structured as plain paragraphs with bullet points.",
            request.getCountryName(), request.getCity(), request.getQuery()
        );

        String advice = geminiClient.queryGeminiModel(aiPrompt);

        AdvisorResponse response = new AdvisorResponse();
        response.setRegion(request.getCountryName() + ", " + request.getCity());
        response.setAdvisoryText(advice);
        response.setGenerationTime(Instant.now().toString());
        return response;
    }

    /**
     * Real-time tactical threats advisor for ongoing suspicious encounters.
     */
    public SituationResponse analyzeSituation(SituationRequest request) {
        String aiPrompt = String.format(
            "TACTICAL THREAT ASSESSMENT REQUIRED IMMEDIATELY.\n" +
            "Context Location: %s\n" +
            "Reported Situation: '%s'\n" +
            "Formulate an instant threat mitigation strategy. Give exactly 4 sequential actionable guidelines " +
            "to safely extricate oneself, de-escalate, or evade the suspicious party without drawing conflict.",
            request.getCountryName(), request.getSituation()
        );

        String analysis = geminiClient.queryGeminiModel(aiPrompt);

        SituationResponse response = new SituationResponse();
        response.setThreatLevel("CALCULATING...");
        response.setProtocolSummary(analysis);
        response.setTimestamp(Instant.now().toString());
        return response;
    }
}
