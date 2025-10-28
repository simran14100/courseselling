

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { getStudentAssignments } from "../services/operations/assignmentApi";
// import DashboardLayout from "../components/common/DashboardLayout";

// const ED_TEAL = '#07A698';
// const ED_TEAL_DARK = '#059a8c';
// const BORDER = '#e0e0e0';
// const TEXT_DARK = '#191A1F';

// export default function Assignments() {
//   const navigate = useNavigate();
//   const { token } = useSelector((state) => state.auth);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const data = await getStudentAssignments(token);
//         if (mounted) setItems(Array.isArray(data) ? data : []);
//       } catch (e) {
//         if (mounted) setError(e?.message || "Failed to load assignments");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => { mounted = false; };
//   }, [token]);

//   if (loading) {
//     return (
//       <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "32px" }}>
//         <div style={{ width: "32px", height: "32px", border: `3px solid ${ED_TEAL}`, borderTop: "3px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
//         <style>
//           {`@keyframes spin { 
//               from { transform: rotate(0deg); } 
//               to { transform: rotate(360deg); } 
//             }`}
//         </style>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ padding: "24px", color: "red", fontWeight: "500" }}>{error}</div>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div style={{ padding: "32px", width: "80%", marginLeft:"50px" }}>
//         <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "24px", color: TEXT_DARK, textAlign: "center" }}>
//           Assignments
//         </h1>

//         {items.length === 0 ? (
//           <div style={{ color: "#666", textAlign: "center", padding: "40px 0" }}>No assignments yet.</div>
//         ) : (
//           <div style={{ overflowX: "auto" }}>
//             <table style={{
//               width: "100%",
//               borderCollapse: "collapse",
//               backgroundColor: "#fff",
//               borderRadius: "12px",
//               overflow: "hidden",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
//             }}>
//               <thead>
//                 <tr style={{ backgroundColor: ED_TEAL, color: "#fff", textAlign: "left" }}>
//                   <th style={{ padding: "16px", fontWeight: "600" }}>Title</th>
//                   <th style={{ padding: "16px", fontWeight: "600" }}>Batch</th>
//                   <th style={{ padding: "16px", fontWeight: "600" }}>Given Date</th>
//                   <th style={{ padding: "16px", fontWeight: "600" }}>Due Date</th>
//                   <th style={{ padding: "16px", fontWeight: "600", textAlign: "center" }}>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {([...items]
//                   .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
//                 ).map((task, index) => (
//                   <tr key={task._id} style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff" }}>
//                     <td style={{ padding: "16px", color: TEXT_DARK, fontWeight: "500" }}>{task.title}</td>
//                     <td style={{ padding: "16px", color: "#555" }}>{task.batch?.name || "—"}</td>
//                     <td style={{ padding: "16px", color: "#555" }}>
//                       {task.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}
//                     </td>
//                     <td style={{ padding: "16px", color: "#555" }}>
//                       {task.dueDate ? new Date(task.dueDate).toLocaleString() : "—"}
//                     </td>
//                     <td style={{ padding: "16px", textAlign: "center" }}>
//                       <button
//                         onClick={() => navigate(`/dashboard/assignments/${task._id}`)}
//                         style={{
//                           padding: "10px 20px",
//                           backgroundColor: ED_TEAL,
//                           color: "#fff",
//                           border: "none",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                           fontWeight: "500",
//                           transition: "background 0.3s"
//                         }}
//                         onMouseOver={(e) => e.target.style.backgroundColor = ED_TEAL_DARK}
//                         onMouseOut={(e) => e.target.style.backgroundColor = ED_TEAL}
//                       >
//                         View 
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getStudentAssignments } from "../services/operations/assignmentApi";
import DashboardLayout from "../components/common/DashboardLayout";

const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';

