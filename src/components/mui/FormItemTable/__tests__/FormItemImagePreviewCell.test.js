import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { I18nextProvider } from "react-i18next";
import FormItemImagePreviewCell from "../FormItemImagePreviewCell";
import i18n from "../../../i18n";

const renderWithI18n = (ui) =>
  render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe("FormItemImagePreviewCell", () => {
  const imageUrl = "https://example.com/image.jpg";
  const itemName = "Test Item";

  it("does not render anything if imageUrl is null", () => {
    renderWithI18n(
      <FormItemImagePreviewCell imageUrl={null} itemName={itemName} />
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders the image button and opens popover on hover", () => {
    renderWithI18n(
      <FormItemImagePreviewCell imageUrl={imageUrl} itemName={itemName} />
    );
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    fireEvent.mouseEnter(button);
    // The popover should open and show the image
    const img = screen.getByAltText(/preview image for/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", imageUrl);
  });

  it("shows error message if image fails to load", () => {
    renderWithI18n(
      <FormItemImagePreviewCell imageUrl={imageUrl} itemName={itemName} />
    );
    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);
    const img = screen.getByAltText(/preview image for/i);
    // Simulate image load error
    fireEvent.error(img);
    // The text may be inside a <p> or split, so use a function matcher
    expect(
      screen.getByText((content) =>
        content.toLowerCase().includes("image preview unavailable")
      )
    ).toBeInTheDocument();
  });

  it("opens the image in a new tab on click", () => {
    window.open = jest.fn();
    renderWithI18n(
      <FormItemImagePreviewCell imageUrl={imageUrl} itemName={itemName} />
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(window.open).toHaveBeenCalledWith(
      imageUrl,
      "_blank",
      "noopener,noreferrer"
    );
  });
});
