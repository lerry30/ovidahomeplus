import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-screen flex justify-center items-center">
            <button 
                onClick={() => navigate('/admin')} 
                className="px-4 py-2 rounded-lg text-sm text-white bg-green-700">
                Get Started
            </button>
        </div>
    )
}

export default Landing;
