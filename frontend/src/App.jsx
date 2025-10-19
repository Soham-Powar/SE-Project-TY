import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

function App() {
	return (
		<AuthProvider>
			<Router>
				<div className="min-h-screen bg-gray-100 flex items-center justify-center">
					<AppRoutes />
				</div>
			</Router>
		</AuthProvider>
	);
}

export default App;
