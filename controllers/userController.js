
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    });
    return newObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async(req, res, next) => {
    // 1)  Tạo lỗi nếu user POSTs dữ liệu mật khẩu
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'Routes này không cho cập nhật mật khẩu. Làm ơn hãy sử dụng /updateMyPassword.',
                400
            )
        );
    }

    // 2) Lọc ra các tên trường không mong muốn cái mà không được phép cập nhật
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Cập nhật user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, 
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) =>
{
    await User.findByIdAndUpdate(req.user.id, {active: false})

    res.status(204).json({
        status: 'success',
        data: null
    });
});



 exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'Route này không xác định! Làm ơn hãy sử dụng /signup thay cho nó'
    });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Không được cập nhật mật khẩu với cái này!
 exports.updateUser = factory.updateOne(User)
 exports.deleteUser = factory.deleteOne(User);
