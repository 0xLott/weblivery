const { User }       = require("../models/User");
const ServiceRequest = require("../models/ServiceRequest");
const Project        = require("../models/Project");
const passport       = require("passport");

module.exports = {
	// OK
	async renderLoginForm(req, res) {
		if (req.isAuthenticated()) {
			res.redirect("/user/dashboard");
			return;
		}

		res.render("login", { fail: false });
	},

	async renderLoginFormError(req, res) {
		if (req.isAuthenticated()) {
			res.redirect("/user/dashboard");
			return;
		}

		res.render("login", { fail: true });
	},

	// OK
	async renderDashboard(req, res) {
		if (!req.isAuthenticated()) {
			res.redirect("/user/login");
			return;
		}

		const projects = await Project.find();
		const serviceRequests = await ServiceRequest.find();
		const admin = await User.findOne({ email: "admin" });

		var projectsData = [];
		var tasksData = [];
		var requestsData = [admin.declined, admin.accepted];
		var devsObjs = await User.find();
		var devsData = [];
		var devsNames = devsObjs.map((dev) => {
			return dev.name;
		});

		for (let i = 0; i < devsObjs.length; i++) {
			devsData[i] = projects.reduce((acc, project) => {
				return project.todolist.length != []
					? acc +
							project.todolist.filter((item) => {
								return item.status === 3 && item.developer.email === devsObjs[i].email;
							}).length
					: acc;
			}, 0);
		}

		for (let i = 0; i < 3; i++) {
			projectsData[i] = projects.filter((project) => project.status === i).length;
		}

		for (let i = 0; i < 4; i++) {
			tasksData[i] = projects.reduce((acc, project) => {
				return project.todolist.length != []
					? acc +
							project.todolist.filter((item) => {
								return item.status == i;
							}).length
					: acc;
			}, 0);
		}

		const restrictProjects = projects.filter((project) => {
			return project.developers.some((dev) => {
				return dev.email === req.user.email;
			});
		});

		if (req.user.email === "admin") {
			res.render("dashboard", {
				user: req.user,
				projectsData: JSON.stringify(projectsData),
				tasksData: JSON.stringify(tasksData),
				requestsData: JSON.stringify(requestsData),
				devsNames: JSON.stringify(devsNames),
				devsData: JSON.stringify(devsData),
				projects,
				serviceRequests: serviceRequests.length,
			});
		} else {
			res.render("dashboard", {
				user: req.user,
				projectsData: JSON.stringify(projectsData),
				tasksData: JSON.stringify(tasksData),
				requestsData: JSON.stringify(requestsData),
				devsNames: JSON.stringify(devsNames),
				devsData: JSON.stringify(devsData),
				projects: restrictProjects,
			});
		}
	},

	// OK
	async renderRegisterViewer(req, res) {
		if (!req.isAuthenticated()) {
			res.redirect("/user/login");
			return;
		}

		if (req.user.email === "admin") {
			const serviceRequests = await ServiceRequest.find();

			const users = await User.find();

			res.render("user-viewer", { user: req.user, users, serviceRequests: serviceRequests.length});
		}
	},

	// OK
	async renderNotifications(req, res) {
		if (!req.isAuthenticated()) {
			res.redirect("/user/login");
			return;
		}

		const serviceRequests = await ServiceRequest.find();

		res.render("notification-viewer", { notifications: req.user.notifications, user: req.user, serviceRequests: serviceRequests.length});
	},

	async sendRegisterUpdateForm(req, res) {
		if (!req.isAuthenticated()) {
			res.redirect("/user/login")
			return
		}

		const { button, name, role, email, password, checkbox, id } = req.body

		if (req.user.email === 'admin') {

			if (button === 'update') {

				var updatedUser = await User.findByIdAndUpdate({_id: id}, {
					name: name,
					role: role,
					email: email
				}, {new: true})

				// Atualiza em todos os projetos os dados do dev
				await Project.updateMany({developers: {$elemMatch: {_id: id}}}, {
					$set: {
						'developers.$.name': updatedUser.name,
						'developers.$.role': updatedUser.role,
						'developers.$.email': updatedUser.email
					}
				})

				// Atualiza todos os objetos das todolists de todos os projetos
				await Project.updateMany({'todolist.developer._id': id}, {
					$set: {
						'todolist.$.developer.name': updatedUser.name,
						'todolist.$.developer.role': updatedUser.role,
						'todolist.$.developer.email': updatedUser.email
					}
				})

				if (checkbox === 'on') {

					updatedUser.setPassword(password, () => { updatedUser.save() })

				}

			} else {

				if (req.user.id != id) {

					// Remova de cada projeto o dev "tal"
					await Project.updateMany({developers: {$elemMatch: {_id: id}}},
						{$pull: {developers: {_id: id}}}
					)

					// Remova de cada projeto a task da todolist que tenha o dev "tal"
					await Project.updateMany({'todolist.developer._id': id}, {
						$pull: {
							todolist: { 'developer._id': id }
						}
					})

					await User.findByIdAndRemove({_id: id})

				}
			}

			res.redirect('/user/register')
		}
	},

	// WARNING! (OK)
	async sendRegisterForm(req, res) {
		if (!req.isAuthenticated()) {
			res.redirect("/user/login");
			return;
		}

		if (req.user.email === "admin") {
			const { email, name, role, password } = req.body;

			// Aqui tem uma exceção que não foi tratada! Toda vez que der um erro precisa ser exibido que não foi criado o usuario
			User.register({ email, name, role }, password, (err, newUser) => {
				if (err) {
					console.log(err);
				}
			});

			res.redirect("/user/register");
		}
	},

	// OK
	async dismissNotification(req, res) {
		if (!req.isAuthenticated()) {
			res.redirect("/user/login");
			return;
		}

		const { notificationId } = req.body;

		await User.updateOne(
			{ _id: req.user.id },
			{
				$pull: {
					notifications: { _id: notificationId },
				},
			}
		);

		res.redirect("/user/notification");
	},

	// OK
	async auth(req, res) {
		const { email, password } = req.body;

		const user = new User({ email, password });

		passport.authenticate("local", { failureRedirect: "/user/login/error" })(req, res, () => {
			req.login(user, (err) => {});
			res.redirect("/user/dashboard");
		});
	},

	// OK
	async logout(req, res) {
		if (req.isAuthenticated()) {
			req.logout((err) => {});
		}

		res.redirect("/user/login");
	},
};
