# Technical Design Document: Fund Management Enhancements

## Overview

This design document specifies the technical implementation for enhancements to the fund management system in the Financia application. The enhancements introduce four core service components that work together to provide comprehensive fund allocation tracking, automated status management, commitment lifecycle workflows, and historical audit trails.

The design builds upon the existing Spring Boot architecture with JPA entities (Fond, Partenaire, PartenaireFond) and follows established patterns in the codebase including interface-based service design, repository pattern with Spring Data JPA, and RESTful controller endpoints.

Key capabilities delivered:
- Real-time fund allocation calculation and reporting with partner contribution details
- Automatic fund status transitions based on allocation thresholds
- Commitment lifecycle management with payment processing and default handling
- Immutable historical tracking of all commitment changes for audit compliance

## Architecture

### System Components

The enhancement introduces four new service components that integrate with the existing entity layer:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Controller Layer                          │
│  FundAllocationController  │  CommitmentLifecycleController     │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         Service Layer                            │
│                                                                   │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │ FundAllocationService│      │ FundStatusManager    │        │
│  │  - calculateMetrics  │◄─────│  - updateStatus      │        │
│  │  - generateReport    │      │  - checkThresholds   │        │
│  └──────────────────────┘      └──────────────────────┘        │
│                                                                   │
│  ┌──────────────────────────┐  ┌─────────────────────────┐     │
│  │CommitmentLifecycleService│  │CommitmentHistoryTracker │     │
│  │  - processPayment        │──►│  - recordChange         │     │
│  │  - markDefaulted         │  │  - retrieveHistory      │     │
│  │  - validateTransition    │  └─────────────────────────┘     │
│  └──────────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Repository Layer                            │
│  FondRepository  │  PartenaireFondRepository  │                 │
│  CommitmentHistoryRepository                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         Entity Layer                             │
│  Fond  │  Partenaire  │  PartenaireFond  │  CommitmentHistory  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interactions

1. **FundAllocationService** queries PartenaireFond records to calculate allocation metrics and generate comprehensive reports
2. **FundStatusManager** is triggered by PartenaireFond changes and updates Fond status based on allocation thresholds
3. **CommitmentLifecycleService** manages status transitions, validates workflows, and triggers both FundStatusManager and CommitmentHistoryTracker
4. **CommitmentHistoryTracker** creates immutable audit records for all commitment changes

### Design Patterns

- **Service Layer Pattern**: Business logic encapsulated in service interfaces with concrete implementations
- **Repository Pattern**: Data access abstraction using Spring Data JPA repositories
- **Event-Driven Updates**: Status changes trigger cascading updates through service dependencies
- **DTO Pattern**: Data Transfer Objects for API responses to decouple internal entities from external contracts

## Components and Interfaces

### 1. FundAllocationService

**Purpose**: Calculate and report fund allocation metrics including allocation percentage, remaining capacity, and contributing partner details.

**Interface**:
```java
public interface IFundAllocationService {
    FundAllocationReport generateReport(Long fondId);
    AllocationMetrics calculateMetrics(Long fondId);
}
```

**Key Methods**:

- `generateReport(Long fondId)`: Generates comprehensive allocation report
  - Returns: FundAllocationReport containing fund details, metrics, and partner list
  - Throws: FundNotFoundException if fondId doesn't exist

- `calculateMetrics(Long fondId)`: Calculates allocation percentage and remaining capacity
  - Returns: AllocationMetrics with percentage (2 decimal precision) and remaining capacity
  - Handles division by zero (returns 0% when fund amount is zero)

**Dependencies**:
- FondRepository: Retrieve fund details
- PartenaireFondRepository: Query commitment records

**Business Rules**:
- Allocation percentage = (committedAmount / amount) × 100
- Remaining capacity = amount - committedAmount
- Only include commitments with status COMMITTED or PAID in calculations
- Exclude DEFAULTED commitments from allocation calculations

### 2. FundStatusManager

**Purpose**: Automatically update fund status based on allocation levels and commitment changes.

**Interface**:
```java
public interface IFundStatusManager {
    void updateFundStatus(Long fondId);
    void recalculateStatus(Long fondId);
}
```

**Key Methods**:

