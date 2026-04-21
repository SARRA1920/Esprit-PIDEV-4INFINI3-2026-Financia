package tn.esprit.financia.dto.credit;

import tn.esprit.financia.entities.credit.Credit;

/**
 * Indique si l'utilisateur a un crédit "bloquant" (même règle que {@code CreditServiceImpl#create}).
 */
public record BlockingCreditResponse(boolean blocking, Credit credit) {}
