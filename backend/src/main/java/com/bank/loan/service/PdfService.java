package com.bank.loan.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.bank.loan.model.LoanApplication;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    public ByteArrayInputStream generateApprovalLetter(LoanApplication loan) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.BLUE);
            Paragraph title = new Paragraph("Bank Loan Approval Letter", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" ")); // empty line

            // Date
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Paragraph dateP = new Paragraph("Date: " + loan.getApprovalDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")), normalFont);
            dateP.setAlignment(Paragraph.ALIGN_RIGHT);
            document.add(dateP);
            document.add(new Paragraph(" "));

            Paragraph content = new Paragraph("Dear " + loan.getUser().getName() + ",\n\n" +
                    "We are pleased to inform you that your loan application has been APPROVED. " +
                    "Below are the details of your approved loan:\n\n", normalFont);
            document.add(content);

            // Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            // Set Column widths
            float[] columnWidths = {1f, 2f};
            table.setWidths(columnWidths);

            addTableCell(table, "Application ID", loan.getId().toString());
            addTableCell(table, "Name", loan.getUser().getName());
            addTableCell(table, "Loan Type", loan.getType().name());
            addTableCell(table, "Loan Amount", "Rs. " + loan.getAmount());
            addTableCell(table, "Tenure", loan.getTenure() + " Months");
            addTableCell(table, "Interest Rate", "10.5% p.a."); // Static rule assumption
            addTableCell(table, "Approval Date", loan.getApprovalDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

            document.add(table);

            Paragraph footer = new Paragraph("\n\nThank you for choosing our bank.\n\nSincerely,\nBank Manager", normalFont);
            document.add(footer);

            document.close();

        } catch (DocumentException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addTableCell(PdfPTable table, String header, String value) {
        Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        PdfPCell hCell = new PdfPCell(new Phrase(header, headFont));
        hCell.setPadding(5);
        table.addCell(hCell);

        PdfPCell vCell = new PdfPCell(new Phrase(value));
        vCell.setPadding(5);
        table.addCell(vCell);
    }
}
