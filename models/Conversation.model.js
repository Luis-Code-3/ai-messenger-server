const { Schema, model} = require('mongoose');

const conversationSchema = new Schema(
    {
        name: {
            type: String,
        },
        isGroup: {
            type: Boolean,
            required: true,
        },
        lastMessageAt: {
            type: Date,
        },
        image: {
            type: String,
        },
        members: [{type: Schema.Types.ObjectId, ref: "Users"}],
        admin: {type: Schema.Types.ObjectId, ref: "Users"}
    },
    {
        timeseries: true,
        timestamps: true
    }
);

const Conversation = model("Conversation", conversationSchema);

module.exports = Conversation;