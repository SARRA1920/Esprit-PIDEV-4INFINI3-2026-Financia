package tn.esprit.financia.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import tn.esprit.financia.entities.user.Role;

import java.math.BigDecimal;

/**
 * Inscription après Google : prénom/nom/e-mail viennent du jeton côté serveur ;
 * le client envoie uniquement le reste du formulaire + le même id_token.
 */
public record GoogleRegisterRequest(
        String idToken,
        String phone,
        String address,
        String password,
        Role role,
        BigDecimal monthlyIncome,
        @JsonProperty("facePhotoBase64") String facePhotoBase64
) {}
