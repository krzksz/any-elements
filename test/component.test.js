import Component from "../src/component";

describe("Component constructor", () => {
  test("is a function", () => {
    expect(typeof Component).toBe("function");
  });

  test("has a destructor", () => {
    expect(typeof Component.prototype.destructor).toBe("function");
  });

  test("sets element property when constructed", () => {
    const element = document.createElement("div");
    const component = new Component(element);
    expect(component.$element).toBe(element);
  });

  test("sets component property when constructed", () => {
    const element = document.createElement("div");
    const component = new Component(element);
    expect(element._smoll).toBe(component);
  });
});
