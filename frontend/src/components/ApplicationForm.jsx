import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ApplicationForm() {
	const { user } = useContext(AuthContext);
	const [userId, setUserId] = useState('');
	const [firstname, setFirstname] = useState('');
	const [middlename, setMiddlename] = useState('');
	const [lastname, setLastname] = useState('');
	const [dob, setDob] = useState('');
	const [phone, setPhone] = useState('');
	const [address, setAddress] = useState('');
	const [email, setEmail] = useState('');
	const [course, setCourse] = useState('');
	const [isScholarship, setIsScholarship] = useState(false);
	const [feeStatus, setFeeStatus] = useState('pending');
	const [receipt, setReceipt] = useState(null);
	const [meritDocument, setMeritDocument] = useState(null);

	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');

	// Pre-fill email and userId from logged-in user
	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const res = await fetch('http://localhost:3000/user/profile', {
					headers: {
						'Authorization': `Bearer ${user.token}`,
						'Content-Type': 'application/json',
					},
				});
				if (!res.ok) throw new Error('Failed to fetch user data');
				const data = await res.json();
				setEmail(data.email);
				setUserId(data.id);
			} catch (err) {
				console.error(err);
			}
		};
		fetchUserData();
	}, [user]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');

		try {
			const formData = new FormData();
			formData.append('user_id', userId);
			formData.append('firstname', firstname);
			formData.append('middlename', middlename);
			formData.append('lastname', lastname);
			formData.append('dob', dob);
			formData.append('phone', phone);
			formData.append('address', address);
			formData.append('email', email);
			formData.append('course', course);
			formData.append('is_scholarship', isScholarship);
			formData.append('fee_status', feeStatus);
			if (receipt) formData.append('receipt', receipt);
			if (meritDocument) formData.append('merit_document', meritDocument);

			const res = await fetch('http://localhost:3000/application/apply', {
				method: 'POST',
				headers: { 'Authorization': `Bearer ${user.token}` },
				body: formData,
			});

			const contentType = res.headers.get("content-type");
			let data;
			if (contentType && contentType.includes("application/json")) {
				data = await res.json();
			} else {
				const text = await res.text();
				throw new Error(text || "Server returned invalid response");
			}

			if (!res.ok) throw new Error(data?.message || 'Failed to submit');

			setSuccess('Application submitted successfully!');
			// Reset form
			setFirstname('');
			setMiddlename('');
			setLastname('');
			setDob('');
			setPhone('');
			setAddress('');
			setCourse('');
			setIsScholarship(false);
			setFeeStatus('pending');
			setReceipt(null);
			setMeritDocument(null);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto p-8 bg-white rounded shadow-lg">
			<h2 className="text-3xl font-bold text-center mb-8">Submit Your Application</h2>
			<form className="space-y-6" onSubmit={handleSubmit}>
				{/* User Info */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block font-medium mb-1">Email <span className="text-red-500">*</span></label>
						<input
							type="email"
							value={email}
							readOnly
							className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
						/>
					</div>
					<div>
						<label className="block font-medium mb-1">User ID</label>
						<input
							type="text"
							value={userId}
							readOnly
							className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
						/>
					</div>
				</div>

				{/* Name Fields */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block font-medium mb-1">First Name <span className="text-red-500">*</span></label>
						<input
							type="text"
							value={firstname}
							onChange={e => setFirstname(e.target.value)}
							className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
							required
						/>
					</div>
					<div>
						<label className="block font-medium mb-1">Middle Name</label>
						<input
							type="text"
							value={middlename}
							onChange={e => setMiddlename(e.target.value)}
							className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
					</div>
					<div>
						<label className="block font-medium mb-1">Last Name <span className="text-red-500">*</span></label>
						<input
							type="text"
							value={lastname}
							onChange={e => setLastname(e.target.value)}
							className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
							required
						/>
					</div>
				</div>

				{/* DOB and Phone */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block font-medium mb-1">Date of Birth <span className="text-red-500">*</span></label>
						<input
							type="date"
							value={dob}
							onChange={e => setDob(e.target.value)}
							className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
							required
						/>
					</div>
					<div>
						<label className="block font-medium mb-1">Phone <span className="text-red-500">*</span></label>
						<input
							type="text"
							value={phone}
							onChange={e => setPhone(e.target.value)}
							className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
							required
						/>
					</div>
				</div>

				{/* Address */}
				<div>
					<label className="block font-medium mb-1">Address <span className="text-red-500">*</span></label>
					<textarea
						value={address}
						onChange={e => setAddress(e.target.value)}
						className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
						required
					/>
				</div>

				{/* Course & Scholarship */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block font-medium mb-1">Course <span className="text-red-500">*</span></label>
						<input
							type="text"
							value={course}
							onChange={e => setCourse(e.target.value)}
							className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
							required
						/>
					</div>
					<div className="flex items-center mt-6 gap-2">
						<input
							type="checkbox"
							checked={isScholarship}
							onChange={e => setIsScholarship(e.target.checked)}
							id="scholarship"
							className="w-4 h-4"
						/>
						<label htmlFor="scholarship" className="font-medium">Scholarship</label>
					</div>
				</div>

				{/* Fee Status */}
				<div>
					<label className="block font-medium mb-1">Fee Status</label>
					<select
						value={feeStatus}
						onChange={e => setFeeStatus(e.target.value)}
						className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
					>
						<option value="paid">Paid</option>
						<option value="pending">Pending</option>
						<option value="scholarship">Scholarship</option>
					</select>
				</div>

				{/* File Uploads */}
				<div>
					<label className="block font-medium mb-1">Upload Fee Receipt <span className="text-red-500">*</span></label>
					<input
						type="file"
						onChange={e => setReceipt(e.target.files[0])}
						accept=".pdf,.jpg,.png"
						className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
						required
					/>
				</div>
				<div>
					<label className="block font-medium mb-1">Upload Merit Document <span className="text-red-500">*</span></label>
					<input
						type="file"
						onChange={e => setMeritDocument(e.target.files[0])}
						accept=".pdf,.jpg,.png"
						className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
						required
					/>
				</div>

				{/* Submit */}
				<button
					type="submit"
					disabled={loading}
					className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50"
				>
					{loading ? 'Submitting...' : 'Submit Application'}
				</button>

				{/* Messages */}
				{success && <p className="text-green-600 mt-4 font-medium">{success}</p>}
				{error && <p className="text-red-600 mt-4 font-medium">{error}</p>}
			</form>
		</div>
	);
}