- `updateFundStatus(Long fondId)`: Updates fund status based on current allocation
  - Transitions to FULLY_ALLOCATED when committedAmount >= amount
  - Transitions to AVAILABLE when committedAmount < amount (if currently FULLY_ALLOCATED)
  - Preserves CLOSED status regardless of allocation changes

- `recalculateStatus(Long fondId)`: Recalculates committedAmount and updates status
  - Sums all PartenaireFond committedAmount values (excluding DEFAULTED)
  - Updates Fond entity with new committedAmount
  - Applies status transition rules

**Dependencies**:
- FondRepository: Update fund status
- PartenaireFondRepository: Query commitments for recalculation

**Business Rules**:
- CLOSED status is immutable (never changes based on allocation)
- Status changes from AVAILABLE to FULLY_ALLOCATED when threshold reached
- Status changes from FULLY_ALLOCATED to AVAILABLE when allocation drops below threshold
- Triggered automatically on PartenaireFond create/update/status change

### 3. CommitmentLifecycleService

**Purpose**: Manage commitment status transitions, payment processing, and default handling with workflow validation.

**Interface**:
```java
public interface ICommitmentLifecycleService {
    PartenaireFond processPayment(Long partenaireFondId, double paymentAmount, LocalDate paymentDate);
    PartenaireFond markDefaulted(Long partenaireFondId, LocalDate defaultDate, String reason);
    boolean validateStatusTransition(CommitmentStatus from, CommitmentStatus to);
}
```

**Key Methods**:

- `processPayment(Long partenaireFondId, double paymentAmount, LocalDate paymentDate)`: Processes payment and updates status
  - Validates payment amount > 0
  - Updates status from COMMITTED to PAID
  - Records payment amount and date
  - Triggers FundStatusManager and CommitmentHistoryTracker
  - Returns: Updated PartenaireFond entity
  - Throws: InvalidPaymentException, CommitmentNotFoundException

- `markDefaulted(Long partenaireFondId, LocalDate defaultDate, String reason)`: Marks commitment as defaulted
  - Updates status to DEFAULTED
  - Records default date and reason
  - Triggers FundStatusManager and CommitmentHistoryTracker
  - Returns: Updated PartenaireFond entity

- `validateStatusTransition(CommitmentStatus from, CommitmentStatus to)`: Validates status workflow
  - Returns: true if transition is valid, false otherwise
  - Valid transitions: COMMITTED→PAID, COMMITTED→DEFAULTED, PAID→DEFAULTED
  - Invalid transitions: PAID→COMMITTED, DEFAULTED→COMMITTED

**Dependencies**:
- PartenaireFondRepository: Update commitment records
- FundStatusManager: Trigger status recalculation
- CommitmentHistoryTracker: Record changes

**Business Rules**:
- Payment amount must be positive
- Status transitions follow defined workflow rules
- All status changes trigger historical recording
- All status changes trigger fund status recalculation

### 4. CommitmentHistoryTracker

**Purpose**: Record and retrieve immutable historical records of all commitment changes for audit compliance.

**Interface**:
```java
public interface ICommitmentHistoryTracker {
    CommitmentHistory recordPayment(Long partenaireFondId, double paymentAmount, 
                                     LocalDate paymentDate, CommitmentStatus previousStatus);
    CommitmentHistory recordStatusChange(Long partenaireFondId, CommitmentStatus previousStatus, 
                                          CommitmentStatus newStatus, String reason, LocalDate changeDate);
    List<CommitmentHistory> retrieveHistory(Long partenaireFondId);
}
```

**Key Methods**:

- `recordPayment(...)`: Creates historical record for payment processing
  - Captures payment amount, date, and previous status
  - Assigns unique identifier and timestamp
  - Returns: Created CommitmentHistory entity

- `recordStatusChange(...)`: Creates historical record for status transitions
  - Captures status change details and reason
  - Assigns unique identifier and timestamp
  - Returns: Created CommitmentHistory entity

- `retrieveHistory(Long partenaireFondId)`: Retrieves complete history
  - Returns: List of CommitmentHistory ordered chronologically (oldest to newest)
  - Returns empty list if no history exists
  - Throws: CommitmentNotFoundException if partenaireFondId doesn't exist

**Dependencies**:
- CommitmentHistoryRepository: Persist and query historical records
- PartenaireFondRepository: Validate commitment existence

