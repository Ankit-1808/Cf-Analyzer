function StudyPlan({ studyPlan, meta }) {
  if (!studyPlan) {
    return null;
  }

  return (
    <section className="panel-surface rounded-[28px] border border-white/60 p-6 shadow-panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">30-Day Study Plan</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">Personalized roadmap</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{studyPlan.weakness_summary}</p>
        </div>
        {meta?.fallbackUsed ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
            Fallback plan used
          </span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            Claude-generated
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {studyPlan.top_3_focus_areas?.map((focus) => (
          <span key={focus} className="rounded-full bg-tide/10 px-3 py-1 text-sm font-medium capitalize text-tide">
            {focus}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {studyPlan.daily_plan?.map((item) => (
          <article key={item.day} className="rounded-3xl border border-slate-200 bg-white/80 p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-coral">
                Day {item.day}
              </span>
              <a
                href={item.cf_filter_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-tide underline decoration-transparent transition hover:decoration-current"
              >
                Open CF set
              </a>
            </div>
            <h4 className="mt-4 text-lg font-semibold capitalize text-ink">{item.topic}</h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.goal}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-ink p-5 text-mist">
        <p className="text-xs uppercase tracking-[0.22em] text-white/60">Motivational note</p>
        <p className="mt-2 text-sm leading-6">{studyPlan.motivational_note}</p>
      </div>
    </section>
  );
}

export default StudyPlan;
