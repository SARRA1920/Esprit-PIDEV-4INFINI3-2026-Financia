# 🚀 Démarrage Rapide - SMS Notifications

## ⚡ Configuration en 5 Minutes

### Étape 1: Obtenir votre Auth Token Twilio

1. Allez sur: https://console.twilio.com/
2. Dans le Dashboard, cliquez sur **"Show"** à côté de "Auth Token"
3. Copiez le token

### Étape 2: Obtenir un Numéro Twilio

1. Cliquez sur **"Get a trial phone number"** (bouton rouge)
2. Acceptez le numéro proposé
3. Copiez ce numéro (format: +1234567890)

### Étape 3: Configurer l'Application

Ouvrez `src/main/resources/application.properties` et remplacez:

```properties
twilio.account.sid=AC5550b799fb4c1eadbe36e1de931fefa4
twilio.auth.token=COLLEZ_VOTRE_AUTH_TOKEN_ICI
twilio.phone.number=COLLEZ_VOTRE_NUMERO_TWILIO_ICI
twilio.enabled=true
```

### Étape 4: Ajouter un Numéro de Téléphone à un Utilisateur

Exécutez cette commande SQL:

```sql
UPDATE user SET phone = '+21612345678' WHERE id = 1;
```

**Remplacez** `+21612345678` par votre vrai numéro!

### Étape 5: Redémarrer l'Application

1. Arrêtez l'application
2. Redémarrez-la
3. Attendez "Started FinanciaApplication"

---

## 🧪 Test Rapide

### Dans Swagger: http://localhost:8083/swagger-ui.html

#### Test 1: Envoyer un SMS de Test

1. **sms-controller** → **POST /api/sms/send-custom**
2. **Try it out**
3. Paramètres:
   - `phoneNumber`: Votre numéro (ex: +21612345678)
   - `message`: "Test SMS"
4. **Execute**

**Vérifiez votre téléphone!** 📱

#### Test 2: SMS de Pénalité Automatique

1. Créez un paiement en retard (voir guide principal)
2. **POST /api/penalties/calculate/{id}**
3. **Execute**

**SMS envoyé automatiquement!** ✅

---

## 🔄 Mode Test (Sans Twilio)

Pour tester sans configurer Twilio:

```properties
twilio.enabled=false
```

Les SMS seront affichés dans les logs de l'application.

---

## ✅ C'est Tout!

Votre système SMS est maintenant opérationnel!

Pour plus de détails, consultez `SMS_NOTIFICATION_GUIDE.md`
