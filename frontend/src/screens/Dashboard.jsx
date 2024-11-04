
const Dashboard = () => {
    return (
        <div className="absolute top-0 
            left-admin-sidebar-sm lg:left-admin-sidebar-lg 
            w-[calc(100vw-var(--admin-sidebar-width-sm))] lg:w-[calc(100vw-var(--admin-sidebar-width-lg))] 
            min-h-screen bg-neutral-100 p-4"
        >
            <div className="w-full h-screen flex justify-center items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
        </div>
    );
}

export default Dashboard;