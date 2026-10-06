package com.lwr.connecting.repository;

import com.lwr.connecting.entity.Question;
import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.enums.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {

    List<Question> findByExamIdAndActiveTrue(Long examId);

    List<Question> findByExamIdAndSubjectIdAndActiveTrue(Long examId, Long subjectId);

    List<Question> findByExamIdAndExamYearAndActiveTrue(Long examId, Integer examYear);

    @Query("SELECT q FROM Question q WHERE q.active = true " +
           "AND (:examId IS NULL OR q.exam.id = :examId) " +
           "AND (:subjectId IS NULL OR q.subject.id = :subjectId) " +
           "AND (:topicId IS NULL OR q.topic.id = :topicId) " +
           "AND (:examYear IS NULL OR q.examYear = :examYear) " +
           "AND (:difficulty IS NULL OR q.difficulty = :difficulty) " +
           "AND (:questionType IS NULL OR q.questionType = :questionType) " +
           "AND (:search IS NULL OR LOWER(q.questionText) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(q.sourceReference) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY q.id DESC")
    List<Question> filterQuestions(
            @Param("examId") Long examId,
            @Param("subjectId") Long subjectId,
            @Param("topicId") Long topicId,
            @Param("examYear") Integer examYear,
            @Param("difficulty") Difficulty difficulty,
            @Param("questionType") QuestionType questionType,
            @Param("search") String search
    );

    @Query("SELECT DISTINCT q.examYear FROM Question q WHERE q.exam.id = :examId AND q.active = true ORDER BY q.examYear DESC")
    List<Integer> findYearsByExamId(@Param("examId") Long examId);
}
