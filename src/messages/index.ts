import { LOCAL_ENV_PATHS } from "../constants/index.js";

const messages = {
  nextStep: "Next step",
  loading: "Loading 🔁",
  needHelp: "Do you need help?",
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
    select: "Please select env:",
    checked: "The envs you have access to have been checked",
    pushed: `Your ${LOCAL_ENV_PATHS} pushed to {name} env 🔑`,
    pulled: `Your ${LOCAL_ENV_PATHS} pulled from {name} env 🔑`,
    notFound: `No ${LOCAL_ENV_PATHS} file found in this directory`,
  },
  project: {
    remote: "Remote added 🔒",
    selected: "{name} selected 🔒",
    select: "Please select project:",
    disconnected: "Project disconnected",
    connect: "Please connect a project first",
    notFound: "There are no projects in this workspace !",
    checked: "The projects you have access to have been checked",
  },
};

export default messages;
