package tn.esprit.financia.dto;

public record ResetPasswordRequest(String token, String newPassword) {}