**Business Rules**:
- Historical records are immutable (no updates or deletes allowed)
- Each record has unique identifier and creation timestamp
- Records ordered chronologically by timestamp
- Records preserved even if PartenaireFond is modified

## Data Models

### Existing Entities (Modified)

#### Fond Entity
```java
@Entity
public class Fond {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idFond;
    
    private String name;
    private String description;
    private double amount;
    private double committedAmount;  // NEW: Track total committed amount
    
    @Enumerated(EnumType.STRING)
    private FundStatus status;
    
    private LocalDate createdAt;
    
    public enum FundStatus {
        AVAILABLE, FULLY_ALLOCATED, CLOSED
    }
}
```

**Modifications**:
- Add `committedAmount` field to track total commitments (calculated from PartenaireFond records)

#### PartenaireFond Entity
```java
@Entity
public class PartenaireFond {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private Partenaire partenaire;
    
    @ManyToOne
    private Fond fond;
    
    private double committedAmount;
    
    @Enumerated(EnumType.STRING)
    private CommitmentStatus commitmentStatus;
    
    @Enumerated(EnumType.STRING)
    private PaymentMode paymentMode;
    
    private LocalDate commitmentDate;
    private LocalDate paymentDate;      // NEW: Track payment date
    private double paymentAmount;       // NEW: Track payment amount
    private LocalDate defaultDate;      // NEW: Track default date
    
    public enum CommitmentStatus {
        COMMITTED, PAID, DEFAULTED
    }
    
    public enum PaymentMode {
        LUMP_SUM, INSTALLMENTS
    }
}
```

**Modifications**:
- Add `paymentDate` field to record when payment was processed
- Add `paymentAmount` field to record payment amount
- Add `defaultDate` field to record when commitment was marked as defaulted

### New Entities

#### CommitmentHistory Entity
```java
@Entity
@Table(name = "commitment_history")
public class CommitmentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "partenaire_fond_id", nullable = false)
    private PartenaireFond partenaireFond;
    
    @Enumerated(EnumType.STRING)
    private CommitmentStatus previousStatus;
    
    @Enumerated(EnumType.STRING)
    private CommitmentStatus newStatus;
    
    @Enumerated(EnumType.STRING)
    private HistoryEventType eventType;
    
    private Double paymentAmount;
    private LocalDate eventDate;
    private String reason;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime recordedAt;
    
    @PrePersist
    protected void onCreate() {
        recordedAt = LocalDateTime.now();
    }
    
    public enum HistoryEventType {
        PAYMENT_PROCESSED, STATUS_CHANGED, COMMITMENT_DEFAULTED
    }
}
```

**Purpose**: Immutable audit trail of all commitment changes

**Key Characteristics**:
- Immutable: No update or delete operations allowed
- Timestamped: Automatic recordedAt timestamp on creation
- Comprehensive: Captures all relevant change details
- Ordered: Retrieved chronologically for audit review

### DTOs

#### FundAllocationReport
```java
public class FundAllocationReport {
    private Long fondId;
    private String fundName;
    private double totalAmount;
    private double committedAmount;
    private double allocationPercentage;
    private double remainingCapacity;
    private FundStatus status;
    private List<PartnerContribution> contributions;
}
```

#### PartnerContribution
```java
public class PartnerContribution {
    private Long partnerId;
    private String partnerName;
    private double committedAmount;
    private CommitmentStatus status;
    private LocalDate commitmentDate;
}
```

#### AllocationMetrics
```java
public class AllocationMetrics {
    private double allocationPercentage;
    private double remainingCapacity;
    private double committedAmount;
    private double totalAmount;
}
```

### Repository Extensions

#### PartenaireFondRepository
```java
@Repository
public interface PartenaireFondRepository extends JpaRepository<PartenaireFond, Long> {
    List<PartenaireFond> findByPartenaire(Partenaire partenaire);
    List<PartenaireFond> findByFond(Fond fond);  // NEW
    List<PartenaireFond> findByFondAndCommitmentStatusIn(Fond fond, List<CommitmentStatus> statuses);  // NEW
    
    @Query("SELECT SUM(pf.committedAmount) FROM PartenaireFond pf " +
           "WHERE pf.fond.idFond = :fondId AND pf.commitmentStatus IN :statuses")
    Double sumCommittedAmountByFondAndStatuses(@Param("fondId") Long fondId, 
                                                @Param("statuses") List<CommitmentStatus> statuses);  // NEW
}
```

