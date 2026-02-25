package tn.esprit.financia.dto;

import tn.esprit.financia.entities.User;

public record AuthResponse(String token, User user) {}
