package com.tripshield.controller;

import com.tripshield.model.Country;
import com.tripshield.model.SosRequest;
import com.tripshield.model.SosResponse;
import com.tripshield.model.AdvisorRequest;
import com.tripshield.model.AdvisorResponse;
import com.tripshield.model.SituationRequest;
import com.tripshield.model.SituationResponse;
import com.tripshield.service.TripShieldService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TripShield REST API Controller (Controlling.java)
 * Handles incoming front-end requests for tactical SOS broadcast,
 * country safety queries, threat advisor, and real-time situational analysis.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class Controlling {

    private final TripShieldService tripShieldService;

    @Autowired
    public Controlling(TripShieldService tripShieldService) {
        this.tripShieldService = tripShieldService;
    }

    /**
     * GET /api/countries
     * Retrieves the basic pre-cached safety context and hotline dials for all active regions.
     */
    @GetMapping("/countries")
    public ResponseEntity<List<Country>> getAllCountries() {
        return ResponseEntity.ok(tripShieldService.getCountriesList());
    }

    /**
     * GET /api/countries/{id}
     * Retrieves detailed geographical coordinates, safe zones (hospitals/embassies), and phrases.
     */
    @GetMapping("/countries/{id}")
    public ResponseEntity<Country> getCountryDetails(@PathVariable String id) {
        Country country = tripShieldService.getCountryDetails(id);
        if (country == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(country);
    }

    /**
     * POST /api/sos/broadcast
     * Coordinates the emergency beacon. Translates the user distress message into local dialect
     * via Gemini, outlines tactical safety steps, and lists alerted emergency guardians.
     */
    @PostMapping("/sos/broadcast")
    public ResponseEntity<SosResponse> handleSosBroadcast(@RequestBody SosRequest request) {
        SosResponse response = tripShieldService.processSosBroadcast(request);
        if (response == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/safety/advisor
     * Inquires about current danger levels, regional scams, and security protocols using generative AI.
     */
    @PostMapping("/safety/advisor")
    public ResponseEntity<AdvisorResponse> getSafetyAdvice(@RequestBody AdvisorRequest request) {
        AdvisorResponse response = tripShieldService.generateSafetyAdvice(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/safety/analyze-situation
     * Parses an active suspicious situation/scam and provides escape coordinates and de-escalation actions.
     */
    @PostMapping("/safety/analyze-situation")
    public ResponseEntity<SituationResponse> analyzeActiveThreat(@RequestBody SituationRequest request) {
        SituationResponse response = tripShieldService.analyzeSituation(request);
        return ResponseEntity.ok(response);
    }
}
