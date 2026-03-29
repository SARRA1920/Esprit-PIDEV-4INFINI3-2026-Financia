# 📱 Test SMS Automatique - Statut OVERDUE

## 🎯 Fonctionnalité

Envoi automatique de SMS dès qu'un paiement passe au statut "OVERDUE".

---

## 🔄 Quand les SMS sont Envoyés Automatiquement

### 1. Création d'un Paiement avec Statut OVERDUE
✅ SMS envoyé immédiatement lors de la création

### 2. Mise à Jour du Statut vers OVERDUE
✅ SMS envoyé quand le statut change de PENDING → OVERDUE

### 3. Job Quotidien (Automatique)
✅ SMS envoyé pour tous les paiements qui deviennent OVERDUE

---

## 📱 Format du SMS d'Alerte OVERDUE

```
Bonjour [Prénom],

Votre paiement du [Date] est maintenant en retard.
Montant dû: [Montant] TND

Merci de régulariser votre situation rapidement pour éviter des pénalités supplémentaires.

Financia
```

**Exemple:**
```
Bonjour Mohamed,

Votre paiement du 2026-03-01 est maintenant en retard.
Montant dû: 1000.000 TND

Merci de régulariser votre situation rapidement pour éviter des pénalités supplémentaires.

Financia
```

---

## 🧪 SCÉNARIO DE TEST 1: Création avec Statut OVERDUE

### Étape 1: Ouvrir Swagger
`http://localhost:8083/swagger-ui.html`

### Étape 2: Créer un Paiement OVERDUE
**POST /api/echeanciers/contrat/1**

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

### Étape 3: Vérifier Votre Téléphone 📱
**Vous devriez recevoir immédiatement un SMS!**

### Étape 4: Vérifier les Logs
```
Overdue SMS sent to user 1 for payment 25
SMS sent successfully to +21620335574 - SID: SM...
```

✅ **SMS envoyé automatiquement à la création!**

---

## 🧪 SCÉNARIO DE TEST 2: Changement de Statut

### Étape 1: Créer un Paiement PENDING
**POST /api/echeanciers/contrat/1**

```json
{
  "dueDate": "2026-03-01",
  "amountDue": 500,
  "principalAmount": 450,
  "interestAmount": 50,
  "penaltyAmount": 0,
  "status": "PENDING"
}
```

**Résultat:** Aucun SMS envoyé (status = PENDING)

