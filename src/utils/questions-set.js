export const ComboBoxQuestionType = 'ComboBox'
export const CheckBoxListQuestionType = 'CheckBoxList';
export const RadioButtonListQuestionType = 'RadioButtonList';
export const AllowedMultipleValueQuestionType = [ComboBoxQuestionType, CheckBoxListQuestionType, RadioButtonListQuestionType];
export const AnswerValuesOperator_And = 'And';
export const AnswerValuesOperator_Or = 'Or';
export const VisibilityCondition_Equal = 'Equal';
export const VisibilityCondition_NotEqual = 'NotEqual';
export const Visibility_Visible = 'Visible';
export const MainQuestionClassType = 'MainQuestion';

export default class QuestionsSet {

    constructor(questions, answers) {
        this.questions = questions;
        this.answers = [];
        // map answers to associate array
        for (let a of answers)
            this.answers[a.question_id] = a;
        // associative array ( rule id , rule);
        this.rules = this.getRules();
    }

    getRule = (q) => {
        let res = [];
        if(q.hasOwnProperty('sub_question_rules'))
            for (let r of q.sub_question_rules) {
                res[r.id] = r;
                res = {...res, ...this.getRule(r.sub_question)};
            }
        return res;
    }

    getRules = () => {
        let res = [];
        for (let q of this.questions) {
            res = {...res, ...this.getRule(q)};
        }
        return res;
    }

    allowsValues = (q) => {
        return AllowedMultipleValueQuestionType.includes(q.type);
    }

    allowsValue = (q, answer) => {
        let value = answer.value.split(',').map(v => parseInt(v));
        for (let av of value) {
            if (!q.values.map(e => e.id).includes(av))
                return false;
        }
        return true;
    }

    getAnswerFor = (q) => {
        let id = Number.isInteger(q) ? q : q.id;
        let a = this.answers[id] || null;
        return a ? a : null;
    }

    hasValue = (answer) => {
        return answer.value !== '';
    }

    answerContains = (answer, val) => {
        return answer.value.split(',').includes(val);
    }

    isSubQuestionVisible = (rule) => {
        let initialCondition = rule.answer_values_operator === AnswerValuesOperator_And ? true : false;
        const parentQuestionAnswer = this.getAnswerFor(rule.parent_question_id);
        if (!parentQuestionAnswer) {
            initialCondition = rule.visibility_condition === VisibilityCondition_Equal ? false : true;
        } else {
            switch (rule.visibility_condition) {
                case VisibilityCondition_Equal: {
                    for (let answerValue of rule.answer_values) {
                        if (rule.answer_values_operator === AnswerValuesOperator_And)
                            initialCondition = initialCondition && this.answerContains(parentQuestionAnswer, answerValue);
                        else
                            initialCondition = initialCondition || this.answerContains(parentQuestionAnswer, answerValue);
                    }
                }
                    break;
                case VisibilityCondition_NotEqual: {
                    for (let answerValue of rule.answer_values) {
                        if (rule.answer_values_operator === AnswerValuesOperator_And)
                            initialCondition = initialCondition && !this.answerContains(parentQuestionAnswer, answerValue);
                        else
                            initialCondition = initialCondition || !this.answerContains(parentQuestionAnswer, answerValue);
                    }
                }
                    break;
            }
        }
        // final visibility check
        if (rule.visibility === Visibility_Visible) {
            return initialCondition;
        }
        // not visible
        return !initialCondition;
    }

    isAnswered = (q) => {
        const answer = this.getAnswerFor(q);

        if (q.class === MainQuestionClassType) {
            if (!q.mandatory) return true;
            if (!answer) return false;
            if (!this.hasValue(answer)) return false;
            if (this.allowsValues(q) && !this.allowsValue(q, answer))
                return false;
            return true;
        }

        // check parent rules ...
        for (let ruleId of q.parent_rules) {
            if (!this.isSubQuestionVisible(this.rules[ruleId])) // if question is not visible skip it
                continue;
            if (!q.mandatory) return true;
            if (!answer) return false;
            if (!this.hasValue(answer)) return false;
            if (this.allowsValues(q) && !this.allowsValue(q, answer))
                return false;
            return true;
        }

        return true;
    }

    checkQuestion = (q) => {
        let res = this.isAnswered(q);
        if(q.hasOwnProperty('sub_question_rules'))
            for (let rule of q.sub_question_rules) {
                // check recursive all the tree till leaves ...
                res = res && this.checkQuestion(rule.sub_question);
            }
        return res;
    }

    completed = () => {
        let res = true;
        for (let q of this.questions) {
            res = res && this.checkQuestion(q);
        }
        return res;
    }
}