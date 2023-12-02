import QuestionsSet from '../questions-set.js'

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

const incompleteAnswers = [
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
];

const completeAnswers2 = [
    {
        "id": 431805,
        "created": 1651848786,
        "last_edited": 1651848786,
        "value": "165",
        "question_id": 96,
        "order_id": 0,
        "attendee_id": 131
    },
    {
        "id": 431807,
        "created": 1651848786,
        "last_edited": 1651848786,
        "value": "172,173",
        "question_id": 98,
        "order_id": 0,
        "attendee_id": 131
    },
];

const questions2 = [
    {
        "id": 104,
        "created": 1652986664,
        "last_edited": 1652986664,
        "name": "delivery_method",
        "type": "RadioButtonList",
        "label": "<p>How you would receive the ticket ?</p>",
        "placeholder": null,
        "order": 1,
        "mandatory": true,
        "max_selected_values": 0,
        "class": "MainQuestion",
        "usage": "Ticket",
        "printable": false,
        "summit_id": 13,
        "sub_question_rules": [
            {
                "id": 21,
                "created": 1652987046,
                "last_edited": 1652987046,
                "visibility": "Visible",
                "visibility_condition": "Equal",
                "answer_values": [
                    "181"
                ],
                "answer_values_operator": "And",
                "parent_question_id": 104,
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
                    "sub_question_rules": [
                        {
                            "id": 20,
                            "created": 1652986579,
                            "last_edited": 1652986579,
                            "visibility": "Visible",
                            "visibility_condition": "Equal",
                            "answer_values": [
                                "164"
                            ],
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
                                "parent_rules": [
                                    20
                                ]
                            }
                        }
                    ],
                    "values": [
                        {
                            "id": 162,
                            "created": 1651846836,
                            "last_edited": 1651846836,
                            "label": "DownTown",
                            "value": "downtown",
                            "order": 1,
                            "question_id": 94
                        },
                        {
                            "id": 163,
                            "created": 1651846843,
                            "last_edited": 1651846843,
                            "label": "Congress Center",
                            "value": "congress",
                            "order": 2,
                            "question_id": 94
                        },
                        {
                            "id": 164,
                            "created": 1651846867,
                            "last_edited": 1651846867,
                            "label": "Other",
                            "value": "Other",
                            "order": 3,
                            "question_id": 94
                        }
                    ],
                    "parent_rules": [
                        21
                    ]
                }
            },
            {
                "id": 24,
                "created": 1652987448,
                "last_edited": 1652987448,
                "visibility": "Visible",
                "visibility_condition": "Equal",
                "answer_values": [
                    "182"
                ],
                "answer_values_operator": "And",
                "parent_question_id": 104,
                "sub_question": {
                    "id": 105,
                    "created": 1652986750,
                    "last_edited": 1652986750,
                    "name": "delive_method_delivery",
                    "type": "RadioButtonList",
                    "label": "<p>Choose Your Delivery Method</p>",
                    "placeholder": null,
                    "order": 4,
                    "mandatory": true,
                    "max_selected_values": 0,
                    "class": "SubQuestion",
                    "usage": "Ticket",
                    "printable": false,
                    "summit_id": 13,
                    "sub_question_rules": [
                        {
                            "id": 22,
                            "created": 1652987148,
                            "last_edited": 1652987148,
                            "visibility": "Visible",
                            "visibility_condition": "Equal",
                            "answer_values": [
                                "183"
                            ],
                            "answer_values_operator": "And",
                            "parent_question_id": 105,
                            "sub_question": {
                                "id": 106,
                                "created": 1652987124,
                                "last_edited": 1652987124,
                                "name": "delive_method_delivery_mail",
                                "type": "Text",
                                "label": "<p>Your Address</p>",
                                "placeholder": "Address",
                                "order": 5,
                                "mandatory": true,
                                "max_selected_values": 0,
                                "class": "SubQuestion",
                                "usage": "Ticket",
                                "printable": false,
                                "summit_id": 13,
                                "parent_rules": [
                                    22
                                ]
                            }
                        },
                        {
                            "id": 25,
                            "created": 1652987532,
                            "last_edited": 1652987532,
                            "visibility": "Visible",
                            "visibility_condition": "Equal",
                            "answer_values": [
                                "184"
                            ],
                            "answer_values_operator": "And",
                            "parent_question_id": 105,
                            "sub_question": {
                                "id": 107,
                                "created": 1652987228,
                                "last_edited": 1652987228,
                                "name": "delive_method_delivery_transport",
                                "type": "RadioButtonList",
                                "label": "<p>Which Transport ?</p>",
                                "placeholder": null,
                                "order": 6,
                                "mandatory": true,
                                "max_selected_values": 0,
                                "class": "SubQuestion",
                                "usage": "Ticket",
                                "printable": false,
                                "summit_id": 13,
                                "sub_question_rules": [
                                    {
                                        "id": 23,
                                        "created": 1652987304,
                                        "last_edited": 1652987304,
                                        "visibility": "Visible",
                                        "visibility_condition": "Equal",
                                        "answer_values": [
                                            "188"
                                        ],
                                        "answer_values_operator": "And",
                                        "parent_question_id": 107,
                                        "sub_question": {
                                            "id": 108,
                                            "created": 1652987283,
                                            "last_edited": 1652987283,
                                            "name": "delive_method_delivery_transport_other",
                                            "type": "Text",
                                            "label": "<p>Other Transport</p>",
                                            "placeholder": "Other",
                                            "order": 7,
                                            "mandatory": true,
                                            "max_selected_values": 0,
                                            "class": "SubQuestion",
                                            "usage": "Ticket",
                                            "printable": false,
                                            "summit_id": 13,
                                            "parent_rules": [
                                                23
                                            ]
                                        }
                                    }
                                ],
                                "values": [
                                    {
                                        "id": 185,
                                        "created": 1652987235,
                                        "last_edited": 1652987235,
                                        "label": "DHL",
                                        "value": "DHL",
                                        "order": 1,
                                        "question_id": 107
                                    },
                                    {
                                        "id": 186,
                                        "created": 1652987242,
                                        "last_edited": 1652987242,
                                        "label": "Bike",
                                        "value": "Bike",
                                        "order": 2,
                                        "question_id": 107
                                    },
                                    {
                                        "id": 187,
                                        "created": 1652987246,
                                        "last_edited": 1652987246,
                                        "label": "Car",
                                        "value": "Car",
                                        "order": 3,
                                        "question_id": 107
                                    },
                                    {
                                        "id": 188,
                                        "created": 1652987251,
                                        "last_edited": 1652987251,
                                        "label": "Other",
                                        "value": "Other",
                                        "order": 4,
                                        "question_id": 107
                                    }
                                ],
                                "parent_rules": [
                                    25
                                ]
                            }
                        }
                    ],
                    "values": [
                        {
                            "id": 183,
                            "created": 1652986760,
                            "last_edited": 1652986760,
                            "label": "Mail",
                            "value": "Mail",
                            "order": 1,
                            "question_id": 105
                        },
                        {
                            "id": 184,
                            "created": 1652986972,
                            "last_edited": 1652986972,
                            "label": "Transport",
                            "value": "TrasportMethod",
                            "order": 2,
                            "question_id": 105
                        }
                    ],
                    "parent_rules": [
                        24
                    ]
                }
            }
        ],
        "values": [
            {
                "id": 181,
                "created": 1652986681,
                "last_edited": 1652986681,
                "label": "Pick Up",
                "value": "PickUp",
                "order": 1,
                "question_id": 104
            },
            {
                "id": 182,
                "created": 1652986711,
                "last_edited": 1652986711,
                "label": "Delivery",
                "value": "Delivery",
                "order": 2,
                "question_id": 104
            }
        ],
        "parent_rules": []
    },
    {
        "id": 96,
        "created": 1651847337,
        "last_edited": 1651847337,
        "name": "industry_market_segment",
        "type": "RadioButtonList",
        "label": "<p>Industry Market Segment</p>",
        "placeholder": null,
        "order": 8,
        "mandatory": true,
        "max_selected_values": 0,
        "class": "MainQuestion",
        "usage": "Ticket",
        "printable": false,
        "summit_id": 13,
        "sub_question_rules": [
            {
                "id": 6,
                "created": 1651847885,
                "last_edited": 1651847885,
                "visibility": "Visible",
                "visibility_condition": "Equal",
                "answer_values": [
                    "171"
                ],
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
                    "order": 9,
                    "mandatory": true,
                    "max_selected_values": 0,
                    "class": "SubQuestion",
                    "usage": "Ticket",
                    "printable": false,
                    "summit_id": 13,
                    "parent_rules": [
                        6
                    ]
                }
            },
            {
                "id": 4,
                "created": 1651847684,
                "last_edited": 1651847684,
                "visibility": "Visible",
                "visibility_condition": "Equal",
                "answer_values": [
                    "165"
                ],
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
                    "order": 10,
                    "mandatory": true,
                    "max_selected_values": 0,
                    "class": "SubQuestion",
                    "usage": "Ticket",
                    "printable": false,
                    "summit_id": 13,
                    "sub_question_rules": [
                        {
                            "id": 15,
                            "created": 1652742856,
                            "last_edited": 1652742856,
                            "visibility": "Visible",
                            "visibility_condition": "Equal",
                            "answer_values": [
                                "174"
                            ],
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
                                "order": 11,
                                "mandatory": true,
                                "max_selected_values": 0,
                                "class": "SubQuestion",
                                "usage": "Ticket",
                                "printable": false,
                                "summit_id": 13,
                                "parent_rules": [
                                    15
                                ]
                            }
                        }
                    ],
                    "values": [
                        {
                            "id": 172,
                            "created": 1651847562,
                            "last_edited": 1651847562,
                            "label": "Hyperscale",
                            "value": "Hyperscale",
                            "order": 1,
                            "question_id": 98
                        },
                        {
                            "id": 173,
                            "created": 1651847570,
                            "last_edited": 1651847570,
                            "label": "Tier-2",
                            "value": "Tier-2",
                            "order": 2,
                            "question_id": 98
                        },
                        {
                            "id": 174,
                            "created": 1651847582,
                            "last_edited": 1651847582,
                            "label": "Other",
                            "value": "other",
                            "order": 3,
                            "question_id": 98
                        }
                    ],
                    "parent_rules": [
                        4
                    ]
                }
            }
        ],
        "values": [
            {
                "id": 165,
                "created": 1651847345,
                "last_edited": 1651847345,
                "label": "Cloud Service Provider",
                "value": "cloud_service_provider",
                "order": 1,
                "question_id": 96
            },
            {
                "id": 166,
                "created": 1651847368,
                "last_edited": 1651847368,
                "label": "Communications Service Provider",
                "value": "communications_service_provider",
                "order": 2,
                "question_id": 96
            },
            {
                "id": 167,
                "created": 1651847389,
                "last_edited": 1651847389,
                "label": "Colocation Provider",
                "value": "colocation_provider",
                "order": 3,
                "question_id": 96
            },
            {
                "id": 168,
                "created": 1651847414,
                "last_edited": 1651847414,
                "label": "Government",
                "value": "government",
                "order": 4,
                "question_id": 96
            },
            {
                "id": 169,
                "created": 1651847431,
                "last_edited": 1651847431,
                "label": "Non-Profit",
                "value": "non_profit",
                "order": 5,
                "question_id": 96
            },
            {
                "id": 170,
                "created": 1651847450,
                "last_edited": 1651847450,
                "label": "Enterprise",
                "value": "enterprise",
                "order": 6,
                "question_id": 96
            },
            {
                "id": 171,
                "created": 1651847459,
                "last_edited": 1651847459,
                "label": "Other",
                "value": "other",
                "order": 7,
                "question_id": 96
            }
        ],
        "parent_rules": []
    },
    {
        "id": 100,
        "created": 1652901873,
        "last_edited": 1652901873,
        "name": "tacos",
        "type": "RadioButtonList",
        "label": "<p>What do you want on your tacos?</p>",
        "placeholder": null,
        "order": 12,
        "mandatory": false,
        "max_selected_values": 0,
        "class": "MainQuestion",
        "usage": "Ticket",
        "printable": false,
        "summit_id": 13,
        "sub_question_rules": [
            {
                "id": 16,
                "created": 1652902228,
                "last_edited": 1652902228,
                "visibility": "Visible",
                "visibility_condition": "Equal",
                "answer_values": [
                    "177"
                ],
                "answer_values_operator": "And",
                "parent_question_id": 100,
                "sub_question": {
                    "id": 101,
                    "created": 1652902172,
                    "last_edited": 1652902172,
                    "name": "OtraIngrediente",
                    "type": "Text",
                    "label": "<p>What would you like instead?</p>",
                    "placeholder": "tasty addition",
                    "order": 13,
                    "mandatory": false,
                    "max_selected_values": 0,
                    "class": "SubQuestion",
                    "usage": "Ticket",
                    "printable": false,
                    "summit_id": 13,
                    "parent_rules": [
                        16
                    ]
                }
            },
            {
                "id": 17,
                "created": 1652910970,
                "last_edited": 1652910970,
                "visibility": "Visible",
                "visibility_condition": "Equal",
                "answer_values": [
                    "175"
                ],
                "answer_values_operator": "And",
                "parent_question_id": 100,
                "sub_question": {
                    "id": 102,
                    "created": 1652910392,
                    "last_edited": 1652910392,
                    "name": "vegetarianStatus",
                    "type": "RadioButtonList",
                    "label": "<p>Set your vegetarian status here:</p>",
                    "placeholder": null,
                    "order": 14,
                    "mandatory": false,
                    "max_selected_values": 0,
                    "class": "SubQuestion",
                    "usage": "Ticket",
                    "printable": false,
                    "summit_id": 13,
                    "sub_question_rules": [],
                    "values": [
                        {
                            "id": 178,
                            "created": 1652910403,
                            "last_edited": 1652910403,
                            "label": "Vegan",
                            "value": "Vegan",
                            "order": 1,
                            "question_id": 102
                        },
                        {
                            "id": 179,
                            "created": 1652910422,
                            "last_edited": 1652910422,
                            "label": "Vegetarian",
                            "value": "Vegetarian",
                            "order": 2,
                            "question_id": 102
                        },
                        {
                            "id": 180,
                            "created": 1652910432,
                            "last_edited": 1652910432,
                            "label": "Carnivore",
                            "value": "Carnivore",
                            "order": 3,
                            "question_id": 102
                        }
                    ],
                    "parent_rules": [
                        17
                    ]
                }
            },
            {
                "id": 18,
                "created": 1652911057,
                "last_edited": 1652911057,
                "visibility": "Visible",
                "visibility_condition": "Equal",
                "answer_values": [
                    "176"
                ],
                "answer_values_operator": "And",
                "parent_question_id": 100,
                "sub_question": {
                    "id": 103,
                    "created": 1652910849,
                    "last_edited": 1652910849,
                    "name": "tortilla",
                    "type": "Text",
                    "label": "<p>What type of tortilla?</p>",
                    "placeholder": "tortilla?",
                    "order": 15,
                    "mandatory": false,
                    "max_selected_values": 0,
                    "class": "SubQuestion",
                    "usage": "Ticket",
                    "printable": false,
                    "summit_id": 13,
                    "parent_rules": [
                        18
                    ]
                }
            }
        ],
        "values": [
            {
                "id": 175,
                "created": 1652901928,
                "last_edited": 1652901928,
                "label": "Sausage",
                "value": "Sausage",
                "order": 1,
                "question_id": 100
            },
            {
                "id": 176,
                "created": 1652901949,
                "last_edited": 1652901949,
                "label": "Pico de Gallo",
                "value": "Pico de Gallo",
                "order": 2,
                "question_id": 100
            },
            {
                "id": 177,
                "created": 1652901956,
                "last_edited": 1652901956,
                "label": "Other",
                "value": "Other",
                "order": 3,
                "question_id": 100
            }
        ],
        "parent_rules": []
    }
];

