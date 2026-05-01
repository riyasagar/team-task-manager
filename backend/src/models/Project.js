const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    // Map of userId (string) -> role ("Admin" | "Member") scoped to this project
    roles: {
      type: Map,
      of: { type: String, enum: ["Admin", "Member"] },
      default: {},
    },
  },
  { timestamps: true }
);

projectSchema.index({ title: 1, createdBy: 1 });

module.exports = mongoose.model("Project", projectSchema);
