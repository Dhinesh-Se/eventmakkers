import Event from '../../db/models/Event';
import Category from '../../db/models/category';
const ErrorResponse = require('../../utils/errorResponse');
import Collection from '../../db/models/collection';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const getEvents = async (req, res, next) => {
    const { query, navigation, total } = req.queryParams;

    const page = parseInt(navigation.page, 10) || 1;
    const limit = parseInt(navigation.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const events = await Event.find(query)
        .skip(startIndex)
        .limit(limit);

    const pagination = {};
    pagination.total = total;

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    if (req.user) {
            const collection = await Collection.findOne({ userId: req.user._id });
        
            if (collection && collection.events) {
        
                collection.events.forEach(eventId => {
                    events.forEach(event => {
                        if (eventId.toString() === event._id.toString()) {
                            event.liked = true;
                        }
                    })
                });
            }
    }

    res.status(200).json({ count: events.length , data: events, pagination });
};

export const getEvent = (req, res, next) => {
    Event.findById(req.params.id)
        .then(event => {
            if (!event) {
                return next(
                    new ErrorResponse('Event not found', 404)
                    );
                }
                
                res.status(200).json({ data: event });
            },
            error => {
                next(
                    new ErrorResponse('Event not found', 404)
                );
        });
};

export const getEventCategories = (req, res, next) => {
    console.log("Fetching event categories...");
    Category.find()
        .then(categories => {
            console.log("Categories found:", categories);
            res.status(200).json({ data: categories });
        })
        .catch(error => {
            console.error("Error fetching categories:", error);
            next(error);
        });
};

export const createEvent = async (req, res, next) => {
    try {
        const { tags, liked, ...eventData } = req.body; // Extract the 'liked' field from the request body

        // Create an array to store tagIds
        const tagIds = [];

        // Loop through each tag in the tags array
        for (const tagName of tags) {
            // Check if the category (tag) already exists in the database
            let category = await Category.findOne({ name: tagName });

            // If category does not exist, create a new one
            if (!category) {
                category = new Category({ name: tagName });
                await category.save();
            }

            // Add the category's ObjectId to the tagIds array
            tagIds.push(category._id);
        }

        // Create the event with the tagIds array
        const event = new Event({
            ...eventData,
            userId: req.user._id,
            tags: tagIds,
            liked: liked || false // Set the 'liked' field to the provided value or false if not provided
        });

        // Save the event
        await event.save();

        res.status(201).json({ data: event });
    } catch (error) {
        next(error);
    }
};



export const updateEvent = (req, res, next) => {
    Event.findById(req.params.id)
        .then(event => {
            if (!event) {
                return next(new ErrorResponse(`Event with id ${req.params.id} not found.`, 404));
            }
            return event;
        })
        .then(event => {
            if (event.userId.toString() !== req.user.id) {
                return next(new ErrorResponse('User is not authorized.', 401));
            }

            return Event.findByIdAndUpdate(req.params.id, req.body, {
                $set: req.body,
                new: true,
                runValidators: true
            });
        })
        .then(event => {
            res.status(200).json({ data: event });
        },
        error => {
            next(error);
        });
};

export const deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return next(new ErrorResponse(`Event with id ${req.params.id} not found.`, 404));
        }

        if (event.userId.toString() !== req.user.id) {
            return next(new ErrorResponse('User is not authorized.', 401));
        }

        await Event.findByIdAndRemove(req.params.id);

        res.status(200).json({ data: {} });
    } catch (error) {
        next(error);
    }
};