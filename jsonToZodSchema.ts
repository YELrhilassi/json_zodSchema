import { ZodType, z } from 'zod';

export const jsonToZod = (obj: any): ZodType<any, any, any> => {
  const parse = (obj: any, seen: object[]): ZodType<any, any, any> => {
    switch (typeof obj) {
      case 'string':
        return z.string();
      case 'number':
        return z.number();
      case 'bigint':
        return z.number().int();
      case 'boolean':
        return z.boolean();
      case 'object':
        if (obj === null) {
          return z.null();
        }
        if (seen.includes(obj)) {
          throw new Error('Circular objects are not supported');
        }
        seen.push(obj);
        if (Array.isArray(obj)) {
          const options = obj.map((item: any) => parse(item, seen));
          const uniqueOptions = [...new Set(options)];
          if (uniqueOptions.length === 1) {
            return z.array(uniqueOptions[0]);
          } else if (uniqueOptions.length > 1) {
            return z.array(uniqueOptions.reduce((acc, item) => acc.or(item)));
          } else {
            return z.array(z.unknown());
          }
        }
        const shape = Object.entries(obj).reduce(
          (acc: { [key: string]: ZodType<any, any, any> }, [key, value]) => {
            acc[key] = parse(value, seen);
            return acc;
          },
          {}
        );
        return z.object(shape);
      case 'undefined':
        return z.undefined();
      case 'function':
        return z.function();
      case 'symbol':
      default:
        return z.unknown();
    }
  };

  return parse(obj, []);
};
