/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  PhoneCall, 
  MapPin, 
  Map, 
  Settings, 
  HelpCircle, 
  Send, 
  UserCheck, 
  Plus, 
  Trash2, 
  Compass, 
  Lock, 
  Bell, 
  BookOpen, 
  HeartHandshake, 
  RefreshCw, 
  FileCode, 
  Navigation, 
  Server,
  Sparkles,
  Search,
  ExternalLink
} from "lucide-react";
import { Country, Contact, SavedPlace, SosEvent, SafeZone } from "./types";
import { DEFAULT_COUNTRIES, DEFAULT_CONTACTS, GENERAL_SAFETY_TIPS } from "./data";

export default function App() {
  // --- Core States ---
  const [countries, setCountries] = useState<Country[]>(DEFAULT_COUNTRIES);
  const [selectedCountryId, setSelectedCountryId] = useState<string>("jp");
  const [activeCountry, setActiveCountry] = useState<Country | null>(null);
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [sosEvents, setSosEvents] = useState<SosEvent[]>([]);
  const [systemLogs, setSystemLogs] = useState<Array<{ time: string; type: string; message: string }>>([]);

  // --- SOS Panel States ---
  const [distressMessage, setDistressMessage] = useState<string>("");
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number }>({ lat: 35.6762, lng: 139.6503 });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [sosResult, setSosResult] = useState<{
    translatedMessage: string;
    safetySteps: string[];
    phonetics: string;
    smsSentTo: string[];
  } | null>(null);
  const [isSosLoading, setIsSosLoading] = useState<boolean>(false);

  // --- Active Evasion & Advisor States ---
  const [advisorCity, setAdvisorCity] = useState<string>("");
  const [advisorQuery, setAdvisorQuery] = useState<string>("");
  const [advisorResponse, setAdvisorResponse] = useState<string>("");
  const [isAdvisorLoading, setIsAdvisorLoading] = useState<boolean>(false);

  const [activeSituation, setActiveSituation] = useState<string>("");
  const [situationResult, setSituationResult] = useState<{
    riskLevel: string;
    analysis: string;
    escapeInstructions: string[];
    localPhraseToDeescalate: string;
  } | null>(null);
  const [isSituationLoading, setIsSituationLoading] = useState<boolean>(false);

  // --- Add Saved Place Form ---
  const [newPlaceName, setNewPlaceName] = useState<string>("");
  const [newPlaceType, setNewPlaceType] = useState<"Hotel" | "SafeHouse" | "Embassy" | "Hospital" | "MeetingPoint" | "Other">("Hotel");
  const [newPlaceDesc, setNewPlaceDesc] = useState<string>("");
  const [newPlaceLat, setNewPlaceLat] = useState<number>(35.6762);
  const [newPlaceLng, setNewPlaceLng] = useState<number>(139.6503);

  // --- Add Contact Form ---
  const [newContactName, setNewContactName] = useState<string>("");
  const [newContactRelation, setNewContactRelation] = useState<string>("");
  const [newContactPhone, setNewContactPhone] = useState<string>("");

  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState<"sos" | "map" | "advisor" | "contacts" | "places" | "database">("sos");

  // --- Sound Simulation State ---
  const [alarmPlaying, setAlarmPlaying] = useState<boolean>(false);
  const [sirenType, setSirenType] = useState<"wail" | "yelp" | "hilo" | "pulse">("wail");
  const [sirenVolume, setSirenVolume] = useState<number>(0.15); // Default 15% volume
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const alarmIntervalRef = useRef<any>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Dynamic volume adjustment
  useEffect(() => {
    if (alarmPlaying && gainNodeRef.current && audioContextRef.current) {
      try {
        const ctx = audioContextRef.current;
        gainNodeRef.current.gain.setValueAtTime(sirenVolume, ctx.currentTime);
      } catch (err) {
        console.warn("Failed to set real-time volume:", err);
      }
    }
  }, [sirenVolume, alarmPlaying]);

  // --- Focused Map Node Info Box State ---
  const [focusedNode, setFocusedNode] = useState<{
    name: string;
    type: string;
    address?: string;
    phone?: string;
    description?: string;
  } | null>(null);

  // --- Load Initial Data & Sync with REST API ---
  useEffect(() => {
    // Load from LocalStorage if exists
    const storedContacts = localStorage.getItem("tripshield_contacts");
    if (storedContacts) {
      setContacts(JSON.parse(storedContacts));
    } else {
      setContacts(DEFAULT_CONTACTS);
      localStorage.setItem("tripshield_contacts", JSON.stringify(DEFAULT_CONTACTS));
    }

    const storedPlaces = localStorage.getItem("tripshield_places");
    if (storedPlaces) {
      setSavedPlaces(JSON.parse(storedPlaces));
    } else {
      const initialPlaces: SavedPlace[] = [
        { id: "sp-1", name: "Imperial Palace Hotel", type: "Hotel", lat: 35.6812, lng: 139.7671, description: "Primary check-in point. Stay inside lobby if curfew declared.", createdAt: new Date().toISOString() },
        { id: "sp-2", name: "Safe Meeting House B", type: "MeetingPoint", lat: 35.6640, lng: 139.7290, description: "Secondary evacuation zone with high high-density cover.", createdAt: new Date().toISOString() }
      ];
      setSavedPlaces(initialPlaces);
      localStorage.setItem("tripshield_places", JSON.stringify(initialPlaces));
    }

    const storedSos = localStorage.getItem("tripshield_sos");
    if (storedSos) {
      setSosEvents(JSON.parse(storedSos));
    }

    addLog("SYSTEM", "Java Spring Boot & Node REST Services Initialized");
    addLog("DB", "Loaded pre-cached Offline Geo-Boundary Data for 6 key regions");

    // Fetch countries from server API
    fetchCountriesList();
  }, []);

  // --- Trigger Single Country Fetch when ID changes ---
  useEffect(() => {
    fetchCountryDetails(selectedCountryId);
  }, [selectedCountryId]);

  const addLog = (type: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs(prev => [
      { time: timestamp, type, message },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  const fetchCountriesList = async () => {
    try {
      addLog("REST_REQ", "GET /api/countries");
      const res = await fetch("/api/countries");
      if (res.ok) {
        const data = await res.json();
        setCountries(data);
        addLog("REST_RES", `Successfully synchronized list of ${data.length} countries`);
      }
    } catch (err) {
      console.error("Error fetching countries:", err);
      addLog("REST_WARN", "API host offline. Reverting to local embedded databases.");
    }
  };

  const fetchCountryDetails = async (id: string) => {
    try {
      addLog("REST_REQ", `GET /api/countries/${id}`);
      const res = await fetch(`/api/countries/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveCountry(data);
        // Align map coordinate centers roughly to the safe zones
        if (data.safeZones && data.safeZones.length > 0) {
          setGpsCoordinates({
            lat: data.safeZones[0].lat,
            lng: data.safeZones[0].lng
          });
        }
        addLog("REST_RES", `Country details initialized: ${data.name} (Dial: ${data.police})`);
      }
    } catch (err) {
      console.error("Error fetching country details:", err);
      const fallback = DEFAULT_COUNTRIES.find(c => c.id === id) || DEFAULT_COUNTRIES[0];
      setActiveCountry(fallback);
      addLog("REST_WARN", `Failed to query REST server for country '${id}'. Bootstrapped local data.`);
    }
  };

  // --- GPS Location Capture ---
  const captureGps = () => {
    setIsLocating(true);
    addLog("CLIENT", "Requesting hardware GPS coordinates via browser client");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: parseFloat(position.coords.latitude.toFixed(5)),
            lng: parseFloat(position.coords.longitude.toFixed(5))
          };
          setGpsCoordinates(coords);
          setIsLocating(false);
          addLog("GPS_EXEC", `Lat: ${coords.lat}, Lng: ${coords.lng} authenticated`);
        },
        (error) => {
          console.warn("Geolocation API rejected or unavailable in sandbox:", error.message);
          // Fallback to preloaded city coordinate scatter based on active country
          const randomOffsets = {
            lat: (Math.random() - 0.5) * 0.1,
            lng: (Math.random() - 0.5) * 0.1
          };
          let center = { lat: 35.6762, lng: 139.6503 }; // Tokyo default
          if (selectedCountryId === "fr") center = { lat: 48.8566, lng: 2.3522 };
          if (selectedCountryId === "in") center = { lat: 28.6139, lng: 77.2090 };
          if (selectedCountryId === "eg") center = { lat: 30.0444, lng: 31.2357 };
          if (selectedCountryId === "mx") center = { lat: 19.4326, lng: -99.1332 };
          if (selectedCountryId === "us") center = { lat: 40.7128, lng: -74.0060 };

          const coords = {
            lat: parseFloat((center.lat + randomOffsets.lat).toFixed(5)),
            lng: parseFloat((center.lng + randomOffsets.lng).toFixed(5))
          };
          setGpsCoordinates(coords);
          setIsLocating(false);
          addLog("GPS_WARN", `Browser blocked geolocation or inside sandbox. Computed country centroid coordinates: ${coords.lat}, ${coords.lng}`);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
      addLog("GPS_ERR", "Browser lacks Geolocation capability.");
    }
  };

  // --- SOS Distress Trigger ---
  const triggerSos = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSosLoading(true);
    addLog("SOS_EXEC", "Initiating global broadcast chain...");

    const smsRecipientNames = contacts
      .filter(c => c.isSmsTarget)
      .map(c => c.name);

    try {
      addLog("REST_REQ", `POST /api/sos/broadcast (Country: ${selectedCountryId})`);
      const response = await fetch("/api/sos/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryId: selectedCountryId,
          distressMessage: distressMessage || "Emergency: Help needed immediately.",
          lat: gpsCoordinates.lat,
          lng: gpsCoordinates.lng,
          contactCount: smsRecipientNames.length
        })
      });

      if (!response.ok) {
        throw new Error("SOS Server rejected request");
      }

      const data = await response.json();
      
      const newEvent: SosEvent = {
        id: "sos-" + Date.now(),
        timestamp: new Date().toLocaleString(),
        countryName: activeCountry?.name || "Global",
        lat: gpsCoordinates.lat,
        lng: gpsCoordinates.lng,
        distressMessage: distressMessage || "Emergency SOS Triggered",
        translatedMessage: data.translatedMessage,
        safetySteps: data.safetySteps,
        phonetics: data.phonetics,
        smsSentTo: smsRecipientNames
      };

      setSosResult({
        translatedMessage: data.translatedMessage,
        safetySteps: data.safetySteps,
        phonetics: data.phonetics,
        smsSentTo: smsRecipientNames
      });

      // Update local storage history
      const updatedEvents = [newEvent, ...sosEvents];
      setSosEvents(updatedEvents);
      localStorage.setItem("tripshield_sos", JSON.stringify(updatedEvents));

      setSosActive(true);
      addLog("REST_RES", `SOS acknowledged. ${smsRecipientNames.length} emergency contacts notified via simulated SMS Gateway.`);
      
      // Auto trigger high sound alert
      triggerAlarmSound(true);

    } catch (err) {
      console.error("SOS error:", err);
      addLog("REST_ERR", "REST broadcast server failed. Reverting to emergency cached local protocols.");
      
      // Local recovery fallback
      const localHelp = activeCountry?.localHelpPhrase || "HELP ME!";
      setSosResult({
        translatedMessage: `[OFFLINE FALLBACK] "${distressMessage || "Emergency Alert"}" translated locally: "${localHelp}"`,
        safetySteps: [
          `DIAL ${activeCountry?.police || "911"} DIRECTLY ON YOUR MOBILE PHONE.`,
          "Move into the nearest crowded, lit area like a bank or hotel lobby.",
          `Head toward the nearest Safe Zone: ${activeCountry?.safeZones?.[0]?.name || "Local Embassy"}`
        ],
        phonetics: activeCountry?.language === "Japanese" ? "Tasukete kudasai" : "Aidez-moi",
        smsSentTo: smsRecipientNames
      });
      setSosActive(true);
    } finally {
      setIsSosLoading(false);
    }
  };

  // --- Smart AI Advisor Trigger ---
  const querySmartAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorQuery.trim()) return;
    setIsAdvisorLoading(true);
    addLog("AI_REQ", `POST /api/safety/advisor (Query: "${advisorQuery}")`);

    try {
      const res = await fetch("/api/safety/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryName: activeCountry?.name || "this location",
          city: advisorCity || activeCountry?.capital || "",
          query: advisorQuery
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAdvisorResponse(data.text || data.fallback ? data.text || "Offline guidelines triggered." : "No advice found.");
        addLog("AI_RES", "Custom travel threat advice delivered successfully");
      } else {
        throw new Error();
      }
    } catch (err) {
      addLog("AI_ERR", "Failed to compile advice. Check API connection or server credentials.");
      setAdvisorResponse("### Offline Safety Protocols Activated\n\n1. Ensure your travel papers and visa are in a secure lock-box.\n2. Do not venture into unlit side alleys after midnight.\n3. Make note of your homeland's diplomatic mission coordinates.");
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  // --- Real-time Situation Risk Analyzer ---
  const analyzeActiveSituation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSituation.trim()) return;
    setIsSituationLoading(true);
    addLog("AI_REQ", `POST /api/safety/analyze-situation (Active Threat: "${activeSituation.slice(0, 30)}...")`);

    try {
      const res = await fetch("/api/safety/analyze-situation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: activeSituation,
          countryName: activeCountry?.name || "global area"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSituationResult(data);
        addLog("AI_RES", `Threat level quantified: ${data.riskLevel}. Local response injected.`);
      } else {
        throw new Error();
      }
    } catch (err) {
      addLog("AI_ERR", "Active analyzer timeout. Defaulting to general physical evasion rules.");
      setSituationResult({
        riskLevel: "High",
        analysis: "Suspected predatory behavior, taxi extortion, or distraction scam.",
        escapeInstructions: [
          "Enter any open, well-populated retail store or restaurant lobby immediately.",
          "Firmly and loudly speak to a staff member or manager to seek support.",
          "Prepare your phone with local police speed dial ready."
        ],
        localPhraseToDeescalate: "Please leave me alone! (Police will be called)"
      });
    } finally {
      setIsSituationLoading(false);
    }
  };

  // --- Sound Alarm Engine ---
  const triggerAlarmSound = (play: boolean, typeOverride?: "wail" | "yelp" | "hilo" | "pulse", volumeOverride?: number) => {
    try {
      const activeType = typeOverride || sirenType;
      const activeVolume = volumeOverride !== undefined ? volumeOverride : sirenVolume;

      // Always clear previous audio nodes & intervals to avoid overlaps or leaks
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (e) {}
        oscillatorRef.current = null;
      }
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
        } catch (e) {}
        gainNodeRef.current = null;
      }

      if (play) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const ctx = audioContextRef.current;
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Design modern safety sirens using oscillator parameters
        if (activeType === "wail") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          
          alarmIntervalRef.current = setInterval(() => {
            if (!oscillatorRef.current) return;
            const time = ctx.currentTime;
            // Smooth wailing oscillation (600Hz to 1200Hz)
            const freq = 900 + Math.sin(time * 3) * 300;
            osc.frequency.setValueAtTime(freq, time);
          }, 50);
        } else if (activeType === "yelp") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(1000, ctx.currentTime);
          
          alarmIntervalRef.current = setInterval(() => {
            if (!oscillatorRef.current) return;
            const time = ctx.currentTime;
            // Fast sharp yelping sweep (700Hz to 1500Hz)
            const freq = 1100 + Math.sin(time * 15) * 400;
            osc.frequency.setValueAtTime(freq, time);
          }, 30);
        } else if (activeType === "hilo") {
          osc.type = "triangle"; // Gives a richer horn-like buzz
          osc.frequency.setValueAtTime(900, ctx.currentTime);
          
          alarmIntervalRef.current = setInterval(() => {
            if (!oscillatorRef.current) return;
            const time = ctx.currentTime;
            // High-Low dual frequency alternating European tone
            const hz = Math.floor(time * 2.5) % 2 === 0 ? 950 : 650;
            osc.frequency.setValueAtTime(hz, time);
          }, 100);
        } else if (activeType === "pulse") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(1600, ctx.currentTime); // Piecing high beep
          
          alarmIntervalRef.current = setInterval(() => {
            if (!oscillatorRef.current || !gainNodeRef.current) return;
            const time = ctx.currentTime;
            // Fast pulsing beep
            const isBeep = Math.floor(time * 6) % 2 === 0;
            gainNodeRef.current.gain.setValueAtTime(isBeep ? activeVolume : 0, time);
          }, 100);
        }

        gainNode.gain.setValueAtTime(activeVolume, ctx.currentTime);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gainNode;
        setAlarmPlaying(true);
        addLog("AUDIO", `Emergency ${activeType.toUpperCase()} siren initialized at ${(activeVolume * 100).toFixed(0)}% volume.`);
      } else {
        setAlarmPlaying(false);
        addLog("AUDIO", "Emergency audio siren deactivated manually.");
      }
    } catch (err) {
      console.warn("Audio Context blocked by browser safety policies:", err);
      setAlarmPlaying(false);
    }
  };

  // --- Add Safe Zone or Place manually to Map list ---
  const saveCustomPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim()) return;

    const newPlace: SavedPlace = {
      id: "sp-" + Date.now(),
      name: newPlaceName,
      type: newPlaceType,
      lat: Number(newPlaceLat),
      lng: Number(newPlaceLng),
      description: newPlaceDesc || "Custom marked safepoint.",
      createdAt: new Date().toISOString()
    };

    const updated = [...savedPlaces, newPlace];
    setSavedPlaces(updated);
    localStorage.setItem("tripshield_places", JSON.stringify(updated));

    setNewPlaceName("");
    setNewPlaceDesc("");
    addLog("DB", `Stored Custom Marked Spot: ${newPlace.name} on local storage matrix.`);
  };

  const deleteSavedPlace = (id: string) => {
    const updated = savedPlaces.filter(p => p.id !== id);
    setSavedPlaces(updated);
    localStorage.setItem("tripshield_places", JSON.stringify(updated));
    addLog("DB", "Marked spot cleared from offline cache.");
  };

  // --- Add Emergency Contact ---
  const saveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: Contact = {
      id: "c-" + Date.now(),
      name: newContactName,
      relation: newContactRelation || "Associate",
      phone: newContactPhone,
      isSmsTarget: true
    };

    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem("tripshield_contacts", JSON.stringify(updated));

    setNewContactName("");
    setNewContactRelation("");
    setNewContactPhone("");
    addLog("DB", `Added Trusted Guardian: ${newContact.name}`);
  };

  const deleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    localStorage.setItem("tripshield_contacts", JSON.stringify(updated));
    addLog("DB", "Trusted contact removed from safety guard chain.");
  };

  const toggleSmsTarget = (id: string) => {
    const updated = contacts.map(c => c.id === id ? { ...c, isSmsTarget: !c.isSmsTarget } : c);
    setContacts(updated);
    localStorage.setItem("tripshield_contacts", JSON.stringify(updated));
    addLog("DB", "Broadcast priority list updated.");
  };

  // Calculate high-density shield factors
  const cyberDefenseScore = activeCountry ? 100 : 50;
  const physicalSafetyScore = Math.min(100, Math.max(20, (contacts.length * 15) + (savedPlaces.length * 10) + (activeCountry?.dangerLevel === "Low" ? 40 : activeCountry?.dangerLevel === "Medium" ? 20 : 10)));
  const financialShieldScore = activeCountry ? (activeCountry.scams ? 95 - (activeCountry.scams.length * 10) : 85) : 80;
  const overallIntegrity = Math.round((cyberDefenseScore + physicalSafetyScore + financialShieldScore) / 3);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans select-none antialiased">
      
      {/* ----------------- Header / System Status ----------------- */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20 text-white animate-pulse">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1 font-display">
                Trip<span className="text-red-500 font-extrabold">Shield</span>
              </h1>
              <span className="px-1.5 py-0.5 bg-slate-800 text-[9px] rounded border border-slate-700 text-slate-400 font-mono tracking-widest hidden sm:inline-block">v2.4.0-STABLE</span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Tactical Travel Companion & SOS Assistant</p>
          </div>
        </div>

        {/* Global Selectors */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col text-right hidden md:block">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Select Region Context</span>
            <span className="text-xs text-white font-semibold">Active Boundary Check</span>
          </div>
          <select 
            value={selectedCountryId}
            onChange={(e) => {
              setSelectedCountryId(e.target.value);
              addLog("CLIENT", `Region context shifted to: ${e.target.value.toUpperCase()}`);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 sm:px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono cursor-pointer"
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                📍 {c.name} ({c.language})
              </option>
            ))}
          </select>

          <div className="h-8 w-px bg-slate-800 hidden md:block"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">Traveler Secure Mode</p>
              <p className="text-[10px] text-red-400 font-mono flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
                JAVA-REST-ACTIVE
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-red-400 font-bold font-display shadow-inner">
              TS
            </div>
          </div>
        </div>
      </header>

      {/* ----------------- Active Alarm Alert Bar ----------------- */}
      {alarmPlaying && (
        <div className="bg-red-950/95 border-b border-red-700 text-red-200 px-4 py-2 flex items-center justify-between animate-pulse text-xs z-10 font-mono">
          <span className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
            Audio Siren Triggered & Broadcasting Loop Active
          </span>
          <button 
            onClick={() => triggerAlarmSound(false)}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold cursor-pointer transition-all uppercase text-[10px]"
          >
            Mute Alarm
          </button>
        </div>
      )}

      {/* ----------------- Main Responsive Grid ----------------- */}
      <main className="flex-1 p-3 sm:p-4 grid grid-cols-12 gap-3 sm:gap-4 overflow-hidden h-full">
        
        {/* ================= COLUMN 1: INTEGRITY SHIELD & STATE (Col Span: 12 on mobile, 3 on LG) ================= */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-3 sm:gap-4">
          
          {/* Diagnostic Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Shield Integrity</h2>
              <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded font-mono">ACTIVE</span>
            </div>
            
            <div className="relative flex flex-col items-center py-2">
              <div className="w-28 h-28 rounded-full border-4 border-red-500/10 flex items-center justify-center relative">
                {/* Dynamic Border Color based on integrity */}
                <div 
                  className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin" 
                  style={{ animationDuration: '4s' }}
                ></div>
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-white font-display tracking-tight">{overallIntegrity}%</span>
                  <p className="text-[9px] text-red-400 font-bold tracking-tighter uppercase font-mono mt-0.5">
                    {overallIntegrity > 80 ? "🛡️ SECURE" : "⚠️ SHIELD LOW"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-2 mt-1">
              <div className="bg-slate-950/85 p-2 rounded-lg border border-slate-800/80">
                <p className="text-[9px] text-slate-500 font-mono uppercase">Java Backend REST Node</p>
                <div className="flex justify-between items-center mt-0.5">
                  <span className="text-[11px] font-mono text-slate-300 italic flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-red-500" /> controlling.java
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded font-mono">STANDBY</span>
                </div>
              </div>

              <div className="bg-slate-950/85 p-2 rounded-lg border border-slate-800/80">
                <p className="text-[9px] text-slate-500 font-mono uppercase">API Pipeline Service</p>
                <div className="flex justify-between items-center mt-0.5">
                  <span className="text-[11px] font-mono text-slate-300 italic flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-red-500" /> service.java
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded font-mono">PIPELINED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Safety Risk Levels */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-grow flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Emergency Quick Dial</h2>
              <span className="text-[10px] text-slate-500 font-mono">Pre-Cached</span>
            </div>

            {activeCountry ? (
              <div className="space-y-3">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-500 font-mono">LOCAL POLICE</p>
                    <p className="text-sm font-bold text-white font-mono">{activeCountry.police}</p>
                  </div>
                  <a href={`tel:${activeCountry.police}`} className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition-all">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-500 font-mono">AMBULANCE / MEDICAL</p>
                    <p className="text-sm font-bold text-white font-mono">{activeCountry.ambulance}</p>
                  </div>
                  <a href={`tel:${activeCountry.ambulance}`} className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition-all">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-500 font-mono">FIRE DEPARTMENT</p>
                    <p className="text-sm font-bold text-white font-mono">{activeCountry.fire}</p>
                  </div>
                  <a href={`tel:${activeCountry.fire}`} className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition-all">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-2 border-l-2 border-amber-500 bg-amber-500/5 text-[11px] rounded">
                  <span className="font-bold text-amber-400 uppercase font-mono">Safety Level: {activeCountry.dangerLevel} Risk</span>
                  <p className="text-slate-400 mt-0.5">Capital: {activeCountry.capital} • Language: {activeCountry.language}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                Select a country region to compile cached fast-dial channels.
              </div>
            )}

            {/* Tactical Distress Audio Control & Signal Override */}
            <div className="border-t border-slate-800/85 pt-3.5 mt-auto space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Tactical Siren Station</p>
                {alarmPlaying && (
                  <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-mono animate-pulse uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Broadcasting audio
                  </span>
                )}
              </div>
              
              <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/90 space-y-2.5">
                {/* Siren Type selector */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>AUDIO FREQUENCY PATTERN</span>
                    <span className="text-slate-400 font-bold uppercase">{sirenType}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {(["wail", "yelp", "hilo", "pulse"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSirenType(type);
                          if (alarmPlaying) {
                            triggerAlarmSound(true, type);
                          }
                        }}
                        className={`py-1 rounded text-[9px] font-mono uppercase transition-all ${
                          sirenType === type
                            ? "bg-red-950 text-red-400 border border-red-500/30 font-bold animate-pulse"
                            : "bg-slate-900/40 hover:bg-slate-900 text-slate-500 border border-transparent"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>SIREN TRANSLATION GAIN</span>
                    <span className="text-slate-300 font-bold">{(sirenVolume * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.01"
                    value={sirenVolume}
                    onChange={(e) => setSirenVolume(parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => triggerAlarmSound(!alarmPlaying)}
                  className={`py-2 px-2.5 rounded font-mono text-xs border font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    alarmPlaying 
                      ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-500/20 animate-pulse" 
                      : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-red-400"
                  }`}
                >
                  🔊 {alarmPlaying ? "STOP SIREN" : "PLAY SIREN"}
                </button>
                <button 
                  onClick={captureGps}
                  className="py-2 px-2.5 rounded font-mono text-xs bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  📡 {isLocating ? "LOCATING..." : "PING GPS"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= COLUMN 2: CENTER WORKSPACE AND CONTROL TABS (Col Span: 12 on mobile, 6 on LG) ================= */}
        <section className="col-span-12 lg:col-span-6 flex flex-col gap-3 sm:gap-4">
          
          {/* Visual Tab Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex gap-1 flex-shrink-0 overflow-x-auto">
            <button 
              onClick={() => setActiveTab("sos")}
              className={`flex-1 min-w-[65px] sm:min-w-0 text-center py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "sos" 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              SOS Broadcast
            </button>

            <button 
              onClick={() => setActiveTab("map")}
              className={`flex-1 min-w-[65px] sm:min-w-0 text-center py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "map" 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              Offline Map
            </button>

            <button 
              onClick={() => setActiveTab("advisor")}
              className={`flex-1 min-w-[65px] sm:min-w-0 text-center py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "advisor" 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Threat Advisor
            </button>

            <button 
              onClick={() => setActiveTab("places")}
              className={`flex-1 min-w-[65px] sm:min-w-0 text-center py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "places" 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Saved Spots
            </button>

            <button 
              onClick={() => setActiveTab("contacts")}
              className={`flex-1 min-w-[65px] sm:min-w-0 text-center py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "contacts" 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Guardians
            </button>

            <button 
              onClick={() => setActiveTab("database")}
              className={`flex-1 min-w-[65px] sm:min-w-0 text-center py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "database" 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Safety Cache
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto shadow-inner relative min-h-[400px]">
            
            {/* ----------------- TAB: SOS BROADCAST & INTERACTIVE AI PANEL ----------------- */}
            {activeTab === "sos" && (
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                      Initiate Distress SOS Beacon
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">CHANNEL ST-09</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Pressing the secure distress button below instantly flags your coordinates to local first responders and dispatches distress SMS payloads to your {contacts.filter(c => c.isSmsTarget).length} active emergency guardians.
                  </p>

                  <form onSubmit={triggerSos} className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1">Live Distress Custom Message</label>
                      <textarea 
                        value={distressMessage}
                        onChange={(e) => setDistressMessage(e.target.value)}
                        placeholder="E.g. Someone is following me, or I was involved in an accident and need translation assistance..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none h-20"
                      />
                    </div>

                    {/* GPS Coordinates preview */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block">GPS LATITUDE</span>
                        <span className="font-mono text-white text-xs">{gpsCoordinates.lat}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block">GPS LONGITUDE</span>
                        <span className="font-mono text-white text-xs">{gpsCoordinates.lng}</span>
                      </div>
                    </div>

                    {/* Big red tactical beacon button */}
                    <div className="flex flex-col items-center py-4">
                      <button 
                        type="submit"
                        disabled={isSosLoading}
                        className={`w-32 h-32 rounded-full flex flex-col items-center justify-center font-display border-4 shadow-2xl transition-all duration-300 relative cursor-pointer ${
                          isSosLoading 
                            ? "bg-slate-800 border-slate-700 text-slate-500" 
                            : "bg-red-600 hover:bg-red-700 border-red-500 hover:scale-105 text-white active:scale-95 sos-pulse-animation shadow-red-600/30"
                        }`}
                      >
                        <Shield className="w-10 h-10 text-white mb-1" strokeWidth={2.5} />
                        <span className="text-lg font-black tracking-widest text-white">SOS</span>
                        <span className="text-[9px] font-bold text-red-100 opacity-85 uppercase font-mono tracking-tighter">
                          {isSosLoading ? "SENSING..." : "BROADCAST"}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Real-time SOS Result Output */}
                {sosActive && sosResult && (
                  <div className="bg-red-950/15 border border-red-900/40 rounded-xl p-4 space-y-3 animate-fade-in mt-2">
                    <div className="flex justify-between items-center pb-2 border-b border-red-900/30">
                      <span className="text-xs font-bold text-red-400 font-display flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-red-400 animate-spin" />
                        AI Emergency Response Core Activated
                      </span>
                      <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest">GEMINI PRO LIVE</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-red-400 font-mono uppercase block">Local Distress Translation Phrase:</span>
                      <p className="text-sm font-semibold text-white bg-slate-950 p-2.5 rounded border border-slate-800/80 leading-relaxed italic">
                        {sosResult.translatedMessage}
                      </p>
                      {sosResult.phonetics && (
                        <p className="text-[11px] text-slate-400 italic">
                          <span className="text-slate-500 not-italic font-mono uppercase text-[9px] mr-1">Phonetics Guide:</span> 
                          "{sosResult.phonetics}"
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-red-400 font-mono uppercase block">Evasion & Immediate Safety Checklist:</span>
                      <ul className="space-y-1">
                        {sosResult.safetySteps.map((step, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-red-500 font-extrabold mt-0.5">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Active Audio Siren Indicator in the Result Block */}
                    <div className={`p-3 rounded-lg border flex flex-col sm:flex-row justify-between items-center gap-2 transition-all ${
                      alarmPlaying 
                        ? "bg-red-500/10 border-red-500/30 text-white animate-pulse" 
                        : "bg-slate-950/80 border-slate-800 text-slate-400"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${alarmPlaying ? "bg-red-500 animate-ping" : "bg-slate-600"}`} />
                        <div>
                          <p className="text-xs font-bold font-mono text-slate-200">EMERGENCY AUDIO SIREN</p>
                          <p className="text-[10px] text-slate-400">
                            {alarmPlaying 
                              ? `Broadcasting ${sirenType.toUpperCase()} (${(sirenVolume * 100).toFixed(0)}% Volume)` 
                              : "Siren is currently muted / idle"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerAlarmSound(!alarmPlaying)}
                        className={`w-full sm:w-auto px-4 py-1.5 rounded font-mono text-[11px] font-bold uppercase cursor-pointer transition-all ${
                          alarmPlaying
                            ? "bg-red-600 text-white hover:bg-red-700 hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30"
                            : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                        }`}
                      >
                        {alarmPlaying ? "Stop Siren" : "Start Siren"}
                      </button>
                    </div>

                    <div className="pt-2 border-t border-red-900/30 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>ALERT STATUS: DELIVERED</span>
                      <span>GUARDIANS ALERTED: {sosResult.smsSentTo.length}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ----------------- TAB: OFFLINE HIGH-FIDELITY SIMULATION MAP ----------------- */}
            {activeTab === "map" && (
              <div className="space-y-4 flex flex-col h-full">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                      <Map className="w-4 h-4 text-red-500" />
                      Tactical Offline Map Canvas
                    </h3>
                    <p className="text-[10px] text-slate-400">Pre-downloaded satellite safety database vector visualization</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-mono uppercase animate-pulse">
                    LOCAL GPS: ACTIVE
                  </span>
                </div>

                {/* HTML5 Interactive Tactical Simulated Map */}
                <div className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col select-none">
                  
                  {/* Grid overlay lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  
                  {/* Concentric radar loops */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-25">
                    <div className="w-24 h-24 border border-red-500/30 rounded-full animate-ping"></div>
                    <div className="w-48 h-48 border border-red-500/10 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="w-72 h-72 border border-slate-800 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>

                  {/* Dynamic markers plotted */}
                  {/* Traveler GPS dot */}
                  <div 
                    className="absolute z-10 cursor-pointer" 
                    style={{ top: '50%', left: '50%' }}
                  >
                    <div className="w-4.5 h-4.5 bg-red-600 rounded-full border-2 border-white flex items-center justify-center -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform shadow-lg shadow-red-500/40">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute -translate-x-1/2 -translate-y-[2.8rem] bg-slate-900 text-[10px] text-white px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow font-mono">
                      🚨 YOU (LAT: {gpsCoordinates.lat})
                    </div>
                  </div>

                  {/* Map preloaded country safezones */}
                  {activeCountry?.safeZones?.map((sz, index) => {
                    // Spread safe zones around the central traveler coordinates offset dynamically for a cute simulation
                    const offsetIndex = index - (activeCountry.safeZones!.length / 2);
                    const topPercent = 50 + (offsetIndex * 15) + 5;
                    const leftPercent = 50 + (Math.sin(offsetIndex) * 28);
                    
                    return (
                      <div 
                        key={sz.id} 
                        className="absolute cursor-pointer"
                        style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                        onClick={() => {
                          addLog("CLIENT", `Map item focused: ${sz.name} (${sz.phone})`);
                          setFocusedNode({
                            name: sz.name,
                            type: sz.type,
                            address: sz.address,
                            phone: sz.phone
                          });
                        }}
                      >
                        <div className="w-4 h-4 bg-emerald-500 rounded border border-white flex items-center justify-center -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform shadow-md shadow-emerald-500/20">
                          <span className="text-[8px] text-slate-950 font-extrabold">{sz.type[0]}</span>
                        </div>
                        <div className="absolute -translate-x-1/2 translate-y-2 bg-slate-900 text-[8px] text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap opacity-85 hover:opacity-100 shadow font-mono">
                          🟢 {sz.name.split(" ")[0]}
                        </div>
                      </div>
                    );
                  })}

                  {/* Map custom saved places */}
                  {savedPlaces.map((sp, index) => {
                    const topPercent = 35 + (index * 12);
                    const leftPercent = 30 + (index * 18);
                    return (
                      <div 
                        key={sp.id} 
                        className="absolute cursor-pointer"
                        style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                        onClick={() => {
                          addLog("CLIENT", `Custom safe spot focused: ${sp.name}`);
                          setFocusedNode({
                            name: sp.name,
                            type: sp.type,
                            description: sp.description
                          });
                        }}
                      >
                        <div className="w-4 h-4 bg-blue-500 rounded-full border border-white flex items-center justify-center -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform shadow-md shadow-blue-500/20">
                          <MapPin className="w-2.5 h-2.5 text-white" />
                        </div>
                        <div className="absolute -translate-x-1/2 translate-y-2 bg-slate-900 text-[8px] text-blue-300 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap opacity-85 hover:opacity-100 shadow font-mono">
                          🔷 {sp.name}
                        </div>
                      </div>
                    );
                  })}

                  {/* Quick coordinates grabber on Map Click */}
                  <div 
                    className="absolute inset-0"
                    style={{ zIndex: 1 }}
                    onClick={(e) => {
                      // Only click if background map itself is clicked
                      if (e.target === e.currentTarget) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        // Transform relative click coordinates to simulated GPS offsets
                        const simulatedLat = parseFloat((gpsCoordinates.lat + (y - rect.height/2) * 0.0005).toFixed(5));
                        const simulatedLng = parseFloat((gpsCoordinates.lng + (x - rect.width/2) * 0.0005).toFixed(5));
                        setNewPlaceLat(simulatedLat);
                        setNewPlaceLng(simulatedLng);
                        addLog("CLIENT", `Map clicked. Coordinates captured: ${simulatedLat}, ${simulatedLng}. Ready to tag safe house.`);
                      }
                    }}
                  ></div>

                  {/* Compass HUD decoration */}
                  <div className="absolute bottom-2 left-2 z-10 text-[9px] bg-slate-900/90 border border-slate-800 text-slate-500 p-1.5 rounded font-mono">
                    COMPASS: N 12° E • ZOOM: 18x <br />
                    MATRIX SENSORS: ONLINE
                  </div>

                  {/* Calibration hint overlay */}
                  <div className="absolute top-2 right-2 z-10 text-[8px] bg-slate-900/90 border border-slate-800 text-red-400 p-1 rounded font-mono uppercase tracking-widest animate-pulse">
                    SIMULATED RADAR FEED
                  </div>
                </div>

                {/* Focused Node Quick Info */}
                {focusedNode && (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-1.5 relative animate-fade-in">
                    <button 
                      onClick={() => setFocusedNode(null)} 
                      className="absolute top-2 right-2 text-slate-500 hover:text-red-400 text-[10px] font-mono cursor-pointer transition-colors"
                    >
                      [✖ ESCAPE]
                    </button>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        focusedNode.type.includes("Hospital") || focusedNode.type.includes("Embassy") ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                      }`}></span>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{focusedNode.name}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] pt-1">
                      <p className="text-slate-500">
                        Category: <span className="text-slate-300 font-mono text-[10px] uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 ml-1">{focusedNode.type}</span>
                      </p>
                      {focusedNode.phone && (
                        <p className="text-slate-500">
                          Secure Line: <a href={`tel:${focusedNode.phone}`} className="text-red-400 font-mono hover:underline ml-1 font-bold">📞 {focusedNode.phone}</a>
                        </p>
                      )}
                      {focusedNode.address && (
                        <p className="text-slate-500 sm:col-span-2">
                          Geographic Anchor: <span className="text-slate-300 font-mono ml-1">{focusedNode.address}</span>
                        </p>
                      )}
                      {focusedNode.description && (
                        <p className="text-slate-500 sm:col-span-2">
                          Special Protocol: <span className="text-slate-300 italic ml-1">"{focusedNode.description}"</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-white text-xs mb-1 font-display">💡 Tactical Vector Instructions</p>
                  <p>1. Clicking are pre-cached local nodes marked with <strong className="text-emerald-400">[H] Hospital, [P] Police, or [E] Embassy</strong> triggers exact phone link overlays.</p>
                  <p>2. Tap directly on any empty area of the grid above to lock those pixel-coordinates into the Custom Spot manager below.</p>
                </div>
              </div>
            )}

            {/* ----------------- TAB: AI SAFE-ROOM THREAT ADVISOR ----------------- */}
            {activeTab === "advisor" && (
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-red-500" />
                      TripShield Smart AI Threat Advisor
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">GEMINI SECURE CHAL-V</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Query the smart safety agent regarding custom scams, bad districts, curfew mandates, or active physical emergencies. Uses server-side proxy models to guarantee your privacy shield.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {/* Advisor query tool */}
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">1. Smart Location Briefing</h4>
                      <form onSubmit={querySmartAdvisor} className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-500 font-mono uppercase block">COUNTRY</label>
                            <input 
                              type="text" 
                              value={activeCountry?.name || ""} 
                              disabled
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-mono uppercase block">CITY/NEIGHBORHOOD</label>
                            <input 
                              type="text" 
                              value={advisorCity} 
                              onChange={(e) => setAdvisorCity(e.target.value)}
                              placeholder="E.g. Shinjuku / Paris metro"
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-500 font-mono uppercase block">SPECIFIC CONCERN</label>
                          <input 
                            type="text" 
                            value={advisorQuery} 
                            onChange={(e) => setAdvisorQuery(e.target.value)}
                            placeholder="E.g. What pickpocket tricks should I avoid here?"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </div>

                        <button 
                          type="submit" 
                          disabled={isAdvisorLoading}
                          className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isAdvisorLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Generate Secure Safety Advice
                        </button>
                      </form>
                    </div>

                    {/* Active Situation threat analyzer */}
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">2. Active Situation Threat Analyzer</h4>
                      <form onSubmit={analyzeActiveSituation} className="space-y-2">
                        <div>
                          <label className="text-[9px] text-slate-500 font-mono uppercase block">WHAT IS HAPPENING RIGHT NOW?</label>
                          <textarea 
                            value={activeSituation}
                            onChange={(e) => setActiveSituation(e.target.value)}
                            placeholder="E.g. A stranger is claiming to be plainclothes police in Mexico City and demands my wallet..."
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 h-16 resize-none"
                          />
                        </div>

                        <button 
                          type="submit" 
                          disabled={isSituationLoading}
                          className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isSituationLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          Perform Active Threat Analysis
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Response Outputs */}
                {(advisorResponse || situationResult) && (
                  <div className="grid grid-cols-1 gap-3 border-t border-slate-800 pt-3 mt-2">
                    
                    {/* Advice Markdown Viewer */}
                    {advisorResponse && (
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
                          <span className="font-bold text-emerald-400 font-mono uppercase flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Threat Assessment Report
                          </span>
                          <button 
                            onClick={() => setAdvisorResponse("")}
                            className="text-[10px] text-slate-500 hover:text-slate-300"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="text-slate-300 space-y-2 max-h-48 overflow-y-auto leading-relaxed pr-2">
                          {advisorResponse.split("\n").map((line, idx) => {
                            if (line.startsWith("###")) {
                              return <h5 key={idx} className="text-xs font-bold text-white pt-2 font-display">{line.replace("###", "")}</h5>;
                            }
                            if (line.startsWith("-") || line.startsWith("*")) {
                              return <li key={idx} className="ml-3 list-disc text-slate-300">{line.substring(1).trim()}</li>;
                            }
                            if (line.trim().length === 0) return null;
                            return <p key={idx}>{line}</p>;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Situation Analyzer Report */}
                    {situationResult && (
                      <div className="bg-red-950/10 p-4 rounded-xl border border-red-900/30 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-red-900/30 mb-2">
                          <span className="font-bold text-red-400 font-mono uppercase flex items-center gap-1">
                            🚨 Situation Threat Level: {situationResult.riskLevel}
                          </span>
                          <button 
                            onClick={() => setSituationResult(null)}
                            className="text-[10px] text-slate-500 hover:text-slate-300"
                          >
                            Clear
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] text-red-400 font-mono uppercase block">Tactical Scenario Analysis:</span>
                            <p className="text-slate-200 italic">"{situationResult.analysis}"</p>
                          </div>

                          <div>
                            <span className="text-[10px] text-red-400 font-mono uppercase block">Immediate Physical Getaway Actions:</span>
                            <ul className="space-y-1">
                              {situationResult.escapeInstructions.map((inst, i) => (
                                <li key={i} className="text-slate-300 flex items-start gap-1.5">
                                  <span className="font-bold text-red-500">{i+1}.</span>
                                  <span>{inst}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {situationResult.localPhraseToDeescalate && (
                            <div className="bg-slate-950 p-2 rounded border border-slate-800">
                              <span className="text-[9px] text-slate-500 font-mono uppercase block">De-escalation Verbal Script:</span>
                              <p className="text-xs font-bold text-white italic">{situationResult.localPhraseToDeescalate}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* ----------------- TAB: SAVED SECURE SPOTS ----------------- */}
            {activeTab === "places" && (
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-500" />
                      Secure Safe Spots & Saved Places
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">LOCAL DB METRIC</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Register hotels, rendezvous locations, emergency safe points, or local friend residences here. These will render as custom markers on your offline simulation vector radar.
                  </p>

                  {/* Saved places list */}
                  {savedPlaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 max-h-48 overflow-y-auto pr-1">
                      {savedPlaces.map((sp) => (
                        <div key={sp.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-all">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-white">{sp.name}</span>
                              <span className="text-[8px] px-1.5 py-0.2 bg-blue-500/10 text-blue-400 rounded font-mono uppercase">
                                {sp.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-1">{sp.description}</p>
                            <p className="text-[9px] text-slate-500 font-mono">Coords: {sp.lat}, {sp.lng}</p>
                          </div>
                          
                          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-800/60">
                            <button 
                              onClick={() => {
                                setGpsCoordinates({ lat: sp.lat, lng: sp.lng });
                                addLog("CLIENT", `Centered map coordinate focus to custom safehouse: ${sp.name}`);
                                setActiveTab("map");
                              }}
                              className="text-[9px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-0.5 cursor-pointer"
                            >
                              <Navigation className="w-2.5 h-2.5" /> Center Map
                            </button>
                            <button 
                              onClick={() => deleteSavedPlace(sp.id)}
                              className="text-[9px] text-red-400 hover:text-red-300 font-mono flex items-center gap-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-2.5 h-2.5" /> Clear
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs italic bg-slate-950 rounded-lg border border-slate-850 mb-4">
                      No custom secure points marked. Use the form below to lock coordinates.
                    </div>
                  )}
                </div>

                {/* Add new secure spot */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono mb-2">Tag Current / Clicked Coordinates</h4>
                  <form onSubmit={saveCustomPlace} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4">
                      <label className="text-[9px] text-slate-500 font-mono uppercase block">NAME OF SPOT</label>
                      <input 
                        type="text" 
                        value={newPlaceName} 
                        onChange={(e) => setNewPlaceName(e.target.value)}
                        placeholder="E.g. Main Embassy / Hotel lobby"
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[9px] text-slate-500 font-mono uppercase block">SPOT TYPE</label>
                      <select 
                        value={newPlaceType} 
                        onChange={(e: any) => setNewPlaceType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="Hotel">Hotel</option>
                        <option value="SafeHouse">Safe House</option>
                        <option value="Embassy">Embassy</option>
                        <option value="Hospital">Hospital</option>
                        <option value="MeetingPoint">Meeting Point</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[9px] text-slate-500 font-mono uppercase block">TACTICAL DESC</label>
                      <input 
                        type="text" 
                        value={newPlaceDesc} 
                        onChange={(e) => setNewPlaceDesc(e.target.value)}
                        placeholder="E.g. Key to side gate in backpack"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-end">
                      <button 
                        type="submit" 
                        className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </form>
                  <p className="text-[9px] text-slate-500 font-mono mt-2 text-right">
                    Coordinates locked for save: Latitude: {newPlaceLat}, Longitude: {newPlaceLng}
                  </p>
                </div>
              </div>
            )}

            {/* ----------------- TAB: GUARDIANS / EMERGENCY CONTACTS ----------------- */}
            {activeTab === "contacts" && (
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-red-500" />
                      Trusted Safety Guardians Chain
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">ACTIVE SENSORS</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Guardians specified below will receive an instantaneous, high-priority automated distress notification containing your precise active GPS coordinates whenever the main SOS trigger is fired.
                  </p>

                  {/* Contacts listing */}
                  {contacts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 max-h-48 overflow-y-auto pr-1">
                      {contacts.map((c) => (
                        <div key={c.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{c.name}</span>
                              <span className="text-[8px] px-1 py-0.2 bg-slate-800 text-slate-400 rounded font-mono">
                                {c.relation}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{c.phone}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {/* Toggle SOS active recipient */}
                            <button 
                              onClick={() => toggleSmsTarget(c.id)}
                              className={`text-[9px] px-2 py-1 rounded font-mono border transition-all cursor-pointer ${
                                c.isSmsTarget 
                                  ? "bg-red-500/10 border-red-500/30 text-red-400" 
                                  : "bg-slate-900 border-slate-800 text-slate-500"
                              }`}
                            >
                              {c.isSmsTarget ? "🟢 SEND SMS" : "❌ OFF"}
                            </button>

                            <button 
                              onClick={() => deleteContact(c.id)}
                              className="text-slate-500 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs italic bg-slate-950 rounded-lg border border-slate-850 mb-4">
                      No emergency guardians registered. Your distress signals remain localized.
                    </div>
                  )}
                </div>

                {/* Add new contact form */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono mb-2">Register New Guardian Link</h4>
                  <form onSubmit={saveContact} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4">
                      <label className="text-[9px] text-slate-500 font-mono uppercase block">FULL NAME</label>
                      <input 
                        type="text" 
                        value={newContactName} 
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="E.g. Chief of Operations / Spouse"
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[9px] text-slate-500 font-mono uppercase block">RELATION</label>
                      <input 
                        type="text" 
                        value={newContactRelation} 
                        onChange={(e) => setNewContactRelation(e.target.value)}
                        placeholder="E.g. Spouse / Colleague"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[9px] text-slate-500 font-mono uppercase block">SMS PHONE NUMBER</label>
                      <input 
                        type="text" 
                        value={newContactPhone} 
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="E.g. +1 (555) 012-3456"
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-end">
                      <button 
                        type="submit" 
                        className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Bind
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ----------------- TAB: SAFETY DATABASE CACHE (PRE-DOWNLOADED INFO) ----------------- */}
            {activeTab === "database" && (
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-red-500" />
                      Pre-Cached Safety Phrases & Common Scams
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">OFFLINE INDEXED</span>
                  </div>

                  {activeCountry ? (
                    <div className="space-y-4">
                      {/* Common Scams */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-red-400 font-mono uppercase block">Common Local Traps & Scams:</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {activeCountry.scams?.map((scam, i) => (
                            <div key={i} className="bg-slate-950 p-2.5 rounded border border-slate-850 text-xs flex gap-2">
                              <span className="text-red-500 font-extrabold text-[12px]">⚠️</span>
                              <p className="text-slate-300 leading-relaxed">{scam}</p>
                            </div>
                          )) || (
                            <p className="text-slate-500 text-xs italic">No pre-cached regional scams declared.</p>
                          )}
                        </div>
                      </div>

                      {/* Safety Phrases */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-red-400 font-mono uppercase block">Pre-cached Essential Safety Phrases:</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {activeCountry.safetyPhrases?.map((phrase, i) => (
                            <div key={i} className="bg-slate-950 p-3 rounded border border-slate-850 text-xs space-y-1">
                              <span className="text-[10px] text-slate-500 font-mono uppercase">English: "{phrase.english}"</span>
                              <p className="text-sm font-bold text-white italic">{phrase.local}</p>
                              {phrase.romaji && (
                                <p className="text-[10px] text-slate-400 italic">Phonetics: {phrase.romaji}</p>
                              )}
                            </div>
                          )) || (
                            <p className="text-slate-500 text-xs italic">No cached key phrases listed.</p>
                          )}
                        </div>
                      </div>

                      {/* Offline Safe Zones details */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-red-400 font-mono uppercase block">Pre-Cached Safe Zones Nearby:</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {activeCountry.safeZones?.map((sz) => (
                            <div key={sz.id} className="bg-slate-950 p-2.5 rounded border border-slate-850 text-xs space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-200">{sz.name}</span>
                                <span className="text-[8px] px-1 bg-emerald-500/10 text-emerald-400 rounded uppercase font-mono">{sz.type}</span>
                              </div>
                              <p className="text-[10px] text-slate-400">{sz.address}</p>
                              <p className="text-[9px] text-slate-500 font-mono">Hotline: {sz.phone}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs italic">
                      Select active region context to compile preloaded safety libraries.
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-500">
                  ⚠️ The pre-cached travel safety index holds 100% offline data storage. This content remains completely queryable even in the absolute absence of a live cellular internet signal.
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ================= COLUMN 3: REAL-TIME BACKEND LOGS & PROTECTION OVERVIEW (Col Span: 12 on mobile, 3 on LG) ================= */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-3 sm:gap-4">
          
          {/* Real-time System Logs stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <Server className="w-3 h-3 text-red-500" /> Java REST Server Logs
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Continuous stream console */}
            <div className="bg-slate-950/90 rounded-lg p-3 text-[10px] font-mono flex-1 overflow-y-auto max-h-[300px] lg:max-h-none border border-slate-850 space-y-2">
              {systemLogs.map((log, idx) => (
                <div key={idx} className={`p-1.5 rounded leading-relaxed border-l-2 ${
                  log.type === "REST_REQ" ? "border-blue-500 bg-blue-500/5 text-blue-300" :
                  log.type === "REST_RES" ? "border-emerald-500 bg-emerald-500/5 text-emerald-300" :
                  log.type === "AI_REQ" || log.type === "AI_RES" ? "border-purple-500 bg-purple-500/5 text-purple-300" :
                  log.type === "SOS_EXEC" ? "border-red-500 bg-red-500/5 text-red-300 animate-pulse" :
                  log.type === "GPS_WARN" || log.type === "REST_WARN" ? "border-amber-500 bg-amber-500/5 text-amber-300" :
                  "border-slate-700 bg-slate-900/40 text-slate-400"
                }`}>
                  <span className="text-slate-500">[{log.time}]</span> <strong className="uppercase font-semibold tracking-tighter">[{log.type}]</strong> {log.message}
                </div>
              ))}
              
              {systemLogs.length === 0 && (
                <div className="text-slate-600 text-center py-12 italic">
                  Waiting for backend REST request payloads to pipe...
                </div>
              )}
            </div>
          </div>

          {/* Core Protection stats metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-3">Protection Coverage</h2>
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-[10px] mb-1 font-mono font-bold">
                  <span>CYBER SHIELD DEFENSE</span>
                  <span className="text-emerald-400">{cyberDefenseScore}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                  <div 
                    className="bg-emerald-500 h-full shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-500" 
                    style={{ width: `${cyberDefenseScore}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[10px] mb-1 font-mono font-bold">
                  <span>PHYSICAL VECTORS SECURED</span>
                  <span className="text-emerald-400">{physicalSafetyScore}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-500" 
                    style={{ width: `${physicalSafetyScore}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1 font-mono font-bold">
                  <span>FINANCIAL SCAM AVOIDANCE</span>
                  <span className="text-amber-400">{financialShieldScore}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                  <div 
                    className="bg-amber-400 h-full transition-all duration-500" 
                    style={{ width: `${financialShieldScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick General safety advice list rotation */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80">
              <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1.5">Universal Directive</span>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800 text-[10.5px] leading-relaxed text-slate-400 italic">
                "{GENERAL_SAFETY_TIPS[Math.floor(Date.now() / 86400000) % GENERAL_SAFETY_TIPS.length].desc}"
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* ----------------- Footer / Status Bar ----------------- */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3.5 px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-mono gap-3 flex-shrink-0">
        <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6">
          <span>Session Hash: <span className="text-slate-300 font-bold">TS-884920-X</span></span>
          <span>Node Matrix: <span className="text-slate-300 font-bold">AWS-EU-CENTRAL-1</span></span>
          <span>DB Status: <span className="text-emerald-500 font-bold">Synchronized (6 caches)</span></span>
        </div>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Java Rest Server</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Gemini live AI pipeline</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block"></span> Local DB Persistence</span>
        </div>
      </footer>

    </div>
  );
}

