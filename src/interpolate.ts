export const interpolate = (obj: any) => {
  const res = _i(obj, JSON.stringify(obj), [], { ...obj });

  return JSON.parse(res);
};

const getFromPath = (wholeObject: any, keys: string[]) => {
  let result = wholeObject;

  for (const i of keys) {
    if (!i) throw new Error("Not able to get that path");
    else result = result[i];
  }

  return result;
};

const _i = (val: any, str: string, path: string[], whole: any) => {
  for (const key in val) {
    switch (typeof val[key]) {
      case "object": {
        str = _i(val[key], str, [...path, key], whole);
        break;
      }

      case "string": {
        str = str.replace(
          new RegExp("\\${" + [...path, key].join(".") + "}", "g"),
          getFromPath(whole, [...path, key])
        );
        break;
      }

      case "boolean":
      case "number": {
        if (
          new RegExp('"\\${' + [...path, key].join(".") + '}"', "g").test(str)
        ) {
          str = str.replace(
            new RegExp('"\\${' + [...path, key].join(".") + '}"', "g"),
            getFromPath(whole, [...path, key])
          );
        } else {
          str = str.replace(
            new RegExp("\\${" + [...path, key].join(".") + "}", "g"),
            getFromPath(whole, [...path, key])
          );
        }
      }
    }

    whole = JSON.parse(str);
  }
  return str;
};
