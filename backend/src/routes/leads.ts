import { Router } from 'express';
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeads,
} from '../controllers/leadController.js';
import { leadValidator, leadUpdateValidator } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All leads routes are protected
router.use(authenticate);

// Export must be defined BEFORE /:id to prevent matching "export" as an ID
router.get('/export', exportLeads);

router.post('/', leadValidator, createLead);
router.get('/', getAllLeads);
router.get('/:id', getLeadById);
router.put('/:id', leadUpdateValidator, updateLead);
router.delete('/:id', deleteLead);

export default router;
