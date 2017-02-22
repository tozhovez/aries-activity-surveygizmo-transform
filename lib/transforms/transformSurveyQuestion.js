import map from 'through2-map';

export default function transformSurveyQuestion(stream, config) {
    return stream.map((obj) => { return getSurveyQuestions(obj, config) });
}

function getSurveyQuestions(data, config) {

}
