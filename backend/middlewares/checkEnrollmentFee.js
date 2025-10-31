const User = require("../models/User");

// Middleware to check if user has paid enrollment fee
exports.checkEnrollmentFee = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Get user with enrollment fee status
        const user = await User.findById(userId).select('accountType enrollmentFeePaid');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Only check for students
        if (user.accountType === 'Student' && !user.enrollmentFeePaid) {
            return res.status(403).json({
                success: false,
                message: 'Please pay the enrollment fee before accessing this feature',
                enrollmentFeeRequired: true
            });
        }

        // Proceed to the next middleware/route handler
        next();
    } catch (error) {
        console.error('Error in checkEnrollmentFee middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
