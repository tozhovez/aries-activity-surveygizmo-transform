import { assert } from 'chai';
import _ from 'highland';
import fs from 'fs';
import SurveygizmoTransform from '../lib/index.js';

describe('SurveygizmoTransform', function() {

  const stream = _(fs.createReadStream('./test/fixtures/incoming.json'));

  it('', function(done) {
      const transform = new SurveygizmoTransform();
      transform.transformObject(stream);
      done();
  });
});
