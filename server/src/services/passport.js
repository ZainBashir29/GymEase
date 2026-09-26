import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Member from "../models/memberModel.js";
import User from "../models/userModel.js";

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let member = await Member.findOne({ googleId: profile.id });

          if (!member) {
            let user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });

            if (user) {
              if (user.role !== "Member" && user.originalRole !== "Member") {
                return done(null, false, { message: "Admins and Trainers must use email and password to log in." });
              }
              
              user.googleId = profile.id;
              await user.save({ validateBeforeSave: false });
              
              return done(null, user);
            } else {
              member = await Member.create({
                fullName: profile.displayName,
                email: profile.emails[0].value.toLowerCase(),
                googleId: profile.id,
                profilePicture: profile.photos[0].value,
                isProfileCompleted: false,
                authMethod: "google",
                password: Math.random().toString(36).slice(-8) + "Aa1!",
                username: `google_${profile.id}`,
                age: 18,
              });
              return done(null, member);
            }
          }

          return done(null, member);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn("GOOGLE_CLIENT_ID is not set. Google OAuth strategy is disabled.");
}

export default passport;
