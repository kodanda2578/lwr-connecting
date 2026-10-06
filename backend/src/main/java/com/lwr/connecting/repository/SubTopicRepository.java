package com.lwr.connecting.repository;

import com.lwr.connecting.entity.SubTopic;
import com.lwr.connecting.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubTopicRepository extends JpaRepository<SubTopic, Long> {
    List<SubTopic> findByTopicIdAndActiveTrueOrderByNameAsc(Long topicId);
    List<SubTopic> findByActiveTrueOrderByNameAsc();
    Optional<SubTopic> findByTopicAndName(Topic topic, String name);
}
