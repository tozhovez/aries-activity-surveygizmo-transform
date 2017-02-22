import map from 'through2-map';
import omit from 'lodash.omit';
export default function transformSurveyResponse(stream, config) {
    return stream.map((obj) => { return getResponses(obj, config) });
}

function getResponses(obj, config) {
    //Extract id and survey_data object from response data obbect
    console.log(JSON.stringify(obj));
    const data = obj.data;
    const surveyData = data.map(({ id, survey_data }) => { return { id, survey_data }; });
    const allData = aggregate(data, Object.keys(surveyData).map((key) => { return surveyData[key] }), config.headerType);
    return allData;
}

function aggregate(data, surveys, headerType) {
    let questionsAndAnswers = [];
    //Get questions from a survey
    for(let i = 0; i < surveys.length; i++) {
        questionsAndAnswers.push(mapQuestionWithAnswersFromSurvey(surveys[i], headerType));
    }
    //Re-map response's data objects to the correct survey responses
    const allData = mapSurveyAnswersToParent(data, questionsAndAnswers);
    return allData;
}

function mapQuestionWithAnswersFromSurvey({ id, survey_data }, headerType) {
    const survey = survey_data;
    const keys = Object.keys(survey);
    let obj = {};
    Object.keys(survey).forEach((key) => {
        if(headerType === 'question') {
            const questionAnswers = setHeaderWithQuestion(survey, key);
            Object.assign(obj, questionAnswers);
        } else if (headerType === 'qid') {
            const questionAnswers = setHeaderWithQuestionId(survey, key);
            Object.assign(obj, questionAnswers);
        }
    });
    return { "data_id": id, "survey_data": omit(obj, ['undefined']) };
}

function setHeaderWithQuestion(survey, key) {
    let obj = {};
    const questionType = survey[key]["type"];
    //Questions have types. If it's a parent type, there will be additional options or subquestions to account for.
    if(questionType === 'parent') {
        //The additional data that the response might contain if it's question is of type 'parent'.
        const options = survey[key]["options"];
        const subQuestions = survey[key]["subquestions"];
        if(options){
            const extractedOptions = stripKeys(options);
            for(let i = 0; i < extractedOptions.length; i++){
                const question = getQuestion(survey[key]['question'], extractedOptions[i].option);
                Object.assign(obj, { [question]: extractedOptions[i].answer ? extractedOptions[i].answer: null });
            }
        } else if(subQuestions) {
            const extractedSubquestions = stripKeys(subQuestions);
            for(let i = 0; i < extractedSubquestions.length; i++){
                const question = getQuestion(survey[key]['question'], extractedSubquestions[i].question)
                Object.assign(obj, { [question]: extractedSubquestions[i].answer ? extractedSubquestions[i].answer: null });
            }
        }
    } else {
        const question = getQuestion(survey[key]['question'], null);
        Object.assign(obj, { [question]: survey[key]["answer"] ? survey[key]["answer"]: null });
        return;
    }
    return obj;
}

function setHeaderWithQuestionId(survey, key) {
    let obj = {};
    const questionType = survey[key]["type"];
    //Questions have types. If it's a parent type, there will be additional options or subquestions to account for.
    if(questionType === 'parent') {
        //The additional data that the response might contain if it's question is of type 'parent'.
        const options = survey[key]["options"];
        const subQuestions = survey[key]["subquestions"];
        if(options){
            const extractedOptions = stripKeys(options);
            for(let i = 0; i < extractedOptions.length; i++){
                Object.assign(obj, { ['qid_' + survey[key]['id']]: extractedOptions[i].answer ? extractedOptions[i].answer: null });
            }
        } else if(subQuestions) {
            const extractedSubquestions = stripKeys(subQuestions);
            for(let i = 0; i < extractedSubquestions.length; i++){
                Object.assign(obj, { ['qid_' + survey[key]['id']]: extractedSubquestions[i].answer ? extractedSubquestions[i].answer: null });
            }
        }
    } else {
        Object.assign(obj, { ['qid_' + survey[key]['id']]: survey[key]["answer"] ? survey[key]["answer"]: null });
        return;
    }
    return obj;
}

function getQuestion(base, sub) {
    if (base.length > 125 && sub) {
        return base.substring(0, 125 - sub.substring(0, 125).length) + '_' + sub.substring(0, 126);
    } else if (base.length > 125){
        return base.substring(0, 126);
    }
}

function mapSurveyAnswersToParent(data, questionsAndAnswers) {
    let allData = [];
    for(let i = 0; i < questionsAndAnswers.length; i++) {
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

function stripKeys(array) {
    const keys = Object.keys(array);
    const questions = keys.map((key) => {
        return array[key];
    });
    return questions;
}
