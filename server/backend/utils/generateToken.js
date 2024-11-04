import jwt from 'jsonwebtoken';

const generateToken = (res, value) => {
    const token = jwt.sign({ value }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    });
}

export default generateToken;
