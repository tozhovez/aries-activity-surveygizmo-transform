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

function combineQuestionsWithAnswers(survey, dataId) {
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
                    survey_id: survey.survey_id,
                    question_id: survey.id,
                    answer: get(extractedOptions, [i, 'answer'], null),
                    data_id: dataId
                });
            }
        } else if (subQuestions) {
            const extractedSubquestions = stripKeys(subQuestions);
            for (let i = 0; i < extractedSubquestions.length; i += 1) {
                Object.assign(obj, { [survey.id] : get(extractedSubquestions, [i, 'answer'], null) });
            }
        }
    } else {
        Object.assign(obj, { [survey.id] : get(survey, ['answer'], null) });
    }
    return obj;
}

function mapSurveyAnswersToParent(data, questionsAndAnswers) {
    const allData = [];
    for (let i = 0; i < questionsAndAnswers.length; i += 1) {
        const response = data.find(obj => obj.id === questionsAndAnswers[i].data_id);
        delete response.survey_data;
        allData.push({ ...response, ...questionsAndAnswers[i].survey_data });
    }
    return allData;
}

function mapQuestionWithAnswersFromSurvey(data) {
    const survey = data.survey_data;
    const obj = {};
    Object.keys(survey).forEach((key) => {
        const questionAnswers = combineQuestionsWithAnswers(survey[key], data.id);
        Object.assign(obj, questionAnswers);
    });
    return { data_id: data.id, survey_data: omit(obj, ['undefined']) };
}

function aggregate(data, surveys) {
    const questionsAndAnswers = [];
    // Get questions from a survey
    for (let i = 0; i < surveys.length; i += 1) {
        questionsAndAnswers.push(mapQuestionWithAnswersFromSurvey(surveys[i]));
    }
    // Re-map response's data objects to the correct survey responses
    const allData = mapSurveyAnswersToParent(data, questionsAndAnswers);
    return allData;
}

function transformSurvey(obj, config) {
    // Extract id and survey_data object from response data object
    const data = obj.data;
    const surveyData = data.map(({ id, survey_data, survey_id }) => { return { id, survey_data, survey_id }; });
    const allData = aggregate(data, Object.keys(surveyData).map(k => surveyData[k]));
    return allData;
}

export default function transformSurveyResponse(stream, config) {
    return stream.map(obj => transformSurvey(obj, config));
}
