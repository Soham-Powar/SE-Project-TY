import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleSignup = async (e) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		try {
			const res = await fetch('http://localhost:3000/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, confirmPassword }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Signup failed');

			navigate('/login');
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="w-full max-w-md p-8 bg-white rounded shadow">
			<h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>
			<form className="flex flex-col gap-4" onSubmit={handleSignup}>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
					required
				/>
				<input
					type="password"
					placeholder="Confirm Password"
					value={confirmPassword}
					onChange={e => setConfirmPassword(e.target.value)}
					className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
					required
				/>
				<button
					type="submit"
					className="bg-green-500 text-white py-2 rounded hover:bg-green-600"
				>
					Signup
				</button>
			</form>
			{error && <p className="text-red-500 mt-2">{error}</p>}
		</div>
	);
}
