package tn.esprit.financia.dto.credit;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StripeCheckoutSessionDto {
    private String sessionId;
    private String checkoutUrl;
}

