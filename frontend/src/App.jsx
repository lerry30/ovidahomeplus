import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import { zUser } from './store/user';

import SidebarRoute from '@/routes/SidebarRoute';
import SignUp from '@/screens/SignUp';
import SignIn from '@/screens/SignIn';
import NewItem from '@/screens/NewItem';
import NewSupplier from '@/screens/NewSupplier';
import NotFound from '@/screens/NotFound';

const App = () => {
	const pathname = useLocation()?.pathname;
	const navigate = useNavigate();

	useLayoutEffect(() => {
		const segments = pathname?.trim()?.replace(/^\//, '')?.split('/');
		const fSegment = segments?.length > 0 ? segments[0]?.toLowerCase() : '';

		if(fSegment === 'admin' && !zUser.getState()?.username) {
			navigate('/signin');
			location.reload();
		}
	}, [pathname, navigate]);

	return (
		<Routes>
			<Route path="/signup" element={<SignUp />} />
			<Route path="/signin" element={<SignIn />} />
			<Route path="/admin/new-supplier" element={<NewSupplier />} />
			<Route path="/admin/new-item" element={<NewItem />} />
			<Route path="/admin/*" element={<SidebarRoute />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default App;