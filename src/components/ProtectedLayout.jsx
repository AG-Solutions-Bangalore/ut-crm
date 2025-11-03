// import { useSelector } from "react-redux";
// import { Navigate } from "react-router-dom";
// import Layout from "./Layout";

// const ProtectedLayout = ({ children }) => {
//   const token = useSelector((state) => state.auth.token);

//   if (!token) {
//     return <Navigate to="/" />;
//   }

//   return <Layout>{children}</Layout>;
// };

// export default ProtectedLayout;
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Layout from "./Layout";

const ProtectedLayout = () => {
  const token = useSelector((state) => state.auth.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedLayout;
