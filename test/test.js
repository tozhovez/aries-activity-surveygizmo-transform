import { assert } from 'chai';
import _ from 'highland';
import fs from 'fs';
import config from '../test/test-config.js';
import transformSurveyQuestion from '../lib/transforms/transformSurveyQuestion.js';
import transformSurveyResponse from '../lib/transforms/transformSurveyResponse.js';

const surveyResponsePath = 'test/fixtures/test-data.json';
const surveyQuestionPath = 'test/fixtures/survey-question.json';

describe('SurveygizmoTransform', function() {

    let inStream;

    beforeEach(function(done) {
        inStream = _(fs.createReadStream(surveyQuestionPath)).split().map(JSON.parse).errors(err => {});
        done();
    });

    it('should transform survey question responses', (done) => {
        const allData = transformSurveyQuestion(inStream, config);
        allData.on('data', (chunk) => {
        //    console.log(chunk)
        });
        allData.on('end', done);
    });
});
