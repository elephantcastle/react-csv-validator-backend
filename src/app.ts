import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.post('/validate-csv', (req, res) => {
  console.log(req.body.csvData.replace(/^(,+\r\n)+/g, '').replace(/^(,+\n)+/g, ''))
  const csvList = req.body.csvData
    .replace(/^(,+\r\n|,+\n)+/g, '')
    .replace(/\r\n$/g, '')
    .split(/\r\n|\n/)
    .map((row: string) => row.replace(/(^,+| )/g, ''))
  const errorList = validateCsv(csvList)

  if (errorList.length) {
    return res.status(403).send(errorList)
  } else {
    return res.status(200).send(['Validation successful!'])
  }

})

app.listen(5000, () => {
  console.log('The application is listening on port 5000!');
})


function validateCsv(data:Array<string>) {
  const firstColumnNames = new Set()
  const errors = []
  if (data[0].split(',').length !== 2 && data[0] !== 'AccountName,AccountValue') {
    return ['The header must made of 2 columns: AccountName, AccountValue']
  }

  data.forEach((row, i) => {
    if (row && row.split(',').length !== 2) {
      errors.push(`Wrong number of items per row; File must contain exactly 2 columns and no commas are allowed`)
    }

    if (row === '') {
      errors.push(`Empty lines are present in the middle of the file, on line ${i + 1}`)
    }

    if (row && i > 0 && !/^[A-Z\/ ]+$/.test(row.split(',')[0])) {
      errors.push(`First column must be a non empty string on line ${i + 1}`)
    }

    if (row && i > 0 && !/^-?\d+\.\d+$/.test(row.split(',')[1])) {
      errors.push(`Second column must be a number on line ${i + 1}`)
    }

    if (firstColumnNames.has(row.split(',')[0])) {
      errors.push(`Account ${row.split(',')[0]} is duplicated on line ${i + 1}`)
    }
    firstColumnNames.add(row.split(',')[0])
  })
  return errors
}