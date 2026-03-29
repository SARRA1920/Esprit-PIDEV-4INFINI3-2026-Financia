# 🏦 Financia - Financial Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive financial management system built with Spring Boot for managing contracts, credits, payment schedules, penalties, and partner funds. This project is part of the ESPRIT PIDEV 4INFINI3-2026 academic project.

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Key Modules](#-key-modules)
- [Testing](#-testing)
- [Contributors](#-contributors)

## ✨ Features

### Core Functionality
- **Contract Management**: Create, update, and manage financial contracts
- **Credit Management**: Handle credit applications and approvals
- **Payment Schedules (Échéancier)**: Automated payment schedule generation and tracking
- **Penalty Calculation**: Automatic penalty calculation for overdue payments
- **Partner & Fund Management**: Manage partners and their fund allocations
- **Reimbursement Tracking**: Track and manage loan reimbursements

### Advanced Features
- **📧 Email Notifications**: Automated email alerts for payment reminders and overdue notices
- **📱 SMS/WhatsApp Integration**: Send payment reminders via Twilio WhatsApp
- **💱 Currency Exchange**: Real-time exchange rate integration
- **📄 PDF Generation**: Generate payment schedules and contract documents
- **🔐 Security**: Spring Security with BCrypt password encryption
- **📊 RESTful API**: Complete REST API with Swagger documentation

## 🛠 Technologies

### Backend
- **Java 21**
- **Spring Boot 3.3.2**
  - Spring Web
  - Spring Data JPA
  - Spring Security
  - Spring Mail
- **MySQL** - Database
- **Hibernate** - ORM
- **Lombok** - Reduce boilerplate code

### Libraries & Tools
- **Swagger/OpenAPI 3** - API Documentation
- **iText7** - PDF Generation
- **Twilio SDK** - SMS/WhatsApp Integration
- **Thymeleaf** - Email Templates
- **Maven** - Build Tool

## 📦 Prerequisites

Before running this application, ensure you have:

- **Java 21** or higher installed
- **MySQL 8.0+** installed and running
- **Maven 3.8+** (or use included Maven wrapper)
- **Git** for version control
- **Twilio Account** (optional, for SMS/WhatsApp features)
- **Gmail Account** (for email notifications)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/SARRA1920/Esprit-PIDEV-4INFINI3-2026-Financia.git
cd Esprit-PIDEV-4INFINI3-2026-Financia
git checkout Contrat_PaymentEchancier
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE Financia;
```

The application will automatically create tables on first run thanks to `spring.jpa.hibernate.ddl-auto=update`.

### 3. Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/Financia?createDatabaseIfNotExist=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Email Configuration (Gmail)
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD

# Twilio Configuration (Optional)
twilio.account.sid=YOUR_TWILIO_SID
twilio.auth.token=YOUR_TWILIO_TOKEN
twilio.whatsapp.number=whatsapp:+YOUR_TWILIO_NUMBER
```

### 4. Build the Project

Using Maven wrapper (recommended):

```bash
# Windows
mvnw.cmd clean install

# Linux/Mac
./mvnw clean install
```

Or using Maven:

```bash
mvn clean install
```

## ⚙️ Configuration

### Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use the generated password in `application.properties`

### Twilio WhatsApp Setup

1. Create a Twilio account: [Twilio Console](https://console.twilio.com/)
2. Get your Account SID and Auth Token
3. Enable WhatsApp sandbox for testing
4. Update credentials in `application.properties`

### Alternative Email Providers

The project includes configuration files for:
- **Mailtrap**: `application-mailtrap.properties`
- **Gmail Alternative**: `application-gmail-alternative.properties`

## 🏃 Running the Application

### Using Maven Wrapper

```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

### Using Maven

```bash
mvn spring-boot:run
```

### Using JAR

```bash
java -jar target/financia-0.0.1-SNAPSHOT.jar
```

The application will start on **http://localhost:8083**

## 📚 API Documentation

Once the application is running, access the Swagger UI:

**Swagger UI**: http://localhost:8083/swagger-ui.html

**OpenAPI Docs**: http://localhost:8083/api-docs

### Key API Endpoints

#### Contracts
- `GET /api/contrats` - Get all contracts
- `POST /api/contrats` - Create new contract
- `PUT /api/contrats/{id}` - Update contract
- `DELETE /api/contrats/{id}` - Delete contract

#### Credits
- `GET /api/credits` - Get all credits
- `POST /api/credits` - Create new credit
- `GET /api/credits/{id}` - Get credit by ID

#### Payment Schedules
- `GET /api/echeanciers` - Get all payment schedules
- `POST /api/echeanciers/generate` - Generate payment schedule
- `GET /api/echeanciers/overdue` - Get overdue payments
- `POST /api/echeanciers/send-reminders` - Send payment reminders

#### Penalties
- `GET /api/penalties/calculate/{echeancier}` - Calculate penalties
- `GET /api/penalties/history/{echeancier}` - Get penalty history
- `POST /api/penalties/apply-all-overdue` - Apply penalties to all overdue

#### Exchange Rates
- `GET /api/exchange-rates/latest` - Get latest exchange rates
- `GET /api/exchange-rates/convert` - Convert currency

## 📁 Project Structure

```
financia/
├── src/
│   ├── main/
│   │   ├── java/tn/esprit/financia/
│   │   │   ├── config/           # Configuration classes
│   │   │   ├── controller/       # REST Controllers
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── entities/         # JPA Entities
│   │   │   │   └── enums/        # Enumerations
│   │   │   ├── repository/       # JPA Repositories
│   │   │   └── service/          # Business Logic
│   │   └── resources/
│   │       ├── application.properties
│   │       └── templates/        # Email templates
│   └── test/                     # Test classes
├── docs/                         # Documentation files
├── pom.xml                       # Maven configuration
└── README.md                     # This file
```

## 🔑 Key Modules

### 1. Contract Management (`ContratController`)
Handles contract lifecycle including creation, updates, and status management.

### 2. Payment Schedule (`EcheancierPayementController`)
- Automatic payment schedule generation
- Overdue payment detection
- Payment reminders via email/SMS
- PDF generation for payment schedules

### 3. Penalty System (`PenaltyController`)
- Automatic penalty calculation for late payments
- Configurable penalty rates
- Penalty history tracking
- Bulk penalty application

### 4. Credit Management (`CreditController`)
Manages credit applications, approvals, and tracking.

### 5. Partner & Fund Management
- Partner registration and management
- Fund allocation and tracking
- Partner-Fund relationship management

### 6. Notification Services
- **EmailService**: Sends formatted emails with templates
- **WhatsAppService**: Sends SMS/WhatsApp notifications via Twilio
- Automated reminders for upcoming and overdue payments

## 🧪 Testing

### Testing Guides

The project includes comprehensive testing guides:

- `PENALTY_SWAGGER_TESTING_GUIDE.md` - Penalty system testing
- `EMAIL_TESTING_GUIDE.md` - Email notification testing
- `SMS_NOTIFICATION_GUIDE.md` - SMS/WhatsApp testing
- `EXCHANGE_RATE_API_TESTING_GUIDE.md` - Currency exchange testing
- `PDF_TESTING_GUIDE.md` - PDF generation testing

### Run Tests

```bash
mvn test
```

### Manual Testing with Swagger

1. Start the application
2. Navigate to http://localhost:8083/swagger-ui.html
3. Use the interactive API documentation to test endpoints

## 📖 Additional Documentation

- `API_INTEGRATION_PLAN.md` - API integration guidelines
- `HOW_TO_USE_CURRENCY.md` - Currency exchange feature guide
- `SMS_QUICK_START.md` - Quick start for SMS features
- `PENALTY_IMPLEMENTATION_SUMMARY.md` - Penalty system overview

## 🤝 Contributors

**Team 4INFINI3 - ESPRIT 2026**

- Contract & Payment Schedule Module
- Credit Management Module
- Partner & Fund Management Module
- Penalty Calculation System
- Notification Services

## 📄 License

This project is part of an academic project at ESPRIT and is intended for educational purposes.

## 🐛 Known Issues & Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify database credentials in `application.properties`
- Check if port 3306 is available

### Email Not Sending
- Verify Gmail App Password is correct
- Check firewall settings for port 587
- Ensure 2FA is enabled on Gmail account

### Twilio WhatsApp Issues
- Verify Twilio credentials
- Check WhatsApp sandbox status
- Ensure phone numbers are in correct format

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

**Built with ❤️ by Team 4INFINI3 at ESPRIT**
