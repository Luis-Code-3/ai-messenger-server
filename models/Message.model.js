const { Schema, model} = require('mongoose');

const messageSchema = new Schema(
    {
        text: {
            type: String,
        },
        image: {
            type: String,
        },
        conversation: {type: Schema.Types.ObjectId, ref: "Conversation"},
        sender: {type: Schema.Types.ObjectId, ref: "Users"},
        seenIds: [{type: Schema.Types.ObjectId, ref: "Users"}],
    },
    {
        timeseries: true,
        timestamps: true
    }
);

const Message = model("Message", messageSchema);

module.exports = Message;