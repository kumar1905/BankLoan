package com.bank.loan.dto;

import com.bank.loan.model.LoanType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoanApplicationRequest {
    @NotNull(message = "Loan type is required")
    private LoanType type;

    @NotNull(message = "Amount is required")
    @Min(value = 1000, message = "Amount must be at least 1000")
    private Double amount;

    @NotNull(message = "Tenure is required")
    @Min(value = 1, message = "Tenure must be at least 1 month")
    private Integer tenure;

    @NotNull(message = "Monthly income is required")
    @Min(value = 1000, message = "Monthly income must be at least 1000")
    private Double monthlyIncome;

    @NotBlank(message = "PAN number is required")
    private String pan;

    @NotBlank(message = "Address is required")
    private String address;
}
