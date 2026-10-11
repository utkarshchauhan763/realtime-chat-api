const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const registerChatHandlers = (io, socket) => {
    socket.on("send_message", async(data) => {
        try{
            const{
                conversationId,
                content
            } = data;

            if(!conversationId || !content){
                return socket.emit("message_error", {
                    message: "conversationId and content are required"
                });
            }
            const conversation = await Conversation.findById(conversationId);

            if(!conversation){
                return socket.emit("message_error",{
                    message: "Conversation not found"
                });
            }

            const isParticipant = conversation.participants.some(
                participant => participant.toString() === socket.user.userId.toString()
            );
            
            if(!isParticipant){
                return socket.emit("message_error",{
                    message: "You are not a participant in this conversation"
                });
            }

            const message = await Message.create({
                conversation: conversationId,
                sender: socket.user.userId,
                content
            });

            const populatedMessage = 
                await Message.findById(message._id)
                    .populate("sender", "name email");

            io.to(conversationId).emit("new message", populatedMessage);

        } catch (error){
            console.error(error);
            socket.emit("message_error",{
                message: "Failed to send message"
            });
        }
    });
};
module.exports = registerChatHandlers;