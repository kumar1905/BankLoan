package com.bank.loan.dto;

import com.bank.loan.model.LoanType;
import com.bank.loan.model.Status;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LoanApplicationResponse {
    private Long id;
    private LoanType type;
    private Double amount;
    private Integer tenure;
    private Double monthlyIncome;
    private String pan;
    private String address;
    private Status status;
    private LocalDateTime approvalDate;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private UserDto user;
}
