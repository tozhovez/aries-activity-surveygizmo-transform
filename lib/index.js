import { Activity, singleS3StreamInput, singleS3StreamOutput } from 'aries-data';
import map from 'through2-map';

export default class SurveygizmoTransform extends Activity {

    static props = {
        name: require('../package.json').name,
        version: require('../package.json').version
    };

    @singleS3StreamInput()
    @singleS3StreamOutput()
    async onTask(activityTask, config, lastExecuted) {
        return _(this.transformObject(activityTask.input.file));
    }

    transformObject(stream) {
        return stream.pipe(map.obj(::this.getResponses));
    }

    getResponses(obj) {
        console.log(obj.toString());
    }
}
