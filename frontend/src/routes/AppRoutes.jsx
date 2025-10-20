import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import ApplicationForm from '../components/ApplicationForm';
import AdminDashboard from '../components/AdminDashboard';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from "jwt-decode";


export default function AppRoutes() {
	const { user } = useContext(AuthContext);
	let isAdmin = false;

	if (user?.token) {
		try {
			const decoded = jwtDecode(user.token);
			isAdmin = decoded.email === 'admin@unimis.com';
		} catch {
			isAdmin = false;
		}
	}

	return (
		<Routes>
			{/* Public Routes */}
			<Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
			<Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />

			{/* Authenticated Routes */}
			<Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
			<Route path="/apply" element={user ? <ApplicationForm /> : <Navigate to="/login" />} />

			{/* Admin Route */}
			<Route
				path="/admin"
				element={
					user ? (
						isAdmin ? <AdminDashboard /> : <Navigate to="/" />
					) : (
						<Navigate to="/login" />
					)
				}
			/>

			{/* Default fallback */}
			<Route path="*" element={<Navigate to="/" />} />
		</Routes>
	);
}
