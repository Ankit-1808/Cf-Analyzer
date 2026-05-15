const { createAIService, parseClaudeJson } = require("../services/aiService");

function buildValidPlan() {
  return {
    weakness_summary: "The user struggles most on dp-heavy sets but has enough volume to improve quickly.",
    top_3_focus_areas: ["dp", "math", "greedy"],
    daily_plan: Array.from({ length: 30 }, (_, index) => ({
      day: index + 1,
      topic: `Topic ${index + 1}`,
      goal: `Goal ${index + 1}`,
      cf_filter_url: `https://codeforces.com/problemset?tags=dp&day=${index + 1}`
    })),
    motivational_note: "Keep the streak alive and review mistakes every few days."
  };
}

describe("aiService", () => {
  it("parses fenced JSON returned by Claude", () => {
    const parsed = parseClaudeJson(`\`\`\`json\n${JSON.stringify(buildValidPlan(), null, 2)}\n\`\`\``);

    expect(parsed.top_3_focus_areas).toHaveLength(3);
    expect(parsed.daily_plan[0].day).toBe(1);
    expect(parsed.daily_plan[29].day).toBe(30);
  });

  it("returns Claude output when the payload is valid", async () => {
    const service = createAIService({
      client: {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: "text",
                text: JSON.stringify(buildValidPlan())
              }
            ]
          })
        }
      }
    });

    const result = await service.generateStudyPlan({
      profile: { handle: "tourist", rating: 2000 },
      stats: {
        totalProblemsSolved: 100,
        avgSolvedPerDay: 2.5,
        mostActiveTimeOfDay: "Evening (18:00-23:59 UTC)",
        weakestTags: [{ tag: "dp", attempted: 10, solved: 4, acPercent: 40 }],
        strongestTags: [{ tag: "math", attempted: 10, solved: 9, acPercent: 90 }],
        recentRatingTrend: { contests: [] }
      }
    });

    expect(result.meta.fallbackUsed).toBe(false);
    expect(result.studyPlan.daily_plan).toHaveLength(30);
  });

  it("falls back when Claude returns invalid JSON", async () => {
    const service = createAIService({
      client: {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: "text",
                text: '{"oops":true}'
              }
            ]
          })
        }
      }
    });

    const result = await service.generateStudyPlan({
      profile: { handle: "tourist", rating: 1400 },
      stats: {
        totalProblemsSolved: 25,
        avgSolvedPerDay: 0.6,
        mostActiveTimeOfDay: "Morning (06:00-11:59 UTC)",
        weakestTags: [{ tag: "graphs", attempted: 8, solved: 2, acPercent: 25 }],
        strongestTags: [{ tag: "implementation", attempted: 12, solved: 10, acPercent: 83.33 }],
        recentRatingTrend: { contests: [] }
      }
    });

    expect(result.meta.fallbackUsed).toBe(true);
    expect(result.studyPlan.daily_plan).toHaveLength(30);
    expect(result.studyPlan.top_3_focus_areas).toHaveLength(3);
  });
});
