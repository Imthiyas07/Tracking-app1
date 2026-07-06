package com.tripshield.model;

import java.util.List;

public class Country {
    private String id;
    private String name;
    private String police;
    private String ambulance;
    private String fire;
    private String general;
    private String language;
    private String localHelpPhrase;
    private String dangerLevel;
    private List<String> scams;
    private List<SafeZone> safeZones;
    private List<SafetyPhrase> safetyPhrases;

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPolice() { return police; }
    public void setPolice(String police) { this.police = police; }

    public String getAmbulance() { return ambulance; }
    public void setAmbulance(String ambulance) { this.ambulance = ambulance; }

    public String getFire() { return fire; }
    public void setFire(String fire) { this.fire = fire; }

    public String getGeneral() { return general; }
    public void setGeneral(String general) { this.general = general; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getLocalHelpPhrase() { return localHelpPhrase; }
    public void setLocalHelpPhrase(String localHelpPhrase) { this.localHelpPhrase = localHelpPhrase; }

    public String getDangerLevel() { return dangerLevel; }
    public void setDangerLevel(String dangerLevel) { this.dangerLevel = dangerLevel; }

    public List<String> getScams() { return scams; }
    public void setScams(List<String> scams) { this.scams = scams; }

    public List<SafeZone> getSafeZones() { return safeZones; }
    public void setSafeZones(List<SafeZone> safeZones) { this.safeZones = safeZones; }

    public List<SafetyPhrase> getSafetyPhrases() { return safetyPhrases; }
    public void setSafetyPhrases(List<SafetyPhrase> safetyPhrases) { this.safetyPhrases = safetyPhrases; }
}
