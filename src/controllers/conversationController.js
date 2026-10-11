const conversationService = require("../services/conversationService");
const createConversation = async(req,res)=>{
    try{
        const { userId } = req.body;
        if(!userId){
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }
        const conversation = await conversationService.createConversation(
            req.user.userId,
            userId
        );

        res.status(201).json({
            success: true,
            message: "Conversation created successfully",
            data: conversation
        });
    } catch(error){
        console.error(error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

module.exports = {
    createConversation
};