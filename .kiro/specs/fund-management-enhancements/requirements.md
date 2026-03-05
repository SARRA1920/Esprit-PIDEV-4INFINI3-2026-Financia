# Requirements Document

## Introduction

This document specifies requirements for enhancements to the fund management system in the Financia application. The enhancements focus on tracking fund allocation, automating fund status management, implementing commitment lifecycle workflows, and maintaining historical records of partner contributions.

## Glossary

- **Fund_Allocation_Service**: The service component responsible for calculating and reporting fund allocation metrics
- **Fund_Status_Manager**: The service component responsible for automatically updating fund status based on allocation levels
- **Commitment_Lifecycle_Service**: The service component responsible for managing commitment status transitions and payment processing
- **Commitment_History_Tracker**: The service component responsible for recording and retrieving historical commitment data
- **Fond**: The entity representing a financial fund with a total amount and committed amount
- **PartenaireFond**: The entity representing the relationship between a partner and a fund, including commitment details
- **Partenaire**: The entity representing a financial partner
- **committedAmount**: The total amount committed by partners to a specific fund
- **amount**: The total capacity of a fund
- **commitmentStatus**: The current state of a partner's commitment (COMMITTED, PAID, DEFAULTED)
- **allocation_percentage**: The ratio of committedAmount to amount expressed as a percentage
- **remaining_capacity**: The difference between amount and committedAmount

## Requirements

### Requirement 1: Fund Allocation Calculation

**User Story:** As a fund manager, I want to view the allocation percentage of each fund, so that I can understand how much capacity remains available.

#### Acceptance Criteria

1. WHEN a fund allocation report is requested for a valid fund, THE Fund_Allocation_Service SHALL calculate the allocation_percentage as (committedAmount / amount) * 100
2. WHEN a fund allocation report is requested for a valid fund, THE Fund_Allocation_Service SHALL calculate the remaining_capacity as (amount - committedAmount)
3. IF the amount of a fund is zero, THEN THE Fund_Allocation_Service SHALL return an allocation_percentage of zero
4. THE Fund_Allocation_Service SHALL return allocation metrics with precision to two decimal places

### Requirement 2: Fund Allocation Reporting

**User Story:** As a fund manager, I want to generate comprehensive allocation reports, so that I can review fund status and contributing partners.

#### Acceptance Criteria

1. WHEN a fund allocation report is requested for a valid fund, THE Fund_Allocation_Service SHALL retrieve all PartenaireFond records associated with that fund
2. WHEN a fund allocation report is requested for a valid fund, THE Fund_Allocation_Service SHALL include the fund name, total amount, committedAmount, allocation_percentage, and remaining_capacity
3. WHEN a fund allocation report is requested for a valid fund, THE Fund_Allocation_Service SHALL include a list of contributing partners with their names and committed amounts
4. IF a fund has no associated PartenaireFond records, THEN THE Fund_Allocation_Service SHALL return an empty list of contributing partners
5. IF a fund identifier does not exist, THEN THE Fund_Allocation_Service SHALL return an error indicating the fund was not found

### Requirement 3: Automatic Fund Status Updates

**User Story:** As a fund manager, I want fund status to automatically update based on allocation levels, so that I can quickly identify fully allocated funds.

#### Acceptance Criteria

1. WHEN the committedAmount equals the amount for a fund, THE Fund_Status_Manager SHALL update the fund status to FULLY_ALLOCATED
2. WHEN the committedAmount is less than the amount for a fund with status FULLY_ALLOCATED, THE Fund_Status_Manager SHALL update the fund status to AVAILABLE
3. WHEN a PartenaireFond record is created or updated, THE Fund_Status_Manager SHALL recalculate and update the fund status
4. THE Fund_Status_Manager SHALL preserve the CLOSED status regardless of committedAmount changes
5. WHEN the committedAmount exceeds the amount for a fund, THE Fund_Status_Manager SHALL update the fund status to FULLY_ALLOCATED

### Requirement 4: Commitment Payment Processing

**User Story:** As a financial officer, I want to process partner payments and update commitment status, so that I can track which commitments have been fulfilled.

#### Acceptance Criteria

1. WHEN a payment is processed for a PartenaireFond with status COMMITTED, THE Commitment_Lifecycle_Service SHALL update the commitmentStatus to PAID
2. WHEN a payment is processed, THE Commitment_Lifecycle_Service SHALL record the payment amount and payment date
3. IF a payment amount is less than or equal to zero, THEN THE Commitment_Lifecycle_Service SHALL return an error indicating invalid payment amount
4. IF a PartenaireFond identifier does not exist, THEN THE Commitment_Lifecycle_Service SHALL return an error indicating the commitment was not found
5. WHEN a payment is successfully processed, THE Commitment_Lifecycle_Service SHALL trigger the Fund_Status_Manager to update the associated fund status

### Requirement 5: Commitment Default Handling

