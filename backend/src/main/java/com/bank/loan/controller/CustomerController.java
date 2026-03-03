package com.bank.loan.controller;

import com.bank.loan.dto.EligibilityRequest;
import com.bank.loan.dto.EligibilityResponse;
import com.bank.loan.dto.LoanApplicationRequest;
import com.bank.loan.dto.LoanApplicationResponse;
import com.bank.loan.exception.BadRequestException;
import com.bank.loan.model.LoanApplication;
import com.bank.loan.model.Status;
import com.bank.loan.repository.UserRepository;
import com.bank.loan.service.LoanService;
import com.bank.loan.service.PdfService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private LoanService loanService;

    @Autowired
    private PdfService pdfService;

    @PostMapping("/eligibility")
    public ResponseEntity<EligibilityResponse> checkEligibility(@Valid @RequestBody EligibilityRequest request) {
        return ResponseEntity.ok(loanService.checkEligibility(request));
    }

    @PostMapping(value = "/apply", consumes = {"multipart/form-data"})
    public ResponseEntity<LoanApplicationResponse> applyForLoan(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("loanData") String loanDataStr,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) throws IOException {
        
        LoanApplicationRequest request = new ObjectMapper().readValue(loanDataStr, LoanApplicationRequest.class);
        return ResponseEntity.ok(loanService.submitApplication(userDetails.getUsername(), request, files));
    }

    @GetMapping("/loans")
    public ResponseEntity<List<LoanApplicationResponse>> getMyLoans(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(loanService.getCustomerLoans(userDetails.getUsername()));
    }

    @GetMapping("/loans/{id}/pdf")
    public ResponseEntity<InputStreamResource> downloadApprovalPdf(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        LoanApplication loan = loanService.getLoanById(id);
        
        // Security check
        if (!loan.getUser().getEmail().equals(userDetails.getUsername())) {
             throw new BadRequestException("You can only download YOUR approval letters.");
        }

        if (loan.getStatus() != Status.APPROVED) {
            throw new BadRequestException("Loan is not approved.");
        }

        ByteArrayInputStream bis = pdfService.generateApprovalLetter(loan);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=approval_letter_" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
