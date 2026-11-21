package com.lwr.connecting.repository;

import com.lwr.connecting.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByGuidanceRequestId(Long guidanceRequestId);

    List<Appointment> findByStudentIdOrderByAppointmentDateDesc(Long studentId);

    List<Appointment> findByAdminIdAndAppointmentDateAndStatusIn(Long adminId, LocalDate appointmentDate, Collection<String> statuses);

    @Query("SELECT a FROM Appointment a WHERE a.admin.id = :adminId " +
           "AND a.appointmentDate = :date " +
           "AND a.status IN ('SCHEDULED', 'RESCHEDULED') " +
           "AND (:excludeId IS NULL OR a.id <> :excludeId) " +
           "AND (a.startTime < :endTime AND a.endTime > :startTime)")
    List<Appointment> findOverlappingAppointments(
            @Param("adminId") Long adminId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );
}
