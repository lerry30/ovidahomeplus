import jwt from 'jsonwebtoken';

const generateToken = (res, value) => {
    const token = jwt.sign({ value }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    const isInProduction = String(process.env.NODE_ENV).toLocaleLowerCase().trim()==='production'

    res.cookie('jwt', token, {
        httpOnly: isInProduction,
        secure: isInProduction,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    });
}

export default generateToken;
