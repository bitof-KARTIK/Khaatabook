const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    fs.readdir("./hisaab", (err, files) => {
        if (err) return res.status(500).send(err);
        res.render("index", { files: files });
    });
});

app.get("/create", (req, res) => {
    res.render("create");
});

app.post("/createhisaab", (req, res) => {
    let count = 1;
    const currDate = new Date();
    const date = `${currDate.getDate()}-${currDate.getMonth() + 1}-${currDate.getFullYear()}.txt`;
    const filePath = `./hisaab/${date}`;

    const writeFile = (path) => {
        fs.writeFile(path, req.body.content, (err) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect("/");
        });
    };
    const checkAndWriteFile = (path, callback) => {
        fs.stat(path, (err, stats) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    callback(path);
                } else {
                    console.error(err);
                    return res.status(500).send(err);
                }
            } else if (stats.isFile()) {
                count++;
                checkAndWriteFile(`./hisaab/${date.replace('.txt', '')} (${count}).txt`, callback);
            }
        });
    };
    checkAndWriteFile(filePath, writeFile);
});

app.get("/edit/:filename", (req, res) => {
    const filePath = path.join(__dirname, "hisaab", req.params.filename);

    fs.readFile(filePath, "utf-8", (err, filedata) => {
        if (err) return res.status(500).send(err);
        res.render("edit", { filedata, filename: req.params.filename });
    });
});


app.post("/edit/:filename", (req, res) => {
    const filePath = path.join(__dirname, "hisaab", req.params.filename);

    fs.writeFile(filePath, req.body.content, (err) => {
        if (err) return res.status(500).send(err);
        res.redirect("/");
    });
});

app.post("/update/:filename", (req, res) => {
    fs.writeFile(`./hisaab/${req.params.filename}`, req.body.content,(err)=>{
        if (err) return res.status(500).send(err);
        res.redirect("/");
    })
}); 

app.get("/hisaab/:filename", (req, res) => {
    const filePath = path.join(__dirname, 'hisaab', req.params.filename);
    fs.readFile(filePath, "utf-8", (err, filedata) => {
        if (err) return res.status(500).send(err);
        res.render("hisaab", { filedata, filename: req.params.filename });
    });
});

app.get("/delete/:filename", (req, res) => {
    fs.unlink(`./hisaab/${req.params.filename}`,(err)=>{
        if (err) return res.status(500).send(err);
        res.redirect("/");
    })
});
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
