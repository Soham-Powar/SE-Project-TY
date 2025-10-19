import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const { login } = useContext(AuthContext);
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const res = await fetch('http://localhost:3000/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Login failed');

			login(data.token);
			navigate('/');
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md p-8 bg-white rounded shadow">
			<h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
			<form className="flex flex-col gap-4" onSubmit={handleLogin}>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
					required
				/>
				<button
					type="submit"
					disabled={loading}
					className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
				>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</form>
			{error && <p className="text-red-500 mt-2">{error}</p>}
		</div>
	);
}
