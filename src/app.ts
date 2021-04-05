import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.post('/validate-csv', (req, res) => {
  //replace null rows at the beginning of the file and null values on the "left" of the data
  const lineHeight = (req.body.csvData.match(/(,+\r\n|,+\n)/g) || []).length
  const csvList = req.body.csvData
    .replace(/^(,+\r\n|,+\n)+/g, '')
    .replace(/\r\n$/g, '')
    .split(/\r\n|\n/)
    .map((row: string) => row.replace(/(^,+| )/g, ''))
  const errorList = validateCsv(csvList, lineHeight)

  if (errorList.length) {
    return res.status(400).send(errorList)
  } else {
    return res.status(200).send(['Validation successful!'])
  }

})

app.listen(5000, () => {
  console.log('The application is listening on port 5000!');
})


function validateCsv(data:Array<string>, n: number) {
  const firstColumnNames = new Set()
  const errors = []
  if (data[0].split(',').length !== 2 && data[0] !== 'AccountName,AccountValue') {
    return ['The header must made of 2 columns: AccountName, AccountValue']
  }

  data.forEach((row, i) => {
    if (row && row.split(',').length !== 2) {
      errors.push(`Wrong number of items on row ${i + n + 1}; File must contain exactly 2 columns and no commas are allowed`)
    }

    if (row === '') {
      errors.push(`Empty lines are present in the middle of the file, on line ${i + n + 1}`)
    }

    if (row && i > 0 && !/^[A-Z\/ ]+$/.test(row.split(',')[0])) {
      errors.push(`First column must be a non empty string on line ${i + n + 1}`)
    }

    if (row && i > 0 && !/^-?\d+\.\d+$/.test(row.split(',')[1])) {
      errors.push(`Second column must be a number on line ${i + n + 1}`)
    }

    if (firstColumnNames.has(row.split(',')[0])) {
      errors.push(`Account ${row.split(',')[0]} is duplicated on line ${i + n + 1}`)
    }
    firstColumnNames.add(row.split(',')[0])
  })
  return errors
}