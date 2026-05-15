const { buildFallbackPlan } = require("../utils/fallbackPlan");

const SYSTEM_PROMPT = `You are CF Analyzer Coach, an expert competitive programming mentor.
You will receive structured Codeforces performance data for one user.
Return only valid JSON with no markdown, no prose outside JSON, and no extra keys.
Base every recommendation only on the provided data.
Make the plan practical, specific, and encouraging.
The JSON must contain exactly these keys:
weakness_summary, top_3_focus_areas, daily_plan, motivational_note.
top_3_focus_areas must be an array of exactly 3 short strings.
daily_plan must be an array of exactly 30 objects.
Each daily_plan object must contain: day, topic, goal, cf_filter_url.`;

async function getAnthropicClient(apiKey) {
  if (!apiKey) {
    return null;
  }

  try {
    const anthropicModule = await import("@anthropic-ai/sdk");
    const Anthropic = anthropicModule.default || anthropicModule;
    return new Anthropic({ apiKey });
  } catch (error) {
    return null;
  }
}

function buildUserPrompt({ profile, stats }) {
  return `Create a personalized 30-day Codeforces study plan from this player snapshot.

handle: ${profile.handle}
total_problems_solved: ${stats.totalProblemsSolved}
current_rating: ${profile.rating || 0}

top_5_weakest_tags:
${JSON.stringify(stats.weakestTags, null, 2)}

top_5_strongest_tags:
${JSON.stringify(stats.strongestTags, null, 2)}

avg_problems_solved_per_day: ${stats.avgSolvedPerDay}
most_active_time_of_day_utc: ${stats.mostActiveTimeOfDay}
recent_rating_delta_trend_last_5_contests:
${JSON.stringify(stats.recentRatingTrend.contests, null, 2)}

Requirements:
1. weakness_summary should be 2 to 4 sentences.
2. top_3_focus_areas should prioritize the weakest high-volume tags.
3. daily_plan must cover days 1 through 30 exactly once each.
4. Each daily plan item must have a realistic topic, a measurable goal, and a Codeforces problemset filter URL.
5. Keep the difficulty progression appropriate for the user's current rating.
6. motivational_note should be short, supportive, and specific to the user's pattern.

Return JSON only.`;
}

function stripCodeFences(text) {
  return String(text || "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function validateStudyPlan(parsed) {
  const requiredKeys = ["weakness_summary", "top_3_focus_areas", "daily_plan", "motivational_note"];
  const parsedKeys = Object.keys(parsed || {}).sort();
  const hasExactKeys =
    parsedKeys.length === requiredKeys.length &&
    requiredKeys.every((key) => parsedKeys.includes(key));

  if (!hasExactKeys) {
    throw new Error("Claude response has unexpected keys.");
  }

  if (typeof parsed.weakness_summary !== "string" || typeof parsed.motivational_note !== "string") {
    throw new Error("Claude response contains invalid summary fields.");
  }

  if (!Array.isArray(parsed.top_3_focus_areas) || parsed.top_3_focus_areas.length !== 3) {
    throw new Error("Claude response must return exactly 3 focus areas.");
  }

  if (!Array.isArray(parsed.daily_plan) || parsed.daily_plan.length !== 30) {
    throw new Error("Claude response must return exactly 30 plan items.");
  }

  parsed.daily_plan.forEach((item, index) => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.day !== "number" ||
      item.day !== index + 1 ||
      typeof item.topic !== "string" ||
      typeof item.goal !== "string" ||
      typeof item.cf_filter_url !== "string"
    ) {
      throw new Error("Claude response contains an invalid daily plan item.");
    }
  });

  return parsed;
}

function parseClaudeJson(text) {
  return validateStudyPlan(JSON.parse(stripCodeFences(text)));
}

function createAIService(options = {}) {
  const explicitClient = options.client;
  const model = options.model || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;

  async function generateStudyPlan({ profile, stats }) {
    const fallbackPlan = buildFallbackPlan({ profile, stats });
    const client = explicitClient || (await getAnthropicClient(apiKey));

    if (!client) {
      return {
        studyPlan: fallbackPlan,
        meta: {
          fallbackUsed: true,
          reason: "ANTHROPIC_CLIENT_UNAVAILABLE"
        }
      };
    }

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 2500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildUserPrompt({ profile, stats })
          }
        ]
      });

      const textContent = Array.isArray(response.content)
        ? response.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("\n")
        : "";

      return {
        studyPlan: parseClaudeJson(textContent),
        meta: {
          fallbackUsed: false,
          reason: null
        }
      };
    } catch (error) {
      return {
        studyPlan: fallbackPlan,
        meta: {
          fallbackUsed: true,
          reason: "CLAUDE_GENERATION_FAILED"
        }
      };
    }
  }

  return {
    buildUserPrompt,
    generateStudyPlan,
    parseClaudeJson,
    stripCodeFences,
    validateStudyPlan
  };
}

const defaultService = createAIService();

module.exports = {
  SYSTEM_PROMPT,
  buildUserPrompt,
  createAIService,
  generateStudyPlan: defaultService.generateStudyPlan,
  parseClaudeJson,
  stripCodeFences,
  validateStudyPlan
};
