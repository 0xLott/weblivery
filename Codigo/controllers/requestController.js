const ServiceRequest   = require("../models/ServiceRequest");
const { User }         = require("../models/User");
const Project          = require("../models/Project");
const { Notification } = require("../models/Notification");

module.exports = {
	async renderForm(req, res) {
		res.render("service-form", { sent: false });
	},

	async sendForm(req, res) {
		const { requester, title, description, email, phone, whatsapp } = req.body;

		const newServiceRequest = new ServiceRequest({
			requester,
			title,
			description,
			email,
			whatsapp,
			phone,
		});

		newServiceRequest.save();

		res.render("service-form", { sent: true });
	},

	async acceptRequest(req, res) {
		if (!req.isAuthenticated()) {
			res.redirect("/user/login");
			return;
		}

		const { id, clientName, clientEmail, clientPhone, projectName, description, deadline, assignedDevelopers } = req.body;
		const { name } = req.user;

		await ServiceRequest.findByIdAndRemove(id);

		const newProject = new Project({
			clientName,
			clientEmail,
			clientPhone,
			projectName,
			description,
			deadline,
			owner: name,
			status: 0,
		});

		Promise.all(
			assignedDevelopers.map(async (developerId) => {
				let foundDeveloper = await User.findById(developerId);

				newProject.developers.push(foundDeveloper);

				const newNotification = new Notification({
					title: `Novo Projeto`,
					message: `Você foi adicionado à um novo projeto: ${projectName}`,
				});

				foundDeveloper.notifications.push(newNotification);

				foundDeveloper.save();
			})
		).then(() => {
			newProject.save();
		});

		await User.findOneAndUpdate({ _id: req.user.id }, { $inc: { accepted: 1 } });

		res.redirect("/user/dashboard");
	},

	async declineRequest(req, res) {
		const { id } = req.body;

		await ServiceRequest.findByIdAndRemove(id);

		await User.findOneAndUpdate({ _id: req.user.id }, { $inc: { declined: 1 } });

		res.redirect("/request/view");
	},

	async viewForms(req, res) {
		if (!req.isAuthenticated()) {
			res.redirect("/user/login");
			return;
		}

		if (req.user.email === "admin") {
			const requests = await ServiceRequest.find();

			const developers = await User.find();

			res.render("service-viewer", { requests, developers, user: req.user, requestAlert: requests.length == 0 ? false : true });
		}
	},
};
