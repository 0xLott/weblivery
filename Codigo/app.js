require('dotenv').config()

const express = require("express") 
const session = require('express-session')

const mongoose = require('mongoose').set('strictQuery', true)
const bodyParser = require("body-parser") 
const ejs = require('ejs') 

const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const app = express()

app.set('view engine', 'ejs') 
app.use(express.static(__dirname + '/public')) 
app.use(bodyParser.urlencoded({ extended: true })) 
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: true })) 
app.use(passport.initialize()) 
app.use(passport.session()) 

// Conexão MongoDB
mongoose.connect('mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@db-cluster.cjjdosp.mongodb.net/weblivery')


/*

Schemas - São os "moldes" que nós vamos utilizar para salvar objetos
no banco de dados. Cada objeto tem o seu molde especifico e eles podem interagir entre si
para criar relações. Um exemplo é o todolist: [projectSchema] em userSchema, onde nós
estamos dizendo que todo user tem um vetor do tipo "projetos" e cada objeto desse vetor
respeita suas regras correspondentes. (Igual ao java ao criar uma List<Objeto> )

*/

const serviceRequestSchema = new mongoose.Schema({
    requesterFullname: String,
    requestTitle: String,
    requestDescription: String,
    email: String,
    phone: Number,
    whatsapp: String
})

const todoItemSchema = new mongoose.Schema({
    title: String,
    content: String
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    nickname: String,
    name: String,
    role: String
})

const projectSchema = new mongoose.Schema({
    clientName: String,
    clientEmail: String,
    clientPhone: Number,
    projectName: String,
    projectDescription: String,
    projectOwner: String,
    projectStatus: String,
    projectDeadline: String,
    todolist: [todoItemSchema],
    developers: [userSchema]
})



// Seta o "userSchema" para ser o objeto usuário
userSchema.plugin(passportLocalMongoose, {usernameField: 'email'})

/* 

Models - Transformação dos "moldes"/"schemas" em objetos usaveis ao longo do codigo. 
 
*/

const User = new mongoose.model("User", userSchema)

const Project = new mongoose.model("Project", projectSchema)

const ToDoItem = new mongoose.model("ToDoItem", todoItemSchema)

const ServiceRequest = new mongoose.model("ServiceRequest", serviceRequestSchema)

// Inicialização do passport, aqui não precisa mexer nunca
passport.use(User.createStrategy()) 
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

/*

Admin Persistente - As linhas de codigo abaixo tentam criar um "usuario master" caso ele não exista
toda vez que o servidor inicia. Sendo assim, o administrador nunca ficará sem um login/os privilegios
dele.

User.register(<Obj User>, <Password>, <CallBack Fn>)

*/


User.register({email: 'admin', name: 'Guilherme Gentili', nickname: 'Ademiro', role: 'Administrador'}, 'admin', (err, newUser) => {
    if (err) {
        console.log('Admin ja criado');
        return
    }
       
    console.log('Admin gerado');
})

/* 

Routers - Rotas do Express
Todas as rotas seguem a ordem GET e POST respectivamente
Não vou comentar o que cada codigo de cada rota faz o que pois é um pouco autoexplicativo.

Se quiserem saber mais de como funcionam as rotas e as funções que eu usei, recomendo dar uma olhada em:

https://expressjs.com/en/guide/routing.html
https://mongoosejs.com/
https://www.npmjs.com/package/passport-local-mongoose
https://www.passportjs.org/
https://www.npmjs.com/package/body-parser
https://ejs.co/

São documentações bem resumidas e so lendo o "starting guide" de cada da pra ter uma noção do que eu fiz.
Recomendo muito dar uma lida rapida em cada uma pelo menos.

*/

/* Login Page */

app.get('/login', (req, res) => {

    res.render('login')
})

app.post('/login', (req, res) => {
    let user = new User({email: req.body.email, password: req.body.password })

    passport.authenticate('local')(req, res, () => {
        req.login(user, (err) => {})
        res.redirect('/dashboard')
    })
})

/* Formulario de Serviço */

app.get('/', (req, res) => {
    res.render('form')
})

app.post('/', (req, res) => {
    const serviceRequest = new ServiceRequest({
        requesterFullname: req.body.fullname,
        requestTitle: req.body.title,
        requestDescription: req.body.description,
        email: req.body.email,
        phone: req.body.phone,
        whatsapp: req.body.whatsapp
    })

    serviceRequest.save()

    // TODO: Renderizar uma tela de sucesso
})

/* Dashboard */

app.get('/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return
    }

    const allProjects = await Project.find()

    res.render('dashboard', {user: req.user, projects: allProjects})
})

app.get('/dashboard/:projectId', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return
    }

    let project = await Project.findById(req.params.projectId)

    res.render('project', {project: project})
})

/* Pagina do Admin - Solicitação de Serviços */

app.get('/admin/requests', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return
    }

    if (req.user.email === 'admin') {
    
        // Não sei por que do async e await, mas funciona. Depois eu procuro saber o porquê de funcionar

        // Resposta: Após a versão 7.0.0 do Mongoose lançada em Fevereiro de 2023, callbacks em funções "Find" não
        // são mais aceitos. Ao invés disso, usar async/await e try catch se quiser pegar a exception

        const allRequests = await ServiceRequest.find()

        const allDevelopers = await User.find()

        res.render('requests', {requests: allRequests, developers: allDevelopers})
    }
})

/* Pagina do Admin - Cadastro de Funcionario */

app.get('/admin/register', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return
    }

    if (req.user.email === 'admin') {
        res.render('register')
    }
})

app.post('/admin/register', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return
    }

    if (req.user.email === 'admin') {
        User.register({
            email: req.body.email,
            name: req.body.fullname,
            role: req.body.role,
            nickname: req.body.nickname

        }, req.body.password, (err, newUser) => { if (err) { console.log(err) }})
        res.redirect('/dashboard')
    }
})

app.post('/admin/requests/accept', async (req, res) => {
    const requestId = req.body.id

    await ServiceRequest.findByIdAndRemove(requestId)

    const newProject = new Project({
        clientName: req.body.clientName,
        clientEmail: req.body.clientEmail,
        clientPhone: req.body.clientPhone,
        projectName: req.body.projectName,
        projectDescription: req.body.projectDescription,
        projectOwner: req.user.name,
        projectDeadline: req.body.projectDeadline,
        projectStatus: 'Em Planejamento'
    })

    newProject.save()

    res.redirect('/dashboard')
})

app.post('/admin/requests/decline', async (req, res) => {
    const requestId = req.body.decline

    await ServiceRequest.findByIdAndRemove(requestId)
    res.redirect('/admin/requests')
})

/* Rota para Logout */

app.get('/logout', (req, res) => {
    if (req.isAuthenticated()) {
        req.logout((err) => {})
        res.redirect('/login')
    }
})

/* Server Start */

app.listen(3000, () => {
    console.log("Server running");
})