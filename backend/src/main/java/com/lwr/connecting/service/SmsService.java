package com.lwr.connecting.service;

public interface SmsService {
    void sendOtpSms(String mobileNumber, String otp, String idempotencyKey);
}
