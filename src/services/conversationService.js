const Conversation = require("../models/Conversation");
const createConversation = async(userId, otherUserId) => {
    if(userId.toString() === otherUserId.toString()){
        const error = new Error("You can not create a conversation with yourself");
        error.statusCode = 400;
        throw error;
    }
    let conversation = await Conversation.findOne({
        participants: {
            $all: [userId, otherUserId]
        }
    });

    if(conversation){
        return conversation;
    }

    conversation  = await Conversation.create({
        participants: [userId, otherUserId]
    });

    return conversation;
}