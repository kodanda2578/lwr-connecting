package com.lwr.connecting.service;

import com.lwr.connecting.entity.Appointment;
import com.lwr.connecting.entity.GuidanceRequest;
import com.lwr.connecting.entity.User;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

public interface GuidanceService {

    GuidanceRequest createStudentRequest(User student, Map<String, Object> requestData);

    List<GuidanceRequest> getStudentRequests(Long studentId);

    GuidanceRequest getStudentRequestById(Long requestId, Long studentId);

    List<GuidanceRequest> getAdminRequests(String status);

    Map<String, Long> getRequestStats();

    GuidanceRequest updateRequestStatus(Long requestId, String newStatus, String adminResponse);

    Appointment scheduleAppointment(
            Long requestId,
            User admin,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String timeZone,
            String meetingMethod,
            String meetingUrl,
            String notes
    );

    Appointment rescheduleAppointment(
            Long appointmentId,
            User admin,
            LocalDate newDate,
            LocalTime newStartTime,
            LocalTime newEndTime,
            String timeZone,
            String meetingUrl,
            String notes
    );

    Appointment cancelAppointment(Long appointmentId, String cancelReason);

    Appointment getAppointmentByRequestId(Long requestId);

    boolean retryAppointmentEmail(Long appointmentId);
}