#### CommitmentHistoryRepository
```java
@Repository
public interface CommitmentHistoryRepository extends JpaRepository<CommitmentHistory, Long> {
    List<CommitmentHistory> findByPartenaireFondOrderByRecordedAtAsc(PartenaireFond partenaireFond);
    List<CommitmentHistory> findByPartenaireFond_IdOrderByRecordedAtAsc(Long partenaireFondId);
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Allocation Metrics Calculation

For any fund with valid amount and committedAmount values, the allocation metrics should satisfy:
- allocation_percentage = (committedAmount / amount) × 100 (rounded to 2 decimal places)
- remaining_capacity = amount - committedAmount
- When amount is zero, allocation_percentage should be zero (avoiding division by zero)

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Fund Allocation Report Completeness

For any valid fund, the generated allocation report should include:
- All fund details (name, total amount, committedAmount, status)
- Calculated metrics (allocation_percentage, remaining_capacity)
- Complete list of all associated PartenaireFond records with partner names and committed amounts
- Empty partner list when no PartenaireFond records exist

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: Fund Status Transitions Based on Allocation

For any fund that is not CLOSED, the status should be:
- FULLY_ALLOCATED when committedAmount >= amount
- AVAILABLE when committedAmount < amount
- CLOSED status should never change regardless of committedAmount

**Validates: Requirements 3.1, 3.2, 3.4, 3.5**

### Property 4: Cascading Status Updates

For any PartenaireFond record creation, update, or status change, the associated fund's status should be recalculated and updated according to the allocation threshold rules.

**Validates: Requirements 3.3, 4.5, 5.3**

### Property 5: Payment Processing Completeness

For any PartenaireFond with status COMMITTED, when a valid payment (amount > 0) is processed:
- commitmentStatus should transition to PAID
- paymentAmount and paymentDate should be recorded
- Fund status should be recalculated
- Historical record should be created

**Validates: Requirements 4.1, 4.2, 4.5, 7.1**

### Property 6: Default Marking Completeness

For any PartenaireFond marked as defaulted:
- commitmentStatus should transition to DEFAULTED
- defaultDate should be recorded
- Fund status should be recalculated
- Historical record should be created

**Validates: Requirements 5.1, 5.2, 5.3, 7.2**

### Property 7: Valid Status Transitions

For any commitment, the following status transitions should be allowed:
- COMMITTED → PAID
- COMMITTED → DEFAULTED
- PAID → DEFAULTED

**Validates: Requirements 5.4, 5.5, 6.1, 6.2**

### Property 8: Invalid Status Transitions

For any commitment, the following status transitions should be rejected with an appropriate error:
- PAID → COMMITTED
- DEFAULTED → COMMITTED
- Any other invalid transition

**Validates: Requirements 6.3, 6.4, 6.5**

### Property 9: Committed Amount Calculation with Status Filtering

For any fund, the calculated committedAmount should equal the sum of all PartenaireFond committedAmount values where commitmentStatus is COMMITTED or PAID (excluding DEFAULTED commitments).

**Validates: Requirements 9.1, 9.2, 9.3, 9.5**

### Property 10: Historical Record Creation

For any payment processing or status change event, a historical record should be created containing:
- Associated PartenaireFond identifier
- Previous and new status
- Event type (PAYMENT_PROCESSED, STATUS_CHANGED, COMMITMENT_DEFAULTED)
- Relevant details (payment amount, dates, reason)
- Unique identifier and timestamp

**Validates: Requirements 7.1, 7.2, 7.3, 7.5**

### Property 11: Historical Record Immutability

For any existing historical record:
- Modification attempts should be prevented and return an error
- Deletion attempts should be prevented and return an error
- Records should persist unchanged even when PartenaireFond is modified

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 7.4**

### Property 12: Historical Record Retrieval Ordering

For any PartenaireFond with historical records, retrieving the history should return all records ordered chronologically from oldest to newest by timestamp, and should return an empty list when no history exists.

**Validates: Requirements 8.1, 8.2, 8.5, 8.3**

### Property 13: Error Handling for Non-Existent Entities

For any operation referencing a non-existent fund or PartenaireFond identifier, the system should return an appropriate error indicating the entity was not found.

**Validates: Requirements 2.5, 4.4, 8.4**

### Property 14: Invalid Payment Amount Rejection

For any payment processing attempt with an amount less than or equal to zero, the system should reject the payment and return an error indicating invalid payment amount.

**Validates: Requirements 4.3**

### Property 15: Invalid Status Transition Rejection with Error Description

For any invalid commitment status transition attempt, the system should reject the transition and return an error describing why the transition is invalid.

**Validates: Requirements 6.5**

## Error Handling

The system implements comprehensive error handling across all service components to ensure data integrity and provide clear feedback for invalid operations.

### Error Types and Handling Strategy

#### 1. Entity Not Found Errors

**Scenarios**:
- Fund identifier does not exist (FundAllocationService, FundStatusManager)
- PartenaireFond identifier does not exist (CommitmentLifecycleService, CommitmentHistoryTracker)

**Handling**:
- Throw `EntityNotFoundException` with descriptive message
- HTTP 404 status code at REST layer
- Include entity type and identifier in error message
- Example: "Fund with ID 123 not found"

#### 2. Invalid Input Errors

**Scenarios**:
- Payment amount ≤ 0 (CommitmentLifecycleService)
- Missing required fields in requests
- Invalid data types or formats

**Handling**:
- Throw `InvalidInputException` with validation details
- HTTP 400 status code at REST layer
- Include specific validation failure reason
- Example: "Payment amount must be greater than zero, received: -100.0"

#### 3. Invalid State Transition Errors

**Scenarios**:
- Attempting PAID → COMMITTED transition
- Attempting DEFAULTED → COMMITTED transition
- Any other invalid commitment status workflow violation

**Handling**:
- Throw `InvalidStatusTransitionException` with transition details
- HTTP 409 status code at REST layer (conflict)
- Include current status, attempted status, and reason for rejection
- Example: "Cannot transition from PAID to COMMITTED: reverse transitions not allowed"

#### 4. Immutability Violation Errors

**Scenarios**:
- Attempting to modify existing CommitmentHistory record
- Attempting to delete existing CommitmentHistory record

**Handling**:
- Throw `ImmutabilityViolationException` with operation details
- HTTP 403 status code at REST layer (forbidden)
- Clear message about audit trail immutability
- Example: "Historical records are immutable and cannot be modified"

#### 5. Data Integrity Errors

**Scenarios**:
- Database constraint violations
- Concurrent modification conflicts
- Orphaned entity references

**Handling**:
- Throw `DataIntegrityException` with context
- HTTP 500 status code at REST layer
- Log full stack trace for debugging
- Return generic message to client (avoid exposing internal details)

### Exception Hierarchy

```java
// Base exception for all fund management errors
public class FundManagementException extends RuntimeException {
    private final String errorCode;
    private final Map<String, Object> details;
}

