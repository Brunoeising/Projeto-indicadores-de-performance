import axios from 'axios';

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const BASE_URL = "https://indicators-backend.vercel.app/api/analista";

// Na definição da função:
export const fetchAllUsers = async ({
  page,
  rowsPerPage,
  filter,
  signal
}: {
  page: number;
  rowsPerPage: number;
  filter: string;
  signal: AbortSignal;
}) => {
  try {
    const response = await axios.get(`${BASE_URL}/analistas`, {
      params: {
        page,
        rowsPerPage,
        filter
      },
      signal: signal
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const fetchUserById = async (userId: any) => {
  try {
    const response = await axios.get(`${BASE_URL}/analistas/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUserById = async (userId: any) => {
  try {
    const response = await axios.delete(`${BASE_URL}/analistas/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserById = async (userId: any, data: any) => {
  try {
    const response = await axios.put(`${BASE_URL}/analistas/${userId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/analistas`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
