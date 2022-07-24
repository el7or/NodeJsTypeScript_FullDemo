import { Schema, model } from 'mongoose';

const roleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},
    {
        timestamps: true,
        statics: {
            findWithUsersCount() {
                return model('Role').aggregate([
                    { $lookup: { from: "users", localField: "_id", foreignField: "roleId", as: "usersCount" } },
                    { $addFields: { usersCount: { $size: "$usersCount" } } }
                ]);
            }
        }
    });

// roleSchema.methods.findWithUsersCount = function(cb) {
//     return model('Role').aggregate([
//         { $lookup: { from: "users", localField: "_id", foreignField: "roleId", as: "usersCount" } },
//         { $addFields: { usersCount: { $size: "$usersCount" } } }
//     ]);
//   };

export default model('Role', roleSchema);