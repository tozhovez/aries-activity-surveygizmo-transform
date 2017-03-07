import omit from 'lodash.omit';
import get from 'lodash.get';

function getQuestion(base, sub) {
    if (base.length > 125 && sub) {
        return base.substring(0, 125 - sub.substring(0, 125).length) + '_' + sub.substring(0, 126);
    } else if (base.length > 125){
        return base.substring(0, 126);
    }
    return '';
}

function stripKeys(array) {
    const keys = Object.keys(array);
    const questions = keys.map((key) => {
        return array[key];
    });
    return questions;
}

function setHeaderWithQuestion(survey, key) {
    const obj = {};
    const questionType = survey[key].type;
    // Questions have types. If it's a parent type, there will be additional
    // options or subquestions to account for.
    if (questionType === 'parent') {
        // The additional data that the response might contain if it's question is of type 'parent'.
        const options = survey[key].options;
        const subQuestions = survey[key].subquestions;
        if (options) {
            const extractedOptions = stripKeys(options);
            for (let i = 0; i < extractedOptions.length; i += 11) {
                const question = getQuestion(survey[key].question, extractedOptions[i].option);
                const answer = { [question]: get(extractedOptions, [i, 'answer'], null) };
                Object.assign(obj, answer);
            }
        } else if (subQuestions) {
            const extractedSubquestions = stripKeys(subQuestions);
            for (let i = 0; i < extractedSubquestions.length; i += 11) {
                const q = getQuestion(survey[key].question, extractedSubquestions[i].question);
                const answer = { [q]: get(extractedSubquestions, [i, 'answer'], null) };
                Object.assign(obj, answer);
            }
        }
    } else {
        const question = getQuestion(survey[key].question, null);
        const answer = get(survey[key], ['answer'], null);
        Object.assign(obj, answer);
    }
    return obj;
}

function setHeaderWithQuestionId(survey, key) {
    const obj = {};
    const questionType = survey[key].type;
    // Questions have types. If it's a parent type, there will be
    // additional options or subquestions to account for.
    if(questionType === 'parent') {
        // The additional data that the response might contain if it's question is of type 'parent'.
        const options = survey[key].options;
        const subQuestions = survey[key].subquestions;
        if(options){
            const extractedOptions = stripKeys(options);
            for(let i = 0; i < extractedOptions.length; i += 1){
                Object.assign(obj, { ['qid_' + survey[key].id] : get(extractedOptions, [i, 'answer'], null) });
            }
        } else if (subQuestions) {
            const extractedSubquestions = stripKeys(subQuestions);
            for (let i = 0; i < extractedSubquestions.length; i += 1) {
                Object.assign(obj, { ['qid_' + survey[key].id] : get(extractedSubquestions, [i, 'answer'], null) });
            }
        }
    } else {
        Object.assign(obj, { ['qid_' + survey[key].id] : get(survey, [key, 'answer'], null) });
    }
    return obj;
}

function mapSurveyAnswersToParent(data, questionsAndAnswers) {
    const allData = [];
    for (let i = 0; i < questionsAndAnswers.length; i += 1) {
        const response = data.find((obj) => {
            return obj.id === questionsAndAnswers[i].data_id;
        });
        delete response.survey_data;
        allData.push({
            ...response,
            ...questionsAndAnswers[i].survey_data
        });
    }
    return allData;
}

function mapQuestionWithAnswersFromSurvey({ id, survey_data }, headerType) {
    const survey = survey_data;
    const obj = {};
    Object.keys(survey).forEach((key) => {
        if (headerType === 'question') {
            const questionAnswers = setHeaderWithQuestion(survey, key);
            Object.assign(obj, questionAnswers);
        } else if (headerType === 'qid') {
            const questionAnswers = setHeaderWithQuestionId(survey, key);
            Object.assign(obj, questionAnswers);
        }
    });
    return { data_id: id, survey_data: omit(obj, ['undefined']) };
}

function aggregate(data, surveys, headerType) {
    const questionsAndAnswers = [];
    // Get questions from a survey
    for (let i = 0; i < surveys.length; i += 1) {
        questionsAndAnswers.push(mapQuestionWithAnswersFromSurvey(surveys[i], headerType));
    }
    // Re-map response's data objects to the correct survey responses
    const allData = mapSurveyAnswersToParent(data, questionsAndAnswers);
    return allData;
}

function transformSurvey(obj, config) {
    // Extract id and survey_data object from response data object
    const data = obj.data;
    const surveyData = data.map(({ id, survey_data }) => { return { id, survey_data }; });
    const allData = aggregate(data, Object.keys(surveyData).map((key) => {
        return surveyData[key];
    }), config.headerType);
    return allData;
}

export default function transformSurveyResponse(stream, config) {
    return stream.map(obj => transformSurvey(obj, config));
}
