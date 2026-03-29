# How to Use Currency in Contracts

## 📌 Understanding Currency in Contracts

When you create a contract, you can now specify the currency. The system will:
1. Store the original amount in the original currency
2. Automatically convert to TND (Tunisian Dinar)
3. Store the exchange rate used
4. Store both amounts for reference

---

## 🎯 How It Works

### Scenario 1: Contract in TND (Default)

**Request:**
```json
POST http://localhost:8083/api/contrats/credit/1

{
  "signedDate": "2024-02-18",
  "amount": 10000.00,
  "rate": 5.5,
  "duration": 12,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL",
  "currency": "TND"
}
```

**What happens:**
- `currency`: TND
- `originalAmount`: 10000.00
- `amount`: 10000.00
- `amountInTND`: 10000.00
- `exchangeRateUsed`: 1.0

---

### Scenario 2: Contract in USD

**Request:**
```json
POST http://localhost:8083/api/contrats/credit/1

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

**What happens:**
- System calls Exchange Rate API
- Gets rate: 1 USD = 3.15 TND
- Stores:
  - `currency`: USD
  - `originalAmount`: 10000.00 (USD)
  - `amount`: 10000.00 (USD)
  - `amountInTND`: 31500.00 (TND)
  - `exchangeRateUsed`: 3.15

**Result:** Customer borrows $10,000 USD, which equals 31,500 TND

---

### Scenario 3: Contract in EUR

**Request:**
```json
POST http://localhost:8083/api/contrats/credit/1

{
  "signedDate": "2024-02-18",
  "amount": 5000.00,
  "rate": 5.5,
  "duration": 12,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL",
  "currency": "EUR"
}
```

**What happens:**
- System calls Exchange Rate API
- Gets rate: 1 EUR = 3.42 TND
- Stores:
  - `currency`: EUR
  - `originalAmount`: 5000.00 (EUR)
  - `amount`: 5000.00 (EUR)
  - `amountInTND`: 17100.00 (TND)
  - `exchangeRateUsed`: 3.42

**Result:** Customer borrows €5,000 EUR, which equals 17,100 TND

---

### Scenario 4: No Currency Specified (Defaults to TND)

**Request:**
```json
POST http://localhost:8083/api/contrats/credit/1

{
  "signedDate": "2024-02-18",
  "amount": 10000.00,
  "rate": 5.5,
  "duration": 12,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL"
}
```

**What happens:**
- Currency defaults to "TND"
- No conversion needed
- All amounts are the same

---

## 📊 Database Structure

After creating contracts with different currencies, your database will look like:

| id | amount | currency | originalAmount | amountInTND | exchangeRateUsed |
|----|--------|----------|----------------|-------------|------------------|
| 1  | 10000  | TND      | 10000          | 10000       | 1.0              |
| 2  | 10000  | USD      | 10000          | 31500       | 3.15             |
| 3  | 5000   | EUR      | 5000           | 17100       | 3.42             |
| 4  | 8000   | GBP      | 8000           | 25200       | 3.15             |

---

## 🎯 Supported Currencies

You can use any of these currency codes:

- **TND** - Tunisian Dinar (default)
- **USD** - US Dollar
- **EUR** - Euro
- **GBP** - British Pound
- **JPY** - Japanese Yen
- **CAD** - Canadian Dollar
- **AUD** - Australian Dollar
- **CHF** - Swiss Franc
- And 20+ more...

---

## 🔍 How to Check Currency of Existing Contracts

### Method 1: Get Contract by ID

**Request:**
```
GET http://localhost:8083/api/contrats/3
```

**Response:**
```json
{
  "id": 3,
  "amount": 10000.00,
  "currency": "USD",
  "originalAmount": 10000.00,
  "amountInTND": 31500.00,
  "exchangeRateUsed": 3.15,
  "rate": 5.5,
  "duration": 12,
  ...
}
```

**You can see:**
- Original amount: $10,000 USD
- Converted amount: 31,500 TND
- Exchange rate used: 3.15

---

### Method 2: Multi-Currency View

**Request:**
```
GET http://localhost:8083/api/contrats/3/multi-currency-view
```

**Response:**
```json
{
  "contractId": 3,
  "baseCurrency": "USD",
  "baseAmount": 10000.00,
  "conversions": {
    "USD": 10000.00,
    "EUR": 9205.00,
    "TND": 31500.00,
    "GBP": 7900.00
  }
}
```

**You can see the contract amount in multiple currencies!**

---

## 💡 Real-World Example

### Customer Story:

**Ahmed** is a Tunisian businessman who wants a loan to import goods from USA.

1. **Ahmed applies for loan:**
   - Amount: $10,000 USD
   - He needs dollars to pay his US supplier

2. **You create contract:**
```json
{
  "amount": 10000.00,
  "currency": "USD",
  ...
}
```

3. **System automatically:**
   - Calls Exchange Rate API
   - Gets current rate: 1 USD = 3.15 TND
   - Converts: $10,000 × 3.15 = 31,500 TND
   - Stores both amounts

4. **Ahmed sees:**
   - "Your loan: $10,000 USD (31,500 TND)"
   - He knows exactly how much in both currencies

5. **For accounting:**
   - Your company records: 31,500 TND loan
   - But customer sees: $10,000 USD
   - Everyone is happy! ✅

---

## 🧪 Testing Steps

### Step 1: Create Contract in USD

**Postman/Swagger:**
```json
POST http://localhost:8083/api/contrats/credit/1

{
  "signedDate": "2024-02-18",
  "amount": 1000.00,
  "rate": 5.5,
  "duration": 12,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL",
  "currency": "USD"
}
```

### Step 2: Check the Response

You should see:
```json
{
  "id": 4,
  "amount": 1000.00,
  "currency": "USD",
  "originalAmount": 1000.00,
  "amountInTND": 3150.00,
  "exchangeRateUsed": 3.15,
  ...
}
```

### Step 3: View in Multiple Currencies

```
GET http://localhost:8083/api/contrats/4/multi-currency-view
```

You'll see the $1,000 USD converted to EUR, GBP, TND, etc.!

---

## 🎨 How It Appears in Email/PDF

When you send the contract email or generate PDF, it will show:

```
Loan Amount: $10,000 USD
Equivalent in TND: 31,500 TND
Exchange Rate: 1 USD = 3.15 TND
Date: 2024-02-18
```

---

## ❓ FAQ

**Q: What if I don't specify currency?**
A: It defaults to TND (Tunisian Dinar)

**Q: Can I change currency after creating contract?**
A: Not recommended, but you can update it. The exchange rate will be recalculated.

**Q: What if Exchange Rate API is down?**
A: System uses 1:1 rate as fallback (no conversion)

**Q: Can I see historical exchange rates?**
A: Yes! The `exchangeRateUsed` field stores the rate at contract creation time

**Q: Which currency should I use for local customers?**
A: Use TND for Tunisian customers, unless they specifically request foreign currency

---

## ✅ Summary

**Before (Old Way):**
- Amount: 10000
- Currency: ??? (Unknown)
- Problem: Don't know if it's TND, USD, or EUR

**After (New Way):**
- Amount: 10000
- Currency: USD
- Original Amount: 10000 USD
- Amount in TND: 31500 TND
- Exchange Rate: 3.15
- ✅ Clear and transparent!

---

**Now you can create contracts in any currency and the system handles conversion automatically!** 🎉
