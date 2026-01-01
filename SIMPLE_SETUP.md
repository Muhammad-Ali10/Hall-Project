# 🚀 Simple OTP & Email Setup Guide

## ✅ Super Simple Solution

This guide shows you the **easiest way** to set up OTP (SMS) and Email.

---

## 📱 Part 1: SMS OTP (Twilio)

### Step 1: Get Twilio Account (Free Trial)
1. Go to [twilio.com](https://www.twilio.com/try-twilio)
2. Sign up (free $15.50 credit)
3. Get your credentials from dashboard

### Step 2: Add to `.env` file
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+919945118010
```

### Step 3: Done! ✅
- OTP will be sent via SMS
- If not configured, OTP shows in console (for testing)

---

## 📧 Part 2: Email (SendGrid)

### Step 1: Get SendGrid Account (Free Forever)
1. Go to [sendgrid.com](https://signup.sendgrid.com)
2. Sign up (100 emails/day free forever)
3. Go to Settings → API Keys
4. Create API Key → Copy it
5. Go to Settings → Sender Authentication
6. Verify Single Sender → Add your email

### Step 2: Add to `.env` file
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=your-verified-email@example.com
```

### Step 3: Done! ✅
- Emails will be sent via SendGrid
- If not configured, OTP shows in console (for testing)

---

## 📝 Complete `.env` Example

Create a file named `.env` in the `backend` folder:

```env
# Server
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/convention-hall-booking

# JWT
JWT_SECRET=your-secret-key-here

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Twilio (SMS OTP) - OPTIONAL
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+919945118010

# SendGrid (Email) - OPTIONAL
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## 🎯 How It Works

### Without Configuration (Development):
- **SMS OTP:** Shows in console (backend terminal)
- **Email OTP:** Shows in console (backend terminal)
- **Perfect for testing!** ✅

### With Configuration (Production):
- **SMS OTP:** Sent via Twilio SMS
- **Email OTP:** Sent via SendGrid Email
- **Real delivery!** ✅

---

## 🧪 Testing

### Test SMS OTP:
1. Start backend: `npm run dev`
2. Send OTP from frontend
3. **If Twilio configured:** Check your phone SMS
4. **If not configured:** Check backend console for OTP

### Test Email OTP:
1. Start backend: `npm run dev`
2. Send OTP from frontend
3. **If SendGrid configured:** Check your email inbox
4. **If not configured:** Check backend console for OTP

---

## 💡 Quick Tips

### For Development (No Setup Needed):
- Just run the app
- OTPs show in console
- Perfect for testing!

### For Production:
- Add Twilio credentials → SMS works
- Add SendGrid credentials → Email works
- Both work independently!

---

## ❓ Troubleshooting

### SMS Not Working?
- ✅ Check `.env` file has correct Twilio credentials
- ✅ Check Twilio phone number format: `+919945118010`
- ✅ Check backend console for errors
- ✅ In development, OTP shows in console (this is normal!)

### Email Not Working?
- ✅ Check `.env` file has `SENDGRID_API_KEY`
- ✅ Check sender email is verified in SendGrid
- ✅ Check backend console for errors
- ✅ In development, OTP shows in console (this is normal!)

---

## 🎉 That's It!

**Super simple:**
1. Add credentials to `.env` → Works automatically
2. Don't add credentials → Works in console (for testing)

**No complex setup needed!** 🚀

