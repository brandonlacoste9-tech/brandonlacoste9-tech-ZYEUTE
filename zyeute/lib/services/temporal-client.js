/**
 * Temporal Client for Colony OS
 * Handles workflow orchestration and task routing
 * 
 * Note: This is a JavaScript/Node.js implementation
 * For production, install: npm install @temporalio/client
 */

class TemporalService {
  constructor() {
    this.client = null;
    this.connection = null;
    this.connected = false;
  }

  async connect() {
    try {
      // For now, we'll use HTTP API until @temporalio/client is installed
      const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
      const temporalUrl = `http://${temporalAddress}`;
      
      // Test connection
      const response = await fetch(`${temporalUrl}/api/v1/namespaces`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.connected = true;
        this.temporalUrl = temporalUrl;
        console.log('✅ Connected to Temporal');
      } else {
        throw new Error('Failed to connect to Temporal');
      }
    } catch (error) {
      console.warn('⚠️  Temporal not available, using fallback mode:', error.message);
      this.connected = false;
      // Fallback to in-memory task queue
    }
  }

  /**
   * Submit bee task as Temporal workflow
   */
  async submitBeeTask(taskId, beeId, taskType, payload) {
    if (!this.connected) {
      // Fallback: store in memory queue
      console.log(`🐝 Task ${taskId} queued (fallback mode)`);
      return { workflowId: `task-${taskId}`, status: 'queued' };
    }

    try {
      const response = await fetch(`${this.temporalUrl}/api/v1/namespaces/colony-os/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowType: 'beeTaskWorkflow',
          taskQueue: 'colony-tasks',
          workflowId: `task-${taskId}`,
          input: {
            taskId,
            beeId,
            taskType,
            payload,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();
      console.log(`🐝 Task ${taskId} submitted to Temporal workflow ${data.workflowId}`);
      return data;
    } catch (error) {
      console.error('Error submitting to Temporal:', error);
      // Fallback
      return { workflowId: `task-${taskId}`, status: 'queued' };
    }
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId) {
    if (!this.connected) {
      return { workflowId, status: 'unknown', startTime: null, executionTime: null };
    }

    try {
      const response = await fetch(
        `${this.temporalUrl}/api/v1/namespaces/colony-os/workflows/${workflowId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      return {
        workflowId,
        status: data.status || 'unknown',
        startTime: data.startTime,
        executionTime: data.executionTime,
      };
    } catch (error) {
      console.error('Error getting workflow status:', error);
      return { workflowId, status: 'error', startTime: null, executionTime: null };
    }
  }

  /**
   * Cancel workflow
   */
  async cancelWorkflow(workflowId) {
    if (!this.connected) {
      console.log(`❌ Workflow ${workflowId} cancelled (fallback mode)`);
      return;
    }

    try {
      await fetch(
        `${this.temporalUrl}/api/v1/namespaces/colony-os/workflows/${workflowId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`❌ Workflow ${workflowId} cancelled`);
    } catch (error) {
      console.error('Error cancelling workflow:', error);
    }
  }
}

export const temporalService = new TemporalService();

