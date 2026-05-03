package tn.esprit.financia.dto.savings;

import lombok.Data;

@Data
public class AgentRequestDTO {
    private String userId;
    private Long goalId;
    private String query;
}