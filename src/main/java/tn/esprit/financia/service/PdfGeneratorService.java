package tn.esprit.financia.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.financia.entities.Contrat;
import tn.esprit.financia.entities.EcheancierPayement;
import tn.esprit.financia.entities.User;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
public class PdfGeneratorService {

    private static final DeviceRgb PURPLE_COLOR = new DeviceRgb(102, 126, 234);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(245, 247, 250);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] generateContractPdf(Contrat contrat, User user) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Header
            addHeader(document);
            
            // Title
            addTitle(document, "LOAN CONTRACT");
            
            // Contract Information
            addContractInfo(document, contrat, user);
            
            // Loan Details
            addLoanDetails(document, contrat);
            
            // Terms and Conditions
            addTermsAndConditions(document);
            
            // Signature Section
            addSignatureSection(document, user);
            
            // Footer
            addFooter(document);

            document.close();
            log.info("PDF generated successfully for contract ID: {}", contrat.getId());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF for contract ID: {}", contrat.getId(), e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
    }

    public byte[] generatePaymentSchedulePdf(List<EcheancierPayement> payments, Contrat contrat, User user) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Header
            addHeader(document);
            
            // Title
            addTitle(document, "PAYMENT SCHEDULE");
            
            // Customer Info
            addCustomerInfo(document, user, contrat);
            
            // Payment Schedule Table
            addPaymentScheduleTable(document, payments);
            
            // Summary
            addPaymentSummary(document, payments);
            
            // Footer
            addFooter(document);

            document.close();
            log.info("Payment schedule PDF generated successfully for contract ID: {}", contrat.getId());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate payment schedule PDF", e);
            throw new RuntimeException("Failed to generate payment schedule PDF: " + e.getMessage());
        }
    }

    private void addHeader(Document document) {
        Paragraph header = new Paragraph("FINANCIA")
                .setFontSize(28)
                .setBold()
                .setFontColor(PURPLE_COLOR)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
        document.add(header);

        Paragraph tagline = new Paragraph("Your Trusted Financial Partner")
                .setFontSize(12)
                .setItalic()
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(tagline);

        // Divider line
        document.add(new Paragraph("\n").setMarginBottom(10));
    }

    private void addTitle(Document document, String title) {
        Paragraph titlePara = new Paragraph(title)
                .setFontSize(20)
                .setBold()
                .setFontColor(PURPLE_COLOR)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(titlePara);
    }

    private void addContractInfo(Document document, Contrat contrat, User user) {
        Table table = new Table(2);
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(20);

        addInfoRow(table, "Contract Number:", "CNT-" + contrat.getId());
        addInfoRow(table, "Customer Name:", user.getFirstName() + " " + user.getLastName());
        addInfoRow(table, "Email:", user.getEmail());
        addInfoRow(table, "Phone:", user.getPhone());
        addInfoRow(table, "Address:", user.getAddress() != null ? user.getAddress() : "N/A");
        addInfoRow(table, "Contract Date:", contrat.getSignedDate().format(DATE_FORMATTER));
        addInfoRow(table, "Contract Type:", contrat.getType().toString());
        addInfoRow(table, "Status:", contrat.getStatus());
        addInfoRow(table, "Version:", contrat.getVersion());

        document.add(table);
    }

    private void addLoanDetails(Document document, Contrat contrat) {
        Paragraph sectionTitle = new Paragraph("LOAN DETAILS")
                .setFontSize(16)
                .setBold()
                .setFontColor(PURPLE_COLOR)
                .setMarginTop(20)
                .setMarginBottom(10);
        document.add(sectionTitle);

        Table table = new Table(2);
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(20);

        String currency = contrat.getCurrency() != null ? contrat.getCurrency() : "TND";
        boolean isForeignCurrency = !currency.equalsIgnoreCase("TND");

        addInfoRow(table, "Loan Amount:", contrat.getAmount() + " " + currency);
        
        // Show conversion if foreign currency
        if (isForeignCurrency && contrat.getAmountInTND() != null) {
            addInfoRow(table, "Amount in TND:", contrat.getAmountInTND() + " TND");
            addInfoRow(table, "Exchange Rate:", "1 " + currency + " = " + contrat.getExchangeRateUsed() + " TND");
        }
        
        addInfoRow(table, "Interest Rate:", contrat.getRate() + "%");
        addInfoRow(table, "Duration:", contrat.getDuration() + " months");
        
        // Calculate total amount to repay (use TND amount if foreign currency)
        BigDecimal baseAmount = isForeignCurrency && contrat.getAmountInTND() != null 
                ? contrat.getAmountInTND() 
                : contrat.getAmount();
        
        BigDecimal totalInterest = baseAmount
                .multiply(contrat.getRate())
                .multiply(BigDecimal.valueOf(contrat.getDuration()))
                .divide(BigDecimal.valueOf(1200), 2, BigDecimal.ROUND_HALF_UP);
        BigDecimal totalAmount = baseAmount.add(totalInterest);
        
        addInfoRow(table, "Total Interest:", totalInterest + " TND");
        addHighlightRow(table, "TOTAL TO REPAY:", totalAmount + " TND");

        document.add(table);
    }

    private void addTermsAndConditions(Document document) {
        Paragraph sectionTitle = new Paragraph("TERMS AND CONDITIONS")
                .setFontSize(16)
                .setBold()
                .setFontColor(PURPLE_COLOR)
                .setMarginTop(20)
                .setMarginBottom(10);
        document.add(sectionTitle);

        String[] terms = {
            "1. The borrower agrees to repay the loan amount plus interest as per the payment schedule.",
            "2. Late payments may incur additional penalty charges.",
            "3. The borrower must notify Financia of any change in contact information.",
            "4. Early repayment is allowed without penalty.",
            "5. Failure to repay may result in legal action and credit score impact.",
            "6. This contract is governed by the laws of Tunisia.",
            "7. Any disputes will be resolved through arbitration.",
            "8. The borrower confirms all information provided is accurate and complete."
        };

        for (String term : terms) {
            Paragraph termPara = new Paragraph(term)
                    .setFontSize(10)
                    .setMarginBottom(5);
            document.add(termPara);
        }
    }

    private void addSignatureSection(Document document, User user) {
        document.add(new Paragraph("\n\n").setMarginTop(30));

        Table signatureTable = new Table(2);
        signatureTable.setWidth(UnitValue.createPercentValue(100));

        Cell borrowerCell = new Cell()
                .add(new Paragraph("Borrower Signature\n\n\n_____________________\n" + 
                        user.getFirstName() + " " + user.getLastName())
                        .setTextAlignment(TextAlignment.CENTER))
                .setBorder(null);

        Cell financiaCell = new Cell()
                .add(new Paragraph("Financia Representative\n\n\n_____________________\nAuthorized Signatory")
                        .setTextAlignment(TextAlignment.CENTER))
                .setBorder(null);

        signatureTable.addCell(borrowerCell);
        signatureTable.addCell(financiaCell);

        document.add(signatureTable);
    }

    private void addCustomerInfo(Document document, User user, Contrat contrat) {
        Table table = new Table(2);
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(20);

        addInfoRow(table, "Customer Name:", user.getFirstName() + " " + user.getLastName());
        addInfoRow(table, "Contract Number:", "CNT-" + contrat.getId());
        addInfoRow(table, "Loan Amount:", contrat.getAmount() + " TND");
        addInfoRow(table, "Interest Rate:", contrat.getRate() + "%");
        addInfoRow(table, "Duration:", contrat.getDuration() + " months");

        document.add(table);
    }

    private void addPaymentScheduleTable(Document document, List<EcheancierPayement> payments) {
        Paragraph sectionTitle = new Paragraph("PAYMENT SCHEDULE")
                .setFontSize(16)
                .setBold()
                .setFontColor(PURPLE_COLOR)
                .setMarginTop(20)
                .setMarginBottom(10);
        document.add(sectionTitle);

        Table table = new Table(new float[]{1, 2, 2, 2, 2, 2});
        table.setWidth(UnitValue.createPercentValue(100));

        // Header
        addTableHeader(table, "#");
        addTableHeader(table, "Due Date");
        addTableHeader(table, "Principal");
        addTableHeader(table, "Interest");
        addTableHeader(table, "Total Due");
        addTableHeader(table, "Status");

        // Rows
        int index = 1;
        for (EcheancierPayement payment : payments) {
            addTableCell(table, String.valueOf(index++));
            addTableCell(table, payment.getDueDate().format(DATE_FORMATTER));
            addTableCell(table, payment.getPrincipalAmount() + " TND");
            addTableCell(table, payment.getInterestAmount() + " TND");
            addTableCell(table, payment.getAmountDue() + " TND");
            addTableCell(table, payment.getStatus().toString());
        }

        document.add(table);
    }

    private void addPaymentSummary(Document document, List<EcheancierPayement> payments) {
        BigDecimal totalPrincipal = payments.stream()
                .map(EcheancierPayement::getPrincipalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalInterest = payments.stream()
                .map(EcheancierPayement::getInterestAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalAmount = payments.stream()
                .map(EcheancierPayement::getAmountDue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Paragraph summaryTitle = new Paragraph("SUMMARY")
                .setFontSize(16)
                .setBold()
                .setFontColor(PURPLE_COLOR)
                .setMarginTop(20)
                .setMarginBottom(10);
        document.add(summaryTitle);

        Table summaryTable = new Table(2);
        summaryTable.setWidth(UnitValue.createPercentValue(50));

        addInfoRow(summaryTable, "Total Principal:", totalPrincipal + " TND");
        addInfoRow(summaryTable, "Total Interest:", totalInterest + " TND");
        addHighlightRow(summaryTable, "GRAND TOTAL:", totalAmount + " TND");

        document.add(summaryTable);
    }

    private void addFooter(Document document) {
        document.add(new Paragraph("\n\n"));
        
        Paragraph footer = new Paragraph("FINANCIA - Your Trusted Financial Partner\n" +
                "Email: support@financia.tn | Phone: +216 XX XXX XXX\n" +
                "Address: Tunis, Tunisia\n" +
                "© 2024 Financia. All rights reserved.")
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(30);
        document.add(footer);
    }

    private void addInfoRow(Table table, String label, String value) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setBold())
                .setBackgroundColor(LIGHT_GRAY)
                .setPadding(8);
        
        Cell valueCell = new Cell()
                .add(new Paragraph(value))
                .setPadding(8);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addHighlightRow(Table table, String label, String value) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(PURPLE_COLOR)
                .setPadding(8);
        
        Cell valueCell = new Cell()
                .add(new Paragraph(value).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(PURPLE_COLOR)
                .setPadding(8);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addTableHeader(Table table, String text) {
        Cell cell = new Cell()
                .add(new Paragraph(text).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(PURPLE_COLOR)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(8);
        table.addHeaderCell(cell);
    }

    private void addTableCell(Table table, String text) {
        Cell cell = new Cell()
                .add(new Paragraph(text))
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(5);
        table.addCell(cell);
    }
}
