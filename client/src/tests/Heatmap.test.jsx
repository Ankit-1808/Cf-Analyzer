import { render, screen } from "@testing-library/react";

import Heatmap from "../components/Heatmap";

describe("Heatmap", () => {
  it("renders 365 submission cells with intensity classes", () => {
    const start = new Date("2025-01-01T00:00:00.000Z");
    const days = Array.from({ length: 365 }, (_, index) => {
      const current = new Date(start.getTime() + index * 24 * 60 * 60 * 1000);

      return {
        date: current.toISOString().slice(0, 10),
        count: index % 5,
        intensity: index % 5
      };
    });

    render(
      <Heatmap
        heatmap={{
          days,
          activeDays: 200,
          totalSubmissions: 500,
          maxCount: 4
        }}
      />
    );

    expect(screen.getAllByTestId("heat-cell")).toHaveLength(365);
  });

  it("shows an empty state when no heatmap data exists", () => {
    render(<Heatmap heatmap={{ days: [] }} />);

    expect(screen.getByText(/no submission activity found yet/i)).toBeInTheDocument();
  });
});
