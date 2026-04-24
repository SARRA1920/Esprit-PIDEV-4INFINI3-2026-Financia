package tn.esprit.financia.dto.partenaire;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmailAnalysisRequest {
    private Long partenaireId;
    private String senderEmail;
    private String subject;
    private String body;
    private String senderName;
    private boolean hasAttachments;
    private int attachmentCount;
    private String[] attachmentTypes;
}
