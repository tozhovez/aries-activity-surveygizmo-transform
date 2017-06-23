
# Configuration
There are two configuration properties for this activity: `method` and `option`. Each method has an option that
tells the activity how to manipulate the data that is passed into it.

The following is an example configuration:
```
"config" : {
        "option" : "surveydata",
        "method" : "transformSurveyResponse"
        }
```
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

### `transformSurveyQuestion`
#### Response
This method will transform the following response.
```
{
  "result_ok": true,
  "total_count": 17,
  "page": 1,
  "total_pages": 1,
  "results_per_page": 17,
  "data": [
    {
      "id": 2,
      "base_type": "Question",
      "type": "RADIO",
      "title": {
        "English": "Have you tried the Crest 3D Whitestrips Express product in your Beyond the Rack order? (select one)"
      },
      "shortname": "",
      "varname": [
        ""
      ],
      "description": [],
      "has_showhide_deps": true,
      "comment": false,
      "properties": {
        "option_sort": false,
        "required": true,
        "hidden": false,
        "orientation": "VERT",
        "labels_right": true,
        "map_key": "radio",
        "show_title": false,
        "question_description": {
          "English": ""
        },
        "question_description_above": false,
        "soft-required": false,
        "disabled": false,
        "messages": {
          "inputmask": [],
          "r_extreme_label": [],
          "l_extreme_label": [],
          "center_label": [],
          "right_label": [],
          "left_label": []
        },
        "hide_after_response": false,
        "custom_css": "",
        "break_after": false,
        "url": "http://"
      },
      "options": [
        {
          "id": 10001,
          "title": {
            "English": "Yes"
          },
          "value": "Yes",
          "properties": {
            "disabled": false
          }
        },
        {
          "id": 10002,
          "title": {
            "English": "No"
          },
          "value": "No",
          "properties": {
            "disabled": false,
            "show_rules": null,
            "show_rules_logic_map": ":51eea6ed9ce60,51eea6ed9d24a,51eea6ed9d24a",
            "dependent": "4"
          }
        }
      ]
    }
  ]
}
```
#### Method Options
`questions` - This option will transform the response by stripping the data of only question information.

`answers` - This option will transform the response by stripping the data of only possible answer values.

![alt text](/img/logo.png "Aries Inegration for Survey Gizmo")

[![CircleCI](https://circleci.com/gh/aries-data/aries-activity-surveygizmo-transform.svg?style=svg)](https://circleci.com/gh/aries-data/aries-activity-surveygizmo-transform)
