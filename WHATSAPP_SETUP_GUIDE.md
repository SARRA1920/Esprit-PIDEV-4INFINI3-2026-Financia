# WhatsApp Integration Setup Guide

## ✅ Configuration Complete!

Your application is now configured to send WhatsApp messages instead of SMS.

### Configuration Applied:
```properties
twilio.account.sid=AC5550b799fb4c1eadbe36e1de931fefa4
twilio.auth.token=c3ebdc01e5f82717614827cdd398796c
twilio.whatsapp.number=whatsapp:+14155238886
twilio.whatsapp.enabled=true
```

---

## 🔧 Setup Steps (One-Time)

### Step 1: Join Twilio WhatsApp Sandbox

**IMPORTANT:** Before you can receive WhatsApp messages, you must join the Twilio sandbox:

1. Open WhatsApp on your phone (+216 20 285 074)
2. Send a message to: **+1 415 523 8886**
3. Message content: **join [your-sandbox-code]**

**To find your sandbox code:**
- Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
- Look for "join [code]" (e.g., "join happy-tiger")
- Send that exact message to +1 415 523 8886

**You'll receive a confirmation message from Twilio when joined successfully!**

---

## 🚀 Testing

### Restart Your Application First!
```bash
# Stop and restart your Spring Boot application
```

### Test 1: Check WhatsApp Service Status
```powershell
Invoke-RestMethod -Uri "http://localhost:8083/api/whatsapp/status" -Method Get
```

**Expected:** `enabled: True`

### Test 2: Send Test WhatsApp
```powershell
Invoke-RestMethod -Uri "http://localhost:8083/api/whatsapp/send-custom?phoneNumber=%2B21620285074&message=Test%20WhatsApp%20from%20Financia" -Method Post
```

**Expected:** You should receive a WhatsApp message within 1-5 seconds!

### Test 3: Run Full Automatic Test
```powershell
.\test-automatic-whatsapp.ps1
```

---

## 📱 WhatsApp Message Format

Your users will receive beautifully formatted WhatsApp messages:

```
🔔 *Financia - Notification de Retard*

Bonjour *Anas*,

Votre paiement du *25/03/2026* est en retard de *4 jours*.

💰 *Détails:*
• Montant dû: 900.000 TND
• Pénalité: 1.500 TND
• Total: *901.500 TND*

⚠️ Merci de régulariser votre situation rapidement pour éviter des pénalités supplémentaires.

_Financia - Votre partenaire financier_
```

---

## 🎯 Benefits Over SMS

✅ **Instant delivery** (1-5 seconds vs 1-5 minutes)  
✅ **Rich formatting** (bold, italic, emojis)  
✅ **Read receipts** (know when user reads it)  
✅ **Much cheaper** (~$0.005 vs $0.10 per message)  
✅ **Higher engagement** (98% open rate)  
✅ **Free for testing** (Twilio sandbox)

---

## 🔍 Troubleshooting

### WhatsApp not received?

1. **Did you join the sandbox?**
   - Send "join [code]" to +1 415 523 8886
   - Wait for confirmation message

2. **Check application logs:**
   - Look for: "WhatsApp sent successfully to whatsapp:+21620285074 - SID: SMXXXXXXXXX"
   - Or: "Failed to send WhatsApp: [error]"

3. **Verify phone number format:**
   - Should be: +216 20 285 074
   - Will be converted to: whatsapp:+21620285074

### Common Errors:

**"Recipient not in sandbox"**
- Solution: Join the sandbox first (see Step 1)

**"Invalid phone number"**
- Solution: Ensure number starts with +216

**"Authentication failed"**
- Solution: Check auth token is correct

---

## 📊 API Endpoints Changed

| Old (SMS) | New (WhatsApp) |
|-----------|----------------|
| `/api/sms/status` | `/api/whatsapp/status` |
| `/api/sms/send-custom` | `/api/whatsapp/send-custom` |
| `/api/sms/send-penalty-notification/{id}` | `/api/whatsapp/send-penalty-notification/{id}` |

---

## 🎉 Ready to Test!

1. ✅ Join Twilio WhatsApp sandbox
2. ✅ Restart your application
3. ✅ Run the test script
4. ✅ Receive instant WhatsApp notifications!

**Next:** Run `.\test-automatic-whatsapp.ps1` to test the complete flow!