export default function Assignments() {
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let isMounted = true;
    console.log("1. Component mounted, starting data fetch...");
    
    const fetchData = async () => {
      if (!token) {
        console.error("2. No token available");
        if (isMounted) {
          setError("Authentication required. Please log in.");
          setLoading(false);
        }
        return;
      }

      try {
        console.log("3. Fetching assignments with token:", token ? 'token exists' : 'no token');
        const data = await getStudentAssignments(token);
        console.log("4. Received data:", data);
        
        if (isMounted) {
          // Handle both array response and object with data property
          const assignments = Array.isArray(data) ? data : (data?.data || []);
          console.log(`5. Setting ${assignments.length} items`);
          setItems(assignments);
          
          if (assignments.length === 0) {
            console.log("6. No assignments found for the student");
          }
        }
      } catch (err) {
        console.error("7. Error in fetchData:", {
          message: err.message,
          response: err.response?.data,
          stack: err.stack
        });
        if (isMounted) {
          setError(err.message || "Failed to load assignments. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      console.log("8. Component unmounted, cleaning up...");
    };
  }, [token]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "50vh" 
        }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            border: `4px solid ${ED_TEAL}`, 
            borderTop: "4px solid transparent", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite" 
          }} />
          <style>
            {`
              @keyframes spin { 
                from { transform: rotate(0deg); } 
                to { transform: rotate(360deg); } 
              }
            `}
          </style>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div style={{ 
          padding: "24px", 
          margin: "20px",
          backgroundColor: "#ffebee",
          borderRadius: "8px",
          borderLeft: "4px solid #f44336"
        }}>
          <h3 style={{ color: "#d32f2f", marginTop: 0 }}>Error Loading Assignments</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: ED_TEAL,
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ 
        padding: "32px", 
        maxWidth: "1200px", 
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <h1 style={{ 
          fontSize: "28px", 
          fontWeight: "600", 
          marginBottom: "24px", 
          color: TEXT_DARK, 
          textAlign: "center" 
        }}>
          My Assignments
        </h1>

        {items.length === 0 ? (
          <div style={{ 
            backgroundColor: "#fff", 
            padding: "40px", 
            borderRadius: "12px", 
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={{ 
              fontSize: "48px", 
              marginBottom: "16px",
              color: "#e0e0e0"
            }}>
              📝
            </div>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              color: "#555" 
            }}>
              No Assignments Found
            </h3>
            <p style={{ 
              color: "#777", 
              margin: 0 
            }}>
              You don't have any assignments at the moment.
            </p>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: "#fff", 
            borderRadius: "12px", 
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={{ 
              overflowX: "auto",
              WebkitOverflowScrolling: "touch"
            }}>
              <table style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
            }}>
              <thead>
                <tr style={{ backgroundColor: ED_TEAL, color: "#fff", textAlign: "left" }}>
                  <th style={{ padding: "16px", fontWeight: "600" }}>Title</th>
                  <th style={{ padding: "16px", fontWeight: "600" }}>Batch</th>
                  <th style={{ padding: "16px", fontWeight: "600" }}>Given Date</th>
                  <th style={{ padding: "16px", fontWeight: "600" }}>Due Date</th>
                  <th style={{ padding: "16px", fontWeight: "600", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {([...items]
                  .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
                ).map((task, index) => (
                  <tr key={task._id} style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff" }}>
                    <td style={{ padding: "16px", color: TEXT_DARK, fontWeight: "500" }}>{task.title}</td>
                    <td style={{ padding: "16px", color: "#555" }}>{task.batch?.name || "—"}</td>
                    <td style={{ padding: "16px", color: "#555" }}>
                      {task.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}
                    </td>
                    <td style={{ padding: "16px", color: "#555" }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleString() : "—"}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <button
                        onClick={() => navigate(`/dashboard/assignments/${task._id}`)}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: ED_TEAL,
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "500",
                          transition: "background 0.3s"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = ED_TEAL_DARK}
                        onMouseOut={(e) => e.target.style.backgroundColor = ED_TEAL}
                      >
                        View 
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}