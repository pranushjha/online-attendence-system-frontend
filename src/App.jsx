import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login/Login";

import Dashboard from "./pages/Dashboard/Dashboard";
import Teachers from "./pages/Teachers/Teachers";
import Classes from "./pages/Classes/Classes";
import Students from "./pages/Students/Students";
import Attendance from "./pages/Attendance/Attendance";

import Reports from "./pages/Reports/Reports";
import AdminReports from "./pages/Reports/AdminReports";

import MyClass from "./pages/MyClass/MyClass";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";


// ==========================================
// APP
// ==========================================

function App() {

  return (
      <BrowserRouter>

          <Routes>

              {/* ==========================================
                  PUBLIC
              ========================================== */}

              <Route
                  path="/login"
                  element={<Login />}
              />


              {/* ==========================================
                  ADMIN AREA
              ========================================== */}

              <Route
                  element={
                      <ProtectedRoute
                          allowedRoles={["admin"]}
                      >
                          <AdminLayout />
                      </ProtectedRoute>
                  }
              >

                  {/* ======================================
                      ADMIN DASHBOARD
                  ====================================== */}

                  <Route
                      path="/dashboard"
                      element={<Dashboard />}
                  />


                  {/* ======================================
                      TEACHERS
                  ====================================== */}

                  <Route
                      path="/teachers"
                      element={<Teachers />}
                  />


                  {/* ======================================
                      CLASSES
                  ====================================== */}

                  <Route
                      path="/classes"
                      element={<Classes />}
                  />


                  {/* ======================================
                      STUDENTS
                  ====================================== */}

                  <Route
                      path="/students"
                      element={<Students />}
                  />


                  {/* ======================================
                      ADMIN ATTENDANCE
                      Mark / edit attendance for any class
                  ====================================== */}

                  <Route
                      path="/admin/attendance"
                      element={<Attendance />}
                  />


                  {/* ======================================
                      ADMIN REPORTS
                      View reports for all classes/teachers
                  ====================================== */}

                  <Route
                      path="/admin/reports"
                      element={<AdminReports />}
                  />

              </Route>


              {/* ==========================================
                  TEACHER AREA
              ========================================== */}

              <Route
                  element={
                      <ProtectedRoute
                          allowedRoles={["teacher"]}
                      >
                          <TeacherLayout />
                      </ProtectedRoute>
                  }
              >

                  {/* ======================================
                      TEACHER DASHBOARD
                  ====================================== */}

                  <Route
                      path="/teacher-dashboard"
                      element={
                          <div
                              style={{
                                  padding: "40px",
                              }}
                          >

                              <h1>
                                  Teacher Dashboard
                              </h1>

                              <p>
                                  Welcome to the teacher panel.
                              </p>

                          </div>
                      }
                  />


                  {/* ======================================
                      MY CLASS
                  ====================================== */}

                  <Route
                      path="/my-class"
                      element={<MyClass />}
                  />


                  {/* ======================================
                      TEACHER ATTENDANCE
                      Mark / edit assigned-class attendance
                  ====================================== */}

                  <Route
                      path="/attendance"
                      element={<Attendance />}
                  />


                  {/* ======================================
                      TEACHER REPORTS
                      Report for teacher's assigned class
                  ====================================== */}

                  <Route
                      path="/teacher-reports"
                      element={<Reports />}
                  />

              </Route>


              {/* ==========================================
                  DEFAULT
              ========================================== */}

              <Route
                  path="/"
                  element={
                      <Navigate
                          to="/login"
                          replace
                      />
                  }
              />


              {/* ==========================================
                  UNKNOWN ROUTES
              ========================================== */}

              <Route
                  path="*"
                  element={
                      <Navigate
                          to="/login"
                          replace
                      />
                  }
              />

          </Routes>

      </BrowserRouter>
  );
}

export default App;