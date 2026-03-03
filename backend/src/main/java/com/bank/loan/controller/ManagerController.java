package com.bank.loan.controller;

import com.bank.loan.dto.LoanApplicationResponse;
import com.bank.loan.model.Status;
import com.bank.loan.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    @Autowired
    private LoanService loanService;

    @GetMapping("/loans/submitted")
    public ResponseEntity<List<LoanApplicationResponse>> getSubmittedLoans() {
        return ResponseEntity.ok(loanService.getAllSubmittedLoans());
    }

    @GetMapping("/loans")
    public ResponseEntity<List<LoanApplicationResponse>> getAllLoans() {
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    @PutMapping("/loans/{id}/review")
    public ResponseEntity<LoanApplicationResponse> reviewApplication(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        
        String decisionStr = payload.get("decision"); // APPROVE or REJECT
        String reason = payload.get("reason");

        Status decision = Status.valueOf(decisionStr);
        return ResponseEntity.ok(loanService.reviewApplication(id, decision, reason));
    }
}
