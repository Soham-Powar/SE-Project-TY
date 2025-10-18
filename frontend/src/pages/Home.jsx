import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

function Home() {
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
				console.log(res);

				if (!res.ok) {
					throw new Error('Failed to fetch user data');
				}

				const data = await res.json();
				setEmail(data.email); // Assuming backend returns { email: "...", ... }
			} catch (err) {
				setError(err.message);
			}
		};

		fetchUserData();
	}, [user]);

	return (
		<div>
			<h1>Welcome! You are logged in.</h1>
			{email && <p>Your email: {email}</p>}
			{error && <p style={{ color: 'red' }}>{error}</p>}
			<button onClick={logout}>Logout</button>
		</div>
	);
}

export default Home;
