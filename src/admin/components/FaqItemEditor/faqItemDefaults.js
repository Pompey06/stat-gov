export const emptyLocalized = () => ({ ru: "", kz: "", en: "" });

export const createEmptyFaqItem = () => ({
  question: emptyLocalized(),
  answer: emptyLocalized(),
  subquestions: [],
});
