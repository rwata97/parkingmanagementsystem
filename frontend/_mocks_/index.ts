// src/mocks/index.ts
import * as auth from "./auth";
import * as raffles from "./raffles";
import * as spots from "./spots";
import * as residents from "./residents";

// (Optional) stub for assignments
const assignments = {
  async listByResident(residentId: string) {
    return [];
  },
};

export const API = {
  auth: {
    login: auth.login,
    register: auth.register,
    me: auth.me,
    logout: auth.logout,
    requestPasswordReset: auth.requestPasswordReset,
    resetPassword: auth.resetPassword,
  },
  raffles: {
    current: raffles.current,
    register: raffles.register,
    run: raffles.run,
    get: raffles.get,
    list: raffles.list,
  },
  spots: {
    list: spots.list,
    update: spots.update,
  },
  residents: {
    list: residents.list,
  },
  assignments,
};
