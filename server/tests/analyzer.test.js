const { analyzeCodeforcesData } = require("../services/analyzer");

describe("analyzer service", () => {
  it("computes weakest and strongest tags, heatmap, and rating trend", () => {
    const result = analyzeCodeforcesData({
      profile: { handle: "tourist", rating: 1900 },
      ratingHistory: [
        {
          contestId: 1,
          contestName: "Round 1",
          newRating: 1500,
          delta: 50,
          date: "2024-01-01T00:00:00.000Z"
        },
        {
          contestId: 2,
          contestName: "Round 2",
          newRating: 1490,
          delta: -10,
          date: "2024-01-10T00:00:00.000Z"
        },
        {
          contestId: 3,
          contestName: "Round 3",
          newRating: 1520,
          delta: 30,
          date: "2024-01-20T00:00:00.000Z"
        }
      ],
      submissions: [
        {
          verdict: "OK",
          creationTimeSeconds: 1710000000,
          problem: {
            key: "1:A:Alpha",
            tags: ["math", "greedy"]
          }
        },
        {
          verdict: "WRONG_ANSWER",
          creationTimeSeconds: 1710003600,
          problem: {
            key: "2:B:Beta",
            tags: ["dp"]
          }
        },
        {
          verdict: "TIME_LIMIT_EXCEEDED",
          creationTimeSeconds: 1710086400,
          problem: {
            key: "3:C:Gamma",
            tags: ["dp"]
          }
        },
        {
          verdict: "OK",
          creationTimeSeconds: 1710172800,
          problem: {
            key: "4:D:Delta",
            tags: ["implementation"]
          }
        }
      ]
    });

    expect(result.totalProblemsSolved).toBe(2);
    expect(result.strongestTags[0].tag).toBe("greedy");
    expect(result.weakestTags[0].tag).toBe("dp");
    expect(result.recentRatingTrend.trendLabel).toBe("upward");
    expect(result.heatmap.days).toHaveLength(365);
    expect(result.waPatterns.totalWrongAnswers).toBe(1);
  });

  it("returns safe empty states when the user has no submissions or contests", () => {
    const result = analyzeCodeforcesData({
      profile: { handle: "newbie", rating: 0 },
      ratingHistory: [],
      submissions: []
    });

    expect(result.totalProblemsSolved).toBe(0);
    expect(result.avgSolvedPerDay).toBe(0);
    expect(result.mostActiveTimeOfDay).toBe("No submissions yet");
    expect(result.ratingHistory).toEqual([]);
    expect(result.recentRatingTrend.trendLabel).toBe("stable");
    expect(result.heatmap.days).toHaveLength(365);
  });
});
