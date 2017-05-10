import { assert } from 'chai';
import _ from 'highland';
import fs from 'fs';
import responseConfig from '../test/response-test-config.js';
import metadataConfig from '../test/metadata-test-config.js';
import transformSurveyResponse from '../lib/transforms/transformsurveyresponse.js';

const surveyResponsePath = 'test/fixtures/test-data.json';

describe('transformSurveyResponse', function() {

    let inStream;

    beforeEach(function(done) {
        inStream = _(fs.createReadStream(surveyResponsePath)).split().map(JSON.parse).errors(err => {});
        done();
    });

    it('should transform survey responses', (done) => {
        const allData = transformSurveyResponse(inStream, responseConfig);

        allData.each((outData) => {
            inStream.observe().each((inData) => {
                assert.equal(outData.length, inData.data.length, 'should have the same number of incoming and outgoing responses');
            });
        });
        allData.on('end', done);
    });

    it('should not have numbers, hyphens, or underscores to begin title', (done) => {
        const allData = transformSurveyResponse(inStream, metadataConfig);
        allData.each((outData) => {
            const outTitle = outData[0].survey_title;
            assert(isNaN(outTitle.charAt(0)), 'title should not begin with a title');
            assert(outTitle.charAt(0) !== ' ', 'title should not begin with a space');
            assert(outTitle.charAt(0) !== '-', 'title should not begin with a hyphen');
            assert(outTitle.charAt(0) !== '_', 'title should not begin with an underscore');
        });
        allData.on('end', done);
    });
});
