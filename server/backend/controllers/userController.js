import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import * as employeeStmt from '../mysql/employee.js';
import { requestHandler } from '../utils/requestHandler.js';

/*
   desc     Auth user/set token
   route    POST /api/users/auth
   access   public
*/
const authUser = requestHandler(async (req, res, database) => {
    const username = String(req.body?.username).trim();
    const password = String(req.body?.password).trim();

    if(!username || !password) {
        throw {status: 400, message: 'All fields are required.'};
    }

    const [user] = await database.execute(employeeStmt.employeeWithPassword, [username]);

    if(user.length > 0) {
        const {employeeId, firstname, lastname, username, password: hashedPassword} = user[0];
        if(user && (await bcrypt.compare(password, hashedPassword))) {
            const value = `${employeeId}-${username}`;
            generateToken(res, value);
            
            res.status(200).json({id: employeeId, firstname, lastname, username});
            return;
        }
    }

    throw {status: 401, message: 'Wrong username or password'};
}, 'User: authUser');

/*
   desc     Register user/set token
   route    POST /api/users/
   access   public
*/
const registerUser = requestHandler(async (req, res, database) => {
    const firstname = String(req.body?.firstname).trim();
    const lastname = String(req.body?.lastname).trim();
    const username = String(req.body?.username).trim();
    const password = String(req.body?.password).trim();
    
    if(!firstname || !lastname || !username || !password) {
        throw {status: 400, message: 'All fields are required.'};
    }

    const [userExists] = await database.execute(employeeStmt.username, [username]);

    if(userExists.length > 0) {
        throw {status: 400, message: 'Username unavailable. Please try a different one'};
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [newEmployeeResult] = await database.execute(
        employeeStmt.newEmployee, 
        [firstname, lastname, username, hashedPassword]
    );
    
    const employeeId = newEmployeeResult?.insertId;
    if(employeeId) {
        const id = employeeId;
        const value = `${employeeId}-${username}`;
        generateToken(res, value);

        res.status(201).json({
            id: employeeId,
            firstname: firstname,
            lastname: lastname,
            username: username,
        });

        return;
    }

    throw {status: 400, message: 'Invalid user data'};
}, 'User: registerUser');

/*
   desc     Just to get user details
   route    GET /api/users/user
   access   private
*/
const getUser = requestHandler(async (req, res) => {
    if(Object.values(req.user).length > 0) {
        const {employeeId, firstname, lastname, username, image, createdAt} = req.user;
        res.status(200).json({firstname, lastname, username, image});
    } else {
        throw {status: 404, message: 'User not found'}
    }
}, 'User: getUser');

export { 
    authUser, 
    registerUser,
    getUser,
};