// Specific exception types
public class EntityNotFoundException extends FundManagementException { }
public class InvalidInputException extends FundManagementException { }
public class InvalidStatusTransitionException extends FundManagementException { }
public class ImmutabilityViolationException extends FundManagementException { }
public class DataIntegrityException extends FundManagementException { }
```

### Global Exception Handler

```java
@RestControllerAdvice
public class FundManagementExceptionHandler {
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage(), ex.getDetails()));
    }
    
    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ErrorResponse> handleInvalidInput(InvalidInputException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage(), ex.getDetails()));
    }
    
    @ExceptionHandler(InvalidStatusTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTransition(InvalidStatusTransitionException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage(), ex.getDetails()));
    }
    
    @ExceptionHandler(ImmutabilityViolationException.class)
    public ResponseEntity<ErrorResponse> handleImmutabilityViolation(ImmutabilityViolationException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage(), ex.getDetails()));
    }
    
    @ExceptionHandler(DataIntegrityException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityException ex) {
        // Log full details internally
        logger.error("Data integrity error", ex);
        // Return generic message to client
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("DATA_INTEGRITY_ERROR", 
                "An error occurred while processing your request", null));
    }
}
```

### Error Response Format

```java
public class ErrorResponse {
    private String errorCode;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, Object> details;
}
```

**Example Error Response**:
```json
{
  "errorCode": "INVALID_STATUS_TRANSITION",
  "message": "Cannot transition from PAID to COMMITTED: reverse transitions not allowed",
  "timestamp": "2024-01-15T10:30:00",
  "details": {
    "currentStatus": "PAID",
    "attemptedStatus": "COMMITTED",
    "partenaireFondId": 456
  }
}
```

### Validation Strategy

- **Input Validation**: Use Bean Validation annotations (@NotNull, @Positive, @Valid) on DTOs
- **Business Rule Validation**: Implement in service layer before state changes
- **Database Constraints**: Enforce at database level (NOT NULL, UNIQUE, FOREIGN KEY)
- **Transactional Boundaries**: Use @Transactional to ensure atomicity and rollback on errors

## Testing Strategy

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for comprehensive validation of universal properties.

### Testing Framework Selection

**Unit Testing**:
- JUnit 5 for test structure and assertions
- Mockito for mocking dependencies
- Spring Boot Test for integration testing
- AssertJ for fluent assertions

**Property-Based Testing**:
- **jqwik** (Java QuickCheck) for property-based testing
- Minimum 100 iterations per property test
- Custom generators for domain entities (Fond, PartenaireFond, CommitmentHistory)

### Unit Testing Approach

Unit tests focus on specific examples, edge cases, and integration points between components.

**Key Areas for Unit Tests**:

1. **Service Layer Logic**:
   - Specific calculation examples (e.g., 50% allocation, 100% allocation)
   - Edge cases (zero amount funds, empty partner lists)
   - Error conditions (invalid IDs, negative payments)
   - Status transition workflows

2. **Repository Integration**:
   - Query methods return correct results
   - Custom queries (sumCommittedAmountByFondAndStatuses) work correctly
   - Entity relationships are properly maintained

3. **Controller Layer**:
   - Request mapping and parameter binding
   - Response formatting and HTTP status codes
   - Exception handling and error responses

4. **Component Integration**:
   - FundStatusManager triggered by CommitmentLifecycleService
   - CommitmentHistoryTracker records created on status changes
   - Cascading updates flow correctly through system

**Example Unit Test**:
```java
@SpringBootTest
class FundAllocationServiceTest {
    
