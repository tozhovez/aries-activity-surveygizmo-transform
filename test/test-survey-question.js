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

    it('should transform survey questions', (done) => {
        const allData = transformSurveyQuestion(inStream, config);
        const ws = fs.createWriteStream('question-output.txt');
        allData.pipe(ws);
        allData.on('end', done);
    });
});
