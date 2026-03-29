# API Integration Plan - Financia Project

## Overview
Integration of 3 external services for Contrat and EcheancierPayement modules:
1. **Email Service (SMTP)** - Send contract via email
2. **Exchange Rate API** - Multi-currency support
3. **PDF Generator** - Generate contract documents

---

## 1. Email Service (SMTP) - Gmail/Mailtrap

### Purpose
Send contract documents and payment reminders to customers via email.

### Technology
- Spring Boot Mail Starter
- Gmail SMTP (free) or Mailtrap (testing)
- No external API calls - built into Spring

### Use Cases
**For Contrat:**
- Send contract PDF when created
- Send contract confirmation after signing
- Send contract updates/amendments

**For EcheancierPayement:**
- Send payment schedule when contract is created
- Send payment reminders (3 days before due date)
- Send overdue payment notifications

### Implementation Steps

#### Step 1: Add Dependency to pom.xml
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

#### Step 2: Configure application.properties
```properties
# Gmail SMTP Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

#### Step 3: Create EmailService
```java
@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendContractEmail(String to, String contractId, byte[] pdfAttachment);
    public void sendPaymentReminder(String to, EcheancierPayement payment);
    public void sendOverdueNotification(String to, EcheancierPayement payment);
}
```

#### Step 4: Create API Endpoints
```
POST /api/contrats/{id}/send-email
POST /api/echeanciers/{id}/send-reminder
POST /api/echeanciers/send-overdue-notifications
```

### Testing
- Use Mailtrap.io for testing (no real emails sent)
- Or use Gmail with app-specific password

---

## 2. Exchange Rate API - Frankfurter

### Purpose
Convert contract amounts between different currencies (USD, EUR, TND).

### Technology
- Frankfurter API: `https://api.frankfurter.app`
- Free, no API key required
- RestTemplate or WebClient for HTTP calls

### Use Cases
**For Contrat:**
- Convert loan amount from foreign currency to TND
- Store both original and converted amounts
- Display contract value in multiple currencies
- Track exchange rate at time of contract creation

**For EcheancierPayement:**
- Convert payment amounts to customer's preferred currency
- Show payment schedule in multiple currencies
- Calculate total debt in different currencies

### Implementation Steps

#### Step 1: Add RestTemplate Bean
```java
@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

#### Step 2: Create ExchangeRateService
```java
@Service
public class ExchangeRateService {
    private static final String API_URL = "https://api.frankfurter.app";
    
    @Autowired
    private RestTemplate restTemplate;
    
    public BigDecimal getExchangeRate(String from, String to);
    public BigDecimal convertAmount(BigDecimal amount, String from, String to);
    public Map<String, BigDecimal> getLatestRates(String baseCurrency);
}
```

#### Step 3: Update Contrat Entity
```java
@Entity
public class Contrat {
    // Existing fields...
    
    @Column(length = 3)
    private String currency; // "USD", "EUR", "TND"
    
    @Column(precision = 12, scale = 3)
    private BigDecimal originalAmount;
    
    @Column(precision = 12, scale = 3)
    private BigDecimal amountInTND;
    
    @Column(precision = 10, scale = 6)
    private BigDecimal exchangeRateUsed;
}
```

#### Step 4: Create API Endpoints
```
GET /api/contrats/exchange-rate?from=USD&to=TND
POST /api/contrats/{id}/convert?toCurrency=EUR
GET /api/contrats/{id}/multi-currency-view
GET /api/echeanciers/{id}/convert?toCurrency=USD
```

### API Response Example
```json
{
  "amount": 1.0,
  "base": "USD",
  "date": "2024-02-18",
  "rates": {
    "TND": 3.15,
    "EUR": 0.92
  }
}
```

---

## 3. PDF Generator - iText or Flying Saucer

### Purpose
Generate professional PDF documents for contracts and payment schedules.

### Technology Options

#### Option A: iText (Recommended)
- Most popular Java PDF library
- Free community version
- Programmatic PDF creation

#### Option B: Flying Saucer + Thymeleaf
- HTML to PDF conversion
- Use Thymeleaf templates
- Easier for designers

### Use Cases
**For Contrat:**
- Generate contract PDF with all details
- Include terms and conditions
- Add signature fields
- Generate contract summary report

**For EcheancierPayement:**
- Generate payment schedule PDF
- Create payment receipt
- Generate overdue payment report
- Create monthly payment summary

### Implementation Steps

#### Step 1: Add Dependencies to pom.xml
```xml
<!-- Option A: iText -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
    <type>pom</type>
