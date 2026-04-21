package tn.esprit.financia.service.credit;

import tn.esprit.financia.entities.credit.Credit;
import tn.esprit.financia.entities.credit.Remboursement;
import tn.esprit.financia.entities.user.User;

public interface SmsService {
    void sendPaymentSuccess(User user, Credit credit, Remboursement remboursement);
}

