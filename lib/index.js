import { Activity, singleS3StreamInput, singleS3StreamOutput } from 'aries-data';
import _ from 'highland';
import isFunction from 'lodash.isfunction';
import * as transforms from './transforms';

export default class SurveygizmoTransform extends Activity {

    @singleS3StreamInput('json')
    @singleS3StreamOutput('json')
    async onTask(activityTask, config, lastExecuted) {
        let stream = null;
        console.log(config.method);
        if (config.method === 'transformSurveyResponse' || config.method === 'transformSurveyQuestion') {
            stream = _(transforms[config.method](activityTask.input.file, config)).flatten();
        }
        return stream;
    }
}