    @Autowired
    private IFundAllocationService allocationService;
    
    @Test
    void shouldCalculate50PercentAllocation() {
        // Given: Fund with 1000 total, 500 committed
        Fond fund = createFund(1000.0, 500.0);
        
        // When: Generate allocation report
        FundAllocationReport report = allocationService.generateReport(fund.getIdFond());
        
        // Then: Allocation should be 50%
        assertThat(report.getAllocationPercentage()).isEqualTo(50.0);
        assertThat(report.getRemainingCapacity()).isEqualTo(500.0);
    }
    
    @Test
    void shouldHandleZeroAmountFund() {
        // Given: Fund with zero amount
        Fond fund = createFund(0.0, 0.0);
        
        // When: Generate allocation report
        FundAllocationReport report = allocationService.generateReport(fund.getIdFond());
        
        // Then: Should return 0% without division error
        assertThat(report.getAllocationPercentage()).isEqualTo(0.0);
    }
    
    @Test
    void shouldThrowExceptionForNonExistentFund() {
        // When/Then: Should throw EntityNotFoundException
        assertThatThrownBy(() -> allocationService.generateReport(999L))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("Fund with ID 999 not found");
    }
}
```

### Property-Based Testing Approach

Property tests verify universal properties across randomly generated inputs to ensure correctness at scale.

**Property Test Configuration**:
- Each test runs minimum 100 iterations
- Each test tagged with comment referencing design property
- Tag format: `// Feature: fund-management-enhancements, Property {number}: {property_text}`

**Custom Generators**:

```java
@Provide
Arbitrary<Fond> fondGenerator() {
    return Combinators.combine(
        Arbitraries.doubles().between(0, 1000000),  // amount
        Arbitraries.doubles().between(0, 1000000),  // committedAmount
        Arbitraries.of(FundStatus.values())
    ).as((amount, committed, status) -> {
        Fond fond = new Fond();
        fond.setAmount(amount);
        fond.setCommittedAmount(Math.min(committed, amount));  // Ensure valid state
        fond.setStatus(status);
        return fond;
    });
}

@Provide
Arbitrary<PartenaireFond> partenaireFondGenerator() {
    return Combinators.combine(
        Arbitraries.doubles().between(1, 100000),  // committedAmount
        Arbitraries.of(CommitmentStatus.values())
    ).as((amount, status) -> {
        PartenaireFond pf = new PartenaireFond();
        pf.setCommittedAmount(amount);
        pf.setCommitmentStatus(status);
        return pf;
    });
}
```

