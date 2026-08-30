import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Member from "../models/memberModel.js";

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
          member = await Member.findOne({ email: profile.emails[0].value });

          if (member) {
            member.googleId = profile.id;
            await member.save({ validateBeforeSave: false });
          } else {
            member = await Member.create({
              fullName: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              profilePicture: profile.photos[0].value,
              isProfileCompleted: false,
              authMethod: "google",
              password: Math.random().toString(36).slice(-8) + "Aa1!",
              username: `google_${profile.id}`,
              age: 18,
            });
          }
        }

        return done(null, member);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

export default passport;
