package tn.esprit.financia.service.savings;

import tn.esprit.financia.entities.savings.*;
import tn.esprit.financia.repository.savings.*;
import tn.esprit.financia.dto.savings.GoalPredictionResult;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.apache.commons.math3.stat.regression.SimpleRegression;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.web.client.RestTemplate;
import tn.esprit.financia.dto.savings.AgentRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
@Service
public class SavingsGoalService {

    @Autowired
    private SavingsGoalRepository repository;

    @Autowired
    private SavingsTransactionRepository transactionRepository;

    @Autowired
    private SavingsAccountRepository savingsAccountRepository;

    private static final Logger log = LoggerFactory.getLogger(SavingsGoalService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    // CRUD methods (unchanged, but ensure they are present)
    public SavingGoal create(SavingGoal goal) {
        SavingAccount account = resolveAccount(goal);
        goal.setSavingsAccount(account);
        if (goal.getCurrentAmount() == null) {
            goal.setCurrentAmount(0.0);
        }
        goal.setStatus(GoalStatus.IN_PROGRESS);
        if (goal.getTargetAmount() != null && goal.getTargetAmount() > 0) {
            double completion = (goal.getCurrentAmount() / goal.getTargetAmount()) * 100;
            goal.setCompletionRate(completion);
        } else {
            goal.setCompletionRate(0.0);
        }
        return repository.save(goal);
    }

    public List<SavingGoal> getAll() {
        return repository.findAll();
    }

    public List<SavingGoal> getAllByUser(Long userId) {
        return repository.findAllBySavingsAccount_User_IdUser(userId);
    }

    public Optional<SavingGoal> getById(Long id) {
        return repository.findById(id);
    }

    public Optional<SavingGoal> getByIdAndUser(Long id, Long userId) {
        return repository.findByIdAndSavingsAccount_User_IdUser(id, userId);
    }

    public boolean accountBelongsToUser(Long accountId, Long userId) {
        return savingsAccountRepository.findById(accountId)
                .map(account -> account.getUser() != null && userId.equals(account.getUser().getIdUser()))
                .orElse(false);
    }

    public SavingGoal update(Long id, SavingGoal updated) {
        SavingGoal existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        existing.setCurrentAmount(updated.getCurrentAmount());
        double completion = (existing.getCurrentAmount() / existing.getTargetAmount()) * 100;
        existing.setCompletionRate(completion);

        if (existing.getCurrentAmount() >= existing.getTargetAmount()) {
            existing.setStatus(GoalStatus.COMPLETED);
        } else {
            existing.setStatus(GoalStatus.IN_PROGRESS);
        }

        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    private SavingAccount resolveAccount(SavingGoal goal) {
        Long accountId = goal.getSavingsAccount() != null ? goal.getSavingsAccount().getId() : null;
        if (accountId == null) {
            throw new IllegalArgumentException("Savings account is required");
        }
        return savingsAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Savings account not found"));
    }

    // Forecast method
    public GoalPredictionResult forecast(Long goalId) {
        SavingGoal goal = repository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        SavingAccount account = goal.getSavingsAccount();

        List<SavingTransaction> deposits = transactionRepository
                .findBySavingsAccountIdAndTypeOrderByTransactionDateAsc(account.getId(), TransactionType.DEPOSIT);

        if (deposits.isEmpty()) {
            return new GoalPredictionResult(
                    goalId,
                    "No data",
                    "Start saving regularly to achieve your goal.",
                    null,
                    0.0,
                    "Insufficient deposit history to make a prediction."
            );
        }

        LocalDate firstDate = deposits.get(0).getTransactionDate().toLocalDate();
        List<Double> x = new ArrayList<>();
        List<Double> y = new ArrayList<>();
        double cumulative = 0.0;

        for (SavingTransaction tx : deposits) {
            cumulative += tx.getAmount();
            long days = ChronoUnit.DAYS.between(firstDate, tx.getTransactionDate().toLocalDate());
            x.add((double) days);
            y.add(cumulative);
        }

        SimpleRegression regression = new SimpleRegression();
        for (int i = 0; i < x.size(); i++) {
            regression.addData(x.get(i), y.get(i));
        }

        double intercept = regression.getIntercept();
        double slope = regression.getSlope();

        if (slope <= 0) {
            return new GoalPredictionResult(
                    goalId,
                    "Insufficient growth",
                    "Your savings are not increasing over time. Try to deposit regularly.",
                    null,
                    0.0,
                    "Unable to predict completion because deposit growth is not positive."
            );
        }

        double target = goal.getTargetAmount();
        double predictedDays = (target - intercept) / slope;
        if (predictedDays < 0) predictedDays = 0;
        LocalDate predictedDate = firstDate.plusDays((long) predictedDays);
        LocalDate deadline = goal.getDeadline();

        String verdict, advice;
        if (predictedDate.isBefore(deadline)) {
            verdict = "On track";
            advice = "Keep up the good work! You are ahead of schedule.";
        } else if (predictedDate.isAfter(deadline)) {
            long daysOver = ChronoUnit.DAYS.between(deadline, predictedDate);
            verdict = "At risk";
            advice = String.format(
                    "You are behind schedule. Estimated completion is %d days late. " +
                            "Consider increasing your deposit frequency or amount.",
                    daysOver);
        } else {
            verdict = "Exactly on track";
            advice = "You are exactly on track to meet the deadline.";
        }

        return new GoalPredictionResult(
                goalId,
                verdict,
                advice,
                predictedDate,
                0.0,
                "Forecast generated based on deposit history."
        );
    }
    public String getAgenticAdvice(AgentRequestDTO request) {
        String url = "http://localhost:5002/agent/savings-advice";
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<AgentRequestDTO> entity = new HttpEntity<>(request, headers);

        try {
            // Log the request
            ObjectMapper mapper = new ObjectMapper();
            log.info("Calling AI agent at {} with body: {}", url, mapper.writeValueAsString(request));

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            log.info("AI agent responded: status={}, body={}", response.getStatusCode(), response.getBody());
            return response.getBody();
        } catch (Exception e) {
            // Log the full exception
            log.error("Failed to call AI agent", e);
            return "{\"error\": \"Agentic AI service is currently unavailable.\"}";
        }
    }
}