**Example Property Tests**:

```java
@PropertyTest
@Tag("fund-management-enhancements")
class FundAllocationPropertiesTest {
    
    // Feature: fund-management-enhancements, Property 1: Allocation Metrics Calculation
    @Property(tries = 100)
    void allocationMetricsShouldBeCorrectlyCalculated(
        @ForAll("fondGenerator") Fond fond
    ) {
        // Given: Any fund with valid amount and committedAmount
        AllocationMetrics metrics = allocationService.calculateMetrics(fond.getIdFond());
        
        // Then: Metrics should satisfy calculation rules
        if (fond.getAmount() == 0) {
            assertThat(metrics.getAllocationPercentage()).isEqualTo(0.0);
        } else {
            double expectedPercentage = (fond.getCommittedAmount() / fond.getAmount()) * 100;
            assertThat(metrics.getAllocationPercentage())
                .isCloseTo(expectedPercentage, within(0.01));  // 2 decimal precision
        }
        
        double expectedRemaining = fond.getAmount() - fond.getCommittedAmount();
        assertThat(metrics.getRemainingCapacity()).isEqualTo(expectedRemaining);
    }
    
    // Feature: fund-management-enhancements, Property 3: Fund Status Transitions Based on Allocation
    @Property(tries = 100)
    void fundStatusShouldReflectAllocationLevel(
        @ForAll("fondGenerator") Fond fond
    ) {
        // Given: Any fund that is not CLOSED
        Assume.that(fond.getStatus() != FundStatus.CLOSED);
        
        // When: Status is updated based on allocation
        fundStatusManager.updateFundStatus(fond.getIdFond());
        Fond updated = fondRepository.findById(fond.getIdFond()).orElseThrow();
        
        // Then: Status should match allocation level
        if (updated.getCommittedAmount() >= updated.getAmount()) {
            assertThat(updated.getStatus()).isEqualTo(FundStatus.FULLY_ALLOCATED);
        } else {
            assertThat(updated.getStatus()).isEqualTo(FundStatus.AVAILABLE);
        }
    }
    
    // Feature: fund-management-enhancements, Property 7: Valid Status Transitions
    @Property(tries = 100)
    void validStatusTransitionsShouldBeAllowed(
        @ForAll("partenaireFondGenerator") PartenaireFond pf,
        @ForAll @From("validTransitions") StatusTransition transition
    ) {
        // Given: Any commitment and valid transition
        pf.setCommitmentStatus(transition.from);
        
        // When: Transition is validated
        boolean isValid = commitmentLifecycleService.validateStatusTransition(
            transition.from, transition.to
        );
        
        // Then: Should be allowed
        assertThat(isValid).isTrue();
    }
    
    // Feature: fund-management-enhancements, Property 8: Invalid Status Transitions
    @Property(tries = 100)
    void invalidStatusTransitionsShouldBeRejected(
        @ForAll("partenaireFondGenerator") PartenaireFond pf,
        @ForAll @From("invalidTransitions") StatusTransition transition
    ) {
        // Given: Any commitment and invalid transition
        pf.setCommitmentStatus(transition.from);
        
        // When: Transition is validated
        boolean isValid = commitmentLifecycleService.validateStatusTransition(
            transition.from, transition.to
        );
        
        // Then: Should be rejected
        assertThat(isValid).isFalse();
    }
    
    // Feature: fund-management-enhancements, Property 9: Committed Amount Calculation with Status Filtering
    @Property(tries = 100)
    void committedAmountShouldExcludeDefaultedCommitments(
        @ForAll("fondWithMultipleCommitments") Fond fond
    ) {
        // Given: Any fund with multiple commitments of various statuses
        FundAllocationReport report = allocationService.generateReport(fond.getIdFond());
        
        // When: Calculate expected committed amount (excluding DEFAULTED)
        double expectedCommitted = partenaireFondRepository.findByFond(fond).stream()
            .filter(pf -> pf.getCommitmentStatus() == CommitmentStatus.COMMITTED 
                       || pf.getCommitmentStatus() == CommitmentStatus.PAID)
            .mapToDouble(PartenaireFond::getCommittedAmount)
            .sum();
        
        // Then: Report should match expected amount
        assertThat(report.getCommittedAmount()).isEqualTo(expectedCommitted);
    }
    
    // Feature: fund-management-enhancements, Property 11: Historical Record Immutability
    @Property(tries = 100)
    void historicalRecordsShouldBeImmutable(
        @ForAll("commitmentHistoryGenerator") CommitmentHistory history
    ) {
        // Given: Any existing historical record
        CommitmentHistory saved = commitmentHistoryRepository.save(history);
        
        // When: Attempt to modify the record
        saved.setPaymentAmount(999.99);
        
        // Then: Modification should be prevented (or have no effect)
        CommitmentHistory retrieved = commitmentHistoryRepository
            .findById(saved.getId()).orElseThrow();
        assertThat(retrieved.getPaymentAmount()).isNotEqualTo(999.99);
    }
}
```

