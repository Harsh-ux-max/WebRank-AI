const mongoose = require("mongoose");

const Report = require("../models/Report");
const runLighthouse = require("../utils/lighthouse");
const validatePublicUrl = require("../utils/validatePublicUrl");


/* =========================================================
   ANALYZE WEBSITE
========================================================= */

exports.analyzeWebsite = async (req, res) => {

    try {

        /* =========================
           Validate request body
        ========================= */

        const { url } = req.body || {};

        if (!url || typeof url !== "string") {

            return res.status(400).json({
                success: false,
                message: "Please provide a valid website URL."
            });
        }


        /* =========================
           Validate authenticated user
        ========================= */

        if (!req.user || !req.user.id) {

            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }


        /* =========================
           Validate public URL
        ========================= */

        const safeUrl = await validatePublicUrl(
            url.trim()
        );


        /* =========================
           Run Lighthouse
        ========================= */

        const scores = await runLighthouse(
            safeUrl
        );


        /* =========================
           Normalize scores
        ========================= */

        const performance =
            Number(scores?.performance ?? 0);

        const accessibility =
            Number(scores?.accessibility ?? 0);

        const seo =
            Number(scores?.seo ?? 0);

        const bestPractices =
            Number(
                scores?.bestPractices ??
                scores?.best_practices ??
                0
            );

        const pwa =
            Number(
                scores?.pwa ??
                scores?.PWA ??
                0
            );


        /* =========================
           Validate score values
        ========================= */

        const normalizeScore = (score) => {

            if (!Number.isFinite(score)) {
                return 0;
            }

            return Math.max(
                0,
                Math.min(100, Math.round(score))
            );
        };


        const normalizedScores = {
            performance: normalizeScore(performance),
            accessibility: normalizeScore(accessibility),
            seo: normalizeScore(seo),
            bestPractices: normalizeScore(bestPractices),
            pwa: normalizeScore(pwa)
        };


        /* =========================
           Create report
        ========================= */

        const reportData = {
            user: req.user.id,
            url: safeUrl,

            performance:
                normalizedScores.performance,

            accessibility:
                normalizedScores.accessibility,

            seo:
                normalizedScores.seo,

            bestPractices:
                normalizedScores.bestPractices,

            pwa:
                normalizedScores.pwa
        };


        /* =========================
           Save report
        ========================= */

        const report = await Report.create(
            reportData
        );


        /* =========================
           Success response
        ========================= */

        return res.status(201).json({

            success: true,

            message:
                "Website analysis completed successfully.",

            report: {

                _id: report._id,

                id: report._id,

                user: report.user,

                url: report.url,

                performance:
                    report.performance,

                accessibility:
                    report.accessibility,

                seo:
                    report.seo,

                bestPractices:
                    report.bestPractices,

                pwa:
                    report.pwa ?? normalizedScores.pwa,

                createdAt:
                    report.createdAt,

                updatedAt:
                    report.updatedAt
            }
        });


    } catch (err) {

        console.error(
            "ANALYZE ERROR:",
            err
        );


        /* =========================
           Known validation errors
        ========================= */

        const statusCode =
            err.statusCode || 500;


        return res.status(
            statusCode
        ).json({

            success: false,

            message:
                statusCode >= 500
                    ? "Unable to analyze the website. Please try again later."
                    : err.message
        });
    }
};


/* =========================================================
   GET ALL REPORTS
========================================================= */

exports.getReports = async (req, res) => {

    try {

        if (!req.user || !req.user.id) {

            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }


        const reports = await Report.find({
            user: req.user.id
        })
            .sort({
                createdAt: -1
            });


        return res.json({

            success: true,

            count: reports.length,

            reports
        });


    } catch (err) {

        console.error(
            "GET REPORTS ERROR:",
            err
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load reports."
        });
    }
};


/* =========================================================
   GET SINGLE REPORT
========================================================= */

exports.getReportById = async (req, res) => {

    try {

        if (!req.user || !req.user.id) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."
            });
        }


        const { id } = req.params;


        /* =========================
           Validate MongoDB ID
        ========================= */

        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid report ID."
            });
        }


        /* =========================
           Find user's report
        ========================= */

        const report = await Report.findOne({

            _id: id,

            user: req.user.id
        });


        if (!report) {

            return res.status(404).json({

                success: false,

                message:
                    "Report not found."
            });
        }


        return res.json({

            success: true,

            report
        });


    } catch (err) {

        console.error(
            "GET REPORT ERROR:",
            err
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load report."
        });
    }
};