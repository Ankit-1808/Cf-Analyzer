import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import Dashboard from "../pages/Dashboard";
import { analyzeHandle } from "../services/api";

vi.mock("../services/api", () => ({
  analyzeHandle: vi.fn()
}));

vi.mock("../components/TagChart", () => ({
  default: () => <div>Tag Chart Mock</div>
}));

vi.mock("../components/RatingChart", () => ({
  default: () => <div>Rating Chart Mock</div>
}));

vi.mock("../components/Heatmap", () => ({
  default: () => <div>Heatmap Mock</div>
}));

vi.mock("../components/StudyPlan", () => ({
  default: ({ meta }) => <div>{meta?.fallbackUsed ? "Fallback Plan Mock" : "Study Plan Mock"}</div>
}));

describe("Dashboard", () => {
  it("submits a handle and renders the analysis summary", async () => {
    analyzeHandle.mockResolvedValue({
      cached: false,
      meta: { fallbackUsed: false },
      profile: {
        handle: "tourist",
        avatar: "https://example.com/tourist.png",
        rank: "legendary grandmaster",
        rating: 3800,
        maxRank: "legendary grandmaster",
        maxRating: 3850,
        contribution: 0,
        friendOfCount: 999
      },
      stats: {
        totalProblemsSolved: 500,
        avgSolvedPerDay: 3.1,
        mostActiveTimeOfDay: "Evening (18:00-23:59 UTC)",
        weakestTags: [],
        strongestTags: [],
        tagStats: [],
        ratingHistory: [],
        recentRatingTrend: { trendLabel: "upward", netDelta: 50, contests: [] },
        heatmap: { days: [], activeDays: 0, totalSubmissions: 0, maxCount: 0 },
        waPatterns: {
          totalWrongAnswers: 0,
          mostCommonFailureVerdict: null,
          verdictBreakdown: [],
          topWrongAnswerTags: []
        }
      },
      studyPlan: {
        weakness_summary: "Summary",
        top_3_focus_areas: ["dp", "graphs", "math"],
        daily_plan: [],
        motivational_note: "Keep going"
      }
    });

    render(<Dashboard />);

    fireEvent.change(screen.getByLabelText(/codeforces handle/i), {
      target: { value: "tourist" }
    });
    fireEvent.click(screen.getByRole("button", { name: /analyze handle/i }));

    await waitFor(() => expect(analyzeHandle).toHaveBeenCalledWith("tourist", { refresh: false }));
    expect(await screen.findByText("tourist")).toBeInTheDocument();
    expect(screen.getByText("Tag Chart Mock")).toBeInTheDocument();
    expect(screen.getByText("Rating Chart Mock")).toBeInTheDocument();
    expect(screen.getByText("Study Plan Mock")).toBeInTheDocument();
  });

  it("shows an API error when the request fails", async () => {
    analyzeHandle.mockRejectedValue({
      response: {
        data: {
          error: {
            message: "Codeforces handle not found."
          }
        }
      }
    });

    render(<Dashboard />);

    fireEvent.click(screen.getByRole("button", { name: /analyze handle/i }));

    expect(await screen.findByText("Codeforces handle not found.")).toBeInTheDocument();
  });
});
