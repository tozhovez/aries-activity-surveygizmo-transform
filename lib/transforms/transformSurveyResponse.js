import get from 'lodash.get';

function stripKeys(array) {
    const keys = Object.keys(array);
    const questions = keys.map(key => array[key]);
    return questions;
}

function stripSurveyTitle(title) {
    // replace any non-alphanumeric character with white space
    const alphanumericTitle = title.toString().replace(/[^a-z0-9]|\s+|\r?\n|\r/gmi, ' ');
    // replace all spaces with underscores
    const underscoredTitle = alphanumericTitle.replace(/ /g, '_');

    // loop through string to check if it begins with integers, underscores, or hyphens
    let index;
    for (let i = 0; i < underscoredTitle.length; i += 1) {
        const character = underscoredTitle.charAt(i);
        if (!isNaN(parseInt(character, 10)) || character === '-' || character === '_' || character === ' ') {
            index = i + 1;
        } else {
            break;
        }
    }

    // if the title begins with integers we must strip them because
    // postgres does not support table names starting with ints
    const strippedTitle = underscoredTitle.substr(index, underscoredTitle.length);
    return strippedTitle;
}

function transformSurveyTitle(survey) {
    const data = survey;
    // all survey titles are the same so we can just grab the one from the
    // first element in the array
    data.survey_title = stripSurveyTitle(data.survey_title);
    return data;
}

function combineOptions(survey, options, obj, dataId, surveyId) {
    const extractedOptions = stripKeys(options);
    for (let i = 0; i < extractedOptions.length; i += 1) {
        console.log('surveyid', survey.id);
        obj.push({
            survey_id: surveyId,
            question_id: survey.id,
            answer: get(extractedOptions, [i, 'answer'], null),
            answer_id: `${surveyId}_${survey.id}_${get(extractedOptions, [i, 'id'], null)}`,
            data_id: dataId,
            option_value: get(extractedOptions, [i, 'option'], null),
            id: `${surveyId}_${dataId}`,
        });
    }
    return obj;
}

function combineSubquestions(survey, subquestions, obj, dataId, surveyId) {
    const extractedSubquestions = stripKeys(subquestions);
    for (let i = 0; i < extractedSubquestions.length; i += 1) {
        const keys = Object.keys(extractedSubquestions[i]);
        // if the first key is equal to id, then we know we are at the
        // child most object. otherwise iterate over the keys and push
        if (keys[0] === 'id') {
            obj.push({
                survey_id: surveyId,
                question_id: survey.id,
                answer: get(extractedSubquestions, [i, 'answer'], null),
                answer_id: `${surveyId}_${survey.id}_${get(extractedSubquestions, [i, 'id'], null)}`,
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
                    answer_id: `${surveyId}_${survey.id}_${get(extractedSubquestions[i], [k, 'id'], null)}`,
                    data_id: dataId,
                    option_value: null,
                    id: `${surveyId}_${dataId}`,
                });
            });
        }
    }
    return obj;
}

function combineQuestion(survey, obj, dataId, surveyId) {
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
    return obj;
}

function combineQuestionsWithAnswers(survey, dataId, surveyId) {
    let obj = [];
    const questionType = survey.type;
    // Questions have types. If it's a parent type, there will be
    // additional options or subquestions to account for.
    if (questionType === 'parent') {
        // The additional data that the response might contain if it's question is of type 'parent'.
        const options = survey.options;
        const subquestions = survey.subquestions;
        if (options) {
            obj = combineOptions(survey, options, obj, dataId, surveyId);
        } else if (subquestions) {
            obj = combineSubquestions(survey, subquestions, obj, dataId, surveyId);
        }
    } else {
        obj = combineQuestion(survey, obj, dataId, surveyId);
    }
    return obj;
}

function transformResponseMetadata(survey) {
    const data = survey;
    delete data.survey_data;
    data.id = `${data.survey_id}_${data.id}`;
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

function aggregate(survey) {
    const questionsAndAnswers = [];
    // Get questions from a survey
    questionsAndAnswers.push(mapQuestionWithAnswersFromSurvey(survey));
    return questionsAndAnswers;
}

function transformSurvey(obj, config) {
    // Extract id and survey_data object from response data object
    const data = obj;
    let allData;
    if (config.option === 'responses') {
        const surveyData = {
            id: data.id,
            survey_data: data.survey_data,
            survey_id: data.survey_id,
        };
        allData = aggregate(surveyData);
    } else if (config.option === 'metadata') {
        const dataWithTitle = transformSurveyTitle(data);
        allData = transformResponseMetadata(dataWithTitle);
    }
    return allData;
}

export default function transformSurveyResponse(stream, config) {
    return stream.filter(obj => obj !== null).map(obj => transformSurvey(obj, config));
}
