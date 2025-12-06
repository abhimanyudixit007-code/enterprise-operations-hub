import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { db } from '../utils/database';
import { temporalClient } from '../utils/temporal';

export const listWorkflows = async (req: AuthRequest, res: Response) => {
  const { organizationId } = req.user!;
  const { category, isActive, page = 1, limit = 20 } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  let query = 'SELECT * FROM workflows WHERE organization_id = $1';
  const params: any[] = [organizationId];
  let paramIndex = 2;

  if (category) {
    query += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (isActive !== undefined) {
    query += ` AND is_active = $${paramIndex}`;
    params.push(isActive === 'true');
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(Number(limit), offset);

  const result = await db.query(query, params);

  const countResult = await db.query(
    'SELECT COUNT(*) FROM workflows WHERE organization_id = $1',
    [organizationId]
  );

  res.json({
    workflows: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
    }
  });
};

export const getWorkflow = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user!;

  const result = await db.query(
    'SELECT * FROM workflows WHERE id = $1 AND organization_id = $2',
    [id, organizationId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Workflow not found', 404);
  }

  res.json(result.rows[0]);
};

export const createWorkflow = async (req: AuthRequest, res: Response) => {
  const { name, description, category, workflowDefinition } = req.body;
  const { organizationId, id: userId } = req.user!;

  if (!name || !workflowDefinition) {
    throw new AppError('Name and workflow definition are required', 400);
  }

  const result = await db.query(
    `INSERT INTO workflows (organization_id, name, description, category, workflow_definition, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [organizationId, name, description, category, JSON.stringify(workflowDefinition), userId]
  );

  logger.info('Workflow created', { workflowId: result.rows[0].id, userId });

  res.status(201).json(result.rows[0]);
};

export const updateWorkflow = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, category, workflowDefinition, isActive } = req.body;
  const { organizationId } = req.user!;

  const result = await db.query(
    `UPDATE workflows 
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         category = COALESCE($3, category),
         workflow_definition = COALESCE($4, workflow_definition),
         is_active = COALESCE($5, is_active),
         version = version + 1
     WHERE id = $6 AND organization_id = $7
     RETURNING *`,
    [name, description, category, workflowDefinition ? JSON.stringify(workflowDefinition) : null, isActive, id, organizationId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Workflow not found', 404);
  }

  res.json(result.rows[0]);
};

export const deleteWorkflow = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user!;

  const result = await db.query(
    'DELETE FROM workflows WHERE id = $1 AND organization_id = $2 RETURNING id',
    [id, organizationId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Workflow not found', 404);
  }

  res.json({ message: 'Workflow deleted successfully' });
};

export const executeWorkflow = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { inputData } = req.body;
  const { organizationId, id: userId } = req.user!;

  // Get workflow
  const workflowResult = await db.query(
    'SELECT * FROM workflows WHERE id = $1 AND organization_id = $2 AND is_active = true',
    [id, organizationId]
  );

  if (workflowResult.rows.length === 0) {
    throw new AppError('Workflow not found or inactive', 404);
  }

  // Create execution record
  const executionResult = await db.query(
    `INSERT INTO workflow_executions (workflow_id, organization_id, status, input_data, started_by, started_at)
     VALUES ($1, $2, 'running', $3, $4, NOW())
     RETURNING *`,
    [id, organizationId, JSON.stringify(inputData), userId]
  );

  const execution = executionResult.rows[0];

  // Start Temporal workflow (async)
  try {
    await temporalClient.startWorkflow(execution.id, workflowResult.rows[0].workflow_definition, inputData);
  } catch (error) {
    logger.error('Failed to start Temporal workflow', { error, executionId: execution.id });
    await db.query(
      'UPDATE workflow_executions SET status = $1, error_message = $2 WHERE id = $3',
      ['failed', 'Failed to start workflow execution', execution.id]
    );
    throw new AppError('Failed to start workflow execution', 500);
  }

  res.status(202).json({
    message: 'Workflow execution started',
    execution
  });
};

export const getWorkflowExecutions = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user!;
  const { status, page = 1, limit = 20 } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  let query = 'SELECT * FROM workflow_executions WHERE workflow_id = $1 AND organization_id = $2';
  const params: any[] = [id, organizationId];

  if (status) {
    query += ' AND status = $3';
    params.push(status);
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(Number(limit), offset);

  const result = await db.query(query, params);

  res.json({
    executions: result.rows
  });
};

export const getExecutionDetails = async (req: AuthRequest, res: Response) => {
  const { executionId } = req.params;
  const { organizationId } = req.user!;

  const executionResult = await db.query(
    'SELECT * FROM workflow_executions WHERE id = $1 AND organization_id = $2',
    [executionId, organizationId]
  );

  if (executionResult.rows.length === 0) {
    throw new AppError('Execution not found', 404);
  }

  const stepsResult = await db.query(
    'SELECT * FROM workflow_steps WHERE execution_id = $1 ORDER BY created_at ASC',
    [executionId]
  );

  res.json({
    execution: executionResult.rows[0],
    steps: stepsResult.rows
  });
};

export const cancelExecution = async (req: AuthRequest, res: Response) => {
  const { executionId } = req.params;
  const { organizationId } = req.user!;

  const result = await db.query(
    `UPDATE workflow_executions 
     SET status = 'cancelled', completed_at = NOW()
     WHERE id = $1 AND organization_id = $2 AND status = 'running'
     RETURNING *`,
    [executionId, organizationId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Execution not found or not running', 404);
  }

  // Cancel in Temporal
  try {
    await temporalClient.cancelWorkflow(executionId);
  } catch (error) {
    logger.error('Failed to cancel Temporal workflow', { error, executionId });
  }

  res.json({ message: 'Execution cancelled', execution: result.rows[0] });
};

export const listTemplates = async (req: AuthRequest, res: Response) => {
  // Predefined workflow templates
  const templates = [
    {
      id: 'invoice-approval',
      name: 'Invoice Approval Workflow',
      description: 'Automated invoice processing with multi-level approval',
      category: 'finance'
    },
    {
      id: 'employee-onboarding',
      name: 'Employee Onboarding',
      description: 'Complete employee onboarding process automation',
      category: 'hr'
    },
    {
      id: 'purchase-request',
      name: 'Purchase Request',
      description: 'Purchase request approval and procurement workflow',
      category: 'procurement'
    },
    {
      id: 'incident-resolution',
      name: 'Incident Resolution',
      description: 'IT incident tracking and resolution workflow',
      category: 'it'
    }
  ];

  res.json({ templates });
};

export const createFromTemplate = async (req: AuthRequest, res: Response) => {
  const { templateId } = req.params;
  const { name } = req.body;
  const { organizationId, id: userId } = req.user!;

  // Template definitions would be stored separately
  const templateDefinitions: any = {
    'invoice-approval': {
      steps: [
        { type: 'document-upload', name: 'Upload Invoice' },
        { type: 'ai-extraction', name: 'Extract Invoice Data' },
        { type: 'approval', name: 'Manager Approval', approver: 'manager' },
        { type: 'approval', name: 'Finance Approval', approver: 'finance' },
        { type: 'integration', name: 'Update ERP', integration: 'erp' }
      ]
    }
  };

  const definition = templateDefinitions[templateId];
  if (!definition) {
    throw new AppError('Template not found', 404);
  }

  const result = await db.query(
    `INSERT INTO workflows (organization_id, name, workflow_definition, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [organizationId, name, JSON.stringify(definition), userId]
  );

  res.status(201).json(result.rows[0]);
};
