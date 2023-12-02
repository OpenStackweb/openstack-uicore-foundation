/**
 * @jest-environment jsdom
 */
import React from 'react';
import ExtraQuestionsForm from '..';
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Input from '../../inputs/text-input';
import Dropdown from '../../inputs/dropdown';
import {toSlug} from '../../../utils/methods';

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
    {
        "id": 96,
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

const questions2And = [
    {
        "id": 104,
        "created": 1652986664,
        "last_edited": 1652986664,
        "name": "delivery_method",
        "type": "RadioButtonList",
        "label": "<p>How you would receive the ticket ?<\/p>",
        "placeholder": null,
        "order": 1,
        "mandatory": true,
        "max_selected_values": 0,
        "class": "MainQuestion",
        "usage": "Ticket",
        "printable": false,
        "summit_id": 13,
        "sub_question_rules": [{
            "id": 21,
            "created": 1652987046,
            "last_edited": 1652987046,
            "visibility": "Visible",
            "visibility_condition": "Equal",
            "answer_values": ["181"],
            "answer_values_operator": "And",
            "parent_question_id": 104,
            "sub_question": {
                "id": 94,
                "created": 1651846810,
                "last_edited": 1651846810,
                "name": "pickup_point",
                "type": "RadioButtonList",
                "label": "<p>Pick up Point<\/p>",
                "placeholder": null,
                "order": 2,
                "mandatory": true,
                "max_selected_values": 0,
                "class": "SubQuestion",
                "usage": "Ticket",
                "printable": false,
                "summit_id": 13,
                "sub_question_rules": [{
                    "id": 20,
                    "created": 1652986579,
                    "last_edited": 1652986579,
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
                        "label": "<p>Which ?<\/p>",
                        "placeholder": "Let us know the pickup point if not listed",
                        "order": 3,
                        "mandatory": false,
                        "max_selected_values": 0,
                        "class": "SubQuestion",
                        "usage": "Ticket",
                        "printable": false,
                        "summit_id": 13,
                        "parent_rules": [20]
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
                "parent_rules": [21]
            }
        }, {
            "id": 24,
            "created": 1652987448,
            "last_edited": 1652987448,
            "visibility": "Visible",
            "visibility_condition": "Equal",
            "answer_values": ["182"],
            "answer_values_operator": "And",
            "parent_question_id": 104,
            "sub_question": {
                "id": 105,
                "created": 1652986750,
                "last_edited": 1652986750,
                "name": "delive_method_delivery",
                "type": "RadioButtonList",
                "label": "<p>Choose Your Delivery Method<\/p>",
                "placeholder": null,
                "order": 4,
                "mandatory": true,
                "max_selected_values": 0,
                "class": "SubQuestion",
                "usage": "Ticket",
                "printable": false,
                "summit_id": 13,
                "sub_question_rules": [{
                    "id": 22,
                    "created": 1652987148,
                    "last_edited": 1652987148,
                    "visibility": "Visible",
                    "visibility_condition": "Equal",
                    "answer_values": ["183"],
                    "answer_values_operator": "And",
                    "parent_question_id": 105,
                    "sub_question": {
                        "id": 106,
                        "created": 1652987124,
                        "last_edited": 1652987124,
                        "name": "delive_method_delivery_mail",
                        "type": "Text",
                        "label": "<p>Your Address<\/p>",
                        "placeholder": "Address",
                        "order": 5,
                        "mandatory": true,
                        "max_selected_values": 0,
                        "class": "SubQuestion",
                        "usage": "Ticket",
                        "printable": false,
                        "summit_id": 13,
                        "parent_rules": [22]
                    }
                }, {
                    "id": 25,
                    "created": 1652987532,
                    "last_edited": 1652987532,
                    "visibility": "Visible",
                    "visibility_condition": "Equal",
                    "answer_values": ["184"],
                    "answer_values_operator": "And",
                    "parent_question_id": 105,
                    "sub_question": {
                        "id": 107,
                        "created": 1652987228,
                        "last_edited": 1652987228,
                        "name": "delive_method_delivery_transport",
                        "type": "RadioButtonList",
                        "label": "<p>Which Transport ?<\/p>",
                        "placeholder": null,
                        "order": 6,
                        "mandatory": true,
                        "max_selected_values": 0,
                        "class": "SubQuestion",
                        "usage": "Ticket",
                        "printable": false,
                        "summit_id": 13,
                        "sub_question_rules": [{
                            "id": 23,
                            "created": 1652987304,
                            "last_edited": 1652987304,
                            "visibility": "Visible",
                            "visibility_condition": "Equal",
                            "answer_values": ["188"],
                            "answer_values_operator": "And",
                            "parent_question_id": 107,
                            "sub_question": {
                                "id": 108,
                                "created": 1652987283,
                                "last_edited": 1652987283,
                                "name": "delive_method_delivery_transport_other",
                                "type": "Text",
                                "label": "<p>Other Transport<\/p>",
                                "placeholder": "Other",
                                "order": 7,
                                "mandatory": true,
                                "max_selected_values": 0,
                                "class": "SubQuestion",
                                "usage": "Ticket",
                                "printable": false,
                                "summit_id": 13,
                                "parent_rules": [23]
                            }
                        }],
                        "values": [{
                            "id": 185,
                            "created": 1652987235,
                            "last_edited": 1652987235,
                            "label": "DHL",
                            "value": "DHL",
                            "order": 1,
                            "question_id": 107
                        }, {
                            "id": 186,
                            "created": 1652987242,
                            "last_edited": 1652987242,
                            "label": "Bike",
                            "value": "Bike",
                            "order": 2,
                            "question_id": 107
                        }, {
                            "id": 187,
                            "created": 1652987246,
                            "last_edited": 1652987246,
                            "label": "Car",
                            "value": "Car",
                            "order": 3,
                            "question_id": 107
                        }, {
                            "id": 188,
                            "created": 1652987251,
                            "last_edited": 1652987251,
                            "label": "Other",
                            "value": "Other",
                            "order": 4,
                            "question_id": 107
                        }],
                        "parent_rules": [25]
                    }
                }],
                "values": [{
                    "id": 183,
                    "created": 1652986760,
                    "last_edited": 1652986760,
                    "label": "Mail",
                    "value": "Mail",
                    "order": 1,
                    "question_id": 105
                }, {
                    "id": 184,
                    "created": 1652986972,
                    "last_edited": 1652986972,
                    "label": "Transport",
                    "value": "TrasportMethod",
                    "order": 2,
                    "question_id": 105
                }],
                "parent_rules": [24]
            }
        }],
        "values": [{
            "id": 181,
            "created": 1652986681,
            "last_edited": 1652986681,
            "label": "Pick Up",
            "value": "PickUp",
            "order": 1,
            "question_id": 104
        }, {
            "id": 182,
            "created": 1652986711,
            "last_edited": 1652986711,
            "label": "Delivery",
            "value": "Delivery",
            "order": 2,
            "question_id": 104
        }],
        "parent_rules": []
    }, {
        "id": 96,
        "created": 1651847337,
        "last_edited": 1651847337,
        "name": "industry_market_segment",
        "type": "RadioButtonList",
        "label": "<p>Industry Market Segment<\/p>",
        "placeholder": null,
        "order": 8,
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
                "label": "<p>Other<\/p>",
                "placeholder": "Other Industry Market Segment",
                "order": 9,
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
                "label": "<p>If Cloud Service Provider is selected, provide the following Industry Market Sub-segment options (select all that apply):<\/p>",
                "placeholder": null,
                "order": 10,
                "mandatory": true,
                "max_selected_values": 0,
                "class": "SubQuestion",
                "usage": "Ticket",
                "printable": false,
                "summit_id": 13,
                "sub_question_rules": [{
                    "id": 15,
                    "created": 1652742856,
                    "last_edited": 1652742856,
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
                        "label": "<p>Other Cloud Service Provider Industry Market Sub-segment\u00a0<\/p>",
                        "placeholder": "Other Industry Market Sub-segment",
                        "order": 11,
                        "mandatory": true,
                        "max_selected_values": 0,
                        "class": "SubQuestion",
                        "usage": "Ticket",
                        "printable": false,
                        "summit_id": 13,
                        "parent_rules": [15]
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
    }, {
        "id": 100,
        "created": 1652901873,
        "last_edited": 1652901873,
        "name": "tacos",
        "type": "RadioButtonList",
        "label": "<p>What do you want on your tacos?<\/p>",
        "placeholder": null,
        "order": 12,
        "mandatory": false,
        "max_selected_values": 0,
        "class": "MainQuestion",
        "usage": "Ticket",
        "printable": false,
        "summit_id": 13,
        "sub_question_rules": [{
            "id": 16,
            "created": 1652902228,
            "last_edited": 1652902228,
            "visibility": "Visible",
            "visibility_condition": "Equal",
            "answer_values": ["177"],
            "answer_values_operator": "And",
            "parent_question_id": 100,
            "sub_question": {
                "id": 101,
                "created": 1652902172,
                "last_edited": 1652902172,
                "name": "OtraIngrediente",
                "type": "Text",
                "label": "<p>What would you like instead?<\/p>",
                "placeholder": "tasty addition",
                "order": 13,
                "mandatory": false,
                "max_selected_values": 0,
                "class": "SubQuestion",
                "usage": "Ticket",
                "printable": false,
                "summit_id": 13,
                "parent_rules": [16]
            }
        }, {
            "id": 28,
            "created": 1653422355,
            "last_edited": 1653422355,
            "visibility": "Visible",
            "visibility_condition": "Equal",
            "answer_values": ["175"],
            "answer_values_operator": "And",
            "parent_question_id": 100,
            "sub_question": {
                "id": 102,
                "created": 1652910392,
                "last_edited": 1652910392,
                "name": "vegetarianStatus",
                "type": "RadioButtonList",
                "label": "<p>Set your vegetarian status here:<\/p>",
                "placeholder": null,
                "order": 14,
                "mandatory": false,
                "max_selected_values": 0,
                "class": "SubQuestion",
                "usage": "Ticket",
                "printable": false,
                "summit_id": 13,
                "sub_question_rules": [],
                "values": [{
                    "id": 178,
                    "created": 1652910403,
                    "last_edited": 1652910403,
                    "label": "Vegan",
                    "value": "Vegan",
                    "order": 1,
                    "question_id": 102
                }, {
                    "id": 179,
                    "created": 1652910422,
                    "last_edited": 1652910422,
                    "label": "Vegetarian",
                    "value": "Vegetarian",
                    "order": 2,
                    "question_id": 102
                }, {
                    "id": 180,
                    "created": 1652910432,
                    "last_edited": 1652910432,
                    "label": "Carnivore",
                    "value": "Carnivore",
                    "order": 3,
                    "question_id": 102
                }],
                "parent_rules": [28]
            }
        }, {
            "id": 27,
            "created": 1653422295,
            "last_edited": 1653422295,
            "visibility": "Visible",
            "visibility_condition": "Equal",
            "answer_values": ["176"],
            "answer_values_operator": "And",
            "parent_question_id": 100,
            "sub_question": {
                "id": 103,
                "created": 1652910849,
                "last_edited": 1652910849,
                "name": "tortilla",
                "type": "Text",
                "label": "<p>What type of tortilla?<\/p>",
                "placeholder": "tortilla?",
                "order": 15,
                "mandatory": false,
                "max_selected_values": 0,
                "class": "SubQuestion",
                "usage": "Ticket",
                "printable": false,
                "summit_id": 13,
                "parent_rules": [27]
            }
        }],
        "values": [{
            "id": 175,
            "created": 1652901928,
            "last_edited": 1652901928,
            "label": "Sausage",
            "value": "Sausage",
            "order": 1,
            "question_id": 100
        }, {
            "id": 176,
            "created": 1652901949,
            "last_edited": 1652901949,
            "label": "Pico de Gallo",
            "value": "Pico de Gallo",
            "order": 2,
            "question_id": 100
        }, {
            "id": 177,
            "created": 1652901956,
            "last_edited": 1652901956,
            "label": "Other",
            "value": "Other",
            "order": 3,
            "question_id": 100
        }],
        "parent_rules": []
    }, {
        "id": 109,
        "created": 1654041045,
        "last_edited": 1654041045,
        "name": "meat-type",
        "type": "CheckBoxList",
        "label": "<p>What cut do you like?<\/p>",
        "placeholder": null,
        "order": 16,
        "mandatory": false,
        "max_selected_values": 0,
        "class": "MainQuestion",
        "usage": "Ticket",
        "printable": false,
        "summit_id": 13,
        "sub_question_rules": [{
            "id": 29,
            "created": 1654041901,
            "last_edited": 1654041901,
            "visibility": "Visible",
            "visibility_condition": "Equal",
            "answer_values": ["190", "191", "192"],
            "answer_values_operator": "And",
            "parent_question_id": 109,
            "sub_question": {
                "id": 110,
                "created": 1654041807,
                "last_edited": 1654041807,
                "name": "prefer",
                "type": "Text",
                "label": "<p>What would you want?-<\/p>",
                "placeholder": "meat or veg?",
                "order": 17,
                "mandatory": false,
                "max_selected_values": 0,
                "class": "SubQuestion",
                "usage": "Ticket",
                "printable": false,
                "summit_id": 13,
                "parent_rules": [29]
            }
        }],
        "values": [{
            "id": 189,
            "created": 1654041059,
            "last_edited": 1654041059,
            "label": "ribeye",
            "value": "ribeye1",
            "order": 1,
            "question_id": 109
        }, {
            "id": 190,
            "created": 1654041065,
            "last_edited": 1654041065,
            "label": "filet",
            "value": "filet1",
            "order": 2,
            "question_id": 109
        }, {
            "id": 191,
            "created": 1654041091,
            "last_edited": 1654041091,
            "label": "ground",
            "value": "ground1",
            "order": 3,
            "question_id": 109
        }, {
            "id": 192,
            "created": 1654041112,
            "last_edited": 1654041112,
            "label": "barbacoa",
            "value": "barbacoa1",
            "order": 4,
            "question_id": 109
        }, {
            "id": 193,
            "created": 1654041120,
            "last_edited": 1654041120,
            "label": "hoof",
            "value": "hoof1",
            "order": 5,
            "question_id": 109
        }],
        "parent_rules": []
    }];

const completeAnswers2 = [
    {
        "id": 431808,
        "created": 1651848786,
        "last_edited": 1651848786,
        "value": "190,191,192",
        "question_id": 109,
        "order_id": 0,
        "attendee_id": 131
    }
];

it('has input', () => {
    const component = mount(
        <ExtraQuestionsForm
            extraQuestions={questions}
            userAnswers={completeAnswers}
            onAnswerChanges={() => {
            }}
            ref={null}
            className="extra-questions"
        />,
    );

    expect(component.find(Input).exists()).toBeTruthy();
    expect(component.find(Dropdown).exists()).toBeTruthy();

});

it('meat-type and values should show prefer', () => {
    const component = mount(
        <ExtraQuestionsForm
            extraQuestions={questions2And}
            userAnswers={completeAnswers2}
            onAnswerChanges={() => {
            }}
            ref={null}
            className="extra-questions"
        />,
    );


    expect(component.find('#prefer').exists()).toBeTruthy();
})

it('question should disabled', () => {

    const testQuestions =[
        {
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
            "sub_question_rules": [],
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
        }
    ];
    const testAnswers = [
        {
            "id": 431808,
            "created": 1651848786,
            "last_edited": 1651848786,
            "value": "172",
            "question_id": 98,
            "order_id": 0,
            "attendee_id": 131
        }
    ];

    const component = mount(
        <ExtraQuestionsForm
            extraQuestions={testQuestions}
            userAnswers={testAnswers}
            onAnswerChanges={() => {
            }}
            ref={null}
            className="extra-questions"
            allowExtraQuestionsEdit={false}
        />,
    );

    const slug = toSlug('cloud_service_provider_market_sub_segment');
    expect(component.find('#'+slug).exists()).toBeTruthy();
    const input = component.find('#'+slug+' input').at(1);
    expect(input.props().disabled === true).toBeTruthy();
})

it('question should be enabled', () => {

    const testQuestions =[
        {
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
            "sub_question_rules": [],
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
        }
    ];

    const component = mount(
        <ExtraQuestionsForm
            extraQuestions={testQuestions}
            userAnswers={[]}
            onAnswerChanges={() => {
            }}
            ref={null}
            className="extra-questions"
            allowExtraQuestionsEdit={false}
        />,
    );

    const slug = toSlug('cloud_service_provider_market_sub_segment');
    expect(component.find(`#${slug}`).exists()).toBeTruthy();
    const input = component.find(`#${slug} input`).at(1);
    expect(input.props().disabled === true).toBeFalsy();
})


test('question with mandatory imcompleted subquestion should scroll', () => {

    const testQuestions = [
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

    const testAnswers = [
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

    const formRef = React.createRef();

    const component = mount(
        <ExtraQuestionsForm
            extraQuestions={testQuestions}
            userAnswers={testAnswers}
            onAnswerChanges={() => {
            }}
            ref={formRef}
            className="extra-questions"
            shouldScroll2FirstError={true}
            allowExtraQuestionsEdit={true}
        />,
    );

    const slug = toSlug('Organizational Role SUB-QUESTION (Other)');
    expect(component.find(`#${slug}`).exists()).toBeTruthy();
    const input = component.find(`#${slug} input`).at(0);
    expect(input.props().disabled === true).toBeFalsy();

    formRef.current.doSubmit();

    const question = component.find(`#${slug}`);

});

