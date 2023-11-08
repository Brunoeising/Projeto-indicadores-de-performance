import React from "react";
const columns = [
  { name: "Nome", uid: "name", sortable: true },
  { name: "Email", uid: "email", sortable: true },
  { name: "Perfil", uid: "perfil", sortable: true },
  { name: "Celular", uid: "celular" },
  { name: "Código Movidesk", uid: "codigoMovidesk" },
  { name: "Ações", uid: "ações" }
];


const statusOptions = [
  {name: "ativo", uid: "ativo"},
  {name: "inativo", uid: "inativo"},
];

export {columns, statusOptions};
