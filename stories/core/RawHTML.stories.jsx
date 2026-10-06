import RawHTML from "../../src/components/raw-html";

export default {
  title: "Core/Display/RawHTML",
  component: RawHTML
};

export const Default = {
  args: { children: "Sponsors get <strong>priority placement</strong> and a <em>dedicated booth</em>." }
};

export const ReplaceNewLine = {
  args: { children: "Line one\nLine two\nLine three", replaceNewLine: true }
};
