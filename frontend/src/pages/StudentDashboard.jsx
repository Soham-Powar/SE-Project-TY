import { useEffect, useState } from "react";

export default function StudentDashboard() {
	const [student, setStudent] = useState(null);
	const [subjects, setSubjects] = useState([]);
	const [selected, setSelected] = useState([]);
	const [enrolledSubjects, setEnrolledSubjects] = useState([]);
	const [error, setError] = useState("");
	const [modalSubject, setModalSubject] = useState(null);
	const token = localStorage.getItem("mis_token");

	// --- Fetch Profile + Existing Enrollments ---
	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await fetch("http://localhost:3000/mis/student/profile", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
				setStudent(data.student);

				// Fetch already enrolled subjects (with attendance + marks)
				const enrollRes = await fetch("http://localhost:3000/mis/student/enrollments", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const enrollData = await enrollRes.json();
				if (enrollRes.ok) setEnrolledSubjects(enrollData.enrolledSubjects);
			} catch (err) {
				setError(err.message);
			}
		};
		fetchProfile();
	}, [token]);

	// --- Load Subjects for Selection ---
	const loadSubjects = async () => {
		try {
			const res = await fetch("http://localhost:3000/mis/student/subjects", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			setSubjects(data.subjects);
			setSelected(data.enrolled);
		} catch (err) {
			alert(err.message);
		}
	};

	// --- Save Selected Subjects ---
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (selected.length !== 5) {
			alert("Please select exactly 5 subjects!");
			return;
		}

		try {
			const res = await fetch("http://localhost:3000/mis/student/subjects", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ selectedSubjects: selected }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			alert(data.message);
			window.location.reload();
		} catch (err) {
			alert(err.message);
		}
	};

	if (error)
		return (
			<div className="flex justify-center items-center min-h-screen">
				<p className="text-red-600 text-lg font-medium">{error}</p>
			</div>
		);

	if (!student)
		return (
			<div className="flex justify-center items-center min-h-screen">
				<p className="text-gray-600 text-lg">Loading your dashboard...</p>
			</div>
		);

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
						<p>
							<span className="font-semibold">Fee Status:</span>
							<span
								className={`ml-2 px-2 py-1 rounded text-sm ${student.fee_status === "paid"
									? "bg-green-100 text-green-700"
									: "bg-yellow-100 text-yellow-700"
									}`}
							>
								{student.fee_status}
							</span>
						</p>
						<p><span className="font-semibold">Scholarship:</span> {student.is_scholarship ? "Yes" : "No"}</p>
						<p><span className="font-semibold">Payment Amount:</span> ₹{student.payment_amount / 100 || 0}</p>
					</div>
				</div>

				{/* ===== Subject Enrollment Section ===== */}
				<div className="mt-8">
					<h2 className="text-2xl font-semibold text-purple-700 mb-4">
						Subject Selection (Semester 1)
					</h2>

					{enrolledSubjects.length > 0 ? (
						<>
							<p className="text-green-700 font-medium mb-3">
								You have already registered the following subjects:
							</p>
							<ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
								{enrolledSubjects.map((sub, i) => (
									<li
										key={i}
										onClick={() => setModalSubject(sub)}
										className="cursor-pointer border border-purple-200 bg-purple-50 px-4 py-2 rounded shadow-sm hover:bg-purple-100 transition"
									>
										{sub.subject_name}
									</li>
								))}
							</ul>
						</>
					) : (
						<>
							<p className="text-gray-600 mb-3">
								Select <span className="font-semibold text-purple-700">any 5</span> subjects for this semester.
							</p>
							<button
								onClick={loadSubjects}
								className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mb-4"
							>
								Load Available Subjects
							</button>

							{subjects.length > 0 && (
								<form onSubmit={handleSubmit}>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
										{subjects.map((subject) => (
											<label
												key={subject.subject_id}
												className="flex items-center gap-2 bg-purple-50 p-3 rounded border border-purple-200"
											>
												<input
													type="checkbox"
													checked={selected.includes(subject.subject_id)}
													onChange={(e) => {
														if (e.target.checked) {
															setSelected((prev) => [...prev, subject.subject_id]);
														} else {
															setSelected((prev) =>
																prev.filter((id) => id !== subject.subject_id)
															);
														}
													}}
												/>
												{subject.subject_name}
											</label>
										))}
									</div>

									<button
										type="submit"
										className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
									>
										Submit Subjects
									</button>
								</form>
							)}
						</>
					)}
				</div>

				{/* ===== Documents Section ===== */}
				<div className="mt-10">
					<h2 className="text-2xl font-semibold text-purple-700 mb-4">
						Documents
					</h2>
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

			{/* ===== Modal for Subject Details ===== */}
			{modalSubject && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
					<div className="bg-white rounded-xl shadow-lg p-6 w-96 relative">
						<h3 className="text-xl font-semibold text-purple-700 mb-4">
							{modalSubject.subject_name}
						</h3>

						<p className="text-gray-700 mb-2">
							<span className="font-medium">Instructor:</span>{" "}
							{modalSubject.instructor_name || "—"}
						</p>

						{/* Attendance */}
						<p className="text-gray-700 mb-2">
							<span className="font-medium">Attendance:</span>{" "}
							{modalSubject.total_lectures > 0 ? (
								<>
									{modalSubject.lectures_attended}/{modalSubject.total_lectures} (
									{(
										(modalSubject.lectures_attended /
											modalSubject.total_lectures) *
										100
									).toFixed(1)}
									%)
								</>
							) : (
								"Not available"
							)}
						</p>

						{/* Marks */}
						<p className="text-gray-700 mb-2">
							<span className="font-medium">Marks:</span>{" "}
							{Number(modalSubject.midsem_marks ?? 0).toFixed(2)}/30 +{" "}
							{Number(modalSubject.endsem_marks ?? 0).toFixed(2)}/50 +{" "}
							{Number(modalSubject.internal_marks ?? 0).toFixed(2)}/20 ={" "}
							<b>
								{(
									(Number(modalSubject.midsem_marks ?? 0)) +
									(Number(modalSubject.endsem_marks ?? 0)) +
									(Number(modalSubject.internal_marks ?? 0))
								).toFixed(2)}{" "}
								/ 100
							</b>
						</p>

						<button
							onClick={() => setModalSubject(null)}
							className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-lg"
						>
							×
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
