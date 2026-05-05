package tn.esprit.financia.service;

import org.springframework.stereotype.Service;
import tn.esprit.financia.dto.RiskTrendResponse;
import tn.esprit.financia.repository.LoginEventRepository;
import tn.esprit.financia.repository.RiskTrendProjection;

import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsService {

    private final LoginEventRepository loginEventRepository;

    public StatsService(LoginEventRepository loginEventRepository) {
        this.loginEventRepository = loginEventRepository;
    }

    public List<RiskTrendResponse> getDailyRiskTrend(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("from and to are required (yyyy-MM-dd)");
        }
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("to must be after or equal to from");
        }

        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toExclusive = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<RiskTrendProjection> rows = loginEventRepository.findDailyRiskTrend(fromInstant, toExclusive);
        Map<String, RiskTrendResponse> byDay = new LinkedHashMap<>();

        LocalDate day = from;
        while (!day.isAfter(to)) {
            String period = day.toString();
            byDay.put(period, new RiskTrendResponse(period, 0.0, 0));
            day = day.plusDays(1);
        }

        for (RiskTrendProjection row : rows) {
            double avgRisk = row.getAvgRisk() == null
                    ? 0.0
                    : row.getAvgRisk().setScale(2, RoundingMode.HALF_UP).doubleValue();
            byDay.put(row.getPeriod(), new RiskTrendResponse(row.getPeriod(), avgRisk, row.getTotalEvents()));
        }

        return byDay.values().stream().toList();
    }
}
