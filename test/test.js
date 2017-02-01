import { assert } from 'chai';
import _ from 'highland';
import fs from 'fs';
import response from '../test/fixtures/test-data.json';
import SurveygizmoTransform from '../lib/index.js';

describe('SurveygizmoTransform', function() {

  it('', function(done) {
      const transform = new SurveygizmoTransform();
      transform.getResponses(response);
      done();
  });
});
