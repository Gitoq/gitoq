const messages = {
  nextStep: "Next step",
  loading: "loading 🔁",
  error: "Fetch failed !",
  authError: "Please login first",
  cancel: "Operation cancelled.🙁",
  login: {
    waiting: "Waiting for login 🔁",
    success: "Logged to Gitoq CLI 🚀",
    error: "You are already logged in",
  },
  workspace: {
    select: "please select workspace:",
    notFound: "You don't have any workspaces containing at least one project !",
  },
  env: {
    pushed: "Env pushed ✅",
    pulled: "Env pulled ✅",
    select: "Please select an env:",
    notFound: "no env file found in this directory",
  },
  project: {
    remote: "Remote added ✅",
    select: "Please select project:",
    disconnected: "Project disconnected ✅",
    connect: "Please connect a project first",
    notFound: "There are no projects in this workspace !",
  },
};

export default messages;