</dependency>

<!-- Option B: Flying Saucer (HTML to PDF) -->
<dependency>
    <groupId>org.xhtmlrenderer</groupId>
    <artifactId>flying-saucer-pdf</artifactId>
    <version>9.1.22</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

#### Step 2: Create PdfGeneratorService
```java
@Service
public class PdfGeneratorService {
    
    public byte[] generateContractPdf(Contrat contrat);
    public byte[] generatePaymentSchedulePdf(List<EcheancierPayement> payments);
    public byte[] generatePaymentReceipt(EcheancierPayement payment);
    public byte[] generateOverdueReport(List<EcheancierPayement> overduePayments);
}
```

#### Step 3: Create API Endpoints
```
GET /api/contrats/{id}/pdf
GET /api/contrats/{id}/download-pdf
GET /api/echeanciers/contrat/{contratId}/schedule-pdf
GET /api/echeanciers/{id}/receipt-pdf
GET /api/echeanciers/overdue-report-pdf
```

#### Step 4: PDF Content Structure

**Contract PDF includes:**
- Company logo and header
- Contract number and date
- Customer information (from User)
- Loan details (amount, rate, duration)
- Payment schedule summary
- Terms and conditions
- Signature section

**Payment Schedule PDF includes:**
- Contract reference
- Customer name
- Payment table (date, principal, interest, total)
- Total amounts
- Payment instructions

---

## Integration Flow

### Scenario 1: Create Contract with Email
```
1. POST /api/contrats/credit/{creditId}
   ↓
2. ContratService creates contract
   ↓
3. If currency != TND:
   - Call ExchangeRateService.convertAmount()
   - Store both amounts
   ↓
4. Generate payment schedule (EcheancierPayement)
   ↓
5. PdfGeneratorService.generateContractPdf()
   ↓
6. EmailService.sendContractEmail() with PDF attachment
   ↓
7. Return contract to client
```

### Scenario 2: Payment Reminder Scheduler
```
1. Scheduled job runs daily
   ↓
2. Find payments due in 3 days (status = PENDING)
   ↓
3. For each payment:
   - Get customer email from User
   - Generate payment details
   - EmailService.sendPaymentReminder()
```

### Scenario 3: Multi-Currency Contract View
```
1. GET /api/contrats/{id}/multi-currency-view
   ↓
2. Get contract from database
   ↓
3. ExchangeRateService.getLatestRates(contract.currency)
   ↓
4. Return contract with amounts in USD, EUR, TND
```

---

## API Endpoints Summary

### Contrat Module (2 APIs)

#### Exchange Rate Integration
- `GET /api/contrats/exchange-rate?from={currency}&to={currency}`
- `POST /api/contrats/{id}/convert?toCurrency={currency}`
- `GET /api/contrats/{id}/multi-currency-view`

#### PDF + Email Integration
- `GET /api/contrats/{id}/pdf` - Generate PDF
- `GET /api/contrats/{id}/download-pdf` - Download PDF
- `POST /api/contrats/{id}/send-email` - Send contract via email

### EcheancierPayement Module (1 API + Email)

#### PDF Generation
- `GET /api/echeanciers/contrat/{contratId}/schedule-pdf`
- `GET /api/echeanciers/{id}/receipt-pdf`
- `GET /api/echeanciers/overdue-report-pdf`

#### Email Notifications
- `POST /api/echeanciers/{id}/send-reminder`
- `POST /api/echeanciers/send-overdue-notifications`
- `POST /api/echeanciers/contrat/{contratId}/send-schedule`

