package com.lwr.connecting.service.impl;

import com.lwr.connecting.service.SmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class SmsServiceImpl implements SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsServiceImpl.class);

    @Value("${sms.provider:DEV}")
    private String smsProvider;

    @Value("${sms.enabled:false}")
    private boolean smsEnabled;

    @Override
    @Async
    public void sendOtpSms(String mobileNumber, String otp, String idempotencyKey) {
        if (!smsEnabled || "DEV".equalsIgnoreCase(smsProvider) || "LOG".equalsIgnoreCase(smsProvider)) {
            logger.info("=========================================================");
            logger.info("[DEV ONLY] Mobile verification OTP generated for mobile {}: [{}]", mobileNumber, otp);
            logger.info("=========================================================");
        } else {
            logger.info("[SMS PROVIDER] Dispatched SMS OTP to {}", mobileNumber);
        }
    }
}
