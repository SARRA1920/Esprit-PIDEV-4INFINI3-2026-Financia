# 📱 Test SMS Automatique - Guide Final

## ✅ Code Déjà Prêt

Toutes les modifications de code sont terminées. Il ne reste que la configuration Twilio.

---

## 🔧 CONFIGURATION TWILIO (5 minutes)

### Étape 1: Obtenir Auth Token

1. Allez sur: https://console.twilio.com/
2. Connectez-vous
3. Dans le Dashboard, cherchez **"Auth Token"**
4. Cliquez sur **"Show"** 👁️
5. **Copiez** le token (32 caractères)

### Étape 2: Obtenir Numéro Twilio

1. Dans Twilio Console, cliquez sur **"Get a trial phone number"** (bouton rouge)
2. Acceptez le numéro proposé
3. **Copiez** ce numéro (ex: +12345678900)

### Étape 3: Vérifier Votre Numéro

**IMPORTANT:** En mode Trial, vous devez vérifier votre numéro!

1. Twilio Console → **Phone Numbers** → **Verified Caller IDs**
2. Cliquez sur **"+"** (Add a new number)
3. Entrez: `+21620285074`
4. Cliquez sur **"Verify"**
5. Vous recevrez un code SMS
6. Entrez le code

### Étape 4: Configurer application.properties

Ouvrez: `src/main/resources/application.properties`

Trouvez la section Twilio et modifiez:

```properties
### Twilio SMS Configuration ###
twilio.account.sid=AC5550b799fb4c1eadbe36e1de931fefa4
twilio.auth.token=COLLEZ_ICI_VOTRE_AUTH_TOKEN
twilio.phone.number=COLLEZ_ICI_VOTRE_NUMERO_TWILIO
twilio.enabled=true
```

**Remplacez:**
- `COLLEZ_ICI_VOTRE_AUTH_TOKEN` → Auth Token de l'étape 1
- `COLLEZ_ICI_VOTRE_NUMERO_TWILIO` → Numéro de l'étape 2
- Vérifiez que `twilio.enabled=true`

**Exemple:**
```properties
twilio.account.sid=AC5550b799fb4c1eadbe36e1de931fefa4
twilio.auth.token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
twilio.phone.number=+12345678900
twilio.enabled=true
```

### Étape 5: Sauvegarder

Sauvegardez le fichier `application.properties` (Ctrl+S)

---

## 🚀 TEST SMS AUTOMATIQUE

### Étape 6: Redémarrer l'Application

1. **Arrêtez** l'application (bouton Stop ⏹️)
2. **Redémarrez-la** (bouton Run ▶️)
3. Attendez dans la console: `Started FinanciaApplication`

### Étape 7: Ouvrir Swagger

1. Ouvrez votre navigateur
2. Allez sur: `http://localhost:8083/swagger-ui.html`

### Étape 8: Vérifier le Service SMS

1. Trouvez **sms-controller**
2. Cliquez sur **GET /api/sms/status**
3. **Try it out** → **Execute**

**Résultat attendu:**
```json
{
  "enabled": true,
  "service": "Twilio"
}
```

✅ Si `enabled: true`, continuez!

### Étape 9: Test SMS Manuel (Vérification)

1. **sms-controller** → **POST /api/sms/send-custom**
2. **Try it out**
3. Paramètres:
   - `phoneNumber`: `+21620285074`
   - `message`: `Test SMS`
4. **Execute**

**Vérifiez votre téléphone!** 📱

✅ Si SMS reçu, continuez!

### Étape 10: Créer Paiement OVERDUE (SMS Automatique!)

1. **echeancier-payement-controller**
2. **POST /api/echeanciers/contrat/1**
3. **Try it out**
4. Collez:

```json
{
  "dueDate": "2026-03-01",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

5. **Execute**

### Étape 11: Vérifier Votre Téléphone 📱

**Vous devriez recevoir:**

```
Bonjour [Votre Prénom],

Votre paiement du 2026-03-01 est maintenant en retard.
Montant dû: 1000.000 TND

