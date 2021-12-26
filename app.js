const express = require("express");
const bodyParser = require("body-parser");

//intialisation of app
const app = express();
const portNumber = 3000;

//middlewares used
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

// functions
function getstatus(value) {
    let response = "None";
    if (value <= 33) response = "At risk";
    else if (value <= 67) response = "Off-track";
    else response = "On-track";
    return response;
}

function getPercentage(currSales, tarSales) {
    let result = (currSales * 100) / tarSales;
    return result;
}

function House(catId, level, parent, currSales, tarSales, isActive = true) {
    let currPercentage = getPercentage(currSales, tarSales);
    let response = {
        catId: catId,
        level: level,
        parent: parent, // this will store the category id of parent
        currSales: currSales,
        tarSales: tarSales,
        isActive: isActive,
        percentage: currPercentage,
        status: getstatus(currPercentage),
    };
    return response;
}

/*
Sorry, for doing this way. I know mysql but implemented that with the help of sequelize technology. So, face some difficulties while doing intial setup
 */
let houses = new Array();

// pushing some values to the houseArr
function insertHouse(level, parent, currSales, tarSales) {
    houses.push(House(houses.length, level, parent, currSales, tarSales));
    return;
}

houses.push(insertHouse(0, -1, 200, 400));
houses.push(insertHouse(1, 0, 20, 100));
houses.push(insertHouse(1, 0, 150, 200));
houses.push(insertHouse(1, 0, 30, 100));
houses.push(insertHouse(2, 1, 10, 50));
houses.push(insertHouse(2, 1, 10, 50));

// console.log("houses=", houses);

app.post("/updateDetails", (req, res) => {
    const catObj = req.body.catId;
    houses[catObj.catId].currSales = catObj.currSales;
    houses[catObj.catId].tarSales = catObj.tarSales;
    houses[catObj.catId].percentage = getPercentage(
        catObj.currSales,
        catObj.tarSales
    );
    houses[catObj.catId].status = getstatus(houses[catObj.catId].percentage);
    res.json({
        status: "Ok",
        message: "Successfully updated the details",
    });
    return;
});

app.get("/getCatDetails", (req, res) => {
    const catId = req.body.catId;
    let response = new Array();
    if (houses[catId].isActive == false) {
        res.json({
            status: "Ok",
            message: "This category don't exist.",
        });
        return;
    }
    response.push(houses[catId]);
    let currParent = [catId];

    // collecting all children for a category id
    for (let i = 0; i < currParent.length; i++) {
        let children = houses.filter(
            (house) => (house.parent = currParent[i] && house.isActive)
        );
        response.concat(children);
        let catIds = children.filter((house) => {
            return house.catId;
        });
        currParent.concat(catIds);
    }
    res.json({
        status: "Ok",
        data: response,
    });
    return;
});

app.get("/getParents", (req, res) => {
    let catId = req.body.catId;
    let response = new Array();
    while (houses[catId].parent != -1) {
        catId = houses[catId].catId;
        response.push(houses[catId]);
    }
    res.json({
        status: "Ok",
        data: response,
    });
    return;
});

app.delete("/deleteCategory", (req, res) => {
    const catId = req.body.catId;
    houses[catId].isActive = false;
    res.json({
        status: "Ok",
        message: "Successfully deleted the category!",
    });
    return;
});

// listening to port
app.listen(portNumber, () => {
    console.log(`I am listening to the  port ${portNumber}`);
});