---

## Database Changes

### Update Contrat Entity
```sql
ALTER TABLE contrat ADD COLUMN currency VARCHAR(3);
ALTER TABLE contrat ADD COLUMN original_amount DECIMAL(12,3);
ALTER TABLE contrat ADD COLUMN amount_in_tnd DECIMAL(12,3);
ALTER TABLE contrat ADD COLUMN exchange_rate_used DECIMAL(10,6);
ALTER TABLE contrat ADD COLUMN pdf_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE contrat ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
```

### Update EcheancierPayement Entity
```sql
ALTER TABLE echeancier_payement ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE echeancier_payement ADD COLUMN reminder_sent_date TIMESTAMP;
```

---

## Testing Plan

### 1. Exchange Rate API Testing
- Test with valid currencies (USD, EUR, TND)
- Test with invalid currencies
- Test API unavailability (fallback to default rate)
- Test conversion accuracy

### 2. PDF Generation Testing
- Generate contract PDF and verify content
- Generate payment schedule PDF
- Test PDF with special characters
- Test PDF download

### 3. Email Service Testing
- Use Mailtrap for testing
- Test email with PDF attachment
- Test email without attachment
- Test invalid email addresses
- Test email delivery failures

### 4. Integration Testing
- Create contract → Generate PDF → Send email (full flow)
- Create contract with USD → Convert to TND → Generate PDF
- Payment reminder scheduler test

---

## Configuration Files

### application.properties
```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${EMAIL_USERNAME}
spring.mail.password=${EMAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Exchange Rate API
exchange.rate.api.url=https://api.frankfurter.app
exchange.rate.default.currency=TND

# PDF Configuration
pdf.company.name=Financia
pdf.company.logo=/static/logo.png
pdf.output.directory=/tmp/pdfs
```

---

## Timeline

### Week 1: Exchange Rate Integration
- Day 1-2: Create ExchangeRateService
- Day 3: Update Contrat entity with currency fields
- Day 4: Create API endpoints
- Day 5: Testing

### Week 2: PDF Generation
- Day 1-2: Add dependencies and create PdfGeneratorService
- Day 3: Design contract PDF template
- Day 4: Design payment schedule PDF template
- Day 5: Testing

### Week 3: Email Integration
- Day 1-2: Configure SMTP and create EmailService
- Day 3: Integrate with PDF generator
- Day 4: Create email templates
- Day 5: Testing

### Week 4: Integration & Testing
- Day 1-2: Full integration testing
- Day 3: Bug fixes
- Day 4: Documentation
- Day 5: Demo preparation

---

## Deliverables

1. ✅ ExchangeRateService with API integration
2. ✅ PdfGeneratorService for contracts and schedules
3. ✅ EmailService with SMTP configuration
4. ✅ Updated Contrat and EcheancierPayement entities
5. ✅ New API endpoints (10+ endpoints)
6. ✅ Email templates (HTML)
7. ✅ PDF templates
8. ✅ Unit tests for all services
9. ✅ Integration tests
10. ✅ Postman collection for testing
11. ✅ Documentation

---

## Notes

- All APIs are FREE and open-source
- No API keys required for Exchange Rate API
- Gmail requires "App Password" (not regular password)
- Use Mailtrap.io for email testing (no real emails sent)
- iText community version is free for open-source projects
- Consider adding scheduled jobs for payment reminders

---

## Questions to Consider

1. Should we store generated PDFs in database or file system?
2. Should we send emails automatically or manually trigger?
3. What currencies should we support? (USD, EUR, TND only?)
4. Should we cache exchange rates or fetch real-time?
5. What happens if email fails? Retry mechanism?

---

## Success Criteria

✅ Contract can be created with any supported currency
✅ Contract amount automatically converted to TND
✅ PDF generated for every contract
✅ Email sent with PDF attachment
✅ Payment reminders sent automatically
✅ All APIs working without errors
✅ Proper error handling for API failures
✅ Clean code with proper separation of concerns
