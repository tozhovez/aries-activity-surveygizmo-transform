# Configuration
There are two configuration properties for this activity: `method` and `option`. Each method has an option that
tells the activity how to manipulate the data that is passed into it.
## Methods
### `transformSurveyResponse`
#### Response
This method  will transform the following response.
```
{
  "result_ok": true,
  "total_count": "8",
  "page": 1,
  "total_pages": 1,
  "results_per_page": 50,
  "data": [
    {
      "id": "1",
      "contact_id": "",
      "status": "Complete",
      "is_test_data": "0",
      "date_submitted": "2013-08-23 08:02:54 EDT",
      "session_id": "1377259326_52174f3eb6f177.78996118",
      "language": "English",
      "date_started": "2013-08-23 08:02:06 EDT",
      "link_id": "1097190",
      "url_variables": {
        "_privatedomain": "t",
        "__pathdata": ""
      },
      "ip_address": "67.224.93.122",
      "referer": null,
      "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8) AppleWebKit/536.25 (KHTML, like Gecko) Version/6.0 Safari/536.25",
      "response_time": null,
      "data_quality": [],
      "longitude": "-79.416702",
      "latitude": "43.666698",
      "country": "Canada",
      "city": "Toronto",
      "region": "ON",
      "postal": "",
      "dma": "0",
      "survey_data": {
        "2": {
          "id": 2,
          "type": "RADIO",
          "question": "Have you tried the Crest 3D Whitestrips Express product in your Beyond the Rack order? (select one)",
          "section_id": 1,
          "answer": "Yes",
          "answer_id": 10001,
          "shown": true
        },
        "4": {
          "id": 4,
          "type": "RADIO",
          "question": "Why have you not tried the Crest 3D Whitestrips Express? (Select one)",
          "section_id": 1,
          "shown": false
        }
      }
    }
  ]
}
```
#### Method Options
`responses` - This option will transform the response into an array of survey responses which are located in the `survey_data` array.

`metadata` - This option will transform the response by dropping all survey data and returning only the remaining properties of the objects contained in the `data` array.
