const { Schema, model} = require('mongoose');

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        tokenVersion: {
            type: Number,
            required: true,
        },
        conversations: [{type: Schema.Types.ObjectId, ref: "Conversation"}],
        pinned: [{type: Schema.Types.ObjectId, ref: "Conversation"}]

    },
    {
        timeseries: true,
        timestamps: true
    }
);

const Users = model("Users", userSchema);

module.exports = Users;