**Valid Transitions Generator**:
```java
@Provide
Arbitrary<StatusTransition> validTransitions() {
    return Arbitraries.of(
        new StatusTransition(CommitmentStatus.COMMITTED, CommitmentStatus.PAID),
        new StatusTransition(CommitmentStatus.COMMITTED, CommitmentStatus.DEFAULTED),
        new StatusTransition(CommitmentStatus.PAID, CommitmentStatus.DEFAULTED)
    );
}
```

**Invalid Transitions Generator**:
```java
@Provide
Arbitrary<StatusTransition> invalidTransitions() {
    return Arbitraries.of(
        new StatusTransition(CommitmentStatus.PAID, CommitmentStatus.COMMITTED),
        new StatusTransition(CommitmentStatus.DEFAULTED, CommitmentStatus.COMMITTED),
        new StatusTransition(CommitmentStatus.DEFAULTED, CommitmentStatus.PAID)
    );
}
```

### Test Coverage Goals

- **Line Coverage**: Minimum 80% across all service classes
- **Branch Coverage**: Minimum 75% for conditional logic
- **Property Coverage**: 100% of correctness properties implemented as property tests
- **Integration Coverage**: All service interactions tested

### Testing Best Practices

1. **Isolation**: Use @Transactional with rollback for database tests
2. **Test Data**: Use builders or factories for consistent test data creation
3. **Assertions**: Use AssertJ for readable, fluent assertions
4. **Naming**: Follow pattern `shouldDoSomething_whenCondition` for unit tests
5. **Documentation**: Tag all property tests with feature name and property number
6. **Performance**: Keep unit tests fast (<100ms each), property tests can be slower
7. **Determinism**: Ensure property tests are reproducible with seed values

### Continuous Integration

- Run all unit tests on every commit
- Run property tests on pull requests
- Generate coverage reports and enforce minimum thresholds
- Fail build on test failures or coverage drops

---

## Implementation Notes

### Database Migration

The implementation requires database schema changes:

1. **Fond table**: Add `committedAmount` column (DOUBLE, default 0)
2. **PartenaireFond table**: Add `paymentDate`, `paymentAmount`, `defaultDate` columns
3. **CommitmentHistory table**: Create new table with all specified columns
4. **Indexes**: Add indexes on foreign keys and frequently queried columns

Use Flyway or Liquibase for version-controlled migrations.

### Transaction Management

- All service methods that modify data should be @Transactional
- Use appropriate isolation levels for concurrent access scenarios
- Consider optimistic locking (@Version) for Fond entity to handle concurrent updates

### Performance Considerations

- **Caching**: Consider caching fund allocation reports for frequently accessed funds
- **Batch Operations**: Use batch updates when processing multiple commitments
- **Query Optimization**: Ensure indexes exist on foreign keys and status columns
- **Lazy Loading**: Configure appropriate fetch strategies for entity relationships

### Security Considerations

- **Authorization**: Implement role-based access control for sensitive operations
- **Audit Logging**: Log all commitment status changes and payment processing
- **Input Sanitization**: Validate and sanitize all user inputs
- **SQL Injection**: Use parameterized queries (handled by JPA)

### Monitoring and Observability

- **Metrics**: Track allocation calculation times, status update frequencies
- **Logging**: Log all service operations with correlation IDs
- **Alerts**: Set up alerts for failed status transitions or data integrity issues
- **Health Checks**: Implement health endpoints for service availability