export const CheckBoxQuestionType = 'CheckBox';
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
import {toSlug} from "./methods";

export default class QuestionsSet {

    constructor(questions, answers = []) {
        this.questions = questions;
        this.originalAnswers = answers
        this.answers = [];
        // map answers to associate array
        for (let a of this.originalAnswers)
            this.answers[a.question_id] = a;
        this.questionByName = {}
        this.questionById = {}
        // associative array ( rule id , rule);
        this.rules = {};
        this._parseQuestions();
    }

    _parseQuestion = (q) => {
        this.questionByName[toSlug(q.name)] = q;
        this.questionById[parseInt(q.id)] = q;
        if(q.hasOwnProperty('sub_question_rules'))
            for (let r of q.sub_question_rules) {
                this.rules[parseInt(r.id)] = r;
                this._parseQuestion(r.sub_question);
            }
    }

    _parseQuestions = () => {
        for (let q of this.questions) {
            this._parseQuestion(q);
        }
    }

    _allowsValues = (q) => {
        return AllowedMultipleValueQuestionType.includes(q.type);
    }

    _allowsValue = (q, answer) => {
        let value = answer.value.split(',').map(v => parseInt(v));
        for (let av of value) {
            if (!q.values.map(e => e.id).includes(av))
                return false;
        }
        return true;
    }

    _getAnswerFor = (q) => {
        let id = Number.isInteger(q) ? q : q.id;
        let a = this.answers[id] || null;
        return a ? a : null;
    }

    _hasValue = (answer) => {
        return answer.value !== '';
    }

    _answerContains = (answer, val) => {
        return answer.value.split(',').includes(val);
    }

    _isSubQuestionVisible = (rule) => {
        let initialCondition = rule.answer_values_operator === AnswerValuesOperator_And ? true : false;
        const parentQuestionAnswer = this._getAnswerFor(rule.parent_question_id);
        if (!parentQuestionAnswer) {
            initialCondition = rule.visibility_condition === VisibilityCondition_Equal ? false : true;
        } else {
            switch (rule.visibility_condition) {
                case VisibilityCondition_Equal: {
                    for (let answerValue of rule.answer_values) {
                        if (rule.answer_values_operator === AnswerValuesOperator_And)
                            initialCondition = initialCondition && this._answerContains(parentQuestionAnswer, answerValue);
                        else
                            initialCondition = initialCondition || this._answerContains(parentQuestionAnswer, answerValue);
                    }
                }
                    break;
                case VisibilityCondition_NotEqual: {
                    for (let answerValue of rule.answer_values) {
                        if (rule.answer_values_operator === AnswerValuesOperator_And)
                            initialCondition = initialCondition && !this._answerContains(parentQuestionAnswer, answerValue);
                        else
                            initialCondition = initialCondition || !this._answerContains(parentQuestionAnswer, answerValue);
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

    _isAnswered = (q) => {
        const answer = this._getAnswerFor(q);

        if (q.class === MainQuestionClassType) {
            if (!q.mandatory) return true;
            if (!answer) return false;
            if (!this._hasValue(answer)) return false;
            if (this._allowsValues(q) && !this._allowsValue(q, answer))
                return false;
            return true;
        }

        // check parent rules ...
        for (let ruleId of q.parent_rules) {
            if (!this._isSubQuestionVisible(this.rules[ruleId])) // if question is not visible skip it
                continue;
            if (!q.mandatory) return true;
            if (!answer) return false;
            if (!this._hasValue(answer)) return false;
            if (this._allowsValues(q) && !this._allowsValue(q, answer))
                return false;
            return true;
        }

        return true;
    }

    _checkQuestion = (q) => {
        let res = this._isAnswered(q);
        if(q.hasOwnProperty('sub_question_rules'))
            for (let rule of q.sub_question_rules) {
                // check recursive all the tree till leaves ...
                res = res && this._checkQuestion(rule.sub_question);
            }
        return res;
    }

    _formatQuestionAnswer = (question) => {
        let res = {};
        const slug = toSlug(question.name);
        let userAnswer = this.originalAnswers.find(a => a.question_id === question.id)?.value;
        if(!userAnswer && question?.values?.length > 0){
            // check default value
            const defaultVal = question.values.find(v => v.is_default);
            if(defaultVal) userAnswer = defaultVal.id.toString();
        }
        if(userAnswer) {
            if (question.type === CheckBoxQuestionType) userAnswer = userAnswer === 'false' ? false : !!userAnswer;
            if (question.type === RadioButtonListQuestionType || question.type === ComboBoxQuestionType) userAnswer = parseInt(userAnswer);
            if (question.type === CheckBoxListQuestionType) userAnswer = userAnswer.split(',').map(ansVal => parseInt(ansVal)) || [];
        }

        res[slug] =  userAnswer || '';
        if(question.type === CheckBoxListQuestionType && res[slug] === '') res[slug] = []
        if(question.hasOwnProperty('sub_question_rules'))
            for (let rule of question.sub_question_rules) {
                // check recursive all the tree till leaves ...
                let res1 = this._formatQuestionAnswer(rule.sub_question);
                res = {...res, ...res1};
            }
        return res;
    }

    formatAnswers = () => {
        let res = {}
        this.questions.forEach(q => {
            let res1 = this._formatQuestionAnswer(q);
            res = {...res,...res1};
        });
        return res;
    }

    completed = () => {
        let res = true;
        for (let q of this.questions) {
            res = res && this._checkQuestion(q);
        }
        return res;
    }

    getQuestionByName = (name) => {
        const slug = toSlug(name)
        return this.questionByName[name] || this.questionByName[slug]  || null;
    }

    getQuestionById = (id) => {
        return this.questionById[parseInt(id)] || null;
    }
}