test('visible questions completed', () => {
    const qs = new QuestionsSet(questions, completeAnswers);
    expect(qs.completed()).toBe(true);
});

test('visible questions not completed', () => {
    const qs = new QuestionsSet(questions, incompleteAnswers);
    expect(qs.completed()).toBe(false);
});

test('visible questions completed and mandatory', () => {
    const qs = new QuestionsSet(questions, completeAnswers2);
    expect(qs.completed()).toBe(true);
});

test('format answers', () => {
    const qs = new QuestionsSet(questions, completeAnswers);
    const expectedResult = '{"delivery_method":161,"pickup_point":164,"other_pickup_point":"test","industry_market_segment":171,"other_industry_market_segment":"test","cloud_service_provider_market_sub_segment":[172,174],"other_cloud_service_provider_market_sub_segment":"test"}';
    expect(JSON.stringify(qs.formatAnswers())).toEqual(expectedResult);
});

test('get question by name', () => {
    const qs = new QuestionsSet(questions2);
    let q = qs.getQuestionByName('delive_method_delivery_transport_other');
    expect(q).not.toBeNull();
});


test('question and subquestion with default values', () => {

    const questionsSubQuestionsWithDefaults = [
        {
            "id": 92,
            "created": 1654592398,
            "last_edited": 1686261652,
            "name": "chk1",
            "type": "CheckBoxList",
            "label": "<p>Ticket delivery method (sample registration question)</p>",
            "placeholder": null,
            "order": 1,
            "mandatory": true,
            "max_selected_values": 0,
            "class": "MainQuestion",
            "usage": "Ticket",
            "printable": false,
            "summit_id": 13,
            "sub_question_rules": [],
            "values": [
                {
                    "id": 976,
                    "created": 1686259349,
                    "last_edited": 1686259349,
                    "label": "nano",
                    "value": "nano",
                    "order": 1,
                    "question_id": 92,
                    "is_default": false
                },
                {
                    "id": 183,
                    "created": 1654592450,
                    "last_edited": 1654592450,
                    "label": "Email",
                    "value": "email",
                    "order": 2,
                    "question_id": 92,
                    "is_default": false
                },
                {
                    "id": 468,
                    "created": 1685402131,
                    "last_edited": 1685402131,
                    "label": "fdfdfdf",
                    "value": "jjj",
                    "order": 3,
                    "question_id": 92,
                    "is_default": false
                },
                {
                    "id": 467,
                    "created": 1685400045,
                    "last_edited": 1685400045,
                    "label": "test",
                    "value": "test",
                    "order": 4,
                    "question_id": 92,
                    "is_default": false
                },
                {
                    "id": 182,
                    "created": 1654592444,
                    "last_edited": 1654592444,
                    "label": "Mail",
                    "value": "mail",
                    "order": 5,
                    "question_id": 92,
                    "is_default": false
                },
                {
                    "id": 975,
                    "created": 1686258920,
                    "last_edited": 1686258920,
                    "label": "gggg",
                    "value": "ggg",
                    "order": 6,
                    "question_id": 92,
                    "is_default": true
                },
                {
                    "id": 977,
                    "created": 1686259356,
                    "last_edited": 1686259356,
                    "label": "testtttt",
                    "value": "testttt",
                    "order": 7,
                    "question_id": 92,
                    "is_default": false
                }
            ],
            "parent_rules": [],
            "allowed_ticket_types": [],
            "allowed_badge_features_types": []
        },
        {
            "id": 194,
            "created": 1681757262,
            "last_edited": 1682094962,
            "name": "CHEAP_QUESTION",
            "type": "Text",
            "label": "<p>What is your favorite streaming platform ?</p>",
            "placeholder": "this is cheap ?",
            "order": 8,
            "mandatory": false,
            "max_selected_values": 0,
            "class": "MainQuestion",
            "usage": "Ticket",
            "printable": false,
            "summit_id": 13,
            "parent_rules": [],
            "allowed_ticket_types": [
                78
            ],
            "allowed_badge_features_types": []
        },
        {
            "id": 205,
            "created": 1682096307,
            "last_edited": 1686330540,
            "name": "MAIN_EARLY_BIRD_QUESTION",
            "type": "CheckBox",
            "label": "<p>are your early bird</p>",
            "placeholder": null,
            "order": 9,
            "mandatory": true,
            "max_selected_values": 0,
            "class": "MainQuestion",
            "usage": "Ticket",
            "printable": false,
            "summit_id": 13,
            "parent_rules": [],
            "allowed_ticket_types": [
                78
            ],
            "allowed_badge_features_types": []
        },
        {
            "id": 207,
            "created": 1682097257,
            "last_edited": 1686330512,
            "name": "EARLY_BIRD_MAIN_2",
            "type": "CheckBoxList",
            "label": "<p>select early bird type</p>",
            "placeholder": null,
            "order": 11,
            "mandatory": true,
            "max_selected_values": 1,
            "class": "MainQuestion",
            "usage": "Ticket",
            "printable": false,
            "summit_id": 13,
            "sub_question_rules": [
                {
                    "id": 58,
                    "created": 1682097293,
                    "last_edited": 1682097293,
                    "visibility": "Visible",
                    "visibility_condition": "Equal",
                    "answer_values": [
                        "451",
                        "452"
                    ],
                    "answer_values_operator": "Or",
                    "order": 1,
                    "parent_question_id": 207,
                    "sub_question": {
                        "id": 206,
                        "created": 1682096355,
                        "last_edited": 1686352119,
                        "name": "EARLY_BIRD_SUBQUESTION",
                        "type": "CheckBoxList",
                        "label": "<p>what kind of early one?</p>",
                        "placeholder": null,
                        "order": 10,
                        "mandatory": true,
                        "max_selected_values": 1,
                        "class": "SubQuestion",
                        "usage": "Ticket",
                        "printable": false,
                        "summit_id": 13,
                        "sub_question_rules": [],
                        "values": [
                            {
                                "id": 449,
                                "created": 1682096372,
                                "last_edited": 1682096372,
                                "label": "early so so",
                                "value": "early_so_so",
                                "order": 1,
                                "question_id": 206,
                                "is_default": true
                            },
                            {
                                "id": 450,
                                "created": 1682096384,
                                "last_edited": 1682096384,
                                "label": "really early",
                                "value": "really_one",
                                "order": 2,
                                "question_id": 206,
                                "is_default": false
                            }
                        ],
                        "parent_rules": [
                            58
                        ],
                        "allowed_ticket_types": [
                            77,
                            78
                        ],
                        "allowed_badge_features_types": []
                    }
                }
            ],
            "values": [
                {
                    "id": 451,
                    "created": 1682097263,
                    "last_edited": 1682097263,
                    "label": "1",
                    "value": "1",
                    "order": 1,
                    "question_id": 207,
                    "is_default": false
                },
                {
                    "id": 452,
                    "created": 1682097267,
                    "last_edited": 1682097267,
                    "label": "you are 2",
                    "value": "2",
                    "order": 2,
                    "question_id": 207,
                    "is_default": true
                },
                {
                    "id": 453,
                    "created": 1682097304,
                    "last_edited": 1682097304,
                    "label": "3",
                    "value": "3",
                    "order": 3,
                    "question_id": 207,
                    "is_default": false
                }
            ],
            "parent_rules": [],
            "allowed_ticket_types": [
                78
            ],
            "allowed_badge_features_types": [
                58
            ]
        },
        {
            "id": 208,
            "created": 1682622402,
            "last_edited": 1686330489,
            "name": "SPEAKER_VE_QUESTION",
            "type": "Text",
            "label": "<p>what is your speaker name?</p>",
            "placeholder": null,
            "order": 12,
            "mandatory": true,
            "max_selected_values": 0,
            "class": "MainQuestion",
            "usage": "Ticket",
            "printable": false,
            "summit_id": 13,
            "parent_rules": [],
            "allowed_ticket_types": [
                78
            ],
            "allowed_badge_features_types": [
                19
            ]
        },
        {
            "id": 224,
            "created": 1686167028,
            "last_edited": 1686330457,
            "name": "country",
            "type": "CountryComboBox",
            "label": "<p>Country </p>",
            "placeholder": null,
            "order": 13,
            "mandatory": true,
            "max_selected_values": 0,
            "class": "MainQuestion",
            "usage": "Ticket",
            "printable": true,
            "summit_id": 13,
            "sub_question_rules": [],
            "values": [
                {
                    "id": 725,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Afghanistan",
                    "value": "AF",
                    "order": 1,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 726,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Aland Islands",
                    "value": "AX",
                    "order": 2,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 727,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Albania",
                    "value": "AL",
                    "order": 3,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 728,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Algeria",
                    "value": "DZ",
                    "order": 4,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 729,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "American Samoa",
                    "value": "AS",
                    "order": 5,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 730,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Andorra",
                    "value": "AD",
                    "order": 6,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 731,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Angola",
                    "value": "AO",
                    "order": 7,
                    "question_id": 224,
                    "is_default": true
                },
                {
                    "id": 732,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Anguilla",
                    "value": "AI",
                    "order": 8,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 733,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Antarctica",
                    "value": "AQ",
                    "order": 9,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 734,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Antigua and Barbuda",
                    "value": "AG",
                    "order": 10,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 735,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Argentina",
                    "value": "AR",
                    "order": 11,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 736,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Armenia",
                    "value": "AM",
                    "order": 12,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 737,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Aruba",
                    "value": "AW",
                    "order": 13,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 738,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Australia",
                    "value": "AU",
                    "order": 14,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 739,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Austria",
                    "value": "AT",
                    "order": 15,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 740,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Azerbaijan",
                    "value": "AZ",
                    "order": 16,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 741,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Bahamas",
                    "value": "BS",
                    "order": 17,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 742,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Bahrain",
                    "value": "BH",
                    "order": 18,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 743,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Bangladesh",
                    "value": "BD",
                    "order": 19,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 744,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Barbados",
                    "value": "BB",
                    "order": 20,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 745,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Belarus",
                    "value": "BY",
                    "order": 21,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 746,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Belgium",
                    "value": "BE",
                    "order": 22,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 747,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Belize",
                    "value": "BZ",
                    "order": 23,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 748,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Benin",
                    "value": "BJ",
                    "order": 24,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 749,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Bermuda",
                    "value": "BM",
                    "order": 25,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 750,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Bhutan",
                    "value": "BT",
                    "order": 26,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 751,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Bolivia, Plurinational State of",
                    "value": "BO",
                    "order": 27,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 752,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Bonaire, Sint Eustatius and Saba",
                    "value": "BQ",
                    "order": 28,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 753,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Bosnia and Herzegovina",
                    "value": "BA",
                    "order": 29,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 754,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Botswana",
                    "value": "BW",
                    "order": 30,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 755,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Bouvet Island",
                    "value": "BV",
                    "order": 31,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 756,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Brazil",
                    "value": "BR",
                    "order": 32,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 757,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "British Indian Ocean Territory",
                    "value": "IO",
                    "order": 33,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 758,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Brunei Darussalam",
                    "value": "BN",
                    "order": 34,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 759,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Bulgaria",
                    "value": "BG",
                    "order": 35,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 760,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Burkina Faso",
                    "value": "BF",
                    "order": 36,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 761,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Burundi",
                    "value": "BI",
                    "order": 37,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 762,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Cambodia",
                    "value": "KH",
                    "order": 38,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 763,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Cameroon",
                    "value": "CM",
                    "order": 39,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 764,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Canada",
                    "value": "CA",
                    "order": 40,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 765,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Cape Verde",
                    "value": "CV",
                    "order": 41,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 766,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Cayman Islands",
                    "value": "KY",
                    "order": 42,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 767,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Central African Republic",
                    "value": "CF",
                    "order": 43,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 768,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Chad",
                    "value": "TD",
                    "order": 44,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 769,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Chile",
                    "value": "CL",
                    "order": 45,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 770,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "China",
                    "value": "CN",
                    "order": 46,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 771,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Christmas Island",
                    "value": "CX",
                    "order": 47,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 772,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Cocos (Keeling) Islands",
                    "value": "CC",
                    "order": 48,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 773,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Colombia",
                    "value": "CO",
                    "order": 49,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 774,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Comoros",
                    "value": "KM",
                    "order": 50,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 775,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Congo",
                    "value": "CG",
                    "order": 51,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 776,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Congo, the Democratic Republic of the",
                    "value": "CD",
                    "order": 52,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 777,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Cook Islands",
                    "value": "CK",
                    "order": 53,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 778,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Costa Rica",
                    "value": "CR",
                    "order": 54,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 779,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Côte d'Ivoire",
                    "value": "CI",
                    "order": 55,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 780,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Croatia",
                    "value": "HR",
                    "order": 56,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 781,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Cuba",
                    "value": "CU",
                    "order": 57,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 782,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Curaçao",
                    "value": "CW",
                    "order": 58,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 783,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Cyprus",
                    "value": "CY",
                    "order": 59,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 784,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Czech Republic",
                    "value": "CZ",
                    "order": 60,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 785,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Denmark",
                    "value": "DK",
                    "order": 61,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 786,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Djibouti",
                    "value": "DJ",
                    "order": 62,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 787,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Dominica",
                    "value": "DM",
                    "order": 63,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 788,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Dominican Republic",
                    "value": "DO",
                    "order": 64,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 789,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Ecuador",
                    "value": "EC",
                    "order": 65,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 790,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Egypt",
                    "value": "EG",
                    "order": 66,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 791,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "El Salvador",
                    "value": "SV",
                    "order": 67,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 792,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Equatorial Guinea",
                    "value": "GQ",
                    "order": 68,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 793,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Eritrea",
                    "value": "ER",
                    "order": 69,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 794,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Estonia",
                    "value": "EE",
                    "order": 70,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 795,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Ethiopia",
                    "value": "ET",
                    "order": 71,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 796,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Falkland Islands (Malvinas)",
                    "value": "FK",
                    "order": 72,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 797,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Faroe Islands",
                    "value": "FO",
                    "order": 73,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 798,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Fiji",
                    "value": "FJ",
                    "order": 74,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 799,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Finland",
                    "value": "FI",
                    "order": 75,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 800,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "France",
                    "value": "FR",
                    "order": 76,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 801,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "France, Metropolitan",
                    "value": "FX",
                    "order": 77,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 802,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "French Guiana",
                    "value": "GF",
                    "order": 78,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 803,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "French Polynesia",
                    "value": "PF",
                    "order": 79,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 804,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "French Southern Territories",
                    "value": "TF",
                    "order": 80,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 805,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Gabon",
                    "value": "GA",
                    "order": 81,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 806,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Gambia",
                    "value": "GM",
                    "order": 82,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 807,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Georgia",
                    "value": "GE",
                    "order": 83,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 808,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Germany",
                    "value": "DE",
                    "order": 84,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 809,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Ghana",
                    "value": "GH",
                    "order": 85,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 810,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Gibraltar",
                    "value": "GI",
                    "order": 86,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 811,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Greece",
                    "value": "GR",
                    "order": 87,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 812,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Greenland",
                    "value": "GL",
                    "order": 88,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 813,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Grenada",
                    "value": "GD",
                    "order": 89,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 814,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Guadeloupe",
                    "value": "GP",
                    "order": 90,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 815,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Guam",
                    "value": "GU",
                    "order": 91,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 816,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Guatemala",
                    "value": "GT",
                    "order": 92,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 817,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Guernsey",
                    "value": "GG",
                    "order": 93,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 818,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Guinea",
                    "value": "GN",
                    "order": 94,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 819,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Guinea-Bissau",
                    "value": "GW",
                    "order": 95,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 820,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Guyana",
                    "value": "GY",
                    "order": 96,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 821,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Haiti",
                    "value": "HT",
                    "order": 97,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 822,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Heard Island and McDonald Islands",
                    "value": "HM",
                    "order": 98,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 823,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Holy See (Vatican City State)",
                    "value": "VA",
                    "order": 99,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 824,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Honduras",
                    "value": "HN",
                    "order": 100,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 825,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Hong Kong",
                    "value": "HK",
                    "order": 101,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 826,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Hungary",
                    "value": "HU",
                    "order": 102,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 827,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Iceland",
                    "value": "IS",
                    "order": 103,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 828,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "India",
                    "value": "IN",
                    "order": 104,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 829,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Indonesia",
                    "value": "ID",
                    "order": 105,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 830,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Iran, Islamic Republic of",
                    "value": "IR",
                    "order": 106,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 831,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Iraq",
                    "value": "IQ",
                    "order": 107,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 832,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Ireland",
                    "value": "IE",
                    "order": 108,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 833,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Isle of Man",
                    "value": "IM",
                    "order": 109,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 834,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Israel",
                    "value": "IL",
                    "order": 110,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 835,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Italy",
                    "value": "IT",
                    "order": 111,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 836,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Jamaica",
                    "value": "JM",
                    "order": 112,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 837,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Japan",
                    "value": "JP",
                    "order": 113,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 838,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Jersey",
                    "value": "JE",
                    "order": 114,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 839,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Jordan",
                    "value": "JO",
                    "order": 115,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 840,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Kazakhstan",
                    "value": "KZ",
                    "order": 116,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 841,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Kenya",
                    "value": "KE",
                    "order": 117,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 842,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Kiribati",
                    "value": "KI",
                    "order": 118,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 843,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Korea, Democratic People's Republic of",
                    "value": "KP",
                    "order": 119,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 844,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Korea, Republic of",
                    "value": "KR",
                    "order": 120,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 845,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Kuwait",
                    "value": "KW",
                    "order": 121,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 846,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Kyrgyzstan",
                    "value": "KG",
                    "order": 122,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 847,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Lao People's Democratic Republic",
                    "value": "LA",
                    "order": 123,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 848,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Latvia",
                    "value": "LV",
                    "order": 124,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 849,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Lebanon",
                    "value": "LB",
                    "order": 125,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 850,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Lesotho",
                    "value": "LS",
                    "order": 126,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 851,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Liberia",
                    "value": "LR",
                    "order": 127,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 852,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Libya",
                    "value": "LY",
                    "order": 128,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 853,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Liechtenstein",
                    "value": "LI",
                    "order": 129,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 854,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Lithuania",
                    "value": "LT",
                    "order": 130,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 855,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Luxembourg",
                    "value": "LU",
                    "order": 131,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 856,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Macao",
                    "value": "MO",
                    "order": 132,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 857,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Macedonia, the former Yugoslav Republic of",
                    "value": "MK",
                    "order": 133,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 858,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Madagascar",
                    "value": "MG",
                    "order": 134,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 859,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Malawi",
                    "value": "MW",
                    "order": 135,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 860,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Malaysia",
                    "value": "MY",
                    "order": 136,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 861,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Maldives",
                    "value": "MV",
                    "order": 137,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 862,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Mali",
                    "value": "ML",
                    "order": 138,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 863,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Malta",
                    "value": "MT",
                    "order": 139,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 864,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Marshall Islands",
                    "value": "MH",
                    "order": 140,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 865,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Martinique",
                    "value": "MQ",
                    "order": 141,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 866,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Mauritania",
                    "value": "MR",
                    "order": 142,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 867,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Mauritius",
                    "value": "MU",
                    "order": 143,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 868,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Mayotte",
                    "value": "YT",
                    "order": 144,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 869,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Mexico",
                    "value": "MX",
                    "order": 145,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 870,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Micronesia, Federated States of",
                    "value": "FM",
                    "order": 146,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 871,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Moldova, Republic of",
                    "value": "MD",
                    "order": 147,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 872,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Monaco",
                    "value": "MC",
                    "order": 148,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 873,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Mongolia",
                    "value": "MN",
                    "order": 149,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 874,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Montenegro",
                    "value": "ME",
                    "order": 150,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 875,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Montserrat",
                    "value": "MS",
                    "order": 151,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 876,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Morocco",
                    "value": "MA",
                    "order": 152,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 877,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Mozambique",
                    "value": "MZ",
                    "order": 153,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 878,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Myanmar",
                    "value": "MM",
                    "order": 154,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 879,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Namibia",
                    "value": "NA",
                    "order": 155,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 880,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Nauru",
                    "value": "NR",
                    "order": 156,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 881,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Nepal",
                    "value": "NP",
                    "order": 157,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 882,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Netherlands",
                    "value": "NL",
                    "order": 158,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 883,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "New Caledonia",
                    "value": "NC",
                    "order": 159,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 884,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "New Zealand",
                    "value": "NZ",
                    "order": 160,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 885,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Nicaragua",
                    "value": "NI",
                    "order": 161,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 886,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Niger",
                    "value": "NE",
                    "order": 162,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 887,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Nigeria",
                    "value": "NG",
                    "order": 163,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 888,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Niue",
                    "value": "NU",
                    "order": 164,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 889,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Norfolk Island",
                    "value": "NF",
                    "order": 165,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 890,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Northern Mariana Islands",
                    "value": "MP",
                    "order": 166,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 891,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Norway",
                    "value": "NO",
                    "order": 167,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 892,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Oman",
                    "value": "OM",
                    "order": 168,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 893,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Pakistan",
                    "value": "PK",
                    "order": 169,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 894,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Palau",
                    "value": "PW",
                    "order": 170,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 895,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Palestine",
                    "value": "PS",
                    "order": 171,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 896,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Panama",
                    "value": "PA",
                    "order": 172,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 897,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Papua New Guinea",
                    "value": "PG",
                    "order": 173,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 898,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Paraguay",
                    "value": "PY",
                    "order": 174,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 899,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Peru",
                    "value": "PE",
                    "order": 175,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 900,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Philippines",
                    "value": "PH",
                    "order": 176,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 901,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Pitcairn",
                    "value": "PN",
                    "order": 177,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 902,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Poland",
                    "value": "PL",
                    "order": 178,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 903,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Portugal",
                    "value": "PT",
                    "order": 179,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 904,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Puerto Rico",
                    "value": "PR",
                    "order": 180,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 905,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Qatar",
                    "value": "QA",
                    "order": 181,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 906,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Réunion",
                    "value": "RE",
                    "order": 182,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 907,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Romania",
                    "value": "RO",
                    "order": 183,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 908,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Russian Federation",
                    "value": "RU",
                    "order": 184,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 909,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Rwanda",
                    "value": "RW",
                    "order": 185,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 910,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Saint Barthélemy",
                    "value": "BL",
                    "order": 186,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 911,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Saint Helena, Ascension and Tristan da Cunha",
                    "value": "SH",
                    "order": 187,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 912,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Saint Kitts and Nevis",
                    "value": "KN",
                    "order": 188,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 913,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Saint Lucia",
                    "value": "LC",
                    "order": 189,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 914,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Saint Martin (French part)",
                    "value": "MF",
                    "order": 190,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 915,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Saint Pierre and Miquelon",
                    "value": "PM",
                    "order": 191,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 916,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Saint Vincent and the Grenadines",
                    "value": "VC",
                    "order": 192,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 917,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Samoa",
                    "value": "WS",
                    "order": 193,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 918,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "San Marino",
                    "value": "SM",
                    "order": 194,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 919,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Sao Tome and Principe",
                    "value": "ST",
                    "order": 195,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 920,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Saudi Arabia",
                    "value": "SA",
                    "order": 196,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 921,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Senegal",
                    "value": "SN",
                    "order": 197,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 922,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Serbia",
                    "value": "RS",
                    "order": 198,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 923,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Seychelles",
                    "value": "SC",
                    "order": 199,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 924,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Sierra Leone",
                    "value": "SL",
                    "order": 200,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 925,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Singapore",
                    "value": "SG",
                    "order": 201,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 926,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Sint Maarten (Dutch part)",
                    "value": "SX",
                    "order": 202,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 927,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Slovakia",
                    "value": "SK",
                    "order": 203,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 928,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Slovenia",
                    "value": "SI",
                    "order": 204,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 929,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Solomon Islands",
                    "value": "SB",
                    "order": 205,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 930,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Somalia",
                    "value": "SO",
                    "order": 206,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 931,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "South Africa",
                    "value": "ZA",
                    "order": 207,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 932,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "South Georgia and the South Sandwich Islands",
                    "value": "GS",
                    "order": 208,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 933,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "South Sudan",
                    "value": "SS",
                    "order": 209,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 934,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Spain",
                    "value": "ES",
                    "order": 210,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 935,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Sri Lanka",
                    "value": "LK",
                    "order": 211,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 936,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Sudan",
                    "value": "SD",
                    "order": 212,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 937,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Suriname",
                    "value": "SR",
                    "order": 213,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 938,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Svalbard and Jan Mayen",
                    "value": "SJ",
                    "order": 214,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 939,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Swaziland",
                    "value": "SZ",
                    "order": 215,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 940,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Sweden",
                    "value": "SE",
                    "order": 216,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 941,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Switzerland",
                    "value": "CH",
                    "order": 217,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 942,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Syrian Arab Republic",
                    "value": "SY",
                    "order": 218,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 943,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Taiwan",
                    "value": "TW",
                    "order": 219,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 944,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Tajikistan",
                    "value": "TJ",
                    "order": 220,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 945,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Tanzania, United Republic of",
                    "value": "TZ",
                    "order": 221,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 946,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Thailand",
                    "value": "TH",
                    "order": 222,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 947,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Timor-Leste",
                    "value": "TL",
                    "order": 223,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 948,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Togo",
                    "value": "TG",
                    "order": 224,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 949,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Tokelau",
                    "value": "TK",
                    "order": 225,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 950,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Tonga",
                    "value": "TO",
                    "order": 226,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 951,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Trinidad and Tobago",
                    "value": "TT",
                    "order": 227,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 952,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Tunisia",
                    "value": "TN",
                    "order": 228,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 953,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Turkey",
                    "value": "TR",
                    "order": 229,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 954,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Turkmenistan",
                    "value": "TM",
                    "order": 230,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 955,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Turks and Caicos Islands",
                    "value": "TC",
                    "order": 231,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 956,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Tuvalu",
                    "value": "TV",
                    "order": 232,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 957,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Uganda",
                    "value": "UG",
                    "order": 233,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 958,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Ukraine",
                    "value": "UA",
                    "order": 234,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 959,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "United Arab Emirates",
                    "value": "AE",
                    "order": 235,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 960,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "United Kingdom",
                    "value": "GB",
                    "order": 236,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 961,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "United States",
                    "value": "US",
                    "order": 237,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 962,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "United States Minor Outlying Islands",
                    "value": "UM",
                    "order": 238,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 963,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Uruguay",
                    "value": "UY",
                    "order": 239,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 964,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Uzbekistan",
                    "value": "UZ",
                    "order": 240,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 965,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Vanuatu",
                    "value": "VU",
                    "order": 241,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 966,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Venezuela, Bolivarian Republic of",
                    "value": "VE",
                    "order": 242,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 967,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Viet Nam",
                    "value": "VN",
                    "order": 243,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 968,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Virgin Islands, British",
                    "value": "VG",
                    "order": 244,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 969,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Virgin Islands, U.S.",
                    "value": "VI",
                    "order": 245,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 970,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Wallis and Futuna",
                    "value": "WF",
                    "order": 246,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 971,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Western Sahara",
                    "value": "EH",
                    "order": 247,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 972,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Yemen",
                    "value": "YE",
                    "order": 248,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 973,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Zambia",
                    "value": "ZM",
                    "order": 249,
                    "question_id": 224,
                    "is_default": false
                },
                {
                    "id": 974,
                    "created": 1686167028,
                    "last_edited": 1686167028,
                    "label": "Zimbabwe",
                    "value": "ZW",
                    "order": 250,
                    "question_id": 224,
                    "is_default": false
                }
            ],
            "parent_rules": [],
            "allowed_ticket_types": [
                78
            ],
            "allowed_badge_features_types": []
        }
    ];

    const qs = new QuestionsSet(questionsSubQuestionsWithDefaults, []);

    const a = qs.formatAnswers();

    expect(a).not.toBeNull();

    expect(a).toEqual(
        expect.objectContaining({
            early_bird_main_2: [452],
            early_bird_subquestion: [449]
        })
    );
});

