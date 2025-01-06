import { useNavigate } from 'react-router-dom';
import { useLayoutEffect } from 'react';

//import OvidaHomePlus from '@/ovida-front.jpg';
import OvidaHomePlusLogo from '@/ovida-logo.jpg';

const Landing = () => {
    const navigate = useNavigate();

    useLayoutEffect(() => {
        navigate('/admin');
        navigate(0);
    }, []);

    return (
        <div className="relative w-full h-screen flex justify-center items-center">
            {/*<img 
                src={OvidaHomePlus} 
                alt="Ovida Home Plus" 
                className="absolute w-full h-screen object-cover rounded-xl p-2"
            />*/}
            <div className="absolute w-full h-full flex justify-center items-center flex-col gap-2">
                <img 
                    src={OvidaHomePlusLogo} 
                    alt="Ovida Home Plus Logo"
                    className="w-[300px]"
                />
                <button 
                    onClick={() => navigate('/admin')} 
                    className="px-4 py-2 rounded-lg text-sm text-white bg-green-700">
                    Get Started
                </button>
            </div>
        </div>
    )
}

export default Landing;
