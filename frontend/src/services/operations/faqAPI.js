import { apiConnector } from '../apiConnector';
import { toast } from 'react-hot-toast';

const FAQ_API = {
  BASE: '/api/v1/faq',
  get CREATE_FAQ() { return this.BASE + '/create' },
  get GET_ALL_FAQS() { return this.BASE },
  get UPDATE_FAQ() { return this.BASE },
  get DELETE_FAQ() { return this.BASE },
};

export const fetchAllFAQs = async () => {
  try {
    const response = await apiConnector('GET', FAQ_API.GET_ALL_FAQS);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch FAQs');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
};

export const createFAQ = async (data, token) => {
  try {
    const response = await apiConnector(
      'POST',
      FAQ_API.CREATE_FAQ,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create FAQ');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating FAQ:', error);
    throw error;
  }
};

export const updateFAQ = async (id, data, token) => {
  try {
    const response = await apiConnector(
      'PUT',
      `${FAQ_API.UPDATE_FAQ}/${id}`,
      data,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update FAQ');
    }

    toast.success('FAQ updated successfully');
    return response.data;
  } catch (error) {
    console.error('Error updating FAQ:', error);
    toast.error(error.response?.data?.message || 'Failed to update FAQ');
    throw error;
  }
};

export const deleteFAQ = async (id, token) => {
  try {
    const response = await apiConnector(
      'DELETE',
      `${FAQ_API.DELETE_FAQ}/${id}`,
      {},
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete FAQ');
    }

    toast.success('FAQ deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    toast.error(error.response?.data?.message || 'Failed to delete FAQ');
    throw error;
  }
};
