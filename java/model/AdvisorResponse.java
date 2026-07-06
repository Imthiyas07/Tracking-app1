package com.tripshield.model;

public class AdvisorResponse {
    private String region;
    private String advisoryText;
    private String generationTime;

    // Getters & Setters
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getAdvisoryText() { return advisoryText; }
    public void setAdvisoryText(String advisoryText) { this.advisoryText = advisoryText; }

    public String getGenerationTime() { return generationTime; }
    public void setGenerationTime(String generationTime) { this.generationTime = generationTime; }
}
