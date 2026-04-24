package tn.esprit.financia.dto.user;

/** Profil issu d’un id_token Google validé (sans création de compte). */
public record GoogleProfileResponse(String firstName, String lastName, String email) {}
