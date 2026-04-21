package tn.esprit.financia.security;

public record JwtPrincipal(String email, Long userId, String role) {}
