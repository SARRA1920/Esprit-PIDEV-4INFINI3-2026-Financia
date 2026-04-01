# Fund Allocation Recommendation System

## Overview
AI-powered recommendation engine that suggests optimal fund allocations based on partenaire performance, risk analysis, and historical data.

---

## API Endpoints

### 1. Get Recommendations for Fond
```
GET http://localhost:8083/api/allocation-recommendations/fond/{fondId}
```

Returns AI-powered recommendations for which partenaires should receive allocations from this fond, including:
- Recommended allocation amounts
- Risk assessment for each partenaire
- Performance scores
- Priority ranking
- Allocation strategy
- Warnings and alerts

### 2. Get Recommendations for Partenaire
```
GET http://localhost:8083/api/allocation-recommendations/partenaire/{partenaireId}
```

Returns recommendations for which fonds are best suited for this partenaire, including:
- Suitable fonds with available capacity
- Recommended amounts per fond
- Risk and performance analysis
- Confidence scores

---

## Response Example

### Fond Recommendations Response

```json
{
  "fondId": 1,
  "fondName": "Infrastructure Development Fund",
  "totalCapacity": 1000000.0,
  "currentCommitted": 450000.0,
  "availableCapacity": 550000.0,
  "utilizationRate": 45.0,
  "allocationStrategy": "BALANCED - Mix of established and new partenaires with good risk profiles",
  "recommendedPartenaires": [
    {
      "partenaireId": 3,
      "partenaireName": "ABC Bank",
      "recommendedAmount": 75000.0,
      "maxSafeAmount": 112500.0,
      "riskLevel": "LOW",
      "riskScore": 15.0,
      "performanceScore": 92.5,
      "rationale": "Excellent track record. Low risk profile. Based on 12 historical commitments.",
      "priority": 1
    },
    {
      "partenaireId": 5,
      "partenaireName": "XYZ Microfinance",
      "recommendedAmount": 50000.0,
      "maxSafeAmount": 75000.0,
      "riskLevel": "MEDIUM",
      "riskScore": 35.0,
      "performanceScore": 78.0,
      "rationale": "Good performance history. Moderate risk. Based on 8 historical commitments.",
      "priority": 2
    },
    {
      "partenaireId": 7,
      "partenaireName": "New Partner Ltd",
      "recommendedAmount": 25000.0,
      "maxSafeAmount": 37500.0,
      "riskLevel": "UNKNOWN",
      "riskScore": 50.0,
      "performanceScore": 50.0,
      "rationale": "New partenaire - conservative allocation recommended",
      "priority": 5
    }
  ],
  "warnings": [
    "INFO: Total recommended allocations exceed available capacity - prioritize by ranking"
  ],
  "confidenceScore": 78.5,
  "aiModelVersion": "v1.0-rule-based"
}
```

### Partenaire Recommendations Response

```json
[
  {
    "fondId": 1,
    "fondName": "Infrastructure Development Fund",
    "totalCapacity": 1000000.0,
    "currentCommitted": 450000.0,
    "availableCapacity": 550000.0,
    "utilizationRate": 45.0,
    "recommendedPartenaires": [
      {
        "partenaireId": 3,
        "partenaireName": "ABC Bank",
        "recommendedAmount": 75000.0,
        "maxSafeAmount": 112500.0,
        "riskLevel": "LOW",
        "riskScore": 15.0,
        "performanceScore": 92.5,
        "rationale": "Excellent track record. Low risk profile. Based on 12 historical commitments.",
        "priority": 1
      }
    ],
    "confidenceScore": 85.0,
    "aiModelVersion": "v1.0-rule-based"
  },
  {
    "fondId": 2,
    "fondName": "SME Growth Fund",
    "totalCapacity": 500000.0,
    "currentCommitted": 200000.0,
    "availableCapacity": 300000.0,
    "utilizationRate": 40.0,
    "recommendedPartenaires": [
      {
        "partenaireId": 3,
        "partenaireName": "ABC Bank",
        "recommendedAmount": 60000.0,
        "maxSafeAmount": 90000.0,
        "riskLevel": "LOW",
        "riskScore": 15.0,
        "performanceScore": 92.5,
        "rationale": "Excellent track record. Low risk profile. Based on 12 historical commitments.",
        "priority": 1
      }
    ],
    "confidenceScore": 82.0,
    "aiModelVersion": "v1.0-rule-based"
  }
]
```

