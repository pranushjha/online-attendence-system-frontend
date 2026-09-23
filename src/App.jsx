import { lazy, Suspense } from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";






import ProtectedRoute from "./components/ProtectedRoute";

import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";

const Login = lazy(() => import("./pages/Login/Login"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail/VerifyEmail"));
const SetPassword = lazy(() => import("./pages/SetPassword/SetPassword"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword/ResetPassword"));

const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Teachers = lazy(() => import("./pages/Teachers/Teachers"));
const Classes = lazy(() => import("./pages/Classes/Classes"));
const Students = lazy(() => import("./pages/Students/Students"));
const Attendance = lazy(() => import("./pages/Attendance/Attendance"));

const Reports = lazy(() => import("./pages/Reports/Reports"));
const AdminReports = lazy(() => import("./pages/Reports/AdminReports"));

const MyClass = lazy(() => import("./pages/MyClass/MyClass"));

const PageLoader = () => (
  <div style={{ padding: "40px" }}>
    Loading...
  </div>
);



// ==========================================
// APP
// ==========================================

function App() {

  return (
      <BrowserRouter>

          <Suspense fallback={<PageLoader />}>
          <Routes>

              {/* ==========================================
                  PUBLIC
              ========================================== */}

              <Route
                  path="/login"
                  element={<Login />}
              />

              <Route
                  path="/verify-email"
                  element={<VerifyEmail />}
              />

              <Route
                  path="/set-password"
                  element={<SetPassword />}
              />

              <Route
                  path="/forgot-password"
                  element={<ForgotPassword />}
              />

              <Route
                  path="/reset-password"
                  element={<ResetPassword />}
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
          </Suspense>

      </BrowserRouter>
  );
}

export default App;


