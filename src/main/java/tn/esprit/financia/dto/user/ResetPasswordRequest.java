package tn.esprit.financia.dto.user;

public record ResetPasswordRequest(String token, String newPassword) {}
