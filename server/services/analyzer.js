const { addDays, daysBetweenInclusive, getTimeOfDayLabel, getUtcDateKey, roundTo } = require("../utils/time");

function verdictLabel(verdict) {
  return verdict.replaceAll("_", " ").toLowerCase();
}

function buildHeatmap(submissions = []) {
  const today = new Date();
  const startDate = addDays(today, -364);
  const counts = new Map();

  submissions.forEach((submission) => {
    const dateKey = getUtcDateKey(submission.creationTimeSeconds * 1000);
    counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
  });

  const days = [];
  let maxCount = 0;

  for (let offset = 0; offset < 365; offset += 1) {
    const currentDate = addDays(startDate, offset);
    const dateKey = getUtcDateKey(currentDate);
    const count = counts.get(dateKey) || 0;
    maxCount = Math.max(maxCount, count);
    days.push({
      date: dateKey,
      count
    });
  }

  return {
    maxCount,
    totalSubmissions: submissions.length,
    activeDays: days.filter((day) => day.count > 0).length,
    days: days.map((day) => ({
      ...day,
      intensity:
        day.count === 0
          ? 0
          : maxCount <= 4
            ? Math.min(4, day.count)
            : Math.max(1, Math.ceil((day.count / maxCount) * 4))
    }))
  };
}

function analyzeCodeforcesData({ profile, ratingHistory = [], submissions = [] }) {
  const acceptedProblemKeys = new Set();
  const solvedPerDay = new Map();
  const tagMap = new Map();
  const verdictCounts = new Map();
  const hourBuckets = [0, 0, 0, 0];

  submissions.forEach((submission) => {
    const problemKey = submission.problem.key;
    const tags = submission.problem.tags.length ? submission.problem.tags : ["untagged"];
    const submissionDate = new Date(submission.creationTimeSeconds * 1000);
    const hour = submissionDate.getUTCHours();
    const bucketIndex = Math.min(3, Math.floor(hour / 6));

    hourBuckets[bucketIndex] += 1;
    verdictCounts.set(submission.verdict, (verdictCounts.get(submission.verdict) || 0) + 1);

    tags.forEach((tag) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, {
          tag,
          attemptedProblems: new Set(),
          solvedProblems: new Set(),
          wrongAttempts: 0,
          acceptedSubmissions: 0
        });
      }

      const tagEntry = tagMap.get(tag);
      tagEntry.attemptedProblems.add(problemKey);

      if (submission.verdict === "OK") {
        tagEntry.solvedProblems.add(problemKey);
        tagEntry.acceptedSubmissions += 1;
      }

      if (submission.verdict === "WRONG_ANSWER") {
        tagEntry.wrongAttempts += 1;
      }
    });

    if (submission.verdict === "OK" && !acceptedProblemKeys.has(problemKey)) {
      acceptedProblemKeys.add(problemKey);

      const dateKey = getUtcDateKey(submission.creationTimeSeconds * 1000);
      if (!solvedPerDay.has(dateKey)) {
        solvedPerDay.set(dateKey, new Set());
      }
      solvedPerDay.get(dateKey).add(problemKey);
    }
  });

  const tagStats = [...tagMap.values()]
    .map((entry) => {
      const attempted = entry.attemptedProblems.size;
      const solved = entry.solvedProblems.size;

      return {
        tag: entry.tag,
        attempted,
        solved,
        acPercent: attempted === 0 ? 0 : roundTo((solved / attempted) * 100, 2),
        wrongAttempts: entry.wrongAttempts,
        acceptedSubmissions: entry.acceptedSubmissions
      };
    })
    .sort((left, right) => right.attempted - left.attempted || left.tag.localeCompare(right.tag));

  const weakestTags = [...tagStats]
    .sort((left, right) => left.acPercent - right.acPercent || right.attempted - left.attempted || left.tag.localeCompare(right.tag))
    .slice(0, 5);

  const strongestTags = [...tagStats]
    .sort((left, right) => right.acPercent - left.acPercent || right.attempted - left.attempted || left.tag.localeCompare(right.tag))
    .slice(0, 5);

  const recentContests = ratingHistory.slice(-5);
  const recentNetDelta = recentContests.reduce((total, contest) => total + contest.delta, 0);
  const trendLabel = recentNetDelta > 0 ? "upward" : recentNetDelta < 0 ? "downward" : "stable";

  const firstSolvedDateKey = [...solvedPerDay.keys()].sort()[0];
  const avgSolvedPerDay = firstSolvedDateKey
    ? roundTo(acceptedProblemKeys.size / daysBetweenInclusive(firstSolvedDateKey, new Date()), 2)
    : 0;

  const mostActiveBucketIndex = hourBuckets.reduce(
    (bestIndex, count, index, values) => (count > values[bestIndex] ? index : bestIndex),
    0
  );
  const bucketToHour = [0, 6, 12, 18];

  const verdictBreakdown = [...verdictCounts.entries()]
    .map(([verdict, count]) => ({
      verdict,
      label: verdictLabel(verdict),
      count
    }))
    .sort((left, right) => right.count - left.count);

  const topWrongAnswerTags = [...tagStats]
    .filter((tag) => tag.wrongAttempts > 0)
    .sort((left, right) => right.wrongAttempts - left.wrongAttempts || right.attempted - left.attempted)
    .slice(0, 5)
    .map(({ tag, wrongAttempts, attempted }) => ({
      tag,
      wrongAttempts,
      attempted
    }));

  return {
    totalProblemsSolved: acceptedProblemKeys.size,
    avgSolvedPerDay,
    mostActiveTimeOfDay: submissions.length
      ? getTimeOfDayLabel(bucketToHour[mostActiveBucketIndex])
      : "No submissions yet",
    weakestTags,
    strongestTags,
    tagStats,
    ratingHistory: ratingHistory.map((entry) => ({
      contestId: entry.contestId,
      contestName: entry.contestName,
      rating: entry.newRating,
      delta: entry.delta,
      date: entry.date
    })),
    recentRatingTrend: {
      trendLabel,
      netDelta: recentNetDelta,
      contests: recentContests.map((contest) => ({
        contestName: contest.contestName,
        delta: contest.delta,
        newRating: contest.newRating,
        date: contest.date
      }))
    },
    heatmap: buildHeatmap(submissions),
    waPatterns: {
      totalWrongAnswers: verdictCounts.get("WRONG_ANSWER") || 0,
      mostCommonFailureVerdict:
        verdictBreakdown.find((entry) => entry.verdict !== "OK")?.label || null,
      verdictBreakdown,
      topWrongAnswerTags
    }
  };
}

module.exports = {
  analyzeCodeforcesData,
  buildHeatmap
};
