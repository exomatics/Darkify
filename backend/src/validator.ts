import { z } from 'zod';

const uuidSchema = z.string().uuid();

export default uuidSchema;
