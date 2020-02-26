export async function validate(schema, data) {
  try {
    if (schema) {
      await schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      });
    }
    return [];
  } catch (err) {
    return err.errors;
  }
}

export function a() {}
