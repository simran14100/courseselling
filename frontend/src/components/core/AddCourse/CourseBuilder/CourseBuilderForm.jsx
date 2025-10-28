

import { useState } from "react";
import { useForm } from "react-hook-form";
import { showSuccess, showError } from "../../../../utils/toast";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdNavigateNext } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import { createSection, updateSection, deleteSection } from "../../../../services/operations/courseDetailsAPI";
import { setCourse, setEditCourse, setStep } from "../../../../store/slices/courseSlice";

import IconBtn from "../../../common/IconBtn";
import NestedView from "./NestedView";

// Color constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const ED_TEAL_LIGHT = '#E6F7F5';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#F5F5F5';
const GRAY_DARK = '#333333';
const ED_RED = '#EF4444';

export default function CourseBuilderForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { course, editCourse } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [editSectionName, setEditSectionName] = useState(null);
  const dispatch = useDispatch();

  // Styles
  const styles = {
    container: {
      maxWidth: '56rem',
      margin: '0 auto',
      borderRadius: '0.5rem',
      border: `1px solid ${GRAY_LIGHT}`,
      backgroundColor: WHITE,
      padding: '1.5rem',
      boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: GRAY_DARK,
      marginBottom: '2rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: GRAY_DARK,
      marginBottom: '0.5rem',
      display: 'block',
    },
    input: {
      flex: 1,
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      border: `1px solid ${errors.sectionName ? ED_RED : '#D1D5DB'}`,
      backgroundColor: errors.sectionName ? `${ED_RED}10` : WHITE,
      outline: 'none',
      transition: 'all 0.2s',
      ':focus': {
        borderColor: ED_TEAL,
        boxShadow: `0 0 0 2px ${ED_TEAL}20`,
      },
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      borderRadius: '0.375rem',
      padding: '0.5rem 1rem',
      backgroundColor: loading ? `${ED_TEAL}80` : ED_TEAL,
      color: WHITE,
      border: 'none',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: ED_TEAL_DARK,
      },
      ':disabled': {
        opacity: 0.7,
        cursor: 'not-allowed',
      },
    },
    cancelButton: {
      borderRadius: '0.375rem',
      padding: '0.5rem 1rem',
      backgroundColor: WHITE,
      color: GRAY_DARK,
      border: `1px solid #D1D5DB`,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: GRAY_LIGHT,
      },
    },
    navigation: {
      borderTop: `1px solid ${GRAY_LIGHT}`,
      paddingTop: '1.5rem',
      marginTop: '2rem',
    },
    backButton: {
      padding: '0.5rem 1rem',
      backgroundColor: WHITE,
      color: GRAY_DARK,
      border: `1px solid #D1D5DB`,
      borderRadius: '0.375rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: GRAY_LIGHT,
      },
    },
    nextButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      backgroundColor: ED_TEAL,
      color: WHITE,
      border: 'none',
      borderRadius: '0.375rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: ED_TEAL_DARK,
      },
    },
    helpText: {
      marginTop: '1rem',
      textAlign: 'center',
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    errorText: {
      fontSize: '0.875rem',
      color: ED_RED,
      marginTop: '0.25rem',
    },
    spinner: {
      animation: 'spin 1s linear infinite',
    },
  };

  // handle form submission
  const onSubmit = async (data) => {
    if (!data.sectionName?.trim()) {
      showError("Section name cannot be empty");
      return;
    }
    // Ensure we have a course id before attempting to create/update a section
    if (!course?._id) {
      showError("Course not initialized. Please save basic course details first.");
      console.warn("[CourseBuilderForm] Missing course._id. Current course state:", course);
      return;
    }
    
    setLoading(true);
    try {
      let result;
      if (editSectionName) {
        const payload = {
          sectionName: data.sectionName.trim(),
          sectionId: editSectionName,
          courseId: course._id,
        };
        console.log("[CourseBuilderForm] updateSection payload:", payload);
        result = await updateSection(
          payload,
          token
        );
      } else {
        const payload = {
          sectionName: data.sectionName.trim(),
          courseId: course._id,
        };
        console.log("[CourseBuilderForm] createSection payload:", payload);
        result = await createSection(payload, token);
      }
      
      if (result) {
        dispatch(setCourse(result));
        setEditSectionName(null);
        setValue("sectionName", "");
        showSuccess(`Section ${editSectionName ? 'updated' : 'created'} successfully`);
      }
    } catch (error) {
      console.error("Error saving section:", error);
      showError(error.response?.data?.message || 'Failed to save section');
    } finally {
      setLoading(false);
    }
  }

  const cancelEdit = () => {
    setEditSectionName(null);
    setValue("sectionName", "");
  };

  const handleEditSection = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      cancelEdit();
      return;
    }
    setEditSectionName(sectionId);
    setValue("sectionName", sectionName);
  };

  const handleChangeEditSectionName = (sectionId, sectionName) => {
    handleEditSection(sectionId, sectionName);
    document.getElementById('sectionInput')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToNext = () => {
    if (!course.courseContent || course.courseContent.length === 0) {
      showError("Please add at least one section");
      return;
    }
    
    const hasEmptySubsections = course.courseContent.some(
      section => !section.subSection || section.subSection.length === 0
    );
    
    if (hasEmptySubsections) {
      showError("Please add at least one lecture in each section");
      return;
    }
    
    dispatch(setStep(3));
  };

  const goBack = () => {
    if (!editCourse) {
      dispatch(setEditCourse(true));
    }
    dispatch(setStep(1));
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Course Builder</h2>
      
      {/* Section Creation Form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={styles.label} htmlFor="sectionName">
            Section Name <span style={{ color: ED_RED }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              id="sectionInput"
              placeholder="Enter section name"
              {...register("sectionName", { required: true })}
              style={styles.input}
              disabled={loading}
            />
            <button
              type="submit"
              style={styles.addButton}
              disabled={loading}
            >
              {editSectionName ? "Update Section" : "Add Section"}
              {loading && (
                <div style={{ 
                  width: '1rem',
                  height: '1rem',
                  border: `2px solid ${WHITE}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </button>
            {editSectionName && (
              <button
                type="button"
                onClick={cancelEdit}
                style={styles.cancelButton}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
          {errors.sectionName && (
            <span style={styles.errorText}>Section name is required</span>
          )}
        </div>
      </form>

      {/* Nested View of Sections and Sub-sections */}
      {course.courseContent?.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={styles.navigation}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          '@media (minWidth: 640px)': {
            flexDirection: 'row',
            justifyContent: 'space-between',
          }
        }}>
          <button
            onClick={goBack}
            style={styles.backButton}
          >
            Back
          </button>
          
          {course.courseContent?.length > 0 && (
            <button
              onClick={goToNext}
              disabled={loading}
              style={styles.nextButton}
            >
              Next
              <MdNavigateNext size={20} />
            </button>
          )}
        </div>
        
        {(!course.courseContent || course.courseContent.length === 0) && (
          <div style={styles.helpText}>
            <p>Add at least one section with a lecture to continue</p>
          </div>
        )}
      </div>

      {/* Add keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}