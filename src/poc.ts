const extend = (fromClass, toElement) => {
  const classContents: string = fromClass.prototype.constructor.toString();
  const match = /constructor\s*\([^\)]*\)\s*{/gm.exec(classContents);
  let constructor: Function = function() {};
  if (match) {
    const startIndex = match.index + match[0].length;
    let bracketsLevel = 1;
    let endIndex = startIndex;
    while (bracketsLevel) {
      const char = classContents[endIndex];
      if (char === "}") {
        bracketsLevel--;
      } else if (char === "{") {
        bracketsLevel++;
      }
      endIndex++;
    }
    const constructorContents = classContents
      .slice(startIndex, endIndex - 1)
      .replace(/(^|[^\w])super\s*\(\s*\)\s*\;?/gm, "$1");
    constructor = new Function(constructorContents);
  }

  Object.getOwnPropertyNames(fromClass.prototype).forEach(property => {
    if (property === "constructor") return;
    Object.defineProperty(
      toElement,
      property,
      Object.getOwnPropertyDescriptor(fromClass.prototype, property)
    );
  });

  constructor.call(toElement);
};

class Test extends HTMLElement {
  constructor() {
    super();
    this.innerText = "Dupa";
  }
  test() {}
  get prop() {
    return "test";
  }
}

const p = document.querySelector("p");
extend(Test, p);
console.log(p.prop);
