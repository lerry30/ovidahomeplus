import Logo from '@/ovida-logo.jpg';
import { Link } from 'react-router-dom';

const AppLogo = ({segment=''}) => {
    return (
        <Link to={`/admin${segment}`}>
            <img src={Logo} className="m-w-[224px] h-[86px]" />
        </Link>
    );
}

export default AppLogo;