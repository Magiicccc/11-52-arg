export const buildMeta={
  commit: import.meta.env.VITE_GIT_COMMIT||"local",
  workflowRun: import.meta.env.VITE_WORKFLOW_RUN||"local"
};
