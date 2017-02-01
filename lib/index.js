import { Activity, singleS3StreamInput, singleS3StreamOutput } from 'aries-data';
import map from 'through2-map';

export default class SurveygizmoTransform extends Activity {

    static props = {
        name: require('../package.json').name,
        version: require('../package.json').version
    };

    @singleS3StreamInput('json')
    @singleS3StreamOutput('json')
    async onTask(activityTask, config, lastExecuted) {
        return _(this.transformObject(activityTask.input.file));
    }

    transformObject(stream) {
        return stream.pipe(map.obj(::this.getResponses));
    }

    getResponses({ data }) {
        const surveyData = data.map(({ survey_data }) => { return survey_data; });
        const keys = Object.keys(surveyData);
        const surveys = keys.map((key) => {
            return surveyData[key];
        });
        const mappedAnswers = this.aggregate(surveys);
        return mappedAnswers;
    }

    aggregate(surveys) {
        let mappedAnswers = [];
        //Get questions from a survey
        for(var i = 0; i < surveys.length; i++) {
            mappedAnswers.push(this.mapQuestionWithAnswersFromSurvey(surveys[i]));
        }
        return mappedAnswers;
    }

    mapQuestionWithAnswersFromSurvey(survey) {
        const keys = Object.keys(survey);
        let obj = {};
        const questionAnswer = keys.map((key) => {
            const questionType = survey[key]["type"];
            //Questions have types. If it's a parent type, there will be additional options or subquestions to account for.
            if(questionType === 'parent') {
                const options = survey[key]["options"];
                const subQuestions = survey[key]["subquestions"];
                if(options){
                    const extractedOptions = this.stripKeys(options);
                    for(var i = 0; i < extractedOptions.length; i++){
                        Object.assign(obj, { [survey[key]["question"] + "_" + extractedOptions[i].option]: extractedOptions[i].answer ? extractedOptions[i].answer: null });
                    }
                } else if(subQuestions) {
                    const extractedSubquestions = this.stripKeys(subQuestions);
                    for(var i = 0; i < extractedSubquestions.length; i++){
                        Object.assign(obj, { [survey[key]["question"] + "_" + extractedSubquestions[i].question]: extractedSubquestions[i].answer ? extractedSubquestions[i].answer: null });
                    }
                }
            } else {
                Object.assign(obj, { [survey[key]["question"]]: survey[key]["answer"] ? survey[key]["answer"]: null });
                return;
            }
        });
        return obj;
    }

    stripKeys(array) {
      const keys = Object.keys(array);
      const questions = keys.map((key) => {
          return array[key];
      });
      return questions;
    }
}
