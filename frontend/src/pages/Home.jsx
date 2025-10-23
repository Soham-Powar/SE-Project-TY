import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Home() {
	const { user, logout } = useContext(AuthContext);
	const [email, setEmail] = useState("");
	const [id, setId] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	// Check if current user is admin
	const isAdmin = (() => {
		try {
			const decoded = jwtDecode(user?.token);
			return decoded.email === "admin@unimis.com";
		} catch {
			return false;
		}
	})();

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const token = user?.token;
				if (!token) throw new Error("No token found");

				const res = await fetch("http://localhost:3000/user/profile", {
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				});

				if (!res.ok) throw new Error("Failed to fetch user data");

				const data = await res.json();
				setId(data.id);
				setEmail(data.email);
			} catch (err) {
				setError(err.message);
			}
		};

		fetchUserData();
	}, [user]);

	return (
		// <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-b from-purple-50 to-white px-4">
		<div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
			<h1 className="text-3xl font-bold text-purple-700 mb-4">Welcome!</h1>

			{email && (
				<p className="mb-2 text-gray-700">
					<span className="font-medium">Email:</span> {email}
				</p>
			)}
			{id && (
				<p className="mb-4 text-gray-700">
					<span className="font-medium">User ID:</span> {id}
				</p>
			)}
			{error && <p className="text-red-500 mb-4">{error}</p>}

			{!isAdmin ? (
				<button
					onClick={() => navigate("/apply")}
					className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition font-medium"
				>
					Go to Application Form
				</button>
			) : (
				<button
					onClick={() => navigate("/admin")}
					className="bg-purple-700 text-white py-2 px-6 rounded-lg hover:bg-purple-800 transition font-medium"
				>
					Go to Admin Dashboard
				</button>
			)}

			<button
				onClick={logout}
				className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg mt-4 transition font-medium"
			>
				Logout
			</button>
		</div>
		// </div>
	);
}
