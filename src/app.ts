import express from "express";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.post('/validate-csv', (req, res) => {

})






app.listen(5000, () => {
  console.log("> started on port 5000");
});
