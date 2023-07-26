// authController.js

import jwt from 'jsonwebtoken';
import ErrorResponse from '../../utils/errorResponse';
import User from '../../db/models/user';
import Collection from '../../db/models/collection';
import env from '../../config/env';
import sendEmail from '../../utils/emailSender';
import crypto from 'crypto';
import { recoverPasswordTemplate } from '../../utils/emailTemplates';

const getToken = (user) => {
  console.log({ id: user._id });
  const userToken = jwt.sign({ id: user._id }, env.API_SECRET);
  return userToken;
};


export const signUp = async (req, res, next) => {
  const { name, email, dateOfBirth, password } = req.body;

  try {
    // Create the user first
    const user = await User.create({
      name,
      email,
      dateOfBirth,
      password,
    });

    // Create the collection for the user
    await Collection.create({
      userId: user._id,
      events: [],
    });

    // Now that both operations are successful, get the token and send the response
    const token = getToken(user);
    res.status(200).json({ userToken: token });
  } catch (error) {
    console.error(error); // Log the error message for debugging purposes
    next(new ErrorResponse('Error while signing up new user.', 400));
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Wrong credentials', 400));
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid user account.', 401));
    }

    // Check if user exists and then proceed to validate the password
    const isValid = await user.isValidPassword(password);

    if (!isValid) {
      return next(new ErrorResponse('Invalid user account.', 401));
    }

    // User authentication successful, generate token
    const token = getToken(user);

    // Respond with token
    res.status(200).json({ userToken: token });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ data: {} });
};

export const getAccountUser = (req, res, next) => {
  User.findById(req.user.id)
    .select('-password')
    .then(
      (user) => {
        res.status(200).json({ data: user });
      },
      (error) => {
        return next(new ErrorResponse('User not authorized.', 401));
      }
    );
};

export const recoverPassword = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return next(new ErrorResponse('User not found.', 404));
      }

      return user.save({ validateBeforesave: false });
    })
    .then((user) => {
      let newToken = user.getNewToken();
      const url = `${req.protocol}://${req.get('host')}/api/v1/account/password/reset/${newToken}`;

      try {
        const emailTemplate = recoverPasswordTemplate({
          email: user.email,
          url: url,
        });
        sendEmail({
          email: user.email,
          subject: 'Reset your password.',
          emailTemplate,
        }).then((result) => {
          res.status(200).json({ data: 'Email sent' });
        });
      } catch (err) {
        user.passwordExpireTime = undefined;
        user.passwordNewToken = undefined;

        user.save({ validateBeforesave: false }).then((user) => console.log(user));
      }
    }, (error) => next(error));
};

export const resetPassword = (req, res, next) => {
  const newToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  User.findOne({
    passwordNewToken: newToken,
    passwordExpireTime: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return next(new ErrorResponse('Invalid user token', 401));
      }

      user.password = req.body.password;
      user.passwordNewToken = undefined;
      user.passwordExpireTime = undefined;
      return user.save();
    })
    .then((updatedUser) => {
      const token = getToken(updatedUser);
      res.status(200).json({ userToken: token });
    })
    .catch((error) => next(error));
};

export const patchPassword = (req, res, next) => {
  const { password } = req.body;

  User.findById(req.user.id)
    .select('+password')
    .then((user) => {
      if (!user.isValidPassword(password)) {
        return next(new ErrorResponse('Invalid user account.', 401));
      }

      user.password = req.body.password;
      return user.save();
    })
    .then((updatedUser) => {
      const token = getToken(updatedUser);
      res.status(200).json({ userToken: token });
    })
    .catch((error) => next(error));
};
