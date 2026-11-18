import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const script = readFileSync(
  new URL("../public/js/contact.js", import.meta.url),
  "utf8",
);

function fixture(input = {}, reply = { ok: true, data: { ok: true } }) {
  const callbacks = {};
  const focused = [];
  const makeElement = () => ({
    attrs: {},
    textContent: "",
    getAttribute(name) {
      return this.attrs[name] || null;
    },
    setAttribute(name, value) {
      this.attrs[name] = value;
    },
    removeAttribute(name) {
      delete this.attrs[name];
    },
  });
  let sent = 0;
  let resets = 0;
  const fields = {};
  const rows = [];
  for (const [name, value] of Object.entries({
    type: "bug",
    name: "Test user",
    email: "person@example.invalid",
    message: "Issue",
    agree: "",
    company: "",
    ...input,
  })) {
    const error = makeElement();
    const field = {
      ...makeElement(),
      name,
      value,
      validity: {},
      checked: name === "agree",
      focus() {
        focused.push(name);
      },
      closest() {
        return row;
      },
    };
    const row = {
      error: false,
      classList: {
        toggle(_, show) {
          row.error = show;
        },
      },
      querySelector(selector) {
        return selector === ".form-error" ? error : field;
      },
    };
    rows.push(row);
    fields[name] = field;
  }
  const form = {
    elements: fields,
    addEventListener(name, handler) {
      callbacks[name] = handler;
    },
    querySelector() {
      return rows.find((row) => row.error);
    },
    reset() {
      resets++;
    },
  };
  const button = { disabled: false, querySelector: () => makeElement() };
  const fieldset = { disabled: false };
  const status = { querySelector: () => makeElement(), scrollIntoView() {} };
  const document = {
    addEventListener(name, handler) {
      callbacks[name] = handler;
    },
    documentElement: { getAttribute: () => "en" },
    getElementById(id) {
      return {
        "contact-form": form,
        "contact-fields": fieldset,
        "submit-btn": button,
        "form-status": status,
      }[id];
    },
  };
  const window = { matchMedia: () => ({ matches: true }) };
  runInNewContext(script, {
    document,
    window,
    FormData,
    AbortController,
    setTimeout,
    clearTimeout,
    async fetch() {
      sent++;
      return {
        ok: reply.ok,
        status: reply.status,
        json: async () => {
          assert.equal(fieldset.disabled, true);
          if (reply.invalidJson) throw new SyntaxError("HTML");
          return reply.data;
        },
      };
    },
  });
  callbacks.DOMContentLoaded();
  return {
    focused,
    fields,
    status,
    get sent() {
      return sent;
    },
    get resets() {
      return resets;
    },
    async submit() {
      callbacks.submit({ preventDefault() {} });
      await new Promise(setImmediate);
      assert.equal(button.disabled, false);
      assert.equal(fieldset.disabled, false);
    },
  };
}

test("whitespace-only names and messages and undotted mail domains focus the relevant field", async () => {
  const invalid = { name: "  ", message: " \n\t ", email: "person@local" };
  for (const [field, value] of Object.entries(invalid)) {
    const view = fixture({ [field]: value });
    await view.submit();
    assert.equal(view.sent, 0);
    assert.equal(view.fields[field].getAttribute("aria-invalid"), "true");
    assert.deepEqual(view.focused, [field]);
  }
});

test("the field named by a validation response receives focus and its inline error", async () => {
  const view = fixture(
    {},
    {
      ok: false,
      status: 400,
      data: { error: "validation_error", field: "email" },
    },
  );
  await view.submit();
  assert.equal(view.sent, 1);
  assert.equal(view.fields.email.getAttribute("aria-invalid"), "true");
  assert.deepEqual(view.focused, ["email"]);
  assert.equal(view.status.className, "form-status");
});

test("a message over 1,000 characters is retained and cannot be submitted", async () => {
  const message = "x".repeat(1001);
  const view = fixture({ message });
  await view.submit();
  assert.equal(view.fields.message.value, message);
  assert.equal(view.sent, 0);
  assert.deepEqual(view.focused, ["message"]);
});

test("only explicit JSON success clears the draft", async () => {
  for (const reply of [
    { ok: true, status: 200, invalidJson: true },
    { ok: true, status: 200, data: { ok: false } },
    { ok: false, status: 503, data: { ok: true } },
  ]) {
    const view = fixture({}, reply);
    await view.submit();
    assert.match(view.status.className, /is-error/);
    assert.equal(view.resets, 0);
  }
  const view = fixture();
  await view.submit();
  assert.match(view.status.className, /is-success/);
  assert.equal(view.resets, 1);
});
