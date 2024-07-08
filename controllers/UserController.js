import { Router } from 'express';
import UserService from '../services/UserService.js';
import NumberMiddleware from '../middlewares/number.middleware.js';
import UserMiddleware from '../middlewares/user.middleware.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', async (req, res) => {
    const response = await UserService.createUser(req.body);
    res.status(response.code).json(response.message);
});

router.get('/getAllUsers', async (req, res) => {
    const response = await UserService.getAllUsers();
    res.status(response.code).json(response.message);
});

router.get('/findUsers', async (req, res) => {
    const { eliminados, nombre, fechaInicioAntes, fechaInicioDespues,status } = req.query;
    const response = await UserService.findUsers(eliminados, nombre, fechaInicioAntes, fechaInicioDespues,status);
    res.status(response.code).json(response.message);
});

router.post('/bulkCreate', async (req, res) => {
    const { users } = req.body;
    const response = await UserService.bulkCreateUsers(users);
    res.status(response.code).json(response.message);
});

router.get(
    '/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        const response = await UserService.getUserById(req.params.id);
        res.status(response.code).json(response.message);
    });

router.put('/:id', [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async(req, res) => {
        const response = await UserService.updateUser(req);
        res.status(response.code).json(response.message);
    });

router.delete('/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async (req, res) => {
       const response = await UserService.deleteUser(req.params.id);
       res.status(response.code).json(response.message);
    });

export default router;
