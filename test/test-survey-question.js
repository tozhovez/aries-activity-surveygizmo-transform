import { assert } from 'chai';
import _ from 'highland';
import fs from 'fs';
import config from '../test/question-test-config.js';
import transformSurveyQuestion from '../lib/transforms/transformsurveyquestion.js';

const surveyQuestionPath = 'test/fixtures/survey-question.json';

describe('transformSurveyQuestion', function() {

    let inStream;

    beforeEach(function(done) {
        inStream = _(fs.createReadStream(surveyQuestionPath)).split().map(JSON.parse).errors(err => {});
        done();
    });

    it('should transform survey question responses', (done) => {
        const allData = transformSurveyQuestion(inStream, config);

        allData.each((outData) => {
            inStream.observe().each((inData) => {
                assert.equal(outData.length, inData.data.length, 'should have the same amount of incoming data as outgoing data');
            });
        });
        allData.on('end', done);
    });
});
