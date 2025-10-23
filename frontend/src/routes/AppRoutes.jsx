import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/AuthContext';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import ApplicationForm from '../components/ApplicationForm';
import AdminDashboard from '../components/AdminDashboard';

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
			<Route
				path="/"
				element={
					user ? (
						isAdmin ? <Navigate to="/admin" /> : <Navigate to="/home" />
					) : (
						<Landing />
					)
				}
			/>
			<Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
			<Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />

			{/* Authenticated User Routes */}
			<Route
				path="/home"
				element={user ? <Home /> : <Navigate to="/login" />}
			/>
			<Route
				path="/apply"
				element={user ? <ApplicationForm /> : <Navigate to="/login" />}
			/>

			{/* Admin Routes */}
			<Route
				path="/admin"
				element={
					user ? (
						isAdmin ? <AdminDashboard /> : <Navigate to="/home" />
					) : (
						<Navigate to="/login" />
					)
				}
			/>

			{/* Fallback */}
			<Route path="*" element={<Navigate to="/" />} />
		</Routes>
	);
}
