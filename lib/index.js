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
        const surveys = data.map(({ survey_data }) => { return survey_data; });
        const mappedAnswers = this.mapQuestionWithAnswers(surveys);
    }

    mapQuestionWithAnswers(surveys) {
        let obj = {};
        //Get keys from a survery since they're all the same
        const survey = surveys[0];
        const questions = this.extractQuestions(survey);
        const answers = this.extractAnswers(surveys, questions);
        console.log(questions);

        return {

        }
    }

    extractQuestions(survey) {
        const keys = Object.keys(survey);
        const questions = keys.map((key) => {
            const rawQuestion = survey[key]["question"];
            return rawQuestion.replace(/<\/?[^>]+(>|$)/g, "");
        });
        return questions;
    }

    extractAnswers(surveys, questions) {

    }
}
