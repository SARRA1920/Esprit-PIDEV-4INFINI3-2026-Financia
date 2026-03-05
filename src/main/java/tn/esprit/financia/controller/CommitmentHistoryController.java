package tn.esprit.financia.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.financia.entities.CommitmentHistory;
import tn.esprit.financia.service.ICommitmentHistoryTracker;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/commitments")
public class CommitmentHistoryController {

    private final ICommitmentHistoryTracker commitmentHistoryTracker;

    @GetMapping("/{id}/history")
    public ResponseEntity<List<CommitmentHistory>> retrieveHistory(@PathVariable Long id) {
        List<CommitmentHistory> history = commitmentHistoryTracker.retrieveHistory(id);
        return ResponseEntity.ok(history);
    }
}
