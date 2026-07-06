package com.tripshield.model;

import java.util.List;

public class SosResponse {
    private String emergencyId;
    private String timestamp;
    private String localTranslation;
    private String phoneticTranslation;
    private List<String> tacticalSteps;
    private List<String> smsSentTo;
    private String status;

    // Getters & Setters
    public String getEmergencyId() { return emergencyId; }
    public void setEmergencyId(String emergencyId) { this.emergencyId = emergencyId; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getLocalTranslation() { return localTranslation; }
    public void setLocalTranslation(String localTranslation) { this.localTranslation = localTranslation; }

    public String getPhoneticTranslation() { return phoneticTranslation; }
    public void setPhoneticTranslation(String phoneticTranslation) { this.phoneticTranslation = phoneticTranslation; }

    public List<String> getTacticalSteps() { return tacticalSteps; }
    public void setTacticalSteps(List<String> tacticalSteps) { this.tacticalSteps = tacticalSteps; }

    public List<String> getSmsSentTo() { return smsSentTo; }
    public void setSmsSentTo(List<String> smsSentTo) { this.smsSentTo = smsSentTo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
