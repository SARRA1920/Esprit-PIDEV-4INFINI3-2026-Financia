# Currency Display in Email & PDF - Examples

## ✅ What's New

Now when you create a contract in a foreign currency (USD, EUR, etc.), the customer will receive an email and PDF showing:
1. **Original amount** in their currency (e.g., $10,000 USD)
2. **Converted amount** in TND (e.g., 31,500 TND)
3. **Exchange rate** used (e.g., 1 USD = 3.15 TND)

---

## 📧 Email Examples

### Example 1: Contract in TND (Local Currency)

**Contract Created:**
```json
{
  "amount": 10000.00,
  "currency": "TND",
  ...
}
```

**Email Shows:**
```
┌─────────────────────────────────────┐
│  💰 Loan Amount: 10,000 TND         │
└─────────────────────────────────────┘
```

**Simple and clean - no conversion needed!**

---

### Example 2: Contract in USD (Foreign Currency)

**Contract Created:**
```json
{
  "amount": 10000.00,
  "currency": "USD",
  ...
}
```

**Email Shows:**
```
┌─────────────────────────────────────────────┐
│  💰 Loan Amount: 10,000 USD                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  💱 Currency Conversion             │   │
│  │                                     │   │
│  │  10,000 USD = 31,500 TND            │   │
│  │                                     │   │
│  │  Exchange Rate: 1 USD = 3.15 TND    │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Customer sees both amounts clearly!**

---

### Example 3: Contract in EUR (Foreign Currency)

**Contract Created:**
```json
{
  "amount": 5000.00,
  "currency": "EUR",
  ...
}
```

**Email Shows:**
```
┌─────────────────────────────────────────────┐
│  💰 Loan Amount: 5,000 EUR                  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  💱 Currency Conversion             │   │
│  │                                     │   │
│  │  5,000 EUR = 17,100 TND             │   │
│  │                                     │   │
│  │  Exchange Rate: 1 EUR = 3.42 TND    │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 📄 PDF Examples

### Example 1: PDF for TND Contract

```
┌─────────────────────────────────────┐
│         LOAN DETAILS                │
├─────────────────────────────────────┤
│  Loan Amount:      10,000 TND       │
│  Interest Rate:    5.5%             │
│  Duration:         12 months        │
│  Total Interest:   550 TND          │
│  TOTAL TO REPAY:   10,550 TND       │
└─────────────────────────────────────┘
```

---

### Example 2: PDF for USD Contract

```
┌─────────────────────────────────────┐
│         LOAN DETAILS                │
├─────────────────────────────────────┤
│  Loan Amount:      10,000 USD       │
│  Amount in TND:    31,500 TND       │
│  Exchange Rate:    1 USD = 3.15 TND │
│  Interest Rate:    5.5%             │
│  Duration:         12 months        │
│  Total Interest:   1,732.50 TND     │
│  TOTAL TO REPAY:   33,232.50 TND    │
└─────────────────────────────────────┘
```

**Note:** Interest and total repayment are calculated in TND!

---

### Example 3: PDF for EUR Contract

```
┌─────────────────────────────────────┐
│         LOAN DETAILS                │
├─────────────────────────────────────┤
│  Loan Amount:      5,000 EUR        │
│  Amount in TND:    17,100 TND       │
│  Exchange Rate:    1 EUR = 3.42 TND │
│  Interest Rate:    5.5%             │
│  Duration:         12 months        │
│  Total Interest:   940.50 TND       │
│  TOTAL TO REPAY:   18,040.50 TND    │
└─────────────────────────────────────┘
```

---

## 🎯 Complete Flow Example

### Scenario: Ahmed wants a $10,000 USD loan

**Step 1: Create Contract**
```json
POST /api/contrats/credit/1

{
  "signedDate": "2024-02-18",
  "amount": 10000.00,
  "rate": 5.5,
  "duration": 12,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL",
  "currency": "USD"
}
```

**Step 2: System Automatically:**
- Calls Exchange Rate API
- Gets rate: 1 USD = 3.15 TND
- Converts: $10,000 × 3.15 = 31,500 TND
- Stores both amounts

**Step 3: Email Sent to Ahmed**

