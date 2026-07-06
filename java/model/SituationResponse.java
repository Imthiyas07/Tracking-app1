package com.tripshield.model;

public class SituationResponse {
    private String threatLevel;
    private String protocolSummary;
    private String timestamp;

    // Getters & Setters
    public String getThreatLevel() { return threatLevel; }
    public void setThreatLevel(String threatLevel) { this.threatLevel = threatLevel; }

    public String getProtocolSummary() { return protocolSummary; }
    public void setProtocolSummary(String protocolSummary) { this.protocolSummary = protocolSummary; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
