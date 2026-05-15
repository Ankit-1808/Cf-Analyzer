const { roundTo } = require("./time");

function buildProblemsetUrl(tags, ratingFloor, ratingCeil) {
  const tagString = Array.isArray(tags) ? tags.join(",") : tags;
  const url = new URL("https://codeforces.com/problemset");
  url.searchParams.set("order", "BY_RATING_ASC");
  url.searchParams.set("tags", tagString);
  url.searchParams.set("f0", String(ratingFloor));
  url.searchParams.set("f1", String(ratingCeil));
  return url.toString();
}

function pickFocusTags(stats) {
  const weakest = (stats.weakestTags || []).map((tag) => tag.tag);

  if (weakest.length >= 3) {
    return weakest.slice(0, 3);
  }

  const strongest = (stats.strongestTags || []).map((tag) => tag.tag);
  const merged = [...weakest, ...strongest, "implementation", "math", "greedy"];

  return [...new Set(merged.filter(Boolean))].slice(0, 3);
}

function buildFallbackPlan({ profile, stats }) {
  const focusTags = pickFocusTags(stats);
  const currentRating = profile.rating || 900;
  const ratingFloor = Math.max(800, Math.floor((currentRating - 200) / 100) * 100);
  const handle = profile.handle || "this user";
  const weakestLabel = focusTags.join(", ");
  const avgSolved = roundTo(stats.avgSolvedPerDay || 0, 2);

  const dailyPlan = Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    const focusTag = focusTags[index % focusTags.length] || "implementation";
    const isReviewDay = day % 5 === 0;
    const difficultyLift = Math.floor(index / 10) * 100;
    const rangeFloor = ratingFloor + difficultyLift;
    const rangeCeil = rangeFloor + 200;

    return {
      day,
      topic: isReviewDay ? `${focusTag} review and speed round` : `${focusTag} problem practice`,
      goal: isReviewDay
        ? `Review mistakes from the last 4 days and solve 2 timed ${focusTag} problems in the ${rangeFloor}-${rangeCeil} range.`
        : `Solve 3 ${focusTag} problems in the ${rangeFloor}-${rangeCeil} range and write down one reusable pattern.`,
      cf_filter_url: buildProblemsetUrl(focusTag, rangeFloor, rangeCeil)
    };
  });

  return {
    weakness_summary: `${handle} is currently showing the most room for growth in ${weakestLabel}. The submission history suggests that tightening fundamentals in those tags should raise both accuracy and contest confidence. With an average of ${avgSolved} solved problems per day, a steady daily routine is more valuable than a heavy one-day push.`,
    top_3_focus_areas: focusTags,
    daily_plan: dailyPlan,
    motivational_note: "Your data already shows consistent effort. Small daily gains on the weakest tags will compound quickly over the next month."
  };
}

module.exports = {
  buildFallbackPlan,
  buildProblemsetUrl
};
