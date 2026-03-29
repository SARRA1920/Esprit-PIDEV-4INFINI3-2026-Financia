# 📱 Guide d'Intégration SMS - Notifications de Pénalité

## 🎯 Fonctionnalité Implémentée

Envoi automatique de SMS aux utilisateurs lorsqu'une pénalité est appliquée sur leur paiement en retard.

---

## 📋 Ce qui a été créé

### 1. Fichiers Créés
- ✅ `SmsService.java` - Service d'envoi SMS avec Twilio
- ✅ `SmsController.java` - API REST pour gérer les SMS
- ✅ Dépendance Twilio ajoutée dans `pom.xml`
- ✅ Configuration Twilio dans `application.properties`

### 2. Intégration Automatique
- ✅ Envoi automatique de SMS lors du calcul de pénalité
- ✅ SMS envoyé uniquement si la pénalité augmente
- ✅ Mode simulation pour tester sans Twilio

---

## 🔧 Configuration Twilio

### Étape 1: Obtenir vos Identifiants Twilio

1. Allez sur: https://console.twilio.com/
2. Connectez-vous avec votre compte
3. Dans le Dashboard, notez:
   - **Account SID**: `AC5550b799fb4c1eadbe36e1de931fefa4` (vous l'avez déjà)
   - **Auth Token**: Cliquez sur "Show" pour le voir
   - **Phone Number**: Vous devez en obtenir un

### Étape 2: Obtenir un Numéro de Téléphone Twilio

1. Dans Twilio Console, allez à: **Phone Numbers** → **Manage** → **Buy a number**
2. Ou cliquez sur "Get trial phone number" (gratuit)
3. Sélectionnez un numéro (de préférence avec SMS capability)
4. Notez ce numéro (format: +1234567890)

### Étape 3: Configurer application.properties

Ouvrez `src/main/resources/application.properties` et mettez à jour:

```properties
### Twilio SMS Configuration ###
twilio.account.sid=AC5550b799fb4c1eadbe36e1de931fefa4
twilio.auth.token=VOTRE_AUTH_TOKEN_ICI
twilio.phone.number=VOTRE_NUMERO_TWILIO
twilio.enabled=true
```

**Remplacez:**
- `VOTRE_AUTH_TOKEN_ICI` par votre Auth Token
- `VOTRE_NUMERO_TWILIO` par votre numéro Twilio (ex: +12345678900)
- `twilio.enabled=true` pour activer l'envoi réel

---

## 🧪 Mode Test (Sans Twilio)

Pour tester sans configurer Twilio:

```properties
twilio.enabled=false
```

Les SMS seront simulés et affichés dans les logs de l'application.

---

## 📱 Format du SMS Envoyé

```
Bonjour [Prénom],

Votre paiement du [Date] est en retard de [X] jours.
Montant dû: [Montant] TND
Pénalité: [Pénalité] TND
Total: [Total] TND

Merci de régulariser votre situation.

Financia
```

**Exemple:**
```
Bonjour Mohamed,

Votre paiement du 01/03/2026 est en retard de 28 jours.
Montant dû: 1000.000 TND
Pénalité: 41.667 TND
Total: 1041.667 TND

Merci de régulariser votre situation.

Financia
```

---

## 🚀 API Endpoints

### 1. Envoyer SMS de Pénalité

**POST** `/api/sms/send-penalty-notification/{echeancierPayementId}`

Envoie un SMS de notification de pénalité pour un paiement spécifique.

**Exemple:**
```bash
POST http://localhost:8083/api/sms/send-penalty-notification/5
```

**Réponse:**
```json
{
  "message": "SMS sent successfully to +21612345678",
  "paymentId": "5",
  "phone": "+21612345678"
}
```

---

### 2. Envoyer SMS Personnalisé

**POST** `/api/sms/send-custom?phoneNumber={phone}&message={message}`

Envoie un SMS personnalisé à n'importe quel numéro.

**Exemple:**
```bash
POST http://localhost:8083/api/sms/send-custom?phoneNumber=+21612345678&message=Test SMS
```

**Réponse:**
```json
{
  "message": "SMS sent successfully",
  "phone": "+21612345678"
}
```

---

### 3. Vérifier le Statut du Service SMS

**GET** `/api/sms/status`

Vérifie si le service SMS est configuré et activé.

**Exemple:**
```bash
GET http://localhost:8083/api/sms/status
```

**Réponse:**
```json
{
  "enabled": true,
  "service": "Twilio"
}
```

---

## 🧪 Tests dans Swagger

### Test 1: Vérifier le Statut SMS

1. Ouvrez Swagger: `http://localhost:8083/swagger-ui.html`
2. Trouvez **sms-controller**
3. **GET /api/sms/status**
4. **Try it out** → **Execute**

**Résultat attendu:**
```json
{
  "enabled": true,
  "service": "Twilio"
}
```

---

### Test 2: Envoyer SMS de Test

1. **POST /api/sms/send-custom**
2. **Try it out**
3. Paramètres:
   - `phoneNumber`: Votre numéro (ex: +21612345678)
   - `message`: "Test SMS from Financia"
4. **Execute**

**Vérifiez votre téléphone!** 📱

---

### Test 3: Envoyer SMS de Pénalité

1. D'abord, créez un paiement en retard et calculez la pénalité
2. **POST /api/sms/send-penalty-notification/{id}**
3. **Try it out**
4. Entrez l'ID du paiement
5. **Execute**

**Le SMS de pénalité sera envoyé!**

---

## 🔄 Envoi Automatique

### Quand les SMS sont Envoyés Automatiquement

Les SMS sont envoyés automatiquement dans ces cas:

1. **Calcul de Pénalité**
   - Endpoint: `POST /api/penalties/calculate/{id}`
   - Si la pénalité augmente → SMS envoyé

2. **Job Quotidien**
   - Endpoint: `POST /api/penalties/run-daily-job`
   - Tous les paiements avec pénalité augmentée → SMS envoyés

3. **Calcul en Lot**
   - Endpoint: `POST /api/penalties/calculate-all`
   - Tous les paiements avec pénalité augmentée → SMS envoyés

---

## 📞 Format des Numéros de Téléphone

Le service accepte plusieurs formats et les convertit automatiquement:

| Format Entré | Format Converti |
|--------------|-----------------|
| 12345678 | +21612345678 |
| 21612345678 | +21612345678 |
| 0021612345678 | +21612345678 |
| +21612345678 | +21612345678 |

**Note:** Le code pays par défaut est +216 (Tunisie)

---

## 🔍 Logs et Débogage

### Voir les SMS dans les Logs

Quand `twilio.enabled=false`, les SMS sont affichés dans les logs:

```
=== SIMULATED SMS ===
To: +21612345678
Message:
Bonjour Mohamed,

Votre paiement du 01/03/2026 est en retard de 28 jours.
Montant dû: 1000.000 TND
Pénalité: 41.667 TND
Total: 1041.667 TND

Merci de régulariser votre situation.

Financia
====================
```

### Logs d'Envoi Réel

Quand `twilio.enabled=true`:

```
SMS sent successfully to +21612345678 - SID: SM1234567890abcdef
```

---

## ⚠️ Prérequis

### 1. Utilisateur doit avoir un Numéro de Téléphone

Assurez-vous que l'entité `User` a un champ `phone`:

```java
@Column
private String phone;
```

### 2. Ajouter le Numéro dans la Base de Données

```sql
UPDATE user SET phone = '+21612345678' WHERE id = 1;
```

---

## 💰 Coûts Twilio

### Crédit Gratuit
- **15$ offerts** à l'inscription
- Environ **200-300 SMS** selon les destinations

### Tarifs SMS (après crédit gratuit)
- **Tunisie**: ~0.05$ par SMS
- **France**: ~0.08$ par SMS
- **USA**: ~0.0075$ par SMS

### Vérifier votre Crédit
https://console.twilio.com/us1/billing/manage-billing/billing-overview

---

## 🛠️ Dépannage

### Erreur: "User does not have a phone number"
**Solution:** Ajoutez un numéro de téléphone à l'utilisateur dans la base de données.

### Erreur: "Failed to initialize Twilio"
**Solution:** Vérifiez vos identifiants dans `application.properties`.

### SMS non reçu
**Vérifications:**
1. Le numéro est au bon format (+216...)
2. Twilio est activé (`twilio.enabled=true`)
3. Vous avez du crédit Twilio
4. Le numéro est vérifié (compte trial)

### Compte Trial Twilio
En mode trial, vous ne pouvez envoyer des SMS qu'aux numéros vérifiés.

**Pour vérifier un numéro:**
1. Twilio Console → **Phone Numbers** → **Verified Caller IDs**
2. Cliquez sur **Add a new number**
3. Entrez le numéro et vérifiez-le

---

## 📊 Scénario de Test Complet

### Étape 1: Configuration
```properties
twilio.enabled=false  # Mode simulation pour commencer
```

### Étape 2: Créer un Paiement en Retard
```bash
POST /api/echeanciers/contrat/1
{
  "dueDate": "2026-03-01",
  "amountDue": 1000,
  "status": "OVERDUE",
  ...
}
```

### Étape 3: Calculer la Pénalité
```bash
POST /api/penalties/calculate/5
```

### Étape 4: Vérifier les Logs
Vous devriez voir le SMS simulé dans les logs.

### Étape 5: Activer Twilio
```properties
twilio.enabled=true
twilio.auth.token=VOTRE_TOKEN
twilio.phone.number=VOTRE_NUMERO
```

### Étape 6: Redémarrer et Retester
Le SMS sera envoyé réellement!

---

## ✅ Checklist de Configuration

- [ ] Compte Twilio créé
- [ ] Account SID noté
- [ ] Auth Token noté
- [ ] Numéro Twilio obtenu
- [ ] Configuration dans application.properties
- [ ] Dépendance Twilio dans pom.xml
- [ ] Application redémarrée
- [ ] Numéro de téléphone ajouté aux utilisateurs
- [ ] Test SMS personnalisé réussi
- [ ] Test SMS de pénalité réussi
- [ ] Envoi automatique testé

---

## 🎉 Félicitations!

Votre système d'envoi de SMS pour les notifications de pénalité est maintenant opérationnel!

Les utilisateurs recevront automatiquement un SMS lorsqu'une pénalité est appliquée à leur paiement en retard.

---

## 📚 Ressources

- **Twilio Console**: https://console.twilio.com/
- **Twilio Documentation**: https://www.twilio.com/docs/sms
- **Twilio Java SDK**: https://www.twilio.com/docs/libraries/java
- **Pricing**: https://www.twilio.com/sms/pricing

---

## 🆘 Support

Pour toute question:
1. Vérifiez les logs de l'application
2. Consultez la Twilio Console pour les erreurs
3. Testez d'abord en mode simulation (`twilio.enabled=false`)
4. Vérifiez que le numéro de téléphone est au bon format
