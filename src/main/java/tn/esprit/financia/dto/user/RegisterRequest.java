package tn.esprit.financia.dto.user;

import tn.esprit.financia.entities.user.Role;

import java.math.BigDecimal;

public record RegisterRequest(
        String firstName,
        String lastName,
        String email,
        String password,
        String phone,
        String address,
        Role role,
        BigDecimal monthlyIncome,
        /** Photo de visage en base64 (optionnelle) pour reconnaissance faciale */
        String facePhotoBase64
) {}