test('question with mandatory imcompleted subquestion', () => {

    const questionData = [
        {
            "id": 370,
            "created": 1700189993,
            "last_edited": 1700189993,
            "name": "Organizational Role",
            "type": "RadioButtonList",
            "label": "<p>Which best describes your role in your organization?</p>",
            "placeholder": null,
            "order": 3,
            "mandatory": true,
            "max_selected_values": 0,
            "class": "MainQuestion",
            "usage": "Ticket",
            "printable": false,
            "summit_id": 55,
            "sub_question_rules": [
                {
                    "id": 97,
                    "created": 1700190418,
                    "last_edited": 1700190418,
                    "visibility": "Visible",
                    "visibility_condition": "Equal",
                    "answer_values": [
                        "1225"
                    ],
                    "answer_values_operator": "And",
                    "order": 1,
                    "parent_question_id": 370,
                    "sub_question": {
                        "id": 371,
                        "created": 1700190397,
                        "last_edited": 1700190397,
                        "name": "Organizational Role SUB-QUESTION (Other)",
                        "type": "Text",
                        "label": "<p>If you selected \"Other\", please describe</p>",
                        "placeholder": null,
                        "order": 4,
                        "mandatory": true,
                        "max_selected_values": 0,
                        "class": "SubQuestion",
                        "usage": "Ticket",
                        "printable": false,
                        "summit_id": 55,
                        "parent_rules": [
                            97
                        ],
                        "allowed_ticket_types": [],
                        "allowed_badge_features_types": []
                    }
                }
            ],
            "values": [
                {
                    "id": 1206,
                    "created": 1700190063,
                    "last_edited": 1700190063,
                    "label": "Administrative",
                    "value": "Administrative",
                    "order": 1,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1207,
                    "created": 1700190081,
                    "last_edited": 1700190081,
                    "label": "Academia/Student",
                    "value": "Academia/Student",
                    "order": 2,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1208,
                    "created": 1700190097,
                    "last_edited": 1700190097,
                    "label": "Analyst",
                    "value": "Analyst",
                    "order": 3,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1209,
                    "created": 1700190116,
                    "last_edited": 1700190116,
                    "label": "Business Development/Sales",
                    "value": "Business Development/Sales",
                    "order": 4,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1210,
                    "created": 1700190131,
                    "last_edited": 1700190131,
                    "label": "Consultant",
                    "value": "Consultant",
                    "order": 5,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1211,
                    "created": 1700190146,
                    "last_edited": 1700190146,
                    "label": "Engineer",
                    "value": "Engineer",
                    "order": 6,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1212,
                    "created": 1700190160,
                    "last_edited": 1700190160,
                    "label": "Event Management",
                    "value": "Event Management",
                    "order": 7,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1213,
                    "created": 1700190175,
                    "last_edited": 1700190175,
                    "label": "Facility Management",
                    "value": "Facility Management",
                    "order": 8,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1214,
                    "created": 1700190190,
                    "last_edited": 1700190190,
                    "label": "Investor",
                    "value": "Investor",
                    "order": 9,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1215,
                    "created": 1700190203,
                    "last_edited": 1700190203,
                    "label": "Legal",
                    "value": "Legal",
                    "order": 10,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1216,
                    "created": 1700190214,
                    "last_edited": 1700190214,
                    "label": "Marketing",
                    "value": "Marketing",
                    "order": 11,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1217,
                    "created": 1700190225,
                    "last_edited": 1700190225,
                    "label": "Media",
                    "value": "Media",
                    "order": 12,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1218,
                    "created": 1700190237,
                    "last_edited": 1700190237,
                    "label": "Operations",
                    "value": "Operations",
                    "order": 13,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1219,
                    "created": 1700190253,
                    "last_edited": 1700190253,
                    "label": "Procurement",
                    "value": "Procurement",
                    "order": 14,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1220,
                    "created": 1700190266,
                    "last_edited": 1700190266,
                    "label": "Product Manager",
                    "value": "Product Manager",
                    "order": 15,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1221,
                    "created": 1700190277,
                    "last_edited": 1700190277,
                    "label": "Research",
                    "value": "Research",
                    "order": 16,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1222,
                    "created": 1700190289,
                    "last_edited": 1700190289,
                    "label": "Senior Executive",
                    "value": "Senior Executive",
                    "order": 17,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1223,
                    "created": 1700190301,
                    "last_edited": 1700190301,
                    "label": "Software Infrastructure",
                    "value": "Software Infrastructure",
                    "order": 18,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1224,
                    "created": 1700190314,
                    "last_edited": 1700190314,
                    "label": "Technology Architect",
                    "value": "Technology Architect",
                    "order": 19,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1225,
                    "created": 1700190326,
                    "last_edited": 1700190326,
                    "label": "Other",
                    "value": "Other",
                    "order": 20,
                    "question_id": 370,
                    "is_default": false
                }
            ],
            "parent_rules": [],
            "allowed_ticket_types": [],
            "allowed_badge_features_types": []
        }
    ]
    const answerData = [
        {
            "id": 431802,
            "created": 1651848786,
            "last_edited": 1651848786,
            "value": "1225",
            "question_id": 370,
            "order_id": 0,
            "attendee_id": 131
        },
    ];

    const qs = new QuestionsSet(questionData, answerData);
    expect(qs.completed()).toBe(false);
});

