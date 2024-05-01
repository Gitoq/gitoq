import { LOCAL_ENV_PATHS } from "../constants/index.js";

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
    checked: "The envs you have access to have been checked",
    pushed: `Your ${LOCAL_ENV_PATHS} pushed in {name} env 🔑`,
    pulled: `Your ${LOCAL_ENV_PATHS} pulled in {name} env 🔑`,
    notFound: `No ${LOCAL_ENV_PATHS} file found in this directory`,
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