**User Story:** As a financial officer, I want to mark commitments as defaulted when payment terms are not met, so that I can track unfulfilled obligations.

#### Acceptance Criteria

1. WHEN a commitment is marked as defaulted, THE Commitment_Lifecycle_Service SHALL update the commitmentStatus to DEFAULTED
2. WHEN a commitment is marked as defaulted, THE Commitment_Lifecycle_Service SHALL record the default date
3. WHEN a commitment status changes to DEFAULTED, THE Commitment_Lifecycle_Service SHALL trigger the Fund_Status_Manager to recalculate the fund status
4. THE Commitment_Lifecycle_Service SHALL allow status transition from COMMITTED to DEFAULTED
5. THE Commitment_Lifecycle_Service SHALL allow status transition from PAID to DEFAULTED

### Requirement 6: Commitment Status Workflow Validation

**User Story:** As a system administrator, I want commitment status transitions to follow valid workflows, so that data integrity is maintained.

#### Acceptance Criteria

1. THE Commitment_Lifecycle_Service SHALL allow status transition from COMMITTED to PAID
2. THE Commitment_Lifecycle_Service SHALL allow status transition from COMMITTED to DEFAULTED
3. THE Commitment_Lifecycle_Service SHALL prevent status transition from PAID to COMMITTED
4. THE Commitment_Lifecycle_Service SHALL prevent status transition from DEFAULTED to COMMITTED
5. IF an invalid status transition is attempted, THEN THE Commitment_Lifecycle_Service SHALL return an error describing the invalid transition

### Requirement 7: Historical Commitment Recording

**User Story:** As a fund manager, I want to track the history of all contributions made by partners, so that I can audit payment patterns over time.

#### Acceptance Criteria

1. WHEN a payment is processed for a PartenaireFond, THE Commitment_History_Tracker SHALL create a historical record containing the payment amount, payment date, and previous commitmentStatus
2. WHEN a commitment status changes, THE Commitment_History_Tracker SHALL create a historical record containing the status change, change date, and reason for change
3. THE Commitment_History_Tracker SHALL associate each historical record with the corresponding PartenaireFond identifier
4. THE Commitment_History_Tracker SHALL preserve historical records even if the PartenaireFond record is modified
5. WHEN a historical record is created, THE Commitment_History_Tracker SHALL assign a unique identifier and timestamp to the record

### Requirement 8: Historical Commitment Retrieval

**User Story:** As a fund manager, I want to retrieve the complete history of contributions for a partner-fund relationship, so that I can review payment patterns and status changes.

#### Acceptance Criteria

1. WHEN commitment history is requested for a valid PartenaireFond, THE Commitment_History_Tracker SHALL retrieve all historical records in chronological order
2. WHEN commitment history is requested for a valid PartenaireFond, THE Commitment_History_Tracker SHALL include payment amounts, payment dates, status changes, and change reasons
3. IF a PartenaireFond has no historical records, THEN THE Commitment_History_Tracker SHALL return an empty list
4. IF a PartenaireFond identifier does not exist, THEN THE Commitment_History_Tracker SHALL return an error indicating the commitment was not found
5. THE Commitment_History_Tracker SHALL order historical records from oldest to newest by timestamp

### Requirement 9: Fund Allocation Report Data Consistency

**User Story:** As a fund manager, I want allocation reports to reflect real-time data, so that I can make informed decisions based on current fund status.

#### Acceptance Criteria

1. WHEN a fund allocation report is generated, THE Fund_Allocation_Service SHALL calculate committedAmount by summing all PartenaireFond committedAmount values for that fund
2. WHEN a fund allocation report is generated, THE Fund_Allocation_Service SHALL exclude PartenaireFond records with commitmentStatus DEFAULTED from the committedAmount calculation
3. WHEN a fund allocation report is generated, THE Fund_Allocation_Service SHALL include only PartenaireFond records with commitmentStatus COMMITTED or PAID in the committedAmount calculation
4. THE Fund_Allocation_Service SHALL retrieve data directly from the database to ensure real-time accuracy
5. WHEN multiple PartenaireFond records exist for the same partner and fund, THE Fund_Allocation_Service SHALL include all records in the calculation

### Requirement 10: Commitment History Data Integrity

**User Story:** As a system administrator, I want historical commitment records to be immutable, so that audit trails cannot be tampered with.

#### Acceptance Criteria

1. THE Commitment_History_Tracker SHALL prevent modification of existing historical records
2. THE Commitment_History_Tracker SHALL prevent deletion of existing historical records
3. IF an attempt is made to modify a historical record, THEN THE Commitment_History_Tracker SHALL return an error indicating records are immutable
4. IF an attempt is made to delete a historical record, THEN THE Commitment_History_Tracker SHALL return an error indicating records cannot be deleted
5. THE Commitment_History_Tracker SHALL allow creation of new historical records only through the defined payment processing and status change workflows
