import { register, unregister, attach, detach } from "../src/registry";
import Component from "../src/component";

const mockComponentDestructor = jest.fn();
jest.mock("../src/component", () => {
  return jest.fn().mockImplementation(() => {
    return { destructor: mockComponentDestructor };
  });
});

import "mutationobserver-shim";

describe("register function", () => {
  test("is exported", () => {
    expect(register).not.toBe(undefined);
  });

  test("is a function", () => {
    expect(typeof register).toBe("function");
  });
});

describe("unregister function", () => {
  test("is exported", () => {
    expect(unregister).not.toBe(undefined);
  });

  test("is a function", () => {
    expect(typeof unregister).toBe("function");
  });
});

describe("attach function", () => {
  test("is exported", () => {
    expect(attach).not.toBe(undefined);
  });

  test("is a function", () => {
    expect(typeof attach).toBe("function");
  });

  test("does not throw", () => {
    expect(() => {
      attach();
      detach();
    }).not.toThrow();
  });
});

describe("detach function", () => {
  test("is exported", () => {
    expect(detach).not.toBe(undefined);
  });

  test("is a function", () => {
    expect(typeof detach).toBe("function");
  });

  test("does not throw when attached before", () => {
    expect(() => {
      attach();
      detach();
    }).not.toThrow();
  });

  test("does not throw when not attached before", () => {
    expect(() => {
      detach();
    }).not.toThrow();
  });
});

describe("Custom component", () => {
  jest.useFakeTimers();

  beforeEach(() => {
    Component.mockClear();
    mockComponentDestructor.mockClear();
  });

  test("is constructed when appears in DOM with text nodes", () => {
    register(".component", "Component", Component);
    attach();
    document.body.innerHTML = `<p class="component"></p>Some text node`;
    jest.runOnlyPendingTimers();

    expect(Component).toHaveBeenCalled();
  });

  test("is constructed with matching element", () => {
    register(".component", "Component", Component);
    attach();
    const element = document.createElement("div");
    element.classList.add("component");
    document.body.appendChild(element);
    jest.runOnlyPendingTimers();

    expect(Component).toHaveBeenCalledWith(element);
  });

  test("is constructed when appears in DOM directly in root", () => {
    register(".component", "Component", Component);
    attach();
    document.body.innerHTML = `<p class="component"></p>`;
    jest.runOnlyPendingTimers();
    unregister(".component", "Component");

    expect(Component).toHaveBeenCalled();
  });

  test("is constructed when appears in DOM as child", () => {
    register(".child", "Component", Component);
    attach();
    document.body.innerHTML = `<p class="parent"><p class="child"></p></p>`;
    jest.runOnlyPendingTimers();
    unregister(".component", "Component");

    expect(Component).toHaveBeenCalled();
  });

  test("is constructed in complicated dom", () => {
    register(".child", "Component", Component);
    attach();
    document.body.innerHTML = `<p class="parent"><p class="child"></p></p><div class="some div">Some text</div>`;
    jest.runOnlyPendingTimers();
    unregister(".component", "Component");

    expect(Component).toHaveBeenCalled();
  });

  test("is destructed when appears in DOM directly in root", () => {
    register(".component", "Component", Component);
    attach();
    document.body.innerHTML = `<p class="component"></p>`;
    jest.runOnlyPendingTimers();
    document.body.innerHTML = "";
    jest.runOnlyPendingTimers();
    unregister(".component", "Component");

    expect(mockComponentDestructor).toHaveBeenCalled();
  });

  test("is destructed when appears in DOM with text nodes", () => {
    register(".component", "Component", Component);
    attach();
    document.body.innerHTML = `<p class="component"></p>Some text node`;
    jest.runOnlyPendingTimers();
    document.body.innerHTML = "";
    jest.runOnlyPendingTimers();
    unregister(".component", "Component");

    expect(mockComponentDestructor).toHaveBeenCalled();
  });

  test("is destructed when appears in DOM as child in root", () => {
    register(".child", "Component", Component);
    attach();
    document.body.innerHTML = `<p class="parent"><p class="child"></p></p>`;
    jest.runOnlyPendingTimers();
    document.body.innerHTML = "";
    jest.runOnlyPendingTimers();
    unregister(".component", "Component");

    expect(mockComponentDestructor).toHaveBeenCalled();
  });
});
