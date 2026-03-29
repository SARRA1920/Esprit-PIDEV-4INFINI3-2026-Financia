# 📱 Test SMS - Guide Ultra-Simplifié

## 🎯 3 Choses à Faire

### 1️⃣ Configurer Twilio (5 min)

**A. Obtenir Auth Token:**
- https://console.twilio.com/ → "Show" Auth Token → Copier

**B. Obtenir Numéro:**
- Cliquer "Get a trial phone number" → Copier le numéro

**C. Vérifier Votre Numéro:**
- Phone Numbers → Verified Caller IDs → "+" → +21620285074 → Vérifier avec code SMS

**D. Modifier application.properties:**
```properties
twilio.auth.token=VOTRE_TOKEN_ICI
twilio.phone.number=VOTRE_NUMERO_ICI
twilio.enabled=true
```

### 2️⃣ Redémarrer l'Application

Stop ⏹️ → Run ▶️

### 3️⃣ Tester dans Swagger

**A. Test Manuel:**
```
POST /api/sms/send-custom
phoneNumber: +21620285074
message: Test
```
→ SMS reçu? ✅

**B. Test Automatique:**
```
POST /api/echeanciers/contrat/1
{
  "dueDate": "2026-03-01",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```
→ SMS reçu automatiquement? ✅

---

## ✅ C'est Tout!

Si les 2 SMS sont reçus, c'est fonctionnel! 🎉

Guide complet: `TEST_SMS_FINAL.md`
