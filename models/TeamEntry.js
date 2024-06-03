const mongoose = require("mongoose");

const teamEntrySchema = new mongoose.Schema(
    {
        teamName: { type: String, required: true },
        players: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Player",
            },
        ],
        captain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Player",
            required: true,
        },
        viceCaptain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Player",
            required: true,
        },
        points: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const TeamEntry = mongoose.model("TeamEntry", teamEntrySchema);

module.exports = TeamEntry;
