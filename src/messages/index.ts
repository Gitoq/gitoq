const messages = {
  nextStep: "Next step",
  loading: "Loading 🔁",
  error: "Fetch failed !",
  needHelp: "Do you need help?",
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
    select: "Please select workspace:",
    checked: "The workspaces you have access to have been checked",
    notFound: "You don't have any workspaces containing at least one project !",
  },
  env: {
    select: "Please select an env:",
    pushed: "Your .env.local pushed in {name} env 🔑",
    pulled: "Your .env.local pulled in {name} env 🔑",
    notFound: "No .env.local file found in this directory",
    checked: "The envs you have access to have been checked",
  },
  project: {
    remote: "Remote added 🔒",
    select: "Please select project:",
    selected: "{name} now selected 🔒",
    disconnected: "Project disconnected",
    connect: "Please connect a project first",
    notFound: "There are no projects in this workspace !",
    checked: "The projects you have access to have been checked",
  },
};

export default messages;
