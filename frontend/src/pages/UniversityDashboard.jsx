
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ACCOUNT_TYPE, PROGRAM_TYPE } from "../utils/constants";

export default function UniversityDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  // Check if user has access based on program type
  useEffect(() => {
    if (!user) return;
    
    // SuperAdmin and Admin have full access
    if ([ACCOUNT_TYPE.SUPER_ADMIN, ACCOUNT_TYPE.ADMIN].includes(user.accountType)) {
      return;
    }
    
    // Students must have a program type
    if (user.accountType === ACCOUNT_TYPE.STUDENT && !user.programType) {
      console.error("Student account missing program type");
      // Redirect to profile or show error
      navigate("/my-profile");
      return;
    }
    
    // You can add additional access control here based on programType
    // For example, if you want to restrict certain dashboards to certain programs
    
  }, [user, navigate, dispatch, token]);

  return (
    <div
      style={{
        minHeight: "60vh",
        marginTop: "12rem",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem",
        background: "#f8fbfd",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "white",
          borderRadius: "1rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid #e6eef5",
          padding: "2.5rem",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: "bold",
            color: "#0f172a",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          University Dashboard
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#475569",
            marginBottom: "2.5rem",
            fontSize: "1rem",
          }}
        >
          Choose which module you want to manage
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          {/* UG/PG Button */}
          <button
            onClick={() => navigate("/ugpg-admin")}
            style={{
              padding: "1rem 2rem",
              borderRadius: "0.75rem",
              fontWeight: "600",
              fontSize: "1rem",
              color: "#0f172a",
              border: "2px dashed #ef4444",
              background:
                "linear-gradient(180deg, rgba(239,68,68,0.04), rgba(239,68,68,0.02))",
              boxShadow: "0 6px 18px rgba(239,68,68,0.08)",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 10px 24px rgba(239,68,68,0.15)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 6px 18px rgba(239,68,68,0.08)";
            }}
          >
            UG / PG Courses
          </button>

          {/* PhD Button */}
          <button
            onClick={() => navigate("/phd-admin/session-management")}
            style={{
              padding: "1rem 2rem",
              borderRadius: "0.75rem",
              fontWeight: "600",
              fontSize: "1rem",
              color: "#0f172a",
              border: "2px dashed #2563eb",
              background:
                "linear-gradient(180deg, rgba(37,99,235,0.05), rgba(37,99,235,0.02))",
              boxShadow: "0 6px 18px rgba(37,99,235,0.10)",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 10px 24px rgba(37,99,235,0.18)";
            }} 
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 6px 18px rgba(37,99,235,0.10)";
            }}
          >
            PhD Courses
          </button>
        </div>
      </div>
    </div>
  );
}

