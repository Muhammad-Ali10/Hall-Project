import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { FiSave, FiMail } from 'react-icons/fi';

const ChangePassword = () => {
  const [step, setStep] = useState('request'); // 'request', 'verify', 'reset'
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const requestOTP = async (values) => {
    try {
      setSending(true);
      await api.post('/auth/password/reset/request', { email: values.email });
      setEmail(values.email);
      setStep('verify');
      toast.success('OTP sent to your email');
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setSending(false);
    }
  };

  const verifyAndReset = async (values) => {
    try {
      setSending(true);
      await api.post('/auth/password/reset/verify', {
        email,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      toast.success('Password reset successfully');
      setStep('request');
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setSending(false);
    }
  };

  if (step === 'request') {
    const formik = useFormik({
      initialValues: { email: '' },
      validationSchema: Yup.object({
        email: Yup.string().email('Invalid email').required('Email is required'),
      }),
      onSubmit: requestOTP,
    });

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
        <form onSubmit={formik.handleSubmit} className="bg-white rounded-xl shadow-md p-6 max-w-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-600 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold disabled:opacity-50"
            >
              <FiMail size={20} />
              <span>{sending ? 'Sending...' : 'Send OTP'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 'verify') {
    const formik = useFormik({
      initialValues: { otp: '', newPassword: '', confirmPassword: '' },
      validationSchema: Yup.object({
        otp: Yup.string().required('OTP is required'),
        newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('newPassword')], 'Passwords must match')
          .required('Please confirm password'),
      }),
      onSubmit: verifyAndReset,
    });

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
        <form onSubmit={formik.handleSubmit} className="bg-white rounded-xl shadow-md p-6 max-w-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
              <input
                type="text"
                name="otp"
                value={formik.values.otp}
                onChange={formik.handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold disabled:opacity-50"
            >
              <FiSave size={20} />
              <span>{sending ? 'Resetting...' : 'Reset Password'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return null;
};

export default ChangePassword;

