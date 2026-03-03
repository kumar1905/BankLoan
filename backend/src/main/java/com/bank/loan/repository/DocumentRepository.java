package com.bank.loan.repository;

import com.bank.loan.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByLoanApplicationId(Long loanApplicationId);
}
