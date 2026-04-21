package tn.esprit.financia.dto.user;

/**
 * Requête pour se connecter par reconnaissance faciale.
 * email       : email de l'utilisateur à identifier
 * imageBase64 : photo prise au moment de la connexion (base64)
 */
public record FaceVerifyRequest(String email, String imageBase64) {}
