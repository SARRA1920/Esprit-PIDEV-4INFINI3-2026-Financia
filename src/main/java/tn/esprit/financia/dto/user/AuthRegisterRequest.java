package tn.esprit.financia.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import tn.esprit.financia.entities.user.Role;

import java.math.BigDecimal;

public record AuthRegisterRequest(
        String firstName,
        String lastName,
        String email,
        String password,
        String phone,
        String address,
        Role role,
        BigDecimal monthlyIncome,
        @JsonProperty("facePhotoBase64") String facePhotoBase64
) {}
