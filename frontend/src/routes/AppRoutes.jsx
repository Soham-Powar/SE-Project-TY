import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AppRoutes() {
	const { user } = useContext(AuthContext);

	return (
		<Routes>
			<Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
			<Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
			<Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
		</Routes>
	);
}
