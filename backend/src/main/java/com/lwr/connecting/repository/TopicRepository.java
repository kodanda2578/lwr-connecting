package com.lwr.connecting.repository;

import com.lwr.connecting.entity.Exam;
import com.lwr.connecting.entity.Subject;
import com.lwr.connecting.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findBySubjectIdAndActiveTrueOrderByNameAsc(Long subjectId);
    List<Topic> findByExamIdAndActiveTrueOrderByNameAsc(Long examId);
    List<Topic> findBySubjectIdAndExamIdAndActiveTrueOrderByNameAsc(Long subjectId, Long examId);
    List<Topic> findByActiveTrueOrderByNameAsc();
    Optional<Topic> findByExamAndSubjectAndName(Exam exam, Subject subject, String name);
}
