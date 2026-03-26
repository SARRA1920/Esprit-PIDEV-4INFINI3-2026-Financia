package tn.esprit.financia.service;

import tn.esprit.financia.entities.Credit;
import tn.esprit.financia.entities.Remboursement;
import tn.esprit.financia.entities.User;

public interface SmsService {
    void sendPaymentSuccess(User user, Credit credit, Remboursement remboursement);
}

