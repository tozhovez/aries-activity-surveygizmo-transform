import { assert } from 'chai';
import _ from 'highland';
import fs from 'fs';
import response from '../test/fixtures/test-data.json';
import SurveygizmoTransform from '../lib/index.js';

describe('SurveygizmoTransform', function() {

  it('should contain same amount of incoming surveys', function() {
      const transform = new SurveygizmoTransform();
      const allData = transform.getResponses(response);
      assert.equal(allData.length, response.data.length);
  });
});
