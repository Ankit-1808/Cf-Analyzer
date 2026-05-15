function Heatmap({ heatmap }) {
  const days = heatmap?.days || [];

  if (!days.length) {
    return (
      <section className="panel-surface rounded-[28px] border border-white/60 p-6 shadow-panel">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Submission Activity</p>
        <h3 className="mt-2 text-xl font-semibold text-ink">365-day heatmap</h3>
        <div className="mt-5 rounded-3xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">
          No submission activity found yet.
        </div>
      </section>
    );
  }

  const monthLabels = days.reduce((labels, day, index) => {
    const date = new Date(`${day.date}T00:00:00.000Z`);
    if (date.getUTCDate() <= 7) {
      labels.push({
        label: date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
        index
      });
    }
    return labels;
  }, []);

  return (
    <section className="panel-surface rounded-[28px] border border-white/60 p-6 shadow-panel">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Submission Activity</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">365-day heatmap</h3>
        </div>
        <div className="text-sm text-slate-600">
          {heatmap.activeDays} active days · {heatmap.totalSubmissions} total submissions
        </div>
      </div>

      <div className="mt-6 overflow-x-auto heatmap-scroll">
        <div className="relative min-w-[850px]">
          <div className="mb-3 flex text-xs text-slate-500">
            {monthLabels.map((month) => (
              <span key={`${month.label}-${month.index}`} className="absolute" style={{ left: `${month.index * 14}px` }}>
                {month.label}
              </span>
            ))}
          </div>
          <div
            className="grid grid-flow-col gap-1 pt-6"
            style={{
              gridTemplateRows: "repeat(7, minmax(0, 1fr))"
            }}
          >
            {days.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} submission${day.count === 1 ? "" : "s"}`}
                className={`h-3.5 w-3.5 rounded-[4px] heat-level-${day.intensity}`}
                data-testid="heat-cell"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`h-3.5 w-3.5 rounded-[4px] heat-level-${level}`} />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}

export default Heatmap;
