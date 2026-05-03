package tn.esprit.financia.dto.savings;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.financia.entities.savings.AccountType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Account type is required")
    private AccountType type;
    
    @PositiveOrZero(message = "Balance must be positive or zero")
    private Double balance = 0.0;
}
