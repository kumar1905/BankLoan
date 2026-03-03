package com.bank.loan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EligibilityResponse {
    private boolean eligible;
    private String message;
    private Double maxEligibleAmount;
}
