import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function RatingChart({ ratingHistory = [], recentRatingTrend }) {
  return (
    <section className="panel-surface rounded-[28px] border border-white/60 p-6 shadow-panel">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Contest Performance</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">Rating progression</h3>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Last 5 contests: <span className="font-semibold capitalize text-ink">{recentRatingTrend?.trendLabel || "stable"}</span>
          {" · "}
          Net delta <span className="font-semibold text-ink">{recentRatingTrend?.netDelta || 0}</span>
        </div>
      </div>

      {!ratingHistory.length ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">
          No rated contest history found for this handle.
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ratingHistory} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(81, 96, 127, 0.12)" strokeDasharray="4 4" />
              <XAxis
                dataKey="contestName"
                tick={{ fill: "#51607f", fontSize: 11 }}
                minTickGap={40}
                tickFormatter={(value) => value.replace("Codeforces Round ", "R ")}
              />
              <YAxis tick={{ fill: "#51607f", fontSize: 12 }} />
              <Tooltip
                formatter={(value, name, item) =>
                  name === "rating" ? [`${value}`, `${item.payload.contestName} rating`] : [value, name]
                }
                labelFormatter={(label) => label}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#1f5f8b"
                strokeWidth={3}
                dot={{ r: 3, fill: "#ff7a59" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default RatingChart;
