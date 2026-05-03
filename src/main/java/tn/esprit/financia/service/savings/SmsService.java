package tn.esprit.financia.service.savings;

public interface SmsService {
    void sendSms(String phoneNumber, String message);
}
