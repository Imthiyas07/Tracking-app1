package com.tripshield.model;

public class SosRequest {
    private String countryId;
    private String distressMessage;
    private double lat;
    private double lng;
    private int contactCount;

    // Getters & Setters
    public String getCountryId() { return countryId; }
    public void setCountryId(String countryId) { this.countryId = countryId; }

    public String getDistressMessage() { return distressMessage; }
    public void setDistressMessage(String distressMessage) { this.distressMessage = distressMessage; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public int getContactCount() { return contactCount; }
    public void setContactCount(int contactCount) { this.contactCount = contactCount; }
}
