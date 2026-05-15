const axios = require("axios");

const AppError = require("../utils/appError");

const CODEFORCES_BASE_URL = "https://codeforces.com/api";
const DEFAULT_MIN_INTERVAL_MS = 2100;
const DEFAULT_TIMEOUT_MS = 15000;
const RETRYABLE_CF_FAILURES = [
  "Call limit exceeded",
  "Maintenance",
  "temporarily unavailable"
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildProblemKey(problem = {}) {
  return [
    problem.contestId || "problemset",
    problem.problemsetName || "default",
    problem.index || "NA",
    problem.name || "unknown"
  ].join(":");
}

function normalizeProfile(user) {
  return {
    handle: user.handle,
    avatar: user.titlePhoto || user.avatar || "",
    rank: user.rank || "unrated",
    rating: user.rating || 0,
    maxRank: user.maxRank || user.rank || "unrated",
    maxRating: user.maxRating || user.rating || 0,
    contribution: user.contribution || 0,
    friendOfCount: user.friendOfCount || 0,
    organization: user.organization || "",
    country: user.country || ""
  };
}

function normalizeRatingHistory(entries = []) {
  return entries
    .map((entry) => ({
      contestId: entry.contestId,
      contestName: entry.contestName,
      rank: entry.rank,
      oldRating: entry.oldRating,
      newRating: entry.newRating,
      delta: entry.newRating - entry.oldRating,
      ratingUpdateTimeSeconds: entry.ratingUpdateTimeSeconds,
      date: new Date(entry.ratingUpdateTimeSeconds * 1000).toISOString()
    }))
    .sort((left, right) => left.ratingUpdateTimeSeconds - right.ratingUpdateTimeSeconds);
}

function normalizeSubmission(submission) {
  const problem = submission.problem || {};

  return {
    id: submission.id,
    verdict: submission.verdict || "UNKNOWN",
    programmingLanguage: submission.programmingLanguage || "",
    creationTimeSeconds: submission.creationTimeSeconds,
    relativeTimeSeconds: submission.relativeTimeSeconds || 0,
    authorParticipantType: submission.author?.participantType || "UNKNOWN",
    passedTestCount: submission.passedTestCount || 0,
    timeConsumedMillis: submission.timeConsumedMillis || 0,
    memoryConsumedBytes: submission.memoryConsumedBytes || 0,
    problem: {
      key: buildProblemKey(problem),
      contestId: problem.contestId || null,
      problemsetName: problem.problemsetName || null,
      index: problem.index || "",
      name: problem.name || "Unknown problem",
      rating: problem.rating || null,
      tags: Array.isArray(problem.tags) ? problem.tags : []
    }
  };
}

function normalizeCodeforcesError(error) {
  const cfComment = error?.cfComment || error?.response?.data?.comment || error?.message || "Codeforces request failed.";
  const status = error?.response?.status;
  const isMissingUser =
    /not found/i.test(cfComment) || /handle/i.test(cfComment) || /User with handle/i.test(cfComment);

  if (isMissingUser) {
    return new AppError("Codeforces handle not found.", 404, "CF_HANDLE_NOT_FOUND", { cfComment });
  }

  if (status >= 500 || RETRYABLE_CF_FAILURES.some((text) => cfComment.includes(text))) {
    return new AppError("Codeforces API is temporarily unavailable. Please try again shortly.", 503, "CF_UNAVAILABLE", {
      cfComment
    });
  }

  return new AppError("Unable to fetch data from Codeforces.", 502, "CF_FETCH_FAILED", { cfComment });
}

function createCodeforcesService(options = {}) {
  const httpClient =
    options.httpClient ||
    axios.create({
      baseURL: CODEFORCES_BASE_URL,
      timeout: DEFAULT_TIMEOUT_MS
    });
  const wait = options.sleep || sleep;
  const minIntervalMs = options.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
  const retryCount = options.retryCount ?? 1;
  let lastRequestStartedAt = 0;

  async function throttle() {
    const now = Date.now();
    const elapsed = now - lastRequestStartedAt;
    const waitFor = Math.max(0, minIntervalMs - elapsed);

    if (waitFor > 0) {
      await wait(waitFor);
    }

    lastRequestStartedAt = Date.now();
  }

  function shouldRetry(error) {
    const cfComment = error?.response?.data?.comment || error?.message || "";
    const status = error?.response?.status;
    return status >= 500 || RETRYABLE_CF_FAILURES.some((text) => cfComment.includes(text));
  }

  async function callMethod(method, params = {}, attempt = 0) {
    await throttle();

    try {
      const response = await httpClient.get(`/${method}`, {
        params: {
          ...params,
          lang: "en"
        }
      });
      const payload = response.data;

      if (payload?.status === "FAILED") {
        const failure = new Error(payload.comment || "Codeforces request failed.");
        failure.cfComment = payload.comment;

        if (attempt < retryCount && shouldRetry({ response: { data: payload } })) {
          await wait(500 * (attempt + 1));
          return callMethod(method, params, attempt + 1);
        }

        throw failure;
      }

      return payload.result;
    } catch (error) {
      if (attempt < retryCount && shouldRetry(error)) {
        await wait(500 * (attempt + 1));
        return callMethod(method, params, attempt + 1);
      }

      throw normalizeCodeforcesError(error);
    }
  }

  async function getCodeforcesData(handle) {
    const normalizedHandle = String(handle || "").trim();

    if (!normalizedHandle) {
      throw new AppError("Handle is required.", 400, "HANDLE_REQUIRED");
    }

    const [user] = await callMethod("user.info", { handles: normalizedHandle });
    const ratingHistory = await callMethod("user.rating", { handle: normalizedHandle });
    const submissions = await callMethod("user.status", { handle: normalizedHandle });

    return {
      profile: normalizeProfile(user),
      ratingHistory: normalizeRatingHistory(ratingHistory),
      submissions: submissions.map(normalizeSubmission)
    };
  }

  return {
    buildProblemKey,
    callMethod,
    getCodeforcesData,
    normalizeProfile,
    normalizeRatingHistory,
    normalizeSubmission
  };
}

const defaultService = createCodeforcesService();

module.exports = {
  CODEFORCES_BASE_URL,
  DEFAULT_MIN_INTERVAL_MS,
  buildProblemKey,
  createCodeforcesService,
  getCodeforcesData: defaultService.getCodeforcesData,
  normalizeCodeforcesError
};
