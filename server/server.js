const app = require("./app");
const {dbConnect} = require("./config/db");
const PORT = process.env.PORT || 5000;



(async () => {
    try {
        await dbConnect();
        app.listen(PORT, () => {
            console.log("Server is running on port 5000");
        });

    } catch (err) {
        console.log(err);
    }
})()




