import map from 'through2-map';
export default function transformSurveyQuestion(stream, config) {
    return stream.map((obj) => {
        return transformSurveyQuestionResponse(obj, config);
    })

}

function transformSurveyQuestionResponse(obj, config) {
    const data = obj.data;
    let mappedData = [];
    if(config.option === 'getQuestions'){
        data.forEach((surveyQuestion) => {
            mappedData.push(getQuestions(surveyQuestion));
        });
    } else if (config.option === 'getAnswers') {
        data.forEach((surveyQuestion) => {
            const answerData = getAnswers(surveyQuestion);
            if(answerData !== undefined)
                mappedData.push(answerData);
        });
    }
    return mappedData;
}

function getQuestions(surveyQuestion) {
    return { survey_id: surveyQuestion.survey_id, id: surveyQuestion.id, base_type: surveyQuestion.base_type, type: surveyQuestion.type, title: surveyQuestion.title.English };
}

function getAnswers(surveyQuestion) {
    let mappedData = [];
    if(surveyQuestion.options.length > 0){
        surveyQuestion.options.forEach((option) => {
            console.log(`Survey ID: ${surveyQuestion.survey_id}`);
            mappedData.push({ survey_id: surveyQuestion.survey_id, id: surveyQuestion.id, option_id: option.id, option_title: option.title.English, option_value: option.value });
        });
    }
    if(mappedData.length > 0) {
        return mappedData;
    }
}
