# Financia – Digital Microfinance Platform for Rural Women

## Overview
This project was developed as part of the PIDEV – 3rd Year Engineering 
Program at **Esprit School of Engineering** (Academic Year 2025–2026).

Financia is a unified digital microfinance platform targeting unbanked 
rural women entrepreneurs in Tunisia. It digitizes the full loan lifecycle 
— Application → Scoring → Contract → Repayment — while embedding 
microsavings and financial literacy training.
## Features
- Behavioral credit scoring (no guarantor required)
- Integrated microsaving accounts (Epargne)
- Embedded financial literacy training modules
- Digital contracts with e-signatures
- Real-time repayment monitoring dashboard
- Partner & fund allocation portal

## Tech Stack
### Frontend
- Angular (responsive, component-based)

### Backend
- Spring Boot (REST APIs, business logic)
- Spring Security with JWT authentication
- JPA / Hibernate

### Database
- Relational database (MySQL )

### Integration Layer
- E-signature services
- Payment gateways
- ## Architecture
Three-tier physical architecture:
- **Presentation**: Angular frontend hosted on Apache (XAMPP)
- **Application**: Spring Boot backend on Apache Tomcat
- **Data**: Relational database server

Service-oriented logical architecture with 6 domain services:
User · Credit · Contract · Savings · Training & Scoring · Partner & Fund

## Contributors
| Name | Role |
|------|------|
| Smati Maram | Developer |
| Arfaoui Sarra | Developer |
| Jouini Chahed | Developer |
| Landolsi Aymen | Developer |
| Naifar Baha eddine | Developer |
| Arifa Med Anas | Developer |
## Academic Context
Developed at **Esprit School of Engineering – Tunisia**  
Program: PIDEV – 3rd Year Engineering  
Academic Year: 2025–2026  
Team: NextGen

## Getting Started
```bash
# Clone the repository
git clone https://github.com/[your-username]/Esprit-PIDEV-3A10-2026-Financia.git

# Backend (Spring Boot)
cd backend
mvn spring-boot:run

# Frontend (Angular)
cd frontend
npm install
ng serve
```
For an Angular + Spring Boot stack, the recommended split is:

Frontend (Angular) → deploy to Vercel (free, instant, connects to GitHub)
Backend (Spring Boot) → deploy to Render or Railway (free tier available)
Database → Railway MySQL or PlanetScale (free tier)
If you have GitHub Education Pack → DigitalOcean gives $200 free credits
## Acknowledgments
This project was built as part of the academic curriculum at 
**Esprit School of Engineering**, Tunisia. 
It aims to address real financial exclusion challenges faced by 
rural women entrepreneurs in Tunisia, aligned with UN SDGs 1, 4, 5, 8, 9, and 10.
