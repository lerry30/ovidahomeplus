import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';
import { zUser } from './store/user';

import SidebarRoute from '@/routes/SidebarRoute';
import SignUp from '@/screens/SignUp';
import SignIn from '@/screens/SignIn';
import NewItem from '@/screens/NewItem';
import NewSupplier from '@/screens/NewSupplier';
import UpdateSupplier from '@/screens/UpdateSupplier';
import NotFound from '@/screens/NotFound';
import Loading from '@/components/Loading';

const App = () => {
	const [loading, setLoading] = useState(false);

	const pathname = useLocation()?.pathname;
	const navigate = useNavigate();

	useLayoutEffect(() => {
		const segments = pathname?.trim()?.replace(/^\//, '')?.split('/');
		const fSegment = segments?.length > 0 ? segments[0]?.toLowerCase() : '';
		
		if(fSegment === 'admin') {
			(async () => {
				setLoading(true);
				try {	
					await zUser.getState()?.saveUserData();
				} catch(error) {
					console.log('Error 29884714398', error);
					navigate('/signin');
					//location.reload();
				} finally {
					setLoading(false);
				}
			})();
		}
	}, [pathname, navigate]);

	if(loading) {
		return (
			<Loading customStyle="w-full h-screen" />
		)
	}

	return (
		<Routes>
			<Route path="/signup" element={<SignUp />} />
			<Route path="/signin" element={<SignIn />} />
			<Route path="/admin/new-supplier" element={<NewSupplier />} />
			<Route path="/admin/update-supplier" element={<UpdateSupplier />} />
			<Route path="/admin/new-item" element={<NewItem />} />
			<Route path="/admin/*" element={<SidebarRoute />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default App;