package com.tripshield.model;

public class SafetyPhrase {
    private String english;
    private String local;
    private String romaji;

    public SafetyPhrase() {}

    public SafetyPhrase(String english, String local, String romaji) {
        this.english = english;
        this.local = local;
        this.romaji = romaji;
    }

    // Getters & Setters
    public String getEnglish() { return english; }
    public void setEnglish(String english) { this.english = english; }

    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }

    public String getRomaji() { return romaji; }
    public void setRomaji(String romaji) { this.romaji = romaji; }
}
