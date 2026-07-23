import appConfigSchema from "../schemas/app-config.schema.json";

export const buildCategoriesYamlSchema = (backendSchema) => ({
  $defs: backendSchema.$defs,
  type: "object",
  required: ["categories"],
  additionalProperties: false,
  properties: {
    categories: backendSchema.properties.categories,
  },
});

export const bundledCategoriesYamlSchema =
  buildCategoriesYamlSchema(appConfigSchema);
