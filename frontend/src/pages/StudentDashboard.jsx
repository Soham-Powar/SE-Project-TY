import { useEffect, useState } from "react";

export default function StudentDashboard() {
	const [student, setStudent] = useState(null);
	const [subjects, setSubjects] = useState([]);
	const [error, setError] = useState("");
	const token = localStorage.getItem("mis_token");

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await fetch("http://localhost:3000/mis/student/profile", {
					headers: { Authorization: `Bearer ${token}` },
				});

				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to fetch profile");

				setStudent(data.student);
				setSubjects(data.subjects || []);
			} catch (err) {
				setError(err.message);
			}
		};
		fetchProfile();
	}, [token]);

	if (error) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<p className="text-red-600 text-lg font-medium">{error}</p>
			</div>
		);
	}

	if (!student) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<p className="text-gray-600 text-lg">Loading your dashboard...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-10 px-4">
			<div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
				<h1 className="text-3xl font-bold text-purple-700 text-center mb-6">
					Welcome, {student.firstname}!
				</h1>

				{/* ===== Student Info ===== */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					<div className="space-y-2">
						<p><span className="font-semibold">MIS ID:</span> {student.mis_id}</p>
						<p><span className="font-semibold">Email:</span> {student.email}</p>
						<p><span className="font-semibold">Phone:</span> {student.phone}</p>
						<p><span className="font-semibold">Address:</span> {student.address}</p>
					</div>

					<div className="space-y-2">
						<p><span className="font-semibold">Course:</span> {student.course_name}</p>
						<p><span className="font-semibold">Fee Status:</span>
							<span className={`ml-2 px-2 py-1 rounded text-sm ${student.fee_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
								{student.fee_status}
							</span>
						</p>
						<p><span className="font-semibold">Scholarship:</span> {student.is_scholarship ? "Yes" : "No"}</p>
						<p><span className="font-semibold">Payment Amount:</span> ₹{student.payment_amount / 100 || 0}</p>
					</div>
				</div>

				{/* ===== Subjects Section ===== */}
				<div className="mb-8">
					<h2 className="text-2xl font-semibold text-purple-700 mb-4">Subjects</h2>
					{subjects.length > 0 ? (
						<ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
							{subjects.map((subj, idx) => (
								<li
									key={idx}
									className="border border-purple-200 rounded-lg px-4 py-3 bg-purple-50 hover:bg-purple-100 transition"
								>
									{subj}
								</li>
							))}
						</ul>
					) : (
						<p className="text-gray-500">No subjects assigned yet.</p>
					)}
				</div>

				{/* ===== Documents Section ===== */}
				<div>
					<h2 className="text-2xl font-semibold text-purple-700 mb-4">Documents</h2>
					<div className="flex flex-col gap-2">
						<a
							href={`http://localhost:3000/${student.receipt_path}`}
							target="_blank"
							rel="noreferrer"
							className="text-blue-600 hover:underline"
						>
							View Fee Receipt
						</a>
						<a
							href={`http://localhost:3000/${student.merit_document}`}
							target="_blank"
							rel="noreferrer"
							className="text-blue-600 hover:underline"
						>
							View Merit Document
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
