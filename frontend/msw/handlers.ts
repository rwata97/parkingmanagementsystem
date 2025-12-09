import { HttpHandler } from "msw";

import {
  getCurrentRaffle,
  getRaffles,
  getRafflesById,
  getUser,
  getResidentRaffleHistory,
  getSpots,
  getResidents,
} from "./handlers/get";

import {
  postRegisterForRaffles,
  postRunRaffle,
  postLogout,
  postLogin,
  postRegister,
  postResetRequest,
  postRequestResetConfirm,
} from "./handlers/post";

export interface HandlerConfig {
  mockData?: any;
  operationName: string;
  handler?: HttpHandler;
}

//GET
const queries: HandlerConfig[] = [
  {
    handler: getRaffles,
    operationName: "getRaffles",
  },
  {
    handler: getRafflesById,
    operationName: "getRafflesById",
  },
  {
    handler: getCurrentRaffle,
    operationName: "getCurrentRaffle",
  },
  {
    handler: getUser,
    operationName: "getUser",
  },
  {
    handler: getResidentRaffleHistory,
    operationName: "getResidentRaffleHistory",
  },
  {
    handler: getSpots,
    operationName: "getSpots",
  },
  {
    handler: getResidents,
    operationName: "getResidents",
  },
];

//POST, PUT

const mutations: HandlerConfig[] = [
  {
    handler: postRegisterForRaffles,
    operationName: "postRegisterForRaffles",
  },
  {
    handler: postRunRaffle,
    operationName: "postRunRaffle",
  },
  {
    handler: postLogout,
    operationName: "postLogout",
  },
  {
    handler: postLogin,
    operationName: "postLogin",
  },
  {
    handler: postRegister,
    operationName: "postRegister",
  },
  {
    handler: postResetRequest,
    operationName: "postResetRequest",
  },
  {
    handler: postRequestResetConfirm,
    operationName: "postRequestResetConfirm",
  },
];

const handlers = [
  ...queries.map((q) => q.handler),
  ...mutations.map((m) => m.handler),
];

export default handlers as HttpHandler[];
