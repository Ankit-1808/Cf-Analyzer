import { render, screen } from "@testing-library/react";

import StudyPlan from "../components/StudyPlan";

describe("StudyPlan", () => {
  it("renders fallback state and external links", () => {
    render(
      <StudyPlan
        meta={{ fallbackUsed: true }}
        studyPlan={{
          weakness_summary: "Weakness summary",
          top_3_focus_areas: ["dp", "graphs", "math"],
          daily_plan: Array.from({ length: 30 }, (_, index) => ({
            day: index + 1,
            topic: `Topic ${index + 1}`,
            goal: `Goal ${index + 1}`,
            cf_filter_url: "https://codeforces.com/problemset?tags=dp"
          })),
          motivational_note: "Stay consistent."
        }}
      />
    );

    expect(screen.getByText(/fallback plan used/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /open cf set/i })).toHaveLength(30);
    expect(screen.getByText("Topic 1")).toBeInTheDocument();
  });
});
