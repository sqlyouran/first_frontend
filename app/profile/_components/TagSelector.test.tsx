import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TagSelector from "@/app/profile/_components/TagSelector";
import type { InterestTag } from "@/lib/api/profile";

const sampleTags: InterestTag[] = [
  { value: "hiking", label: "Hiking", category: "outdoors" },
  { value: "camping", label: "Camping", category: "outdoors" },
  { value: "street_food", label: "Street Food", category: "food" },
  { value: "photography", label: "Photography", category: "arts" },
];

describe("TagSelector", () => {
  it("renders tags grouped by category", () => {
    render(
      <TagSelector tags={sampleTags} selected={[]} onChange={() => {}} />
    );

    expect(screen.getByText("outdoors")).toBeInTheDocument();
    expect(screen.getByText("food")).toBeInTheDocument();
    expect(screen.getByText("arts")).toBeInTheDocument();
    expect(screen.getByText("Hiking")).toBeInTheDocument();
    expect(screen.getByText("Camping")).toBeInTheDocument();
    expect(screen.getByText("Street Food")).toBeInTheDocument();
    expect(screen.getByText("Photography")).toBeInTheDocument();
  });

  it("marks selected tags with data-selected=true", () => {
    render(
      <TagSelector
        tags={sampleTags}
        selected={["hiking"]}
        onChange={() => {}}
      />
    );

    const hikingBtn = screen.getByText("Hiking").closest("button");
    expect(hikingBtn).toHaveAttribute("data-selected", "true");

    const campingBtn = screen.getByText("Camping").closest("button");
    expect(campingBtn).toHaveAttribute("data-selected", "false");
  });

  it("calls onChange with added tag when clicking unselected tag", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagSelector
        tags={sampleTags}
        selected={["hiking"]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("Street Food"));
    expect(onChange).toHaveBeenCalledWith(["hiking", "street_food"]);
  });

  it("calls onChange with removed tag when clicking selected tag", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagSelector
        tags={sampleTags}
        selected={["hiking", "street_food"]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("Hiking"));
    expect(onChange).toHaveBeenCalledWith(["street_food"]);
  });

  it("disables unselected tags when max selections reached", () => {
    render(
      <TagSelector
        tags={sampleTags}
        selected={["hiking", "camping", "street_food"]}
        onChange={() => {}}
        maxSelections={3}
      />
    );

    const photographyBtn = screen.getByText("Photography").closest("button");
    expect(photographyBtn).toBeDisabled();

    // selected tags remain enabled
    const hikingBtn = screen.getByText("Hiking").closest("button");
    expect(hikingBtn).not.toBeDisabled();
  });
});
