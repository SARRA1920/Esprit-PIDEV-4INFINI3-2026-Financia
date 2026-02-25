package tn.esprit.financia.dto;

/**
 * Requête pour enregistrer une photo de visage (enrollment).
 * imageBase64 : image encodée en base64 (raw ou data:image/jpeg;base64,...)
 */
public record FaceEnrollRequest(String imageBase64) {}
