package tn.esprit.financia.dto.partenaire;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    @Positive(message = "Payment amount must be greater than zero")
    private double paymentAmount;
    
    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;
}
