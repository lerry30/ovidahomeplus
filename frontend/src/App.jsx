import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';

import { zCashierSelectedItem } from '@/store/cashierSelectedItem';
import { zCustomerInfo } from '@/store/customerInfo';
import { zExpense } from '@/store/expense';
import { zItem } from '@/store/item';
import { zPayment } from '@/store/payment';
import { zProductType } from '@/store/productType';
import { zSupplier } from '@/store/supplier';
import { zUser } from '@/store/user';

import * as localStorageNames from '@/constants/localStorageNames';

import SidebarRoute from '@/routes/SidebarRoute';
import SignUp from '@/screens/SignUp';
import SignIn from '@/screens/SignIn';
import NewItem from '@/screens/NewItem';
import NewSupplier from '@/screens/NewSupplier';
import UpdateSupplier from '@/screens/UpdateSupplier';
import NewProductType from '@/screens/NewProductType';
import UpdateProductType from '@/screens/UpdateProductType';
import UpdateItem from '@/screens/UpdateItem';
import SelectItem from '@/screens/SelectItem';
import NewBatch from '@/screens/NewBatch';
import UpdateBatch from '@/screens/UpdateBatch';
import NewBarcode from '@/screens/NewBarcode';
import CustomerInfo from '@/screens/CustomerInfo';
import Payment from '@/screens/Payment';
import Checkout from '@/screens/Checkout';
import NewExpense from '@/screens/NewExpense';
import UpdateExpense from '@/screens/UpdateExpense';
import UpdateCashDrawer from '@/screens/UpdateCashDrawer';
import CameraScanner from '@/screens/CameraScanner';
import Landing from '@/screens/Landing';
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

                    zCashierSelectedItem.getState().wipeOutData();
                    zCustomerInfo.getState().wipeOutData();
                    zExpense.getState().wipeOutData();
                    zItem.getState().wipeOutData();
                    zPayment.getState().wipeOutData();
                    zProductType.getState().wipeOutData();
                    zSupplier.getState().wipeOutData();
                    zUser.getState().wipeOutData();

                    for(const key in localStorageNames) {
                        const storageName = localStorageNames[key];
                        localStorage.removeItem(storageName);
                    }

					navigate('/signin');
					//location.reload();
				} finally {
					setLoading(false);
				}
			})();
		}
	}, [pathname, navigate]);

    useLayoutEffect(() => {
        //console.log('');
        //console.log(' ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓███████▓▒░ ░▒▓██████▓▒░');
        //console.log('░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░');
        //console.log('░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░');
        //console.log('░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░');
        //console.log('░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▓█▓▒░ ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░');
        //console.log('░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▓█▓▒░ ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░');
        //console.log(' ░▒▓██████▓▒░   ░▒▓██▓▒░  ░▒▓█▓▒░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░');
        //console.log('');
    }, []);

	if(loading) {
		return (
			<Loading customStyle="w-full h-screen" />
		)
	}

	return (
		<Routes>
			<Route path="/signin" element={<SignIn />} />
			<Route path="/signup" element={<SignUp />} />
			<Route path="/admin/new-supplier" element={<NewSupplier />} />
			<Route path="/admin/update-supplier" element={<UpdateSupplier />} />
			<Route path="/admin/new-item" element={<NewItem />} />
			<Route path="/admin/new-product-type" element={<NewProductType />} />
			<Route path="/admin/new-batch" element={<NewBatch />} />
			<Route path="/admin/update-product-type" element={<UpdateProductType />} />
			<Route path="/admin/update-item" element={<UpdateItem />} />
			<Route path="/admin/update-batch/:batch" element={<UpdateBatch/>} />
			<Route path="/admin/select-item" element={<SelectItem />} />
			<Route path="/admin/new-barcode" element={<NewBarcode />} />
			<Route path="/admin/customer-info" element={<CustomerInfo />} />
			<Route path="/admin/payment" element={<Payment />} />
			<Route path="/admin/checkout" element={<Checkout />} />
			<Route path="/admin/new-expense" element={<NewExpense />} />
			<Route path="/admin/update-expense" element={<UpdateExpense />} />
            <Route path="/admin/update-cash-drawer" element={<UpdateCashDrawer />} />
            <Route path="/admin/camera-scanner" element={<CameraScanner />} />
			<Route path="/admin/*" element={<SidebarRoute />} />
			<Route path="/" element={<Landing />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default App;
