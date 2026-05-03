package tn.esprit.financia.service.savings;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.financia.entities.savings.GoalStatus;
import tn.esprit.financia.entities.savings.SavingGoal;
import tn.esprit.financia.repository.savings.SavingsGoalRepository;

import java.util.List;

@Component
public class GoalCompletionScheduler {

    @Autowired
    private SavingsGoalRepository goalRepository;
    @Autowired
    private SmsService smsService;

    @Scheduled(cron = "0 0 * * * *") // runs every minute at second 0
    @Transactional // <-- keeps Hibernate session open
    public void autoCompleteGoals() {
        List<SavingGoal> allGoals = goalRepository.findAll();
        System.out.println("Scheduler running. Total goals: " + allGoals.size());

        allGoals.stream()
                .filter(goal -> {
                    boolean cond = goal.getCurrentAmount() >= goal.getTargetAmount();
                    System.out.println("Goal " + goal.getId() + ": current=" + goal.getCurrentAmount()
                            + " target=" + goal.getTargetAmount() + " condition=" + cond);
                    return cond;
                })
                .filter(goal -> {
                    boolean cond = goal.getStatus() != GoalStatus.COMPLETED;
                    System.out.println("Goal " + goal.getId() + ": status=" + goal.getStatus() + " condition=" + cond);
                    return cond;
                })
                .forEach(goal -> {
                    System.out.println("Processing goal " + goal.getId());
                    goal.setStatus(GoalStatus.COMPLETED);
                    goalRepository.save(goal);

                    String phone = goal.getSavingsAccount().getUser().getPhone();
                    System.out.println("Phone for goal " + goal.getId() + ": '" + phone + "'");  // <-- keep this

                    if (phone != null && !phone.isBlank()) {
                        String msg = String.format(
                                "Congratulations! Your goal '%s' is completed! You saved %.2f of %.2f.",
                                goal.getDescription(),
                                goal.getCurrentAmount(),
                                goal.getTargetAmount()
                        );
                        System.out.println(">>> ABOUT TO SEND SMS to " + phone);   // <--- ADD THIS
                        smsService.sendSms(phone, msg);
                        System.out.println(">>> SMS CALL FINISHED for goal " + goal.getId()); // <--- ADD THIS
                    } else {
                        System.out.println("No phone for goal " + goal.getId());
                    }
                });
    }
}