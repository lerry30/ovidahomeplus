import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-screen flex justify-center items-center flex-col gap-4">
            <h1 className="font-bold text-neutral-400">Page Not Found</h1>
            <button onClick={() => navigate('/admin')} className="px-4 py-2 rounded-lg text-sm text-white bg-green-700">Go back to home</button>
        </div>
    );
}

export default NotFound;