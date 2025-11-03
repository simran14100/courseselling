import { apiConnector } from '../apiConnector';
import { endpoints } from '../api';

const { GET_ALL_CATEGORIES } = endpoints;

export const getAllCategories = async () => {
  try {
    const response = await apiConnector('GET', GET_ALL_CATEGORIES);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
