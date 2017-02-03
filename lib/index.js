import { Activity, singleS3StreamInput, singleS3StreamOutput, createLogger } from 'aries-data';
import map from 'through2-map';
import _ from 'highland';
import omit from 'lodash.omit';
const log = createLogger(__filename);

export default class SurveygizmoTransform extends Activity {

    @singleS3StreamInput('json')
    @singleS3StreamOutput('json')
    async onTask(activityTask, config, lastExecuted) {
        return _(activityTask.input.file.map(::this.getResponses)).flatten();
    }

    getResponses(obj) {
        //Extract id and survey_data object from response data obbect
        const data = obj.data;
        console.log(`Data: ${data}`);
        const surveyData = data.map(({ id, survey_data }) => { return { id, survey_data }; });
        const surveys = this.stripKeys(surveyData);
        const allData = this.aggregate(data, surveys);
        return allData;
    }

    aggregate(data, surveys) {
        let questionsAndAnswers = [];
        //Get questions from a survey
        for(let i = 0; i < surveys.length; i++) {
            questionsAndAnswers.push(this.mapQuestionWithAnswersFromSurvey(surveys[i]));
        }
        //Re-map response's data objects to the correct survey responses
        const allData = this.mapSurveyAnswersToParent(data, questionsAndAnswers);
        return allData;
    }

    mapQuestionWithAnswersFromSurvey({ id, survey_data }) {
        const survey = survey_data;
        const keys = Object.keys(survey);
        let obj = {};
        Object.keys(survey).forEach((key) => {
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
        });
        return { "data_id": id, "survey_data": omit(obj, ['undefined']) };
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

    //Removes keys from an array and returns.
    stripKeys(array) {
        const keys = Object.keys(array);
        const questions = keys.map((key) => {
            return array[key];
        });
        return questions;
    }
}
