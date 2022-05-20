/**
 * If the environment variable `LOG_REQUEST_BODIES` is set to `'true'`, then returns a string containing the request body, otherwise empty string.
 *
 * @param body The request body.
 * @returns Log string that should be appended to a log message.
 */
export function logRequestBody(body: any): string {
  if (!process.env.LOG_REQUEST_BODIES) {
    return '';
  }

  return `\nRequest-Body: ${JSON.stringify(body, null, 2)}`;
}

export interface MaskOptions {
  protectedProperties?: ReadonlyArray<string>;
  replacement?: string;
}

/**
 * Mask the given value.
 *
 * @param value Any value.
 * @param param1 Mask options.
 * @param param1.protectedProperties The properties that should be protected. Defaults to `['password', 'credentials', 'token']`.
 * @param param1.replacement The replacement string. Default is `'--REDACTED--'`.
 * @returns A copy of the given value, with masked properties for `password`, `credentials` and `token`.
 */
export function mask<T>(
  value: Readonly<T>,
  {
    protectedProperties = ['password', 'credentials', 'token'],
    replacement = '--REDACTED--',
  }: MaskOptions = {
    protectedProperties: ['password', 'credentials', 'token'],
    replacement: '--REDACTED--',
  },
): T {
  if (typeof value !== 'object' || value == null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((nestedValue) =>
      mask(nestedValue, { protectedProperties, replacement }),
    ) as any;
  }

  const copy: any = { ...value };

  for (const property of protectedProperties) {
    if (copy[property]) {
      copy[property] = replacement;
    }
  }

  for (const property in copy) {
    if (copy.hasOwnProperty(property)) {
      copy[property] = mask(copy[property], {
        protectedProperties,
        replacement,
      });
    }
  }

  return copy;
}
