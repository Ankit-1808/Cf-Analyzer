import { useState } from "react";

import Heatmap from "../components/Heatmap";
import ProfileCard from "../components/ProfileCard";
import RatingChart from "../components/RatingChart";
import StudyPlan from "../components/StudyPlan";
import TagChart from "../components/TagChart";
import { analyzeHandle } from "../services/api";

function Dashboard() {
  const [handle, setHandle] = useState("tourist");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis(refresh = false) {
    const trimmedHandle = handle.trim();

    if (!trimmedHandle) {
      setError("Enter a Codeforces handle to analyze.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await analyzeHandle(trimmedHandle, { refresh });
      setResult(response);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.error?.message ||
          "We could not analyze that handle right now. Please try again in a moment."
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[36px] bg-ink px-6 py-10 text-mist shadow-panel sm:px-10">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,122,89,0.28),_transparent_60%)] lg:block" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-white/60">CF Analyzer</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Turn Codeforces history into a practical 30-day training loop.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Pull public Codeforces activity, surface weak tags, watch rating momentum, and let Claude turn that
                profile into a study plan you can actually follow.
              </p>
            </div>

            <form
              className="panel-surface rounded-[28px] border border-white/10 p-5 text-ink shadow-panel"
              onSubmit={(event) => {
                event.preventDefault();
                runAnalysis(false);
              }}
            >
              <label htmlFor="handle" className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Codeforces Handle
              </label>
              <input
                id="handle"
                type="text"
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                placeholder="tourist"
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Analyzing..." : "Analyze handle"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => runAnalysis(true)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-tide hover:text-tide disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Force refresh
                </button>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Cached analyses are reused for 6 hours. Refresh skips the cache and recomputes from live Codeforces data.
              </p>
            </form>
          </div>
        </section>

        {error ? (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
        ) : null}

        {!result && !loading ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="panel-surface rounded-[28px] border border-white/60 p-6 shadow-panel lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">What you get</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">A sharper view than raw submissions alone</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  "AC% by tag on distinct problems, not submission spam.",
                  "Contest rating trend with last-5 delta momentum.",
                  "365-day activity heatmap for consistency patterns.",
                  "Claude-backed study plan with daily practice links."
                ].map((item) => (
                  <div key={item} className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="panel-surface rounded-[28px] border border-white/60 p-6 shadow-panel">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Suggested demo</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">Try `tourist` first</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Use a known active handle to see the full dashboard populate, then switch to your own account for a
                personalized breakdown.
              </p>
            </div>
          </section>
        ) : null}

        {loading && !result ? (
          <section className="mt-8 panel-surface rounded-[28px] border border-white/60 p-10 shadow-panel">
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-44 rounded-full bg-slate-200" />
              <div className="h-10 w-2/3 rounded-full bg-slate-200" />
              <div className="h-40 rounded-[24px] bg-slate-100" />
            </div>
          </section>
        ) : null}

        {result ? (
          <div className="mt-8 space-y-6">
            <ProfileCard profile={result.profile} />

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="panel-surface rounded-[28px] border border-white/60 p-6 shadow-panel">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Snapshot</p>
                <h3 className="mt-2 text-xl font-semibold text-ink">Current analysis summary</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Solved</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{result.stats.totalProblemsSolved}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Avg / day</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{result.stats.avgSolvedPerDay}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Most Active</p>
                    <p className="mt-2 text-lg font-semibold text-ink">{result.stats.mostActiveTimeOfDay}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Cache</p>
                    <p className="mt-2 text-lg font-semibold text-ink">{result.cached ? "Cache hit" : "Fresh run"}</p>
                  </div>
                </div>
              </div>

              <div className="panel-surface rounded-[28px] border border-white/60 p-6 shadow-panel">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">WA-heavy patterns</p>
                <h3 className="mt-2 text-xl font-semibold text-ink">Failure modes to clean up</h3>
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Most common failure verdict</p>
                    <p className="mt-1 text-lg font-semibold capitalize text-ink">
                      {result.stats.waPatterns.mostCommonFailureVerdict || "None"}
                    </p>
                  </div>
                  {result.stats.waPatterns.topWrongAnswerTags?.slice(0, 3).map((item) => (
                    <div key={item.tag} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm">
                      <span className="capitalize text-slate-600">{item.tag}</span>
                      <span className="font-semibold text-ink">{item.wrongAttempts} WA submissions</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <TagChart tagStats={result.stats.tagStats} weakestTags={result.stats.weakestTags} />
            <RatingChart
              ratingHistory={result.stats.ratingHistory}
              recentRatingTrend={result.stats.recentRatingTrend}
            />
            <Heatmap heatmap={result.stats.heatmap} />
            <StudyPlan studyPlan={result.studyPlan} meta={result.meta} />
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default Dashboard;
