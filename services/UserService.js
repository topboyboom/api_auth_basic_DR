import { Op } from 'sequelize';
import db from '../dist/db/models/index.js';
import bcrypt from 'bcrypt';

const createUser = async (userData) => {
    const { name, email, password, cellphone } = userData;

    // Validar que el nombre solo contenga letras
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(name)) {
        return {
            code: 400,
            message: 'Name must contain only letters'
        };
    }

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
        return {
            code: 400,
            message: 'Email already exists'
        };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: encryptedPassword,
        cellphone,
        status: true
    });

    return {
        code: 200,
        message: 'User created successfully with ID: ' + newUser.id,
    };
};


const getAllUsers = async () => {
    const users = await db.User.findAll({
        where: {
            status: true  // Usuarios activos
        }
    });
    return {
        code: 200,
        message: users
    };
};

const findUsers = async (eliminados, nombre, fechaInicioAntes, fechaInicioDespues, status) => {
    try {
        // Construir objeto de filtros dinámicamente
        const filters = {};
        if (eliminados !== undefined) {
            filters.status = eliminados === 'true' ? false : true;
        }
        if (nombre) {
            filters.name = { [Op.like]: `%${nombre}%` };
        }
        if (fechaInicioAntes && fechaInicioDespues) {
            filters.createdAt = {
                [Op.between]: [new Date(fechaInicioAntes), new Date(fechaInicioDespues)],
            };
        } else if (fechaInicioAntes) {
            filters.createdAt = { [Op.lt]: new Date(fechaInicioAntes) };
        } else if (fechaInicioDespues) {
            filters.createdAt = { [Op.gt]: new Date(fechaInicioDespues) };
        }
        if (status !== undefined) {
            filters.status = status === 'true' ? true : false;
        }

        const users = await db.User.findAll({
            where: filters,
        });

        return {
            code: 200,
            message: users,
        };
    } catch (error) {
        console.error('Error en findUsers:', error);
        return {
            code: 500,
            message: 'Internal Server Error',
        };
    }
};
const bulkCreateUsers = async (users) => {
    let successfulCount = 0;
    let failedCount = 0;

    for (const user of users) {
        const result = await createUser(user);
        if (result.code === 200) {
            successfulCount++;
        } else {
            failedCount++;
        }
    }

    return {
        code: 200,
        message: {
            successfulCount,
            failedCount
        }
    };
};

const getUserById = async (id) => {
    return {
        code: 200,
        message: await db.User.findOne({
            where: {
                id: id,
                status: true,
            }
        })
    };
}

const updateUser = async (req) => {
    const user = await db.User.findOne({
        where: {
            id: req.params.id,
            status: true,
        }
    });
    if (!user) {
        return {
            code: 404,
            message: 'User not found'
        };
    }
    const payload = {};
    payload.name = req.body.name ?? user.name;
    payload.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;
    payload.cellphone = req.body.cellphone ?? user.cellphone;
    await db.User.update(payload, {
        where: {
            id: req.params.id
        }

    });
    return {
        code: 200,
        message: 'User updated successfully'
    };
}

const deleteUser = async (id) => {
    const user = await db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });
    if (!user) {
        return {
            code: 404,
            message: 'User not found'
        };
    }
    await db.User.update({
        status: false
    }, {
        where: {
            id: id
        }
    });
    return {
        code: 200,
        message: 'User deleted successfully'
    };
}


export default {
    createUser,
    getAllUsers,
    findUsers,
    bulkCreateUsers,
    getUserById,
    updateUser,
    deleteUser,
};
