const runLighthouse = require("../utils/lighthouse");
const validatePublicUrl = require("../utils/validatePublicUrl");

exports.compareWebsites = async (req, res) => {
  try {

    const { url1, url2 } = req.body;

    if (!url1 || !url2) {
      return res.status(400).json({
        success: false,
        message: "Both URLs are required"
      });
    }

    // Validate URLs
    const safeUrl1 = await validatePublicUrl(url1);
    const safeUrl2 = await validatePublicUrl(url2);

    // =====================================
    // Analyze Website 1
    // =====================================

    console.log("Analyzing Website 1:", safeUrl1);

    const report1 = await runLighthouse(safeUrl1);

    console.log("Website 1 completed.");
    console.log("Report 1:", report1);


    // =====================================
    // Analyze Website 2
    // =====================================

    console.log("Analyzing Website 2:", safeUrl2);

    const report2 = await runLighthouse(safeUrl2);

    console.log("Website 2 completed.");
    console.log("Report 2:", report2);


    // =====================================
    // Send Response
    // =====================================

    res.json({
      success: true,
      report1,
      report2
    });

  } catch (error) {

    console.error(
      "COMPARE BACKEND ERROR:",
      error
    );

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });

  }
};