import { Activity, singleS3StreamInput, singleS3StreamOutput, createLogger } from 'aries-data';
import map from 'through2-map';
import _ from 'highland';
import omit from 'lodash.omit';
const log = createLogger(__filename);

export default class SurveygizmoTransform extends Activity {

    @singleS3StreamInput('json')
    @singleS3StreamOutput('json')
    async onTask(activityTask, config, lastExecuted) {
        return _(activityTask.input.file.map((obj) => { return this.getResponses(obj, config) })).flatten();
    }

    getResponses(obj, config) {
        //Extract id and survey_data object from response data obbect
        const data = obj.data;
        const surveyData = data.map(({ id, survey_data }) => { return { id, survey_data }; });
        const allData = this.aggregate(data, Object.keys(surveyData).map((key) => { return surveyData[key] }), config.headerType);
        return allData;
    }

    aggregate(data, surveys, headerType) {
        let questionsAndAnswers = [];
        //Get questions from a survey
        for(let i = 0; i < surveys.length; i++) {
            questionsAndAnswers.push(this.mapQuestionWithAnswersFromSurvey(surveys[i], headerType));
        }
        //Re-map response's data objects to the correct survey responses
        const allData = this.mapSurveyAnswersToParent(data, questionsAndAnswers);
        return allData;
    }

    mapQuestionWithAnswersFromSurvey({ id, survey_data }, headerType) {
        const survey = survey_data;
        const keys = Object.keys(survey);
        let obj = {};
        Object.keys(survey).forEach((key) => {
            if(headerType === 'question') {
                const questionAnswers = this.setHeaderWithQuestion(survey, key);
                Object.assign(obj, questionAnswers);
            } else if (headerType === 'qid') {
                const questionAnswers = this.setHeaderWithQuestionId(survey, key);
                Object.assign(obj, questionAnswers);
            }
        });
        return { "data_id": id, "survey_data": omit(obj, ['undefined']) };
    }

    setHeaderWithQuestion(survey, key) {
        let obj = {};
        const questionType = survey[key]["type"];
        //Questions have types. If it's a parent type, there will be additional options or subquestions to account for.
        if(questionType === 'parent') {
            //The additional data that the response might contain if it's question is of type 'parent'.
            const options = survey[key]["options"];
            const subQuestions = survey[key]["subquestions"];
            if(options){
                const extractedOptions = this.stripKeys(options);
                for(let i = 0; i < extractedOptions.length; i++){
                    const question = this.getQuestion(survey[key]['question'], extractedOptions[i].option);
                    Object.assign(obj, { [question]: extractedOptions[i].answer ? extractedOptions[i].answer: null });
                }
            } else if(subQuestions) {
                const extractedSubquestions = this.stripKeys(subQuestions);
                for(let i = 0; i < extractedSubquestions.length; i++){
                    const question = this.getQuestion(survey[key]['question'], extractedSubquestions[i].question)
                    Object.assign(obj, { [question]: extractedSubquestions[i].answer ? extractedSubquestions[i].answer: null });
                }
            }
        } else {
            const question = this.getQuestion(survey[key]['question'], null);
            Object.assign(obj, { [question]: survey[key]["answer"] ? survey[key]["answer"]: null });
            return;
        }
        return obj;
    }

    setHeaderWithQuestionId(survey, key) {
        let obj = {};
        const questionType = survey[key]["type"];
        //Questions have types. If it's a parent type, there will be additional options or subquestions to account for.
        if(questionType === 'parent') {
            //The additional data that the response might contain if it's question is of type 'parent'.
            const options = survey[key]["options"];
            const subQuestions = survey[key]["subquestions"];
            if(options){
                const extractedOptions = this.stripKeys(options);
                for(let i = 0; i < extractedOptions.length; i++){
                    Object.assign(obj, { ['qid_' + survey[key]['id']]: extractedOptions[i].answer ? extractedOptions[i].answer: null });
                }
            } else if(subQuestions) {
                const extractedSubquestions = this.stripKeys(subQuestions);
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

    getQuestion(base, sub) {
        if (base.length > 125 && sub) {
            return base.substring(0, 125 - sub.substring(0, 125).length) + '_' + sub.substring(0, 126);
        } else if (base.length > 125){
            return base.substring(0, 126);
        }
    }

    mapSurveyAnswersToParent(data, questionsAndAnswers) {
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

    stripKeys(array) {
        const keys = Object.keys(array);
        const questions = keys.map((key) => {
            return array[key];
        });
        return questions;
    }
}
