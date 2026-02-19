import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Layouts */
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

/* Public pages */
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import ListYourItem from "./pages/ListYourItem";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/resetPassword";

/* Auth pages */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";

/* Item pages */
import AllItems from "./pages/items/AllItems";
import AddItem from "./pages/items/AddItem";
import ItemDetails from "./pages/items/ItemDetails";
import EditItem from "./pages/items/EditItem";
import MyListings from "./pages/items/MyListings";

/* Profile */
import Profile from "./pages/profile/Profile";

import History from "./pages/history/History";

/* Route protection */
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌍 PUBLIC + MAIN LAYOUT */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<AllItems />} />
          <Route path="/items/:id" element={<ItemDetails />} />
          <Route path="/list-your-item" element={<ListYourItem />} />

          {/* Legal Pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* 🔐 AUTH ROUTES (ONLY FOR LOGGED-OUT USERS) */}
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        {/* 🔒 PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/history" element={<History />} />
            <Route path="/items/:id/edit" element={<EditItem />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
