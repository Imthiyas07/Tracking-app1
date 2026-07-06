package com.tripshield.model;

public class AdvisorRequest {
    private String countryName;
    private String city;
    private String query;

    // Getters & Setters
    public String getCountryName() { return countryName; }
    public void setCountryName(String countryName) { this.countryName = countryName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
}
