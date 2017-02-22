import { Activity, singleS3StreamInput, singleS3StreamOutput, createLogger } from 'aries-data';
import map from 'through2-map';
import _ from 'highland';
import omit from 'lodash.omit';
import * as transforms from './transforms';
const log = createLogger(__filename);

export default class SurveygizmoTransform extends Activity {

    @singleS3StreamInput('json')
    @singleS3StreamOutput('json')
    async onTask(activityTask, config, lastExecuted) {
        return _(transforms[config.method](activityTask.input.file, config)).flatten();
    }

}