```
Subject: 🎉 Your Loan Contract is Ready - Financia

Dear Ahmed Hassan,

🎉 Congratulations! Your loan contract has been successfully 
created and is now ready for your review.

┌─────────────────────────────────────────────┐
│         📋 CONTRACT DETAILS                 │
├─────────────────────────────────────────────┤
│  Contract ID:      CNT-123                  │
│  Contract Type:    INITIAL                  │
│  Signed Date:      18/02/2024               │
│  Duration:         12 months                │
│  Interest Rate:    5.5%                     │
│  Status:           ACTIVE                   │
├─────────────────────────────────────────────┤
│                                             │
│  💰 Loan Amount: 10,000 USD                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  💱 Currency Conversion             │   │
│  │                                     │   │
│  │  10,000 USD = 31,500 TND            │   │
│  │                                     │   │
│  │  Exchange Rate: 1 USD = 3.15 TND    │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

📌 Important: Please review all the contract details 
carefully. If you have any questions or need clarification, 
our support team is here to help you.

[View Full Contract Details]

What's Next?
✓ Your payment schedule has been generated
✓ You will receive payment reminders before each due date
✓ You can track your payments anytime through our portal

Thank you for choosing Financia as your financial partner.

Best regards,
Financia Team
```

**Step 4: Ahmed Opens Email**

Ahmed sees:
- ✅ His loan is $10,000 USD (what he requested)
- ✅ Equivalent is 31,500 TND (for his records)
- ✅ Exchange rate is clear (1 USD = 3.15 TND)
- ✅ Professional and transparent!

---

## 🎨 Visual Design

### Currency Conversion Box in Email:

```css
┌─────────────────────────────────────┐
│  💱 Currency Conversion             │
│  (Light blue gradient background)   │
│                                     │
│  10,000 USD = 31,500 TND            │
│  (Purple highlight on TND amount)   │
│                                     │
│  Exchange Rate: 1 USD = 3.15 TND    │
│  (Small gray text)                  │
└─────────────────────────────────────┘
```

**Features:**
- Light blue gradient background
- Purple left border
- Bold TND amount in purple
- Clear exchange rate display
- Professional and easy to read

---

## 💡 Benefits

### For Customers:
✅ **Transparency** - See both amounts clearly
✅ **Understanding** - Know exact conversion
✅ **Trust** - Exchange rate is shown
✅ **Clarity** - No confusion about amounts

### For Your Business:
✅ **Professional** - Shows attention to detail
✅ **International** - Support foreign currencies
✅ **Compliance** - Clear disclosure of rates
✅ **Trust** - Builds customer confidence

---

## 🧪 Testing

### Test 1: Create USD Contract
```json
POST /api/contrats/credit/1
{
  "amount": 1000.00,
  "currency": "USD",
  ...
}
```

**Check email:** Should show both USD and TND amounts

---

### Test 2: Create EUR Contract
```json
POST /api/contrats/credit/1
{
  "amount": 1000.00,
  "currency": "EUR",
  ...
}
```

**Check email:** Should show both EUR and TND amounts

---

### Test 3: Create TND Contract
```json
POST /api/contrats/credit/1
{
  "amount": 10000.00,
  "currency": "TND",
  ...
}
```

**Check email:** Should show only TND amount (no conversion box)

---

## 📋 Summary

| Currency | Email Shows | PDF Shows |
|----------|-------------|-----------|
| TND | Amount in TND only | Amount in TND only |
| USD | Amount in USD + Conversion to TND + Rate | Amount in USD + TND + Rate |
| EUR | Amount in EUR + Conversion to TND + Rate | Amount in EUR + TND + Rate |
| GBP | Amount in GBP + Conversion to TND + Rate | Amount in GBP + TND + Rate |

---

## 🎉 Result

**Before:**
- Email: "Loan Amount: 10,000" (What currency? 🤔)

**After:**
- Email: "Loan Amount: 10,000 USD"
- Plus: "10,000 USD = 31,500 TND"
- Plus: "Exchange Rate: 1 USD = 3.15 TND"
- ✅ Crystal clear!

---

**Your customers will love the transparency and professionalism!** 🚀