Merci de régulariser votre situation rapidement pour éviter des pénalités supplémentaires.

Financia
```

✅ **SMS AUTOMATIQUE REÇU!** 🎉

### Étape 12: Vérifier les Logs

Dans la console de l'application, vous devriez voir:

```
Overdue SMS sent to user 1 for payment 7
SMS sent successfully to +21620285074 - SID: SM...
```

---

## 🧪 TEST COMPLET: SMS Alerte + SMS Pénalité

### Étape 13: Configurer le Contrat

1. **contrat-controller** → **PUT /api/contrats/1**
2. **Try it out**
3. Collez:

```json
{
  "signedDate": "2026-03-29",
  "amount": 50000,
  "rate": 7.5,
  "duration": 24,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL",
  "penaltyRate": 5.0,
  "penaltyType": "PERCENTAGE",
  "gracePeriodDays": 0
}
```

4. **Execute**

### Étape 14: Calculer la Pénalité

1. **penalty-controller** → **POST /api/penalties/calculate/7**
2. (Utilisez l'ID du paiement créé à l'étape 10)
3. **Try it out** → **Execute**

### Étape 15: Vérifier Votre Téléphone 📱

**Vous devriez recevoir un DEUXIÈME SMS:**

```
Bonjour [Votre Prénom],

Votre paiement du 01/03/2026 est en retard de 28 jours.
Montant dû: 1000.000 TND
Pénalité: 41.667 TND
Total: 1041.667 TND

Merci de régulariser votre situation.

Financia
```

✅ **2 SMS REÇUS!**
- SMS 1: Alerte OVERDUE
- SMS 2: Pénalité calculée

---

## 📊 RÉSUMÉ DES TESTS

| Test | Action | SMS Attendu | Statut |
|------|--------|-------------|--------|
| 1 | Vérifier statut SMS | - | ⏳ |
| 2 | SMS manuel | Test SMS | ⏳ |
| 3 | Créer paiement OVERDUE | Alerte retard | ⏳ |
| 4 | Calculer pénalité | Montant pénalité | ⏳ |

---

## ✅ CHECKLIST FINALE

Configuration:
- [ ] Auth Token obtenu de Twilio
- [ ] Numéro Twilio obtenu
- [ ] Votre numéro +21620285074 vérifié dans Twilio
- [ ] application.properties modifié
- [ ] twilio.enabled=true
- [ ] Application redémarrée

Tests:
- [ ] Service SMS enabled=true
- [ ] SMS manuel reçu
- [ ] SMS automatique OVERDUE reçu
- [ ] SMS pénalité reçu
- [ ] Logs corrects dans la console

---

## 🎉 SUCCÈS!

Si tous les tests sont ✅, votre système SMS automatique est **100% fonctionnel**!

Les utilisateurs recevront automatiquement:
1. **SMS d'alerte** dès que le paiement devient OVERDUE
2. **SMS de pénalité** quand une pénalité est calculée

---

## 🆘 DÉPANNAGE

### Erreur "Unverified number"
→ Vérifiez votre numéro dans: Twilio Console → Verified Caller IDs

### Erreur "Invalid Auth Token"
→ Vérifiez que vous avez copié le token complet (32 caractères)

### SMS non reçu
1. Vérifiez `twilio.enabled=true`
2. Vérifiez les logs de l'application
3. Vérifiez votre crédit Twilio (15$ gratuits)

### "Cannot send SMS: User has no phone number"
```sql
UPDATE users SET phone = '+21620285074' WHERE id_user = 1;
```

---

## 💰 CRÉDIT TWILIO

- **15$ offerts** à l'inscription
- Environ **200-300 SMS** gratuits
- Vérifiez votre crédit: https://console.twilio.com/us1/billing

---

## 📚 DOCUMENTATION

- Configuration Twilio: https://www.twilio.com/docs/sms/quickstart/java
- Vérifier un numéro: https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account
- Tarifs SMS: https://www.twilio.com/sms/pricing

---

**Suivez les étapes 1 à 15 et vous recevrez vos SMS automatiquement!** 🚀
