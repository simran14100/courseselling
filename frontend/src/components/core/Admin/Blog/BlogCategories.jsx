import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { 
  fetchAllCategories,
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../../../services/operations/blogAPI';

export default function BlogCategories() {
  const { token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetchAllCategories();
      if (response && response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      const response = await createCategory({ name: newCategory }, token);
      if (response.success) {
        toast.success('Category added successfully');
        setNewCategory('');
        setIsAdding(false);
        await loadCategories();
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.message || 'Failed to add category');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category._id);
    setEditValue(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleUpdateCategory = async (categoryId) => {
    if (!editValue.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      const response = await updateCategory(categoryId, { name: editValue }, token);
      if (response.success) {
        toast.success('Category updated successfully');
        setEditingId(null);
        setEditValue('');
        await loadCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.message || 'Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        const response = await deleteCategory(categoryId, token);
        if (response.success) {
          toast.success('Category deleted successfully');
          await loadCategories();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.response?.data?.message || 'Failed to delete category. Make sure no blog posts are using this category.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-richblack-800">Blog Categories</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-richblack-900 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <FiPlus className="text-lg" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Add Category Form */}
      {isAdding && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="flex-1 px-4 py-2 border border-richblack-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewCategory('');
              }}
              className="px-4 py-2 border border-richblack-300 text-richblack-700 rounded-md hover:bg-richblack-50 focus:outline-none focus:ring-2 focus:ring-richblack-500"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-richblack-200">
            <thead className="bg-richblack-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-500 uppercase tracking-wider">
                  Posts
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-richblack-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-richblack-200">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-richblack-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === category._id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <div className="text-sm font-medium text-richblack-900">{category.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-500">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-500">
                      {category.postCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {editingId === category._id ? (
                          <>
                            <button
                              onClick={() => handleUpdateCategory(category._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Save"
                            >
                              <FiCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(category)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit"
                            >
                              <FiEdit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                              disabled={category.postCount > 0}
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-richblack-500">
                    No categories found. Add your first category!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
