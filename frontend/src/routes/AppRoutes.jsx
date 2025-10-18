import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<Signup />} />
			<Route path="/" element={
				<ProtectedRoute>
					<Home />
				</ProtectedRoute>
			} />
		</Routes>
	);
}

export default AppRoutes;
