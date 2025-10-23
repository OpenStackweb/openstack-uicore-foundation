import {
  QuestionType_Checkbox,
  QuestionType_CheckBoxList,
  QuestionType_ComboBox,
  QuestionType_CountryComboBox,
  QuestionType_RadioButtonList
} from "../constants";

export const checkRule = (value, rule) => {
  const values = rule.answer_values;

  if (!value) return false;

  if (Array.isArray(value)) {
    if (!value.length) return false;
    let res = rule.answer_values_operator === "And";
    values.forEach((v) => {
      if (rule.answer_values_operator === "And") {
        res = res && value.includes(v);
      } else {
        // Or
        res = res || value.includes(v);
      }
    });
    return res;
  }
  return values.includes(value?.toString());
};

export const checkVisibility = (rule, ruleResult) => {
  if (rule.visibility === "Visible") {
    if (rule.visibility_condition === "Equal") {
      return !!ruleResult;
    }
    // Non Equal
    return !ruleResult;
  }
  // not visible
  if (rule.visibility_condition === "Equal") {
    return !ruleResult;
  }
  return !!ruleResult;
};

export const toSlug = (text, questionId) => {
  const textLC = text.toLowerCase();
  return `${textLC.replace(/[^a-zA-Z0-9]+/g, "_")}_${questionId}`;
};

export const getLabel = (q) =>
  // replace line breaks and remove outer <p>
  q?.label?.replace(/\n/g, " ").replace(/<p>(.*)<\/p>/gi, "$1");

export const isAnswered = (answer) => {
  if (!answer) return false;
  // check type
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === "string") return answer.length > 0;
  if (typeof answer === "number") return answer > 0;
  if (typeof answer === "boolean") return answer;
  return false;
};

export const checkIfValueMatch = (answer, compareVal) => {
  const answerArray = Array.isArray(answer) ? answer : [answer];

  return answerArray.some((v) => {
    if (Array.isArray(compareVal)) {
      return compareVal.includes(`${v}`);
    }
    return `${v}` === `${compareVal}`;
  });
};

export const getTypeInitialValue = (q) => {
  switch (q.type) {
    case QuestionType_Checkbox:
      return false;
    case QuestionType_RadioButtonList:
      return null;
    case QuestionType_CheckBoxList:
      return [];
    case QuestionType_CountryComboBox:
    case QuestionType_ComboBox:
      return "";
    default:
      return "";
  }
};

export const getTypeValue = (ans, type) => {
  switch (type) {
    case QuestionType_Checkbox:
      return ans === "true";
    case QuestionType_CheckBoxList:
      return ans?.split(",") || [];
    case QuestionType_CountryComboBox:
    case QuestionType_ComboBox:
      return ans || "";
    case QuestionType_RadioButtonList:
      return ans || null;
    default:
      return ans;
  }
};

export const transformAnwersFormat = (answers) => {
  const {
    attendee_email,
    attendee_first_name,
    attendee_last_name,
    attendee_company,
    disclaimer_accepted,
    ...extra_questions
  } = answers;

  const formattedEQ = Object.entries(extra_questions).map(([key, value]) => ({
    question_id: parseInt(key.split("_").pop(), 10),
    answer: value?.toString() || null
  }));

  return {
    attendee_email,
    attendee_first_name,
    attendee_last_name,
    attendee_company,
    disclaimer_accepted,
    extra_questions: formattedEQ
  };
};
