import omit from 'lodash.omit';
import get from 'lodash.get';

function getQuestion(base, sub) {
    if (base.length > 125 && sub) {
        return base.substring(0, 125 - sub.substring(0, 125).length) + '_' + sub.substring(0, 126);
    } else if (base.length > 125) {
        return base.substring(0, 126);
    }
    return '';
}

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
                    data_id: dataId,
                });
            }
        } else if (subQuestions) {
            const extractedSubquestions = stripKeys(subQuestions);
            for (let i = 0; i < extractedSubquestions.length; i += 1) {
                obj.push({
                    survey_id: surveyId,
                    question_id: survey.id,
                    answer: get(extractedSubquestions, [i, 'answer'], null),
                    data_id: dataId,
                });
            }
        }
    } else {
        obj.push({
            survey_id: surveyId,
            question_id: survey.id,
            answer: get(survey, ['answer'], null),
            data_id: dataId,
        });
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
    let questionAnswers = [];
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
    if (config.option === 'surveyresponse') {
        const surveyData = data.map(({ id, survey_data, survey_id }) => { return { id, survey_data, survey_id }; });
        allData = aggregate(data, Object.keys(surveyData).map(k => surveyData[k]));
        console.log(allData);
    } else if (config.option === 'surveydata') {
        allData = dropSurveyData(data);
        console.log(allData);
    }
    return allData;
}

export default function transformSurveyResponse(stream, config) {
    return stream.map(obj => transformSurvey(obj, config));
}
