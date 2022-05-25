/**
 * @jest-environment jsdom
 */
import React from 'react';
import ExtraQuestionsForm from '..';
import Enzyme from 'enzyme';
import { mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Input from '../../inputs/text-input';
import Dropdown from '../../inputs/dropdown';

Enzyme.configure({adapter: new Adapter()});

const questions = [
    {
        "id": 93,
        "created": 1651846020,
        "last_edited": 1651846020,
        "name": "delivery_method",
        "type": "ComboBox",
        "label": "<p>Choose a ticket Delivery Method</p>",
        "placeholder": null,
        "order": 1,
        "mandatory": false,
        "max_selected_values": 0,
        "class": "MainQuestion",
        "usage": "Ticket",
        "printable": false,
        "summit_id": 13,
        "sub_question_rules": [{
            "id": 2,
            "created": 1651846938,
            "last_edited": 1651846938,
            "visibility": "Visible",
            "visibility_condition": "Equal",
            "answer_values": ["161"],
            "answer_values_operator": "And",
            "parent_question_id": 93,
            "sub_question": {
                "id": 94,
                "created": 1651846810,
                "last_edited": 1651846810,
                "name": "pickup_point",
                "type": "RadioButtonList",
                "label": "<p>Pick up Point</p>",
                "placeholder": null,
                "order": 2,
                "mandatory": true,
                "max_selected_values": 0,
                "class": "SubQuestion",
                "usage": "Ticket",
                "printable": false,
                "summit_id": 13,
                "sub_question_rules": [{
                    "id": 3,
                    "created": 1651846964,
                    "last_edited": 1651846964,
                    "visibility": "Visible",
                    "visibility_condition": "Equal",
                    "answer_values": ["164"],
                    "answer_values_operator": "And",
                    "parent_question_id": 94,
                    "sub_question": {
                        "id": 95,
                        "created": 1651846909,
                        "last_edited": 1651846909,
                        "name": "other_pickup_point",
                        "type": "Text",
                        "label": "<p>Which ?</p>",
                        "placeholder": "Let us know the pickup point if not listed",
                        "order": 3,
                        "mandatory": false,
                        "max_selected_values": 0,
                        "class": "SubQuestion",
                        "usage": "Ticket",
                        "printable": false,
                        "summit_id": 13,
                        "parent_rules": [3]
                    }
                }],
                "values": [{
                    "id": 162,
                    "created": 1651846836,
                    "last_edited": 1651846836,
                    "label": "DownTown",
                    "value": "downtown",
                    "order": 1,
                    "question_id": 94
                }, {
                    "id": 163,
                    "created": 1651846843,
                    "last_edited": 1651846843,
                    "label": "Congress Center",
                    "value": "congress",
                    "order": 2,
                    "question_id": 94
                }, {
                    "id": 164,
                    "created": 1651846867,
                    "last_edited": 1651846867,
                    "label": "Other",
                    "value": "Other",
                    "order": 3,
                    "question_id": 94
                }],
                "parent_rules": [2]
            }
        }],
        "values": [{
            "id": 160,
            "created": 1651846654,
            "last_edited": 1651846654,
            "label": "Delivery",
            "value": "delivery",
            "order": 1,
            "question_id": 93
        }, {
            "id": 161,
            "created": 1651846666,
            "last_edited": 1651846666,
            "label": "Pick up",
            "value": "pickup",
            "order": 2,
            "question_id": 93
        }],
        "parent_rules": []
    },
    {"id": 96,
        "created": 1651847337,
        "last_edited": 1651847337,
        "name": "industry_market_segment",
        "type": "RadioButtonList",
        "label": "<p>Industry Market Segment</p>",
        "placeholder": null,
        "order": 4,
        "mandatory": true,
        "max_selected_values": 0,
        "class": "MainQuestion",
        "usage": "Ticket",
        "printable": false,
        "summit_id": 13,
        "sub_question_rules": [{
            "id": 6,
            "created": 1651847885,
            "last_edited": 1651847885,
            "visibility": "Visible",
            "visibility_condition": "Equal",
            "answer_values": ["171"],
            "answer_values_operator": "And",
            "parent_question_id": 96,
            "sub_question": {
                "id": 97,
                "created": 1651847510,
                "last_edited": 1651847510,
                "name": "other_industry_market_segment",
                "type": "Text",
                "label": "<p>Other</p>",
                "placeholder": "Other Industry Market Segment",
                "order": 5,
                "mandatory": true,
                "max_selected_values": 0,
                "class": "SubQuestion",
                "usage": "Ticket",
                "printable": false,
                "summit_id": 13,
                "parent_rules": [6]
            }
        }, {
            "id": 4,
            "created": 1651847684,
            "last_edited": 1651847684,
            "visibility": "Visible",
            "visibility_condition": "Equal",
            "answer_values": ["165"],
            "answer_values_operator": "And",
            "parent_question_id": 96,
            "sub_question": {
                "id": 98,
                "created": 1651847553,
                "last_edited": 1651847553,
                "name": "cloud_service_provider_market_sub_segment",
                "type": "CheckBoxList",
                "label": "<p>If Cloud Service Provider is selected, provide the following Industry Market Sub-segment options (select all that apply):</p>",
                "placeholder": null,
                "order": 6,
                "mandatory": true,
                "max_selected_values": 0,
                "class": "SubQuestion",
                "usage": "Ticket",
                "printable": false,
                "summit_id": 13,
                "sub_question_rules": [{
                    "id": 7,
                    "created": 1651847925,
                    "last_edited": 1651847925,
                    "visibility": "Visible",
                    "visibility_condition": "Equal",
                    "answer_values": ["174"],
                    "answer_values_operator": "And",
                    "parent_question_id": 98,
                    "sub_question": {
                        "id": 99,
                        "created": 1651847659,
                        "last_edited": 1651847659,
                        "name": "other_cloud_service_provider_market_sub_segment",
                        "type": "Text",
                        "label": "<p>Other Cloud Service Provider Industry Market Sub-segment </p>",
                        "placeholder": "Other Industry Market Sub-segment",
                        "order": 7,
                        "mandatory": true,
                        "max_selected_values": 0,
                        "class": "SubQuestion",
                        "usage": "Ticket",
                        "printable": false,
                        "summit_id": 13,
                        "parent_rules": [7]
                    }
                }],
                "values": [{
                    "id": 172,
                    "created": 1651847562,
                    "last_edited": 1651847562,
                    "label": "Hyperscale",
                    "value": "Hyperscale",
                    "order": 1,
                    "question_id": 98
                }, {
                    "id": 173,
                    "created": 1651847570,
                    "last_edited": 1651847570,
                    "label": "Tier-2",
                    "value": "Tier-2",
                    "order": 2,
                    "question_id": 98
                }, {
                    "id": 174,
                    "created": 1651847582,
                    "last_edited": 1651847582,
                    "label": "Other",
                    "value": "other",
                    "order": 3,
                    "question_id": 98
                }],
                "parent_rules": [4]
            }
        }],
        "values": [{
            "id": 165,
            "created": 1651847345,
            "last_edited": 1651847345,
            "label": "Cloud Service Provider",
            "value": "cloud_service_provider",
            "order": 1,
            "question_id": 96
        }, {
            "id": 166,
            "created": 1651847368,
            "last_edited": 1651847368,
            "label": "Communications Service Provider",
            "value": "communications_service_provider",
            "order": 2,
            "question_id": 96
        }, {
            "id": 167,
            "created": 1651847389,
            "last_edited": 1651847389,
            "label": "Colocation Provider",
            "value": "colocation_provider",
            "order": 3,
            "question_id": 96
        }, {
            "id": 168,
            "created": 1651847414,
            "last_edited": 1651847414,
            "label": "Government",
            "value": "government",
            "order": 4,
            "question_id": 96
        }, {
            "id": 169,
            "created": 1651847431,
            "last_edited": 1651847431,
            "label": "Non-Profit",
            "value": "non_profit",
            "order": 5,
            "question_id": 96
        }, {
            "id": 170,
            "created": 1651847450,
            "last_edited": 1651847450,
            "label": "Enterprise",
            "value": "enterprise",
            "order": 6,
            "question_id": 96
        }, {
            "id": 171,
            "created": 1651847459,
            "last_edited": 1651847459,
            "label": "Other",
            "value": "other",
            "order": 7,
            "question_id": 96
        }],
        "parent_rules": []
    }
];

const completeAnswers = [
    {
        "id": 431802,
        "created": 1651848786,
        "last_edited": 1651848786,
        "value": "161",
        "question_id": 93,
        "order_id": 0,
        "attendee_id": 131
    },
    {
        "id": 431803,
        "created": 1651848786,
        "last_edited": 1651848786,
        "value": "164",
        "question_id": 94,
        "order_id": 0,
        "attendee_id": 131
    },
    {
        "id": 431804,
        "created": 1651848786,
        "last_edited": 1651848786,
        "value": "test",
        "question_id": 95,
        "order_id": 0,
        "attendee_id": 131
    },
    {
        "id": 431805,
        "created": 1651848786,
        "last_edited": 1651848786,
        "value": "171",
        "question_id": 96,
        "order_id": 0,
        "attendee_id": 131
    },
    {
        "id": 431806,
        "created": 1651848786,
        "last_edited": 1651848786,
        "value": "test",
        "question_id": 97,
        "order_id": 0,
        "attendee_id": 131
    },
    {
        "id": 431807,
        "created": 1651848786,
        "last_edited": 1651848786,
        "value": "172,174",
        "question_id": 98,
        "order_id": 0,
        "attendee_id": 131
    },
    {
        "id": 431808,
        "created": 1651848786,
        "last_edited": 1651848786,
        "value": "test",
        "question_id": 99,
        "order_id": 0,
        "attendee_id": 131
    }
];

it('has input', () => {
    const component = mount(
        <ExtraQuestionsForm
            extraQuestions={questions}
            userAnswers={completeAnswers}
            onAnswerChanges={()=>{}}
            ref={null}
            className="extra-questions"
        />,
    );

    expect(component.find(Input).exists()).toBeTruthy();
    expect(component.find(Dropdown).exists()).toBeTruthy();
});