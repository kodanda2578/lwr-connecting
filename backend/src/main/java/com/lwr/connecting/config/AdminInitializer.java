package com.lwr.connecting.config;

import com.lwr.connecting.entity.Role;
import com.lwr.connecting.entity.User;
import com.lwr.connecting.repository.RoleRepository;
import com.lwr.connecting.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);

    @Value("${admin.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${admin.email:admin@lwrconnecting.com}")
    private String adminEmail;

    @Value("${admin.password:Admin@LWR2026!}")
    private String adminPassword;

    @Value("${admin.full-name:Ramesh Admin}")
    private String adminFullName;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!seedEnabled) return;

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

        // Also ensure ROLE_STUDENT exists
        Role studentRole = roleRepository.findByName("ROLE_STUDENT")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_STUDENT").build()));

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .fullName(adminFullName)
                    .email(adminEmail)
                    .mobileNumber("9900000000")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .emailVerified(true)
                    .mobileVerified(true)
                    .accountStatus("ACTIVE")
                    .roles(Collections.singleton(adminRole))
                    .build();

            userRepository.save(admin);
            logger.info("[ADMIN SEED] Seeded initial Admin user: {}", adminEmail);
        }

        if (!userRepository.existsByEmail("student.demo@lwrconnecting.com")) {
            com.lwr.connecting.entity.StudentProfile profile = com.lwr.connecting.entity.StudentProfile.builder()
                    .collegeName("IIT Madras")
                    .intermediateYear(2)
                    .board("CBSE")
                    .targetExam("JEE_MAIN")
                    .targetBranch("Computer Science")
                    .state("Andhra Pradesh")
                    .city("Visakhapatnam")
                    .preferredLocation("Visakhapatnam")
                    .profileCompleted(true)
                    .build();

            User student = User.builder()
                    .fullName("Student Demo")
                    .email("student.demo@lwrconnecting.com")
                    .mobileNumber("9876543210")
                    .passwordHash(passwordEncoder.encode("Password123!"))
                    .emailVerified(true)
                    .mobileVerified(true)
                    .accountStatus("ACTIVE")
                    .roles(Collections.singleton(studentRole))
                    .profile(profile)
                    .build();

            profile.setUser(student);
            userRepository.save(student);
            logger.info("[STUDENT SEED] Seeded initial Student Demo user: student.demo@lwrconnecting.com");
        }
    }
}
