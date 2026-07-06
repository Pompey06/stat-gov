import { linter } from "@codemirror/lint";
import Ajv from "ajv";
import { parse } from "yaml";

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });

const lineOffset = (doc, line, column) => {
  const lines = doc.split("\n");
  let offset = 0;

  for (let index = 0; index < line - 1; index += 1) {
    offset += lines[index].length + 1;
  }

  return offset + Math.max(0, column - 1);
};

const formatAjvError = (error) => {
  const path = error.instancePath || "document";
  return `${path}: ${error.message}`;
};

export const validateYamlDocument = (text, schema) => {
  if (!schema) {
    return [];
  }

  const validate = ajv.compile(schema);

  try {
    const document = parse(text);

    if (!validate(document)) {
      return (validate.errors ?? []).map(formatAjvError);
    }

    return [];
  } catch (error) {
    return [error.message];
  }
};

export const createYamlSchemaLinter = (schema) => {
  if (!schema) {
    return [];
  }

  return linter((view) => {
    const text = view.state.doc.toString();
    const diagnostics = [];

    try {
      const document = parse(text);
      const validate = ajv.compile(schema);

      if (!validate(document)) {
        for (const error of validate.errors ?? []) {
          diagnostics.push({
            from: 0,
            to: Math.min(text.length, 1),
            severity: "warning",
            message: formatAjvError(error),
          });
        }
      }
    } catch (error) {
      const linePos = error.linePos?.[0];

      if (linePos) {
        const from = lineOffset(text, linePos.line, linePos.col);
        const lineEnd = text.indexOf("\n", from);
        const to = lineEnd === -1 ? text.length : lineEnd;

        diagnostics.push({
          from,
          to,
          severity: "error",
          message: error.message,
        });
      } else {
        diagnostics.push({
          from: 0,
          to: Math.min(text.length, 1),
          severity: "error",
          message: error.message,
        });
      }
    }

    return diagnostics;
  });
};
