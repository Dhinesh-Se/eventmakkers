import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please add an event name']
    },
    userId: String,
    organizer: {
        name: {
            type: String,
            required: [true, 'Please add the name of the organizer']
        },
        website: String
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        minlength: 10,
        maxlength: 300
    },
    date: {
        type: Date,
        required: [true, 'Please add a date']
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
        maxlength: 50
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // Default to [0, 0] if coordinates are not provided
        },
        fullAddress: String,
        street: String,
        city: String,
        zipCode: String,
        country: String
    },
    tickets: {},
    tags: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Category' // Reference to the Category model
        }
    ],
    imageUrl: {
        type: String,
        required: [true, 'Please add image url']
    },
    liked: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;
