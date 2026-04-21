package tn.esprit.financia.dto.user;

import tn.esprit.financia.entities.user.User;

public record AuthResponse(String token, User user) {}
