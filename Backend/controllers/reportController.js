const Report = require("../models/Report");
const mongoose = require("mongoose");


// GET ALL REPORTS
exports.getReports = async (req, res) => {

    try {
        const reports = await Report.find({
            user: req.user.id
        }).sort({ createdAt: -1 });


        // const reports = await Report.find({
        //     user: req.user.id
        // }).sort({
        //     createdAt: -1
        // });


        res.json({
            success: true,
            reports
        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// DELETE REPORT
exports.deleteReport = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report ID"
            });
        }

        const report = await Report.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        await report.deleteOne();

        res.json({
            success: true,
            message: "Report deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// GET SINGLE REPORT

exports.getSingleReport = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report ID"
            });
        }

        const report = await Report.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        res.json({
            success: true,
            report
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


