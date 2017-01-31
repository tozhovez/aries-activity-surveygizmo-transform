import { Activity, singleS3StreamInput, singleS3StreamOutput } from 'aries-data';

export default class SurveygizmoTransform extends Activity {

    @singleS3StreamInput()
    @singleS3StreamOutput()
    async onTask(activityTask, config, lastExecuted) {
        throw new Error('onTask not implemented');
    }
}
