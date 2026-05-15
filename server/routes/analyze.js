const express = require("express");

const Analysis = require("../models/Analysis");
const { generateStudyPlan } = require("../services/aiService");
const { analyzeCodeforcesData } = require("../services/analyzer");
const { getCodeforcesData } = require("../services/cfApi");
const AppError = require("../utils/appError");
const { addHours } = require("../utils/time");

function normalizeHandle(rawHandle) {
  return String(rawHandle || "").trim();
}

function isValidHandle(handle) {
  return /^[A-Za-z0-9_.-]{1,40}$/.test(handle);
}

function createAnalyzeRouter(dependencies = {}) {
  const router = express.Router();
  const AnalysisModel = dependencies.AnalysisModel || Analysis;
  const fetchCodeforcesData = dependencies.getCodeforcesData || getCodeforcesData;
  const runAnalyzer = dependencies.analyzeCodeforcesData || analyzeCodeforcesData;
  const runAi = dependencies.generateStudyPlan || generateStudyPlan;
  const now = dependencies.now || (() => new Date());
  const cacheTtlHours = Number(dependencies.cacheTtlHours || process.env.CACHE_TTL_HOURS || 6);

  router.get("/:handle", async (req, res, next) => {
    try {
      const handle = normalizeHandle(req.params.handle);
      const refresh = req.query.refresh === "true";

      if (!handle || !isValidHandle(handle)) {
        throw new AppError("Please provide a valid Codeforces handle.", 400, "INVALID_HANDLE");
      }

      const handleLower = handle.toLowerCase();

      if (!refresh) {
        const cachedAnalysis = await AnalysisModel.findOne({ handleLower }).lean();

        if (cachedAnalysis && new Date(cachedAnalysis.expiresAt) > now()) {
          return res.json({
            success: true,
            cached: true,
            generatedAt: cachedAnalysis.generatedAt,
            meta: cachedAnalysis.meta,
            profile: cachedAnalysis.profile,
            stats: cachedAnalysis.stats,
            studyPlan: cachedAnalysis.studyPlan
          });
        }
      }

      const cfData = await fetchCodeforcesData(handle);
      const stats = runAnalyzer(cfData);
      const { studyPlan, meta } = await runAi({
        profile: cfData.profile,
        stats
      });

      const generatedAt = now();
      const expiresAt = addHours(generatedAt, cacheTtlHours);

      const document = {
        handleOriginal: handle,
        handleLower,
        profile: cfData.profile,
        stats,
        studyPlan,
        meta: {
          fallbackUsed: Boolean(meta?.fallbackUsed),
          reason: meta?.reason || null
        },
        generatedAt,
        expiresAt
      };

      await AnalysisModel.findOneAndUpdate({ handleLower }, document, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      });

      return res.json({
        success: true,
        cached: false,
        generatedAt,
        meta: document.meta,
        profile: document.profile,
        stats: document.stats,
        studyPlan: document.studyPlan
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createAnalyzeRouter
};
