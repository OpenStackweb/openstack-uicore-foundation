/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Autocomplete, TextField } from "@mui/material";
import MuiForm from "../mui-form";

const setup = (children, props = {}) => {
  const onSubmit = jest.fn((ev) => ev.preventDefault());
  render(
    <MuiForm onSubmit={onSubmit} {...props}>
      {children}
      <button type="submit">Save</button>
    </MuiForm>
  );
  return onSubmit;
};

describe("MuiForm", () => {
  test("does not submit on Enter in a text input", async () => {
    const onSubmit = setup(<input aria-label="name" />);
    await userEvent.type(screen.getByLabelText("name"), "hello{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("selects the highlighted autocomplete option on Enter without submitting", async () => {
    const onSubmit = setup(
      <Autocomplete
        options={["One", "Two"]}
        renderInput={(params) => <TextField {...params} label="pick" />}
      />
    );
    const input = screen.getByLabelText("pick");
    await userEvent.type(input, "{ArrowDown}{ArrowDown}{Enter}");
    expect(input).toHaveValue("Two");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("submits when clicking the submit button", async () => {
    const onSubmit = setup(<input aria-label="name" />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("submits on Enter when the submit button is focused", async () => {
    const onSubmit = setup(<input aria-label="name" />);
    screen.getByRole("button", { name: "Save" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("submits on Enter when an input of type submit is focused", async () => {
    const onSubmit = setup(<input type="submit" value="Send" />);
    screen.getByRole("button", { name: "Send" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("keeps new lines in a textarea", async () => {
    const onSubmit = setup(<textarea aria-label="notes" />);
    const textarea = screen.getByLabelText("notes");
    await userEvent.type(textarea, "a{Enter}b");
    expect(textarea).toHaveValue("a\nb");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("activates other buttons on Enter", async () => {
    const onClick = jest.fn();
    const onSubmit = setup(
      <button type="button" onClick={onClick}>
        Other
      </button>
    );
    screen.getByRole("button", { name: "Other" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("still calls a custom onKeyDown and keeps blocking Enter", async () => {
    const onKeyDown = jest.fn();
    const onSubmit = setup(<input aria-label="name" />, { onKeyDown });
    await userEvent.type(screen.getByLabelText("name"), "{Enter}");
    expect(onKeyDown).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
