import { assert } from 'chai';
import _ from 'highland';
import fs from 'fs';
import config from '../test/test-config.js';
import transformSurveyResponse from '../lib/transforms/transformsurveyresponse.js';

const surveyResponsePath = 'test/fixtures/test-data.json';

describe('transformSurveyResponse', function() {

    let inStream;

    beforeEach(function(done) {
        inStream = _(fs.createReadStream(surveyResponsePath)).split().map(JSON.parse).errors(err => {});
        done();
    });

    it('should transform survey responses', (done) => {
        const allData = transformSurveyResponse(inStream, config);
        allData.on('data', (chunk) => {

        });
        allData.on('end', done);
    });
});
