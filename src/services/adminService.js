import api from "./api";

// Data contracts for Admin API responses
export const AdminContracts = {
  CreateStallRequest: {
    stallName: "", 
    responsibleCpf: "", 
    password: "", 
  },
  CreateStallResponse: {
    id: "",  
    name: "", 
    cpf: "", 
    createdAt: "", 
  },
  CreateCashierRequest: {
    cashierId: "", 
    operatorCpf: "", 
    password: "", 
  },
  CreateCashierResponse: {
    id: "", 
    name: "", 
    cpf: "", 
    createdAt: "",
  },
};

export async function createStall(stallName, cpf, password) {
  const { data } = await api.post("/admin/barracas", {
    stallName,
    responsibleCpf: cpf,
    password,
  });
  return data;

  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve({
  //       id: Math.random().toString(36).substr(2, 9),
  //       name: stallName,
  //       cpf: cpf,
  //       createdAt: new Date().toISOString(),
  //     });
  //   }, 500);
  // });
}

export async function createCashier(cashierId, cpf, password) {
  const { data } = await api.post("/admin/caixas", {
    cashierId,
    operatorCpf: cpf,
    password,
  });
  return data;

  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve({
  //       id: Math.random().toString(36).substr(2, 9),
  //       name: cashierId,
  //       cpf: cpf,
  //       createdAt: new Date().toISOString(),
  //     });
  //   }, 500);
  // });
}
