// const Config = require("config");
// const Routes = require("./routes");
// const Server = require("./server");

// const dbUrl = `mongodb://${Config.get("databaseHost")}:${Config.get("databasePort")}/${Config.get("databaseName")}`;
// const dbUrl = 'mongodb://0.0.0.0:27017/testDb';
// const server = new Server()
//   .router(Routes)
//   .configureDb(dbUrl)
//   .then((_server) => _server.listen(Config.get("port")));

// module.exports = server;

const Config = require("config");

const Routes = require("./routes");
const ExpressServer = require("./server");

// const dbUrl = "mongodb://0.0.0.0:27017/testDb";
const dbUrl = "mongodb+srv://mas_backend:12345678mas@cluster0.dtefgg0.mongodb.net/?retryWrites=true&w=majority";


(async () => {
  try {
    const port = Config.get("port") || 3000;

    // Initialize the server
    const server = new ExpressServer();

    // Configure routes
    server.router(Routes);

    // Configure database connection
    await server.configureDb(dbUrl);

    // Start cron jobs
    server.startCronJobs();

    // Start listening on the specified port
    server.listen(port);

    console.log(`Server started successfully on port ${port}`);
  } catch (error) {
    console.error("Error initializing server:", error.message);
    process.exit(1);
  }
})();
