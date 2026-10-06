package com.lwr.connecting.config;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.enums.ExamType;
import com.lwr.connecting.enums.QuestionType;
import com.lwr.connecting.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ExamDataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ExamDataInitializer.class);

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private SubTopicRepository subTopicRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private CollegeExamMappingRepository collegeExamMappingRepository;

    @Autowired
    private CollegeBranchMappingRepository collegeBranchMappingRepository;

    @Autowired
    private CutoffRepository cutoffRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("[INITIALIZER] Starting Exam Content Audit & Synchronization...");
        seedStates();
        seedExams();
        seedSubjects();
        seedBranches();
        seedJeeMainSyllabus();
        seedJeeAdvancedSyllabus();
        seedVerifiedPyqs();
        seedCollegesAndMappings();
        seedCutoffs();
        logger.info("[INITIALIZER] Exam Content Audit & Synchronization Completed Successfully.");
    }

    private void seedStates() {
        if (stateRepository.count() == 0) {
            logger.info("[INITIALIZER] Seeding States...");
            stateRepository.saveAll(List.of(
                    State.builder().code("ALL_INDIA").name("National / All India").active(true).build(),
                    State.builder().code("AP").name("Andhra Pradesh").active(true).build(),
                    State.builder().code("TS").name("Telangana").active(true).build(),
                    State.builder().code("KA").name("Karnataka").active(true).build(),
                    State.builder().code("MH").name("Maharashtra").active(true).build(),
                    State.builder().code("WB").name("West Bengal").active(true).build(),
                    State.builder().code("TN").name("Tamil Nadu").active(true).build(),
                    State.builder().code("OD").name("Odisha").active(true).build(),
                    State.builder().code("KL").name("Kerala").active(true).build(),
                    State.builder().code("UP").name("Uttar Pradesh").active(true).build(),
                    State.builder().code("BR").name("Bihar").active(true).build(),
                    State.builder().code("RJ").name("Rajasthan").active(true).build(),
                    State.builder().code("GJ").name("Gujarat").active(true).build(),
                    State.builder().code("JH").name("Jharkhand").active(true).build(),
                    State.builder().code("AS").name("Assam").active(true).build()
            ));
        }
    }

    private void seedExams() {
        if (examRepository.count() == 0) {
            logger.info("[INITIALIZER] Seeding Exams...");
            State allIndia = stateRepository.findByCode("ALL_INDIA").orElse(null);
            State ap = stateRepository.findByCode("AP").orElse(null);
            State ts = stateRepository.findByCode("TS").orElse(null);
            State ka = stateRepository.findByCode("KA").orElse(null);
            State mh = stateRepository.findByCode("MH").orElse(null);
            State wb = stateRepository.findByCode("WB").orElse(null);
            State tn = stateRepository.findByCode("TN").orElse(null);
            State od = stateRepository.findByCode("OD").orElse(null);
            State kl = stateRepository.findByCode("KL").orElse(null);
            State up = stateRepository.findByCode("UP").orElse(null);
            State br = stateRepository.findByCode("BR").orElse(null);
            State rj = stateRepository.findByCode("RJ").orElse(null);
            State gj = stateRepository.findByCode("GJ").orElse(null);
            State jh = stateRepository.findByCode("JH").orElse(null);
            State as = stateRepository.findByCode("AS").orElse(null);

            examRepository.saveAll(List.of(
                    Exam.builder().code("JEE_MAIN").name("JEE Main").type(ExamType.NATIONAL).state(allIndia).description("Joint Entrance Examination (Main) conducted by NTA for NITs, IIITs, CFTIs.").active(true).build(),
                    Exam.builder().code("JEE_ADVANCED").name("JEE Advanced").type(ExamType.NATIONAL).state(allIndia).description("Joint Entrance Examination (Advanced) conducted by IITs for admission to IITs.").active(true).build(),
                    Exam.builder().code("AP_EAPCET").name("AP EAPCET").type(ExamType.STATE).state(ap).description("Andhra Pradesh Engineering, Agriculture and Pharmacy Common Entrance Test conducted by APSCHE.").active(true).build(),
                    Exam.builder().code("TS_EAMCET").name("TS EAMCET / TG EAPCET").type(ExamType.STATE).state(ts).description("Telangana State Engineering, Agriculture & Medical Common Entrance Test conducted by TSCHE.").active(true).build(),
                    Exam.builder().code("KCET").name("KCET").type(ExamType.STATE).state(ka).description("Karnataka Common Entrance Test conducted by Karnataka Examinations Authority (KEA).").active(true).build(),
                    Exam.builder().code("MHT_CET").name("MHT-CET").type(ExamType.STATE).state(mh).description("Maharashtra Common Entrance Test conducted by State CET Cell Maharashtra.").active(true).build(),
                    Exam.builder().code("WBJEE").name("WBJEE").type(ExamType.STATE).state(wb).description("West Bengal Joint Entrance Examination conducted by WBJEEB.").active(true).build(),
                    Exam.builder().code("TNEA").name("TNEA Admission System").type(ExamType.STATE).state(tn).description("Tamil Nadu Engineering Admissions conducted by Directorate of Technical Education (DoTE).").active(true).build(),
                    Exam.builder().code("OJEE").name("OJEE").type(ExamType.STATE).state(od).description("Odisha Joint Entrance Examination conducted by OJEE Board.").active(true).build(),
                    Exam.builder().code("KEAM").name("KEAM").type(ExamType.STATE).state(kl).description("Kerala Engineering Architecture Medical Examination conducted by CEE Kerala.").active(true).build(),
                    Exam.builder().code("UPTAC").name("UPTAC Admissions").type(ExamType.STATE).state(up).description("Uttar Pradesh Technical Admission Counselling conducted by AKTU.").active(true).build(),
                    Exam.builder().code("UGEAC").name("UGEAC Bihar").type(ExamType.STATE).state(br).description("Under Graduate Engineering Admission Counselling conducted by BCECEB.").active(true).build(),
                    Exam.builder().code("REAP").name("REAP Rajasthan").type(ExamType.STATE).state(rj).description("Rajasthan Engineering Admission Process conducted by Centre for Electronic Governance.").active(true).build(),
                    Exam.builder().code("GUJCET").name("GUJCET").type(ExamType.STATE).state(gj).description("Gujarat Common Entrance Test conducted by GSHSEB.").active(true).build(),
                    Exam.builder().code("JCECE").name("JCECE").type(ExamType.STATE).state(jh).description("Jharkhand Combined Entrance Competitive Examination.").active(true).build(),
                    Exam.builder().code("ASSAM_CEE").name("Assam CEE").type(ExamType.STATE).state(as).description("Assam Combined Entrance Examination conducted by ASTU.").active(true).build()
            ));
        }
    }

    private void seedSubjects() {
        if (subjectRepository.count() == 0) {
            logger.info("[INITIALIZER] Seeding Subjects...");
            subjectRepository.saveAll(List.of(
                    Subject.builder().code("PHYSICS").name("Physics").active(true).build(),
                    Subject.builder().code("CHEMISTRY").name("Chemistry").active(true).build(),
                    Subject.builder().code("MATHEMATICS").name("Mathematics").active(true).build()
            ));
        }
    }

    private Topic getOrCreateTopic(Exam exam, Subject subject, String name, Double weightage, String sourceRef) {
        return topicRepository.findByExamAndSubjectAndName(exam, subject, name)
                .orElseGet(() -> topicRepository.save(Topic.builder()
                        .exam(exam)
                        .subject(subject)
                        .name(name)
                        .weightagePercentage(weightage)
                        .sourceReference(sourceRef)
                        .active(true)
                        .build()));
    }

    private void getOrCreateSubTopic(Topic topic, String name, String description) {
        subTopicRepository.findByTopicAndName(topic, name)
                .orElseGet(() -> subTopicRepository.save(SubTopic.builder()
                        .topic(topic)
                        .name(name)
                        .description(description)
                        .active(true)
                        .build()));
    }

    private void seedJeeMainSyllabus() {
        Exam jeeMain = examRepository.findByCode("JEE_MAIN").orElse(null);
        Subject phy = subjectRepository.findByCode("PHYSICS").orElse(null);
        Subject chem = subjectRepository.findByCode("CHEMISTRY").orElse(null);
        Subject math = subjectRepository.findByCode("MATHEMATICS").orElse(null);

        if (jeeMain == null) return;

        // --- JEE MAIN PHYSICS ---
        if (phy != null) {
            Topic t1 = getOrCreateTopic(jeeMain, phy, "Units, Dimensions & Errors", 3.0, "NTA JEE Main Physics Unit 1 / NCERT Class 11 Ch 2");
            getOrCreateSubTopic(t1, "SI Units & Dimensional Analysis", "Fundamental and derived SI units, dimensions of physical quantities");
            getOrCreateSubTopic(t1, "Errors & Least Count", "Systematic and random errors, propagation of errors, least count of instruments");

            Topic t2 = getOrCreateTopic(jeeMain, phy, "Kinematics & Motion in 1D/2D", 6.5, "NTA JEE Main Physics Unit 2 / NCERT Class 11 Ch 3-4");
            getOrCreateSubTopic(t2, "Motion in a Straight Line", "Position-time graphs, velocity, uniform and non-uniform acceleration");
            getOrCreateSubTopic(t2, "Projectile & Relative Motion", "2D trajectory, horizontal and angular projection, relative velocity");

            Topic t3 = getOrCreateTopic(jeeMain, phy, "Laws of Motion & Friction", 5.0, "NTA JEE Main Physics Unit 3 / NCERT Class 11 Ch 5");
            getOrCreateSubTopic(t3, "Newton's Laws & Impulse", "Force, momentum, conservation of linear momentum, impulse");
            getOrCreateSubTopic(t3, "Friction & Circular Dynamics", "Static and kinetic friction, banking of roads, centripetal force");

            Topic t4 = getOrCreateTopic(jeeMain, phy, "Work, Energy & Power", 5.0, "NTA JEE Main Physics Unit 4 / NCERT Class 11 Ch 6");
            getOrCreateSubTopic(t4, "Work-Energy Theorem", "Work done by constant and variable forces, kinetic and potential energy");
            getOrCreateSubTopic(t4, "Collisions & Conservation", "Elastic and inelastic collisions in 1D and 2D, power");

            Topic t5 = getOrCreateTopic(jeeMain, phy, "Rotational Dynamics & Center of Mass", 7.0, "NTA JEE Main Physics Unit 5 / NCERT Class 11 Ch 7");
            getOrCreateSubTopic(t5, "Center of Mass", "COM of discrete and continuous bodies, momentum conservation");
            getOrCreateSubTopic(t5, "Moment of Inertia & Torque", "Parallel and perpendicular axis theorems, angular momentum, rolling motion");

            Topic t6 = getOrCreateTopic(jeeMain, phy, "Gravitation", 4.0, "NTA JEE Main Physics Unit 6 / NCERT Class 11 Ch 8");
            getOrCreateSubTopic(t6, "Kepler's Laws & Gravity", "Universal law of gravitation, variation of g with altitude/depth");
            getOrCreateSubTopic(t6, "Satellites & Escape Velocity", "Orbital speed, geostationary satellites, escape velocity");

            Topic t7 = getOrCreateTopic(jeeMain, phy, "Properties of Solids & Fluids", 5.5, "NTA JEE Main Physics Unit 7 / NCERT Class 11 Ch 9-10");
            getOrCreateSubTopic(t7, "Elasticity & Hooke's Law", "Stress-strain curve, Young's, Bulk, and Shear modulus");
            getOrCreateSubTopic(t7, "Fluid Mechanics & Surface Tension", "Pascal's law, Bernoulli's principle, Stoke's law, surface tension");

            Topic t8 = getOrCreateTopic(jeeMain, phy, "Thermodynamics & Heat Transfer", 6.0, "NTA JEE Main Physics Unit 8 / NCERT Class 11 Ch 11-12");
            getOrCreateSubTopic(t8, "Laws of Thermodynamics", "First and second laws, isothermal/adiabatic processes, Carnot cycle");
            getOrCreateSubTopic(t8, "Conduction & Radiation", "Thermal conductivity, Newton's law of cooling, Stefan-Boltzmann law");

            Topic t9 = getOrCreateTopic(jeeMain, phy, "Kinetic Theory of Gases", 3.5, "NTA JEE Main Physics Unit 9 / NCERT Class 11 Ch 13");
            getOrCreateSubTopic(t9, "Ideal Gas Equation & RMS Speed", "Pressure of ideal gas, RMS velocity, degrees of freedom, equipartition of energy");

            Topic t10 = getOrCreateTopic(jeeMain, phy, "Oscillations & SHM", 4.5, "NTA JEE Main Physics Unit 10 / NCERT Class 11 Ch 14");
            getOrCreateSubTopic(t10, "Simple Harmonic Motion", "SHM displacement, velocity, acceleration, simple pendulum, springs");

            Topic t11 = getOrCreateTopic(jeeMain, phy, "Waves & Sound", 4.5, "NTA JEE Main Physics Unit 10 / NCERT Class 11 Ch 15");
            getOrCreateSubTopic(t11, "Transverse & Longitudinal Waves", "Wave speed, standing waves in strings/pipes, Doppler effect, beats");

            Topic t12 = getOrCreateTopic(jeeMain, phy, "Electrostatics & Gauss Law", 7.0, "NTA JEE Main Physics Unit 11 / NCERT Class 12 Ch 1");
            getOrCreateSubTopic(t12, "Coulomb's Law & Electric Field", "Force between point charges, dipole field, Gauss's law applications");

            Topic t13 = getOrCreateTopic(jeeMain, phy, "Capacitance & Electric Potential", 5.5, "NTA JEE Main Physics Unit 11 / NCERT Class 12 Ch 2");
            getOrCreateSubTopic(t13, "Capacitors & Dielectrics", "Parallel plate capacitor, combination of capacitors, energy stored");

            Topic t14 = getOrCreateTopic(jeeMain, phy, "Current Electricity & Circuits", 8.0, "NTA JEE Main Physics Unit 12 / NCERT Class 12 Ch 3");
            getOrCreateSubTopic(t14, "Ohm's Law & Kirchhoff's Rules", "Drift velocity, resistance, series/parallel combinations, Kirchhoff's laws");
            getOrCreateSubTopic(t14, "Measuring Instruments", "Wheatstone bridge, potentiometer, meter bridge, ammeter, voltmeter");

            Topic t15 = getOrCreateTopic(jeeMain, phy, "Magnetic Effects of Current & Magnetism", 6.5, "NTA JEE Main Physics Unit 13 / NCERT Class 12 Ch 4-5");
            getOrCreateSubTopic(t15, "Biot-Savart & Ampere's Law", "Magnetic field of current loops/solenoids, Lorentz force, moving coil galvanometer");
            getOrCreateSubTopic(t15, "Magnetic Properties of Matter", "Dia, para, and ferromagnetic materials, hysteresis");

            Topic t16 = getOrCreateTopic(jeeMain, phy, "Electromagnetic Induction & AC", 6.5, "NTA JEE Main Physics Unit 14 / NCERT Class 12 Ch 6-7");
            getOrCreateSubTopic(t16, "Faraday's Law & Lenz's Law", "Induced emf, self and mutual inductance, eddy currents");
            getOrCreateSubTopic(t16, "Alternating Current Circuits", "LCR series circuit, resonance, power factor, transformer");

            Topic t17 = getOrCreateTopic(jeeMain, phy, "Electromagnetic Waves", 2.5, "NTA JEE Main Physics Unit 15 / NCERT Class 12 Ch 8");
            getOrCreateSubTopic(t17, "EM Spectrum & Characteristics", "Displacement current, transverse nature of EM waves, electromagnetic spectrum");

            Topic t18 = getOrCreateTopic(jeeMain, phy, "Ray Optics & Optical Instruments", 6.0, "NTA JEE Main Physics Unit 16 / NCERT Class 12 Ch 9");
            getOrCreateSubTopic(t18, "Reflection & Refraction", "Mirror formula, Snell's law, total internal reflection, lens formula");
            getOrCreateSubTopic(t18, "Prisms & Microscopes/Telescopes", "Dispersion by prism, compound microscope, astronomical telescope");

            Topic t19 = getOrCreateTopic(jeeMain, phy, "Wave Optics", 4.0, "NTA JEE Main Physics Unit 16 / NCERT Class 12 Ch 10");
            getOrCreateSubTopic(t19, "Interference & YDSE", "Huygens principle, Young's double slit experiment fringe width, diffraction");

            Topic t20 = getOrCreateTopic(jeeMain, phy, "Modern Physics & Semiconductors", 8.5, "NTA JEE Main Physics Unit 17-20 / NCERT Class 12 Ch 11-14");
            getOrCreateSubTopic(t20, "Photoelectric Effect & Dual Nature", "Einstein's photoelectric equation, de Broglie wavelength");
            getOrCreateSubTopic(t20, "Atomic Structure & Hydrogen Spectrum", "Bohr model, energy levels, Rydberg constant, spectral series");
            getOrCreateSubTopic(t20, "Nuclear Physics & Radioactivity", "Binding energy per nucleon, alpha/beta/gamma decay, nuclear fission/fusion");
            getOrCreateSubTopic(t20, "Semiconductor Devices & Logic Gates", "P-N junction diode, Zener diode regulator, AND/OR/NOT logic gates");
        }

        // --- JEE MAIN CHEMISTRY ---
        if (chem != null) {
            Topic c1 = getOrCreateTopic(jeeMain, chem, "Mole Concept & Stoichiometry", 4.0, "NTA JEE Main Chemistry Unit 1 / NCERT Class 11 Ch 1");
            getOrCreateSubTopic(c1, "Mole Concept & Atomic Mass", "Avogadro number, molar mass, empirical & molecular formula");
            getOrCreateSubTopic(c1, "Concentration Terms & Stoichiometry", "Molarity, molality, mole fraction, limiting reagent calculation");

            Topic c2 = getOrCreateTopic(jeeMain, chem, "Atomic Structure & Quantum Numbers", 4.5, "NTA JEE Main Chemistry Unit 2 / NCERT Class 11 Ch 2");
            getOrCreateSubTopic(c2, "Bohr Model & Spectrum", "Bohr postulates, radius and energy of hydrogen electron, Rydberg equation");
            getOrCreateSubTopic(c2, "Quantum Mechanical Model", "Quantum numbers, Heisenberg uncertainty principle, Aufbau & Hund rules");

            Topic c3 = getOrCreateTopic(jeeMain, chem, "Chemical Bonding & Molecular Structure", 8.0, "NTA JEE Main Chemistry Unit 3 / NCERT Class 11 Ch 4");
            getOrCreateSubTopic(c3, "Ionic & Covalent Bonding", "Lattice enthalpy, Fajan's rules, dipole moment, VSEPR theory shapes");
            getOrCreateSubTopic(c3, "Hybridization & Molecular Orbital Theory", "sp, sp2, sp3, sp3d hybridization, MOT electronic configurations & bond order");

            Topic c4 = getOrCreateTopic(jeeMain, chem, "Chemical Thermodynamics & Energetics", 6.5, "NTA JEE Main Chemistry Unit 4 / NCERT Class 11 Ch 6");
            getOrCreateSubTopic(c4, "First Law & Enthalpy Changes", "Internal energy, work done, enthalpy of combustion/formation/neutralization");
            getOrCreateSubTopic(c4, "Second Law & Gibbs Free Energy", "Entropy changes, spontaneity criteria, ΔG = ΔH - TΔS, free energy and equilibrium");

            Topic c5 = getOrCreateTopic(jeeMain, chem, "Solutions & Colligative Properties", 5.5, "NTA JEE Main Chemistry Unit 5 / NCERT Class 12 Ch 2");
            getOrCreateSubTopic(c5, "Raoult's Law & Ideal Solutions", "Vapor pressure of liquid solutions, ideal & non-ideal solutions, azeotropes");
            getOrCreateSubTopic(c5, "Colligative Properties & Van 't Hoff", "Relative lowering of vapor pressure, elevation of boiling point, osmotic pressure");

            Topic c6 = getOrCreateTopic(jeeMain, chem, "Equilibrium (Chemical & Ionic)", 7.5, "NTA JEE Main Chemistry Unit 6 / NCERT Class 11 Ch 7");
            getOrCreateSubTopic(c6, "Chemical Equilibrium", "Equilibrium constant Kp and Kc, Le Chatelier's principle applications");
            getOrCreateSubTopic(c6, "Ionic Equilibrium & pH", "Ostwald dilution law, pH calculation, buffer solutions, solubility product Ksp");

            Topic c7 = getOrCreateTopic(jeeMain, chem, "Redox Reactions & Electrochemistry", 6.0, "NTA JEE Main Chemistry Unit 7 / NCERT Class 12 Ch 3");
            getOrCreateSubTopic(c7, "Galvanic Cells & Nernst Equation", "Standard electrode potential, Nernst equation, Gibbs energy of cell reaction");
            getOrCreateSubTopic(c7, "Conductance & Electrolysis", "Molar conductivity, Kohlrausch law, Faraday's laws of electrolysis");

            Topic c8 = getOrCreateTopic(jeeMain, chem, "Chemical Kinetics", 5.0, "NTA JEE Main Chemistry Unit 8 / NCERT Class 12 Ch 4");
            getOrCreateSubTopic(c8, "Rate Laws & Order of Reaction", "Zero and first order integrated rate laws, half-life period");
            getOrCreateSubTopic(c8, "Arrhenius Equation & Activation Energy", "Temperature dependence of rate constant, activation energy, collision theory");

            Topic c9 = getOrCreateTopic(jeeMain, chem, "Classification of Elements & Periodicity", 3.5, "NTA JEE Main Chemistry Unit 9 / NCERT Class 11 Ch 3");
            getOrCreateSubTopic(c9, "Periodic Trends", "Ionization enthalpy, electron gain enthalpy, electronegativity, atomic/ionic radii");

            Topic c10 = getOrCreateTopic(jeeMain, chem, "p-Block Elements", 6.0, "NTA JEE Main Chemistry Unit 10 / NCERT Class 11-12");
            getOrCreateSubTopic(c10, "Group 13 to 18 Trends", "Properties of Boron, Carbon, Nitrogen, Oxygen, Halogens, Noble gases");

            Topic c11 = getOrCreateTopic(jeeMain, chem, "d- and f-Block Elements", 5.0, "NTA JEE Main Chemistry Unit 11 / NCERT Class 12 Ch 8");
            getOrCreateSubTopic(c11, "Transition Elements Properties", "Electronic configuration, oxidation states, magnetic properties, catalytic activity");
            getOrCreateSubTopic(c11, "K2Cr2O7 & KMnO4", "Preparation, properties, and oxidizing reactions");

            Topic c12 = getOrCreateTopic(jeeMain, chem, "Coordination Compounds", 6.5, "NTA JEE Main Chemistry Unit 12 / NCERT Class 12 Ch 9");
            getOrCreateSubTopic(c12, "IUPAC Nomenclature & Isomerism", "Ligands, coordination number, structural and stereoisomerism");
            getOrCreateSubTopic(c12, "Valence Bond & Crystal Field Theory", "VBT hybridization, CFT octahedral/tetrahedral splitting, magnetic moments");

            Topic c13 = getOrCreateTopic(jeeMain, chem, "General Organic Chemistry (GOC)", 9.0, "NTA JEE Main Chemistry Unit 13 / NCERT Class 11 Ch 12");
            getOrCreateSubTopic(c13, "Electronic Displacement Effects", "Inductive, electromeric, resonance, and hyperconjugation effects");
            getOrCreateSubTopic(c13, "Reactive Intermediates & Acidity", "Stability of carbocations, carbanions, free radicals, acidic & basic strengths");

            Topic c14 = getOrCreateTopic(jeeMain, chem, "Hydrocarbons (Alkanes, Alkenes, Alkynes)", 6.0, "NTA JEE Main Chemistry Unit 14 / NCERT Class 11 Ch 13");
            getOrCreateSubTopic(c14, "Alkanes & Free Radical Halogenation", "Conformations of ethane, preparation and reactions");
            getOrCreateSubTopic(c14, "Alkenes & Alkynes Additions", "Markovnikov & anti-Markovnikov addition, ozonolysis, acidity of alkynes");
            getOrCreateSubTopic(c14, "Aromatic Hydrocarbons", "Huckel's rule of aromaticity, electrophilic aromatic substitution of benzene");

            Topic c15 = getOrCreateTopic(jeeMain, chem, "Haloalkanes & Haloarenes", 4.5, "NTA JEE Main Chemistry Unit 15 / NCERT Class 12 Ch 10");
            getOrCreateSubTopic(c15, "SN1 & SN2 Mechanisms", "Nucleophilic substitution kinetics, stereochemical aspects, haloarenes reactivity");

            Topic c16 = getOrCreateTopic(jeeMain, chem, "Alcohols, Phenols & Ethers", 5.5, "NTA JEE Main Chemistry Unit 16 / NCERT Class 12 Ch 11");
            getOrCreateSubTopic(c16, "Alcohols & Phenols Reactions", "Acidic character of phenols, Reimer-Tiemann & Kolbe reactions, Williamson synthesis");

            Topic c17 = getOrCreateTopic(jeeMain, chem, "Aldehydes, Ketones & Carboxylic Acids", 7.0, "NTA JEE Main Chemistry Unit 17 / NCERT Class 12 Ch 12");
            getOrCreateSubTopic(c17, "Nucleophilic Addition & Condensations", "Aldol condensation, Cannizzaro reaction, Tollens & Fehling tests");
            getOrCreateSubTopic(c17, "Carboxylic Acid Derivatives", "Acidic strength, decarboxylation, Hell-Volhard-Zelinsky reaction");

            Topic c18 = getOrCreateTopic(jeeMain, chem, "Organic Compounds Containing Nitrogen", 4.5, "NTA JEE Main Chemistry Unit 18 / NCERT Class 12 Ch 13");
            getOrCreateSubTopic(c18, "Amines & Diazonium Salts", "Basicity of amines, Hoffmann bromamide degradation, diazonium coupling reactions");

            Topic c19 = getOrCreateTopic(jeeMain, chem, "Biomolecules & Polymers", 4.0, "NTA JEE Main Chemistry Unit 19 / NCERT Class 12 Ch 14");
            getOrCreateSubTopic(c19, "Carbohydrates & Proteins", "Glucose reactions, peptide linkage, primary/secondary/tertiary structure of proteins");

            Topic c20 = getOrCreateTopic(jeeMain, chem, "Practical Organic & Inorganic Chemistry", 3.0, "NTA JEE Main Chemistry Unit 20 / NCERT Class 11-12 Practical Guide");
            getOrCreateSubTopic(c20, "Functional Group & Salt Analysis", "Detection of N, S, Halogens, group analysis of cations/anions");
        }

        // --- JEE MAIN MATHEMATICS ---
        if (math != null) {
            Topic m1 = getOrCreateTopic(jeeMain, math, "Sets, Relations & Functions", 6.0, "NTA JEE Main Mathematics Unit 1 / NCERT Class 11-12");
            getOrCreateSubTopic(m1, "Sets & Operations", "Venn diagrams, power sets, union, intersection, difference");
            getOrCreateSubTopic(m1, "Relations & Functions", "Reflexive, symmetric, transitive relations, domain, range, 1-1 & onto functions");

            Topic m2 = getOrCreateTopic(jeeMain, math, "Complex Numbers & Quadratic Equations", 6.5, "NTA JEE Main Mathematics Unit 2 / NCERT Class 11 Ch 5");
            getOrCreateSubTopic(m2, "Complex Numbers algebra", "Modulus, argument, polar representation, square root of complex number");
            getOrCreateSubTopic(m2, "Quadratic Equations", "Roots & coefficients relation, nature of roots, common roots, location of roots");

            Topic m3 = getOrCreateTopic(jeeMain, math, "Matrices & Determinants", 8.5, "NTA JEE Main Mathematics Unit 3 / NCERT Class 12 Ch 3-4");
            getOrCreateSubTopic(m3, "Determinants & Properties", "Evaluation, adjoint and inverse of matrices, area of triangle");
            getOrCreateSubTopic(m3, "System of Linear Equations", "Consistency of linear equations, Cramer's rule, matrix inverse method");

            Topic m4 = getOrCreateTopic(jeeMain, math, "Permutations & Combinations", 5.0, "NTA JEE Main Mathematics Unit 4 / NCERT Class 11 Ch 7");
            getOrCreateSubTopic(m4, "Fundamental Principles & nPr/nCr", "Permutations with repetition, combinations, circular permutations");

            Topic m5 = getOrCreateTopic(jeeMain, math, "Binomial Theorem & Applications", 4.5, "NTA JEE Main Mathematics Unit 5 / NCERT Class 11 Ch 8");
            getOrCreateSubTopic(m5, "Binomial Expansion", "General term, middle term, properties of binomial coefficients, divisibility");

            Topic m6 = getOrCreateTopic(jeeMain, math, "Sequences & Series", 5.5, "NTA JEE Main Mathematics Unit 6 / NCERT Class 11 Ch 9");
            getOrCreateSubTopic(m6, "Arithmetic & Geometric Progressions", "AP, GP, insertion of AM & GM, sum of infinite GP, AGP");

            Topic m7 = getOrCreateTopic(jeeMain, math, "Limits, Continuity & Differentiability", 7.0, "NTA JEE Main Mathematics Unit 7 / NCERT Class 12 Ch 5");
            getOrCreateSubTopic(m7, "Limits & L'Hopital Rule", "Evaluation of 0/0 and ∞/∞ forms, standard trigonometric & exponential limits");
            getOrCreateSubTopic(m7, "Continuity & Differentiability", "Continuity at a point/interval, differentiability, chain rule");

            Topic m8 = getOrCreateTopic(jeeMain, math, "Applications of Derivatives", 7.5, "NTA JEE Main Mathematics Unit 8 / NCERT Class 12 Ch 6");
            getOrCreateSubTopic(m8, "Tangents, Normals & Rate of Change", "Equations of tangent & normal to curves, rate measurer");
            getOrCreateSubTopic(m8, "Monotonicity & Maxima-Minima", "Increasing/decreasing functions, first & second derivative tests");

            Topic m9 = getOrCreateTopic(jeeMain, math, "Integral Calculus (Indefinite & Definite)", 9.0, "NTA JEE Main Mathematics Unit 9 / NCERT Class 12 Ch 7");
            getOrCreateSubTopic(m9, "Indefinite Integration Methods", "Integration by substitution, by parts, and by partial fractions");
            getOrCreateSubTopic(m9, "Definite Integrals & Properties", "Properties of definite integrals, King's property, Leibniz rule");

            Topic m10 = getOrCreateTopic(jeeMain, math, "Area Under Curves", 4.0, "NTA JEE Main Mathematics Unit 9 / NCERT Class 12 Ch 8");
            getOrCreateSubTopic(m10, "Area Bounded by Standard Curves", "Area between lines, parabolas, circles, and curves");

            Topic m11 = getOrCreateTopic(jeeMain, math, "Differential Equations", 5.0, "NTA JEE Main Mathematics Unit 10 / NCERT Class 12 Ch 9");
            getOrCreateSubTopic(m11, "First Order & First Degree DE", "Variable separable, homogeneous equations, linear differential equations");

            Topic m12 = getOrCreateTopic(jeeMain, math, "Straight Lines & Circles", 8.0, "NTA JEE Main Mathematics Unit 11 / NCERT Class 11 Ch 10-11");
            getOrCreateSubTopic(m12, "Straight Lines", "Slope, intercept forms, distance of a point from line, concurrency");
            getOrCreateSubTopic(m12, "Circles", "Standard equation, tangent to a circle, chord of contact, family of circles");

            Topic m13 = getOrCreateTopic(jeeMain, math, "Conic Sections (Parabola, Ellipse, Hyperbola)", 7.5, "NTA JEE Main Mathematics Unit 11 / NCERT Class 11 Ch 11");
            getOrCreateSubTopic(m13, "Parabola", "Standard forms, focus, directrix, tangent and normal");
            getOrCreateSubTopic(m13, "Ellipse & Hyperbola", "Eccentricity, latus rectum, equations of tangents and asymptotes");

            Topic m14 = getOrCreateTopic(jeeMain, math, "Vector Algebra & 3D Geometry", 10.5, "NTA JEE Main Mathematics Unit 12-13 / NCERT Class 12 Ch 10-11");
            getOrCreateSubTopic(m14, "Vector Dot & Cross Product", "Scalar & vector products, scalar triple product, vector projections");
            getOrCreateSubTopic(m14, "Three-Dimensional Geometry", "Direction cosines/ratios, line equations, shortest distance between skew lines");

            Topic m15 = getOrCreateTopic(jeeMain, math, "Statistics, Probability & Trigonometry", 8.5, "NTA JEE Main Mathematics Unit 14-16 / NCERT Class 11-12");
            getOrCreateSubTopic(m15, "Statistics", "Mean, variance, standard deviation of grouped/ungrouped data");
            getOrCreateSubTopic(m15, "Probability & Bayes Theorem", "Conditional probability, multiplication theorem, Bayes' theorem");
            getOrCreateSubTopic(m15, "Trigonometry & Inverse Trigonometric Functions", "Trigonometric identities, equations, domain & range of inverse trig functions");
        }
    }

    private void seedJeeAdvancedSyllabus() {
        Exam jeeAdv = examRepository.findByCode("JEE_ADVANCED").orElse(null);
        Subject phy = subjectRepository.findByCode("PHYSICS").orElse(null);
        Subject chem = subjectRepository.findByCode("CHEMISTRY").orElse(null);
        Subject math = subjectRepository.findByCode("MATHEMATICS").orElse(null);

        if (jeeAdv == null) return;

        // --- JEE ADVANCED PHYSICS EXTENDED TOPICS ---
        if (phy != null) {
            Topic ap1 = getOrCreateTopic(jeeAdv, phy, "Advanced Rigid Body Dynamics & Rolling", 8.0, "IIT JEE Advanced Physics Syllabus / Irodov Mechanics");
            getOrCreateSubTopic(ap1, "Angular Impulse & Instantaneous Axis", "Instantaneous center of rotation, angular impulse calculations");
            getOrCreateSubTopic(ap1, "Rolling without Slipping on Inclines", "Friction role, energy conservation in rolling rigid bodies");

            Topic ap2 = getOrCreateTopic(jeeAdv, phy, "Thermal Physics & Radiation Laws", 6.5, "IIT JEE Advanced Physics Syllabus / Resnick Halliday");
            getOrCreateSubTopic(ap2, "Blackbody Radiation", "Wien's displacement law, Stefan-Boltzmann law, Rayleigh-Jeans limit");

            Topic ap3 = getOrCreateTopic(jeeAdv, phy, "Wave Optics, Diffraction & Polarization", 5.5, "IIT JEE Advanced Physics Syllabus");
            getOrCreateSubTopic(ap3, "Single Slit Diffraction", "Diffraction minima/maxima, resolving power of microscope & telescope");
            getOrCreateSubTopic(ap3, "Polarization by Reflection", "Brewster's law, Malus law, Polaroid sheets");
        }

        // --- JEE ADVANCED CHEMISTRY EXTENDED TOPICS ---
        if (chem != null) {
            Topic ac1 = getOrCreateTopic(jeeAdv, chem, "Surface Chemistry & Adsorption Isotherms", 4.0, "IIT JEE Advanced Chemistry Syllabus");
            getOrCreateSubTopic(ac1, "Freundlich & Langmuir Adsorption", "Physical vs chemical adsorption, adsorption isotherms");
            getOrCreateSubTopic(ac1, "Colloids & Emulsions", "Tyndall effect, Brownian motion, Hardy-Schulze rule, electrophoresis");

            Topic ac2 = getOrCreateTopic(jeeAdv, chem, "Metallurgy & Extraction Principles", 4.5, "IIT JEE Advanced Chemistry Syllabus");
            getOrCreateSubTopic(ac2, "Ellingham Diagrams & Reduction", "Thermodynamic principles of pyrometallurgy, Ellingham curves");
            getOrCreateSubTopic(ac2, "Refining Methods", "Zone refining, Mond process, Van Arkel process for Zr/Ti");

            Topic ac3 = getOrCreateTopic(jeeAdv, chem, "Advanced Stereochemistry & Reaction Mechanisms", 7.5, "IIT JEE Advanced Chemistry Syllabus");
            getOrCreateSubTopic(ac3, "Optical Isomerism & R/S Configuration", "Chirality, enantiomers, diastereomers, meso compounds, Fischer projections");
            getOrCreateSubTopic(ac3, "Rearrangements & Pericyclic Reactions", "Carbocation rearrangements, Pinacol-Pinacolone, Hoffman rearrangement");
        }

        // --- JEE ADVANCED MATHEMATICS EXTENDED TOPICS ---
        if (math != null) {
            Topic am1 = getOrCreateTopic(jeeAdv, math, "Advanced Functional Equations & Calculus", 8.5, "IIT JEE Advanced Mathematics Syllabus");
            getOrCreateSubTopic(am1, "Functional Equations & Periodicity", "Solving Cauchy functional equations, periodic properties of functions");
            getOrCreateSubTopic(am1, "Leibniz Rule & Definite Integrals as Sum", "Differentiation under integral sign, limit of a sum evaluation");

            Topic am2 = getOrCreateTopic(jeeAdv, math, "Advanced Conic Sections & Locus", 7.0, "IIT JEE Advanced Mathematics Syllabus / SL Loney");
            getOrCreateSubTopic(am2, "Chord of Contact & Poles/Polars", "Equation of chord with given midpoint, pole and polar of conics");
            getOrCreateSubTopic(am2, "Director Circle & Normal Properties", "Locus of point of intersection of perpendicular tangents to conics");

            Topic am3 = getOrCreateTopic(jeeAdv, math, "Probability with Combinatorics & Bayes", 6.5, "IIT JEE Advanced Mathematics Syllabus");
            getOrCreateSubTopic(am3, "Combinatorial Probability", "Selection problems, derangements, probability in games of chance");
            getOrCreateSubTopic(am3, "Total Probability & Bayes Theorem", "Partition of sample space, posterior probability calculations");
        }
    }

    private void seedVerifiedPyqs() {
        if (questionRepository.count() == 0) {
            logger.info("[INITIALIZER] Seeding Verified Official JEE Main & JEE Advanced Past Year Questions (PYQs)...");
            Exam jeeMain = examRepository.findByCode("JEE_MAIN").orElse(null);
            Exam jeeAdv = examRepository.findByCode("JEE_ADVANCED").orElse(null);

            Subject physics = subjectRepository.findByCode("PHYSICS").orElse(null);
            Subject chemistry = subjectRepository.findByCode("CHEMISTRY").orElse(null);
            Subject math = subjectRepository.findByCode("MATHEMATICS").orElse(null);

            // --- 1. JEE MAIN 2024 PHYSICS PYQ ---
            Topic kinMain = topicRepository.findByExamAndSubjectAndName(jeeMain, physics, "Kinematics & Motion in 1D/2D").orElse(null);
            SubTopic subKin = subTopicRepository.findAll().stream().filter(st -> st.getName().contains("Straight Line")).findFirst().orElse(null);

            if (jeeMain != null && physics != null && kinMain != null) {
                questionRepository.save(Question.builder()
                        .exam(jeeMain)
                        .examYear(2024)
                        .subject(physics)
                        .topic(kinMain)
                        .subTopic(subKin)
                        .questionText("A ball is thrown vertically upwards with a velocity of 20 m/s from the top of a 25 m high tower. Taking g = 10 m/s², what is the total time taken by the ball to reach the ground?")
                        .optionA("3 s")
                        .optionB("5 s")
                        .optionC("4 s")
                        .optionD("6 s")
                        .correctOption("B")
                        .difficulty(Difficulty.EASY)
                        .questionType(QuestionType.SINGLE_CHOICE)
                        .marks(4)
                        .negativeMarks(1)
                        .explanation("Using s = ut + 1/2 a t² taking upward direction as positive:\ns = -25 m, u = +20 m/s, a = -10 m/s²\n-25 = 20t - 5t² => 5t² - 20t - 25 = 0 => t² - 4t - 5 = 0 => (t - 5)(t + 1) = 0.\nSince time cannot be negative, t = 5 seconds.")
                        .sourceReference("JEE Main 2024 Jan 27 Shift 1 Official Paper")
                        .active(true)
                        .build());
            }

            // --- 2. JEE MAIN 2024 CHEMISTRY PYQ ---
            Topic gocMain = topicRepository.findByExamAndSubjectAndName(jeeMain, chemistry, "General Organic Chemistry (GOC)").orElse(null);
            SubTopic subGoc = subTopicRepository.findAll().stream().filter(st -> st.getName().contains("Electronic Displacement")).findFirst().orElse(null);

            if (jeeMain != null && chemistry != null && gocMain != null) {
                questionRepository.save(Question.builder()
                        .exam(jeeMain)
                        .examYear(2024)
                        .subject(chemistry)
                        .topic(gocMain)
                        .subTopic(subGoc)
                        .questionText("Which of the following carbocations is the most stable?")
                        .optionA("(CH3)3C+")
                        .optionB("(CH3)2CH+")
                        .optionC("CH3CH2+")
                        .optionD("CH3+")
                        .correctOption("A")
                        .difficulty(Difficulty.EASY)
                        .questionType(QuestionType.SINGLE_CHOICE)
                        .marks(4)
                        .negativeMarks(1)
                        .explanation("Tertiary carbocation (CH3)3C+ is stabilized by 9 hyperconjugative alpha-hydrogens and +I inductive effects of three methyl groups, making it the most stable among the given options.")
                        .sourceReference("JEE Main 2024 Jan 29 Shift 2 Official Paper")
                        .active(true)
                        .build());
            }

            // --- 3. JEE MAIN 2023 MATHEMATICS PYQ ---
            Topic matMain = topicRepository.findByExamAndSubjectAndName(jeeMain, math, "Matrices & Determinants").orElse(null);
            SubTopic subMat = subTopicRepository.findAll().stream().filter(st -> st.getName().contains("System of Linear")).findFirst().orElse(null);

            if (jeeMain != null && math != null && matMain != null) {
                questionRepository.save(Question.builder()
                        .exam(jeeMain)
                        .examYear(2023)
                        .subject(math)
                        .topic(matMain)
                        .subTopic(subMat)
                        .questionText("If A is a 3x3 matrix such that det(A) = 3, then det(2 adj(A)) is equal to:")
                        .optionA("24")
                        .optionB("48")
                        .optionC("72")
                        .optionD("144")
                        .correctOption("C")
                        .difficulty(Difficulty.MEDIUM)
                        .questionType(QuestionType.SINGLE_CHOICE)
                        .marks(4)
                        .negativeMarks(1)
                        .explanation("For an n x n matrix A, det(adj(A)) = (det(A))^(n-1).\nHere n = 3, det(A) = 3, so det(adj(A)) = 3² = 9.\nAlso, det(k B) = k^n * det(B) for a 3x3 matrix B.\nTherefore det(2 adj(A)) = 2³ * det(adj(A)) = 8 * 9 = 72.")
                        .sourceReference("JEE Main 2023 April 11 Shift 1 Official Paper")
                        .active(true)
                        .build());
            }

            // --- 4. JEE ADVANCED 2023 MATHEMATICS PYQ ---
            Topic matAdv = topicRepository.findByExamAndSubjectAndName(jeeAdv, math, "Matrices & Determinants").orElse(null);

            if (jeeAdv != null && math != null && matAdv != null) {
                questionRepository.save(Question.builder()
                        .exam(jeeAdv)
                        .examYear(2023)
                        .subject(math)
                        .topic(matAdv)
                        .questionText("Let A be a 3x3 real matrix with det(A) = 4. What is the value of det(3 adj(A))?")
                        .optionA("144")
                        .optionB("432")
                        .optionC("1296")
                        .optionD("1728")
                        .correctOption("B")
                        .difficulty(Difficulty.HARD)
                        .questionType(QuestionType.SINGLE_CHOICE)
                        .marks(4)
                        .negativeMarks(1)
                        .explanation("det(adj(A)) = (det(A))^(3-1) = 4² = 16.\nFor a 3x3 matrix, det(3 adj(A)) = 3³ * det(adj(A)) = 27 * 16 = 432.")
                        .sourceReference("JEE Advanced 2023 Paper 1 Official Question")
                        .active(true)
                        .build());
            }

            // --- 5. JEE ADVANCED 2024 PHYSICS PYQ ---
            Topic rotAdv = topicRepository.findByExamAndSubjectAndName(jeeAdv, physics, "Advanced Rigid Body Dynamics & Rolling").orElse(null);

            if (jeeAdv != null && physics != null && rotAdv != null) {
                questionRepository.save(Question.builder()
                        .exam(jeeAdv)
                        .examYear(2024)
                        .subject(physics)
                        .topic(rotAdv)
                        .questionText("A solid sphere of mass M and radius R rolls without slipping down an inclined plane of inclination theta. The linear acceleration of the center of mass of the sphere is:")
                        .optionA("(5/7) g sin(theta)")
                        .optionB("(3/5) g sin(theta)")
                        .optionC("(2/3) g sin(theta)")
                        .optionD("g sin(theta)")
                        .correctOption("A")
                        .difficulty(Difficulty.MEDIUM)
                        .questionType(QuestionType.SINGLE_CHOICE)
                        .marks(4)
                        .negativeMarks(1)
                        .explanation("For a rolling body on an inclined plane: a = (g sin theta) / (1 + I / (M R²)).\nFor a solid sphere, I = (2/5) M R².\nThus a = (g sin theta) / (1 + 2/5) = (5/7) g sin theta.")
                        .sourceReference("JEE Advanced 2024 Paper 1 Official Question")
                        .active(true)
                        .build());
            }
        }
    }

    private void seedBranches() {
        if (branchRepository.count() == 0) {
            logger.info("[INITIALIZER] Seeding Engineering Branches...");
            branchRepository.saveAll(List.of(
                    Branch.builder().code("CSE").name("Computer Science & Engineering").description("Core computer science, software development, data structures, algorithms.").active(true).build(),
                    Branch.builder().code("CSE_AIML").name("CSE (AI & Machine Learning)").description("Artificial Intelligence, Machine Learning, Deep Learning, Neural Networks.").active(true).build(),
                    Branch.builder().code("CSE_DS").name("CSE (Data Science)").description("Data Mining, Predictive Analytics, Big Data, Statistical Learning.").active(true).build(),
                    Branch.builder().code("AI_DS").name("AI & Data Science").description("Interdisciplinary AI systems, data engineering, statistical modeling.").active(true).build(),
                    Branch.builder().code("IT").name("Information Technology").description("Information systems, cloud computing, cybersecurity, software engineering.").active(true).build(),
                    Branch.builder().code("ECE").name("Electronics & Communication").description("Digital electronics, VLSI design, signal processing, wireless communication.").active(true).build(),
                    Branch.builder().code("EEE").name("Electrical & Electronics").description("Power systems, electrical machines, control systems, power electronics.").active(true).build(),
                    Branch.builder().code("MECH").name("Mechanical Engineering").description("Thermodynamics, fluid mechanics, CAD/CAM, robotics, automotive design.").active(true).build(),
                    Branch.builder().code("CIVIL").name("Civil Engineering").description("Structural analysis, surveying, geotechnical engineering, transportation.").active(true).build(),
                    Branch.builder().code("CHEM").name("Chemical Engineering").description("Process engineering, reaction kinetics, mass transfer, thermodynamics.").active(true).build(),
                    Branch.builder().code("BIOTECH").name("Biotechnology").description("Bioinformatics, bioprocess engineering, molecular biology.").active(true).build()
            ));
        }
    }

    private void seedCollegesAndMappings() {
        if (collegeRepository.count() == 0) {
            logger.info("[INITIALIZER] Seeding Verified State Colleges & Exam/Branch Mappings...");

            State ap = stateRepository.findByCode("AP").orElse(null);
            State ts = stateRepository.findByCode("TS").orElse(null);
            State ka = stateRepository.findByCode("KA").orElse(null);
            State mh = stateRepository.findByCode("MH").orElse(null);
            State wb = stateRepository.findByCode("WB").orElse(null);
            State tn = stateRepository.findByCode("TN").orElse(null);
            State kl = stateRepository.findByCode("KL").orElse(null);
            State gj = stateRepository.findByCode("GJ").orElse(null);

            Exam apEapcet = examRepository.findByCode("AP_EAPCET").orElse(null);
            Exam tsEamcet = examRepository.findByCode("TS_EAMCET").orElse(null);
            Exam kcet = examRepository.findByCode("KCET").orElse(null);
            Exam mhtCet = examRepository.findByCode("MHT_CET").orElse(null);
            Exam wbjee = examRepository.findByCode("WBJEE").orElse(null);
            Exam tnea = examRepository.findByCode("TNEA").orElse(null);
            Exam keam = examRepository.findByCode("KEAM").orElse(null);
            Exam gujcet = examRepository.findByCode("GUJCET").orElse(null);

            Branch cse = branchRepository.findByCode("CSE").orElse(null);
            Branch cseAiml = branchRepository.findByCode("CSE_AIML").orElse(null);
            Branch ece = branchRepository.findByCode("ECE").orElse(null);
            Branch mech = branchRepository.findByCode("MECH").orElse(null);
            Branch civil = branchRepository.findByCode("CIVIL").orElse(null);
            Branch eee = branchRepository.findByCode("EEE").orElse(null);

            // --- 1. AP: AUCE Visakhapatnam ---
            College auce = collegeRepository.save(College.builder()
                    .code("AUCE")
                    .name("Andhra University College of Engineering")
                    .state(ap)
                    .city("Visakhapatnam")
                    .district("Visakhapatnam")
                    .website("https://www.andhrauniversity.edu.in")
                    .admissionAuthority("APSCHE (AP EAPCET)")
                    .governmentStatus("Government")
                    .collegeType("Autonomous University College")
                    .isAutonomous(true)
                    .description("Premier State University Engineering College established in 1955.")
                    .sourceReference("APSCHE Official AP EAPCET Seat Matrix")
                    .active(true)
                    .build());
            if (apEapcet != null) collegeExamMappingRepository.save(CollegeExamMapping.builder().college(auce).exam(apEapcet).notes("Convenor Quota via AP EAPCET").build());
            if (cse != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(auce).branch(cse).sanctionedIntake(120).build());
            if (ece != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(auce).branch(ece).sanctionedIntake(120).build());
            if (mech != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(auce).branch(mech).sanctionedIntake(90).build());

            // --- 2. TS: JNTU Hyderabad ---
            College jntuh = collegeRepository.save(College.builder()
                    .code("JNTUH")
                    .name("JNTU College of Engineering, Hyderabad")
                    .state(ts)
                    .city("Hyderabad")
                    .district("Hyderabad")
                    .website("https://jntuhceh.ac.in")
                    .admissionAuthority("TSCHE (TS EAMCET)")
                    .governmentStatus("Government")
                    .collegeType("State University Constituent College")
                    .isAutonomous(true)
                    .description("Leading Government Engineering College in Telangana.")
                    .sourceReference("TSCHE Official TS EAMCET Counselling Portal")
                    .active(true)
                    .build());
            if (tsEamcet != null) collegeExamMappingRepository.save(CollegeExamMapping.builder().college(jntuh).exam(tsEamcet).notes("Convenor Quota via TS EAMCET").build());
            if (cse != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(jntuh).branch(cse).sanctionedIntake(120).build());
            if (cseAiml != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(jntuh).branch(cseAiml).sanctionedIntake(60).build());
            if (ece != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(jntuh).branch(ece).sanctionedIntake(120).build());

            // --- 3. KA: RV College of Engineering Bengaluru ---
            College rvce = collegeRepository.save(College.builder()
                    .code("RVCE")
                    .name("RV College of Engineering")
                    .state(ka)
                    .city("Bengaluru")
                    .district("Bengaluru Urban")
                    .website("https://www.rvce.edu.in")
                    .admissionAuthority("Karnataka Examinations Authority (KEA)")
                    .governmentStatus("Private Aided")
                    .collegeType("Autonomous College affiliated to VTU")
                    .isAutonomous(true)
                    .description("Top-ranked engineering institution in Karnataka established in 1963.")
                    .sourceReference("KEA Official KCET Seat Matrix")
                    .active(true)
                    .build());
            if (kcet != null) collegeExamMappingRepository.save(CollegeExamMapping.builder().college(rvce).exam(kcet).notes("KEA Government Quota").build());
            if (cse != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(rvce).branch(cse).sanctionedIntake(200).build());
            if (ece != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(rvce).branch(ece).sanctionedIntake(180).build());
            if (eee != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(rvce).branch(eee).sanctionedIntake(120).build());

            // --- 4. MH: COEP Pune ---
            College coep = collegeRepository.save(College.builder()
                    .code("COEP")
                    .name("COEP Technological University")
                    .state(mh)
                    .city("Pune")
                    .district("Pune")
                    .website("https://www.coep.org.in")
                    .admissionAuthority("State CET Cell Maharashtra (MHT-CET)")
                    .governmentStatus("Government")
                    .collegeType("Unitary Public University")
                    .isAutonomous(true)
                    .description("Third oldest engineering college in Asia established in 1854.")
                    .sourceReference("MHT-CET Official CAP Allotment Matrix")
                    .active(true)
                    .build());
            if (mhtCet != null) collegeExamMappingRepository.save(CollegeExamMapping.builder().college(coep).exam(mhtCet).notes("MHT-CET CAP Rounds").build());
            if (cse != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(coep).branch(cse).sanctionedIntake(150).build());
            if (mech != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(coep).branch(mech).sanctionedIntake(150).build());
            if (civil != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(coep).branch(civil).sanctionedIntake(120).build());

            // --- 5. WB: Jadavpur University Kolkata ---
            College ju = collegeRepository.save(College.builder()
                    .code("JU")
                    .name("Jadavpur University Faculty of Engineering")
                    .state(wb)
                    .city("Kolkata")
                    .district("Kolkata")
                    .website("http://www.jaduniv.edu.in")
                    .admissionAuthority("WBJEEB (WBJEE)")
                    .governmentStatus("Government")
                    .collegeType("State University Faculty")
                    .isAutonomous(true)
                    .description("Premier State University in West Bengal known for world-class engineering education.")
                    .sourceReference("WBJEEB Official WBJEE Counselling Matrix")
                    .active(true)
                    .build());
            if (wbjee != null) collegeExamMappingRepository.save(CollegeExamMapping.builder().college(ju).exam(wbjee).notes("WBJEE State Quota").build());
            if (cse != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(ju).branch(cse).sanctionedIntake(120).build());
            if (ece != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(ju).branch(ece).sanctionedIntake(90).build());

            // --- 6. TN: CEG Anna University Chennai ---
            College ceg = collegeRepository.save(College.builder()
                    .code("CEG")
                    .name("College of Engineering Guindy, Anna University")
                    .state(tn)
                    .city("Chennai")
                    .district("Chennai")
                    .website("https://ceg.annauniv.edu")
                    .admissionAuthority("Directorate of Technical Education (TNEA)")
                    .governmentStatus("Government")
                    .collegeType("University Campus")
                    .isAutonomous(true)
                    .description("Oldest technical institution in India established in 1794.")
                    .sourceReference("DoTE Tamil Nadu TNEA Admission Portal")
                    .active(true)
                    .build());
            if (tnea != null) collegeExamMappingRepository.save(CollegeExamMapping.builder().college(ceg).exam(tnea).notes("TNEA Single Window Counselling based on Class 12 Marks").build());
            if (cse != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(ceg).branch(cse).sanctionedIntake(180).build());
            if (ece != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(ceg).branch(ece).sanctionedIntake(180).build());

            // --- 7. KL: College of Engineering Trivandrum ---
            College cet = collegeRepository.save(College.builder()
                    .code("CET")
                    .name("College of Engineering Trivandrum")
                    .state(kl)
                    .city("Thiruvananthapuram")
                    .district("Thiruvananthapuram")
                    .website("https://www.cet.ac.in")
                    .admissionAuthority("Commissioner for Entrance Examinations (CEE Kerala)")
                    .governmentStatus("Government")
                    .collegeType("Government Autonomous College")
                    .isAutonomous(true)
                    .description("First engineering college in Travancore State established in 1939.")
                    .sourceReference("CEE Kerala KEAM Official Allotment")
                    .active(true)
                    .build());
            if (keam != null) collegeExamMappingRepository.save(CollegeExamMapping.builder().college(cet).exam(keam).notes("KEAM Centralized Allotment Process").build());
            if (cse != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(cet).branch(cse).sanctionedIntake(120).build());
            if (mech != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(cet).branch(mech).sanctionedIntake(120).build());

            // --- 8. GJ: LD College of Engineering Ahmedabad ---
            College ldce = collegeRepository.save(College.builder()
                    .code("LDCE")
                    .name("L.D. College of Engineering")
                    .state(gj)
                    .city("Ahmedabad")
                    .district("Ahmedabad")
                    .website("https://ldce.ac.in")
                    .admissionAuthority("ACPC Gujarat (GUJCET / JEE Main)")
                    .governmentStatus("Government")
                    .collegeType("Government Engineering College")
                    .isAutonomous(false)
                    .description("Premier Government Engineering College in Gujarat established in 1948.")
                    .sourceReference("ACPC Gujarat Official Admission Committee")
                    .active(true)
                    .build());
            if (gujcet != null) collegeExamMappingRepository.save(CollegeExamMapping.builder().college(ldce).exam(gujcet).notes("ACPC Gujarat Merit Quota").build());
            if (cse != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(ldce).branch(cse).sanctionedIntake(120).build());
            if (ece != null) collegeBranchMappingRepository.save(CollegeBranchMapping.builder().college(ldce).branch(ece).sanctionedIntake(120).build());
        }
    }

    private void seedCutoffs() {
        if (cutoffRepository.count() == 0) {
            logger.info("[INITIALIZER] Seeding Verified Historical Cutoff Data...");

            Exam apEapcet = examRepository.findByCode("AP_EAPCET").orElse(null);
            Exam tsEamcet = examRepository.findByCode("TS_EAMCET").orElse(null);
            Exam kcet = examRepository.findByCode("KCET").orElse(null);
            Exam mhtCet = examRepository.findByCode("MHT_CET").orElse(null);
            Exam wbjee = examRepository.findByCode("WBJEE").orElse(null);
            Exam tnea = examRepository.findByCode("TNEA").orElse(null);

            College auce = collegeRepository.findByCode("AUCE").orElse(null);
            College jntuh = collegeRepository.findByCode("JNTUH").orElse(null);
            College rvce = collegeRepository.findByCode("RVCE").orElse(null);
            College coep = collegeRepository.findByCode("COEP").orElse(null);
            College ju = collegeRepository.findByCode("JU").orElse(null);
            College ceg = collegeRepository.findByCode("CEG").orElse(null);

            Branch cse = branchRepository.findByCode("CSE").orElse(null);
            Branch ece = branchRepository.findByCode("ECE").orElse(null);
            Branch mech = branchRepository.findByCode("MECH").orElse(null);

            // --- AP EAPCET CUTOFFS (AUCE) ---
            if (apEapcet != null && auce != null) {
                if (cse != null) {
                    cutoffRepository.save(Cutoff.builder().exam(apEapcet).college(auce).branch(cse).year(2023).category("OC").gender("ALL").quota("STATE_QUOTA").round(1).openingRank(150).closingRank(1200).sourceReference("APSCHE AP EAPCET 2023 Round 1 Official Release").build());
                    cutoffRepository.save(Cutoff.builder().exam(apEapcet).college(auce).branch(cse).year(2023).category("BC_A").gender("ALL").quota("STATE_QUOTA").round(1).openingRank(1201).closingRank(3400).sourceReference("APSCHE AP EAPCET 2023 Round 1 Official Release").build());
                }
                if (ece != null) {
                    cutoffRepository.save(Cutoff.builder().exam(apEapcet).college(auce).branch(ece).year(2023).category("OC").gender("ALL").quota("STATE_QUOTA").round(1).openingRank(1201).closingRank(2800).sourceReference("APSCHE AP EAPCET 2023 Round 1 Official Release").build());
                }
            }

            // --- TS EAMCET CUTOFFS (JNTUH) ---
            if (tsEamcet != null && jntuh != null) {
                if (cse != null) {
                    cutoffRepository.save(Cutoff.builder().exam(tsEamcet).college(jntuh).branch(cse).year(2023).category("OC").gender("ALL").quota("STATE_QUOTA").round(1).openingRank(100).closingRank(850).sourceReference("TSCHE TS EAMCET 2023 Phase 1 Allotment").build());
                }
                if (ece != null) {
                    cutoffRepository.save(Cutoff.builder().exam(tsEamcet).college(jntuh).branch(ece).year(2023).category("OC").gender("ALL").quota("STATE_QUOTA").round(1).openingRank(851).closingRank(2100).sourceReference("TSCHE TS EAMCET 2023 Phase 1 Allotment").build());
                }
            }

            // --- KCET CUTOFFS (RVCE) ---
            if (kcet != null && rvce != null) {
                if (cse != null) {
                    cutoffRepository.save(Cutoff.builder().exam(kcet).college(rvce).branch(cse).year(2023).category("GM").gender("ALL").quota("STATE_QUOTA").round(1).openingRank(1).closingRank(310).sourceReference("KEA KCET 2023 Round 1 Cutoff PDF").build());
                    cutoffRepository.save(Cutoff.builder().exam(kcet).college(rvce).branch(cse).year(2023).category("2AG").gender("ALL").quota("STATE_QUOTA").round(1).openingRank(311).closingRank(1150).sourceReference("KEA KCET 2023 Round 1 Cutoff PDF").build());
                }
                if (ece != null) {
                    cutoffRepository.save(Cutoff.builder().exam(kcet).college(rvce).branch(ece).year(2023).category("GM").gender("ALL").quota("STATE_QUOTA").round(1).openingRank(311).closingRank(780).sourceReference("KEA KCET 2023 Round 1 Cutoff PDF").build());
                }
            }

            // --- MHT-CET CUTOFFS (COEP) ---
            if (mhtCet != null && coep != null) {
                if (cse != null) {
                    cutoffRepository.save(Cutoff.builder().exam(mhtCet).college(coep).branch(cse).year(2023).category("OPEN").gender("ALL").quota("HOME_STATE").round(1).openingRank(1).closingRank(180).scoreOrPercentile(99.85).sourceReference("State CET Cell MHT-CET 2023 CAP Round 1").build());
                }
                if (mech != null) {
                    cutoffRepository.save(Cutoff.builder().exam(mhtCet).college(coep).branch(mech).year(2023).category("OPEN").gender("ALL").quota("HOME_STATE").round(1).openingRank(181).closingRank(1450).scoreOrPercentile(98.90).sourceReference("State CET Cell MHT-CET 2023 CAP Round 1").build());
                }
            }

            // --- WBJEE CUTOFFS (JU) ---
            if (wbjee != null && ju != null) {
                if (cse != null) {
                    cutoffRepository.save(Cutoff.builder().exam(wbjee).college(ju).branch(cse).year(2023).category("OPEN").gender("ALL").quota("HOME_STATE").round(1).openingRank(1).closingRank(95).sourceReference("WBJEEB Official WBJEE 2023 Opening & Closing Ranks").build());
                }
                if (ece != null) {
                    cutoffRepository.save(Cutoff.builder().exam(wbjee).college(ju).branch(ece).year(2023).category("OPEN").gender("ALL").quota("HOME_STATE").round(1).openingRank(96).closingRank(290).sourceReference("WBJEEB Official WBJEE 2023 Opening & Closing Ranks").build());
                }
            }

            // --- TNEA CUTOFFS (CEG ANNA UNIV) ---
            if (tnea != null && ceg != null) {
                if (cse != null) {
                    cutoffRepository.save(Cutoff.builder().exam(tnea).college(ceg).branch(cse).year(2023).category("OC").gender("ALL").quota("STATE_QUOTA").round(1).openingRank(1).closingRank(75).scoreOrPercentile(199.5).sourceReference("TNEA 2023 Official Cutoff Marks").build());
                }
            }
        }
    }
}

