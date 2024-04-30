const messages = {
  nextStep: "Next step",
  loading: "loading 🔁",
  error: "Fetch failed !",
  authError: "Please login first",
  cancel: "Operation cancelled.🙁",
  browser: {
    opened: "Browser opened",
    opening: "Opening browser 🔁",
  },
  login: {
    waiting: "Waiting for login 🔁",
    success: "Logged to Gitoq CLI 🚀",
    error: "You are already logged in",
  },
  workspace: {
    select: "please select workspace:",
    checked: "The workspaces you have access to have been checked",
    notFound: "You don't have any workspaces containing at least one project !",
  },
  env: {
    pushed: "Env pushed ✅",
    pulled: "Env pulled ✅",
    select: "Please select an env:",
    notFound: "no env file found in this directory",
    checked: "The envs you have access to have been checked",
  },
  project: {
    remote: "Remote added ✅",
    selected: "now selected ✅",
    select: "Please select project:",
    disconnected: "Project disconnected ✅",
    connect: "Please connect a project first",
    notFound: "There are no projects in this workspace !",
    checked: "The projects you have access to have been checked",
  },
};

export default messages;