test('question with mandatory complete subquestion', () => {

    const questionData = [
        {
            "id": 370,
            "created": 1700189993,
            "last_edited": 1700189993,
            "name": "Organizational Role",
            "type": "RadioButtonList",
            "label": "<p>Which best describes your role in your organization?</p>",
            "placeholder": null,
            "order": 3,
            "mandatory": true,
            "max_selected_values": 0,
            "class": "MainQuestion",
            "usage": "Ticket",
            "printable": false,
            "summit_id": 55,
            "sub_question_rules": [
                {
                    "id": 97,
                    "created": 1700190418,
                    "last_edited": 1700190418,
                    "visibility": "Visible",
                    "visibility_condition": "Equal",
                    "answer_values": [
                        "1225"
                    ],
                    "answer_values_operator": "And",
                    "order": 1,
                    "parent_question_id": 370,
                    "sub_question": {
                        "id": 371,
                        "created": 1700190397,
                        "last_edited": 1700190397,
                        "name": "Organizational Role SUB-QUESTION (Other)",
                        "type": "Text",
                        "label": "<p>If you selected \"Other\", please describe</p>",
                        "placeholder": null,
                        "order": 4,
                        "mandatory": true,
                        "max_selected_values": 0,
                        "class": "SubQuestion",
                        "usage": "Ticket",
                        "printable": false,
                        "summit_id": 55,
                        "parent_rules": [
                            97
                        ],
                        "allowed_ticket_types": [],
                        "allowed_badge_features_types": []
                    }
                }
            ],
            "values": [
                {
                    "id": 1206,
                    "created": 1700190063,
                    "last_edited": 1700190063,
                    "label": "Administrative",
                    "value": "Administrative",
                    "order": 1,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1207,
                    "created": 1700190081,
                    "last_edited": 1700190081,
                    "label": "Academia/Student",
                    "value": "Academia/Student",
                    "order": 2,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1208,
                    "created": 1700190097,
                    "last_edited": 1700190097,
                    "label": "Analyst",
                    "value": "Analyst",
                    "order": 3,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1209,
                    "created": 1700190116,
                    "last_edited": 1700190116,
                    "label": "Business Development/Sales",
                    "value": "Business Development/Sales",
                    "order": 4,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1210,
                    "created": 1700190131,
                    "last_edited": 1700190131,
                    "label": "Consultant",
                    "value": "Consultant",
                    "order": 5,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1211,
                    "created": 1700190146,
                    "last_edited": 1700190146,
                    "label": "Engineer",
                    "value": "Engineer",
                    "order": 6,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1212,
                    "created": 1700190160,
                    "last_edited": 1700190160,
                    "label": "Event Management",
                    "value": "Event Management",
                    "order": 7,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1213,
                    "created": 1700190175,
                    "last_edited": 1700190175,
                    "label": "Facility Management",
                    "value": "Facility Management",
                    "order": 8,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1214,
                    "created": 1700190190,
                    "last_edited": 1700190190,
                    "label": "Investor",
                    "value": "Investor",
                    "order": 9,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1215,
                    "created": 1700190203,
                    "last_edited": 1700190203,
                    "label": "Legal",
                    "value": "Legal",
                    "order": 10,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1216,
                    "created": 1700190214,
                    "last_edited": 1700190214,
                    "label": "Marketing",
                    "value": "Marketing",
                    "order": 11,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1217,
                    "created": 1700190225,
                    "last_edited": 1700190225,
                    "label": "Media",
                    "value": "Media",
                    "order": 12,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1218,
                    "created": 1700190237,
                    "last_edited": 1700190237,
                    "label": "Operations",
                    "value": "Operations",
                    "order": 13,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1219,
                    "created": 1700190253,
                    "last_edited": 1700190253,
                    "label": "Procurement",
                    "value": "Procurement",
                    "order": 14,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1220,
                    "created": 1700190266,
                    "last_edited": 1700190266,
                    "label": "Product Manager",
                    "value": "Product Manager",
                    "order": 15,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1221,
                    "created": 1700190277,
                    "last_edited": 1700190277,
                    "label": "Research",
                    "value": "Research",
                    "order": 16,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1222,
                    "created": 1700190289,
                    "last_edited": 1700190289,
                    "label": "Senior Executive",
                    "value": "Senior Executive",
                    "order": 17,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1223,
                    "created": 1700190301,
                    "last_edited": 1700190301,
                    "label": "Software Infrastructure",
                    "value": "Software Infrastructure",
                    "order": 18,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1224,
                    "created": 1700190314,
                    "last_edited": 1700190314,
                    "label": "Technology Architect",
                    "value": "Technology Architect",
                    "order": 19,
                    "question_id": 370,
                    "is_default": false
                },
                {
                    "id": 1225,
                    "created": 1700190326,
                    "last_edited": 1700190326,
                    "label": "Other",
                    "value": "Other",
                    "order": 20,
                    "question_id": 370,
                    "is_default": false
                }
            ],
            "parent_rules": [],
            "allowed_ticket_types": [],
            "allowed_badge_features_types": []
        }
    ]
    const answerData = [
        {
            "id": 431802,
            "created": 1651848786,
            "last_edited": 1651848786,
            "value": "1225",
            "question_id": 370,
            "order_id": 0,
            "attendee_id": 131
        },
        {
            "id": 431805,
            "created": 1651848786,
            "last_edited": 1651848786,
            "value": "OTHER",
            "question_id": 371,
            "order_id": 0,
            "attendee_id": 131
        },
    ];

    const qs = new QuestionsSet(questionData, answerData);
    expect(qs.completed()).toBe(true);
});
