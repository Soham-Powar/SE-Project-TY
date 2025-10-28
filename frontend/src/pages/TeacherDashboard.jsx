import { useEffect, useState } from "react";

export default function TeacherDashboard() {
	const [teacher, setTeacher] = useState(null);
	const [subjects, setSubjects] = useState([]);
	const [students, setStudents] = useState([]);
	const [selectedSubject, setSelectedSubject] = useState(null);
	const [error, setError] = useState("");
	const token = localStorage.getItem("mis_token");

	// --- Fetch Teacher Profile ---
	useEffect(() => {
		const fetchTeacher = async () => {
			try {
				const res = await fetch("http://localhost:3000/mis/teacher/profile", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error);
				setTeacher(data.teacher);
			} catch (err) {
				setError(err.message);
			}
		};
		fetchTeacher();
	}, [token]);

	// --- Load Subjects ---
	const loadSubjects = async () => {
		try {
			const res = await fetch("http://localhost:3000/mis/teacher/subjects", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			setSubjects(data.subjects);
			setStudents([]);
			setSelectedSubject(null);
		} catch (err) {
			alert(err.message);
		}
	};

	// --- Load Students for a Subject ---
	const viewStudents = async (subjectId) => {
		try {
			const res = await fetch(
				`http://localhost:3000/mis/teacher/subject/${subjectId}/students`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			setStudents(data.students);
			setSelectedSubject(subjectId);
		} catch (err) {
			alert(err.message);
		}
	};

	// --- Mark Attendance ---
	const markAttendance = async (mis_id, status) => {
		try {
			await fetch(
				`http://localhost:3000/mis/teacher/subject/${selectedSubject}/attendance`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ mis_id, status }),
				}
			);
			await viewStudents(selectedSubject); // Refresh
		} catch (err) {
			alert("Failed to mark attendance" + err);
		}
	};

	// --- Update Marks ---
	const updateMarks = async (mis_id, type, marks) => {
		try {
			await fetch(
				`http://localhost:3000/mis/teacher/subject/${selectedSubject}/marks`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ mis_id, type, marks: Number(marks) }),
				}
			);
			await viewStudents(selectedSubject);
		} catch (err) {
			alert("Failed to update marks" + err);
		}
	};

	if (error)
		return (
			<div className="flex justify-center items-center min-h-screen">
				<p className="text-red-600 text-lg font-medium">{error}</p>
			</div>
		);

	if (!teacher)
		return (
			<div className="flex justify-center items-center min-h-screen">
				<p className="text-gray-600 text-lg">Loading teacher dashboard...</p>
			</div>
		);

	return (
		<div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-10 px-4">
			<div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
				<h1 className="text-3xl font-bold text-indigo-700 text-center mb-6">
					Welcome, {teacher.full_name} 👩‍🏫
				</h1>

				<p className="text-center text-gray-600 mb-6">
					Manage attendance and marks for your subjects.
				</p>

				{/* Load Subjects */}
				<div className="mb-6 text-center">
					<button
						onClick={loadSubjects}
						className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
					>
						Load My Subjects
					</button>
				</div>

				{/* Subjects List */}
				{subjects.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
						{subjects.map((subj) => (
							<div
								key={subj.subject_id}
								onClick={() => viewStudents(subj.subject_id)}
								className={`cursor-pointer border p-4 rounded-lg transition ${selectedSubject === subj.subject_id
									? "bg-indigo-100 border-indigo-500"
									: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
									}`}
							>
								<h3 className="text-lg font-semibold text-indigo-700">
									{subj.subject_name}
								</h3>
								<p className="text-sm text-gray-600">{subj.course_name}</p>
							</div>
						))}
					</div>
				)}

				{/* Enrolled Students Table */}
				{students.length > 0 && (
					<div>
						<h2 className="text-2xl font-semibold text-indigo-700 mb-4">
							Students Enrolled
						</h2>
						<table className="w-full border border-gray-200 rounded-lg overflow-hidden">
							<thead className="bg-indigo-100">
								<tr>
									<th className="p-2 text-left">MIS ID</th>
									<th className="p-2 text-left">Name</th>
									<th className="p-2 text-left">Attendance</th>
									<th className="p-2 text-left">Midsem (30)</th>
									<th className="p-2 text-left">Endsem (50)</th>
									<th className="p-2 text-left">Internal (20)</th>
								</tr>
							</thead>
							<tbody>
								{students.map((stu, idx) => (
									<tr key={idx} className="border-t hover:bg-gray-50">
										<td className="p-2">{stu.mis_id}</td>
										<td className="p-2">
											{stu.firstname} {stu.lastname}
										</td>
										<td className="p-2 flex gap-2">
											<button
												onClick={() => markAttendance(stu.mis_id, "present")}
												className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
											>
												Present
											</button>
											<button
												onClick={() => markAttendance(stu.mis_id, "absent")}
												className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
											>
												Absent
											</button>
											<p className="text-sm text-gray-600">
												{stu.lectures_attended}/{stu.total_lectures}
											</p>
										</td>
										<td className="p-2">
											<input
												type="number"
												className="w-16 border rounded px-1"
												defaultValue={stu.midsem_marks}
												onBlur={(e) =>
													updateMarks(stu.mis_id, "midsem", e.target.value)
												}
											/>
										</td>
										<td className="p-2">
											<input
												type="number"
												className="w-16 border rounded px-1"
												defaultValue={stu.endsem_marks}
												onBlur={(e) =>
													updateMarks(stu.mis_id, "endsem", e.target.value)
												}
											/>
										</td>
										<td className="p-2">
											<input
												type="number"
												className="w-16 border rounded px-1"
												defaultValue={stu.internal_marks}
												onBlur={(e) =>
													updateMarks(stu.mis_id, "internal", e.target.value)
												}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
