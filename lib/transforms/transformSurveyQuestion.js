import utf8 from 'utf8';

function getQuestions(surveyQuestion) {
    const title = surveyQuestion.title.English.replace(/[^\x00-\x7F]/g, ' ').replace(/\?/, ' ');
    const encodedTitle = utf8.encode(title);
    return {
        survey_id: surveyQuestion.survey_id,
        id: `${surveyQuestion.survey_id}_${surveyQuestion.id}`
        question_id: surveyQuestion.id,
        base_type: surveyQuestion.base_type,
        type: surveyQuestion.type,
        title: encodedTitle,
    };
}

function getAnswers(surveyQuestion) {
    let mappedData;
    if (surveyQuestion.options.length > 0) {
        mappedData = surveyQuestion.options.map((option) => {
            console.log(surveyQuestion.id);
            return {
                survey_id: surveyQuestion.survey_id,
                id: surveyQuestion.id,
                option_id: `${surveyQuestion.survey_id}_${surveyQuestion.id}_${option.id}`,
                option_title: option.title.English,
                option_value: option.value,
            };
        });
    } else if (surveyQuestion.sub_questions) {
        mappedData = surveyQuestion.sub_questions.map((subQuestion) => {
            return {
                survey_id: surveyQuestion.survey_id,
                id: surveyQuestion.id,
                option_id: `${surveyQuestion.survey_id}_${surveyQuestion.id}_${subQuestion.id}`,
                option_title: subQuestion.title.English,
                option_value: null,
            };
        });
    } else {
        mappedData = [{
            survey_id: surveyQuestion.survey_id,
            id: surveyQuestion.id,
            option_id: null,
            option_title: surveyQuestion.title.English,
            option_value: null,
        }];
    }
    return mappedData;
}

function transformSurveyQuestionResponse(obj, config) {
    const data = obj;
    if (config.option === 'questions') {
        const questionData = getQuestions(data);
        if (questionData) {
            return JSON.stringify(questionData);
        }
    } else if (config.option === 'answers') {
        const answerData = getAnswers(data);
        if (answerData) {
            return JSON.stringify(answerData);
        }
    } else {
        throw new Error('No config option specified.');
    }
    return obj;
}

export default function transformSurveyQuestion(stream, config) {
    return stream.map(obj => transformSurveyQuestionResponse(obj, config));
}
