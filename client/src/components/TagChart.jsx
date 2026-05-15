import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const PIE_COLORS = ["#ff7a59", "#1f5f8b", "#8fd3c2", "#f4c95d", "#7b8cb2"];

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">
      No tag data yet. Once the user has submission history, tag strengths and weaknesses will appear here.
    </div>
  );
}

function TagChart({ tagStats = [], weakestTags = [] }) {
  if (!tagStats.length) {
    return <EmptyState />;
  }

  const pieData = [...tagStats]
    .sort((left, right) => right.attempted - left.attempted)
    .slice(0, 5)
    .map((entry) => ({
      name: entry.tag,
      value: entry.attempted
    }));

  const barData = weakestTags.map((entry) => ({
    tag: entry.tag,
    acPercent: entry.acPercent,
    attempted: entry.attempted
  }));

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="panel-surface rounded-[28px] border border-white/60 p-6 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Weak Tag Accuracy</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">Where AC% is leaking</h3>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 16, bottom: 10, left: 16 }}>
              <XAxis type="number" tick={{ fill: "#51607f", fontSize: 12 }} />
              <YAxis dataKey="tag" type="category" width={96} tick={{ fill: "#1d2238", fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value}%`, "AC rate"]} />
              <Bar dataKey="acPercent" radius={[0, 10, 10, 0]} fill="#ff7a59" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-surface rounded-[28px] border border-white/60 p-6 shadow-panel">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Most Attempted Tags</p>
        <h3 className="mt-2 text-xl font-semibold text-ink">Volume distribution</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={92}
                paddingAngle={4}
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "attempted problems"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid gap-2">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="capitalize text-slate-700">{entry.name}</span>
              </div>
              <span className="font-semibold text-ink">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TagChart;
