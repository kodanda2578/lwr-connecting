package com.lwr.connecting.service.ai;

import com.lwr.connecting.entity.*;
import com.lwr.connecting.enums.Difficulty;
import com.lwr.connecting.enums.QuestionSourceType;
import com.lwr.connecting.enums.QuestionType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service("mockAIQuestionProvider")
public class MockAIQuestionProvider implements AIQuestionProvider {

    @Override
    public String getProviderName() {
        return "MOCK_AI";
    }

    @Override
    public List<Question> generateQuestions(Exam exam, Subject subject, Topic topic, SubTopic subTopic, Difficulty difficulty, int count) {
        List<Question> generated = new ArrayList<>();

        for (int i = 1; i <= count; i++) {
            String topicName = topic != null ? topic.getName() : "Syllabus";
            String subjectName = subject != null ? subject.getName() : "Subject";
            Difficulty diff = difficulty != null ? difficulty : Difficulty.MEDIUM;

            Question q = Question.builder()
                    .exam(exam)
                    .subject(subject)
                    .topic(topic)
                    .subTopic(subTopic)
                    .questionText(String.format("AI Practice Question #%d on %s: Evaluate the fundamental property of %s under standard condition.", i, topicName, subjectName))
                    .optionA("Option A: Standard value proportional to magnitude")
                    .optionB("Option B: Zero under conservative field equilibrium")
                    .optionC("Option C: Inversely proportional to square of distance")
                    .optionD("Option D: Independent of frame of reference")
                    .correctOption("B")
                    .difficulty(diff)
                    .questionType(QuestionType.SINGLE_CHOICE)
                    .marks(4)
                    .negativeMarks(1)
                    .explanation(String.format("Step-by-step AI Solution for %s: Under conservative field equilibrium, the net line integral around a closed path is zero. Hence Option B is correct.", topicName))
                    .sourceReference("AI Generated Question Engine v1.0 (" + topicName + ")")
                    .sourceType(QuestionSourceType.AI_GENERATED)
                    .active(true)
                    .build();

            generated.add(q);
        }

        return generated;
    }
}
