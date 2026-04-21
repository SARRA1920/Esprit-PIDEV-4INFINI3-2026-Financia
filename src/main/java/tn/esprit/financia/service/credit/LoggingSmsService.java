package tn.esprit.financia.service.credit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.credit.Credit;
import tn.esprit.financia.entities.credit.Remboursement;
import tn.esprit.financia.entities.user.User;

@Service
public class LoggingSmsService implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(LoggingSmsService.class);

    @Override
    public void sendPaymentSuccess(User user, Credit credit, Remboursement remboursement) {
        String phone = user != null ? user.getPhone() : null;
        log.info("[SMS:noop] Payment success. to={} creditId={} remboursementId={} amount={}",
                phone,
                credit != null ? credit.getId() : null,
                remboursement != null ? remboursement.getId() : null,
                remboursement != null ? remboursement.getAmount() : null
        );
    }
}

