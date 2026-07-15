const appointmentModel = require("../model/appointmentModel");
const checkLogsModel = require("../model/checkLogsModel");
const passModel = require("../model/passModel");


exports.getDashboardStats = async (req, res) => {
    try {
        // Calculate appointment counts grouped by their status (e.g., pending, approved, rejected, completed)
        const statusBreakdown = await appointmentModel.aggregate([
            // Group appointments by their status field and count the number of documents in each group
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Calculate visitor check-ins per day for the last 30 active days
        const visitsPerDay = await checkLogsModel.aggregate([
            // Filter out check logs that do not have a valid check-in timestamp
            { $match: { checkInTime: { $ne: null } } },
            {
                // Group logs by converting the check-in Date into a YYYY-MM-DD string format
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkInTime" } },
                    count: { $sum: 1 } // Sum up the total check-ins for each unique day
                }
            },
            // Sort dates in ascending order (oldest to newest)
            { $sort: { _id: 1 } },
            // Limit the results to the last 30 records to prevent bloating the chart
            { $limit: 30 }
        ]);

        // Count the total number of visitors currently inside the premises (status = "checked-in")
        const currentlyCheckedIn = await passModel.countDocuments({ status: "checked-in" });

        // Respond with all consolidated stats and metrics
        res.status(200).json({ statusBreakdown, visitsPerDay, currentlyCheckedIn });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}


