# PDF Generator Testing Guide

## ✅ Implementation Complete!

Professional PDF generation has been successfully integrated into your Financia application using iText7.

---

## 🎯 What Was Implemented

### 1. PDF Generator Service
- ✅ `PdfGeneratorService.java` - Handles PDF creation
- ✅ Contract PDF generation with professional design
- ✅ Payment Schedule PDF generation
- ✅ Beautiful purple theme matching your brand
- ✅ Professional formatting and layout

### 2. PDF Features

#### Contract PDF Includes:
- 📄 Company header with Financia branding
- 📋 Contract information (ID, date, type, status)
- 👤 Customer details (name, email, phone, address)
- 💰 Loan details (amount, rate, duration)
- 🧮 Calculated total interest and repayment amount
- 📜 Terms and conditions
- ✍️ Signature section for borrower and Financia
- 📧 Footer with contact information

#### Payment Schedule PDF Includes:
- 📄 Company header
- 👤 Customer and contract information
- 📊 Detailed payment schedule table with:
  - Payment number
  - Due date
  - Principal amount
  - Interest amount
  - Total due
  - Payment status
- 📈 Summary with totals
- 📧 Footer with contact information

---

## 🚀 How to Test

### Method 1: Generate Contract PDF (View in Browser)

```http
GET http://localhost:8083/api/contrats/{contractId}/pdf
```

**Example:**
```http
GET http://localhost:8083/api/contrats/3/pdf
```

**Result:** PDF opens in browser (inline display)

---

### Method 2: Download Contract PDF

```http
GET http://localhost:8083/api/contrats/{contractId}/download-pdf
```

**Example:**
```http
GET http://localhost:8083/api/contrats/3/download-pdf
```

**Result:** PDF downloads to your computer as `contract-3.pdf`

---

### Method 3: Generate Payment Schedule PDF (View in Browser)

```http
GET http://localhost:8083/api/echeanciers/contrat/{contratId}/schedule-pdf
```

**Example:**
```http
GET http://localhost:8083/api/echeanciers/contrat/3/schedule-pdf
```

**Result:** Payment schedule PDF opens in browser

---

### Method 4: Download Payment Schedule PDF

```http
GET http://localhost:8083/api/echeanciers/contrat/{contratId}/download-schedule-pdf
```

**Example:**
```http
GET http://localhost:8083/api/echeanciers/contrat/3/download-schedule-pdf
```

**Result:** PDF downloads as `payment-schedule-3.pdf`

---

## 📋 API Endpoints Summary

### Contract PDF Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contrats/{id}/pdf` | View contract PDF in browser |
| GET | `/api/contrats/{id}/download-pdf` | Download contract PDF |

### Payment Schedule PDF Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/echeanciers/contrat/{contratId}/schedule-pdf` | View payment schedule in browser |
| GET | `/api/echeanciers/contrat/{contratId}/download-schedule-pdf` | Download payment schedule PDF |

---

## 🎨 PDF Design Features

### Visual Elements:
- ✨ **Purple Theme** - Matches your brand (RGB: 102, 126, 234)
- 📐 **Professional Layout** - Clean, organized sections
- 🎨 **Color-Coded Tables** - Purple headers, light gray backgrounds
- 📊 **Highlighted Totals** - Important amounts stand out
- ✍️ **Signature Section** - Professional signature fields
- 📧 **Footer** - Company contact information

### Typography:
- **Headers:** Bold, large, purple color
- **Labels:** Bold, gray background
- **Values:** Regular weight, clear and readable
- **Tables:** Centered text, proper padding

---

## 🧪 Testing with Swagger

1. Open Swagger UI: `http://localhost:8083/swagger-ui.html`
2. Find "contrat-controller" section
3. Try the PDF endpoints:
   - `GET /api/contrats/{id}/pdf`
   - `GET /api/contrats/{id}/download-pdf`
4. Find "echeancier-payement-controller" section
5. Try the payment schedule endpoints

---

## 🧪 Testing with Postman

### Test Contract PDF:

**Request:**
```
GET http://localhost:8083/api/contrats/3/pdf
```

**Response:**
- Content-Type: `application/pdf`
- Body: PDF binary data
- Opens in Postman PDF viewer

### Test Download:

**Request:**
```
GET http://localhost:8083/api/contrats/3/download-pdf
```

**Response:**
- Content-Disposition: `attachment; filename="contract-3.pdf"`
- Downloads automatically

---

## 📸 What the Contract PDF Looks Like

