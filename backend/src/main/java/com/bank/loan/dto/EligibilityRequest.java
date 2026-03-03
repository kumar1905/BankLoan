package com.bank.loan.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EligibilityRequest {
    @NotNull(message = "Monthly income is required")
    @Min(value = 1000, message = "Monthly income must be at least 1000")
    private Double monthlyIncome;

    @NotNull(message = "Loan amount is required")
    @Min(value = 1000, message = "Amount must be at least 1000")
    private Double loanAmount;

    @NotNull(message = "Tenure is required")
    @Min(value = 1, message = "Tenure must be at least 1 month")
    private Integer tenure;

    private Double existingLoansEmi = 0.0;
}
