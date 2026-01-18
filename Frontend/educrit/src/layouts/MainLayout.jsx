import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
