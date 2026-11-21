package com.lwr.connecting.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lwr.connecting.entity.Branch;
import com.lwr.connecting.entity.College;
import com.lwr.connecting.entity.Cutoff;
import com.lwr.connecting.entity.Exam;
import com.lwr.connecting.entity.State;
import com.lwr.connecting.repository.BranchRepository;
import com.lwr.connecting.repository.CollegeRepository;
import com.lwr.connecting.repository.CutoffRepository;
import com.lwr.connecting.repository.ExamRepository;
import com.lwr.connecting.repository.StateRepository;
import com.lwr.connecting.service.CollegeOnlineLookupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:college_discovery_test_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL"
})
public class CollegeDiscoveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CollegeRepository collegeRepository;

    @MockBean
    private CutoffRepository cutoffRepository;

    @MockBean
    private ExamRepository examRepository;

    @MockBean
    private BranchRepository branchRepository;

    @MockBean
    private StateRepository stateRepository;

    @MockBean
    private CollegeOnlineLookupService collegeOnlineLookupService;

    private State apState;
    private College kluCollege;
    private Exam eapcetExam;
    private Branch cseBranch;
    private Cutoff cutoffRecord;

    @BeforeEach
    void setUp() {
        apState = State.builder().id(1001L).name("Andhra Pradesh").code("AP").build();

        kluCollege = College.builder()
                .id(2001L)
                .name("K L University (Koneru Lakshmaiah Education Foundation)")
                .code("KLU")
                .city("Vaddeswaram, Guntur")
                .pincode("522502")
                .state(apState)
                .affiliation("Deemed to be University")
                .accreditation("NAAC A++")
                .contactInfo("admissions@kluniversity.in | 0863-2399999")
                .governmentStatus("Deemed")
                .isAutonomous(true)
                .aicteApproved(true)
                .lastVerifiedDate("2026-03")
                .sourceReference("AICTE / NIRF / Official Portal")
                .build();

        eapcetExam = Exam.builder()
                .id(3001L)
                .name("Andhra Pradesh Engineering, Agriculture and Pharmacy Common Entrance Test")
                .code("AP_EAPCET")
                .state(apState)
                .build();

        cseBranch = Branch.builder()
                .id(4001L)
                .name("Computer Science and Engineering")
                .code("CSE")
                .build();

        cutoffRecord = Cutoff.builder()
                .id(101L)
                .exam(eapcetExam)
                .college(kluCollege)
                .branch(cseBranch)
                .category("OC")
                .year(2024)
                .round(1)
                .openingRank(1500)
                .closingRank(5800)
                .sourceReference("APSCHE Official Web Counselling Allotment (eapcet-sche.aptonline.in)")
                .build();
    }

    @Test
    void testSearchCollegesWithAffiliationAndAccreditation() throws Exception {
        when(collegeRepository.searchCollegesAdvanced(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(kluCollege));

        mockMvc.perform(get("/api/colleges")
                        .param("affiliation", "Deemed")
                        .param("accreditation", "NAAC A++")
                        .param("search", "522502")
                        .param("page", "0")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", containsString("K L University")))
                .andExpect(jsonPath("$.content[0].affiliation", is("Deemed to be University")))
                .andExpect(jsonPath("$.content[0].accreditation", is("NAAC A++")))
                .andExpect(jsonPath("$.content[0].pincode", is("522502")));
    }

    @Test
    void testMissingCollegeFallsBackToVerifiedOnlineLookup() throws Exception {
        Map<String, Object> mockResult = new HashMap<>();
        mockResult.put("name", "BITS Pilani");
        mockResult.put("location", "Pilani, Rajasthan");
        mockResult.put("ownership", "Deemed University");
        mockResult.put("sourceReference", "AICTE / NIRF Approved Institutions Directory");
        mockResult.put("verified", true);

        Map<String, Object> lookupResponse = new HashMap<>();
        lookupResponse.put("status", "SUCCESS");
        lookupResponse.put("results", List.of(mockResult));
        lookupResponse.put("message", "Found 1 verified institution in official directories.");

        when(collegeOnlineLookupService.searchOnlineVerifiedInstitutions("BITS Pilani"))
                .thenReturn(lookupResponse);

        mockMvc.perform(get("/api/colleges/online-search")
                        .param("q", "BITS Pilani")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.results", hasSize(1)))
                .andExpect(jsonPath("$.results[0].name", is("BITS Pilani")))
                .andExpect(jsonPath("$.results[0].sourceReference", containsString("AICTE")));
    }

    @Test
    void testCutoffExplorerSearchWithVerificationMetadata() throws Exception {
        when(cutoffRepository.searchCutoffs(any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(cutoffRecord));

        mockMvc.perform(get("/api/cutoffs")
                        .param("examId", "3001")
                        .param("category", "OC")
                        .param("year", "2024")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].closingRank", is(5800)))
                .andExpect(jsonPath("$[0].year", is(2024)))
                .andExpect(jsonPath("$[0].sourceReference", containsString("APSCHE")));
    }

    @Test
    void testCollegePredictorReturnsRealDataWithWhyMatchesExplanation() throws Exception {
        when(cutoffRepository.predictEligibleCutoffs(eq(3001L), eq(4000), eq("OC"), any()))
                .thenReturn(List.of(cutoffRecord));

        mockMvc.perform(get("/api/cutoffs/predict")
                        .param("examId", "3001")
                        .param("rank", "4000")
                        .param("category", "OC")
                        .param("branchId", "4001")
                        .param("page", "0")
                        .param("size", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].closingRank", is(5800)))
                .andExpect(jsonPath("$.content[0].competitivenessStatus", is("Historically within range")))
                .andExpect(jsonPath("$.content[0].disclaimer", containsString("Does not guarantee admission in current year counselling")));
    }
}
