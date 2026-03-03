package com.bank.loan.repository;

import com.bank.loan.model.LoanApplication;
import com.bank.loan.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    List<LoanApplication> findByUserId(Long userId);
    List<LoanApplication> findByStatus(Status status);
}
