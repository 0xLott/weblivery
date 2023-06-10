const mongoose = require("mongoose");
const passport = require("passport");
const { notificationSchema } = require("./Notification");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
	{
		email        : String,
		password     : String,
		name         : String,
		role         : String,
		notifications:  [notificationSchema],
	},
	{ strict: false }
);

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

User.register({ email: "admin", name: "Guilherme Gentili", role: "Administrador", declined: 0, accepted: 0 }, "admin", (err, newUser) => {
	if (err) {
		console.log("Admin user already exists");
		return;
	}

	console.log("Admin user created");
});

module.exports = {
	User,
	userSchema,
};
