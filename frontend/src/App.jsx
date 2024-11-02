import { Routes, Route } from 'react-router-dom';
import SidebarRoute from '@/routes/SidebarRoute';
import NewItem from '@/screens/NewItem';
import NotFound from '@/screens/NotFound';

const App = () => {
	return (
		<Routes>
			<Route path="/admin/new-item" element={<NewItem />} />
			<Route path="/admin/*" element={<SidebarRoute />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default App;