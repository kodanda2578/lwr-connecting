package com.lwr.connecting.service.ai;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.enums.Difficulty;

import java.util.List;

public interface AIQuestionProvider {
    String getProviderName();
    List<Question> generateQuestions(Exam exam, Subject subject, Topic topic, SubTopic subTopic, Difficulty difficulty, int count);
}
