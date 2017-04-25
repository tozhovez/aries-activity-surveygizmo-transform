import get from 'lodash.get';

function stripKeys(array) {
    const keys = Object.keys(array);
    const questions = keys.map(key => array[key]);
    return questions;
}

function combineQuestionsWithAnswers(survey, dataId, surveyId) {
    const obj = [];
    const questionType = survey.type;
    // Questions have types. If it's a parent type, there will be
    // additional options or subquestions to account for.
    if (questionType === 'parent') {
        // The additional data that the response might contain if it's question is of type 'parent'.
        const options = survey.options;
        const subQuestions = survey.subquestions;
        if (options) {
            const extractedOptions = stripKeys(options);
            for (let i = 0; i < extractedOptions.length; i += 1) {
                obj.push({
                    survey_id: surveyId,
                    question_id: survey.id,
                    answer: get(extractedOptions, [i, 'answer'], null),
                    answer_id: `${survey.id}_${get(extractedOptions, [i, 'id'], null)}`,
                    data_id: dataId,
                    option_value: get(extractedOptions, [i, 'option'], null),
                    id: `${surveyId}_${dataId}`,
                });
            }
        } else if (subQuestions) {
            const extractedSubquestions = stripKeys(subQuestions);
            for (let i = 0; i < extractedSubquestions.length; i += 1) {
                const keys = Object.keys(extractedSubquestions[i]);
                // if the first key is equal to id, then we know we are at the
                // child most object. otherwise iterate over the keys and push
                if (keys[0] === 'id') {
                    obj.push({
                        survey_id: surveyId,
                        question_id: survey.id,
                        answer: get(extractedSubquestions, [i, 'answer'], null),
                        answer_id: `${survey.id}_${get(extractedSubquestions, [i, 'id'], null)}`,
                        data_id: dataId,
                        option_value: null,
                        id: `${surveyId}_${dataId}`,
                    });
                } else {
                    keys.forEach((k) => {
                        obj.push({
                            survey_id: surveyId,
                            question_id: survey.id,
                            answer: get(extractedSubquestions[i], [k, 'answer'], null),
                            answer_id: `${survey.id}_${get(extractedSubquestions[i], [k, 'id'], null)}`,
                            data_id: dataId,
                            option_value: null,
                            id: `${surveyId}_${dataId}`,
                        });
                    });
                }
            }
        }
    } else {
        const answerId = get(survey, ['answer_id'], null);
        if (answerId) {
            obj.push({
                survey_id: surveyId,
                question_id: survey.id,
                answer_id: `${survey.id}_${answerId}`,
                answer: get(survey, ['answer'], null),
                data_id: dataId,
                option_value: null,
                id: `${surveyId}_${dataId}`,
            });
        } else {
            obj.push({
                survey_id: surveyId,
                question_id: survey.id,
                answer_id: null,
                answer: get(survey, ['answer'], null),
                data_id: dataId,
                option_value: null,
                id: `${surveyId}_${dataId}`,
            });
        }
    }
    return obj;
}

function dropSurveyData(data) {
    data.forEach((response) => {
        delete response.survey_data;
    });
    return data;
}

function mapQuestionWithAnswersFromSurvey(data) {
    const survey = data.survey_data;
    const questionAnswers = [];
    Object.keys(survey).forEach((key) => {
        questionAnswers.push(...combineQuestionsWithAnswers(survey[key], data.id, data.survey_id));
    });
    return questionAnswers;
}

function aggregate(data, surveys) {
    const questionsAndAnswers = [];
    // Get questions from a survey
    for (let i = 0; i < surveys.length; i += 1) {
        questionsAndAnswers.push(mapQuestionWithAnswersFromSurvey(surveys[i]));
    }
    return questionsAndAnswers;
}

function transformSurvey(obj, config) {
    // Extract id and survey_data object from response data object
    const data = obj.data;
    let allData;
    if (config.option === 'responses') {
        const surveyData = data.map(({ id, survey_data, survey_id }) => {
            return { id, survey_data, survey_id };
        });
        allData = aggregate(data, Object.keys(surveyData).map(k => surveyData[k]));
    } else if (config.option === 'metadata') {
        allData = dropSurveyData(data);
    }
    return allData;
}

export default function transformSurveyResponse(stream, config) {
    return stream.map(obj => transformSurvey(obj, config));
}
