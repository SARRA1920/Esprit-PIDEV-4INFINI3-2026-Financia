package tn.esprit.financia.service.credit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.dto.credit.PortfolioHealthStatsDto;
import tn.esprit.financia.entities.credit.Credit;
import tn.esprit.financia.entities.credit.PaymentStatus;
import tn.esprit.financia.entities.credit.StatusC;
import tn.esprit.financia.repository.credit.CreditRepository;
import tn.esprit.financia.repository.credit.RemboursementRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.counting;
import static java.util.stream.Collectors.groupingBy;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CreditStatsServiceImpl implements CreditStatsService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final RoundingMode RM = RoundingMode.HALF_UP;

    private final CreditRepository creditRepository;
    private final RemboursementRepository remboursementRepository;

    @Override
    public PortfolioHealthStatsDto getPortfolioHealthStats() {
        List<Credit> credits = creditRepository.findAll();

        long totalCreditsCount = credits.size();

        Map<StatusC, Long> countsByStatus = credits.stream()
                .filter(c -> c.getStatus() != null)
                .collect(groupingBy(Credit::getStatus, () -> new EnumMap<>(StatusC.class), counting()));

        Map<String, Long> creditsByStatus = new LinkedHashMap<>();
        for (StatusC s : StatusC.values()) {
            creditsByStatus.put(s.name(), countsByStatus.getOrDefault(s, 0L));
        }

        BigDecimal totalGrantedAmount = credits.stream()
                .filter(c -> c.getStatus() == StatusC.APPROVED || c.getStatus() == StatusC.ACTIVE || c.getStatus() == StatusC.CLOSED)
                .map(Credit::getAmount)
                .filter(a -> a != null)
                .reduce(ZERO, BigDecimal::add);

        List<BigDecimal> riskScores = credits.stream()
                .filter(c -> c.getStatus() != StatusC.REJECTED)
                .map(Credit::getRiskScore)
                .filter(rs -> rs != null)
                .toList();

        BigDecimal avgRiskScore = ZERO;
        if (!riskScores.isEmpty()) {
            BigDecimal sum = riskScores.stream().reduce(ZERO, BigDecimal::add);
            avgRiskScore = sum.divide(BigDecimal.valueOf(riskScores.size()), 2, RM);
        }

        long bucket0_50 = credits.stream().filter(c -> inBucket(c.getRiskScore(), new BigDecimal("0"), new BigDecimal("50"))).count();
        long bucket50_75 = credits.stream().filter(c -> inBucket(c.getRiskScore(), new BigDecimal("50"), new BigDecimal("75"))).count();
        long bucket75_100 = credits.stream().filter(c -> inBucketInclusiveHigh(c.getRiskScore(), new BigDecimal("75"), new BigDecimal("100"))).count();

        Map<String, Long> riskDistributionBuckets = new LinkedHashMap<>();
        riskDistributionBuckets.put("bucket_0_50", bucket0_50);
        riskDistributionBuckets.put("bucket_50_75", bucket50_75);
        riskDistributionBuckets.put("bucket_75_100", bucket75_100);

        LocalDate today = LocalDate.now();
        long overdueInstallmentsCount = remboursementRepository.countOverdueInstallments(PaymentStatus.PENDING, today);
        long overdueCreditsCount = remboursementRepository.countDistinctOverdueCredits(PaymentStatus.PENDING, today);

        Integer maxLateDays = remboursementRepository.maxLateDaysOverall();
        int maxLateDaysOverall = (maxLateDays == null) ? 0 : maxLateDays;

        long activeCount = countsByStatus.getOrDefault(StatusC.ACTIVE, 0L);
        long approvedCount = countsByStatus.getOrDefault(StatusC.APPROVED, 0L);
        long denom = activeCount > 0 ? activeCount : approvedCount;
        double portfolioLateRate = denom > 0 ? ((double) overdueCreditsCount) / denom : 0.0d;

        return PortfolioHealthStatsDto.builder()
                .totalCreditsCount(totalCreditsCount)
                .totalGrantedAmount(totalGrantedAmount)
                .creditsByStatus(creditsByStatus)
                .avgRiskScore(avgRiskScore)
                .riskDistributionBuckets(riskDistributionBuckets)
                .overdueCreditsCount(overdueCreditsCount)
                .overdueInstallmentsCount(overdueInstallmentsCount)
                .maxLateDaysOverall(maxLateDaysOverall)
                .portfolioLateRate(portfolioLateRate)
                .build();
    }

    private static boolean inBucket(BigDecimal score, BigDecimal lowInclusive, BigDecimal highExclusive) {
        if (score == null) return false;
        return score.compareTo(lowInclusive) >= 0 && score.compareTo(highExclusive) < 0;
    }

    private static boolean inBucketInclusiveHigh(BigDecimal score, BigDecimal lowInclusive, BigDecimal highInclusive) {
        if (score == null) return false;
        return score.compareTo(lowInclusive) >= 0 && score.compareTo(highInclusive) <= 0;
    }
}

