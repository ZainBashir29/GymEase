import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import ApiError from "../utils/ApiError.js";

const createMessage = async ({
  conversationId,
  senderId,
  receiverId,
  messageText,
}) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isSenderParticipant = conversation.participants.some(
    (participant) => participant.toString() == senderId.toString(),
  );

  if (!isSenderParticipant) {
    throw new ApiError(403, "Access denied");
  }

  const isReceiverParticipant = conversation.participants.some(
    (participant) => participant.toString() == receiverId.toString(),
  );

  if (!isReceiverParticipant) {
    throw new ApiError(403, "Receiver does not belong to this conversation");
  }

  const message = await Message.create({
    conversationId,
    senderId,
    receiverId,
    messageText,
  });

  if (!message) {
    throw new ApiError(500, "Failed to send the message");
  }

  try {
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessage: message.messageText || "Message",
        lastMessageAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error(
      `Failed to update conversation preview for ${conversationId}, `,
      error.message,
    );
  }

  return message;
};

export default createMessage;
