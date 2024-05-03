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
    pushed: `Your {path} pushed to {name} env 🔑`,
    pulled: `Your {path} pulled from {name} env 🔑`,
    checked: "The envs you have access to have been checked",
    notFound: `No ${LOCAL_ENV_PATHS[0]} file found in this directory`,
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
