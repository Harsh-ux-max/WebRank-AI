const Report = require("../models/Report");

exports.getDashboard = async (req, res) => {
  try {
    const reports = await Report.find({
      user: req.user.id
    });

    const totalReports = reports.length;

    if (totalReports === 0) {
      return res.json({
        success: true,
        stats: {
          totalReports: 0,
          avgScore: 0,
          bestScore: 0,
          reportsGenerated: 0,
          averages: {
            performance: 0,
            accessibility: 0,
            seo: 0,
            bestPractices: 0
          }
        }
      });
    }

    const categories = {
      performance: [],
      accessibility: [],
      seo: [],
      bestPractices: []
    };

    // Collect valid scores
    reports.forEach(report => {
      Object.keys(categories).forEach(category => {
        const score = Number(report[category]);

        if (Number.isFinite(score)) {
          categories[category].push(score);
        }
      });
    });

    // Calculate category averages
    const averages = {};

    Object.keys(categories).forEach(category => {
      const scores = categories[category];

      averages[category] = scores.length
        ? Math.round(
            scores.reduce(
              (total, score) => total + score,
              0
            ) / scores.length
          )
        : 0;
    });

    // Overall average
    const categoryAverages = Object.values(averages);

    const avgScore = Math.round(
      categoryAverages.reduce(
        (total, score) => total + score,
        0
      ) / categoryAverages.length
    );

    // Calculate each report's overall score
    const reportScores = reports.map(report => {
      const scores = [
        report.performance,
        report.accessibility,
        report.seo,
        report.bestPractices
      ]
        .map(Number)
        .filter(Number.isFinite);

      return scores.length
        ? Math.round(
            scores.reduce(
              (total, score) => total + score,
              0
            ) / scores.length
          )
        : 0;
    });

    const bestScore = Math.max(...reportScores);

    res.json({
      success: true,

      stats: {
        totalReports,
        avgScore,
        bestScore,
        reportsGenerated: totalReports,

        averages
      }
    });

  } catch (err) {

    console.error(
      "DASHBOARD ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics."
    });

  }
};