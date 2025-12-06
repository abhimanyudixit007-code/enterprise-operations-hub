import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireRole } from '../middleware/auth';
import * as workflowController from '../controllers/workflowController';

const router = Router();

// Workflow CRUD
router.get('/', asyncHandler(workflowController.listWorkflows));
router.get('/:id', asyncHandler(workflowController.getWorkflow));
router.post('/', requireRole(['admin', 'manager']), asyncHandler(workflowController.createWorkflow));
router.put('/:id', requireRole(['admin', 'manager']), asyncHandler(workflowController.updateWorkflow));
router.delete('/:id', requireRole(['admin']), asyncHandler(workflowController.deleteWorkflow));

// Workflow execution
router.post('/:id/execute', asyncHandler(workflowController.executeWorkflow));
router.get('/:id/executions', asyncHandler(workflowController.getWorkflowExecutions));
router.get('/executions/:executionId', asyncHandler(workflowController.getExecutionDetails));
router.post('/executions/:executionId/cancel', asyncHandler(workflowController.cancelExecution));

// Workflow templates
router.get('/templates/list', asyncHandler(workflowController.listTemplates));
router.post('/templates/:templateId/create', asyncHandler(workflowController.createFromTemplate));

export default router;
