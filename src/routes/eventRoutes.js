import express from 'express';

import { 
    getEvents,
    getEvent,
    getEventCategories,
    createEvent,
    updateEvent,
    deleteEvent,
} from './controllers/eventsController';
import { guard } from '../routes/middleware/auth';
import { getFilter } from '../routes/middleware/getFilter';

const router = express.Router();

router.route('/events').get(getFilter, getEvents);
router.route('/events/:id').get(getEvent).put(guard, updateEvent).delete(guard, deleteEvent);router.route('/events/categories').get(getEventCategories);
router.route('/events').post(guard, createEvent);
export default router;
