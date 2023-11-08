/**
 * enumKeys takes an enum and returns an array of strongly typed keys. Useful to iterate over string enums.
 * @param obj The enum
 * @returns An array of strong typed keys
 * @example
 *
 * enum MyEnum {
 *  Key1 = "value1",
 *  Key2 = "value2",
 *  Key3 = "value3"
 * }
 *
 * // ks's type is ("Key1" || "Key2" || "Key3")[]
 * const ks = enumKeys(MyEnum);
 *
 * // keys' type is MyEnum[]
 * // Unfortunately, we can't do this inside enumKeys because there is no generic type constraint for enums.
 * const keys = ks.map(k => MyEnum[k])
 */
function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
  return Object.keys(obj)
    .filter(k => Number.isNaN(+k))
    .map(k => k as K);
}

export default enumKeys;