---

## How It Works

### 1. Performance Score Calculation (0-100)

**Base Score**: 100 points

**Penalties**:
- Default rate: -2 points per % (e.g., 10% default rate = -20 points)
- Late payment rate: -1.5 points per % (payments > 60 days late)

**Bonuses**:
- Completion rate: +0.5 points per % (completed/paid commitments)
- Experience: +2 points per historical commitment (max +20)

**Example**:
- Partenaire with 5% defaults, 10% late payments, 85% completion, 10 commitments
- Score = 100 - 10 - 15 + 42.5 + 20 = 137.5 → capped at 100

### 2. Risk Score (from Fraud Detection)

Uses the fraud detection system to assess risk:
- 0-29: LOW risk
- 30-49: MEDIUM risk
- 50-69: HIGH risk
- 70-100: CRITICAL risk (excluded from recommendations)

### 3. Recommended Amount Calculation

```
Base Amount = Historical Average or 10% of Available Capacity

Performance Multiplier = 0.5 + (Performance Score / 100)
  - Range: 0.5x to 1.5x
  - Higher performance = higher multiplier

Risk Multiplier = 1.5 - (Risk Score / 100 * 1.2)
  - Range: 0.3x to 1.5x
  - Higher risk = lower multiplier

Recommended Amount = Base × Performance Multiplier × Risk Multiplier

Cap at 20% of Available Capacity
```

**Example**:
- Base: 50,000
- Performance: 80/100 → Multiplier = 1.3
- Risk: 20/100 → Multiplier = 1.26
- Recommended = 50,000 × 1.3 × 1.26 = 81,900

### 4. Max Safe Amount

```
Max Safe = Recommended Amount × (2.0 - Risk Score / 200)

Cap at 30% of Available Capacity
```

### 5. Priority Ranking

```
Priority Score = (100 - Performance Score) + Risk Score

Priority 1 (Best): Score < 50
Priority 2: Score 50-79
Priority 3: Score 80-109
Priority 4: Score 110-139
Priority 5 (Lowest): Score ≥ 140
```

### 6. Allocation Strategies

Based on fond utilization rate:

| Utilization | Strategy | Description |
|-------------|----------|-------------|
| > 90% | CONSERVATIVE | Minimal new allocations, high-performance only |
| 75-90% | SELECTIVE | Top-tier partenaires with proven records |
| 50-75% | BALANCED | Mix of established and new partenaires |
| 25-50% | GROWTH | Actively seek quality partenaires |
| < 25% | AGGRESSIVE | Maximize allocations to qualified partenaires |

### 7. Confidence Score

```
Avg Performance Score + (100 - Avg Risk Score)
Confidence = ─────────────────────────────────────
                          2

Adjusted by: min(1.0, Number of Recommendations / 5)
```

Higher confidence when:
- More recommendations available (more data)
- Higher average performance scores
- Lower average risk scores

---

## Use Cases

### Use Case 1: Fund Manager Needs to Allocate Capital

**Scenario**: You have a fond with 500,000 available capacity and want to know which partenaires to allocate to.

**Request**:
```
GET http://localhost:8083/api/allocation-recommendations/fond/1
```

**Action**: Review the recommended partenaires sorted by priority. Allocate to Priority 1 partenaires first, then Priority 2, etc.

### Use Case 2: New Partenaire Application

**Scenario**: A new partenaire applies for funding. You want to know which fonds are suitable.

**Request**:
```
GET http://localhost:8083/api/allocation-recommendations/partenaire/10
```

**Action**: Review recommended fonds. For new partenaires, expect conservative amounts (5% of capacity or 50k max).

### Use Case 3: Risk-Based Allocation

**Scenario**: You want to minimize risk while maximizing returns.

**Action**: 
1. Get recommendations for your fond
2. Filter by `riskLevel: "LOW"` or `riskScore < 30`
3. Allocate to top performers with low risk
4. Stay within `maxSafeAmount` limits

### Use Case 4: Capacity Planning

