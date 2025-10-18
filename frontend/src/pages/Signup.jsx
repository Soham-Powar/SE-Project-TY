import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleSignup = async (e) => {
		e.preventDefault();
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
		<div>
			<h2>Signup</h2>
			<form onSubmit={handleSignup}>
				<input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
				<input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
				<input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
				<button type="submit">Signup</button>
			</form>
			{error && <p style={{ color: 'red' }}>{error}</p>}
		</div>
	);
}

export default Signup;
