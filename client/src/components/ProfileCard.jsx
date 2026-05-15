const rankStyles = {
  newbie: "bg-slate-100 text-slate-700",
  pupil: "bg-emerald-100 text-emerald-700",
  specialist: "bg-cyan-100 text-cyan-700",
  expert: "bg-blue-100 text-blue-700",
  candidate: "bg-violet-100 text-violet-700",
  master: "bg-amber-100 text-amber-700",
  international: "bg-orange-100 text-orange-700",
  grandmaster: "bg-rose-100 text-rose-700",
  legendary: "bg-rose-200 text-rose-800",
  unrated: "bg-stone-100 text-stone-700"
};

function resolveRankClass(rank = "unrated") {
  const normalized = rank.toLowerCase();

  if (normalized.includes("legendary")) {
    return rankStyles.legendary;
  }
  if (normalized.includes("grandmaster")) {
    return rankStyles.grandmaster;
  }
  if (normalized.includes("international")) {
    return rankStyles.international;
  }
  if (normalized.includes("master")) {
    return rankStyles.master;
  }
  if (normalized.includes("candidate")) {
    return rankStyles.candidate;
  }

  return rankStyles[normalized] || rankStyles.unrated;
}

function ProfileCard({ profile }) {
  if (!profile) {
    return null;
  }

  return (
    <section className="panel-surface rounded-[28px] border border-white/60 p-6 shadow-panel">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <img
          src={profile.avatar || "https://via.placeholder.com/112x112?text=CF"}
          alt={`${profile.handle} avatar`}
          className="h-24 w-24 rounded-3xl border border-slate-200 object-cover shadow-sm"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-ink">{profile.handle}</h2>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${resolveRankClass(profile.rank)}`}>
              {profile.rank}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Current rating {profile.rating} with a best of {profile.maxRating} ({profile.maxRank}).
            Use this dashboard to spot tag-level weaknesses before the next contest.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Current Rating</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{profile.rating}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Max Rating</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{profile.maxRating}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Contribution</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{profile.contribution}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Followers</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{profile.friendOfCount}</p>
        </div>
      </div>
    </section>
  );
}

export default ProfileCard;