```
┌─────────────────────────────────────────────┐
│           FINANCIA                          │
│    Your Trusted Financial Partner           │
├─────────────────────────────────────────────┤
│                                             │
│         LOAN CONTRACT                       │
│                                             │
├─────────────────────────────────────────────┤
│  Contract Number:    CNT-3                  │
│  Customer Name:      John Doe               │
│  Email:              john@email.com         │
│  Phone:              +216 XX XXX XXX        │
│  Contract Date:      18/02/2024             │
│  Contract Type:      INITIAL                │
│  Status:             ACTIVE                 │
├─────────────────────────────────────────────┤
│         LOAN DETAILS                        │
├─────────────────────────────────────────────┤
│  Loan Amount:        10,000.00 TND          │
│  Interest Rate:      5.5%                   │
│  Duration:           12 months              │
│  Total Interest:     550.00 TND             │
│  TOTAL TO REPAY:     10,550.00 TND          │
├─────────────────────────────────────────────┤
│         TERMS AND CONDITIONS                │
│  1. The borrower agrees to repay...         │
│  2. Late payments may incur...              │
│  ... (8 terms total)                        │
├─────────────────────────────────────────────┤
│  Borrower Signature    Financia Rep         │
│                                             │
│  ___________________   ___________________  │
│  John Doe              Authorized Signatory │
├─────────────────────────────────────────────┤
│  FINANCIA - Your Trusted Financial Partner  │
│  Email: support@financia.tn                 │
│  © 2024 Financia. All rights reserved.      │
└─────────────────────────────────────────────┘
```

---

## 📸 What the Payment Schedule PDF Looks Like

```
┌─────────────────────────────────────────────┐
│           FINANCIA                          │
│    Your Trusted Financial Partner           │
├─────────────────────────────────────────────┤
│                                             │
│         PAYMENT SCHEDULE                    │
│                                             │
├─────────────────────────────────────────────┤
│  Customer Name:      John Doe               │
│  Contract Number:    CNT-3                  │
│  Loan Amount:        10,000.00 TND          │
│  Interest Rate:      5.5%                   │
│  Duration:           12 months              │
├─────────────────────────────────────────────┤
│         PAYMENT SCHEDULE                    │
├───┬──────────┬─────────┬─────────┬─────────┤
│ # │ Due Date │Principal│Interest │  Total  │
├───┼──────────┼─────────┼─────────┼─────────┤
│ 1 │18/03/2024│ 833.33  │  45.83  │ 879.16  │
│ 2 │18/04/2024│ 833.33  │  45.83  │ 879.16  │
│...│   ...    │   ...   │   ...   │   ...   │
│12 │18/02/2025│ 833.33  │  45.83  │ 879.16  │
├───┴──────────┴─────────┴─────────┴─────────┤
│         SUMMARY                             │
│  Total Principal:    10,000.00 TND          │
│  Total Interest:        550.00 TND          │
│  GRAND TOTAL:        10,550.00 TND          │
└─────────────────────────────────────────────┘
```

---

## 🔧 Technical Details

### Dependencies Added:
```xml
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
    <type>pom</type>
</dependency>
```

### PDF Generation Process:
1. Create ByteArrayOutputStream
2. Initialize PdfWriter and PdfDocument
3. Create Document
4. Add header, title, content sections
5. Add tables with formatted data
6. Add footer
7. Close document
8. Return byte array

### Color Scheme:
- **Primary Purple:** RGB(102, 126, 234)
- **Light Gray:** RGB(245, 247, 250)
- **White:** For highlighted text
- **Gray:** For footer text

---

## 🐛 Troubleshooting

### PDF Not Generating?

**Check 1: Contract Exists**
- Verify the contract ID exists in database

**Check 2: User Data**
- Ensure the contract has an associated user with valid data

**Check 3: Application Logs**
- Check console for error messages
- Look for "PDF generated successfully" message

### Common Errors:

**Error: "Contract not found"**
- Solution: Use a valid contract ID

**Error: "NullPointerException"**
- Solution: Ensure contract has user and credit data

**Error: "Failed to generate PDF"**
- Solution: Check application logs for detailed error

---

## 🎯 Testing Checklist

- [ ] Start the application
- [ ] Create a contract (or use existing one)
- [ ] Test contract PDF view endpoint
- [ ] Test contract PDF download endpoint
- [ ] Create payment schedules for the contract
- [ ] Test payment schedule PDF view endpoint
- [ ] Test payment schedule PDF download endpoint
- [ ] Verify PDF content is correct
- [ ] Verify PDF design looks professional
- [ ] Test with different contracts

---

## 💡 Advanced Features

### Future Enhancements You Could Add:

1. **Add Company Logo**
   - Place logo image in resources
   - Add to PDF header

2. **Add Barcode/QR Code**
   - Generate unique contract identifier
   - Add to PDF for scanning

3. **Watermark**
   - Add "DRAFT" or "CONFIDENTIAL" watermark

4. **Digital Signature**
   - Add digital signature support
   - Verify PDF authenticity

5. **Multi-language Support**
   - Generate PDFs in Arabic/French
   - Based on user preference

6. **Email with PDF Attachment**
   - Combine email + PDF features
   - Send contract PDF via email automatically

---

## 🎉 Success!

Your PDF generation is complete and ready to use! You can now:
- ✅ Generate professional contract PDFs
- ✅ Generate payment schedule PDFs
- ✅ View PDFs in browser
- ✅ Download PDFs to computer
- ✅ Beautiful purple-themed design
- ✅ All contract and payment details included

**Next Steps:**
1. Test the PDF generation
2. Customize the design if needed
3. Add company logo (optional)
4. Integrate with email to send PDFs as attachments

---

**Happy Testing! 🚀**
