const prisma = require("../prisma/prismaClient");

exports.findAll = () => prisma.User.findMany();

exports.findById = (id) => prisma.User.findUnique({
    where: {
        user_id: Number(id)
    }
});

exports.create = ({
    nama,
    username,
    email,
    password,
    photo_url,
    NIK,
    agama,
    alamat,
    jenis_kel,
    no_hp,
    role,
}) => prisma.User.create({
    data: {
        nama,
        username,
        email,
        password,
        photo_url,
        NIK,
        agama,
        alamat,
        jenis_kel,
        no_hp,
        role,
    },
});

exports.update = async (id, data) => {
    try {
        const updatedUser = await prisma.User.update({
            where: {
                user_id: Number(id)
            },
            data
        });
        return updatedUser;
    } catch (error) {
        // If the user_id does not exist, Prisma will throw a P2025 error.
        // We can check for this specific error to return a more meaningful result.
        if (error.code === 'P2025') {
            return null; // Return null if the user was not found.
        }
        throw error; // Re-throw other errors.
    }
};

exports.remove = async (id) => {
    try {
        const deletedUser = await prisma.User.delete({
            where: {
                user_id: Number(id)
            }
        });
        return deletedUser;
    } catch (error) {
        if (error.code === 'P2025') {
            return null; // Return null if the user was not found.
        }
        throw error;
    }
};

exports.findUsername = (username) => {
    return prisma.User.findFirst({
        where: {
            username: username,
        },
    });
};

exports.findUserByUsernameOrEmailAndRole = async (identifier, role) => {
    return prisma.User.findFirst({
        where: {
            role,
            OR: [{
                username: identifier
            }, {
                email: identifier
            }, ],
        },
    });
};

exports.findByEmail = (email) => {
    return prisma.User.findUnique({
        where: {
            email
        }
    });
};

exports.findByUsernameOrEmail = (identifier) => {
    return prisma.User.findFirst({
        where: {
            OR: [{
                username: identifier
            }, {
                email: identifier
            }, ],
        },
    });
};

exports.findByNIK = (NIK) => {
    return prisma.User.findUnique({
        where: {
            NIK
        },
    });
};