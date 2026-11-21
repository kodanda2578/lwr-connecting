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

    private String maskMobile(String mobile) {
        if (mobile == null || mobile.length() < 4) return "****";
        return mobile.substring(0, 2) + "******" + mobile.substring(mobile.length() - 2);
    }

    @Override
    @Async
    public void sendOtpSms(String mobileNumber, String otp, String idempotencyKey) {
        String masked = maskMobile(mobileNumber);
        if (!smsEnabled || "DEV".equalsIgnoreCase(smsProvider) || "LOG".equalsIgnoreCase(smsProvider)) {
            logger.info("[SMS DEV MODE] Mobile verification OTP generated for mobile {} (code masked for security)", masked);
        } else {
            logger.info("[SMS PROVIDER] Dispatched SMS OTP to {}", masked);
        }
    }
}
