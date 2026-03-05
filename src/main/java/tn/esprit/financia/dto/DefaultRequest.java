package tn.esprit.financia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DefaultRequest {
    @NotNull(message = "Default date is required")
    private LocalDate defaultDate;
    
    @NotBlank(message = "Reason is required")
    private String reason;
}
