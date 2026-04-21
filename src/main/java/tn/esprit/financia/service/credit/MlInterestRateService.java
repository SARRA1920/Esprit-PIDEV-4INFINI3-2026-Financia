package tn.esprit.financia.service.credit;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tn.esprit.financia.dto.credit.MlRateRequestDto;
import tn.esprit.financia.dto.credit.MlRateResponseDto;
import tn.esprit.financia.entities.credit.Credit;
import tn.esprit.financia.entities.user.User;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class MlInterestRateService {

    private static final RoundingMode RM = RoundingMode.HALF_UP;
    private static final BigDecimal MIN = new BigDecimal("5.00");
    private static final BigDecimal MAX = new BigDecimal("25.00");

    private final RestTemplateBuilder restTemplateBuilder;

    /**
     * Appelle l'API ML (FastAPI) pour prédire interestRate (annuel %, académique).
     * Fallback si l'API est indisponible.
     */
    public BigDecimal predictAnnualRatePercent(Credit credit, String mlApiBaseUrl) {
        BigDecimal fallback = fallbackFormula(credit);

        if (mlApiBaseUrl == null || mlApiBaseUrl.isBlank()) {
            return fallback;
        }

        try {
            RestTemplate rt = restTemplateBuilder
                    .setConnectTimeout(Duration.ofSeconds(2))
                    .setReadTimeout(Duration.ofSeconds(3))
                    .build();

            MlRateRequestDto req = toRequest(credit);
            MlRateResponseDto resp = rt.postForObject(
                    mlApiBaseUrl + "/predict-rate",
                    req,
                    MlRateResponseDto.class
            );

            if (resp == null || resp.interestRate() == null) return fallback;
            return clamp(resp.interestRate()).setScale(2, RM);
        } catch (Exception ex) {
            return fallback;
        }
    }

    private MlRateRequestDto toRequest(Credit credit) {
        BigDecimal amount = credit.getAmount() == null ? BigDecimal.ZERO : credit.getAmount();
        Integer durationMonths = credit.getDurationMonths() == null ? 12 : credit.getDurationMonths();
        BigDecimal riskScore = credit.getRiskScore() == null ? new BigDecimal("50") : credit.getRiskScore();

        // Dataset Home Credit utilise un income annuel; notre User a monthlyIncome -> annualize.
        User user = credit.getUser();
        BigDecimal monthlyIncome = user == null ? null : user.getMonthlyIncome();
        BigDecimal annualIncome = (monthlyIncome == null ? BigDecimal.ZERO : monthlyIncome.multiply(new BigDecimal("12")));

        return new MlRateRequestDto(amount, durationMonths, annualIncome, riskScore);
    }

    private BigDecimal fallbackFormula(Credit credit) {
        BigDecimal riskScore = credit.getRiskScore() == null ? new BigDecimal("50") : credit.getRiskScore();
        BigDecimal amount = credit.getAmount() == null ? BigDecimal.ZERO : credit.getAmount();
        BigDecimal durationMonths = credit.getDurationMonths() == null ? new BigDecimal("12") : BigDecimal.valueOf(credit.getDurationMonths());

        BigDecimal rate = new BigDecimal("5.00")
                .add(riskScore.multiply(new BigDecimal("0.10")))
                .add(amount.divide(new BigDecimal("10000"), 10, RM))
                .add(durationMonths.multiply(new BigDecimal("0.02")));

        return clamp(rate).setScale(2, RM);
    }

    private static BigDecimal clamp(BigDecimal v) {
        if (v.compareTo(MIN) < 0) return MIN;
        if (v.compareTo(MAX) > 0) return MAX;
        return v;
    }
}

