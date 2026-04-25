package tn.esprit.financia.dto.user;

import tn.esprit.financia.entities.user.Role;

import java.math.BigDecimal;

public record UserResponse(
        Long idUser,
        String firstName,
        String lastName,
        String email,
        String phone,
        String address,
        Role role,
        BigDecimal monthlyIncome,
        Integer yearsAsClient,
        /** Objectif / description de projet pour les recommandations de formations. */
        String projectGoal
) {}