### Étape 2: Mettre à Jour le Statut vers OVERDUE
**PUT /api/echeanciers/26** (utilisez l'ID du paiement créé)

```json
{
  "dueDate": "2026-03-01",
  "amountDue": 500,
  "principalAmount": 450,
  "interestAmount": 50,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
```

### Étape 3: Vérifier Votre Téléphone 📱
**SMS reçu immédiatement!**

### Étape 4: Vérifier les Logs
```
Overdue SMS sent to user 1 for payment 26
```

✅ **SMS envoyé lors du changement de statut!**

---

## 🧪 SCÉNARIO DE TEST 3: Job Quotidien Automatique

### Étape 1: Créer des Paiements PENDING avec Date Passée

**Paiement 1:**
```json
{
  "dueDate": "2026-03-25",
  "amountDue": 300,
  "principalAmount": 270,
  "interestAmount": 30,
  "penaltyAmount": 0,
  "status": "PENDING"
}
```

**Paiement 2:**
```json
{
  "dueDate": "2026-03-20",
  "amountDue": 400,
  "principalAmount": 360,
  "interestAmount": 40,
  "penaltyAmount": 0,
  "status": "PENDING"
}
```

### Étape 2: Exécuter le Job Quotidien
**POST /api/penalties/run-daily-job**

### Étape 3: Vérifier Votre Téléphone 📱
**Vous devriez recevoir 2 SMS (un pour chaque paiement)!**

### Étape 4: Vérifier la Réponse
```json
{
  "message": "Daily penalty job executed successfully",
  "paymentsMarkedOverdue": 2,
  "penaltiesUpdated": 2
}
```

### Étape 5: Vérifier les Logs
```
Payment 27 marked as OVERDUE
Overdue SMS sent to user 1 for payment 27
Payment 28 marked as OVERDUE
Overdue SMS sent to user 1 for payment 28
```

✅ **SMS envoyés automatiquement par le job!**

---

## 🧪 SCÉNARIO DE TEST 4: Test Complet avec Pénalité

### Étape 1: Créer un Paiement OVERDUE
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

**Résultat:** SMS d'alerte OVERDUE reçu 📱

### Étape 2: Calculer la Pénalité
**POST /api/penalties/calculate/29**

**Résultat:** SMS de pénalité reçu 📱

### Étape 3: Vérifier les 2 SMS Reçus

**SMS 1 (Alerte OVERDUE):**
```
Bonjour Mohamed,

Votre paiement du 2026-03-01 est maintenant en retard.
Montant dû: 1000.000 TND

Merci de régulariser votre situation rapidement pour éviter des pénalités supplémentaires.

Financia
```

**SMS 2 (Pénalité Appliquée):**
```
Bonjour Mohamed,

Votre paiement du 01/03/2026 est en retard de 28 jours.
Montant dû: 1000.000 TND
Pénalité: 41.667 TND
Total: 1041.667 TND

Merci de régulariser votre situation.

Financia
```

✅ **2 SMS différents reçus!**

---

## 📊 Résumé des Déclencheurs SMS

| Action | SMS Envoyé | Type de SMS |
|--------|------------|-------------|
| Créer paiement OVERDUE | ✅ Oui | Alerte OVERDUE |
| Créer paiement PENDING | ❌ Non | - |
| Changer PENDING → OVERDUE | ✅ Oui | Alerte OVERDUE |
| Changer OVERDUE → PAID | ❌ Non | - |
| Job quotidien (PENDING → OVERDUE) | ✅ Oui | Alerte OVERDUE |
| Calculer pénalité | ✅ Oui | Pénalité appliquée |

---

## 🔍 Vérification dans les Logs

### Logs de Création OVERDUE
```
Overdue SMS sent to user 1 for payment 25
SMS sent successfully to +21620335574 - SID: SM1234567890
```

### Logs de Changement de Statut
```
Overdue SMS sent to user 1 for payment 26
SMS sent successfully to +21620335574 - SID: SM0987654321
```

### Logs du Job Quotidien
```
Payment 27 marked as OVERDUE
Overdue SMS sent to user 1 for payment 27
SMS sent successfully to +21620335574 - SID: SM1122334455
```

---

## ⚠️ Cas Particuliers

### Utilisateur sans Numéro de Téléphone
**Log:**
```
Cannot send SMS: User 1 has no phone number
```

**Solution:** Ajouter un numéro:
```sql
UPDATE user SET phone = '+21620335574' WHERE id = 1;
```

### SMS Désactivé (twilio.enabled=false)
**Log:**
```
=== SIMULATED SMS ===
To: +21620335574
Message:
Bonjour Mohamed,

Votre paiement du 2026-03-01 est maintenant en retard.
Montant dû: 1000.000 TND
...
====================
```

### Erreur Twilio
**Log:**
```
Failed to send overdue SMS for payment 25: Invalid phone number
```

---

## ✅ Checklist de Test

- [ ] SMS envoyé lors de création avec OVERDUE
- [ ] Aucun SMS lors de création avec PENDING
- [ ] SMS envoyé lors du changement PENDING → OVERDUE
- [ ] Aucun SMS lors du changement OVERDUE → PAID
- [ ] SMS envoyés par le job quotidien
- [ ] 2 SMS différents (OVERDUE + Pénalité)
- [ ] Logs corrects dans l'application
- [ ] Gestion des utilisateurs sans téléphone
- [ ] Mode simulation fonctionne

---

## 🎉 Succès!

Si tous les tests sont ✅, votre système d'alerte SMS automatique est **100% fonctionnel**!

Les utilisateurs recevront:
1. **SMS d'alerte** dès que le paiement devient OVERDUE
2. **SMS de pénalité** quand une pénalité est calculée

---

## 💡 Conseils

1. **Testez d'abord en mode simulation** (`twilio.enabled=false`)
2. **Vérifiez les logs** pour chaque action
3. **Utilisez votre propre numéro** pour les tests
4. **Surveillez votre crédit Twilio** (15$ gratuits)

---

## 🆘 Dépannage

### SMS non reçu
1. Vérifiez `twilio.enabled=true`
2. Vérifiez le numéro de téléphone
3. Consultez les logs
4. Vérifiez le crédit Twilio

### Trop de SMS reçus
- Vérifiez que vous ne créez pas de doublons
- Le job quotidien ne doit s'exécuter qu'une fois par jour

### SMS en double
- Normal si vous créez OVERDUE puis calculez la pénalité
- Ce sont 2 SMS différents (alerte + pénalité)

---

**Commencez les tests maintenant!** 🚀
