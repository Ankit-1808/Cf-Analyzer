const request = require("supertest");

const { createApp } = require("../index");

function sampleStudyPlan() {
  return {
    weakness_summary: "Focus on dp and graphs.",
    top_3_focus_areas: ["dp", "graphs", "math"],
    daily_plan: Array.from({ length: 30 }, (_, index) => ({
      day: index + 1,
      topic: `Topic ${index + 1}`,
      goal: `Goal ${index + 1}`,
      cf_filter_url: "https://codeforces.com/problemset?tags=dp"
    })),
    motivational_note: "Stay steady."
  };
}

describe("GET /api/analyze/:handle", () => {
  const now = new Date("2026-05-12T10:00:00.000Z");

  it("returns cached analysis when it is still fresh", async () => {
    const AnalysisModel = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          profile: { handle: "tourist" },
          stats: { totalProblemsSolved: 10 },
          studyPlan: sampleStudyPlan(),
          meta: { fallbackUsed: false, reason: null },
          generatedAt: now.toISOString(),
          expiresAt: "2026-05-12T12:00:00.000Z"
        })
      }),
      findOneAndUpdate: vi.fn()
    };

    const app = createApp({
      analyzeRouteDeps: {
        AnalysisModel,
        now: () => now
      }
    });

    const response = await request(app).get("/api/analyze/tourist");

    expect(response.status).toBe(200);
    expect(response.body.cached).toBe(true);
    expect(response.body.profile.handle).toBe("tourist");
    expect(AnalysisModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("computes and stores a fresh analysis on a cache miss", async () => {
    const AnalysisModel = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null)
      }),
      findOneAndUpdate: vi.fn().mockResolvedValue({})
    };
    const getCodeforcesData = vi.fn().mockResolvedValue({
      profile: { handle: "tourist", rating: 1800 },
      ratingHistory: [],
      submissions: []
    });
    const analyzeCodeforcesData = vi.fn().mockReturnValue({
      totalProblemsSolved: 0,
      avgSolvedPerDay: 0,
      mostActiveTimeOfDay: "No submissions yet",
      weakestTags: [],
      strongestTags: [],
      tagStats: [],
      ratingHistory: [],
      recentRatingTrend: { trendLabel: "stable", netDelta: 0, contests: [] },
      heatmap: { days: [], activeDays: 0, totalSubmissions: 0, maxCount: 0 },
      waPatterns: {
        totalWrongAnswers: 0,
        mostCommonFailureVerdict: null,
        verdictBreakdown: [],
        topWrongAnswerTags: []
      }
    });
    const generateStudyPlan = vi.fn().mockResolvedValue({
      studyPlan: sampleStudyPlan(),
      meta: { fallbackUsed: false, reason: null }
    });

    const app = createApp({
      analyzeRouteDeps: {
        AnalysisModel,
        getCodeforcesData,
        analyzeCodeforcesData,
        generateStudyPlan,
        now: () => now
      }
    });

    const response = await request(app).get("/api/analyze/tourist");

    expect(response.status).toBe(200);
    expect(response.body.cached).toBe(false);
    expect(getCodeforcesData).toHaveBeenCalledWith("tourist");
    expect(AnalysisModel.findOneAndUpdate).toHaveBeenCalled();
  });

  it("bypasses cache when refresh=true and preserves fallback meta", async () => {
    const AnalysisModel = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          expiresAt: "2026-05-12T12:00:00.000Z"
        })
      }),
      findOneAndUpdate: vi.fn().mockResolvedValue({})
    };

    const app = createApp({
      analyzeRouteDeps: {
        AnalysisModel,
        getCodeforcesData: vi.fn().mockResolvedValue({
          profile: { handle: "tourist", rating: 1500 },
          ratingHistory: [],
          submissions: []
        }),
        analyzeCodeforcesData: vi.fn().mockReturnValue({
          totalProblemsSolved: 0,
          avgSolvedPerDay: 0,
          mostActiveTimeOfDay: "No submissions yet",
          weakestTags: [],
          strongestTags: [],
          tagStats: [],
          ratingHistory: [],
          recentRatingTrend: { trendLabel: "stable", netDelta: 0, contests: [] },
          heatmap: { days: [], activeDays: 0, totalSubmissions: 0, maxCount: 0 },
          waPatterns: {
            totalWrongAnswers: 0,
            mostCommonFailureVerdict: null,
            verdictBreakdown: [],
            topWrongAnswerTags: []
          }
        }),
        generateStudyPlan: vi.fn().mockResolvedValue({
          studyPlan: sampleStudyPlan(),
          meta: { fallbackUsed: true, reason: "CLAUDE_GENERATION_FAILED" }
        }),
        now: () => now
      }
    });

    const response = await request(app).get("/api/analyze/tourist?refresh=true");

    expect(response.status).toBe(200);
    expect(response.body.cached).toBe(false);
    expect(response.body.meta.fallbackUsed).toBe(true);
  });

  it("returns a 400 for invalid handles", async () => {
    const app = createApp();

    const response = await request(app).get("/api/analyze/invalid handle");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