**Scenario**: You need to plan future allocations based on current utilization.

**Action**:
1. Check `utilizationRate` and `allocationStrategy`
2. Review `warnings` for capacity alerts
3. Adjust allocation amounts based on strategy
4. Monitor `confidenceScore` for recommendation reliability

---

## Integration Examples

### Automated Allocation Workflow

```java
@Service
public class AutomatedAllocationService {
    
    @Autowired
    private AllocationRecommendationService recommendationService;
    
    @Autowired
    private IPartenaireFondService partenaireFondService;
    
    public void autoAllocate(Long fondId, double targetAmount) {
        AllocationRecommendation rec = recommendationService
                .getRecommendationsForFond(fondId);
        
        double allocated = 0;
        
        for (var partenaireRec : rec.getRecommendedPartenaires()) {
            if (allocated >= targetAmount) break;
            
            // Only allocate to Priority 1 and 2 with low risk
            if (partenaireRec.getPriority() <= 2 && 
                partenaireRec.getRiskScore() < 30) {
                
                double amount = Math.min(
                    partenaireRec.getRecommendedAmount(),
                    targetAmount - allocated
                );
                
                // Create commitment
                PartenaireFond pf = new PartenaireFond();
                pf.setPartenaire(/* ... */);
                pf.setFond(/* ... */);
                pf.setCommittedAmount(amount);
                pf.setCommitmentDate(LocalDate.now());
                pf.setCommitmentStatus(CommitmentStatus.COMMITTED);
                
                partenaireFondService.save(pf);
                allocated += amount;
            }
        }
    }
}
```

### Dashboard Integration

```javascript
// Fetch recommendations for display
fetch('http://localhost:8083/api/allocation-recommendations/fond/1')
  .then(response => response.json())
  .then(data => {
    // Display utilization gauge
    updateUtilizationGauge(data.utilizationRate);
    
    // Display strategy
    updateStrategy(data.allocationStrategy);
    
    // Display warnings
    data.warnings.forEach(warning => showAlert(warning));
    
    // Display recommended partenaires table
    displayRecommendations(data.recommendedPartenaires);
    
    // Display confidence meter
    updateConfidence(data.confidenceScore);
  });
```

---

## Best Practices

1. **Review Recommendations Regularly**: Run recommendations weekly or before major allocation decisions

2. **Respect Priority Rankings**: Always allocate to Priority 1 partenaires first

3. **Stay Within Limits**: Never exceed `maxSafeAmount` without additional due diligence

4. **Monitor Warnings**: Pay attention to capacity and risk warnings

5. **Check Confidence Scores**: Low confidence (<50) means limited data - proceed cautiously

6. **Combine with Manual Review**: Use recommendations as guidance, not absolute rules

7. **Update Historical Data**: Ensure commitment and payment data is current for accurate recommendations

8. **Track Performance**: Monitor actual outcomes vs recommendations to improve the model

---

## Future Enhancements

1. **Machine Learning Integration**: Replace rule-based scoring with trained ML models
2. **Market Data**: Incorporate external economic indicators
3. **Sector Analysis**: Consider industry-specific risk factors
4. **Seasonal Patterns**: Account for seasonal variations in performance
5. **Portfolio Optimization**: Multi-fond optimization for diversification
6. **Real-time Updates**: WebSocket notifications for recommendation changes
7. **A/B Testing**: Compare recommendation strategies for optimization

---

## API Testing

### Test Scenario 1: Get Recommendations for Active Fond
```
GET http://localhost:8083/api/allocation-recommendations/fond/1
```

Expected: List of recommended partenaires with amounts and risk scores

### Test Scenario 2: Get Recommendations for High-Performing Partenaire
```
GET http://localhost:8083/api/allocation-recommendations/partenaire/3
```

Expected: Multiple fond options with high recommended amounts

### Test Scenario 3: Get Recommendations for New Partenaire
```
GET http://localhost:8083/api/allocation-recommendations/partenaire/10
```

Expected: Conservative recommendations (5% of capacity or 50k max)

### Test Scenario 4: Nearly Full Fond
```
GET http://localhost:8083/api/allocation-recommendations/fond/5
```

Expected: CONSERVATIVE strategy with warnings about capacity
