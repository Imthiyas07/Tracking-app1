export interface Country {
  id: string;
  name: string;
  capital: string;
  police: string;
  ambulance: string;
  fire: string;
  general: string;
  language: string;
  localHelpPhrase: string;
  dangerLevel: "Low" | "Medium" | "High";
  scams?: string[];
  safeZones?: SafeZone[];
  safetyPhrases?: SafetyPhrase[];
}

export interface SafeZone {
  id: string;
  name: string;
  type: "Hospital" | "Police" | "Embassy" | "Other";
  lat: number;
  lng: number;
  address: string;
  phone: string;
}

export interface SafetyPhrase {
  english: string;
  local: string;
  romaji: string;
}

export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isSmsTarget: boolean;
}

export interface SavedPlace {
  id: string;
  name: string;
  type: "Hotel" | "SafeHouse" | "Embassy" | "Hospital" | "MeetingPoint" | "Other";
  lat: number;
  lng: number;
  description: string;
  address?: string;
  createdAt: string;
}

export interface SosEvent {
  id: string;
  timestamp: string;
  countryName: string;
  lat: number;
  lng: number;
  distressMessage: string;
  translatedMessage: string;
  safetySteps: string[];
  phonetics?: string;
  smsSentTo: string[];
}
