import appConfigSchema from "../schemas/app-config.schema.json";

export const buildCategoriesYamlSchema = (backendSchema) => ({
  $defs: backendSchema.$defs,
  type: "object",
  required: ["categories"],
  additionalProperties: false,
  properties: {
    frequent_questions: backendSchema.properties.frequent_questions,
    categories: backendSchema.properties.categories,
  },
});

export const bundledCategoriesYamlSchema =
  buildCategoriesYamlSchema(appConfigSchema);
