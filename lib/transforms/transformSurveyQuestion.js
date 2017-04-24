function getQuestions(surveyQuestion) {
    return {
        survey_id: surveyQuestion.survey_id,
        id: surveyQuestion.id,
        base_type: surveyQuestion.base_type,
        type: surveyQuestion.type,
        title: surveyQuestion.title.English,
    };
}

function getAnswers(surveyQuestion) {
    const mappedData = [];
    if (surveyQuestion.options.length > 0) {
        surveyQuestion.options.forEach((option) => {
            mappedData.push({
                survey_id: surveyQuestion.survey_id,
                id: surveyQuestion.id,
                option_id: `${surveyQuestion.id}_${option.id}`,
                option_title: option.title.English,
                option_value: option.value,
            });
        });
    } else if (surveyQuestion.sub_questions) {
        surveyQuestion.sub_questions.forEach((subQuestion) => {
            mappedData.push({
                survey_id: surveyQuestion.survey_id,
                id: surveyQuestion.id,
                option_id: `${surveyQuestion.id}_${subQuestion.id}`,
                option_title: subQuestion.title.English,
                option_value: null,
            });
        });
    } else {
        mappedData.push({
            survey_id: surveyQuestion.survey_id,
            id: surveyQuestion.id,
            option_id: null,
            option_title: surveyQuestion.title.English,
            option_value: null,
        });
    }
    return mappedData;
}

function transformSurveyQuestionResponse(obj, config) {
    console.log('transforming questions')
    const data = obj.data;
    const mappedData = [];
    if (config.option === 'questions') {
        data.forEach((surveyQuestion) => {
            const questionData = getQuestions(surveyQuestion);
            if (questionData) {
                mappedData.push(questionData);
            }
        });
    } else if (config.option === 'answers') {
        data.forEach((surveyQuestion) => {
            const answerData = getAnswers(surveyQuestion);
            if (answerData) {
                mappedData.push(answerData);
            }
        });
    }
    return mappedData;
}

export default function transformSurveyQuestion(stream, config) {
    return stream.map(obj => transformSurveyQuestionResponse(obj, config));
}
