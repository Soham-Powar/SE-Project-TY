import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
	const { user, logout } = useContext(AuthContext);
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const token = user?.token;
				if (!token) throw new Error('No token found');

				const res = await fetch('http://localhost:3000/user/profile', {
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				});

				if (!res.ok) throw new Error('Failed to fetch user data');

				const data = await res.json();
				setEmail(data.email);
			} catch (err) {
				setError(err.message);
			}
		};

		fetchUserData();
	}, [user]);

	return (
		<div className="w-full max-w-md p-8 bg-white rounded shadow text-center">
			<h1 className="text-2xl font-bold mb-4">Welcome!</h1>
			{email && <p className="mb-2">Your email: <span className="font-medium">{email}</span></p>}
			{error && <p className="text-red-500 mb-2">{error}</p>}
			<button
				onClick={logout}
				className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mt-4"
			>
				Logout
			</button>
		</div>
	);
}
