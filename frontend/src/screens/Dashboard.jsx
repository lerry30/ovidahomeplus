import Loading from '@/components/Loading';
import AnimateNumber from '@/components/AnimateNumber';

import { getData } from '@/utils/send';
import { urls } from '@/constants/urls';
import { toNumber } from '@/utils/number';

import { useState, useLayoutEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';

import TitleFormat from '@/utils/titleFormat';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

const Dashboard = () => {
    const [itemsSoldToday, setItemsSoldToday] = useState(0);
    const [itemsSold, setItemsSold] = useState(0);
    const [items, setItems] = useState(0);
    const [suppliers, setSuppliers] = useState(0);
    const [productTypes, setProductTypes] = useState(0);

    const [monthlySalesThisYear, setMonthlySalesThisYear] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const [monthlyCustomers, setMonthlyCustomers] = useState(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const [popularProducts, setPopularProducts] = useState({});

    const [ loading, setLoading ] = useState(false);

    const monthlyData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Monthly Sales Comparison',
                data: monthlySalesThisYear,
                backgroundColor: '#36A2EB',
                hoverBackgroundColor: '#36A2EB'
            }
        ]
    };

    const customerGrowthData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Custormer Growth Over Months',
                data: monthlyCustomers,
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const productPopularityData = {
        labels: Object.keys(popularProducts),
        datasets: [
            {
                label: 'Product Popularity',
                data: Object.values(popularProducts),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }
        ]
    };

    const countDocuments = async () => {
        try {
            setLoading(true);
            const response = await getData(urls.dashboard);
            if(response) {
                const soldItemsToday = response?.soldItemsToday;
                const soldItems = response?.soldItems;
                const barcodes = response?.barcodes;
                const suppliers = response?.suppliers;
                const productTypes = response?.productTypes;
                const monthlySalesThisYear = response?.monthlySalesThisYear;
                const noOfCustomersThisYear = response?.noOfCustomersThisYear;
                const rankedSoldItems = response?.rankedSoldItems;

                const noOfBarcodes = toNumber(barcodes?.length);
                const noOfSoldItems = toNumber(soldItems?.length);
                const totalItems = noOfBarcodes - noOfSoldItems;

                setItemsSoldToday(soldItemsToday?.length ?? 0);
                setItemsSold(noOfSoldItems);
                setItems(totalItems);
                setSuppliers(suppliers?.length ?? 0);
                setProductTypes(productTypes?.length ?? 0);
                setMonthlySalesThisYear(monthlySalesThisYear?.map(item => item?.totalCollection));
                setMonthlyCustomers(noOfCustomersThisYear);

                const popularityList = {};
                for(const item of rankedSoldItems) {
                    const product = TitleFormat(`${item?.supplierName} ${item?.productTypeName}`);
                    popularityList[product] = item?.soldCount;
                }

                setPopularProducts(popularityList);
            }
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useLayoutEffect(() => {
        countDocuments()
    }, []);

    if(loading) {
        return (
            <Loading customStyle="w-full h-screen" />
        )
    }

    return (
        <main className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))]
            h-full bg-neutral-100 p-2 sm:p-4 pb-[30px] overflow-y-auto
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:rounded-lg
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-lg
            [&::-webkit-scrollbar-thumb]:bg-gray-300"
        >
            <section className="bg-neutral-100 min-h-screen">
                <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-4 pb-6 rounded-lg shadow-md flex flex-col items-center">
                        <h2 className="font-semibold text-lg mb-2">Total Sold Items Today</h2>
                        <AnimateNumber number={itemsSoldToday} size={40} />
                    </div>
                    <div className="bg-white p-4 pb-6 rounded-lg shadow-md flex flex-col items-center">
                        <h2 className="font-semibold text-lg mb-2">Total Sold Items</h2>
                        <AnimateNumber number={itemsSold} size={40} />
                    </div>
                    <div className="bg-white p-4 pb-6 rounded-lg shadow-md flex flex-col items-center">
                        <h2 className="font-semibold text-lg mb-2">Items</h2>
                        <AnimateNumber number={items} size={40} />
                    </div>
                    <div className="bg-white p-4 pb-6 rounded-lg shadow-md flex flex-col items-center">
                        <h2 className="font-semibold text-lg mb-2">Suppliers</h2>
                        <AnimateNumber number={suppliers} size={40} />
                    </div>
                    <div className="bg-white p-4 pb-6 rounded-lg shadow-md flex flex-col items-center">
                        <h2 className="font-semibold text-lg mb-2">Product Types</h2>
                        <AnimateNumber number={productTypes} size={40} />
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-4 rounded-lg shadow-md">
                        <h2 className="font-semibold text-lg mb-2">Monthly Sales Comparison</h2>
                        <Bar data={monthlyData} />
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-4 rounded-lg shadow-md">
                        <h2 className="font-semibold text-lg mb-2">Custormer Growth Over Months</h2>
                        <Line data={customerGrowthData} />
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-4 rounded-lg shadow-md">
                        <h2 className="font-semibold text-lg mb-2">Product Popularity</h2>
                        <Bar data={productPopularityData} />
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Dashboard;
