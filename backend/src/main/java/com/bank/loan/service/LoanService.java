package com.bank.loan.service;

import com.bank.loan.dto.*;
import com.bank.loan.exception.BadRequestException;
import com.bank.loan.exception.ResourceNotFoundException;
import com.bank.loan.model.Document;
import com.bank.loan.model.LoanApplication;
import com.bank.loan.model.Status;
import com.bank.loan.model.User;
import com.bank.loan.repository.DocumentRepository;
import com.bank.loan.repository.LoanApplicationRepository;
import com.bank.loan.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LoanService {

    @Autowired
    private LoanApplicationRepository loanApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Eligibility rule: Loan Amount <= 20 × Monthly Income
    public EligibilityResponse checkEligibility(EligibilityRequest req) {
        double maxAmount = req.getMonthlyIncome() * 20;
        // Optionally factor in existing EMIs, but for simpler req, just raw 20x.
        boolean eligible = req.getLoanAmount() <= maxAmount;

        String message = eligible ? "You are eligible for this loan." 
                                  : "You are not eligible. Max allowed loan matches 20x your monthly income.";

        return new EligibilityResponse(eligible, message, maxAmount);
    }

    public LoanApplicationResponse submitApplication(String userEmail, LoanApplicationRequest request, List<MultipartFile> files) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EligibilityRequest checkReq = new EligibilityRequest();
        checkReq.setLoanAmount(request.getAmount());
        checkReq.setMonthlyIncome(request.getMonthlyIncome());
        checkReq.setTenure(request.getTenure());

        EligibilityResponse eligibility = checkEligibility(checkReq);
        if (!eligibility.isEligible()) {
            throw new BadRequestException("Application cannot be submitted. You are not eligible for this amount.");
        }

        LoanApplication loan = LoanApplication.builder()
                .user(user)
                .type(request.getType())
                .amount(request.getAmount())
                .tenure(request.getTenure())
                .monthlyIncome(request.getMonthlyIncome())
                .pan(request.getPan())
                .address(request.getAddress())
                .status(Status.SUBMITTED)
                .build();

        LoanApplication savedLoan = loanApplicationRepository.save(loan);

        if (files != null && !files.isEmpty()) {
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path path = Paths.get(uploadDir, fileName);
                Files.write(path, file.getBytes());

                Document doc = new Document();
                doc.setLoanApplication(savedLoan);
                doc.setFileName(file.getOriginalFilename());
                doc.setFilePath(path.toString());
                documentRepository.save(doc);
            }
        }

        return mapToResponse(savedLoan);
    }

    public List<LoanApplicationResponse> getCustomerLoans(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return loanApplicationRepository.findByUserId(user.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<LoanApplicationResponse> getAllSubmittedLoans() {
        return loanApplicationRepository.findByStatus(Status.SUBMITTED)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<LoanApplicationResponse> getAllLoans() {
        return loanApplicationRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public LoanApplicationResponse reviewApplication(Long loanId, Status decision, String reason) {
        LoanApplication loan = loanApplicationRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan application not found"));

        if (loan.getStatus() != Status.SUBMITTED) {
            throw new BadRequestException("Only SUBMITTED loans can be reviewed.");
        }

        if (decision == Status.APPROVED) {
            loan.setStatus(Status.APPROVED);
            loan.setApprovalDate(LocalDateTime.now());
        } else if (decision == Status.REJECTED) {
            if (reason == null || reason.trim().isEmpty()) {
                throw new BadRequestException("Rejection reason is mandatory.");
            }
            loan.setStatus(Status.REJECTED);
            loan.setRejectionReason(reason);
        } else {
            throw new BadRequestException("Invalid decision status.");
        }

        LoanApplication saved = loanApplicationRepository.save(loan);
        return mapToResponse(saved);
    }

    public LoanApplication getLoanById(Long id) {
        return loanApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan application not found"));
    }

    private LoanApplicationResponse mapToResponse(LoanApplication loan) {
        LoanApplicationResponse resp = new LoanApplicationResponse();
        resp.setId(loan.getId());
        resp.setType(loan.getType());
        resp.setAmount(loan.getAmount());
        resp.setTenure(loan.getTenure());
        resp.setMonthlyIncome(loan.getMonthlyIncome());
        resp.setPan(loan.getPan());
        resp.setAddress(loan.getAddress());
        resp.setStatus(loan.getStatus());
        resp.setApprovalDate(loan.getApprovalDate());
        resp.setRejectionReason(loan.getRejectionReason());
        resp.setCreatedAt(loan.getCreatedAt());

        User user = loan.getUser();
        if (user != null) {
            resp.setUser(new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole()));
        }

        return resp;
    }
}
