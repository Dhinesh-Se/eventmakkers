import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    event: {
        eventId: {
          type: Schema.Types.ObjectId,
          ref: 'Event', // Reference to the Event model
        },
        name: String,
        organizer: String,
        date: Date,
        address: String,
        ticket: String,
      },
    payment: {
        cardNumber: String,
        csc: String,
        postal: String,
        expirationDate: String
    },
    user: {
        userId: {
            type: String,
            select: false
        },
        name: String,
        email: {
            type: String,
            match: [/^(\D)+(\w)*((\.(\w)+)?)+@(\D)+(\w)*((\.(\D)+(\w)*)+)?(\.)[a-z]{2,}$/,
            'Please enter a valid email']
        }
    },
    quantity: Number,
    price: mongoose.SchemaTypes.Decimal128
},
{
    timestamps: true,
    toJSON: { virtuals: true },
});
orderSchema.virtual('eventDetails', {
    ref: 'Event',
    localField: 'event.eventId',
    foreignField: '_id',
    justOne: true,
  });

export default mongoose.model('Order', orderSchema);