package tn.esprit.financia.dto;

public record RiskTrendResponse(String period, double avgRisk, long totalEvents) {}
