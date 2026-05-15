const { createCodeforcesService } = require("../services/cfApi");

describe("cfApi service", () => {
  it("fetches and normalizes Codeforces data", async () => {
    const httpClient = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          data: {
            status: "OK",
            result: [
              {
                handle: "tourist",
                rank: "legendary grandmaster",
                rating: 3850,
                maxRank: "legendary grandmaster",
                maxRating: 3850,
                titlePhoto: "https://example.com/tourist.png"
              }
            ]
          }
        })
        .mockResolvedValueOnce({
          data: {
            status: "OK",
            result: [
              {
                contestId: 1,
                contestName: "Round #1",
                rank: 10,
                oldRating: 1500,
                newRating: 1550,
                ratingUpdateTimeSeconds: 1710000000
              }
            ]
          }
        })
        .mockResolvedValueOnce({
          data: {
            status: "OK",
            result: [
              {
                id: 101,
                verdict: "OK",
                creationTimeSeconds: 1710000000,
                problem: {
                  contestId: 999,
                  index: "A",
                  name: "Sample Problem",
                  rating: 1200,
                  tags: ["math", "implementation"]
                }
              }
            ]
          }
        })
    };

    const service = createCodeforcesService({
      httpClient,
      sleep: vi.fn().mockResolvedValue(undefined),
      minIntervalMs: 0
    });

    const data = await service.getCodeforcesData("tourist");

    expect(data.profile.handle).toBe("tourist");
    expect(data.profile.avatar).toContain("tourist.png");
    expect(data.ratingHistory[0].delta).toBe(50);
    expect(data.submissions[0].problem.key).toBe("999:default:A:Sample Problem");
    expect(data.submissions[0].problem.tags).toEqual(["math", "implementation"]);
    expect(httpClient.get).toHaveBeenCalledTimes(3);
  });

  it("maps missing handles to a 404 app error", async () => {
    const service = createCodeforcesService({
      httpClient: {
        get: vi.fn().mockResolvedValue({
          data: {
            status: "FAILED",
            comment: "handles: User with handle missing_user not found"
          }
        })
      },
      sleep: vi.fn().mockResolvedValue(undefined),
      minIntervalMs: 0
    });

    await expect(service.getCodeforcesData("missing_user")).rejects.toMatchObject({
      statusCode: 404,
      code: "CF_HANDLE_NOT_FOUND"
    });
  });

  it("retries transient Codeforces failures once", async () => {
    const httpClient = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          data: {
            status: "FAILED",
            comment: "Call limit exceeded"
          }
        })
        .mockResolvedValueOnce({
          data: {
            status: "OK",
            result: [{ handle: "tourist", rank: "expert", rating: 1700 }]
          }
        })
        .mockResolvedValueOnce({
          data: {
            status: "OK",
            result: []
          }
        })
        .mockResolvedValueOnce({
          data: {
            status: "OK",
            result: []
          }
        })
    };
    const wait = vi.fn().mockResolvedValue(undefined);
    const service = createCodeforcesService({
      httpClient,
      sleep: wait,
      minIntervalMs: 0
    });

    const data = await service.getCodeforcesData("tourist");

    expect(data.profile.handle).toBe("tourist");
    expect(httpClient.get).toHaveBeenCalledTimes(4);
    expect(wait).toHaveBeenCalled();
  });
});
