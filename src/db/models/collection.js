import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const collectionSchema = new Schema({
    userId: String,
    events: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Event' // Reference to the Event model
        }
    ]
},
{
    timestamps: true
});

export default mongoose.model('Collection', collectionSchema);
